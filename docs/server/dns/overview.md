---
sidebar_position: 1
---

# Overview

Stalwart can integrate with an external DNS provider and manage the records a mail server needs (MX, SPF, DKIM, DMARC, TLSA, autoconfig and autodiscover records, and the rest of the set described below) on the operator's behalf. When this integration is active, the server publishes and updates the zone directly against the provider's API, so records stay in sync with the server's configuration without manual changes in the provider's control panel.

## How records are provisioned

Integration is defined by the [DnsServer](/docs/ref/object/dns-server) object (found in the WebUI under <!-- breadcrumb:DnsServer --><!-- /breadcrumb:DnsServer -->), which stores the provider type and the credentials used to authenticate against its API. A single deployment can hold any number of DnsServer entries, for example one per provider or one per tenant.

A [Domain](/docs/ref/object/domain) (found in the WebUI under <!-- breadcrumb:Domain --><!-- /breadcrumb:Domain -->) is wired to a provider through its [`dnsManagement`](/docs/ref/object/domain#dnsmanagement) field. Selecting the `Automatic` variant and setting [`dnsServerId`](/docs/ref/object/domain#dnsmanagement) to the identifier of a DnsServer activates the integration for that domain. When the Domain is first created with an `Automatic` [`dnsManagement`](/docs/ref/object/domain#dnsmanagement) configuration, Stalwart publishes the initial set of records into the target zone. The record types that are published and kept in sync are selected by the `publishRecords` list on the `Automatic` variant, which defaults to DKIM, SPF, MX, DMARC, SRV, MTA-STS, TLS-RPT, CAA, autoconfig, legacy autoconfig, and Microsoft autodiscover. TLSA records can also be added to that list. See [DNS record setup](/docs/domains/dns-records) for the full wiring.

## Refreshing records

Records are kept current by the task manager. The [Task](/docs/ref/object/task) object exposes a `DnsManagement` variant that targets a specific [Domain](/docs/ref/object/domain) and optionally narrows the refresh to a subset of record types through its `updateRecords` field. Triggering a task of this variant causes Stalwart to reconcile the domain's zone with the current configuration, publishing any missing records and replacing any stale ones. The same variant is used internally when DKIM keys are rotated or when the set of managed records changes. See [Scheduled tasks](/docs/management/tasks) for how tasks are scheduled, triggered, and monitored.

For the list of supported providers and protocols, see [Supported providers](/docs/server/dns/provider).
