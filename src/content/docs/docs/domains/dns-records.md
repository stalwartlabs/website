---
sidebar_position: 2
title: "Automatic DNS records"
description: "Let Stalwart publish and maintain a domain's MX, SPF, DKIM, DMARC, SRV, MTA-STS, CAA and autoconfiguration records through a DNS provider's API."
---

A mail domain requires a set of DNS records, so that other servers accept its mail and email clients locate its services. Publishing them once is not the end of the work, because several of these records change while the server is in operation:

- DKIM signing keys are replaced periodically, and each new key needs its own record.
- The TLSA records used by DANE (DNS-based Authentication of Named Entities) contain digests of the current certificates, so they change when a certificate is renewed.
- The MTA-STS (SMTP MTA Strict Transport Security) record carries an identifier that changes with the policy.

Automatic DNS management allows Stalwart to write these records to the zone through the API of the domain's DNS provider, and to keep them consistent with the server configuration. The feature is enabled per domain.

A domain left on manual management still has its expected records computed for it, in the read-only [`dnsZoneFile`](/docs/ref/object/domain#dnszonefile) field, ready to be copied into the zone by hand. [DNS records](/docs/install/dns) explains what each record is for.

## Requirements

Automatic management needs a [DnsServer](/docs/ref/object/dns-server) (found in the WebUI under <!-- breadcrumb:DnsServer --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › DNS › DNS Providers<!-- /breadcrumb:DnsServer -->) holding the provider's credentials. [DNS providers](/docs/server/dns/provider) lists the supported providers and what each one needs. [DNS provider notes](/docs/server/dns/provider-notes) lists the minimum permissions for common providers, and the failures that originate at the provider.

The credentials must allow listing, creating, replacing and deleting records in the zone. Stalwart needs all four, because it replaces whole record sets and removes DKIM records it has retired.

The records point at names taken from [SystemSettings](/docs/ref/object/system-settings) (found in the WebUI under <!-- breadcrumb:SystemSettings --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › Services, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › General<!-- /breadcrumb:SystemSettings -->): [`defaultHostname`](/docs/ref/object/system-settings#defaulthostname), the [`mailExchangers`](/docs/ref/object/system-settings#mailexchangers) list and the [`services`](/docs/ref/object/system-settings#services) map. Configure these settings before enabling the feature. Later changes to them are published only when the records are refreshed, so a record built from an outdated setting would stay in the zone until then.

## Enable automatic management

Enabling the feature takes four steps:

1. Create the DnsServer for the zone's provider.
2. On the [Domain](/docs/ref/object/domain) (found in the WebUI under <!-- breadcrumb:Domain --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg> Domains › Domains<!-- /breadcrumb:Domain -->), set [`dnsManagement`](/docs/ref/object/domain#dnsmanagement) to `Automatic`, with [`dnsServerId`](/docs/ref/object/domain#dnsserverid) pointing at the DnsServer. When the domain is not itself the zone apex, as with `mail.example.com` inside the `example.com` zone, set [`origin`](/docs/ref/object/domain#origin) to the zone name. Remove from [`publishRecords`](/docs/ref/object/domain#publishrecords) any record type that is maintained somewhere else, so that Stalwart does not overwrite it. The following value enables management for a domain inside the `example.com` zone:

   ```json
   {
     "dnsManagement": {
       "@type": "Automatic",
       "dnsServerId": "c",
       "origin": "example.com",
       "publishRecords": {
         "mx": true, "spf": true, "dkim": true, "dmarc": true, "tlsRpt": true,
         "mtaSts": true, "srv": true, "caa": true,
         "autoConfig": true, "autoConfigLegacy": true, "autoDiscover": true
       }
     }
   }
   ```

3. Save the domain. The save completes immediately, and schedules a `DnsManagement` [Task](/docs/ref/object/task) (found in the WebUI under <!-- breadcrumb:Task --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M13 5h8" /><path d="M13 12h8" /><path d="M13 19h8" /><path d="m3 17 2 2 4-4" /><path d="m3 7 2 2 4-4" /></svg> Tasks › Scheduled, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M13 5h8" /><path d="M13 12h8" /><path d="M13 19h8" /><path d="m3 17 2 2 4-4" /><path d="m3 7 2 2 4-4" /></svg> Tasks › Failed<!-- /breadcrumb:Task -->) for every type in `publishRecords`. A task is a background job that the server runs, and whose status is visible in the WebUI.

   Two other features coordinate with this task. When DKIM management is switched to automatic in the same save, the DKIM records are left to the key-generation task, which publishes each key as it creates it. A domain created with automatic certificate management also has its first ACME order chained to the end of a successful DNS run. The certificate is therefore requested only once the records, CAA included, are in the zone.
4. Verify the published records with a public resolver, or with the provider's name servers:

   ```sh
   dig +short MX example.com
   dig +short TXT _dmarc.example.com
   dig +short SRV _imaps._tcp.example.com
   ```

The task normally completes within seconds, because it makes one API call per record set and does not wait for the records to propagate. A task that does not complete is either retried or listed under Management › Tasks › Failed, as described in [Failures](#failures).

## Records published

Each key in `publishRecords` produces the records listed below. The record contents are fixed. To publish a record with different contents, for example a DMARC policy other than `p=reject`, remove its type from `publishRecords` and publish the record manually.

The set goes beyond the mail authentication records. It includes SRV records that locate the mail, calendar and contacts services ([RFC 6186](https://www.rfc-editor.org/rfc/rfc6186), [RFC 8314](https://www.rfc-editor.org/rfc/rfc8314#section-5.1), [RFC 6764](https://www.rfc-editor.org/rfc/rfc6764) and [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-2.2)), CAA records that restrict which certificate authorities may issue certificates for the domain, and the autoconfiguration names that email clients query to discover their settings.

| Key | Records | Published when |
|---|---|---|
| `mx` | One MX at the domain per `mailExchangers` entry, pointing at its hostname or at `defaultHostname` | Always |
| `spf` | `v=spf1 mx -all` at the domain, and `v=spf1 a -all` at each mail exchanger hostname inside the domain | Always |
| `dkim` | A TXT record at `<selector>._domainkey` for each of the domain's keys that is not retired | The domain has DKIM keys |
| `dmarc` | `v=DMARC1; p=reject; rua=<report address>` at `_dmarc` | [`reportAddressUri`](/docs/ref/object/domain#reportaddressuri) is set |
| `tlsRpt` | `v=TLSRPTv1; rua=<report address>` at `_smtp._tls` | `reportAddressUri` is set |
| `mtaSts` | A CNAME `mta-sts` to `defaultHostname`, and `v=STSv1; id=<policy id>` at `_mta-sts` | An [MTA-STS](/docs/ref/object/mta-sts) policy is configured |
| `srv` | `_jmap._tcp`, `_caldavs._tcp` and `_carddavs._tcp` on port 443; `_imaps._tcp` on 993, `_pop3s._tcp` on 995, `_submissions._tcp` on 465; `_imap._tcp` on 143, `_pop3._tcp` on 110 and `_submission._tcp` on 587 only for services whose [`cleartext`](/docs/ref/object/system-settings#cleartext) flag is set | Per entry in `services` |
| `caa` | `issue` for the ACME provider's certificate authority with its `accounturi`, `iodef` to a `mailto:` report address, and, when the provider uses the DNS-PERSIST-01 challenge, its `_validation-persist` TXT records | The domain uses automatic certificate management |
| `autoConfig` | A CNAME `ua-auto-config` to `defaultHostname`, and `v=UAAC1; a=sha256; d=<digest>` at `_ua-auto-config` | Always |
| `autoConfigLegacy` | A CNAME `autoconfig` to `defaultHostname` | Always |
| `autoDiscover` | A CNAME `autodiscover` to `defaultHostname` | Always |
| `tlsa` | TLSA records for the certificates served on each Stalwart hostname within the domain | Not in the default set; republished after every certificate renewal |

The report address is <!-- default:Domain.reportAddressUri -->`mailto:postmaster`<!-- /default --> unless it is changed. A `mailto:` address without a domain part has the domain appended, so the DMARC record of `example.com` reads `rua=mailto:postmaster@example.com`.

The `cleartext` flag changes only what is advertised in DNS and autoconfiguration. It does not change what the listeners accept.

## Existing records

A zone often holds records that Stalwart did not write, such as site-verification tokens or the records of a previous mail host. Stalwart writes a complete record set, meaning all records of one type at one name, for each name and type it publishes. The effect on records already present in the zone depends on the type:

- MX, SRV, CNAME and TLSA records at a name that Stalwart publishes are replaced entirely. MX records that point to a previous mail host are therefore removed on the first run. Remove `mx` from `publishRecords` if the domain continues to receive mail through another host.
- TXT records at names that belong to mail (`_dmarc`, `_smtp._tls`, `_mta-sts`, `_ua-auto-config`, `_validation-persist` and `._domainkey` names) are replaced entirely.
- TXT records at shared names, such as the domain apex, are merged. An existing `v=spf1` record is replaced, and other TXT records, such as site-verification tokens, are kept.
- CAA records for other certificate authorities are kept, and only the entry for the configured ACME account is replaced.

Merging requires a provider API that can list the records at a name. When the API cannot list records, Stalwart writes its own set anyway, and logs `dns.record-lookup-failed` with the reason `DNS provider cannot list RRSet, unrelated records at this name may be overwritten: <reason>`.

DNS imposes one more rule: a name that holds a CNAME record cannot hold any other record. If `autoconfig` or `mta-sts` already exists in the zone as another record type, or the domain apex is a CNAME, the provider rejects the update.

Stalwart deletes few records. Records are not deleted when a domain is deleted, when it is switched back to manual management, or when a type is removed from `publishRecords`. They remain in the zone until they are removed manually. The only records Stalwart deletes are those of DKIM keys it has retired, and its own ACME challenge records.

## Propagation

A new record takes time to appear on all of the provider's name servers. A DNS management task does not wait for this. Stalwart waits only when a record must be visible before the next step can proceed: before it signs with a newly rotated DKIM key, and before it asks the certificate authority to validate a DNS-01 challenge.

In those cases, it first waits for the DnsServer's [`propagationDelay`](/docs/ref/object/dns-server#propagationdelay), if one is set. It then looks the record up every [`pollInterval`](/docs/ref/object/dns-server#pollinterval), <!-- default:DnsServer.pollInterval -->15 seconds<!-- /default --> unless changed, until the record appears or [`propagationTimeout`](/docs/ref/object/dns-server#propagationtimeout) has passed, which is <!-- default:DnsServer.propagationTimeout -->1 minute<!-- /default --> by default.

The lookups go through Stalwart's own [resolver](/docs/server/dns/resolver). A caching resolver that has stored an earlier negative answer can therefore delay confirmation beyond the actual propagation time. Each poll that misses logs `dns.record-not-propagated`, and the final outcome is `dns.record-propagated` or `dns.record-propagation-timeout`.

For providers that take several minutes to serve new records, increase `propagationTimeout`, or set `propagationDelay` to postpone the first lookup. Published records carry the DnsServer's [`ttl`](/docs/ref/object/dns-server#ttl).

## Refresh records

Stalwart republishes records automatically in three situations: when a domain is switched to automatic management, when a DKIM key is rotated, and when a renewed certificate changes the TLSA records, if `tlsa` is published.

Other changes need a manual refresh. The records are also derived from the mail exchangers, the advertised services, the report address, the MTA-STS policy and the ACME provider. Changes to these settings are published only when a `DnsManagement` task runs. Create the task from Management › Tasks in the WebUI, or with the CLI. [`updateRecords`](/docs/ref/object/task#updaterecords) restricts the run to the listed record types, and [`onSuccessRenewCertificate`](/docs/ref/object/task#onsuccessrenewcertificate) starts an ACME renewal once the update has succeeded. The following command refreshes the MX, SPF and SRV records of a domain:

```sh
stalwart-cli create Task/DnsManagement \
  --field domainId=b \
  --field 'updateRecords={"mx":true,"spf":true,"srv":true}'
```

A task with an empty `updateRecords` is removed without running.

## Failures

A failed run records the provider's answer in the task's [`failureReason`](/docs/ref/object/task#failurereason). What happens next depends on whether a retry can help.

When the provider could not be reached, timed out or returned a server error, the failure may be temporary. The task is retried according to the [task retry policy](/docs/management/tasks-actions/tasks#retries), and stays among the scheduled tasks.

Other failures need a correction first. The provider may have rejected the request as invalid, reported the zone or record as not found, or not support the record type, or the DNS server settings may be unusable. A retry cannot help with any of these, so the task is listed under Management › Tasks › Failed. Correct the cause, then retry the task or create a new one. The possible messages are:

- `Failed to set DNS RRSet for <name>/<type>: <error>`: the provider rejected one record set. Other record sets in the same run may have been published. The error text comes from the provider, and common causes are a token without access to the zone, the wrong `origin`, a CNAME conflict, or the provider's rate limit.
- `Failed to build DNS updater: <error>`: the DnsServer's credentials or settings could not be used, for example a TSIG key that is not valid base64.

When the domain is switched back to manual DNS management or deleted before the task runs, the task is removed without running.

A related error is reported earlier, when the domain is saved. Automatic certificate management with a DNS-01 ACME provider cannot be saved on a domain without automatic DNS management, and the save fails with `ACME provider requires automatic DNS management`.

:::tip[Enterprise feature]

A DnsServer owned by a tenant must reach its provider over the public internet. URL-based providers need an `https` address that resolves to a public IP, and a TSIG server needs a public address. A tenant cannot configure a DnsServer that connects to a private network.

:::
