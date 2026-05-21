---
sidebar_position: 2
title: "Challenge Types"
---

ACME validates control of a domain through a challenge. The ACME server issues a token, the ACME client (in this case Stalwart) proves it can respond to that token on behalf of the domain, and the server then issues or renews the certificate. Stalwart supports four challenge types, each suited to a different deployment:

- **HTTP-01**: the server answers a challenge HTTP request on port 80. Suitable when the host already serves HTTP.
- **DNS-01**: the server publishes a per-validation TXT record in the domain's DNS zone, then removes it once validation succeeds. Suitable when DNS can be updated under automation.
- **DNS-PERSIST-01**: the domain owner publishes a long-lived TXT record that grants an ACME account standing permission to issue certificates for the domain. The record stays in place across renewals and no per-renewal DNS write is needed. Defined in [draft-ietf-acme-dns-persist](https://datatracker.ietf.org/doc/draft-ietf-acme-dns-persist/). Suitable when coordinating real-time DNS updates is impractical (IoT, edge or multi-tenant deployments, batched issuance, strict DNS change-management workflows).
- **TLS-ALPN-01**: the server presents a purpose-built TLS certificate on port 443 using the ACME-specific ALPN protocol. Suitable when HTTP traffic is restricted but TLS is reachable.

Wildcard certificates are supported only by the two DNS-based challenges (DNS-01 and DNS-PERSIST-01).

## HTTP-01

The HTTP-01 challenge proves control of a domain by serving a token over HTTP.

Steps:

- **Token creation**: the ACME server generates a token and sends it to Stalwart.
- **Response file**: Stalwart builds a response consisting of the token and a key authorization derived from the token and the server's ACME account key.
- **File placement**: the response is served at `http://<DOMAIN>/.well-known/acme-challenge/<TOKEN>` on port 80.
- **Verification**: the ACME server retrieves the URL. If the response matches, the domain is validated.

Considerations:

- The domain must resolve publicly to the host serving the challenge response.
- Port 80 must accept inbound connections.
- HTTP-01 cannot validate a wildcard domain.

## DNS-01

The DNS-01 challenge proves control of a domain by publishing a TXT record.

Steps:

- **Token creation**: the ACME server sends a token to Stalwart.
- **Record creation**: Stalwart derives a key authorization from the token and publishes it as a TXT record at `_acme-challenge.<DOMAIN>`.
- **Record value**: the TXT record's value is the SHA-256 digest of the token combined with the server's ACME account key.
- **Verification**: the ACME server queries DNS for the TXT record. If the value matches, the domain is validated.

Considerations:

- DNS changes must propagate before verification can succeed, which may take minutes.
- DNS-01 works even when the host is not reachable over HTTP.
- Supports wildcard certificates (HTTP-01 and TLS-ALPN-01 do not).

## DNS-PERSIST-01

DNS-PERSIST-01 replaces the per-validation token model of DNS-01 with a long-lived authorization record. Instead of publishing a fresh TXT response for every issuance, the domain owner publishes once a TXT record that names the issuer and the ACME account permitted to act for the domain; the CA then honours that authorization on every subsequent issuance and renewal.

Steps:

- **Authorization record**: the domain owner publishes a TXT record at `_validation-persist.<DOMAIN>` whose value follows the `issue-value` syntax from [RFC 8659](https://datatracker.ietf.org/doc/html/rfc8659) (the same grammar used by CAA), naming the issuer and carrying an `accounturi=` parameter that pins the record to one ACME account. Example: `authority.example; accounturi=https://ca.example/acct/123`.
- **Validation**: when Stalwart requests a certificate, the CA queries the TXT record. If the issuer matches and the `accounturi` matches the account making the request, the authorization succeeds and the certificate is issued.
- **Renewal**: subsequent renewals reuse the same record. No DNS write and no propagation wait is involved at renewal time.

Considerations:

- The record binds the authorization to the ACME account URI, not to the account key, so account-key rotation does not invalidate it.
- An optional `persistUntil=` parameter caps the lifetime of the authorization; once it expires the record is no longer honoured.
- Wildcard issuance requires an explicit `policy=wildcard` parameter on the record. Without it the record authorizes only the listed domain.
- The persisted record delegates ongoing issuance to the configured ACME account. An attacker who compromises that account key can issue certificates against every DNS-PERSIST-01 record bound to it without further DNS access; the account key is the security boundary and must be protected accordingly.

## TLS-ALPN-01

The TLS-ALPN-01 challenge proves control of a domain over TLS by negotiating a dedicated ACME ALPN protocol identifier and presenting a purpose-built certificate.

Steps:

- **Token creation**: the ACME server sends a token to Stalwart.
- **Certificate generation**: Stalwart creates a self-signed certificate whose Subject Alternative Name carries the token and the ACME OID.
- **TLS response**: Stalwart serves the certificate on port 443 when the client negotiates the `acme-tls/1` ALPN identifier.
- **Verification**: the ACME server connects, negotiates the ALPN protocol, and validates the presented certificate.

Considerations:

- Requires TLS-level configuration that is more involved than HTTP-01.
- Port 443 must accept inbound connections.
- Works where HTTP traffic is restricted or where DNS changes are not feasible.

## Choosing the right challenge

The challenge type depends on which ports are reachable, whether wildcard certificates are needed, and whether DNS can be updated from automation.

### HTTP-01

Pick HTTP-01 when port 80 is reachable from the internet and no wildcard is required. It has the simplest setup and needs no DNS automation.

- Advantages: simple; no DNS management needed.
- Disadvantages: no wildcard support; requires port 80 open to the internet.

### TLS-ALPN-01

Pick TLS-ALPN-01 when port 443 is reachable from the internet, port 80 is not, and no wildcard is required.

- Advantages: works when HTTP is blocked; uses the already-required HTTPS port.
- Disadvantages: no wildcard support; does not work through certain reverse proxies or firewalls. Use DNS-01 or HTTP-01 in those cases.

### DNS-01

Pick DNS-01 when wildcard certificates are required, or when neither port 80 nor port 443 is reachable from the public internet.

- Advantages: supports wildcards; needs no public port open.
- Disadvantages: requires DNS update automation; validation waits for DNS propagation.

### DNS-PERSIST-01

Pick DNS-PERSIST-01 when DNS automation is available but coordinating per-renewal DNS writes is impractical: IoT or edge deployments without real-time DNS access, multi-tenant or hosted platforms where DNS is managed by a separate party, batched or pre-validated issuance, or zones with strict change-management workflows.

- Advantages: a single persistent authorization record covers all renewals, with no DNS write or propagation wait on renewal; survives ACME account-key rotation; supports wildcards via `policy=wildcard`.
- Disadvantages: leaves a long-lived `_validation-persist` TXT record in the zone that delegates issuance to the configured ACME account; loss or compromise of that account key allows certificates to be issued against every persisted authorization without further DNS access.
