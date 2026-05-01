---
sidebar_position: 6
title: "TLS"
---

Stalwart uses TLS to secure message transmission over the internet. TLS (Transport Layer Security) provides encryption, authentication, and integrity for data in transit, preventing unauthorised access and tampering. Stalwart's TLS implementation is built on rustls, a high-performance TLS library.

A TLS strategy defines the transport-security policies and TLS settings that apply when Stalwart connects to remote mail servers. Where connection strategies control the basic mechanics of establishing a session, TLS strategies determine the security requirements for that session.

Each TLS strategy allows control over DANE enforcement, MTA-STS enforcement, STARTTLS handling, certificate validation, and TLS timeouts. TLS strategies are defined as [MtaTlsStrategy](/docs/ref/object/mta-tls-strategy) objects (found in the WebUI under <!-- breadcrumb:MtaTlsStrategy --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Outbound › TLS Strategies<!-- /breadcrumb:MtaTlsStrategy -->), and selected dynamically for each delivery via the TLS expression on [MtaOutboundStrategy](/docs/ref/object/mta-outbound-strategy); see [Strategies](/docs/mta/outbound/strategy).

## Policy enforcement

Transport-security policies on outbound connections are governed by three fields, each of which accepts one of `optional`, `require`, or `disable`:

- `optional`: use the mechanism when available, but do not require it.
- `require`: enforce the mechanism strictly; delivery fails if it cannot be used.
- `disable`: do not attempt to use the mechanism.

### DANE

[DANE](/docs/mta/transport-security/dane) (DNS-Based Authentication of Named Entities) allows SMTP clients to validate a recipient server's TLS certificate using DNSSEC-protected TLSA records. The [`dane`](/docs/ref/object/mta-tls-strategy#dane) field controls enforcement. When set to `require`, delivery only proceeds if the recipient publishes valid and verifiable TLSA records. When set to `optional` (the default), DANE validation is attempted when possible and the connection falls back to regular STARTTLS when no TLSA record is available.

```json
{
  "name": "secure",
  "dane": "require"
}
```

### MTA-STS

[MTA-STS](/docs/mta/transport-security/mta-sts) (Mail Transfer Agent Strict Transport Security) allows recipient domains to publish a required TLS policy over HTTPS. The [`mtaSts`](/docs/ref/object/mta-tls-strategy#mtasts) field controls enforcement. When set to `require`, Stalwart enforces the domain's published policy and refuses delivery if a secure connection cannot be negotiated. When set to `optional` (the default), the policy is used when it can be retrieved but delivery proceeds even if it cannot be validated.

```json
{
  "name": "default",
  "mtaSts": "optional"
}
```

### STARTTLS

STARTTLS upgrades a plaintext SMTP connection to a secure TLS connection. The [`startTls`](/docs/ref/object/mta-tls-strategy#starttls) field controls its use. When set to `require`, delivery only proceeds if the remote server supports STARTTLS and the handshake succeeds. When set to `disable`, STARTTLS is never attempted and delivery occurs over plaintext. The default is `optional`.

```json
{
  "name": "legacy",
  "startTls": "disable"
}
```

## Invalid certificates

The [`allowInvalidCerts`](/docs/ref/object/mta-tls-strategy#allowinvalidcerts) field controls how Stalwart handles invalid or misconfigured TLS certificates from remote hosts. When set to `false` (the default), connections to remote hosts that present an invalid TLS certificate are rejected, ensuring that communications are authenticated and trustworthy.

Some remote hosts have certificates that do not match their hostname or are otherwise invalid. Setting `allowInvalidCerts` to `true` lets Stalwart connect anyway, but the security implications must be weighed: accepting invalid certificates opens the connection to man-in-the-middle attacks. The recommended setting is `false` unless there is a specific, monitored reason to relax it.

## Timeouts

Timeouts for TLS-related operations are governed by [`tlsTimeout`](/docs/ref/object/mta-tls-strategy#tlstimeout) (maximum time to wait for the TLS handshake to complete, default 3 minutes) and [`mtaStsTimeout`](/docs/ref/object/mta-tls-strategy#mtaststimeout) (maximum time to wait for the MTA-STS policy lookup, default 5 minutes):

```json
{
  "tlsTimeout": "3m",
  "mtaStsTimeout": "3m"
}
```

## Examples

### Handling TLS errors

Stalwart can dynamically adjust TLS settings based on conditions encountered during outbound delivery. This is useful when dealing with remote hosts that have outdated or misconfigured TLS setups.

Because rustls deliberately excludes broken or obsolete protocols (SSL1/2/3, TLS 1.0/1.1) and cipher suites (RC4, DES, 3DES, EXPORT ciphers, MAC-then-encrypt, suites without forward secrecy, renegotiation, Kerberos, compression, discrete-log Diffie-Hellman, automatic protocol downgrades, AES-GCM with unsafe nonces), handshakes with poorly configured servers may fail. A common pattern is to define three MtaTlsStrategy objects, named for instance `default`, `invalid-tls`, and `disable-tls`, with progressively more relaxed settings, and to select between them through the TLS expression on [MtaOutboundStrategy](/docs/ref/object/mta-outbound-strategy). The expression branches on `retry_num` and `last_error == 'tls'` so that a first retry uses the `invalid-tls` strategy, a second retry uses `disable-tls`, and all other cases use the `default` strategy.

The TLS expression on MtaOutboundStrategy:

```json
{
  "tls": {
    "match": [
      {"if": "retry_num > 0 && last_error == 'tls'", "then": "'invalid-tls'"},
      {"if": "retry_num > 1 && last_error == 'tls'", "then": "'disable-tls'"}
    ],
    "else": "'default'"
  }
}
```

With the three paired MtaTlsStrategy objects:

```json
[
  {
    "name": "invalid-tls",
    "allowInvalidCerts": true,
    "startTls": "optional"
  },
  {
    "name": "disable-tls",
    "allowInvalidCerts": false,
    "startTls": "disable"
  },
  {
    "name": "default",
    "allowInvalidCerts": false,
    "startTls": "optional"
  }
]
```

This approach balances secure transmission against the reality of occasionally misconfigured servers. Operators should monitor how often the relaxed strategies are selected and treat the default as the primary policy.

### Strict transport security

TLS strategies can also enforce strict transport security for specific hosts. A dedicated `high-security` MtaTlsStrategy might set `allowInvalidCerts = false`, `dane = require`, `mtaSts = require`, and `startTls = require`. The TLS expression on MtaOutboundStrategy can branch on `mx == 'highly-secure.host.org'` to select this strategy and fall back to `default` otherwise. With this configuration, messages to the target host are delivered only over an authenticated and encrypted connection.

```json
{
  "tls": {
    "match": [{"if": "mx == 'highly-secure.host.org'", "then": "'high-security'"}],
    "else": "'default'"
  }
}
```

Paired with two MtaTlsStrategy objects:

```json
[
  {
    "name": "high-security",
    "allowInvalidCerts": false,
    "dane": "require",
    "mtaSts": "require",
    "startTls": "require"
  },
  {
    "name": "default",
    "allowInvalidCerts": false,
    "startTls": "optional",
    "mtaSts": "optional",
    "dane": "optional"
  }
]
```
