---
sidebar_position: 2
title: "Microsoft Entra ID"
description: "Configuring Microsoft Entra ID to provision users and groups into Stalwart over SCIM."
---

Microsoft Entra ID provisions into any SCIM 2.0 endpoint through a custom enterprise application. No gallery entry is required, and no software is installed: the provisioning service calls the endpoint directly from Microsoft's infrastructure, which means the Stalwart HTTP service must be reachable from the public internet over TLS.

Complete the [Stalwart-side configuration](/docs/auth/scim/configuration) first, and have the base URL and the API key secret to hand.

## Creating the application

In the [Microsoft Entra admin center](https://entra.microsoft.com), signed in with at least the Application Administrator role, open **Entra ID**, then **Enterprise apps**, and select **New application** followed by **Create your own application**. Name the application, choose the option to integrate an application that is not in the gallery, and add it.

Open **Provisioning** in the application's left-hand menu and start a new configuration. Two fields carry the connection details:

- **Tenant URL**: the SCIM base URL, `https://mail.example.org/scim/v2`.
- **Secret Token**: the API key secret issued to the Stalwart service principal.

Leaving the token empty causes Entra ID to present a token of its own, which Stalwart will reject; Microsoft describes that mode as being for testing only.

Select **Test Connection** before saving. Older tenants present this same configuration as a **Provisioning Mode** menu set to **Automatic** with an **Admin Credentials** section holding the same two fields; the values are identical either way.

### Test Connection failures

Entra ID probes the endpoint by querying for a user that cannot exist, using a randomly generated identifier as the matching value, and expects `200 OK` with an empty `ListResponse`. Stalwart answers exactly that shape, so a failure at this step points at the connection, not the protocol: an unreachable host, a TLS configuration Entra ID will not accept, a rejected token, or a missing `scimAccess` or `sysAccountGet` permission on the service principal. The probe also fetches a group, so a service principal that can read users but not groups fails here too.

Microsoft requires the path `/scim` to appear at the root of the endpoint URL, which Stalwart's `/scim/v2` satisfies.

## Attribute mappings

Open **Attribute Mapping** under **Manage**. The default mapping set for a SCIM application targets the full RFC 7643 schema and includes several attributes Stalwart does not publish. They do not have to be deleted: `name.givenName`, `name.familyName`, `title`, every `phoneNumbers[...]` and `addresses[...]` variant, and everything under `urn:ietf:params:scim:schemas:extension:enterprise:2.0:User` are accepted and discarded, as described under [schema handling](/docs/auth/scim/endpoints#schema-handling). Delete them anyway, because a mapping that does nothing is a mapping someone will later assume works, and because Entra ID sends `PATCH` operations for each mapped attribute on every change, which is traffic and log volume for no effect.

The mappings that matter are:

| Source attribute | Target attribute | Notes |
|---|---|---|
| `userPrincipalName` | `userName` | Must resolve to a mail address in a SCIM-enabled domain |
| `displayName` | `displayName` | Becomes the account description |
| `mail` | `emails[type eq "work"].value` | The primary address is derived from `userName`; further addresses become aliases |
| `mailNickname` | `externalId` | Any stable identifier is acceptable |
| `IsSoftDeleted` | `active` | Drives suspension; removing it disables deprovisioning entirely |

For groups, keep `displayName`, `members`, and `externalId`, all of which Stalwart implements.

The mapping for `userName` deserves a second look. Stalwart requires a full email address in a domain that has been opened to SCIM, and in many tenants the user principal name is not the mail address. Where the two differ, map `mail` to `userName` instead, or use an expression mapping to construct the address. A `userName` that is not an address fails with `invalidValue`, naming the domain it could not resolve.

Entra ID does not send a `password` attribute to a custom SCIM application, so nothing needs to be removed on that account.

## Assignment and scope

Provisioning is limited to assigned users by default, and an application with no assignments provisions nothing at all. Assign the users and groups to be provisioned on the **Users and groups** tab. This is the most common reason for a correctly configured integration that appears to do nothing.

Group objects can be excluded by disabling the groups mapping, leaving user provisioning in place. Users cannot be excluded.

Entra ID reads only direct members of an assigned group; it does not flatten nested groups. Stalwart does not support nested groups either, so the two agree.

## Synchronisation behaviour

The initial cycle enumerates every in-scope user and group, queries Stalwart for a match, and creates or updates accordingly. Later cycles run roughly every 40 minutes and carry only what has changed. **Provision on demand** applies a single user immediately, which is the quickest way to validate the mappings before starting the full job.

Updates are sent as `PATCH`. Entra ID sends the operation name capitalised, as `Replace`, and by default sends the value of `active` as the string `"False"` and not a boolean. Stalwart accepts both forms, so neither requires action. Microsoft also offers a compliance flag appended to the tenant URL that switches to the lowercase and boolean forms; it is not needed for Stalwart, and it is documented as not working with provision-on-demand.

Deprovisioning happens in two stages. Unassigning a user, removing them from scope, blocking their sign-in, or deleting them in Entra ID all result in `active` being set to `false`, which suspends the Stalwart account while retaining the mailbox. Once the user is permanently deleted in Entra ID, either manually or after Microsoft's retention window elapses, a `DELETE` is issued and the account is removed. Whether Stalwart honours the deletion depends on the `sysAccountDestroy` permission; without it the request is refused and the account remains suspended.

One limitation affects planning: once a user has been unassigned from the application, Entra ID stops managing them, so a later permanent deletion produces no `DELETE`. Accounts that are unassigned and never deleted therefore remain suspended in Stalwart indefinitely.

## Monitoring

**Provisioning logs**, under the application or under **Entra ID** then **Enterprise apps**, records every operation with its request, response, and outcome. A creation refused for an attribute Stalwart does not recognise at all appears here with the `invalidSyntax` detail naming it, which is the fastest route to a custom mapping that was mistyped.

Repeated failures move the job into quarantine: the cycle frequency drops to once a day, and after several weeks the job is disabled. Quarantine is visible on the provisioning page and in the audit logs, and a notification is sent if a notification address has been configured under **Properties**. After correcting the cause, use **Restart provisioning**, which clears the failure state and forces a fresh initial cycle.

Enable **accidental deletions prevention** under **Properties** before the first full cycle. It halts the job when an unexpected number of users leave scope, which converts a mistaken scoping change from a mass mailbox deletion into a stalled job.

## Unused capabilities

Entra ID does not use `/Bulk`, the `/.search` endpoints, cursor pagination, or conditional requests, and schema discovery has no effect for applications created outside the gallery. Stalwart supports all of these; they simply go unexercised.
