---
sidebar_position: 2
title: "DANE"
description: "DNS-Based Authentication of Named Entities for SMTP: how Stalwart uses TLSA records when delivering mail, the DNSSEC resolver it requires, and how to publish TLSA records for the domains it hosts."
---

DNS-Based Authentication of Named Entities (DANE, [RFC 6698](https://www.rfc-editor.org/rfc/rfc6698)) lets a domain publish, in DNS, the certificates or public keys that its servers present. The records that hold them are called TLSA records. [RFC 7672](https://www.rfc-editor.org/rfc/rfc7672) applies DANE to mail, and specifically to the MX hosts of a domain. When a sending server finds TLSA records for an MX host in a zone signed with DNSSEC, it must use TLS, and it must accept only a certificate that matches the records.

The protection comes from DNSSEC. Because DNSSEC signs the records, an attacker can neither remove the requirement to use TLS nor substitute a certificate of their own. For the same reason, the certificate does not need to be issued by a public certificate authority: the signed DNS record vouches for it instead.

Stalwart uses DANE in both directions. When it delivers mail, it applies the TLSA records of the recipient's MX hosts. For the domains it hosts, it can publish TLSA records for its own certificates.

## Requirements

DANE depends on DNSSEC, and that dependency sets requirements for each direction.

For outgoing mail, the DNS resolver that Stalwart uses must validate DNSSEC. It must also be reachable over TCP, because DNSSEC answers often exceed the size of a UDP response ([DNS resolver](/docs/server/dns/resolver)). Stalwart tests the resolver at start-up. When the resolver cannot validate DNSSEC, Stalwart disables DANE, so that mail is not deferred for lack of validation, and reports the following warning:

```text
The configured DNS resolver cannot validate DNSSEC. DANE has been disabled to avoid deferring mail. Ensure the resolver is DNSSEC-capable and reachable over TCP.
```

A local validating resolver, such as Unbound running on the server, meets the requirement.

For incoming mail, two zones must be signed with DNSSEC: the zone that holds the domain's MX records, and the zone of the MX hosts themselves. Senders ignore TLSA records when either of them is unsigned. Stalwart applies the same rule when it delivers mail: it looks up TLSA records only when the MX lookup of the recipient domain is DNSSEC-validated.

## Outgoing mail

The use of DANE in delivery is set by [`dane`](/docs/ref/object/mta-tls-strategy#dane) on the [TLS strategy](/docs/mta/outbound/tls) (found in the WebUI under <!-- breadcrumb:MtaTlsStrategy --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Outbound › TLS Strategies<!-- /breadcrumb:MtaTlsStrategy -->). The setting decides how strictly Stalwart treats the TLSA records of recipient domains, and it is <!-- default:MtaTlsStrategy.dane -->`optional`<!-- /default --> by default:

| Value | Effect |
|---|---|
| `optional` | For each MX host in a DNSSEC-signed zone, look up its TLSA records at `_25._tcp.<host>`. When records exist, deliver only over TLS to a host whose certificate matches them; otherwise use opportunistic TLS. |
| `require` | Deliver only to MX hosts with valid TLSA records. Delivery to a domain without DANE fails temporarily and is retried until the message expires. |
| `disable` | Make no TLSA lookups. |

A TLSA record has a usage, which says what the record pins. Stalwart evaluates the two usages that RFC 7672 specifies for SMTP. DANE-EE (3) pins the server's own certificate or key, and DANE-TA (2) pins the certificate authority that issued it.

When a host presents a certificate that matches no record, Stalwart does not deliver to it. The attempt is retried on the recipient's [schedule](/docs/mta/outbound/schedule). Each outcome is logged as an event:

- `dane.authentication-failure`: the certificate matched no record.
- `dane.authentication-success`: the certificate matched.
- `dane.bogus-dnssec-record`: the records failed DNSSEC validation.

The `allowInvalidCerts` setting of a TLS strategy never applies to a host authenticated through DANE.

DANE does not apply to [relay routes](/docs/mta/outbound/routing#tls-on-relay-hops), and the `require` value cannot be combined with them.

## Publishing TLSA records

For the domains it hosts, Stalwart can generate TLSA records from the certificates it uses. It generates two kinds of record:

- A DANE-EE record (`3 1 1`, the SHA-256 hash of the certificate's public key) for each server certificate.
- A DANE-TA record (`2 1 1`) for each intermediate certificate in the chain.

The records are generated for the MX host names in the domain, on port 25. They are also generated for the host names of the other services, on their own ports, such as 993 for IMAP and 465 for submission.

Whether the records reach DNS depends on how the domain's DNS is managed. Stalwart publishes them only when the domain uses [automatic DNS management](/docs/domains/dns-records) and `tlsa` is included in its [`publishRecords`](/docs/ref/object/domain#publishrecords). The default set of `publishRecords` does not include it. With automatic DNS management, Stalwart also updates the records when a certificate is renewed.

Without automatic DNS management, the generated records are listed in the domain's [`dnsZoneFile`](/docs/ref/object/domain#dnszonefile), and they must be published by hand. They must also be replaced each time a certificate's key changes, because a stale DANE-EE record makes every DANE-aware sender refuse to deliver.

The following command adds TLSA records to the records published for a domain that uses automatic DNS management:

```sh
stalwart-cli update Domain <id> --field 'dnsManagement/publishRecords/tlsa=true'
```

Before publishing TLSA records, confirm two things: that the zone is signed, and that certificate renewals update the records. Publish a [TLS reporting](/docs/mta/reports/tls) record as well, so that senders report failures.
