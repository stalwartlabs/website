---
sidebar_position: 9
title: "Troubleshooting"
---

This reference collects the problems most likely to arise during the migration, together with their causes and resolutions. Most stem from the interaction between the way the proxy announces the client to each backend, the trust each server places in the proxy, and the relaying that split delivery depends on. Several entries depend on what the source runs, and are marked accordingly: a Stalwart source is announced over the PROXY protocol, while a Dovecot and Postfix source is announced over XCLIENT and the IMAP ID. The proxy's log and the mail logs of both servers are the primary diagnostic tools; on the new Stalwart server, and on an older Stalwart source, raising the log level to debug while investigating reveals the per-connection and per-delivery detail that explains most of these symptoms.

## Connectivity between the proxy and the backends

### The proxy reports a backend as unavailable or a TLS handshake failure

Immediately after the proxy starts, every forwarded connection fails and the proxy log records a backend connection error, often a TLS handshake that ends in a decode error. This is the signature of a PROXY protocol mismatch. The proxy is prepending a PROXY header to the connection, but the backend listener is not configured to expect one, so it tries to interpret the header as the start of the protocol and fails.

The new Stalwart server is always announced over the PROXY protocol, so the resolution there is to confirm the global trusted-network setting names the proxy. The source side depends on what it runs. When the source is an older Stalwart, it too is announced over the PROXY protocol, so confirm the per-listener proxy settings trust the proxy, and remember that they take effect only after a restart, so a change that was merely reloaded will not yet be in force. When the source is a Dovecot and Postfix stack, it must instead be addressed with `forwarding = "xclient"`; if its destination is mistakenly set to `forwarding = "proxy"`, the proxy sends a PROXY header that Dovecot and Postfix do not expect and the same decode error appears on the source leg.

### Connections from a particular host receive an empty reply or hang

A host that connects to a Stalwart server and receives nothing back, or whose connection hangs and times out, is almost always a host inside a network that the server has been told to trust for the PROXY protocol. Once a network is trusted, the server expects every connection from it to begin with a PROXY header, so a direct connection from that network that sends an ordinary protocol greeting instead is misread and dropped. This affects the new Stalwart server and an older Stalwart source; it does not arise on a Dovecot and Postfix source, because trusting the proxy for XCLIENT is permissive and never makes Dovecot or Postfix refuse a direct connection.

This is expected behaviour, not a fault. The proxy's own host typically falls inside the trusted network, which is why administrative tools are run through the proxy rather than pointed at a Stalwart backend directly. A host that genuinely needs direct access must be outside the trusted networks. The same trusting of the proxy network also exempts it from the automatic connection-banning that would otherwise treat a burst of forwarded connections as abuse; if direct connections from an untrusted host begin to be dropped after many rapid attempts, that banning is the cause, and the host's address can be added to the server's allow list.

## Split delivery and relaying

### Mail for an account on the source is rejected with "Mailbox does not exist"

When a message is delivered to the new server for an account that still lives on the source, and the new server rejects it at the recipient stage with a 550 reply stating that the mailbox does not exist, the domain on the new server has not been told to relay for unknown recipients. The new server treats the address as a local domain it owns, finds no matching local account, and rejects it. Enabling `allowRelaying` on the domain makes the new server accept the recipient and hand it to the routing rule, which relays it to the source.

### The relay from the new server to the source stalls or reports an unparseable reply

When the new server connects to the source to relay a message and the delivery hangs after connecting, or fails with a complaint that the SMTP reply could not be parsed, the source's port 25 is expecting a PROXY header that the new server does not send, because the new server relays as an ordinary SMTP client. This arises when the source is an older Stalwart whose port 25 was mistakenly trusted for the PROXY protocol: port 25 must be the one listener that is not configured to trust the proxy, and clearing the proxy settings on that listener and restarting the source resolves it. A Dovecot and Postfix source does not expect a PROXY header on port 25 at all, so this particular symptom does not arise there; a relay that Postfix refuses is instead the reputation or policy rejection covered next.

### The relay is rejected with "Invalid EHLO domain"

The new server identifies itself in its EHLO greeting by its own hostname, which in many deployments is an internal name without a public domain suffix. A source that requires a fully qualified EHLO domain rejects the relay before any message is transferred. On an older Stalwart source, disabling `session.ehlo.reject-non-fqdn` allows the relay to proceed; on a Postfix source, the equivalent is to relax `reject_non_fqdn_helo_hostname` for the relay, though Postfix does not enforce it by default.

### Relayed mail is bounced or marked as spam by the source

A message relayed from the new server arrives at the source from the new server's address rather than the original sender's, and without the alignment that the original authentication would have provided. If the source still evaluates SPF, DKIM, DMARC, ARC or reverse DNS, those checks fail and the message is penalised or rejected for reasons unrelated to its legitimacy. The resolution is to have the source trust the new server to have performed those checks: on an older Stalwart source by disabling the inbound checks, and on a Dovecot and Postfix source by adding the new server's address to Postfix `mynetworks`, and trusting it in any milter such as rspamd, so that relayed mail is not re-scored.

## Account migration

### A migrated account rejects its correct password

An account that was just created on the new server from a migration plan refuses its correct password. The new server caches the fact that an account did not exist before it was created, and that negative cache continues to answer until it expires. Invalidating the caches on the new server immediately after applying the plan forces the new account and its password to be recognised. This invalidation is a required step of the account creation, not an optional one.

### An account reaches the wrong server, or a bare-name login fails

The proxy routes by the exact login the client presents, normalized to lowercase. If an account signs in sometimes with its e-mail address and sometimes with a bare account name, both forms must appear in the mapping table, or one of them will fall through to the default destination. After migration, pointing both `alice@example.org` and `alice` at the new server keeps either login working.

### An administrative tool reaches the wrong server

When migration tools are routed through the proxy, which is the technique used for an older Stalwart source, they authenticate as an administrator and are routed by the administrator's login like any other account. If a tool appears to operate on the wrong deployment, the administrator's mapping entry is pointing at the other one. It is set to the source while reading from it and to the new server while writing to it, and the entry is removed once the migration is complete. A Dovecot and Postfix source is read directly with the master user rather than through the proxy, so this entry is normally not in play there.

### An OAuth bearer token issued by an older Stalwart source is not routed

The older Stalwart releases issue opaque OAuth access tokens that do not embed the account, so the proxy cannot derive a routing identifier from one. A JMAP client that authenticates to an account still on such a source with one of these tokens cannot be routed by it. While an account remains on the source it is routed by HTTP Basic authentication or by its mail login instead. The newer releases issue tokens that the proxy decodes, so this affects only accounts that have not yet been migrated, and only when the source is a Stalwart deployment.

### A JMAP client or Vandelay connects to a backend directly instead of through the proxy

A client that discovers its endpoints from the server's advertised URL will follow that URL for subsequent requests. If the advertised URL is the backend's own address rather than the proxy, the client leaves the proxy and connects to the backend directly, where, because the backend trusts the proxy network, the connection may be refused. This concerns servers that serve JMAP: the new Stalwart server, whose advertised URL is set to the proxy through `STALWART_PUBLIC_URL`, and an older Stalwart source, whose `http.url` is set to the proxy. A Dovecot and Postfix source serves no JMAP and advertises no such URL, and Vandelay reads it directly by design, so the concern does not arise on that side.

## Data transfer with Vandelay

### Reading files from an older Stalwart source fails over JMAP

Older Stalwart releases implement an earlier draft of the JMAP file specification that Vandelay's JMAP file transfer does not recognise, so an attempt to read an account's files over JMAP from such a source does not return them. Files are read over WebDAV instead, with Vandelay's `import webdav` command pointed at the account's file area, into the same archive that holds the rest of the account. This concerns only a Stalwart source; a Dovecot and Postfix source serves no files.

### Writing files back to an older Stalwart source fails

When rolling an account back to an older Stalwart source, an attempt to write files onto it fails with a complaint about an invalid property. The source's earlier JMAP file draft does not accept the files that Vandelay produces, so files created on the new server after a switch cannot be written back to such a source automatically. They are copied by hand over WebDAV from the new server to the source. The other data types, mail, mailboxes, sieve scripts, contacts and calendars, are written back without difficulty, so this limitation applies only to files, and only when the source is a Stalwart deployment.

### A Dovecot source does not record the real client address

After signing in through the proxy, the Dovecot login line shows the proxy's address in its `rip=` field rather than the client's. The proxy forwards the real client address over the IMAP ID and XCLIENT commands, but Dovecot only honours it from a trusted source. Adding the proxy's address to `login_trusted_networks` in Dovecot, and to `smtpd_authorized_xclient_hosts` in Postfix, and reloading both, makes the real client address appear. Logins succeed either way; only the recorded address is affected.

### A configuration change on a Stalwart source has no effect

A setting changed on an older Stalwart source through the management API or its configuration file does not appear to take effect after a reload. The listener settings that enable the PROXY protocol are applied only on a full restart, because they change how each socket interprets incoming bytes. Other settings apply on a reload. When a proxy-related listener change seems to be ignored, restarting the source applies it. A Dovecot and Postfix source has no equivalent restart requirement: its trust settings apply on a `doveadm reload` or `postfix reload`.
