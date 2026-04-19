---
sidebar_position: 20
---

# Management

The outbound message queue and the inbound and outbound report archives are runtime management objects, not configuration. They are created by the MTA as messages are queued and as reports are sent, received, and analysed, and are then available for inspection through the [WebUI](/docs/management/webui/overview), the [CLI](/docs/management/cli/overview), and the JMAP API. The existing pages under [Reports](/docs/mta/reports/overview) cover report *emission and analysis*; this page covers access to the records themselves.

## Outbound queue

Messages waiting for delivery are represented by the [QueuedMessage](/docs/ref/object/queued-message) object (found in the WebUI under <!-- breadcrumb:QueuedMessage --><!-- /breadcrumb:QueuedMessage -->). Each entry carries the envelope, per-recipient delivery status, the next retry and notification timestamps, and a reference to the stored message content. Administrators can list, inspect, requeue, and cancel queued messages through this object.

## Inbound reports

Reports received from other organisations are stored for review and trend analysis. The relevant objects are:

- [ArfExternalReport](/docs/ref/object/arf-external-report) (found in the WebUI under <!-- breadcrumb:ArfExternalReport --><!-- /breadcrumb:ArfExternalReport -->): ARF feedback reports, including abuse complaints, fraud notifications, and authentication-failure reports received from external senders.
- [DmarcExternalReport](/docs/ref/object/dmarc-external-report) (found in the WebUI under <!-- breadcrumb:DmarcExternalReport --><!-- /breadcrumb:DmarcExternalReport -->): DMARC aggregate reports returned by remote receivers, summarising SPF and DKIM results for messages claiming to come from the local domains.
- [TlsExternalReport](/docs/ref/object/tls-external-report) (found in the WebUI under <!-- breadcrumb:TlsExternalReport --><!-- /breadcrumb:TlsExternalReport -->): TLS aggregate reports describing the outcome of STARTTLS connections observed by remote servers when delivering mail to the local domains.

Inbound analysis of these reports is configured on the [ReportSettings](/docs/ref/object/report-settings) singleton; see [Analysis](/docs/mta/reports/analysis) for the intercept addresses and forwarding behaviour.

## Outbound reports

Reports generated locally and waiting to be sent are retained until the aggregation window closes and delivery completes. The relevant objects are:

- [DmarcInternalReport](/docs/ref/object/dmarc-internal-report) (found in the WebUI under <!-- breadcrumb:DmarcInternalReport --><!-- /breadcrumb:DmarcInternalReport -->): pending outbound DMARC aggregate reports, accumulated from local authentication results and scheduled for delivery to the addresses listed in each domain's DMARC policy.
- [TlsInternalReport](/docs/ref/object/tls-internal-report) (found in the WebUI under <!-- breadcrumb:TlsInternalReport --><!-- /breadcrumb:TlsInternalReport -->): pending outbound TLS aggregate reports, accumulated from observed STARTTLS outcomes and scheduled for delivery to the policy identifiers declared by remote domains.

Emission of outbound reports is configured through the [DMARC](/docs/mta/reports/dmarc) and [TLS](/docs/mta/reports/tls) report pages; this page covers only the management of records that are already in flight.
