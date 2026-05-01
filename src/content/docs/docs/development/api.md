---
sidebar_position: 6
title: "API Endpoints"
---

The Stalwart API is deliberately small. The bulk of server
configuration and mailbox data is accessed through JMAP (under `/jmap`), which is a separate API with its own documentation;
the endpoints below are helpers for authentication, account introspection,
configuration schema retrieval and live (Server-Sent Events) telemetry.

All paths are relative to the server's base URL, e.g.
`https://mail.example.com`.

## Authentication

Requests to the Management API are authenticated with one of:

| Scheme          | How to send                                         | When to use                                              |
| --------------- | --------------------------------------------------- | -------------------------------------------------------- |
| **Bearer**      | `Authorization: Bearer <access_token>`              | Normal programmatic access with an OAuth2 access token.  |
| **Basic**       | `Authorization: Basic <base64(user:secret)>`        | Simple scripts or initial bootstrap.                     |
| **Live token**  | `?token=<short_lived_token>` in the URL query       | Server-Sent Events streams from browsers where an `Authorization` header cannot be set on `EventSource`. The token is obtained from `/api/token/{kind}` and expires after 60 seconds. |

Anonymous endpoints (`/api/auth`, `/api/discover/{email}`) are rate-limited.

Failed authentication returns `401 Unauthorized` with a
`WWW-Authenticate: Bearer realm="Stalwart Server"` header and an
`application/problem+json` body (RFC 7807).

---

## POST /api/auth

Authenticate a user and obtain an OAuth authorization code. Used by the web UI
and by device-flow clients to complete login. Anonymous, rate-limited.

**Request body** — tagged union discriminated by `type`:

### `authCode` — authorization-code flow (optionally with PKCE)

```json
{
  "type": "authCode",
  "accountName": "jane@example.com",
  "accountSecret": "s3cret",
  "mfaToken": null,
  "clientId": "webadmin",
  "redirectUri": "https://mail.example.com/login",
  "nonce": null,
  "scope": null,
  "codeChallenge": "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
  "codeChallengeMethod": "S256",
  "state": null
}
```

| Field                 | Type            | Required | Notes                                                                                          |
| --------------------- | --------------- | -------- | ---------------------------------------------------------------------------------------------- |
| `accountName`         | string          | yes      | Account name or email.                                                                         |
| `accountSecret`       | string          | yes      | Account password.                                                                              |
| `mfaToken`            | string          | no       | Provided on a retry after a previous `mfaRequired` response.                                   |
| `clientId`            | string          | yes      | OAuth client identifier.                                                                       |
| `redirectUri`         | string (URI)    | no       | Must use `https://` unless the server is in recovery or dev mode.                              |
| `nonce`               | string          | no       | OpenID Connect nonce.                                                                          |
| `scope`               | string          | no       | Requested OAuth scope.                                                                         |
| `codeChallenge`       | string          | no       | PKCE code challenge (RFC 7636).                                                                |
| `codeChallengeMethod` | string          | no       | `plain` or `S256`. Defaults to `plain` when a challenge is present.                            |
| `state`               | string          | no       | Opaque value echoed back to the client.                                                        |

### `authDevice` — device-flow completion

```json
{
  "type": "authDevice",
  "accountName": "jane@example.com",
  "accountSecret": "s3cret",
  "code": "BDWP-HQPK"
}
```

| Field            | Type   | Required | Notes                                                  |
| ---------------- | ------ | -------- | ------------------------------------------------------ |
| `accountName`    | string | yes      |                                                        |
| `accountSecret`  | string | yes      |                                                        |
| `mfaToken`       | string | no       |                                                        |
| `code`           | string | yes      | User-facing device code issued by `POST /auth/device`. |

**Response body** — tagged union discriminated by `type`:

| `type`          | Extra fields          | Meaning                                                                 |
| --------------- | --------------------- | ----------------------------------------------------------------------- |
| `authenticated` | `clientCode` (string) | Credentials accepted. Exchange `clientCode` at `POST /auth/token`.      |
| `verified`      | –                     | Device-flow verification succeeded.                                     |
| `mfaRequired`   | –                     | Multi-factor is required; retry with a valid `mfaToken`.                |
| `failure`       | –                     | Credentials rejected.                                                   |

Example success:

```json
{ "type": "authenticated", "clientCode": "3F7A9C1E4B2D8E6F" }
```

---

## GET /api/discover/&#123;email&#125;

Return the OpenID Connect discovery document for the directory that owns the
domain of `email`. If the domain is not bound to an external OIDC directory,
the server's own discovery document (equivalent to
`/.well-known/openid-configuration`) is returned.

Anonymous, rate-limited.

**Path parameters**

| Name    | In   | Type   | Description                     |
| ------- | ---- | ------ | ------------------------------- |
| `email` | path | string | Email address or account name.  |

**Response** — `200 OK`, `application/json`. Standard OIDC discovery metadata
(issuer, `authorization_endpoint`, `token_endpoint`, etc. per RFC 8414).

---

## GET /api/account

Return the authenticated account's effective permissions, server edition and
preferred locale. Used by the web UI to tailor the interface.

**Response** — `200 OK`, `application/json`:

```json
{
  "permissions": [
    "authenticate",
    "jmap-email-get",
    "sys-account-settings-get"
  ],
  "edition": "oss",
  "locale": "en-US"
}
```

| Field         | Type     | Notes                                                                                                                                     |
| ------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `permissions` | string[] | Effective permissions, filtered to exclude internal/system-only entries. In bootstrap mode, limited to `sys-bootstrap-get`/`-update`.     |
| `edition`     | string   | One of `oss`, `community`, `enterprise`.                                                                                                  |
| `locale`      | string   | BCP 47–style language tag.                                                                                                                |

---

## GET /api/schema

Redirect (`302`) to `/api/schema/{hash}`, where `{hash}` is the SHA-256 hex
digest of the current configuration schema. Callers that do not already know
the current hash should follow this redirect; callers that have cached a
schema at a specific hash can fetch it directly — that URL is immutable.

---

## GET /api/schema/&#123;hash&#125;

Return the JSON Schema describing the full Stalwart configuration tree. The
response is always `Content-Encoding: gzip` and is served with an immutable
cache policy: the schema at a given hash never changes. If the supplied hash
does not match the server's current schema, the server redirects to the
correct URL.

**Path parameters**

| Name   | In   | Type   | Description                                |
| ------ | ---- | ------ | ------------------------------------------ |
| `hash` | path | string | SHA-256 hex digest of the schema document. |

**Response** — `200 OK`, `application/json` (gzip-encoded) containing a JSON
Schema document.

---

## GET /api/token/&#123;kind&#125;

Issue a short-lived (60 second) bearer token for a specific Server-Sent Events
stream. The returned token is used as the `?token=` query parameter on the
matching `/api/live/...` endpoint, which lets browsers authenticate an
`EventSource` connection without being able to set request headers.

**Path parameters**

| `kind`      | Permission required  | Enterprise only |
| ----------- | -------------------- | :-------------: |
| `delivery`  | `LiveDeliveryTest`   | no              |
| `tracing`   | `LiveTracing`        | yes             |
| `metrics`   | `LiveMetrics`        | yes             |

**Response** — `200 OK`, `text/plain` — the opaque token string, valid for 60
seconds and bound to the matching `/api/live/{kind}` path.

Requesting `tracing` or `metrics` on a non-Enterprise build returns
`404 Not Found`.

---

## GET /api/live/delivery/&#123;target&#125;

Stream outbound-delivery diagnostics as Server-Sent Events. Opens a
long-running `text/event-stream` that reports each stage of an outbound
delivery attempt to `target` (MX lookup, MTA-STS fetch, DANE/TLSA validation,
SMTP conversation, etc.) and ends with a `completed` event.

Requires the `LiveDeliveryTest` permission. May be authenticated via a normal
`Authorization` header **or** via `?token=` using a token from
`/api/token/delivery`.

**Path parameters**

| Name     | In   | Type   | Description                                  |
| -------- | ---- | ------ | -------------------------------------------- |
| `target` | path | string | Domain or email address to diagnose.         |

**Query parameters**

| Name      | Type    | Default | Description                                   |
| --------- | ------- | ------- | --------------------------------------------- |
| `timeout` | integer | `30`    | Maximum stream lifetime in seconds (≥ 1).     |
| `token`   | string  | –       | Short-lived token from `/api/token/delivery`. |

**Response** — `200 OK`, `Content-Type: text/event-stream`. Each frame has the
form:

```
event: event
data: [<DeliveryStage JSON>]

```

…where `<DeliveryStage JSON>` is an object tagged by `type` — for example
`{"type":"mxLookupStart","domain":"example.com"}`,
`{"type":"mxLookupSuccess","mxs":[...],"elapsed":42}`, and so on. The final
frame is always `{"type":"completed"}`.

---

## GET /api/live/tracing *(Enterprise)*

Stream live server trace events as Server-Sent Events. Requires the
`LiveTracing` permission and may be authenticated via `?token=` using a token
from `/api/token/tracing`. Returns `404 Not Found` on non-Enterprise builds.

**Response** — `200 OK`, `Content-Type: text/event-stream`.

---

## GET /api/live/metrics *(Enterprise)*

Stream live server metrics as Server-Sent Events. Requires the `LiveMetrics`
permission and may be authenticated via `?token=` using a token from
`/api/token/metrics`. Returns `404 Not Found` on non-Enterprise builds.

**Response** — `200 OK`, `Content-Type: text/event-stream`.

---

## Error responses

All error responses use [RFC 7807](https://www.rfc-editor.org/rfc/rfc7807)
`application/problem+json`:

```json
{
  "type": "about:blank",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Invalid or missing credentials."
}
```

| Status | Meaning                                                                 |
| -----: | ----------------------------------------------------------------------- |
| `400`  | Malformed request body or invalid parameters.                           |
| `401`  | Missing or invalid credentials. Response includes `WWW-Authenticate`.   |
| `403`  | Authenticated, but lacking the required permission.                     |
| `404`  | Resource not found, or Enterprise-only endpoint on an OSS build.        |
| `429`  | Anonymous-request rate limit exceeded.                                  |
