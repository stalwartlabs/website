---
sidebar_position: 5
title: "Troubleshooting"
description: "Causes and fixes for a proxy that does not start, accounts routed to the wrong destination, unreachable backends, TLS failures and loops."
---

Most problems with the proxy fall into a few groups:

- A configuration rejected at startup
- An account routed to the wrong destination
- A backend that cannot be reached
- A TLS negotiation that fails on one of the two connections

The [management API](/docs/migration/proxy/management/api) and the logs described under [observability](/docs/migration/proxy/management/observability) are the diagnostic tools. Problems specific to a migration, such as split delivery, are covered by the [migration guide's troubleshooting](/docs/migration/guide/troubleshooting/) page.

## Proxy does not start

The configuration is validated at startup, and the error is reported in one of two ways. An error found while the file is parsed stops the proxy with `invalid configuration: configuration error: <message>`. Errors found later in the startup are logged as a `fatal error` line. Examples of the latter are an unreadable mapping file, an unreachable or invalid mapping store, a short management token, and an unreadable certificate. The common causes are:

- **The default destination is not declared.** `routing.default_destination` must name a declared destination (`undeclared destination "<name>"`).
- **The default destination lacks a protocol.** Every mail protocol (IMAP, POP3, ManageSieve, submission) that a listener accepts must be declared on the default destination, because accounts without a mapping go there.
- **Credentials over plaintext.** A destination that declares a protocol carrying credentials with `tls = "plain"` is rejected (`destination "<name>" protocol <p> uses plaintext TLS but carries credentials; set allow_plaintext_auth to override`). Encrypt the connection, or set the override if it is protected by other means.
- **TLS to an IP address without a server name.** A destination whose `host` is an IP address and which uses TLS must set `tls_server_name`.
- **STARTTLS on a pass-through listener.** SMTP and LMTP listeners cannot use `tls = "starttls"`. Use `plain` or `implicit`.
- **No pass-through destination.** An SMTP or LMTP listener requires `routing.smtp_passthrough_destination`.
- **An HTTP route names an unusable destination.** The `destination` and `fallback` of each `[[http.route]]` must name a declared destination with the `http` protocol (`http route fallback "<name>" does not declare the http protocol`).
- **A mapping store without its table.** `source = "redis"` and `source = "sql"` require `[mapping.redis]` and `[mapping.sql]`. A `rediss://` Redis URL is rejected as `invalid redis url`.
- **The mapping file is missing, names an unknown destination, or has a line with a single field.** The file must exist at startup, even when it holds no entries yet. Every destination named in it must also declare the mail protocols of the listeners (`mapped destination ... does not declare protocol ...`).
- **The management token is missing or short** (`admin requires bearer_token_file, bearer_token, or PROXY_ADMIN_TOKEN`, `admin token is shorter than min_token_len (<n>)`).

Some mistakes do not stop the proxy. Unknown keys are not reported: a misspelled key is ignored, and takes its default value. When a setting seems to have no effect, check its spelling against the reference pages. A listener whose address cannot be bound is logged and skipped, while the proxy keeps running with its other listeners.

`POST /config/reload` runs the same validation on an edited file, and reports the error without affecting the running proxy. This makes it a way to check a change before relying on it.

## An account is routed to the wrong destination

Start with `GET /mappings?identifier=<identifier>`. It shows how an account resolves: its normalised form, the destination, whether that is the default destination, and whether the result was cached. The usual causes are:

- **A cached lookup.** The store changed, but the account still resolves to its previous destination until the cache entry expires. Invalidate it with `POST /cache/invalidate?identifier=<identifier>`.
- **The mapping file was edited but not reloaded.** The file is held in memory, so reload it with `POST /mappings/reload`.
- **A case mismatch in Redis or SQL.** With `normalize = "lowercase"`, the proxy looks up the lowercased identifier, so entries written directly to Redis or SQL must be lowercase. The file store lowercases its entries itself.
- **A master user suffix.** When logins carry a master user suffix, `master_user_separators` must list the separator, so that the identifier is the mailbox owner and not the whole login.
- **A bare name and an address.** The proxy does not relate `alice` to `alice@example.org`, so each login form needs its own entry.

## A backend cannot be reached

When connections to a destination fail, `GET /destinations` shows its failure count, and whether the circuit breaker marked it down. A destination marked down refuses new connections for `server.host_down_cooldown`. After that, the next connection probes it. Once the cause is fixed, `POST /destinations/reset?destination=<name>` returns it to service at once.

The failure count does not always point at the backend. A count that climbs while `failure_sources` stays at 1 and `host_level_failure` is false points at one client. The backend has usually banned that client's address, which the proxy forwards, and rejects every connection opened for it. The destination is not marked down in that case. The API does not report the client's address, but the proxy log does, in the `peer` field of the connection, unless the proxy itself sits behind a load balancer.

The response that clients receive also helps. While a backend is unreachable, mail clients receive the protocol's temporary failure response (for example `421` in submission, or `[UNAVAILABLE]` in IMAP), not an authentication error. A temporary failure at sign-in therefore points at the backend, not at the credentials. HTTP clients receive `502 Bad Gateway`, and pass-through SMTP connections are closed without a reply.

## TLS negotiation fails

TLS is negotiated separately with the client and with the backend, so the first step is to find out which side fails:

- **The backend's certificate is not trusted.** By default, the backend's certificate is verified against the platform's trust store, with `tls_server_name` or `host`. A self-signed or privately issued certificate fails. Pin it with `tls_pinned_cert_sha256`, or, on a trusted network only, set `tls_allow_invalid_certs`.
- **Name mismatch.** The backend's certificate must cover `tls_server_name`, so set it to a name the certificate carries.
- **The backend does not offer STARTTLS.** A `starttls` endpoint requires the backend to advertise and accept STARTTLS. Otherwise, the connection is closed, and never continued without encryption. Check the backend's port, or use `implicit` or `plain` as appropriate.
- **The backend does not expect a PROXY header.** A destination sends a PROXY header on every connection by default, including HTTP. A backend that does not expect one fails to read the connection, often reported as a TLS decode error. Set `forwarding` to the mode the backend understands, as described under [Destinations](/docs/migration/proxy/destinations#client-address-forwarding).
- **Clients do not trust the proxy's certificate.** Configure a certificate for the name that clients use. A single certificate is presented for every name. With several, configure a default: when none matches and no default exists, the proxy presents a self-signed certificate.

## Client addresses are those of a load balancer

When the proxy sits behind a load balancer and the backends see the load balancer's address instead of the client's, the listener must accept the PROXY protocol, with `proxy_protocol` set to `optional` or `required`, and list the load balancer's network in `proxy_trusted`. With `optional`, a header from an address outside the trusted networks is ignored. With `required`, such a connection is rejected. Either way, clients cannot forge their address.

## A routing loop is refused

The proxy refuses two kinds of connection as loops:

- A connection to a destination whose `host` is an IP address that, with the endpoint's port, equals one of its own listeners (`proxying loop: destination is one of our own listeners`)
- Connections to backends announced with XCLIENT or IMAP `ID`, when `server.proxy_ttl` is 1 or less (`proxying loop: forwarded TTL exhausted`)

Check that no destination points back at an address that the proxy itself binds, and that `server.proxy_ttl` has its default value.

A destination given by host name that resolves to the proxy itself is not detected, so check host names when connections time out without reaching any backend.
