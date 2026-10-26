---
sidebar_position: 3
title: "MTA-STS"
description: "How Stalwart applies the MTA-STS policies of recipient domains when delivering mail: fetching and caching policies, what an enforce policy requires, restrictions on policy hosts, and bypassing a policy."
---

MTA Strict Transport Security ([MTA-STS](https://www.rfc-editor.org/rfc/rfc8461), RFC 8461) lets a domain declare that its mail servers accept TLS with certificates from public certificate authorities, and that senders must not deliver to them in any other way. Unlike DANE, it does not depend on DNSSEC: the policy itself is served over HTTPS, and the web server's certificate protects it.

A domain announces its policy with a TXT record at `_mta-sts.<domain>`, and serves the policy at `https://mta-sts.<domain>/.well-known/mta-sts.txt`. The policy holds three things: the MX host names that may receive the domain's mail, a mode, and how long senders may cache the policy. The mode decides what a sender does when a check fails:

- In `enforce` mode, a sender delivers only to a listed host, over TLS with a valid certificate.
- In `testing` mode, a sender delivers anyway and reports the failures.
- The mode `none` withdraws the policy.

This page describes how Stalwart applies the policies of other domains when it delivers mail. Publishing a policy for the domains that Stalwart hosts is described in [Publishing an MTA-STS policy](/docs/domains/mta-sts).

## Settings

The use of MTA-STS in delivery is set by [`mtaSts`](/docs/ref/object/mta-tls-strategy#mtasts) on the [TLS strategy](/docs/mta/outbound/tls) (found in the WebUI under <!-- breadcrumb:MtaTlsStrategy --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Outbound › TLS Strategies<!-- /breadcrumb:MtaTlsStrategy -->). The setting decides whether Stalwart fetches the policies of recipient domains and how it treats a domain without one. It is <!-- default:MtaTlsStrategy.mtaSts -->`optional`<!-- /default --> by default:

| Value | Effect |
|---|---|
| `optional` | Fetch the policy of each recipient domain that announces one, and apply it. When no policy can be fetched, apply the cached policy if an unexpired one exists, and otherwise deliver with opportunistic TLS. |
| `require` | Deliver only to domains whose policy can be fetched. Delivery to a domain without MTA-STS fails permanently. |
| `disable` | Fetch no policies. |

MTA-STS applies to MX delivery only, not to [relay routes](/docs/mta/outbound/routing#tls-on-relay-hops). The time allowed to fetch a policy is set by [`mtaStsTimeout`](/docs/ref/object/mta-tls-strategy#mtaststimeout).

## Fetching policies

Stalwart fetches a policy from `https://mta-sts.<domain>/.well-known/mta-sts.txt`. It caches the policy for the `max_age` that the policy declares, as long as that value lies between one hour and one year. Otherwise it caches the policy for one day.

The fetch is a request to a host that the recipient domain chooses, and the recipient domain may be controlled by an attacker. Stalwart therefore restricts the fetch:

- Only `https://` is used, without credentials, and redirections are not followed.
- The policy host must be a public domain name, and its addresses must be public. A host that resolves to a private, loopback or link-local address is refused.
- The policy may not exceed 1 MiB.

A cached policy is not kept forever. Stalwart fetches the policy again when the `id` in the domain's `_mta-sts` TXT record differs from the `id` of the cached policy.

A fetch can fail. When the TXT lookup fails, or the new policy cannot be fetched or parsed, Stalwart applies the unexpired cached policy, as RFC 8461 requires. After a failed fetch, Stalwart waits five minutes before it fetches the policy of that domain again. During that time, deliveries use the cached policy, or, when there is none, they are decided by the recorded failure. When several deliveries to the same domain need its policy at the same time, they share a single fetch.

Failures are logged as events. A refused or failed fetch is logged as `mta-sts.policy-fetch-error` with the reason, and an unparsable policy as `mta-sts.invalid-policy`. When no unexpired policy is cached, the failure decides the delivery, as in the following two cases:

- A policy host whose name is not under a public suffix, such as `mta-sts.example.lan`, is refused with `Host is not a public domain name`. Under `require`, the delivery fails permanently with `Policy host rejected`.
- A policy host that resolves only to private addresses cannot be reached. This happens in laboratory networks and with split-horizon DNS. Under `require`, the delivery is deferred and retried.

With `mtaSts` set to `optional`, delivery continues with opportunistic TLS in both cases.

## Validation under an enforce policy

When a policy in `enforce` mode applies to the recipient domain, Stalwart delivers the message only when all of the following conditions hold:

- The MX host name matches one of the `mx` patterns of the policy.
- The host offers `STARTTLS` and the TLS handshake succeeds.
- The host's certificate chains to a trusted certificate authority and is within its validity period.
- The certificate names the MX host name.

Otherwise the host is not delivered to. Whether Stalwart keeps trying depends on which condition failed:

- An MX host that the policy does not list (`mta-sts.not-authorized`), or one that does not offer `STARTTLS`, is a permanent failure. When no MX host qualifies, the message is returned to the sender at once.
- A failed TLS handshake or certificate check is a temporary failure. It is retried on the recipient's [schedule](/docs/mta/outbound/schedule) until the message expires.

Domains that request [TLS reports](/docs/mta/reports/tls) receive the failure in the next report. Policies in `testing` mode never prevent delivery.

## Invalid certificates and enforce policies

An enforcing policy overrides the TLS strategy's tolerance of invalid certificates. The [`allowInvalidCerts`](/docs/ref/object/mta-tls-strategy#allowinvalidcerts) setting has no effect on a domain whose policy is in `enforce` mode, and the domain's certificates are validated regardless.

This affects the default fallback for TLS errors. The default `tls` expression of the outbound strategy retries a delivery that failed with a TLS error under the `invalid-tls` strategy, which accepts invalid certificates. That fallback therefore applies only to domains that have neither an enforcing policy nor [DANE](/docs/mta/transport-security/dane).

Sometimes a domain publishes an enforcing policy but its servers' certificates cannot be fixed, for example a domain under the same administration. To deliver to such a domain, use a TLS strategy with `mtaSts` set to `disable` for it. The strategy must be selected with `rcpt_domain`. The reason is that the MTA-STS setting is taken from the evaluation of the `tls` expression made for the recipient domain, before the MX hosts are known.

Disabling MTA-STS also removes its requirement of TLS. To keep refusing unencrypted delivery, set `startTls` to `require` in the same strategy:

```json
{
  "name": "bypass-mta-sts",
  "mtaSts": "disable",
  "allowInvalidCerts": true,
  "startTls": "require"
}
```
