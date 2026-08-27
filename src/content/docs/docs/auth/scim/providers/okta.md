---
sidebar_position: 3
title: "Okta"
description: "Configuring Okta to provision users and groups into Stalwart over SCIM, from the application integration through group push and deprovisioning."
---

Okta provisions into a custom SCIM endpoint through an application integration created with the App Integration Wizard. The provisioning service calls the endpoint from Okta's infrastructure, so the Stalwart HTTP service must be reachable from the public internet over TLS.

## Password on user creation

Okta documents that its SCIM client includes a `password` attribute in every user creation request, whether or not password synchronisation is enabled on the integration, and the attribute cannot always be removed from the application profile.

Stalwart does not publish `password` in its User schema, because in this deployment model the identity provider holds the credential and Stalwart validates against it. The attribute is accepted and discarded: the account is created, and nothing is written to its credential store. Leave **Sync Password** disabled, since the value would be thrown away in any case, and expect the account to have no password of its own. Users authenticate through Okta over OIDC, as the deployment model intends.

## Creating the integration

SCIM provisioning attaches to a SAML 2.0 or SWA application. Okta does not support adding SCIM provisioning to an OpenID Connect integration, so where Stalwart authenticates users through Okta over OIDC, the provisioning integration is a separate application object from the one used for sign-in.

In the Okta Admin Console, create the application through the App Integration Wizard, then open its **General** tab, edit **App Settings**, and set **Provisioning** to **SCIM**.

A **Provisioning** tab appears. Under **Settings**, choose **Integration** and edit it:

- **SCIM connector base URL**: `https://mail.example.org/scim/v2`.
- **Unique identifier field for users**: `userName`.
- **Supported provisioning actions**: enable **Push New Users**, **Push Profile Updates**, and, if groups are to be provisioned, **Push Groups**. Leave the import actions disabled; see [Imports](#imports).
- **Authentication Mode**: **HTTP Header**, with the API key secret in the **Authorization** field. Okta supplies the `Bearer` prefix itself. Do not choose **Basic Auth**, which Stalwart refuses.

Select **Test Connector Configuration**, then save. Okta does not publish exactly which requests this test issues; it validates the base URL and the credentials, and a failure here indicates an unreachable host, a rejected token, or a service principal lacking `scimAccess` or `sysAccountGet`.

Finally, under **Settings** choose **To App**, edit, and enable **Create Users**, **Update User Attributes**, and **Deactivate Users**. Leave **Sync Password** disabled; see [Password on user creation](#password-on-user-creation). Omitting these switches produces the misleading "Matching user not found" error.

## Attribute mappings

Okta's default SCIM profile includes attributes Stalwart does not publish. They do not have to be removed: `name.givenName`, `name.familyName`, `title`, `phoneNumbers`, `addresses`, `userType`, `roles` and the rest of the core RFC 7643 User schema are accepted and discarded, as described under [schema handling](/docs/auth/scim/endpoints#schema-handling). The default profile provisions successfully as it stands.

The attributes that are actually stored are `userName`, `displayName`, `emails`, `externalId`, `active`, `locale` and `timezone`. Map those deliberately; everything else is inert.

Two mappings need attention. `userName` must carry a full email address in a domain that has [`allowScimProvisioning`](/docs/ref/object/domain#allowscimprovisioning) enabled, so where Okta usernames are not mail addresses, map `email` to `userName` in the Profile Editor. And `displayName` should be mapped: Okta populates `name.givenName` and `name.familyName` from its own profile, and while Stalwart will join them into a display name when no `displayName` arrives, that gives "given family"; an explicit mapping gives control over the form the name takes.

A custom attribute that Okta invents, or a mapping to a misspelled target, is a different matter and is refused with `invalidSyntax`. Keep the **To App** mappings confined to the standard SCIM profile.

## How Okta matches users

Okta looks up an existing user with `GET /Users?filter=userName eq "<value>"`. The filter key is always `userName`, even when **Unique identifier field for users** has been set to something else, so `userName` must be the attribute that holds the value Okta considers unique. Stalwart resolves this filter from an index, so the lookup is efficient regardless of directory size.

Only the `eq` operator is used, which is well within what Stalwart supports.

## Updates and deprovisioning

Integrations created with the App Integration Wizard send updates as `PUT` with the complete resource, and cannot be reconfigured to send `PATCH`. This matters because of how Stalwart interprets a replace: attributes absent from the body revert to their defaults, so aliases not present in the request are cleared, the locale returns to `en-US`, and the time zone is cleared. A `PUT` carrying only structured name parts and no `displayName` sets the display name from them, on every update. Since Okta sends the full profile each time, the result is consistent, but it also means any alias added directly in Stalwart is removed on the next update. Aliases for SCIM-provisioned accounts must be managed in Okta, not locally.

Okta never deletes users. Unassigning a user from the application, deactivating them, suspending them, or deleting them in Okta all result in `active` being set to `false`, which suspends the Stalwart account and retains the mailbox. Reactivation sets it back to `true`.

The practical consequence is that suspended accounts accumulate. Okta has no equivalent of a retention window after which a deletion is issued, so removing the mailboxes of departed staff is an administrative task in Stalwart. Where mailboxes must be removed on termination, plan a periodic review; querying for accounts with `filter=active eq false` lists the candidates.

Group deletion is the exception: removing or unlinking a pushed group does issue `DELETE /Groups/{id}`.

## Group push

Group provisioning is configured on the **Push Groups** tab, which appears once **Push Groups** has been enabled among the supported provisioning actions. Groups can be selected individually by name or matched by a rule against the group name.

Two of Okta's constraints affect planning. A group used for application assignment cannot also be used for group push, so two groups are needed: one that grants access and one that is provisioned. And Okta reconciles membership only when group push is configured, removing members in Stalwart that are not in the linked Okta group at that point; afterwards it applies changes as they happen and does not reconcile again.

Okta expects `GET /Groups/{id}` to return the membership when called without query parameters, which Stalwart does. Groups with more than 200 members are the exception: reading one is refused with `tooMany`, and the membership must be read from the user resources instead. Where groups are that large, provision them with the group excluded from push and manage membership through the user objects.

Okta pushes flat membership, so its handling of nested Okta groups agrees with Stalwart's lack of nested group support.

## Imports

The import direction, which reads accounts from Stalwart into Okta, is best left disabled. Okta's incremental import relies on filtering by `meta.lastModified` with the `gt` operator; Stalwart emits neither the attribute nor supports the operator, since it records no modification timestamp on accounts. Full imports, which enumerate `/Users` page by page, do work, but an import is rarely wanted when the identity provider is the system of record.

## Monitoring

Failed provisioning operations appear under **Dashboard**, then **Tasks**, where they can be retried individually. The full record of each request is in the system log under **Reports**. A creation refused for an attribute Stalwart does not recognise at all appears there with the `invalidSyntax` detail naming it, which is the fastest way to find a mistyped custom mapping.

Okta pauses provisioning when the endpoint returns `429 Too Many Requests` and reschedules the operation, so Stalwart's rate limiting degrades throughput without losing changes.

## Unused capabilities

Okta does not use `/Bulk`, the `/.search` endpoints, cursor pagination, conditional requests, or `/ServiceProviderConfig` for anything beyond validation. Stalwart supports all of them; they simply go unexercised.
