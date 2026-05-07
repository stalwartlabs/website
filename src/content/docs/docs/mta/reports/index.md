---
sidebar_position: 1
title: "Overview"
---

Stalwart MTA supports both the generation and analysis of a variety of email-related reports, aiding message-delivery transparency, authentication monitoring, and transport-security compliance. These reports provide insight into the health and trustworthiness of the mail infrastructure and can be used both operationally and for long-term policy evaluation.

Stalwart can generate and send the following types of standardised reports:

- [Delivery Status Notifications (DSNs)](/docs/mta/reports/dsn): inform senders about delivery issues such as delays, soft failures, or permanent bounces. DSNs are sent automatically based on delivery outcomes and configuration.
- [DMARC aggregate reports](/docs/mta/reports/dmarc#aggregate-reports): summarise authentication results (SPF, DKIM) for messages claiming to come from a domain, typically on a daily cadence.
- [DMARC failure reports](/docs/mta/reports/dmarc#failure-reports): sent when a message claiming to be from a domain fails DMARC alignment. Useful to identify spoofing or unauthorised senders.
- [TLS aggregate reports](/docs/mta/reports/tls): summarise the success or failure of STARTTLS connections with other mail servers. Useful for detecting transport-security misconfigurations.
- [DKIM failure reports](/docs/mta/reports/dkim): triggered when a message fails DKIM validation. Useful for diagnosing signing or policy issues.
- [SPF failure reports](/docs/mta/reports/spf): sent when a message fails SPF checks. Useful to identify unauthorised senders or misconfigured SPF records.

In addition to sending reports, Stalwart can [receive and automatically analyse](/docs/mta/reports/analysis) a wide range of incoming email-security reports: DMARC aggregate reports, SMTP TLS aggregate reports, authentication-failure reports (DKIM, SPF, and DMARC failures), and ARF reports (Abuse Reporting Format, used for spam complaints and security incidents). Received reports are parsed and stored for visualisation within the [WebUI](/docs/management/webui/), allowing review of authentication trends, anomaly detection, and tracking of policy-enforcement results over time.

If anomalies are detected, such as unusually high failure rates or authentication misalignments, Stalwart generates warnings forwarded to the configured [logging or tracing](/docs/telemetry/) mechanism. Warnings can also trigger [webhooks](/docs/telemetry/webhooks) for integration with external monitoring systems or automated response workflows.

## Configuration

Shared report settings are configured on the [ReportSettings](/docs/ref/object/report-settings) singleton (found in the WebUI under <!-- breadcrumb:ReportSettings --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Reports › General<!-- /breadcrumb:ReportSettings -->).

### Report domain

The [`outboundReportDomain`](/docs/ref/object/report-settings#outboundreportdomain) field specifies the default domain used as the organisational identity in outgoing reports. This domain appears in the sender address and in fields such as `Reporting-MTA` in DSNs, `reporting-org` in DMARC aggregate reports, and the domain portion of the `report-id` used for message correlation. If left empty, the default domain is used.

```json
{
  "outboundReportDomain": "example.org"
}
```

### Submitter address

The [`outboundReportSubmitter`](/docs/ref/object/report-settings#outboundreportsubmitter) field defines the hostname or identifier used in the `Submitter` field of certain report types, such as DMARC aggregate reports. This helps distinguish between MTA instances in multi-node or distributed environments. If left unset, the default expression resolves to the system hostname.

```json
{
  "outboundReportSubmitter": {"else": "'mx.example.org'"}
}
```
