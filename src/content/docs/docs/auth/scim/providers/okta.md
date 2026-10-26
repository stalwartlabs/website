---
sidebar_position: 3
title: "Okta"
description: "Configuring Okta to provision users and groups into Stalwart over SCIM, from the application integration through group push and deprovisioning."
---

:::tip[Enterprise feature]
This feature is available in the [Enterprise edition](/docs/server/enterprise) of Stalwart.
:::

Okta can create, update and suspend Stalwart accounts as users join, change and leave the organisation. It provisions accounts into a custom SCIM endpoint through an application integration, which is created with Okta's App Integration Wizard. The provisioning service calls the endpoint from Okta's infrastructure, so the Stalwart HTTP service must be reachable from the public internet over TLS.

Complete the [Stalwart configuration](/docs/auth/scim/configuration) first. The labels on this page are those of the Okta Admin Console at the time of writing, and they may change.

## Password on user creation

Okta documents that its SCIM client includes a `password` attribute in every user creation request. It does so whether or not password synchronisation is enabled on the integration, and the attribute cannot always be removed from the application profile.

Stalwart does not publish `password` in its User schema, because the identity provider holds the credentials. The attribute is accepted and discarded, so the account is created and no password is stored for it. Leave **Sync Password** disabled. Users sign in through Okta with OpenID Connect.

## Creating the integration

Okta supports SCIM provisioning only on a SAML 2.0 or SWA application, not on an OpenID Connect integration. Where users sign in to Stalwart through Okta with OpenID Connect, provisioning therefore uses a separate application from the one used for sign-in.

In the Okta Admin Console, create the application through the App Integration Wizard. Then open its **General** tab, edit **App Settings**, and set **Provisioning** to **SCIM**.

A **Provisioning** tab appears. Under **Settings**, choose **Integration** and edit it with these values:

- **SCIM connector base URL**: `https://mail.example.org/scim/v2`.
- **Unique identifier field for users**: `userName`.
- **Supported provisioning actions**: enable **Push New Users** and **Push Profile Updates**. If groups are to be provisioned, enable **Push Groups** as well. Leave the import actions disabled ([Imports](#imports)).
- **Authentication Mode**: **HTTP Header**, with the API key secret in the **Authorization** field. Okta supplies the `Bearer` prefix itself. Do not choose **Basic Auth**, which Stalwart refuses.

Select **Test Connector Configuration**, then save. The test validates the base URL and the credentials. A failure therefore indicates an unreachable host, a rejected token, or a provisioning account without `scimAccess` or `sysAccountGet`.

Finally, under **Settings**, choose **To App**, edit it, and enable **Create Users**, **Update User Attributes** and **Deactivate Users**. These switches decide which changes Okta actually sends. Without them, Okta reports the misleading error "Matching user not found". Leave **Sync Password** disabled ([Password on user creation](#password-on-user-creation)).

## Attribute mappings

Okta's default SCIM profile includes attributes that Stalwart does not store, such as `name.givenName`, `name.familyName`, `title`, `phoneNumbers`, `addresses`, `userType` and `roles`. They are accepted and discarded ([Schema handling](/docs/auth/scim/endpoints#schema-handling)), so the default profile provisions without changes.

Stalwart stores `userName`, `displayName`, `emails`, `externalId`, `active`, `locale` and `timezone`. Mappings for any other attribute have no effect.

Two mappings need attention:

- `userName` must carry a full email address in a domain with [`allowScimProvisioning`](/docs/ref/object/domain#allowscimprovisioning) enabled. Where Okta user names are not mail addresses, map `email` to `userName` in the Profile Editor.
- `displayName` should be mapped as well. Without it, Stalwart joins `name.givenName` and `name.familyName`, in that order, to form the display name. An explicit mapping determines the form of the name instead.

Keep the **To App** mappings within the standard SCIM profile. A custom attribute, or a mapping to a misspelled target, is refused with `invalidSyntax`.

## User matching

Before creating a user, Okta checks whether the user already exists. It looks the user up with `GET /Users?filter=userName eq "<value>"`. The filter attribute is always `userName`, even when **Unique identifier field for users** is set to another attribute, so `userName` must hold the value that Okta treats as unique. The server answers the filter from an index, whatever the number of accounts.

## Updates and deprovisioning

Integrations created with the App Integration Wizard send updates as `PUT` with the complete resource, and they cannot be configured to send `PATCH`. A `PUT` replaces the whole resource, so attributes absent from the body revert to their defaults ([Replace compared with patch](/docs/auth/scim/mapping#replace-compared-with-patch)). Aliases missing from the request are removed, the locale returns to <!-- default:Account.locale -->`en-US`<!-- /default -->, and the time zone is cleared.

Okta sends the full profile each time, so the result is consistent. An alias added on the Stalwart side, however, is removed at the next update. Manage the aliases of provisioned accounts in Okta for this reason.

Okta never deletes users. Every way of removing a user in Okta results in `active` being set to `false`: unassigning the user from the application, deactivating them, suspending them, or deleting them. This suspends the Stalwart account and retains the mailbox. Reactivation sets `active` back to `true`.

Suspended accounts therefore accumulate, and deleting the mailboxes of departed staff is an administrative task in Stalwart. Where mailboxes must be removed after termination, review them periodically, for example in the WebUI. A SCIM query with `filter=active eq false` is not a substitute. Because `active` is not indexed, the query is refused with `tooMany` when more than 200 accounts match.

Groups are the exception: removing or unlinking a pushed group does issue `DELETE /Groups/{id}`.

## Group push

Okta provisions groups through group push, which is configured on the **Push Groups** tab. The tab appears once **Push Groups** has been enabled among the supported provisioning actions. Groups can be selected individually by name, or matched by a rule against the group name.

Two of Okta's constraints affect the setup:

- A group used for application assignment cannot also be pushed. Two groups are therefore needed: one that grants access and one that is provisioned.
- Okta reconciles the membership only when group push is configured. At that moment, it removes Stalwart members that are not in the linked Okta group. Afterwards it applies changes as they happen and does not reconcile again.

Okta expects `GET /Groups/{id}` without query parameters to return the membership. Stalwart does so, except for groups with more than 200 members, whose reading is refused with `tooMany`. Exclude such groups from group push and manage their membership through the users.

Okta pushes flat memberships, which matches Stalwart's lack of nested groups.

## Imports

Okta can also read accounts from Stalwart into Okta, through its import actions. Leave these actions disabled. Okta's incremental import filters on `meta.lastModified` with the `gt` operator, and Stalwart supports neither, because accounts have no modification timestamp. Full imports, which list `/Users` page by page, work, but they are rarely needed when the identity provider is the system of record.

## Monitoring

Okta records provisioning in two places. Failed operations appear under **Dashboard**, then **Tasks**, where they can be retried individually. The record of each request is in the system log under **Reports**. A creation refused for an unknown attribute appears there with the `invalidSyntax` detail that names the attribute. On the Stalwart side, the same operations appear as `scim.*` events ([Diagnosing failures](/docs/auth/scim/#diagnosing-failures)).

When the endpoint returns `429 Too Many Requests`, Okta pauses provisioning and reschedules the operation. Rate limiting therefore slows provisioning without losing changes.

## Unused capabilities

Okta does not use `/Bulk`, the `/.search` endpoints, cursor pagination or conditional requests. It reads `/ServiceProviderConfig` only for validation.
