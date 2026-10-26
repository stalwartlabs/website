---
sidebar_position: 5
title: "Attribute mapping"
description: "How SCIM User and Group attributes translate onto Stalwart accounts, which attributes are not implemented, and what remains under local control."
---

:::tip[Enterprise feature]
This feature is available in the [Enterprise edition](/docs/server/enterprise) of Stalwart.
:::

A SCIM identity provider describes users and groups with the attributes of the SCIM schema, while Stalwart stores them as [accounts](/docs/auth/accounts/) with their own fields. This page describes how each attribute is translated, which attributes have no counterpart, and which account settings stay under the server's control. It is the page to consult when an attribute set at the identity provider does not appear on the account as expected.

The SCIM schema that the server publishes contains only attributes that correspond to something an account stores. The list is available at `GET /scim/v2/Schemas`. Attributes outside it are accepted and discarded, so an identity provider can send its default mappings unchanged ([Schema handling](/docs/auth/scim/endpoints#schema-handling)).

## User

Users are provisioned under the `urn:ietf:params:scim:schemas:core:2.0:User` schema and map to [user accounts](/docs/auth/accounts/user). The following table lists each attribute with the account field it maps to:

| SCIM attribute | Stalwart field | Mutability | Notes |
|---|---|---|---|
| `id` | Account identifier | Read-only | Assigned by the server |
| `externalId` | [`externalId`](/docs/ref/object/account#externalid) | Read-write | The identity provider's own identifier; indexed and filterable |
| `userName` | Account name and domain | Read-write, required | Must be a full email address |
| `displayName` | [`description`](/docs/ref/object/account#description) | Read-write | Takes precedence over `name.formatted` |
| `name.formatted` | [`description`](/docs/ref/object/account#description) | Read-write | Same field as `displayName` |
| `active` | `authenticate` permission | Read-write | See [Administrative status](#administrative-status) |
| `emails` | Primary address and aliases | Mixed | See [Addresses and aliases](#addresses-and-aliases) |
| `locale` | Account locale | Read-write | `en-US` form; shares one field with `preferredLanguage` |
| `preferredLanguage` | Account locale | Read-write | Same field as `locale` |
| `timezone` | Account time zone | Read-write | IANA identifier, for example `Europe/Lisbon` |
| `groups` | Group membership | Read-only | Managed through the Group resource |
| `meta` | Creation time and version | Read-only | `created`, `location`, `version` |

### Account name

`userName` carries the full email address of the user. The server splits it into the account's local part and its domain.

The domain must already exist on the server as a [Domain](/docs/ref/object/domain), and it must have [`allowScimProvisioning`](/docs/ref/object/domain#allowscimprovisioning) enabled. A `userName` in an unknown domain, or in a domain that is not open to SCIM, is refused with `invalidValue`. Domains are therefore always created by an administrator, never by the identity provider.

A `userName` without a domain is refused. When the identity provider's user names differ from the mail addresses, map `userName` to the mail address at the provider.

### Addresses and aliases

An account has one primary address and any number of aliases, and SCIM represents both in the `emails` collection.

The primary address is always derived from `userName`. In `emails` it appears with `primary` set to `true` and the `type` `work`. These sub-attributes are read-only, because the address belongs to `userName`. An attempt to remove the primary entry, change its type or make it non-primary through `emails` is therefore refused with a message that refers to `userName`. Replacing the `value` of the primary entry renames the account, as a change of `userName` does.

Aliases are also reported with the type `work`. As a consequence, a value filter such as `emails[type eq "work"]` matches every address of an account that has aliases. A `PATCH` through such a filter fails with `The value filter matched more than one 'emails' element.`

Every other entry in `emails` becomes an alias of the account. `PUT` replaces the aliases as a set, and `PATCH` changes them individually, so an address removed at the provider is removed from the account. Duplicate entries, and an entry that repeats the primary address, are ignored.

Each alias must be in a domain that is open to SCIM. In a multi-tenant deployment it must also be in a domain of the account's tenant, so an address in another tenant's domain is refused.

### Administrative status

The SCIM `active` attribute says whether an account may be used. Stalwart accounts have no status field, so `active` is expressed through the account's `authenticate` permission, which decides whether the account may sign in.

Reading `active` returns whether the account's effective permissions include `authenticate`. The effective permissions combine the account's own settings, its roles and its tenant.

Writing `active` changes only the account's own settings. Setting it to `false` disables the permission on the account, and this takes precedence over the roles. Setting it back to `true` removes that entry again, and leaves in place any other permission changes an administrator made. An account without other changes therefore returns exactly to its previous state.

A deactivated account keeps its mailbox and continues to receive mail, but none of its credentials is accepted. To stop mail as well, delete the account. A SCIM client cannot deactivate or delete the account it authenticates as.

Some clients send `active` as a string. In a `PATCH` operation, `active` accepts the strings `"true"` and `"false"` as well as a JSON boolean.

### Locale and time zone

SCIM and Stalwart write locales differently. SCIM uses a hyphen (`en-US`), and Stalwart stores an underscore (`en_US`). The server converts between the two forms automatically in both directions and normalises the case, so `EN-us` and `ca-ES@valencia` are accepted. A locale the server does not support is refused with `invalidValue`.

SCIM has two attributes for the user's language, `locale` and `preferredLanguage`, and both map to the same stored value. The server uses whichever one the request supplies, and `locale` when it supplies both. The resource returns the stored value under both names.

`timezone` takes an identifier from the IANA Time Zone Database, such as `Europe/Lisbon`. An unrecognised identifier is refused.

### Attributes that are not implemented

The SCIM User schema describes far more than a mail account stores. The attributes below are absent from the published schema. A request that carries them is accepted and the values are discarded, so nothing has to be removed at the identity provider.

`password` is not supported, because the identity provider holds the credentials ([Advertised capabilities](/docs/auth/scim/endpoints#advertised-capabilities)). A `password` sent with a creation or replacement is discarded and never stored. An account provisioned through SCIM therefore has no password of its own until one is set through another interface.

The following attributes are dropped in the same way: `phoneNumbers`, `addresses`, `photos`, `ims`, `title`, `userType`, `nickName`, `profileUrl`, `entitlements`, `roles`, `x509Certificates`, and the enterprise user extension. On a Group, `description` is dropped.

`name` carries only `formatted`, because an account stores a single display name. `middleName`, `honorificPrefix` and `honorificSuffix` are discarded. `givenName` and `familyName` are used in one case only. When neither `displayName` nor `name.formatted` is supplied, the server joins them with a space and stores the result as the display name. When either display attribute is supplied, the server uses it instead. In every case, the resource returns the stored display name under `displayName` and `name.formatted`, never under the name parts.

An attribute that belongs to no known schema is refused with `invalidSyntax`. A mapping to a misspelled attribute such as `dispalyName` therefore fails visibly instead of losing its value.

## Group

Groups are provisioned under the `urn:ietf:params:scim:schemas:core:2.0:Group` schema and map to [group accounts](/docs/auth/accounts/group). A group account has an address and a shared mailbox that its members can open. The following table lists each attribute with the account field it maps to:

| SCIM attribute | Stalwart field | Mutability | Notes |
|---|---|---|---|
| `id` | Account identifier | Read-only | Assigned by the server |
| `externalId` | [`externalId`](/docs/ref/object/account#externalid) | Read-write | The identity provider's own identifier |
| `displayName` | [`description`](/docs/ref/object/account#description) | Read-write, required | Must be unique among groups |
| `members` | Membership | Read-write | Users only |
| `meta` | Creation time and version | Read-only | Version covers the membership |

### Addresses derived from the display name

A SCIM group carries a display name but no address, while a group account needs one. The server therefore derives the address itself.

The local part comes from `displayName`. The server converts the name to lower case and replaces each run of characters other than letters and digits with a hyphen, so `Sales EMEA` becomes `sales-emea`. If that address is already taken, the server appends a numeric suffix until it finds a free address. The result is limited to 64 characters.

The domain is that of the provisioning account, because the request names none. A provisioning account whose domain is not open to SCIM can manage users but cannot create groups ([Provisioning account](/docs/auth/scim/configuration#provisioning-account)).

The address is fixed at creation. Renaming a group through `displayName` does not change it, so mail to the group keeps arriving, but the address no longer reflects the name. To change the address, edit the group account on the server.

`displayName` must be unique among the groups of the tenant. A duplicate is refused with `409 Conflict` and the `scimType` `uniqueness`. The server also returns a `409` when it cannot derive a free address from the display name.

### Membership

Only users can be members of a group, because groups cannot be nested. `members.type` publishes `User` as its only canonical value, and a member entry that names a group is refused with `invalidValue`.

Stalwart stores membership on the users, not on the group. A change of `members` therefore updates each affected user account, and it requires `sysAccountUpdate`, even when it accompanies the creation of a group. A change that only reorders the member list is not an update.

Reading a group with more than 200 members is refused with `tooMany`. For such a group, request it with `?excludedAttributes=members`, and read the memberships from the `groups` attribute of the users instead.

Member entries cannot be edited in place: a member is either added or removed. `display` is read-only and shows the member's display name.

## Replace compared with patch

SCIM offers two ways to update a resource, and they treat absent attributes differently.

`PATCH` applies the operations it carries and leaves everything else unchanged.

`PUT` replaces the whole resource, so the attributes absent from the body revert to their defaults. Aliases are removed, the locale returns to <!-- default:Account.locale -->`en-US`<!-- /default -->, the time zone is cleared, and `active` returns to `true`. A client that sends a partial resource with `PUT` therefore erases attributes it did not mean to change.

The interoperability profile directs clients to use `PATCH`. `PUT` is supported for scripts that control the whole resource.

## Settings that remain under local control

Provisioning covers identity, not entitlement. The identity provider decides who has an account and what it is called, while the server decides what the account may use. Quotas, roles, permissions other than the one behind `active`, mailboxes, Sieve scripts, encryption settings and every other account setting are managed on the server. Synchronisation does not change them, so a quota set on a provisioned account remains in place.

New accounts are created with `roles` `User` and `permissions` `Inherit`. They therefore receive the server's default user roles, limited by their tenant where there is one. To give provisioned accounts different defaults, adjust the default [roles](/docs/auth/authorization/roles) or the tenant's roles.

Deleting a user through SCIM removes the account, its OAuth grants (its connected applications) and the shares it granted to others, and schedules the deletion of its data ([Delete an account](/docs/auth/accounts/manage#delete-an-account)). A deletion is not a suspension, and it cannot be undone from the identity provider.
