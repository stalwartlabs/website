---
sidebar_position: 4
title: "Keycloak"
description: "The state of outbound SCIM provisioning in Keycloak, what its community extensions send, and the alternatives for a Keycloak-backed deployment."
---

:::tip[Enterprise feature]
This feature is available in the [Enterprise edition](/docs/server/enterprise) of Stalwart.
:::

Keycloak is often used as the OpenID Connect provider for Stalwart. In that role it is configured as an [OpenID Connect directory](/docs/auth/backend/oidc), and it needs no SCIM. Provisioning accounts from Keycloak is a separate task, and it is less direct than with the hosted identity providers. The reason is that Keycloak 26.7, the version current at the time of writing, has no outbound SCIM client: it cannot push its users to another system on its own. This page describes what Keycloak offers, the community extensions that fill the gap, and the alternatives to them.

## Inbound SCIM in Keycloak

Keycloak's own SCIM support works in the opposite direction. The `scim-api` feature was introduced in Keycloak 26.6 and is in preview in 26.7. It makes Keycloak a SCIM service provider, so that an upstream system such as Entra ID can provision users into a Keycloak realm at `/realms/{realm}/scim/v2`. The feature sends no requests, so it plays no part in provisioning Stalwart.

An outbound SCIM client would push Keycloak's users to Stalwart. The Keycloak project has named one as a future direction. Check the [Keycloak release notes](https://www.keycloak.org/documentation) for its current state.

## Community extensions

Outbound provisioning from Keycloak currently requires a third-party extension installed in the Keycloak server. Two such extensions are maintained, and both have limitations. The descriptions below reflect their state at the time of writing, so check their repositories before deploying either.

`mitodl/keycloak-scim` is the more widely deployed of the two. It installs an event listener, a user federation provider, and a database table that maps Keycloak identifiers to remote SCIM identifiers. Its issue tracker has open reports of three problems: user deletion fails before the request is sent, users with an unverified email address are skipped without notice, and group synchronisation does not work. The extension is built against the Keycloak 25 extension interfaces. Its license is stated differently in its repository metadata and in its README.

`Termindiego25/keycloak-scim-outbound` targets current Keycloak versions. It offers a provisioning scope per group, and it lets deprovisioning either deactivate or delete accounts. It performs no initial synchronisation: only events that occur after it is enabled are sent, so the accounts of an existing realm must be created another way. It is a recent project with few deployments.

The two extensions share several properties. Neither is endorsed by the Keycloak project, and neither implements bulk operations. Both authenticate with a static bearer token, which is the form of Stalwart's [API keys](/docs/auth/authentication/api-key).

Both also send `name.givenName` and `name.familyName` when creating a user, and neither offers an attribute mapping. Stalwart accepts these attributes. When the request carries no `displayName` or `name.formatted`, the server joins the given and family names and stores the result as the display name ([Schema handling](/docs/auth/scim/endpoints#schema-handling)). Neither extension therefore needs changes.

## Alternatives to a SCIM extension

Where an extension is not suitable, one of the following approaches can be used instead.

### Create accounts in advance

Accounts can be created in advance and then kept up to date by just-in-time provisioning. For a domain of an OpenID Connect directory, this is the configuration described in [Provisioning models](/docs/auth/scim/provisioning). An administrator creates the accounts before the first sign-in, in the [WebUI](/docs/management/webui/), through the management API or with the [CLI](/docs/management/cli/), and deletes them the same way. The process can be scripted from the system that manages joiners and leavers, because the [`apply`](/docs/management/cli/apply) command executes an NDJSON plan.

### Call the management API from Keycloak events

Where Keycloak is the system of record, a service can subscribe to Keycloak's admin events and call Stalwart's JMAP management API directly. This takes more work than a SCIM connector. In return, it avoids the extensions and gives access to the whole account model.

The service authenticates with an [API key](/docs/auth/authentication/api-key). The key belongs to an account that holds the `sysAccount*` permissions together with the permissions of the accounts it manages ([Granting permissions to other accounts](/docs/auth/authorization/permissions#granting-permissions-to-other-accounts)).

### Provision from the system behind Keycloak

Keycloak often federates a directory or HR system that has its own SCIM client. In that case, point that client at Stalwart. Keycloak continues to handle authentication, and provisioning does not pass through it.

## Extension deployment

An extension can lose changes silently, so test it before relying on it. Deploy the extension, create one test user, and check the request before enabling the extension for the realm. The request appears in Stalwart's `scim.*` events ([Diagnosing failures](/docs/auth/scim/#diagnosing-failures)) and in the extension's log.

The extension's log deserves particular attention. A rejected request typically appears there as a warning and nowhere else. Neither extension retries after an HTTP error, so a rejected change is lost.

Three behaviours of the server show up in those logs:

- A creation returns `201 Created` with the complete resource, including the `id`. Both extensions store this `id` to address the account later, so an extension that fails to store it changes nothing on later updates.
- `active` in a `PATCH` operation accepts the strings `"true"` and `"false"` as well as booleans.
- The response does not contain the name parts, because `givenName` and `familyName` are converted into a single display name. An extension that compares its data with the response therefore sees a difference in that field at every cycle. The difference causes no further requests.

Two further measures reduce the risk. Where the extension supports it, limit provisioning to a dedicated Keycloak group. Schedule a periodic full synchronisation as well, because neither extension reconciles accounts on its own.
