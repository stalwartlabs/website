---
sidebar_position: 1
title: "Overview"
description: "The HTTP endpoints Stalwart serves on its HTTP listeners: client protocols, OAuth, discovery, operations, the WebUI, and which of them require authentication."
---

Much of what Stalwart offers travels over HTTP: the modern client protocols, the sign-in flows, the documents that let clients configure themselves, the monitoring endpoints and the web interface. All of these share the server's HTTP listeners. Every HTTP listener serves the same set of endpoints, whether it is the `https` listener on port 443 or the `http` listener on port 8080 of a new installation.

The endpoints fall into a few groups. The JMAP, CalDAV, CardDAV and WebDAV protocols serve clients. The OAuth authorization server handles sign-in. Discovery documents let clients configure themselves. Operational endpoints provide health checks and metrics, and the management API lets tools administer the server. Finally, web applications such as the WebUI provide the interface for people.

The server-wide behaviour of these endpoints is configured on the [HTTP server](/docs/http/settings) page, and [access control](/docs/http/access-control) rules decide which of them each client may reach. This page lists the endpoints by group.

Endpoints marked as authenticated require credentials. A client can authenticate with HTTP Basic authentication, using an account's password or an [app password](/docs/auth/authentication/app-password), or with a Bearer token, which is an OAuth access token or an [API key](/docs/auth/authentication/api-key). Public endpoints are open to anyone, so they are subject to the anonymous [rate limit](/docs/http/settings#rate-limiting).

## Client protocols

| Path | Serves | Authentication |
|---|---|---|
| `/jmap/` | [JMAP](/docs/http/jmap/) API requests (`POST`) | Required |
| `/jmap/session` | The JMAP session resource, which lists the account's capabilities and the URLs below | Required for the account's session; without credentials it returns only the server's capabilities |
| `/jmap/upload/<accountId>/`, `/jmap/download/...` | Blob upload and download | Required |
| `/jmap/eventsource` | Push notifications over Server-Sent Events | Required |
| `/jmap/ws` | The JMAP [WebSocket](/docs/http/jmap/websockets) endpoint | Required |
| `/dav/cal/`, `/dav/card/`, `/dav/file/` | [CalDAV, CardDAV and WebDAV](/docs/http/webdav/) collections | Required, except `OPTIONS` |
| `/dav/pal/`, `/dav/itip/` | DAV principals and calendar scheduling | Required, except `OPTIONS` |

## Authentication and OAuth

| Path | Serves | Authentication |
|---|---|---|
| `/login`, `/device` | The OAuth sign-in and device-code pages, used by OAuth clients, the WebUI and the account manager; `/login` is not a webmail login | None |
| `/auth/token`, `/auth/device`, `/auth/revoke`, `/auth/register`, `/auth/logout`, `/auth/jwks.json` | OAuth token, device authorization, revocation, client registration, sign-out and signing keys | None (client authentication where the protocol requires it) |
| `/auth/introspect`, `/auth/userinfo` | Token introspection and OpenID Connect user information | Required |

[OAuth endpoints](/docs/auth/oauth/endpoints) describes each of them.

## Discovery

| Path | Serves |
|---|---|
| `/.well-known/jmap` | Redirect (307) to `/jmap/session` |
| `/.well-known/caldav`, `/.well-known/carddav` | Redirect (307) to `/dav/cal` and `/dav/card` |
| `/.well-known/oauth-authorization-server`, `/.well-known/openid-configuration` | OAuth and OpenID Connect metadata |
| `/.well-known/oauth-protected-resource` | Protected resource metadata ([RFC 9728](https://www.rfc-editor.org/rfc/rfc9728)) |
| `/.well-known/user-agent-configuration.json` | The PACC client configuration document |
| `/.well-known/autoconfig/mail/config-v1.1.xml`, `/.well-known/mail-v1.xml`, `/mail/config-v1.1.xml` | Mozilla autoconfig |
| `/autodiscover/autodiscover.xml`, `/autodiscover/autodiscover.json` | Outlook Autodiscover |
| `/.well-known/mta-sts.txt` | The [MTA-STS policy](/docs/domains/mta-sts) |
| `/.well-known/acme-challenge/<token>` | The ACME [HTTP-01 challenge](/docs/server/tls/acme/challenges#http-01), when a provider uses it |

All of these endpoints are public. [Autoconfiguration](/docs/server/autoconfig) describes the client configuration documents.

## Operations

| Path | Serves | Authentication |
|---|---|---|
| `/healthz/live` | Liveness: `200` while the server process runs | None |
| `/healthz/ready` | Readiness: `200` when the data store is available, `503` otherwise | None |
| `/metrics/prometheus` | [Prometheus metrics](/docs/telemetry/metrics/prometheus), when the exporter is enabled | The exporter's own credentials |
| `/api/...` | The management [HTTP API](/docs/http/api): sign-in, account information, schema, live telemetry and delivery tests | Required, except the sign-in endpoints |
| `/scim/v2/...` | [SCIM provisioning](/docs/auth/scim/) (Enterprise) | Required |
| `/form/...` | [Form submission](/docs/http/form-submission), when enabled | None |
| `/calendar/rsvp` | The [RSVP page](/docs/collaboration/scheduling#http-rsvp) for calendar invitations, when enabled | None (signed link) |
| `/logo` | The logo of the domain or tenant (Enterprise) | None |
| `/robots.txt` | A file that asks crawlers to index nothing | None |

## Web applications

`/admin` and `/account` serve the WebUI's administration console and account manager, which are installed as [applications](/docs/management/applications/). Other applications are served under their own prefixes. The files of an application are public, because the application itself signs in through OAuth. A request for `/` is redirected to the path in [`Http.redirectRoot`](/docs/http/settings#root-redirect).

A request for any other path returns `404`. Some unknown paths are treated as an attack, however. A request for an unknown path that matches one of the scan patterns of [auto-ban](/docs/server/auto-ban#counted-events), such as a path containing `.php` or `wp-`, bans the client's address.
