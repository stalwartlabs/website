---
prev:
  link: /docs/migration/guide/finalize/
  label: Finalizing the migration
sidebar_position: 9
title: "Troubleshooting"
description: "Symptoms, causes and fixes for the problems that occur most often during a migration with the proxy and Vandelay."
---

This page lists the problems that occur most often during the migration, grouped by the stage at which they appear. Each entry describes the symptom, its cause and the way to confirm it, and the fix. Most of the problems have one of three origins: the way the proxy announces clients to each server, the trust that each server places in the proxy, and the relaying that split delivery depends on.

The main diagnostic tools are the proxy's log and [management API](/docs/migration/proxy/management/api), and the logs of both servers. On the new deployment and on a Stalwart source, raise the log level to debug while investigating, to see the details of each connection and delivery.

## Connections between the proxy and the servers

### Every connection through the proxy fails after it starts

Every forwarded connection fails. The proxy log records a backend connection error, often a TLS handshake that ends in a decode error, and `GET /destinations` reports a climbing failure count for the destination.

The proxy is starting the connection with a PROXY protocol header that the server does not expect, so the server reads the header as the start of the protocol. Every connection that the proxy opens, HTTP connections included, starts with a PROXY header unless the destination sets another mode, because `proxy_protocol` defaults to `true`.

The fix depends on the server:

- For the new deployment, check that `proxyTrustedNetworks` in SystemSettings contains the proxy's address, and that the new deployment was restarted after the change.
- For a source running a previous Stalwart version, check the per-listener trusted networks: the `server.listener.<id>.proxy.trusted-networks` keys on Stalwart 0.15, and the `overrideProxyTrustedNetworks` field of each listener on Stalwart 0.16. These also take effect only after a restart.
- For a Dovecot and Postfix source, the destination must use `forwarding = "xclient"`.

### Connections from one host get no reply or hang

A host that connects directly to a Stalwart server receives nothing, or its connection hangs until it times out. This affects the new deployment and a Stalwart source, not a Dovecot and Postfix source.

The host is inside a network that the server trusts for the PROXY protocol. The server expects every connection from that network to start with a PROXY header, and drops connections that do not. The logs show which case applies:

- A client that waits for the server's greeting sends nothing. The server closes the connection after a timeout, and logs a `network.timeout` event for the missing PROXY header.
- A client that sends data first causes a `network.proxy-error` event.
- A Stalwart 0.16 source does not time out. It waits for the header until the client gives up, and logs a `network.proxy-error` event when the connection ends.

This is expected behaviour. The proxy's own host is usually inside the trusted network, so run tools from another host or through the proxy. A host that needs direct access must be outside the trusted networks.

### Clients see the proxy's address in the Dovecot logs

After signing in through the proxy, the Dovecot login line shows the proxy's address in its `rip=` field. Logins succeed either way; only the recorded address is affected.

Dovecot accepts the client address that the proxy announces only from a trusted address. Add the proxy's address to `login_trusted_networks`, and to `smtpd_authorized_xclient_hosts` in Postfix, as described in [Trusting the proxy to announce the real client](/docs/migration/guide/configure-source/dovecot-postfix/#trusting-the-proxy-to-announce-the-real-client).

## Split delivery and relaying

For each entry in this group, the cause is confirmed in two logs. The new deployment's log shows the reply to each recipient and, for relayed messages, the delivery attempts to the `source` route together with the source's reply. The source's mail log shows whether it accepted or refused the relay, and why.

### Mail for an account on the source is rejected with "Mailbox does not exist"

The new deployment rejects a message for an account that still lives on the source with `550 5.1.1 Mailbox does not exist.`, at the recipient stage.

The domain on the new deployment does not allow relaying, so the new deployment rejects recipients that have no account. Enable `allowRelaying` on the domain, as described in [Enabling relaying for split delivery](/docs/migration/guide/configure-new/#enabling-relaying-for-split-delivery).

### Mail for accounts on the source arrives in a catch-all mailbox

Mail for accounts that have not moved is delivered on the new deployment, all to one mailbox, and never reaches the source.

The domain has a catch-all address on the new deployment, which takes precedence over relaying. Remove the catch-all address until the last account has moved.

### Relay to a Stalwart source stalls

The new deployment connects to the source to relay a message, and the delivery either hangs after the connection or fails because the reply cannot be parsed.

The source's port 25 listener expects a PROXY header, which the new deployment does not send. On a Stalwart source, port 25 must be the one listener without trusted networks. Check that the `smtp` listener has no per-listener value, and that no server-wide list applies to it (`server.proxy.trusted-networks` on Stalwart 0.15, `proxyTrustedNetworks` in SystemSettings on Stalwart 0.16). Then restart the source.

### Relay rejected with "Invalid EHLO domain"

The source rejects the relay with `550 5.5.0 Invalid EHLO domain.` (Stalwart), or with a similar reply (Postfix with `reject_non_fqdn_helo_hostname`).

The new deployment greets with its own host name, which is often an internal name, and the source refuses names that are not fully qualified. The fix depends on the source:

- On a Stalwart 0.15 source, set `session.ehlo.reject-non-fqdn` to `false`.
- On a Stalwart 0.16 source, set the `rejectNonFqdn` expression of `MtaStageEhlo` to `false`, with an empty `match`.
- On Postfix, exempt the new deployment from `reject_non_fqdn_helo_hostname`.

### Relayed mail is rejected or classified as spam by the source

The source evaluates SPF, DKIM, DMARC, ARC or reverse DNS for relayed mail. It sees the new deployment as the sending host, and the checks fail.

On a Stalwart source, disable the inbound checks as described in [Trusting mail relayed from the new deployment](/docs/migration/guide/configure-source/previous-stalwart#trusting-mail-relayed-from-the-new-deployment). On Stalwart 0.16, a check that still applies on port 25 after the change was updated without an empty `match`.

On a Dovecot and Postfix source, exempt the new deployment's address from the checks in Postfix and in the milter, as described in [Accepting mail relayed from the new deployment](/docs/migration/guide/configure-source/dovecot-postfix/#accepting-mail-relayed-from-the-new-deployment).

### Outbound mail of the source is rejected with "Relay not allowed"

When the source sends its outbound mail through the new deployment, the new deployment rejects it with `550 5.7.1 Relay not allowed.` Repeated rejections can also ban the source's address.

With its default `allowRelaying` expression, the new deployment relays to remote domains only for authenticated sessions. Allow the source's address as described in [Relaying outbound mail for the source](/docs/migration/guide/configure-new/#relaying-outbound-mail-for-the-source).

## Moving accounts

### A new account rejects its correct password

An account just created on the new deployment refuses its password. Two causes are common:

- The new deployment cached the absence of the account before it was created, and the cache entry has not expired. Run the `InvalidateNegativeCaches` action after creating accounts, as described in [Creating the account on the new deployment](/docs/migration/guide/migrate-accounts/#creating-the-account-on-the-new-deployment).
- The password was created from a hash in a format that the new deployment does not recognise, such as one with Dovecot's `{SHA512-CRYPT}` prefix, and was hashed again as if it were a plaintext password. Recreate the credential with the prefix removed or replaced by `{CRYPT}`.

To tell the two apart, sign in once against the new deployment's internal address after running the action. If the login still fails, the stored password is wrong.

### An account reaches the wrong server, or a bare-name login fails

The proxy routes by the exact login that the client presents, after the normalisation configured in the mapping store. An account that signs in sometimes with its address and sometimes with a bare name therefore needs a mapping entry for each form, or one of them resolves to the source.

To see how a login resolves, call `GET /mappings?identifier=<login>` on the management API. It also shows whether the result is cached, and whether it falls through to the default destination.

### An administrative tool reaches the wrong server

For a source running a previous Stalwart version, Vandelay runs through the proxy as the administrator, and is routed by the administrator's mapping entry. That entry points at the source while reading and at the new deployment while writing. A tool that works on the wrong server finds the entry pointing at the other one. `GET /mappings?identifier=admin` shows its current value.

### Calendar or contact clients receive "404 Not Found" after an account moves

A CalDAV or CardDAV client of a moved account receives `404 Not Found`.

Its collection URL contains a bare account name, such as `/dav/cal/alice/`, which the new deployment does not resolve. Change the URL to the address form, `/dav/cal/alice%40example.org/`, or set the client up again from the server name, as described in [Login names after migration](/docs/migration/guide/migrate-accounts/#login-names-after-migration).

On mailcow, a client configured with a SOGo collection URL, such as `/SOGo/dav/alice@example.org/Calendar/personal/`, receives `404 Not Found` for the same reason. The proxy routes the request of a moved account to the new deployment, which has no such path. Reconfigure the client in the same way.

### A client of a moved account still reaches the source over HTTP

A JMAP client of a moved account keeps seeing the account's state on the source.

The client authenticates with an OAuth access token issued by the Stalwart 0.15 source. Such tokens do not contain the account name, so the proxy cannot route the requests, and sends them to the fallback destination, the source. Signing in again does not help while the source is the fallback destination, because the client discovers the source's authorisation server and obtains a new token from the source.

Until the fallback destination is the new deployment, users of moved accounts sign in from such clients with an [app password](/docs/auth/authentication/app-password) created on the new deployment. The proxy routes a password login by the account, to the account's destination.

### A JMAP client or Vandelay connects to a server directly

A client that follows the URL advertised by a server leaves the proxy when that URL is the server's own address, and its requests are no longer routed by the mapping. A tool running on the proxy host is even refused, because the server expects a PROXY header from that address.

Both Stalwart servers must advertise the public hostname:

- The new deployment, through `STALWART_PUBLIC_URL`
- A Stalwart 0.15 source, through `http.url`
- A Stalwart 0.16 source, through `STALWART_PUBLIC_URL` or its default host name

To check, fetch the session object of each server, and confirm that its `apiUrl` starts with the public hostname. A Dovecot and Postfix source serves no JMAP, and Vandelay reads it directly by design.

### Aliases, sharing or settings are missing after an account moves

The account's messages and folders arrived, but its additional addresses, the access rights it granted to others, its vacation reply or its app passwords did not.

This is expected: Vandelay copies an account's data, not its account properties. [Items not carried over](/docs/migration/guide/#items-not-carried-over) lists each such item and how it is recreated.

### Changes made on the source before the switch are missing

Messages that were marked as read, moved or deleted on the source after the initial copy, or events and contacts edited there, appear in their earlier state on the new deployment.

The catch-up pass adds new objects, and does not change objects already copied. Keep the time between the initial copy and the switch short, as described in [Copying what changed](/docs/migration/guide/migrate-accounts/#copying-what-changed).

## Copying data with Vandelay

### Vandelay is throttled or its host is banned

A Vandelay run fails with exit code 2 after many successful requests, and the new deployment logs `limit.too-many-requests` events. Alternatively, every connection from the Vandelay host is suddenly refused.

The run exceeded the rate limit for authenticated requests, or failed sign-ins from the host triggered the automatic ban. Raise the rate limit and add the Vandelay host to the allowed addresses, as described in [Preparing for bulk import](/docs/migration/guide/configure-new/#preparing-for-bulk-import).

The users' passwords are not a cause. Vandelay signs in once per run as an administrator and acts on each account through it, so it does not need them.

### Vandelay warns that the session advertises a different origin

<!-- include:session-urls -->
The address given to `--url` is only where Vandelay fetches the JMAP session. After fetching it, Vandelay sends its requests to the API, upload and download URLs that the session advertises, as JMAP requires of a client.

Some servers serve their API and their blobs from different hosts, so an advertised URL with an origin (scheme, host and port) other than that of `--url` is not an error. Vandelay prints a warning such as the following, and continues with the advertised URL:

```text
warning: session advertises apiUrl, uploadUrl, downloadUrl on https://mail.example.org (connected to https://mail.example.org:10443); vandelay must use the advertised URL. If this is wrong, fix the server's advertised HTTP URL setting.
```

The usual cause of this warning is a server that is reachable on a port other than 443 but advertises URLs without that port. Requests then reach whatever else listens on port 443, and fail, often with `404 Not Found`. Vandelay stops with exit code 2 at the first data type.

The fix is on the server: its public URL must be the full address that clients use, including the port. On Stalwart, the public URL is set with the [`STALWART_PUBLIC_URL`](/docs/configuration/environment-variables) environment variable.
<!-- /include:session-urls -->

### Files are missing after a JMAP import from a Stalwart source

A JMAP import from a Stalwart 0.15 or 0.16 source copies mail, contacts and calendars but no files, and ends with exit code 5. The warning differs by release:

- A Stalwart 0.15 source makes the import print `warning: type FileNode aborted: <error>; continuing (run will exit 5)`.
- A Stalwart 0.16 source makes it print `` warning: FileNode <id> skipped: json error: missing field `@type` `` for every file.

Both releases implement earlier drafts of the JMAP file storage specification, which Vandelay does not track. Leave files out of the JMAP import with `--objects`, and read them with `vandelay import webdav` into the same archive, as described in [Making the initial copy](/docs/migration/guide/migrate-accounts/#making-the-initial-copy).

### Writing files back to a Stalwart 0.15 source fails

When an account is rolled back to a Stalwart 0.15 source, writing files fails with an error about an invalid property. Mail, mailboxes, Sieve scripts, contacts and calendars are written back without this problem.

Stalwart 0.15 does not accept the files that Vandelay writes over JMAP. Copy the files created on the new deployment after the switch back to the source by hand, over WebDAV.

### A configuration change on a Stalwart source has no effect

A setting changed on a Stalwart 0.15 or 0.16 source does not take effect after a reload.

Some settings are applied only when the process restarts: the listener settings, including the trusted networks of the PROXY protocol, and on Stalwart 0.16 the environment variables. Other settings apply on a reload. Restart the source through its service manager.

A Dovecot and Postfix source has no such distinction: its changes apply on `doveadm reload` and `postfix reload`.
