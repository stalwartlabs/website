---
sidebar_position: 2
title: "Microsoft Entra ID"
description: "Configuring Microsoft Entra ID to provision users and groups into Stalwart over SCIM."
---

:::tip[Enterprise feature]
This feature is available in the [Enterprise edition](/docs/server/enterprise) of Stalwart.
:::

Microsoft Entra ID can create, update, suspend and delete Stalwart accounts as users join, change and leave the organisation. It provisions accounts into any SCIM 2.0 endpoint through a custom enterprise application, without a gallery entry or additional software. The provisioning service calls the endpoint from Microsoft's infrastructure, so the Stalwart HTTP service must be reachable from the public internet over TLS.

Complete the [Stalwart configuration](/docs/auth/scim/configuration) first, and have the base URL and the API key secret ready. The labels on this page are those of the Entra admin center at the time of writing, and they may change.

## Creating the application

Provisioning is configured on an enterprise application that represents Stalwart in the tenant. Sign in to the [Microsoft Entra admin center](https://entra.microsoft.com) with at least the Application Administrator role. Open **Entra ID**, then **Enterprise apps**, select **New application**, and choose to create a custom application. In the panel that opens, name the application, choose the option to integrate an application that is not in the gallery, and add it.

Open **Provisioning** in the application's left-hand menu and start a new configuration. Two fields carry the connection details:

- **Tenant URL**: the SCIM base URL, `https://mail.example.org/scim/v2`.
- **Secret Token**: the secret of the API key issued to the Stalwart provisioning account.

Do not leave the token empty. With an empty token, Entra ID presents a token of its own, which Stalwart rejects.

Select **Test Connection** before saving. Older tenants present this configuration differently: a **Provisioning Mode** menu set to **Automatic**, with an **Admin Credentials** section that holds the same two fields. The fields take the same values.

### Test Connection failures

Entra ID tests the endpoint by querying for a user with a randomly generated identifier. It expects `200 OK` with an empty `ListResponse`, which Stalwart returns. The test also reads a group. A failure at this step therefore indicates a connection problem: an unreachable host, a TLS configuration that Entra ID does not accept, a rejected token, or a provisioning account without `scimAccess` or `sysAccountGet`.

Entra ID requires the endpoint path to start with `/scim`, which `/scim/v2` does.

## Attribute mappings

Attribute mappings decide which Entra ID attributes are sent, and to which SCIM attributes. They are found under **Manage**, in **Attribute Mapping**.

The default mappings of a SCIM application target the full RFC 7643 schema, and they include attributes Stalwart does not store: `name.givenName`, `name.familyName`, `title`, the `phoneNumbers[...]` and `addresses[...]` variants, and everything under `urn:ietf:params:scim:schemas:extension:enterprise:2.0:User`. These attributes are accepted and discarded ([Schema handling](/docs/auth/scim/endpoints#schema-handling)), so they cause no errors. Deleting them is recommended nevertheless. Entra ID sends a `PATCH` operation for each mapped attribute on every change, and a mapping that has no effect can be mistaken for one that works.

One default mapping must be deleted: the mapping of `mail` to `emails[type eq "work"].value`. Stalwart reports every address with the type `work`, so Entra ID's updates of that path go wrong in two ways. For an account with aliases, they fail with `400` and `The value filter matched more than one 'emails' element.` For an account without aliases, they rename the account to the `mail` value. Where `mail` must provide the address, map it to `userName` instead.

The mappings that matter are these:

| Source attribute | Target attribute | Notes |
|---|---|---|
| `userPrincipalName` | `userName` | Must resolve to a mail address in a SCIM-enabled domain |
| `displayName` | `displayName` | Becomes the account description |
| `mailNickname` | `externalId` | Any stable identifier is acceptable |
| `IsSoftDeleted` | `active` | Drives suspension; removing it disables deprovisioning entirely |

For groups, keep `displayName`, `members` and `externalId`, all of which Stalwart implements.

The `userName` mapping needs a check in most tenants. Stalwart requires `userName` to be a full email address in a domain open to SCIM, and in many tenants the user principal name is not the mail address. Where the two differ, map `mail` to `userName`, or construct the address with an expression mapping. A `userName` that is not an address fails with `invalidValue`, and the error names the domain that could not be resolved.

Entra ID does not send a `password` attribute to a custom SCIM application.

## Assignment and scope

Entra ID provisions only the users and groups that are in scope. By default, the scope is limited to assigned users, so an application without assignments provisions nothing. Assign the users and groups to provision on the **Users and groups** tab. A missing assignment is the most common reason for a correctly configured integration that does nothing.

Group objects can be excluded by disabling the groups mapping, which leaves user provisioning in place. Users cannot be excluded.

Entra ID reads only the direct members of an assigned group, and it does not expand nested groups. Stalwart does not support nested groups either.

## Synchronisation behaviour

Entra ID works in cycles. The initial cycle enumerates every in-scope user and group, queries Stalwart for a match, and creates or updates each resource accordingly. Later cycles run roughly every 40 minutes and carry only what has changed. **Provision on demand** applies a single user immediately, which is the quickest way to validate the mappings before starting the full job.

Updates are sent as `PATCH`. Entra ID capitalises the operation name, as `Replace`, and by default it sends `active` as the string `"False"` rather than as a boolean. Stalwart accepts both forms. Microsoft offers a compliance flag for the tenant URL that switches to the lowercase and boolean forms, but it is not needed.

Deprovisioning happens in two stages:

1. Suspension. Unassigning a user, removing them from scope, blocking their sign-in, or deleting them in Entra ID all result in `active` being set to `false`. This suspends the Stalwart account and retains the mailbox.
2. Deletion. Once the user is permanently deleted in Entra ID, either manually or after Microsoft's retention window elapses, Entra ID issues a `DELETE`, and the account is removed. Whether Stalwart honours the deletion depends on the `sysAccountDestroy` permission. Without it, the request is refused and the account remains suspended.

Unassignment interrupts this sequence. Once a user has been unassigned from the application, Entra ID stops managing the user, so a later permanent deletion sends no `DELETE`. The account then remains suspended in Stalwart until an administrator deletes it.

## Monitoring

**Provisioning logs** record every operation with its request, response and outcome. They are found under the application, or under **Entra ID** then **Enterprise apps**. A creation refused for an unknown attribute appears there with the `invalidSyntax` detail that names the attribute, which identifies a mistyped custom mapping. On the Stalwart side, the same operations appear as `scim.*` events ([Diagnosing failures](/docs/auth/scim/#diagnosing-failures)).

Repeated failures move the job into quarantine. The cycle frequency then drops to once a day, and after several weeks the job is disabled. Quarantine is visible on the provisioning page and in the audit logs. A notification is also sent if a notification address has been configured under **Properties**. After correcting the cause, use **Restart provisioning**, which clears the failure state and forces a fresh initial cycle.

Enable **accidental deletions prevention** under **Properties** before the first full cycle. It stops the job when an unexpected number of users leave the scope, so that a mistaken scoping change stops the job instead of deleting mailboxes.

## Unused capabilities

Entra ID does not use `/Bulk`, the `/.search` endpoints, cursor pagination or conditional requests. Schema discovery has no effect for applications created outside the gallery.
