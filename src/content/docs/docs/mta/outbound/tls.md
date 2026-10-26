---
sidebar_position: 6
title: "TLS"
description: "TLS strategies for outbound delivery: when STARTTLS, DANE and MTA-STS are used or required, certificate validation, timeouts, retrying servers with broken TLS, and the events that show what happened."
---

Mail travelling between servers is only as private as the connection that carries it. SMTP between servers starts unencrypted, and the sending server upgrades the connection with `STARTTLS` when the receiving server offers it. An attacker on the network path can defeat this upgrade, for example by removing the offer ([Transport security](/docs/mta/transport-security/)). TLS strategies decide how much encryption and authentication Stalwart insists on when it delivers, and therefore how it balances protection against the ability to reach every server.

Two mechanisms let a recipient domain publish that its servers support TLS, and how senders must authenticate them. [DANE](/docs/mta/transport-security/dane) publishes the servers' certificates in TLSA records, in a DNS zone signed with DNSSEC. [MTA-STS](/docs/mta/transport-security/mta-sts) publishes a policy over HTTPS. A TLS strategy decides how strictly Stalwart applies each of these, and plain `STARTTLS`, when it delivers a message.

Each strategy is an [MtaTlsStrategy](/docs/ref/object/mta-tls-strategy) object (found in the WebUI under <!-- breadcrumb:MtaTlsStrategy --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Outbound › TLS Strategies<!-- /breadcrumb:MtaTlsStrategy -->). The `tls` expression of the [outbound strategy](/docs/mta/outbound/strategy) selects one for each remote host. A new installation has two strategies:

- `default`, which validates certificates
- `invalid-tls`, which accepts invalid certificates, and which the default expression selects when the previous attempt failed with a TLS error

## STARTTLS, DANE and MTA-STS

[`startTls`](/docs/ref/object/mta-tls-strategy#starttls), [`dane`](/docs/ref/object/mta-tls-strategy#dane) and [`mtaSts`](/docs/ref/object/mta-tls-strategy#mtasts) each take one of three values. By default, `startTls` is <!-- default:MtaTlsStrategy.startTls -->`optional`<!-- /default -->, `dane` is <!-- default:MtaTlsStrategy.dane -->`optional`<!-- /default --> and `mtaSts` is <!-- default:MtaTlsStrategy.mtaSts -->`optional`<!-- /default -->. The following table shows what each value means for each mechanism:

| Value | `startTls` | `dane` | `mtaSts` |
|---|---|---|---|
| `optional` | Use `STARTTLS` when the server offers it; otherwise deliver unencrypted. | Look up TLSA records for MX hosts in DNSSEC-signed zones and, when they exist, require a certificate that matches them. | Fetch the domain's policy and, when its mode is `enforce`, deliver only to the hosts it lists, over validated TLS. |
| `require` | Deliver only when `STARTTLS` succeeds. | Deliver only to hosts with valid TLSA records. | Deliver only when a policy can be fetched, and apply it. |
| `disable` | Never use TLS. | Make no TLSA lookups. | Fetch no policies. |

With all three at `optional`, Stalwart applies every policy that a recipient domain publishes, and falls back to opportunistic TLS for the domains that publish none. This is what RFC 7672 and RFC 8461 expect of a sending server.

`optional` does not mean that a published policy can be ignored. A domain's published policy is binding even under `optional`: when its TLSA records exist, or its MTA-STS policy is in `enforce` mode, a host that fails them is not delivered to.

`require` goes further, and is intended for selected destinations, such as a partner whose servers are known to support DANE. Applied to all mail, it fails delivery to the many domains that publish neither DANE nor MTA-STS. The `require` value of `dane` also cannot be combined with [relay routes](/docs/mta/outbound/routing#tls-on-relay-hops).

A sender can also ask for encryption for an individual message, with the `REQUIRETLS` parameter ([RFC 8689](https://www.rfc-editor.org/rfc/rfc8689)). Such a message is delivered only over an encrypted connection, whatever the strategy. Stalwart does not apply the other requirements that RFC 8689 places on a sending server. The server certificate is validated only as the TLS strategy and the route allow (see [Certificate validation](#certificate-validation)). A server that does not advertise `REQUIRETLS` receives the message without the parameter, and no non-delivery report is sent.

The following strategy requires TLS, DANE and MTA-STS for a partner:

```json
{
  "name": "partner-strict",
  "startTls": "require",
  "dane": "require",
  "mtaSts": "require"
}
```

The strategy is selected for the partner's domain with the following `tls` expression. The MTA-STS setting is taken from the evaluation made for the recipient domain, before the MX hosts are known ([Strategies](/docs/mta/outbound/strategy#strategy-expressions)). The condition therefore tests `rcpt_domain`, not `mx`:

```json
{
  "tls": {
    "match": {
      "0": {"if": "rcpt_domain == 'partner.example'", "then": "'partner-strict'"},
      "1": {"if": "retry_num > 0 && last_error == 'tls'", "then": "'invalid-tls'"}
    },
    "else": "'default'"
  }
}
```

DANE depends on the DNS resolver. It needs a resolver that validates DNSSEC and can be reached over TCP. At start-up, Stalwart tests the configured resolver. When the resolver cannot validate DNSSEC, DANE is disabled and the warning `The configured DNS resolver cannot validate DNSSEC. DANE has been disabled to avoid deferring mail. Ensure the resolver is DNSSEC-capable and reachable over TCP.` is reported. [DANE](/docs/mta/transport-security/dane) describes the requirements.

## Certificate validation

Certificate validation decides whether Stalwart only encrypts the connection, or also confirms that it is talking to the right server. [`allowInvalidCerts`](/docs/ref/object/mta-tls-strategy#allowinvalidcerts) is <!-- default:MtaTlsStrategy.allowInvalidCerts as=enabled -->disabled<!-- /default --> by default. In that state, a server whose certificate does not validate, because it is self-signed, expired or issued for another name, fails the TLS handshake, and the delivery attempt fails.

Many mail servers on the internet present such certificates. For this reason the default outbound strategy retries a failed TLS delivery with the `invalid-tls` strategy. That strategy sets `allowInvalidCerts` to `true`, so it encrypts the connection without authenticating the server. This matches the opportunistic TLS that most sending servers use when no DANE or MTA-STS policy applies.

Published policies take precedence over this setting. `allowInvalidCerts` is ignored for hosts covered by an MTA-STS policy in `enforce` mode, and for hosts authenticated through DANE: their certificates are always validated.

Some servers cannot be reached over TLS at all. Stalwart's TLS implementation does not support SSL, TLS 1.0 and 1.1, or obsolete cipher suites, so a server that offers nothing else fails the handshake even with `allowInvalidCerts`. To reach such a server, a strategy with `startTls` set to `disable` delivers without encryption. The following `tls` expression falls back to it after two failed TLS attempts:

```json
{
  "tls": {
    "match": {
      "0": {"if": "retry_num > 1 && last_error == 'tls'", "then": "'no-tls'"},
      "1": {"if": "retry_num > 0 && last_error == 'tls'", "then": "'invalid-tls'"}
    },
    "else": "'default'"
  }
}
```

The `no-tls` strategy that the expression names disables `STARTTLS`:

```json
{
  "name": "no-tls",
  "startTls": "disable"
}
```

The conditions are evaluated in order, so the more specific one comes first. Otherwise the `invalid-tls` branch would match every retry after a TLS error, and the `no-tls` branch would never be reached.

## Timeouts

TLS adds steps to a delivery, and two timeouts keep a slow remote server from holding those steps open:

| Field | Default | Limit |
|---|---|---|
| [`tlsTimeout`](/docs/ref/object/mta-tls-strategy#tlstimeout) | <!-- default:MtaTlsStrategy.tlsTimeout -->3 minutes<!-- /default --> | The TLS handshake. |
| [`mtaStsTimeout`](/docs/ref/object/mta-tls-strategy#mtaststimeout) | <!-- default:MtaTlsStrategy.mtaStsTimeout -->5 minutes<!-- /default --> | Fetching an MTA-STS policy over HTTPS. |

## Troubleshooting TLS failures

Each step of a delivery is logged as an event, so the log shows where a TLS delivery failed. The failures are logged at the `info` level:

- `delivery.start-tls-unavailable`: the server does not offer `STARTTLS`
- `delivery.start-tls-error` and `delivery.implicit-tls-error`: the handshake failed
- `dane.authentication-failure` and `dane.tlsa-record-invalid`
- `mta-sts.not-authorized`: the host is not in the domain's policy
- `mta-sts.policy-fetch-error` and `mta-sts.invalid-policy`

The routine steps are logged at the `debug` level only. Among them are `delivery.attempt-start`, `delivery.connect`, `delivery.start-tls`, `delivery.completed`, `dane.tlsa-record-not-dnssec-signed`, `mta-sts.policy-fetch`, `mta-sts.authorized`, `mta-sts.policy-not-found` and `tls-rpt.record-fetch`. Following a delivery step by step therefore requires a tracer at that level ([Telemetry](/docs/telemetry/)).

The error of the last attempt is also recorded with each recipient of a queued message ([Queue management](/docs/mta/management)).
