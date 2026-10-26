---
sidebar_position: 1
title: "Overview"
description: "JMAP in Stalwart: what the protocol provides, how clients find the endpoint, the capabilities offered, and how access is restricted."
---

The older mail and collaboration protocols each cover one kind of data, and each has its own syntax: IMAP for mail, CalDAV for calendars, CardDAV for contacts. JMAP, the JSON Meta Application Protocol, covers all of them with one HTTP API. It is defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620), with mail in [RFC 8621](https://www.rfc-editor.org/rfc/rfc8621), and it gives clients access to mail, calendars, contacts, files and Sieve scripts.

The protocol is designed for efficient clients. A client sends batches of method calls as JSON, and receives all the results in one response. It synchronises by asking for the changes since a state it already knows, rather than downloading everything again. It receives push notifications of changes over Server-Sent Events, WebSockets or Web Push. Stalwart also uses JMAP for its own management API, through the `urn:stalwart:jmap` capability.

## Endpoints

JMAP is served on every HTTP listener, and no setting enables it. A client starts from `/.well-known/jmap`, which redirects to the session resource, `/jmap/session`. The session resource lists the accounts the user can access, the capabilities of each, the limits that apply, and the URLs of the other endpoints:

- `/jmap/` for API requests
- `/jmap/upload/<accountId>/` and `/jmap/download/<accountId>/<blobId>/<name>` for files and message contents
- `/jmap/eventsource` for push notifications over Server-Sent Events
- `/jmap/ws` for the [WebSocket](/docs/http/jmap/websockets) transport

The URLs in the session resource are built from the server's [public URL](/docs/configuration/environment-variables#public-urls). Clients that use DNS for discovery find the server through the `_jmap._tcp` SRV record, described in [Setting up DNS](/docs/install/dns#srv-records).

## Capabilities

Each JMAP extension is advertised as a capability in the session resource, such as `urn:ietf:params:jmap:mail` for mail or `urn:ietf:params:jmap:calendars` for calendars. [JMAP capabilities](/docs/http/jmap/capabilities) lists the capabilities Stalwart offers, the specification behind each one, and the settings that limit them. [Limits](/docs/http/jmap/protocol) describes the limits of requests, uploads and method calls, and [Push notifications](/docs/http/jmap/push) describes how clients learn of changes.

## Restricting access

JMAP can be restricted in two ways, and the first is the preferred one. A capability is offered to an account only when the account holds the permission to use it, for example `jmapEmailGet` for mail. Removing [JMAP permissions](/docs/auth/authorization/permissions) from a role therefore restricts the users that have the role.

The second way is an [access control](/docs/http/access-control) rule that refuses paths under `/jmap`. Such a rule also turns off JMAP for clients, but it locks out the WebUI as well, because the WebUI uses the same API for administration. The lock-out applies from every address except loopback. When a rule is needed, limit it to the client addresses that must not use JMAP.
