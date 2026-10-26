---
title: "DNS provider notes"
description: "Credential permissions for common DNS providers, timing of DNS updates, the events to read, records Stalwart leaves in the zone, and failures that originate at the provider."
sidebar_position: 2.5
---

Two features write to a domain's DNS zone: automatic DNS management, which publishes the domain's records, and the DNS-01 ACME challenge, which proves control of a name to a certificate authority. Both write through a [DNS provider](/docs/server/dns/provider), and most of their problems come from the provider side. A credential may lack the right permissions, the provider may serve new records slowly, or the new records may conflict with ones already in the zone. This page collects what each common provider requires, and how to tell these problems apart.

## Changes Stalwart makes in the zone

Stalwart creates, replaces and deletes records in the zone. Some names, such as the domain apex, may also hold records of other services. At such names, Stalwart first reads the existing TXT and CAA records, so that unrelated values are kept. [Existing records](/docs/domains/dns-records#existing-records) describes how each record type is treated.

The two features write different records:

- [Automatic DNS management](/docs/domains/dns-records#records-published) writes MX, SRV, CNAME and CAA records, TXT records, and, when enabled, TLSA records. The TXT records cover SPF, DKIM, DMARC, TLS reporting, MTA-STS, autoconfiguration and the `_validation-persist` record.
- The DNS-01 challenge writes only TXT records at `_acme-challenge.<name>`, and deletes them after the validation.

### Credential scope

Because automatic DNS management touches so many record types, the credential needs read, create, update and delete permission on all records of every zone that Stalwart manages. Some ACME clients show least-privilege examples that restrict a credential to `_acme-challenge` TXT records. Such a credential works for DNS-01 but makes automatic DNS management fail. For the same reason, dynamic DNS services that can only set TXT records (DuckDNS, DDNSS, FreeMyIP, Hurricane Electric, IPv64) can serve the DNS-01 challenge but not automatic DNS management.

Records are written for the domain's primary name only. [Domain aliases](/docs/domains/addresses#domain-aliases) receive no records.

## Minimum permissions

The following table gives, for the common providers, the credential that Stalwart uses and the smallest permission that lets it manage the zone:

| Provider | Credential | Minimum permission |
|---|---|---|
| Cloudflare | API token (`secret`) | `Zone / Zone / Read` and `Zone / DNS / Edit`, scoped to the zones Stalwart manages. The global API key also works but cannot be scoped. |
| AWS Route 53 | Access key (`accessKeyId`, `secretKey`) | `route53:ListHostedZonesByName` on `*`; `route53:ListResourceRecordSets` and `route53:ChangeResourceRecordSets` on the hosted zone ARN; `route53:GetChange` on `arn:aws:route53:::change/*`. |
| Google Cloud DNS | Service account | OAuth scope `https://www.googleapis.com/auth/ndev.clouddns.readwrite`, with the role `roles/dns.admin` or `roles/dns.editor` on the project. Reader roles are not sufficient. |
| Microsoft Azure DNS | Service principal | `Reader` and `DNS Zone Contributor` on the DNS zone itself, not a role restricted to the `_acme-challenge` record set. |
| Oracle Cloud | API key | `inspect dns-zones` and `use dns-records` in the zone's compartment. |
| DigitalOcean | API token (`secret`) | Scopes `domain:read`, `domain:create`, `domain:update` and `domain:delete`. |
| OVH | `applicationKey`, `applicationSecret`, `consumerKey` | A consumer key with GET, POST and DELETE rules on `/domain/zone/*`. GET is required because Stalwart lists records before changing them. [`ovhEndpoint`](/docs/ref/object/dns-server#ovhendpoint) selects the OVH region, <!-- default:DnsServer.ovhEndpoint -->`ovh-eu`<!-- /default --> unless changed. |
| Scaleway | API key | `DomainsDNSFullAccess`. `DomainsDNSReadOnly` is not sufficient. |
| RFC 2136 (`Tsig`) | TSIG key | An `update-policy` on the name server that allows the key to change all record types in the zone. |

For the other providers, give the credential full read and write access to the zone's records. Where the provider offers scoped tokens, scope them to the DNS records of the zones that Stalwart manages.

Not every provider offers that choice. According to their documentation at the time of writing, several providers issue only account-wide API keys, which give full access to the account. Among them are Bunny, Dynu, EasyDNS, GoDaddy, IONOS and Netlify. Some providers also impose conditions of their own, as described in their documentation: Porkbun requires API access to be enabled per domain, and Namecheap and Vultr require the server's IP address to be allowed for API use.

## Zone origin

A domain does not always have a zone of its own. When the domain is a subdomain whose records live in the parent's zone, for example `mail.example.com` in the zone `example.com`, set the domain's [`origin`](/docs/ref/object/domain#origin) to the zone name. Without it, the provider is asked for a zone named after the domain. That zone does not exist, so the update fails.

## Timing

A new record does not appear on all of the provider's name servers at once, and the time it takes to propagate varies between providers. A DNS management task does not wait for this: it finishes as soon as the provider has accepted its records. Stalwart waits for propagation only before a DNS-01 validation and before using a rotated DKIM key, as described in [Propagation](/docs/domains/dns-records#propagation).

The two waits end differently when the record does not appear in time:

- When the wait for a DNS-01 record times out, the challenge is submitted anyway. The validation then fails if the authority cannot see the record either.
- A DKIM rotation whose record is not visible is retried later.

Providers that take several minutes to serve new records from all their name servers need a longer `propagationTimeout`, or a `propagationDelay` that postpones the first check.

## Reading the failures

A failed DNS management run is reported in the task, with the provider's answer in its `failureReason`, for example `Failed to set DNS RRSet for <name>/<type>: <error>`. What happens next depends on the kind of failure. A failure that may be temporary is retried and logged as a `task-manager.task-retry` event. A failure that no retry can fix moves the task to the failed tasks and is logged as a `task-manager.task-failed` event. [Failures](/docs/domains/dns-records#failures) lists the messages.

Credentials or settings that cannot be used are caught earlier. They are refused when the DnsServer is saved, with `Failed to build DNS server: <error>`, or reported in the task as `Failed to build DNS updater: <error>`.

The following events trace the individual steps. Most are logged at `info` or `debug`, so they appear only with a tracer at that level, as described in [Tracing](/docs/telemetry/tracing/):

| Event | Level | Meaning |
|---|---|---|
| `dns.record-created` | info | A record set was written. |
| `dns.record-creation-failed` | warn | The provider rejected a record set, during a DNS management run, a DKIM publication or a DNS-01 challenge. The event carries the name, type, values and the provider's answer. |
| `dns.record-lookup-failed` | debug | A lookup failed, while reading the existing records before a write or during a propagation check. |
| `dns.record-not-propagated` | debug | A propagation check did not find the record yet. |
| `dns.record-propagated` | info | The record is visible. |
| `dns.record-propagation-timeout` | warn | The record did not become visible within `propagationTimeout`. |
| `dns.record-deletion-failed` | debug | A record could not be deleted. |

Because `dns.record-deletion-failed` is logged at `debug`, a failed cleanup is not visible at the default level.

## Records Stalwart does not remove

Some records stay in the zone and must be removed at the provider by hand:

- The records of a domain that is deleted or switched back to manual DNS management, and the records of a type removed from `publishRecords`, as described in [Existing records](/docs/domains/dns-records#existing-records).
- An `_acme-challenge` TXT record whose deletion failed. It does not affect later validations, because the next order for the name replaces it, but it remains for good once the domain is no longer renewed.
- A DKIM record whose deletion failed when the retired key was finally deleted. The key is deleted anyway, so the record can remain.

## Failures that originate at the provider

Some failures are caused by the provider's own rules, or by other tools that write to the same zone:

- **A CNAME conflicts with another record.** DNS does not allow a name that holds a CNAME to hold any other record. The provider therefore rejects the update when there is a CNAME at `_acme-challenge` or at the domain apex, or an existing record at `autoconfig`, `autodiscover`, `mta-sts` or `ua-auto-config`.
- **Rate limits.** Providers limit API requests per minute or per day. A domain with many records, or several domains updated at once, can exceed the limit, and the provider's error comes back in the task's failure reason.
- **TXT quoting.** Some control panels and APIs add quotes around TXT values, or require them. When a record looks correct in the panel but fails validation, compare the value returned by `dig` with the one in the domain's zone file.
- **The provider does not support CAA.** DreamHost, IBM Cloud, AWS Lightsail and Nifcloud reject CAA and TLSA records, with `CAA records are not supported by <provider>`. Because `caa` is in the default `publishRecords`, the rejection fails the whole run. For these providers, remove `caa` and `tlsa` from the domain's `publishRecords`.
- **CAA records changed by other tools.** Another tool that manages CAA records for the zone can remove the entry that Stalwart publishes. Certificate orders then fail with a CAA error from the authority.

:::tip[Enterprise feature]
DnsServer objects owned by a tenant, set with [`memberTenantId`](/docs/ref/object/dns-server#membertenantid), are available in the [Enterprise edition](/docs/server/enterprise) of Stalwart. They must reach their provider over the public internet: providers configured by URL need an `https` address that resolves to a public IP address, a TSIG server needs a public address, and credentials cannot be read from files or environment variables.
:::
