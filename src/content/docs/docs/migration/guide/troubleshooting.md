---
sidebar_position: 9
title: "Troubleshooting"
---

This reference collects the problems most likely to arise during the migration, together with their causes and resolutions. Most stem from the interaction between the PROXY protocol, the trust each server places in the proxy, and the relaying that split delivery depends on. The proxy's log and the mail logs of both Stalwart servers are the primary diagnostic tools; raising the log level on the Stalwart servers to debug while investigating reveals the per-connection and per-delivery detail that explains most of these symptoms.

## Connectivity between the proxy and the backends

### The proxy reports a backend as unavailable or a TLS handshake failure

Immediately after the proxy starts, every forwarded connection fails and the proxy log records a backend connection error, often a TLS handshake that ends in a decode error. This is the signature of a PROXY protocol mismatch. The proxy is prepending a PROXY header to the connection, but the backend listener is not configured to expect one, so it tries to interpret the header as the start of the protocol and fails.

The resolution is to confirm that the backend trusts the proxy on the relevant listeners: the global trusted-network setting on the new server, and the per-listener proxy settings on the old server. On the old server, remember that these settings take effect only after a restart, so a change that was merely reloaded will not yet be in force.

### Connections from a particular host receive an empty reply or hang

A host that connects to a Stalwart server and receives nothing back, or whose connection hangs and times out, is almost always a host inside a network that the server has been told to trust for the PROXY protocol. Once a network is trusted, the server expects every connection from it to begin with a PROXY header, so a direct connection from that network that sends an ordinary protocol greeting instead is misread and dropped.

This is expected behaviour, not a fault. The proxy's own host typically falls inside the trusted network, which is why administrative tools are run through the proxy rather than pointed at a backend directly. A host that genuinely needs direct access must be outside the trusted networks. The same trusting of the proxy network also exempts it from the automatic connection-banning that would otherwise treat a burst of forwarded connections as abuse; if direct connections from an untrusted host begin to be dropped after many rapid attempts, that banning is the cause, and the host's address can be added to the server's allow list.

## Split delivery and relaying

### Mail for an account on the old server is rejected with "Mailbox does not exist"

When a message is delivered to the new server for an account that still lives on the old server, and the new server rejects it at the recipient stage with a 550 reply stating that the mailbox does not exist, the domain on the new server has not been told to relay for unknown recipients. The new server treats the address as a local domain it owns, finds no matching local account, and rejects it. Enabling `allowRelaying` on the domain makes the new server accept the recipient and hand it to the routing rule, which relays it to the old server.

### The relay from the new server to the old server stalls or reports an unparseable reply

When the new server connects to the old server to relay a message and the delivery hangs after connecting, or fails with a complaint that the SMTP reply could not be parsed, the old server's port 25 is expecting a PROXY header that the new server does not send. The new server relays as an ordinary SMTP client. Port 25 on the old server must therefore be the one listener that is not configured to trust the proxy. Clearing the proxy settings on that listener and restarting the old server resolves it.

### The relay is rejected with "Invalid EHLO domain"

The new server identifies itself in its EHLO greeting by its own hostname, which in many deployments is an internal name without a public domain suffix. An old server that requires a fully qualified EHLO domain rejects the relay before any message is transferred. Disabling `session.ehlo.reject-non-fqdn` on the old server allows the relay to proceed.

### Relayed mail is bounced or marked as spam by the old server

A message relayed from the new server arrives at the old server from the new server's address rather than the original sender's, and without the alignment that the original authentication would have provided. If the old server still evaluates SPF, DKIM, DMARC, ARC or reverse DNS, those checks fail and the message is penalised or rejected for reasons unrelated to its legitimacy. Disabling these inbound checks on the old server, which now trusts the new server to have performed them, resolves it.

## Account migration

### A migrated account rejects its correct password

An account that was just created on the new server from a migration plan refuses its correct password. The new server caches the fact that an account did not exist before it was created, and that negative cache continues to answer until it expires. Invalidating the caches on the new server immediately after applying the plan forces the new account and its password to be recognised. This invalidation is a required step of the account creation, not an optional one.

### An account reaches the wrong server, or a bare-name login fails

The proxy routes by the exact login the client presents, normalized to lowercase. If an account signs in sometimes with its e-mail address and sometimes with a bare account name, both forms must appear in the mapping table, or one of them will fall through to the default destination. After migration, pointing both `alice@example.org` and `alice` at the new server keeps either login working.

### An administrative tool reaches the wrong server

The migration tools authenticate as an administrator and are routed by the administrator's login like any other account. If a tool appears to operate on the wrong deployment, the administrator's mapping entry is pointing at the other one. It is set to the old server while reading from it and to the new server while writing to it, and the entry is removed once the migration is complete.

### An OAuth bearer token issued by the old server is not routed

The older Stalwart releases issue opaque OAuth access tokens that do not embed the account, so the proxy cannot derive a routing identifier from one. A JMAP client that authenticates to an account still on the old server with such a token cannot be routed by it. While an account remains on the old server it is routed by HTTP Basic authentication or by its mail login instead. The newer releases issue tokens that the proxy decodes, so this affects only accounts that have not yet been migrated.

### A JMAP client or Vandelay connects to a backend directly instead of through the proxy

A client that discovers its endpoints from the server's advertised URL will follow that URL for subsequent requests. If the advertised URL is the backend's own address rather than the proxy, the client leaves the proxy and connects to the backend directly, where, because the backend trusts the proxy network, the connection may be refused. Setting the advertised URL to the proxy on both servers, through `STALWART_PUBLIC_URL` on the new server and `http.url` on the old server, keeps autodiscovering clients on the proxy.

## Data transfer with Vandelay

### Reading files from the old server fails over JMAP

Older Stalwart releases implement an earlier draft of the JMAP file specification that Vandelay's JMAP file transfer does not recognise, so an attempt to read an account's files over JMAP from such a server does not return them. Files are read over WebDAV instead, with Vandelay's `import webdav` command pointed at the account's file area, into the same archive that holds the rest of the account.

### Writing files back to the old server fails

When rolling an account back, an attempt to write files onto the old server fails with a complaint about an invalid property. The old server's earlier JMAP file draft does not accept the files that Vandelay produces, so files created on the new server after a switch cannot be written back to the old server automatically. They are copied by hand over WebDAV from the new server to the old one. The other data types, mail, mailboxes, sieve scripts, contacts and calendars, are written back without difficulty, so this limitation applies only to files.

### A configuration change on the old server has no effect

A setting changed on the old server through the management API or its configuration file does not appear to take effect after a reload. The listener settings that enable the PROXY protocol are applied only on a full restart, because they change how each socket interprets incoming bytes. Other settings apply on a reload. When a proxy-related listener change seems to be ignored, restarting the old server applies it.
