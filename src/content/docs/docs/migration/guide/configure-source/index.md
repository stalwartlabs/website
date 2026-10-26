---
sidebar_position: 1
title: "Overview"
description: "What every source server must accept during the migration, which source page applies, and what to check on a Stalwart source before preparing it."
next: false
---

The new deployment and the proxy are configured the same way whatever the source runs. The source is different: it is the one component whose preparation depends on its software, and this step prepares it.

Whatever the software, every source has to meet the same requirements:

- **Accept connections from the proxy and learn the real client address.** The proxy announces each client to the source, either with a PROXY protocol header or with the XCLIENT and IMAP `ID` commands. The source must trust the proxy's address for that announcement. Without that trust, the source records the proxy's address as the client, and a Stalwart source refuses the connection.
- **Accept mail relayed from the new deployment.** From the cutover onwards, the new deployment is the public mail exchanger, and it relays to the source every message for an account that has not moved yet. The source must accept these messages on port 25 without repeating the SPF, DKIM, DMARC and reverse DNS checks, because the new deployment has already applied them, and because those checks fail for a relayed message.
- **Advertise the proxy as its public URL**, when the source serves HTTP or JMAP. Clients that discover their endpoints from the server's own URL then stay on the proxy.

One further change is optional: routing the source's outbound mail through the new deployment. It lets every outgoing message pass through the same signing and filtering while the migration lasts.

## Choosing the source

Each source page is self-contained, so only the page for the source in use applies. Once the source is prepared, the guide continues at [Starting the proxy](/docs/migration/guide/cutover/). Two source pages exist:

- [Previous Stalwart versions](/docs/migration/guide/configure-source/previous-stalwart) prepares a Stalwart 0.15 server, which is configured through settings keys, or a Stalwart 0.16 server, which is configured through objects in the WebUI or the CLI.
- [Dovecot and Postfix](/docs/migration/guide/configure-source/dovecot-postfix/) prepares a stack with Dovecot for IMAP, POP3 and ManageSieve and Postfix for SMTP. This stack is the basis of Mail-in-a-Box, mailcow and similar distributions.

Other sources have no page of their own. Another self-hosted server whose network and ports the operator controls, such as Cyrus IMAP or Courier, is prepared by meeting the same requirements, and so is a Stalwart server older than 0.15. The Dovecot and Postfix page is the closest template for them, because such servers usually learn the client address through XCLIENT or the IMAP `ID` command, and relay through an ordinary SMTP server.

## Checking a Stalwart source

Three properties of a Stalwart source decide how its accounts are copied and routed: the data types it serves over JMAP, the form of its logins, and its HTTP routes. Check them on the source before preparing it, whatever its release.

The first property is visible in the JMAP session of the source, which lists the data types it serves over JMAP. Fetch the session with the credentials of any account on the source. Stalwart answers `/.well-known/jmap` with a redirect to `/jmap/session` on the same host, which `-L` follows:

```bash
curl -sL -u 'alice@example.org:password' https://source.internal.example.org/.well-known/jmap
```

The `capabilities` object of the response names the capabilities that the source advertises. Vandelay copies a data type over JMAP only when the matching capability is present:

| Capability | Data types |
| --- | --- |
| `urn:ietf:params:jmap:mail` | Mailboxes and email |
| `urn:ietf:params:jmap:submission` | Identities |
| `urn:ietf:params:jmap:sieve` | Sieve scripts |
| `urn:ietf:params:jmap:contacts` | Address books and contacts |
| `urn:ietf:params:jmap:calendars` | Calendars and events |
| `urn:ietf:params:jmap:filenode` | Files |

When a capability is missing, its data type is copied with the matching protocol importer instead: files with the [WebDAV importer](/docs/migration/import-export/import/webdav), contacts with the [CardDAV importer](/docs/migration/import-export/import/carddav) and calendars with the [CalDAV importer](/docs/migration/import-export/import/caldav).

One more capability matters for selecting accounts. Selecting an account by name in Vandelay requires `urn:ietf:params:jmap:principals`. Without it, the account is selected by its JMAP account identifier.

The second property, the login form of the source, decides which mapping entries the proxy needs. A source on which users sign in with a bare name, such as `alice`, needs two mapping entries once the account moves: one for the bare name and one for the address. Calendar and contact clients configured with a bare-name collection URL must also be updated after the move, as described in [Login names after migration](/docs/migration/guide/migrate-accounts/#login-names-after-migration).

The third property is the HTTP routes. Because both servers are Stalwart servers, the HTTP routes of the source and the new deployment overlap. A route that exists on both servers cannot be routed by its path, so the proxy routes such requests by the account they identify, and sends requests that identify no account to a default destination. [Configuring the proxy](/docs/migration/guide/configure-proxy/) describes the HTTP routing for a Stalwart source.
