---
sidebar_position: 5
title: "Troubleshooting"
---

Most problems with the proxy fall into one of a few categories: a configuration that fails validation at startup, an account that routes to the wrong place, a backend that cannot be reached, or a TLS negotiation that fails on one of the legs. This page lists the common symptoms and how to resolve them. The [management API](/docs/migration/proxy/management/api) and the logs described under [observability](/docs/migration/proxy/management/observability) are the primary diagnostic tools.

## The proxy refuses to start

The configuration is validated in full at startup, and any problem aborts the launch with a message naming the cause. Common validation failures and their remedies are:

- **Undeclared default destination.** `routing.default_destination` must name a destination that exists. Check for a typo in the name.
- **A listener's protocol is not offered by the default destination.** Every interactive protocol a listener accepts must be declared under the default destination's `protocol` table, because unmapped accounts fall through to it. Add the missing protocol endpoint.
- **Plaintext credentials without an override.** A destination that exposes a credential-bearing protocol with `tls = "plain"` is rejected unless `allow_plaintext_auth = true` is set. Either secure the backend leg or set the override if the leg is already protected by other means.
- **TLS to an IP host without a server name.** A destination whose `host` is an IP address and which has a TLS leg must also set `tls_server_name`, since an IP cannot be verified against a certificate. Add the expected name.
- **A pass-through listener using STARTTLS.** SMTP and LMTP listeners cannot use `tls = "starttls"`; use `plain` or `implicit`.
- **A mapping source without its section.** Selecting `source = "redis"` or `source = "sql"` requires the corresponding `[mapping.redis]` or `[mapping.sql]` section.
- **A mapping file referencing an unknown destination.** Every destination named in the file source must be declared in the configuration.

A `POST /config/reload` performs the same validation against an edited file and reports the cause without disturbing the running instance, which is a convenient way to check a change before committing to it.

## An account routes to the wrong destination

Query `GET /mappings?identifier=<id>` to see exactly how an account resolves, including the normalized form, the destination, whether it is falling through to the default, and whether the answer is cached. The usual causes are:

- **A stale cache entry.** If the mapping was changed but the account still routes to the old destination, the cached entry has not yet expired. Invalidate it with `POST /cache/invalidate?identifier=<id>`.
- **The file source was edited but not reloaded.** The file is read into memory at startup; after editing it, issue `POST /mappings/reload`.
- **A normalization mismatch.** With `normalize = "lowercase"`, mappings must be stored in lowercase; an entry written with mixed case will never match a normalized lookup.
- **A master-user suffix.** If logins carry a master-user suffix, confirm that `master_user_separators` lists the separator in use, so the identifier is derived from the mailbox rather than the full login string.

## A backend cannot be reached

When connections to a destination fail, `GET /destinations` shows its consecutive-failure count and whether the circuit breaker has marked it down. A destination marked down rejects new connections immediately for `host_down_cooldown`; the first connection after the cooldown probes it again. After resolving the underlying outage, `POST /destinations/reset?destination=<id>` returns it to service without waiting.

Clients see a protocol-appropriate temporary-failure response while a backend is unavailable (for example a `421` for submission or an `[UNAVAILABLE]` response for IMAP), rather than an authentication error, so a temporary-failure at login generally points at the backend rather than the credentials.

## TLS negotiation fails

TLS is negotiated separately on the client leg and the backend leg, so it helps to determine which is failing.

- **Backend certificate not trusted.** By default the backend's certificate is verified against the platform trust store using `tls_server_name` (or `host`). A self-signed or privately issued backend certificate will fail this check; pin it with `tls_pinned_cert_sha256`, or as a last resort on a trusted network set `tls_allow_invalid_certs`.
- **Server-name mismatch.** If the backend certificate does not cover the configured `tls_server_name`, verification fails; set the name to one the certificate actually carries.
- **STARTTLS not advertised by the backend.** A `starttls` backend leg requires the backend to advertise and accept the upgrade; if it does not, the connection is aborted rather than continuing in cleartext. Confirm the backend offers STARTTLS on that port, or switch the leg to `implicit` or `plain` as appropriate.
- **Client cannot validate the proxy's certificate.** On the client leg, ensure a real certificate and a default are configured; when nothing matches the requested name and no default is set, the proxy presents a self-signed certificate that clients will not trust.

## The PROXY protocol is not honored

If the proxy sits behind a load balancer and client addresses appear as the load balancer's address, the listener must enable inbound PROXY protocol handling with `proxy_protocol` set to `optional` or `required`, and the load balancer's address range must be listed in `proxy_trusted`. A header from an address outside the trusted ranges is ignored, by design, to prevent address spoofing.

## A routing loop is reported

The proxy aborts a connection it detects would loop, either because a destination endpoint coincides with one of its own listeners or because the forwarded time-to-live has been exhausted across a chain of proxies. Check that no destination points back at an address and port the proxy itself binds, and that chained proxies are not configured in a cycle.
