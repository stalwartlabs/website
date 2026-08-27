---
sidebar_position: 4
title: "Endpoints and protocol support"
description: "The SCIM endpoints Stalwart exposes, the filter, sort, pagination and concurrency features it supports, and the errors it returns."
---

Every SCIM endpoint is served under `/scim/v2` on the standard HTTP listeners. Requests and responses use the `application/scim+json` media type, including error responses, as required by [RFC 7644](https://www.rfc-editor.org/rfc/rfc7644) section 8.1. A `OPTIONS` request to any path under the base returns `204 No Content`, which satisfies clients that probe with a preflight request before their first call.

## Endpoints

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

The three discovery endpoints are readable without authentication, which is permitted by RFC 7644 and expected by clients that probe a target before credentials have been configured. They expose the shape of the service and no account data. Where even that is unwanted, restrict the path by address as described under [Restricting network access](/docs/auth/scim/configuration#restricting-network-access). Filtering is not accepted on the discovery endpoints; a `filter` parameter there is refused with `403 Forbidden`.

`/Me` is defined by RFC 7644 section 3.11 as an alias for the resource belonging to the authenticated subject. Stalwart returns `501 Not Implemented`, which the specification explicitly sanctions. The endpoint exists for end-user self-service, whereas a SCIM client authenticates as a machine principal whose subject is the integration's own service account, and not a provisionable user.

Requests to any unrecognised path under `/scim/v2` return `404 Not Found`, and a recognised path called with an unsupported method returns `405 Method Not Allowed` with an `Allow` header naming the methods that are accepted.

## Advertised capabilities

`GET /scim/v2/ServiceProviderConfig` reports what the server supports. The values are fixed:

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

`changePassword` reports whether a SCIM client may set the `password` attribute on a user it provisions. In this deployment model the identity provider holds the credential and Stalwart validates against it over OIDC, so there is no password to push and the attribute is absent from the published User schema.

## Schema handling

`GET /scim/v2/Schemas` returns the attribute definitions the server actually honours, derived from its own account model. It is the authoritative statement of what Stalwart stores, and [attribute mapping](/docs/auth/scim/mapping) explains what each attribute does once it arrives.

Requests are not required to confine themselves to that set. RFC 7643 section 4.1 defines a User resource considerably larger than any mail server implements, and RFC 7644 section 3.1 states plainly that a client "does not need to remove" attributes the server will not act on, adding that a client "SHOULD NOT expect a service provider to return SCIM resources with exactly the same schema and values as submitted". Identity providers are built on that assumption: none of them shapes its request body from the target's `/Schemas` document.

Stalwart therefore accepts and discards the attributes of the core RFC 7643 User and Group schemas that it does not implement, and the enterprise user extension, in `POST`, `PUT` and `PATCH` request bodies alike. They are neither stored nor returned. The one that is not merely discarded is the structured name: where `displayName` and `name.formatted` are both absent, `name.givenName` and `name.familyName` are joined and stored as the display name, so an account provisioned by a client that sends only structured name parts is not left nameless.

An attribute that belongs to no schema Stalwart recognises is still refused, with `400 Bad Request` and a `scimType` of `invalidSyntax`. A misspelled mapping such as `dispalyName`, an unrecognised schema URI, a duplicated attribute, and a missing `schemas` value are all refused the same way.

The [SCIM interoperability profile](https://datatracker.ietf.org/doc/draft-zollner-scim-interop-profile/) section 5.3 requires every undefined attribute to be rejected. Stalwart follows RFC 7644 where the two disagree, and reports `interopProfileConformant` as `false`. Every other requirement of that profile is met. [Why undefined attributes are accepted](/docs/auth/scim/provisioning#why-undefined-attributes-are-accepted) sets out the reasoning.

## Filtering

Filters are accepted on `GET /Users`, `GET /Groups`, and the `/.search` endpoints. Two operators are supported, `eq` and `and`, which is exactly what the interoperability profile mandates and exactly what identity providers send in practice. Every other operator, including `ne`, `co`, `sw`, `ew`, `gt`, `lt`, `pr`, `or`, and `not`, is refused with `400 Bad Request` and a `scimType` of `invalidFilter`. The full grammar is parsed before the request is rejected, so the error names the unsupported construct.

The attributes that can be filtered are:

| Resource | Attributes |
|---|---|
| User | `id`, `externalId`, `userName`, `emails`, `emails.value`, `active`, `displayName`, `name.formatted`, `groups`, `groups.value` |
| Group | `id`, `externalId`, `displayName`, `members`, `members.value` |

Filtering on any other attribute is refused with `invalidFilter`. Value filters of the form `attr[sub eq "x"]` are not accepted inside a `filter` parameter, though they are supported in `PATCH` paths, where clients genuinely need them.

Most filters resolve against an index. `active`, `displayName`, and `name.formatted` cannot be fully answered from an index, so they are evaluated after the indexed part of the filter has narrowed the candidate set. If more than 200 candidates remain at that point, the request is refused with `400 Bad Request` and a `scimType` of `tooMany`, and the message asks for a narrower filter. Combining such an attribute with an indexed one using `and` avoids the condition.

## Sorting and pagination

`sortBy` accepts `id` and, for users, `userName`; `sortOrder` accepts `ascending` and `descending`. Sorting by any other attribute is refused with `invalidValue`, because the server sorts from an index.

Both pagination styles defined for SCIM are available. Index-based pagination follows RFC 7644 section 3.4.2.4, using `startIndex` and `count`, and the response reports `totalResults`, `startIndex`, and `itemsPerPage`. Cursor-based pagination follows [RFC 9865](https://www.rfc-editor.org/rfc/rfc9865): the client sends `cursor` and the response returns `nextCursor` until the result set is exhausted. A page holds 100 resources unless `count` says otherwise, and 200 is the maximum. A cursor is bound to the query that produced it, so presenting one alongside a changed filter or sort order is rejected.

## Entity tags and concurrency

Every resource carries a `meta.version` entity tag, returned in the `ETag` header as well as the body. The value is derived from the content of the resource, so it changes when the resource changes and does not change when it does not; for groups it covers the membership as well as the group's own attributes.

`If-None-Match` on a `GET` returns `304 Not Modified` when the resource is unchanged, which lets a client poll cheaply. `If-Match` on a `PUT`, `PATCH`, or `DELETE` returns `412 Precondition Failed` when the resource has changed since it was read, which prevents two overlapping synchronisation cycles from overwriting each other. Requests that omit the header proceed unconditionally.

`meta.lastModified` is not emitted, because Stalwart does not record a modification timestamp on accounts. `meta.created` is present. Clients that use timestamps for incremental synchronisation should use entity tags instead.

## Bulk operations

`POST /scim/v2/Bulk` accepts up to 1000 operations in a single request, subject to a 1 MiB payload limit, and supports `failOnErrors` and `bulkId` forward references so that a user can be created and added to a group created in the same request. Each operation reports its own status, so a partial failure does not discard the successful operations.

The endpoint exists because the IPSIE profile requires it and because provisioning scripts can use it directly.

## Query by POST

`POST /scim/v2/Users/.search` and `POST /scim/v2/Groups/.search` accept the same parameters as a `GET` query, carried in a `SearchRequest` body instead of the query string. `POST /scim/v2/.search` runs the query across both resource types and returns a single combined `ListResponse`.

RFC 7644 section 7.5.2 warns against placing personal data in request URIs, and Stalwart records request URIs in its telemetry, so `GET /Users?filter=emails eq "alice@example.org"` writes an address into the trace log where the equivalent `.search` request does not.

## Errors

Errors are returned as SCIM error documents carrying an HTTP status, a `detail` string, and, where the specification defines one, a `scimType`.

| Status | `scimType` | Cause |
|---|---|---|
| `400` | `invalidSyntax` | Malformed body, an attribute or schema URI belonging to no known schema, a duplicated attribute, or a missing `schemas` value |
| `400` | `invalidFilter` | Unsupported operator or attribute in a filter |
| `400` | `invalidPath` | Unsupported `PATCH` path, or a value filter where one is not accepted |
| `400` | `invalidValue` | A value the server cannot accept, including a domain not open to SCIM |
| `400` | `tooMany` | A filter matching more than 200 candidates before a non-indexed attribute is evaluated |
| `400` | `mutability` | An attempt to modify a read-only attribute |
| `401` | | Missing, malformed, or expired bearer token, or HTTP Basic authentication |
| `403` | | Valid credential lacking a required permission, or the Community Edition |
| `404` | | Unknown resource, unknown endpoint, or a resource outside the caller's tenant |
| `405` | | Method not supported by the endpoint; the `Allow` header lists what is |
| `409` | `uniqueness` | An address or group name that is already in use |
| `412` | | An `If-Match` precondition that no longer holds |
| `413` | | A payload above the endpoint's size limit |
| `429` | | Rate limit exceeded; a `Retry-After` header states when to retry |
| `501` | | `/Me` |

A resource belonging to another tenant returns `404`, not `403`, so that tenant boundaries do not leak the existence of accounts.
