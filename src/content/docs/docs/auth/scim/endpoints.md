---
sidebar_position: 4
title: "Endpoints and protocol support"
description: "The SCIM endpoints Stalwart exposes, the filter, sort, pagination and concurrency features it supports, and the errors it returns."
---

:::tip[Enterprise feature]
This feature is available in the [Enterprise edition](/docs/server/enterprise) of Stalwart.
:::

SCIM leaves many parts of the protocol optional, and identity providers differ in which parts they use. This page describes what Stalwart implements: the endpoints it serves, the protocol features it supports and the errors it returns. It is the reference to consult when reading a provisioning log, or when writing a provisioning script against the endpoint.

Every endpoint is served under `/scim/v2` on the HTTP listeners. Requests and responses, error responses included, use the `application/scim+json` media type that [RFC 7644](https://www.rfc-editor.org/rfc/rfc7644) section 3.1 specifies. Some clients send a preflight `OPTIONS` request before their first call, and the server answers such a request to any path under the base with `204 No Content`.

## Endpoints

The server serves the following endpoints:

| Endpoint | Methods | Authentication |
|---|---|---|
| `/scim/v2/Users` | `GET`, `POST` | Bearer token |
| `/scim/v2/Users/{id}` | `GET`, `PUT`, `PATCH`, `DELETE` | Bearer token |
| `/scim/v2/Users/.search` | `POST` | Bearer token |
| `/scim/v2/Groups` | `GET`, `POST` | Bearer token |
| `/scim/v2/Groups/{id}` | `GET`, `PUT`, `PATCH`, `DELETE` | Bearer token |
| `/scim/v2/Groups/.search` | `POST` | Bearer token |
| `/scim/v2/.search` | `POST` | Bearer token |
| `/scim/v2/Bulk` | `POST` | Bearer token |
| `/scim/v2/ServiceProviderConfig` | `GET` | None |
| `/scim/v2/ResourceTypes`, `/scim/v2/ResourceTypes/{id}` | `GET` | None |
| `/scim/v2/Schemas`, `/scim/v2/Schemas/{urn}` | `GET` | None |
| `/scim/v2/Me` | any | Returns `501` |

`/ServiceProviderConfig`, `/ResourceTypes` and `/Schemas` are the discovery endpoints, which describe the service to a client. They can be read without authentication, because clients read them before credentials have been configured. [RFC 7643](https://www.rfc-editor.org/rfc/rfc7643) section 5 recommends in particular that the authentication schemes be readable without prior authentication. The discovery endpoints expose no account data. To hide them as well, restrict the path by address ([Restricting network access](/docs/auth/scim/configuration#restricting-network-access)).

A discovery endpoint cannot be filtered. A `filter` parameter on one is refused with `403 Forbidden`, as RFC 7644 section 4 recommends, so that a client cannot wrongly assume that the filter matched.

`/Me` is defined in RFC 7644 section 3.11 as an alias for the resource of the authenticated subject. It serves end-user self-service. A SCIM client, however, authenticates as the provisioning account, which is not a resource it provisions. The server therefore returns `501 Not Implemented`, the response the specification recommends for a server that does not support the endpoint.

A request to an unknown path under `/scim/v2` returns `404 Not Found`. A known path called with an unsupported method returns `405 Method Not Allowed`, with an `Allow` header that names the accepted methods.

## Advertised capabilities

A client learns what the server supports from `GET /scim/v2/ServiceProviderConfig`. The values it reports are fixed:

| Capability | Value |
|---|---|
| `patch` | Supported |
| `bulk` | Supported, at most 1000 operations and 1 MiB per request |
| `filter` | Supported, at most 200 results |
| `changePassword` | Not supported |
| `sort` | Supported |
| `etag` | Supported |
| `pagination` | Index and cursor, default page 100, maximum page 200, index by default |
| `authenticationSchemes` | OAuth bearer token only |
| `interopProfileConformant` | `false`, see [schema handling](#schema-handling) |

`changePassword` states whether a SCIM client may set the `password` attribute of a user. The identity provider holds the credentials, so the attribute is not supported, and it is absent from the published User schema.

## Schema handling

`GET /scim/v2/Schemas` returns the definitions of the attributes the server stores. [Attribute mapping](/docs/auth/scim/mapping) describes what each of them does.

Requests may contain more than that set, and the standard expects this. RFC 7643 section 4.1 defines a User resource far larger than a mail server stores. RFC 7644 section 3.1 states that a client does not need to remove read-only attributes from a `PUT` request, which the server ignores, and that a client "SHOULD NOT expect a service provider to return SCIM resources with exactly the same schema and values as submitted". Identity providers rely on this, and they do not shape their requests from the `/Schemas` document.

Stalwart therefore accepts the attributes that it does not store, as long as they belong to a schema it knows. These are the attributes of the core RFC 7643 User and Group schemas and those of the enterprise user extension. The server accepts them in `POST`, `PUT` and `PATCH` requests alike, and it neither stores nor returns them.

The structured name is the exception. When both `displayName` and `name.formatted` are absent, the server joins `name.givenName` and `name.familyName` and stores the result as the display name. A client that sends only the name parts therefore still produces a named account.

Anything else is refused with `400 Bad Request` and the `scimType` `invalidSyntax`. This covers an attribute that belongs to no schema the server knows, a misspelled attribute such as `dispalyName`, an unknown schema URI, a duplicated attribute and a missing `schemas` value.

Section 5.3 of the [SCIM interoperability profile](https://datatracker.ietf.org/doc/draft-zollner-scim-interop-profile/) requires every undefined attribute to be rejected. Where the two disagree, Stalwart follows RFC 7644, and it therefore reports `interopProfileConformant` as `false`. Every other requirement of the profile is met ([Undefined attributes](/docs/auth/scim/provisioning#undefined-attributes)).

## Filtering

A filter lets a client find a resource by its attributes, for example to check whether a user it is about to create already exists. Filters are accepted on `GET /Users`, `GET /Groups` and the `/.search` endpoints.

The supported operators are `eq` and `and`. These are the two that the interoperability profile requires and that identity providers send. Every other operator, including `ne`, `co`, `sw`, `ew`, `gt`, `lt`, `pr`, `or` and `not`, is refused with `400 Bad Request` and the `scimType` `invalidFilter`. The error names the unsupported construct.

Only the following attributes can be filtered:

| Resource | Attributes |
|---|---|
| User | `id`, `externalId`, `userName`, `emails`, `emails.value`, `active`, `displayName`, `name.formatted`, `groups`, `groups.value` |
| Group | `id`, `externalId`, `displayName`, `members`, `members.value` |

Filtering on any other attribute is refused with `invalidFilter`. Value filters of the form `attr[sub eq "x"]` are accepted only in `PATCH` paths, not in a `filter` parameter.

Most filters are answered from an index, but some attributes are evaluated more slowly. `active` is not indexed. `displayName` and `name.formatted` are narrowed only by the words they contain. A filter on `active`, or on a display name made of one-character words, is therefore evaluated after the indexed part of the filter has narrowed the candidates. If more than 200 candidates remain at that point, the request is refused with `400 Bad Request` and the `scimType` `tooMany`, and the message asks for a narrower filter. Combining such an attribute with an indexed one through `and` avoids the error.

## Sorting and pagination

`sortBy` accepts `id` and, for users, `userName`. `sortOrder` accepts `ascending` and `descending`. Sorting by any other attribute is refused with `invalidValue`.

Large result sets are returned in pages, and both pagination styles that SCIM defines are available:

- Index-based pagination follows RFC 7644 section 3.4.2.4. The client sends `startIndex` and `count`, and the response reports `totalResults`, `startIndex` and `itemsPerPage`.
- Cursor-based pagination follows [RFC 9865](https://www.rfc-editor.org/rfc/rfc9865). The client sends `cursor`, and the response returns `nextCursor` until the results are exhausted. A cursor is bound to the query that produced it, so presenting it with a different filter or sort order is refused.

A page holds 100 resources, unless `count` sets another size, up to 200.

## Entity tags and concurrency

An entity tag is a version marker that lets a client detect whether a resource changed since it was last read. Every resource carries one in `meta.version`, which is returned in the `ETag` header as well as in the body. The tag is derived from the content of the resource, so it changes only when the resource changes. For a group, it covers the membership as well as the group's own attributes.

Clients use the tag in conditional requests:

- `If-None-Match` on a `GET` returns `304 Not Modified` when the resource is unchanged.
- `If-Match` on a `PUT`, `PATCH` or `DELETE` returns `412 Precondition Failed` when the resource has changed since it was read. This prevents two overlapping synchronisation cycles from overwriting each other.

Requests without these headers are processed unconditionally.

`meta.created` is returned, but `meta.lastModified` is not, because accounts have no modification timestamp. Clients that synchronise incrementally must therefore use entity tags.

## Bulk operations

`POST /scim/v2/Bulk` carries several operations in one request: up to 1000 operations, within a payload of 1 MiB. It supports `failOnErrors` and `bulkId` references. A `bulkId` lets one operation refer to a resource created by another, so a user can be created and added to a group created in the same request.

Each operation reports its own status, and a failed operation does not undo the successful ones. The IPSIE profile requires the endpoint, and provisioning scripts can use it directly.

## Query by POST

`POST /scim/v2/Users/.search` and `POST /scim/v2/Groups/.search` accept the same parameters as a `GET` query. The parameters travel in a `SearchRequest` body instead of the query string. `POST /scim/v2/.search` runs the query across both resource types and returns a single combined `ListResponse`.

Moving the query into the body keeps personal data out of request URIs. RFC 7644 section 7.5.2 advises this, because proxies and web servers commonly log URIs. Stalwart's own `scim.query` event records the filter in both cases.

## Errors

Errors are returned as SCIM error documents. Each document carries an HTTP status, a `detail` text and, where the specification defines one, a `scimType`. Each error is also recorded as an event ([Diagnosing failures](/docs/auth/scim/#diagnosing-failures)). The following table lists the causes of each status:

| Status | `scimType` | Cause |
|---|---|---|
| `400` | `invalidSyntax` | Malformed body, an attribute or schema URI belonging to no known schema, a duplicated attribute, or a missing `schemas` value |
| `400` | `invalidFilter` | Unsupported operator or attribute in a filter |
| `400` | `invalidPath` | Unsupported `PATCH` path, or a value filter where one is not accepted |
| `400` | `invalidValue` | A value the server cannot accept, including a domain not open to SCIM |
| `400` | `tooMany` | A filter matching more than 200 candidates before a non-indexed attribute is evaluated |
| `400` | `mutability` | An attempt to modify a read-only attribute |
| `400` | `noTarget` | A `PATCH` path that matches no element |
| `400` | `invalidCursor` | A cursor issued for a different query: `The supplied cursor was issued for a different query.` |
| `401` | | Missing, malformed, or expired bearer token, or HTTP Basic authentication |
| `403` | | A valid credential lacking a required permission, an account the caller may not modify ([rule](/docs/auth/authorization/permissions#granting-permissions-to-other-accounts)), or no Enterprise license |
| `404` | | Unknown resource, unknown endpoint, a resource outside the caller's tenant, or an account in a domain not open to SCIM |
| `405` | | Method not supported by the endpoint; the `Allow` header lists what is |
| `409` | `uniqueness` | An address or group name that is already in use |
| `409` | | A concurrent modification, a resource that other objects depend on, or a group for which no free address can be derived |
| `412` | | An `If-Match` precondition that no longer holds |
| `413` | | A payload above the endpoint's size limit |
| `429` | | Rate limit exceeded; a `Retry-After` header states when to retry |
| `501` | | `/Me` |

A resource of another tenant returns `404`, not `403`. The choice is deliberate: a `403` would confirm that the account exists, and the existence of accounts must not leak across tenants.
