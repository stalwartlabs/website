---
sidebar_position: 1
title: "Overview"
description: "What every SCIM client needs from Stalwart, how its schema handling affects default attribute mappings, and how the major identity providers differ."
---

The pages in this section give the procedure for connecting individual identity providers. They share a common preparation, described here, and differ mainly in how each product names its fields and in which parts of the protocol it exercises.

Before configuring any of them, complete the Stalwart side: enable [`allowScimProvisioning`](/docs/ref/object/domain#allowscimprovisioning) on the domains to be provisioned, create the service principal, issue its API key, and confirm that the endpoint answers. [Configuration](/docs/auth/scim/configuration) covers all four steps and ends with the two verification requests worth running before an identity provider is pointed at the server.

Every provider needs the same two values: the base URL, `https://<host>/scim/v2`, and the API key secret, presented as a bearer token.

## Default attribute mappings

Stalwart publishes only the attributes it implements, but it does not insist that requests confine themselves to that set. The attributes of the core RFC 7643 User and Group schemas that Stalwart does not implement, and the enterprise user extension, are accepted and discarded, so the default mapping set of every product in this section provisions successfully without being trimmed. [Schema handling](/docs/auth/scim/endpoints#schema-handling) explains where the line falls.

Two consequences matter before the first synchronisation:

- **Discarded means discarded.** `title`, `phoneNumbers`, `addresses`, `userType`, `entitlements`, `roles` and the enterprise extension leave no trace on the account. A mapping for them is inert, not an error, so a deployment expecting a phone number to arrive somewhere will not see one, and nothing in the provisioning log will say so.
- **Structured names become the display name.** `name.givenName` and `name.familyName` are joined and stored as the display name when neither `displayName` nor `name.formatted` is supplied. Mapping `displayName` explicitly is preferable where the name should take a particular form.

An attribute belonging to no schema Stalwart recognises is still refused, with `400 Bad Request` and a `scimType` of `invalidSyntax`. In practice that means a custom attribute or a mistyped target, not anything in a stock mapping set. [Attribute mapping](/docs/auth/scim/mapping) lists what is stored.

:::note[Clients that always send a password]

Some SCIM clients include a `password` attribute on every user creation, whether or not password synchronisation is enabled. Stalwart does not publish `password`, and the value is discarded and never written to the credential store.

This is a consequence of the deployment model: authentication belongs to the identity provider, and Stalwart holds no credential for a SCIM-provisioned account. Such a client provisions normally; the account simply has no password of its own. Okta is the notable case; see [Okta](/docs/auth/scim/providers/okta#password-on-user-creation).

:::

## Protocol support by provider

Stalwart implements more of SCIM than any single client uses. The table below summarises which parts are actually exercised, which is useful when interpreting a provisioning log or deciding what to test.

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

None of the three uses `/Bulk`, `/.search`, cursor pagination, or conditional requests. Those exist for scripted provisioning and for clients that adopt them later.

The deletion row deserves attention when choosing a deprovisioning policy. Entra ID eventually issues a hard `DELETE`, so a departed employee's mailbox is removed without further action, and the `sysAccountDestroy` permission determines whether Stalwart honours that. Okta never deletes; accounts accumulate in a deactivated state and are removed by an administrator or an out-of-band process. The two call for different operational routines.

## Other identity providers

Any conforming SCIM 2.0 client can provision into Stalwart. When evaluating one that is not covered here, the requirements are:

- It authenticates with a bearer token. HTTP Basic authentication is refused.
- It restricts itself to the `eq` and `and` filter operators, which the [interoperability profile](https://datatracker.ietf.org/doc/draft-zollner-scim-interop-profile/) requires of clients in any case.
- It can be configured to send only the attributes Stalwart publishes, in particular without `password` and without the structured name sub-attributes.
- It matches users on `userName` or `externalId`, both of which are indexed.

`GET /scim/v2/ServiceProviderConfig` and `GET /scim/v2/Schemas` state exactly what the server supports, and a client that reads them will configure itself correctly. For a client that does not, the [endpoints](/docs/auth/scim/endpoints) and [mapping](/docs/auth/scim/mapping) pages carry the same information in prose.
