---
title: "Publishing an MTA-STS policy"
description: "Publish an MTA-STS policy so that sending servers deliver mail to the hosted domains only over TLS with a valid certificate: modes, MX hosts, records and requirements."
sidebar_position: 2.5
---

Mail between servers is usually encrypted opportunistically. The sender uses TLS when the receiver offers it, and falls back to plain text otherwise. An attacker on the network path can exploit that fallback, by removing the STARTTLS offer or by presenting a false certificate, as described in [Transport security](/docs/mta/transport-security/).

MTA-STS (SMTP MTA Strict Transport Security, [RFC 8461](https://www.rfc-editor.org/rfc/rfc8461)) closes this gap. It lets a domain publish a policy that tells senders which hosts receive its mail, and that they must deliver to those hosts only over TLS, with a certificate that validates for the host name. Senders that apply the policy no longer fall back to plain text.

This page covers publishing a policy for the domains Stalwart hosts. Applying the policies of other domains when Stalwart delivers outgoing mail is described in [MTA-STS](/docs/mta/transport-security/mta-sts).

## Policy publication

A sender that supports MTA-STS looks up a TXT record at `_mta-sts.<domain>` before delivering. If it finds one, it fetches the policy from `https://mta-sts.<domain>/.well-known/mta-sts.txt`. The policy file contains four fields:

| Field | Meaning |
|---|---|
| `version` | Always `STSv1`. |
| `mode` | `enforce`, under which senders deliver only over valid TLS; `testing`, under which they deliver anyway but report failures through [TLS reporting](/docs/mta/reports/tls); or `none`. |
| `mx` | The host names allowed to receive mail for the domain. |
| `max_age` | How long senders cache the policy, in seconds. |

Because senders cache the policy, they need a way to notice that it has changed. The TXT record carries an `id`, which senders compare with their cached copy. A new `id` makes them fetch the policy again.

Stalwart serves the policy file itself, and generates both DNS records for every hosted domain, as long as a policy exists. A policy exists when `mode` is not `disable` and the policy has at least one MX host. The records look like this:

```
mta-sts.example.com.	CNAME	mail.example.com.
_mta-sts.example.com.	TXT	"v=STSv1; id=<policy id>"
```

The `id` is derived from the policy contents, so it changes whenever the policy changes. The TXT record must then be updated, and how that happens depends on the domain's DNS management. With [automatic DNS management](/docs/domains/dns-records) and the `mtaSts` record type in `publishRecords`, the records are published, and the TXT record is updated when the records are refreshed. With manual DNS management, copy the records from the domain's zone file, and update the TXT record after each policy change.

## Policy settings

One policy applies to all hosted domains. It is configured on the [MtaSts](/docs/ref/object/mta-sts) singleton (found in the WebUI under <!-- breadcrumb:MtaSts --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Inbound › MTA-STS<!-- /breadcrumb:MtaSts -->).

The main decision is how strictly senders should apply the policy. It is set in [`mode`](/docs/ref/object/mta-sts#mode), as `testing`, `enforce` or `disable`. The policy is in <!-- default:MtaSts.mode -->`testing`<!-- /default --> mode until it is changed, so senders report failures but still deliver. With `disable`, no policy is served, and no MTA-STS records are generated.

How long senders keep a policy is set in [`maxAge`](/docs/ref/object/mta-sts#maxage), <!-- default:MtaSts.maxAge -->7 days<!-- /default --> unless changed. The policy file states it in seconds. The value is a tradeoff: a long cache protects senders for longer, but it also bounds how quickly a policy change reaches them, as described in [Rolling out a policy](#rolling-out-a-policy).

The host names allowed to receive mail are listed in [`mxHosts`](/docs/ref/object/mta-sts#mxhosts). When the list is empty, the hosts of [`SystemSettings.mailExchangers`](/docs/server/general#mail-exchangers-and-advertised-services) are used, so most servers need not set it. A name starting with `*.` matches every host in that domain.

The following policy enforces TLS for two mail exchangers and lets senders cache it for 30 days:

```json
{
  "mode": "enforce",
  "maxAge": 2592000000,
  "mxHosts": {"mx1.example.com": true, "mx2.example.com": true}
}
```

## Requirements

A policy is a promise to senders, and under `enforce` a broken promise means undelivered mail. Three conditions must hold before a policy is published:

- The policy is served over HTTPS on `mta-sts.<domain>`, so port 443 must be reachable and the certificate must cover `mta-sts.<domain>` for every hosted domain. The default ACME certificate of a domain includes that name, as described in [Names in a certificate](/docs/server/tls/acme/configuration#names-in-a-certificate).
- Every host in `mx` must present, on port 25, a certificate from a public authority that is valid for its host name. Under `enforce`, a sender that cannot validate the certificate of any listed host does not deliver the mail at all.
- The `mx` list must contain every host that receives the domain's mail, including backup MX hosts operated elsewhere.

## Rolling out a policy

Because a mistake under `enforce` stops delivery, a policy is introduced in stages. Start with `testing` and a [TLS reporting](/docs/install/dns#tls-reporting) record, so that senders report problems without refusing mail. When the reports show no failures for some weeks, switch to `enforce`.

The cache matters again when the mail hosts change. Before moving a domain's mail to other hosts, add them to `mxHosts` and wait for `maxAge` to pass, because senders keep applying the cached policy until it expires.
