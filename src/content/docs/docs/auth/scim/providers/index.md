---
sidebar_position: 1
title: "Overview"
description: "What every SCIM client needs from Stalwart, how its schema handling affects default attribute mappings, and how the major identity providers differ."
---

:::tip[Enterprise feature]
This feature is available in the [Enterprise edition](/docs/server/enterprise) of Stalwart.
:::

Every identity provider implements SCIM a little differently. Products name their settings in their own way, choose different defaults for attribute mappings, and use different parts of the protocol. The pages in this section give the procedure for connecting individual identity providers. They share the preparation described on this page, and they differ mainly in how each product names its settings and which parts of the protocol it uses.

## Preparation

Complete the Stalwart side before configuring any provider. Enable [`allowScimProvisioning`](/docs/ref/object/domain#allowscimprovisioning) on the domains to provision, create the provisioning account, issue its API key, and confirm that the endpoint answers ([Configuration](/docs/auth/scim/configuration)).

Every provider then needs the same two values:

- The base URL, `https://<host>/scim/v2`.
- The secret of the API key, which the provider presents as a bearer token.

## Default attribute mappings

Each provider comes with default attribute mappings that send far more than a mail server stores. Stalwart publishes only the attributes it stores, but it accepts requests that contain more. The attributes of the core RFC 7643 User and Group schemas that Stalwart does not store, and those of the enterprise user extension, are accepted and discarded. The default mappings of every product in this section therefore provision without changes ([Schema handling](/docs/auth/scim/endpoints#schema-handling)).

This behaviour has two consequences for the mappings:

- Discarded attributes are not stored anywhere. `title`, `phoneNumbers`, `addresses`, `userType`, `entitlements`, `roles` and the enterprise extension leave no trace on the account, and the provider's log shows no error for them.
- Name parts become the display name. When neither `displayName` nor `name.formatted` is supplied, the server joins `name.givenName` and `name.familyName` and stores the result as the display name. Mapping `displayName` is therefore the way to control the form of the name.

Unknown attributes are treated differently. An attribute that belongs to no known schema, such as a custom attribute or a misspelled target, is refused with `400 Bad Request` and the `scimType` `invalidSyntax`. [Attribute mapping](/docs/auth/scim/mapping) lists what is stored.

:::note[Clients that always send a password]

Some SCIM clients include a `password` attribute in every user creation, whether or not password synchronisation is enabled. Stalwart does not publish `password`, because the identity provider authenticates the users, so the value is discarded and never stored. Such a client provisions normally, and the account has no password of its own ([Okta](/docs/auth/scim/providers/okta#password-on-user-creation)).

:::

## Protocol support by provider

The following table summarises which parts of the protocol each provider uses, as observed at the time of writing. It helps when reading a provisioning log or deciding what to test.

| | Microsoft Entra ID | Okta | Keycloak |
|---|---|---|---|
| Native outbound SCIM | Yes | Yes | No, requires an extension |
| Updates sent as | `PATCH` | `PUT` for custom applications | Depends on the extension |
| Filter operators used | `eq`, `and` | `eq` | `eq`, or none at all |
| Matching attribute | `userName`, `externalId` | Always `userName` | `externalId`, or a local mapping table |
| Suspension | `PATCH active=false` | `active=false` | Depends on the extension |
| Deletion | `DELETE`, after its retention window | Never, suspension only | Depends on the extension |
| Pagination | Index | Index | Index |
| Bulk, query by POST, cursors, entity tags | Unused | Unused | Unused |

None of the three uses `/Bulk`, `/.search`, cursor pagination or conditional requests. These features remain available for scripted provisioning.

The deletion row matters most, because it decides the deprovisioning policy. Entra ID eventually sends a `DELETE`, so the mailbox of a departed employee is removed without further action, provided that the provisioning credential holds `sysAccountDestroy`. Okta never deletes. With Okta, accounts remain suspended until an administrator or another process removes them.

## Other identity providers

Any conforming SCIM 2.0 client can provision accounts into Stalwart. A client not covered in this section must meet these requirements:

- It authenticates with a bearer token, because HTTP Basic authentication is refused.
- It restricts itself to the `eq` and `and` filter operators. The [interoperability profile](https://datatracker.ietf.org/doc/draft-zollner-scim-interop-profile/) requires this of clients in any case.
- It matches users on `userName` or `externalId`, both of which are indexed.

Two endpoints state what the server supports: `GET /scim/v2/ServiceProviderConfig` and `GET /scim/v2/Schemas`. [Endpoints and protocol support](/docs/auth/scim/endpoints) and [Attribute mapping](/docs/auth/scim/mapping) describe the same in prose.
