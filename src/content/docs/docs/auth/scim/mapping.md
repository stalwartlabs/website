---
sidebar_position: 5
title: "Attribute mapping"
description: "How SCIM User and Group attributes translate onto Stalwart accounts, which attributes are not implemented, and what remains under local control."
---

Stalwart publishes a deliberately small SCIM schema. Every attribute in it corresponds to something a mail server actually stores, and nothing in RFC 7643 that has no mail-server meaning is published. Attributes outside that set are accepted and discarded, not refused, so an identity provider can send its default mappings without trimming them; see [schema handling](/docs/auth/scim/endpoints#schema-handling) for where the line falls.

The authoritative list is served by the server itself at `GET /scim/v2/Schemas`. This page explains what each attribute does once it arrives.

## User

Users are provisioned under `urn:ietf:params:scim:schemas:core:2.0:User` and map onto individual [accounts](/docs/auth/principals/individual).

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

### The account name

`userName` carries the full email address, and Stalwart splits it into a local part and a domain. The domain must already exist as a [Domain](/docs/ref/object/domain) object with [`allowScimProvisioning`](/docs/ref/object/domain#allowscimprovisioning) enabled; a `userName` in an unknown domain, or in one that is not open to SCIM, is refused with `invalidValue`. This means domains are created by an administrator and never by the identity provider.

Identity providers whose user principal names differ from their mail addresses need a mapping expression so that `userName` carries the address Stalwart should use. Provisioning a user whose `userName` is a bare login name fails, because there is no domain to resolve.

### Addresses and aliases

The primary address is always derived from `userName`. Within the `emails` collection it appears with `primary` set to `true` and a `type` of `work`, and it cannot be removed, retyped, or made non-primary; those sub-attributes are read-only, and an attempt to change the primary entry through `emails` is refused with a message pointing back at `userName`.

Every other entry in `emails` becomes an alias on the account. Aliases are replaced as a set on each `PUT` and reconciled individually on a `PATCH`, so an address dropped upstream is dropped locally. Each alias must resolve to a domain that is open to SCIM and, in a multi-tenant deployment, that belongs to the same tenant as the account; an address in another tenant's domain is refused. Duplicate entries are ignored, and an entry that repeats the primary address is skipped.

### Administrative status

`active` is not stored as a field. It is expressed as the account's `authenticate` permission, which is what actually determines whether the account may sign in, and reading `active` computes the effective permission from the account, its roles, and its tenant.

Setting `active` to `false` disables the permission on the account, overriding whatever its roles would otherwise grant. Setting it back to `true` restores the account to the state it was in before, including any unrelated permission customisation an administrator had applied. Where the account had no customisation at all, deactivating and reactivating leaves it exactly as it started.

A deactivated account keeps its mailbox and continues to receive mail; it simply cannot be authenticated against. Where mail should stop as well, delete the account, not deactivate it. Note that a SCIM client cannot deactivate or delete the account it authenticated as.

Both a JSON boolean and the strings `"true"` and `"false"` are accepted in a `PATCH` operation, since some clients send the latter.

### Locale and time zone

SCIM writes locales with a hyphen (`en-US`) where Stalwart stores an underscore (`en_US`); the translation is automatic in both directions, and case is normalised, so `EN-us` and `ca-ES@valencia` are both accepted. `locale` and `preferredLanguage` are two names for one stored value: whichever is supplied is used, `locale` wins if both are, and the resource returns the same value under both names. A locale the server does not carry a translation for is refused with `invalidValue`.

`timezone` takes an IANA Time Zone Database identifier. An unrecognised identifier is refused.

### Attributes that are not implemented

These attributes are absent from the published schema, and a request carrying them is accepted with the value discarded. Nothing has to be removed on the identity provider.

`password` is not implemented, as explained under [advertised capabilities](/docs/auth/scim/endpoints#advertised-capabilities): the identity provider holds the credential. A `password` sent on creation or replacement is dropped and never written to the credential store, so an account provisioned over SCIM has no password of its own until one is set through another interface.

`phoneNumbers`, `addresses`, `photos`, `ims`, `title`, `userType`, `nickName`, `profileUrl`, `entitlements`, `roles`, `x509Certificates`, and the enterprise user extension are dropped in the same way. On a Group, `description` is dropped.

`name` carries only `formatted`, because Stalwart stores a single display name and no structured name parts. `middleName`, `honorificPrefix` and `honorificSuffix` are dropped. `givenName` and `familyName` are the exception to the rule: when neither `displayName` nor `name.formatted` is supplied, they are joined with a space and stored as the display name, so a client that sends only structured names still produces a named account. When either display attribute is supplied it wins, and the resource always returns the stored display name under `displayName` and `name.formatted`, never under the structured parts.

An attribute belonging to no schema Stalwart recognises is a different case and is still refused with `invalidSyntax`. A mapping to `dispalyName` fails loudly, and no value it carries is silently discarded.

## Group

Groups are provisioned under `urn:ietf:params:scim:schemas:core:2.0:Group` and map onto [group accounts](/docs/auth/principals/group), which in Stalwart are mail-enabled: a group has an address and distributes to its members.

| SCIM attribute | Stalwart field | Mutability | Notes |
|---|---|---|---|
| `id` | Account identifier | Read-only | Assigned by the server |
| `externalId` | [`externalId`](/docs/ref/object/account#externalid) | Read-write | The identity provider's own identifier |
| `displayName` | [`description`](/docs/ref/object/account#description) | Read-write, required | Must be unique among groups |
| `members` | Membership | Read-write | Users only |
| `meta` | Creation time and version | Read-only | Version covers the membership |

### Addresses derived from the display name

A SCIM `Group` carries a display name but no address, while a Stalwart group needs one. Stalwart therefore derives the local part from `displayName`, lowercasing it and replacing runs of non-alphanumeric characters with hyphens, so `Sales EMEA` yields `sales-emea`. If that address is already taken, a numeric suffix is appended until a free one is found, and the result is truncated to 64 characters.

The domain is the one the authenticated service principal belongs to, since nothing in the request identifies one. A service principal whose own domain is not open to SCIM can manage users but cannot create groups; [Configuration](/docs/auth/scim/configuration#creating-the-service-principal) covers the placement of that account.

Renaming a group through `displayName` does not change the address that was derived at creation. Mail already flowing to the group keeps working, which is usually what an operator wants, but it does mean the address stops resembling the name. Where the address matters, set it directly on the account afterwards.

`displayName` must be unique among groups within the tenant, and a collision is refused with `409 Conflict` and a `scimType` of `uniqueness`. A separate `409` arises when two display names slugify to the same address and no free variant can be derived.

### Membership

Only users may be members. `members.type` publishes `User` as its sole canonical value, and a member entry naming a group is refused with `invalidValue`. Nested groups are not supported in either direction.

Membership is stored on the user, so `members` is answered by a reverse lookup and a membership change is a write to each affected user. Adding or removing members therefore requires `sysAccountUpdate`, even when it accompanies a group creation. And reading a group with more than 200 members is refused with `tooMany`; request it with `?excludedAttributes=members` and read the membership from the `groups` attribute of the user resources instead.

The `members` entries are immutable in the SCIM sense: a member is added or removed, never edited in place. `display` is read-only and reflects the member account's description.

## Replace compared with patch

`PATCH` applies the operations it carries and leaves everything else alone. `PUT` replaces the resource, and attributes absent from the body revert to their defaults: aliases are cleared, the locale returns to `en-US`, the time zone is cleared, and `active` returns to `true`. A client that sends a partial resource by `PUT` will therefore erase attributes it never intended to touch.

The interoperability profile tells clients to use `PATCH`, and every current identity provider does. `PUT` is implemented for completeness and for scripted use, where the caller controls the whole body.

## Settings that remain under local control

Provisioning covers identity, not entitlement. Quotas, roles, permissions beyond `active`, mailbox layout, sieve scripts, encryption settings, and every other account setting remain under local control and are unaffected by synchronisation. An administrator can set a quota on a SCIM-provisioned account and it will survive every subsequent cycle.

New accounts are created with the standard user role and inherited permissions, which means the defaults configured on the server and, where applicable, on the tenant. Where SCIM-provisioned accounts need different defaults from locally created ones, express the difference through [roles](/docs/auth/authorization/roles) applied to the tenant or through the server defaults.

Deleting a user through SCIM removes the account and schedules the destruction of its data, and revokes any shares other accounts held on it. It is not a suspension, and it is not reversible from the identity provider's side.
