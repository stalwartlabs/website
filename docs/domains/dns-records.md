---
sidebar_position: 2
---

# DNS records

Stalwart can publish and maintain a domain's DNS records directly against a managed zone, removing the need to copy records into a provider web console by hand. The feature is driven by the Domain object and relies on a separately configured [DnsServer](/docs/ref/object/dns-server) (found in the WebUI under <!-- breadcrumb:DnsServer --><!-- /breadcrumb:DnsServer -->) that carries the credentials and transport details for the zone. See [DNS providers](/docs/server/dns/overview) for the DnsServer setup itself; this page covers the lifecycle once a DnsServer is in place.

## Enabling automatic DNS management

Automatic management is selected per domain through the [`dnsManagement`](/docs/ref/object/domain#dnsmanagement) field on the [Domain](/docs/ref/object/domain) object. The `Manual` variant leaves the operator responsible for publishing records from the [`dnsZoneFile`](/docs/ref/object/domain#dnszonefile) text into the external provider. The `Automatic` variant delegates that work to the server and carries three settings:

- [`dnsServerId`](/docs/ref/object/domain#dnsserverid) references the DnsServer the domain should publish through.
- [`origin`](/docs/ref/object/domain#origin) names the zone apex when it differs from the domain itself. For a mail domain of `sub.example.com` hosted inside the `example.com` zone, the origin is set to `example.com`. Leaving the field unset falls back to the domain name.
- [`publishRecords`](/docs/ref/object/domain#publishrecords) lists the record types the server is allowed to write. The default covers `dkim`, `spf`, `mx`, `dmarc`, `srv`, `mtaSts`, `tlsRpt`, `caa`, `autoConfig`, `autoConfigLegacy`, and `autoDiscover`. Trimming the list restricts the server to a subset, which is useful when some record types are managed elsewhere.

## Initial publication

Records are written to the zone the first time a Domain is saved with automatic DNS management enabled. Creating a Domain with the `Automatic` variant of [`dnsManagement`](/docs/ref/object/domain#dnsmanagement) triggers a publication pass that adds each record type in [`publishRecords`](/docs/ref/object/domain#publishrecords) to the configured zone. Switching an existing Domain from manual to automatic management has the same effect: the next save reconciles the expected record set with what is currently present in the zone and adds anything missing.

Propagation is driven by the DnsServer's polling and timeout settings. The server issues the update, waits for the configured [`propagationDelay`](/docs/ref/object/dns-server#propagationdelay), then polls every [`pollingInterval`](/docs/ref/object/dns-server#pollinginterval) until the record is observed or [`propagationTimeout`](/docs/ref/object/dns-server#propagationtimeout) is reached. Records are written with a TTL of [`ttl`](/docs/ref/object/dns-server#ttl).

Flipping a Domain to automatic DNS management does not block the save: the server schedules a `DnsManagement` [Task](/docs/ref/object/task) (found in the WebUI under <!-- breadcrumb:Task --><!-- /breadcrumb:Task -->) that performs the initial publication asynchronously. The task's progress and outcome are visible on the Task record; if publication fails, the task is marked failed and its [`description`](/docs/ref/object/task#description) carries the details for diagnosis and retry.

## Refreshing records

After initial publication, the record set is kept in sync by running the DNS management task. The task is a variant of the [Task](/docs/ref/object/task) object (the `DnsManagement` variant) and can be triggered manually when a refresh is required, for example after editing the domain configuration, changing the report address, or rotating DKIM keys. In the WebUI, tasks are created from **Management > Tasks** via the **New Task** button; from the CLI, the Task object is created with `stalwart-cli` in the same way as any other object. Triggering the task causes the server to rebuild the expected record set for the domain, compare it to the live zone, and issue the required add, update, and delete operations against the DnsServer.

The task carries two fields of operational interest. [`updateRecords`](/docs/ref/object/task#updaterecords) restricts the refresh to a subset of record types, which is useful when only a specific record (for example, DKIM) needs to be rewritten. [`onSuccessRenewCertificate`](/docs/ref/object/task#onsuccessrenewcertificate) chains an ACME renewal after a successful DNS update, which is relevant when the zone change is a prerequisite for a DNS-01 challenge.

## Record coverage

The record types the server can manage are described by the `DnsRecordType` enumeration on the Domain object: `dkim`, `tlsa`, `spf`, `mx`, `dmarc`, `srv`, `mtaSts`, `tlsRpt`, `caa`, `autoConfig`, `autoConfigLegacy`, and `autoDiscover`. The contents of each record are derived from the Domain and from related objects (for example, DKIM public keys come from the [DkimSignature](/docs/ref/object/dkim-signature) records for the domain). The current expected zone content is always available on the Domain through the read-only [`dnsZoneFile`](/docs/ref/object/domain#dnszonefile) field.
