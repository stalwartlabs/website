---
sidebar_position: 4
title: "Keycloak"
description: "The state of outbound SCIM provisioning in Keycloak, what its community extensions send, and the alternatives for a Keycloak-backed deployment."
---

Keycloak is a common choice as the OpenID Connect provider in front of Stalwart, and that part of the integration is straightforward: it is covered under the [OIDC directory backend](/docs/auth/backend/oidc) and needs no SCIM at all. Provisioning is the harder half, and the answer as of Keycloak 26.7 is less convenient than for the hosted identity providers.

## Keycloak does not push SCIM

Keycloak's own SCIM support runs in the opposite direction to what a Stalwart deployment needs. The `scim-api` feature introduced in Keycloak 26.6 and promoted to preview in 26.7 makes **Keycloak** a SCIM service provider, so that an upstream system such as Entra ID can provision users into a Keycloak realm. It exposes `/realms/{realm}/scim/v2` on the Keycloak side. It does not send anything anywhere, and it plays no part in provisioning Stalwart.

An outbound SCIM client, which is what would push Keycloak's users into Stalwart, has been stated by the Keycloak project as a future direction but is not present in 26.7. Since this is an area of active development, check the [Keycloak release notes](https://www.keycloak.org/documentation) before assuming the position below still holds.

## Community extensions

Outbound provisioning from Keycloak today requires a third-party extension deployed into the Keycloak server. Two are maintained well enough to consider, and both have significant caveats.

The longest-established is `mitodl/keycloak-scim`, which installs an event listener, a user federation provider, and a database table mapping Keycloak identifiers to remote SCIM identifiers. It is the more widely deployed of the two, and it is also the more troubled: at the time of writing its issue tracker carries open reports that user deletion fails before the request is sent, that provisioning is silently skipped for users whose email address is unverified, and that group synchronisation does not work. It is built against the Keycloak 25 extension interfaces. Its licensing is stated inconsistently between its repository metadata and its README, which is worth resolving before deploying it anywhere that matters.

The more recent `Termindiego25/keycloak-scim-outbound` targets current Keycloak, sends cleaner SCIM payloads, and offers a per-group provisioning scope and a choice between deactivation and deletion on deprovisioning. It performs no initial synchronisation at all: only events occurring after it is enabled are propagated, so an existing realm has to be seeded some other way. It is a young project with little deployment behind it.

Neither is endorsed by the Keycloak project, neither supports OAuth client credentials (both take a static bearer token, which suits Stalwart's [API keys](/docs/auth/authentication/api-key)), and neither implements bulk operations.

Both projects populate `name.givenName` and `name.familyName` when creating a user, because both were written against the full RFC 7643 User schema, and neither exposes attribute mapping in its configuration. Stalwart does not store structured name parts, but it accepts them: where the payload carries no `displayName` or `name.formatted`, the given and family names are joined and stored as the account's display name. See [schema handling](/docs/auth/scim/endpoints#schema-handling). No patched build is needed, and nothing has to be trimmed.

## Alternatives to a SCIM extension

Where an extension is unsuitable for the reasons above, three options work today, and the right one depends on what the deployment actually needs from provisioning.

**Rely on just-in-time provisioning and pre-create accounts.** For an OIDC-backed domain this is the configuration described under [Provisioning models](/docs/auth/scim/provisioning). Accounts are created ahead of first login through the [WebUI](/docs/management/webui/), the JMAP API, or the [CLI](/docs/management/cli/), and removed the same way. The [bulk apply](/docs/management/cli/apply) command accepts an NDJSON plan, which makes this scriptable against whatever system owns the joiner and leaver process.

**Drive Stalwart's administrative API from Keycloak events.** Where Keycloak is already the system of record, a small service subscribed to its admin events can call Stalwart's JMAP administration API directly. This is more work than a SCIM connector but avoids the extensions entirely, and it has full access to Stalwart's account model, which is wider than the subset SCIM exposes. An [API key](/docs/auth/authentication/api-key) with the `sysAccount` permissions is the appropriate credential.

**Provision from the system upstream of Keycloak.** In deployments where Keycloak federates an upstream directory or HR system that has its own SCIM client, point that client at Stalwart directly. Keycloak continues to handle authentication, and provisioning bypasses it. This is the closest equivalent to the Entra ID and Okta configurations. Check for it before writing any code.

## If an extension is used anyway

Deploy the extension, then create one test user and read the request in Stalwart's telemetry or in the extension's own logging before enabling it for the realm. The failure modes are quiet: a rejected request typically appears in the extension's log as a warning and nowhere else, and neither extension retries after an HTTP error, so a change lost to a rejection is lost permanently.

Three of Stalwart's behaviours show up in those logs. A creation returns `201 Created` with the complete resource including its `id`, which is what both extensions store in order to address the account later; an extension that fails to record it will silently no-op on every subsequent update. Stalwart accepts the string forms `"true"` and `"false"` for `active` in a `PATCH` operation as well as JSON booleans, so an extension that sends the value as a string works without modification. And the response will not echo the structured name back: `givenName` and `familyName` are consumed on the way in and the account carries a single display name, so an extension that compares its own view against the response sees a difference there on every cycle. Neither extension reconciles on that field, so this is a reading artefact, not a loop.

Scope provisioning to a dedicated Keycloak group, not the whole realm, where the extension supports it, and schedule a periodic full synchronisation as the reconciliation mechanism, since neither extension reconciles on its own.
