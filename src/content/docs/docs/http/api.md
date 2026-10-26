---
sidebar_position: 9
title: "HTTP API"
description: "Reference for the HTTP endpoints under /api: sign-in, account information, the configuration schema, calendar RSVP, live telemetry streams, the other HTTP routes and the error format."
---

Most programmatic access to Stalwart goes through JMAP, under `/jmap`, which carries both mailbox data and the server configuration. A few tasks do not fit the JMAP model, such as signing in before a token exists or streaming live telemetry to a browser. For these, Stalwart serves a small set of HTTP endpoints under `/api`: sign-in, account introspection, the configuration schema, calendar RSVP and live telemetry streams.

This page is the reference for those endpoints, and it also lists the other HTTP routes that the server answers. The OAuth and OpenID Connect endpoints under `/auth` are described separately, in [OAuth endpoints](/docs/auth/oauth/endpoints).

All paths are relative to the server's base URL, for example `https://mail.example.com`. Unless stated otherwise, request and response bodies are JSON, with camelCase field names. A POST body is limited to 1 MiB.

## Authentication

Authenticated endpoints accept three kinds of credential, suited to different callers:

| Scheme | How to send | Use |
|---|---|---|
| Bearer | `Authorization: Bearer <access_token>` | Programmatic access with an OAuth access token. |
| Basic | `Authorization: Basic <base64(user:secret)>` | Scripts and initial setup. |
| Live token | `?token=<token>` in the query string | `EventSource` connections from browsers, which cannot set an `Authorization` header. The token is obtained from [`/api/token/{kind}`](#get-apitokenkind), is valid for 60 seconds and is accepted only on the matching `/api/live/*` endpoint. |

Anonymous endpoints are subject to the anonymous HTTP rate limit, and authenticated requests to the authenticated rate limit. Both are described in [Rate limiting](/docs/http/settings#rate-limiting).

A request without valid credentials receives `401 Unauthorized`, with the header `WWW-Authenticate: Bearer realm="Stalwart Server", resource_metadata="<url>"`. Here `<url>` is the server's `/.well-known/oauth-protected-resource` document for the requested path, from which a client can learn how to obtain a token.

## POST /api/auth

Authenticates a user, and completes an OAuth authorisation request or a device authorisation with the result. The built-in sign-in pages at `/login` and `/device` use this endpoint. Anonymous.

The request body takes one of two forms, selected by `type`.

### `authCode`

Completes an authorisation code request:

```json
{
  "type": "authCode",
  "accountName": "jane@example.com",
  "accountSecret": "s3cret",
  "mfaToken": null,
  "query": "client_id=...&redirect_uri=...&response_type=code&state=...&code_challenge=...&code_challenge_method=S256",
  "consent": true
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `accountName` | string | yes | Account name or email address. |
| `accountSecret` | string | yes | Password or app password. |
| `mfaToken` | string | no | One-time code, sent on a retry after an `mfaRequired` response. |
| `query` | string | yes | The query string of the OAuth authorisation request, as received at `/login`. It is validated with the same rules as the authorisation endpoint. |
| `consent` | boolean | no | `true` when the user approved access. Every client except the built-in applications requires it. |

### `authDevice`

Approves or denies a device authorisation:

```json
{
  "type": "authDevice",
  "accountName": "jane@example.com",
  "accountSecret": "s3cret",
  "code": "BDWP-HQPK",
  "consent": true
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `accountName` | string | no | Account name or email address. |
| `accountSecret` | string | no | Password or app password. |
| `mfaToken` | string | no | One-time code. |
| `code` | string | yes | The user code shown by the device, issued by `POST /auth/device`. |
| `consent` | boolean | no | `true` to approve the device, `false` to deny it. Without it the request fails. |

### Response

The response is selected by `type`:

| `type` | Fields | Meaning |
|---|---|---|
| `authenticated` | `location` | Credentials accepted. `location` is the client's redirect URI with the authorisation `code`, `state` and `iss` parameters; the client exchanges the code at `POST /auth/token`. |
| `redirect` | `location` | The request failed in a way the client must learn about, for example missing consent. `location` is the redirect URI with `error`, `state` and `iss`. |
| `invalid` | `error`, `description` | The client or the redirect URI cannot be trusted, so the user is not redirected. |
| `verified` | | The device was approved. |
| `denied` | | The device was denied. |
| `mfaRequired` | | A one-time code is required; retry with `mfaToken`. |
| `expired` | | The account's password has expired and the client is not a built-in application. |
| `failure` | | Credentials rejected. |

## GET /api/auth/client

Returns the details of the client that started a sign-in. The sign-in page uses them to show the user who is asking for access. Anonymous.

The endpoint reads its input in one of two ways. With the query parameter `user_code`, it describes the client of a pending device authorisation. Otherwise, it reads the whole query string as an OAuth authorisation request, and validates it.

On success, the response contains `name`, `logo`, `clientHost`, `redirectHost`, `scopes` (the labels of the requested scopes), `verified`, `consentRequired` and `denyLocation`. On failure, it contains `error` (an OAuth error code), an optional `description` and `redirect`. When `redirect` is `true`, it also contains the `location` to send the user to. Both kinds of response are returned with status 200.

## POST /api/calendar/rsvp

Reads or answers a calendar invitation through an RSVP link, as described in [HTTP RSVP](/docs/collaboration/scheduling#http-rsvp). The page at `/calendar/rsvp` calls it. Anonymous, because the signed token in the link identifies the attendee. The endpoint is available only while `httpRsvpEnable` is `true` on the [CalendarScheduling](/docs/ref/object/calendar-scheduling) object, and it returns `404` otherwise.

```json
{ "token": "<token>", "partstat": "accepted", "comment": "Bringing dessert" }
```

| Field | Type | Required | Description |
|---|---|---|---|
| `token` | string | yes | The `i` parameter of the RSVP link. |
| `partstat` | string | no | `accepted`, `declined` or `tentative`, and for tasks `completed` or `in-process` (case-insensitive). Without it, the call returns the invitation. |
| `comment` | string | no | Note for the organiser; text beyond 512 characters is cut off. |

The response is returned with status 200, and its `type` selects one of three forms. `invitation` carries the event details, the attendee's current status and localised labels for the page. `recorded` carries the stored `partstat`. `error` carries a `reason` of `invalidLink`, `invalidPartStat`, `expired`, `eventNotFound`, `notParticipant` or `serverError`, with a localised `title` and `message`. A body that is not valid JSON returns `400`.

## GET /api/discover/&#123;email&#125;

Returns the OpenID Connect discovery document for the account `email`, so that a client can learn where that account signs in. When the account's domain is served by an external [OpenID Connect directory](/docs/auth/backend/oidc), the endpoint returns that directory's discovery document. Otherwise it returns the server's own document, which matches `/.well-known/openid-configuration` and adds `stalwart_required_scopes`. Anonymous.

| Name | In | Type | Description |
|---|---|---|---|
| `email` | path | string | Email address or account name. |

## GET /api/account

Returns the authenticated account's permissions, the server edition and the preferred locale. The WebUI uses this information to decide which parts of the interface to show. Authenticated.

```json
{
  "permissions": ["authenticate", "jmapEmailGet", "sysAccountSettingsGet"],
  "edition": "enterprise",
  "locale": "en-US"
}
```

| Field | Type | Description |
|---|---|---|
| `permissions` | string[] | The account's effective [permissions](/docs/ref/permissions). Permissions that the account cannot use are left out, for example the directory query permissions when directory queries are disabled. In bootstrap mode the list is `sysBootstrapGet` and `sysBootstrapUpdate`. |
| `edition` | string | `enterprise` when an Enterprise license is active, otherwise `community`. |
| `locale` | string | Language tag, for example `en-US`. |

## GET /api/schema

Redirects (`302`) to `/api/schema/{hash}`, where `{hash}` is the SHA-256 digest of the configuration schema of the running server. Authenticated.

## GET /api/schema/&#123;hash&#125;

Returns the JSON Schema of the server configuration, which the WebUI uses to build its forms. The schema for a given hash never changes, so the response can be cached indefinitely: it has `Content-Encoding: gzip` and `Cache-Control: public, max-age=31536000, immutable`. A hash that does not match the running server redirects to the current one. Authenticated.

| Name | In | Type | Description |
|---|---|---|---|
| `hash` | path | string | SHA-256 digest of the schema document. |

## GET /api/token/&#123;kind&#125;

Browsers cannot set an `Authorization` header on an `EventSource` connection, so the live streams accept a short-lived token in the query string instead. This endpoint issues such a token, valid for 60 seconds, for one `/api/live/{kind}` stream. The token is returned as plain text, and the client passes it to the stream as `?token=`.

| `kind` | Permission | Stream |
|---|---|---|
| `delivery` | `liveDeliveryTest` | [`/api/live/delivery/{target}`](#get-apilivedeliverytarget) |
| `tracing` | `liveTracing` | [`/api/live/tracing`](#get-apilivetracing) |
| `metrics` | `liveMetrics` | [`/api/live/metrics`](#get-apilivemetrics) |

A request without the permission returns `403`. `tracing` and `metrics` return `404` unless an Enterprise license is active.

## GET /api/live/delivery/&#123;target&#125;

Tests delivery to a domain or address, and streams each step as Server-Sent Events, so that an administrator can see where a delivery fails. The steps are the MX lookup, the MTA-STS policy fetch, the TLSA lookup and DANE validation, the connection, EHLO, STARTTLS and the SMTP transaction. Requires the `liveDeliveryTest` permission, sent in the `Authorization` header or as `?token=`.

| Name | In | Type | Default | Description |
|---|---|---|---|---|
| `target` | path | string | | A domain or an email address. A domain must contain a dot, and may contain only ASCII letters, digits, `.`, `-` and `_` (internationalised domains in their `xn--` form). |
| `timeout` | query | integer | `30` | Timeout in seconds for each network operation of the test (at least 1). |
| `token` | query | string | | Token from `/api/token/delivery`. |

A target that is not a valid domain or address returns `400` with the detail `Invalid delivery target`.

The response is `text/event-stream`. Each frame has the event name `event`, and carries a JSON array with one step object, whose `type` names the step:

```text
event: event
data: [{"type":"mxLookupSuccess","mxs":[{"exchanges":["mx1.example.com"],"preference":10}],"elapsed":42}]

```

Times (`elapsed`) are in milliseconds. The last frame is always `{"type":"completed"}`, so a client knows when the test has ended.

## GET /api/live/tracing

:::tip[Enterprise feature]
Live tracing is available in the [Enterprise edition](/docs/server/enterprise) of Stalwart.
:::

Streams server events as they occur, as Server-Sent Events. Requires the `liveTracing` permission, sent in the `Authorization` header, or as `?token=` with a token from `/api/token/tracing`. [Live telemetry](/docs/telemetry/live#event-stream) describes the filter parameters and the stream format.

## GET /api/live/metrics

:::tip[Enterprise feature]
Live metrics are available in the [Enterprise edition](/docs/server/enterprise) of Stalwart.
:::

Streams the current values of the server metrics at a fixed interval, as Server-Sent Events. Requires the `liveMetrics` permission, sent in the `Authorization` header, or as `?token=` with a token from `/api/token/metrics`. [Live telemetry](/docs/telemetry/live#metrics-stream) describes the parameters and the stream format.

## Other HTTP routes

Besides `/api` and `/jmap`, the server answers the following routes:

| Route | Description |
|---|---|
| `GET /healthz/live` | Returns `200` while the process is running. Anonymous. See [liveness and readiness endpoints](/docs/cluster/orchestration/kubernetes#liveness-and-readiness-endpoints). |
| `GET /healthz/ready` | Returns `200` when the data store is available, otherwise `503`. Anonymous. |
| `GET /metrics/prometheus` | Prometheus metrics, when the Prometheus exporter is enabled on the [Metrics](/docs/ref/object/metrics) object; protected with HTTP Basic authentication when credentials are configured there. See [Prometheus](/docs/telemetry/metrics/prometheus). |
| `GET /calendar/rsvp` | The RSVP page for calendar invitations, while HTTP RSVP is enabled. |
| `/auth/*`, `/login`, `/device` | OAuth and OpenID Connect endpoints and the sign-in pages; see [OAuth endpoints](/docs/auth/oauth/endpoints). |
| `/.well-known/*`, `/mail/config-v1.1.xml`, `/autodiscover/*` | Service discovery for JMAP, CalDAV and CardDAV, OAuth metadata, MTA-STS, ACME challenges and client autoconfiguration; see [Autoconfig](/docs/server/autoconfig). |
| `/dav/*` | WebDAV, CalDAV and CardDAV; see [WebDAV](/docs/http/webdav/). |
| `/scim/*` | SCIM provisioning (Enterprise); see [SCIM](/docs/auth/scim/configuration). |
| `POST /form` | Contact form submission; see [Form submission](/docs/http/form-submission). |
| `GET /logo` | The branding logo, while an Enterprise license is active; see [Branding](/docs/management/webui/branding). |
| `GET /robots.txt` | Disallows all crawling. |

## Error responses

Errors are returned in a standard format, as `application/problem+json` documents defined in [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457). The `status` repeats the HTTP status, and `detail` explains the problem:

```json
{
  "type": "about:blank",
  "status": 401,
  "title": "Unauthorized",
  "detail": "You have to authenticate first."
}
```

| Status | Meaning |
|---:|---|
| `400` | Malformed request or invalid parameters; `detail` names the problem. |
| `401` | Missing or invalid credentials; the response includes `WWW-Authenticate`. |
| `402` | A one-time code is required to complete authentication. |
| `403` | Authenticated, but without the required permission. |
| `404` | Unknown route or resource, or an Enterprise endpoint without an active license. |
| `429` | Rate limit exceeded, or the client address is blocked after too many failed authentication attempts. Rate limit responses include `Retry-After`. |
| `503` | The server's memory budget is exhausted; see [Sizing memory](/docs/performance/memory#errors-returned-when-the-budget-is-full). |
