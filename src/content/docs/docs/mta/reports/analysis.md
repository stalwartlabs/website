---
sidebar_position: 6
title: "Analysis"
description: "How Stalwart recognises, analyses and stores the DMARC, TLS and feedback reports sent to the domains it hosts, which addresses it intercepts, size limits, retention and the events it logs."
---

A domain owner who publishes DMARC and TLS reporting records receives reports from every server that handles the domain's mail. These include daily DMARC aggregate reports, TLS reports, and feedback reports about individual messages. The reports are machine-readable documents, and there is one from each reporting server.

Stalwart reads these reports itself. It analyses the reports sent to the domains it hosts, logs what they say and stores them. As a result, authentication or transport failures, and abuse of a domain, are noticed without anyone reading the reports by hand.

## Analysed messages

Stalwart treats a message as a report only when three conditions hold:

- It arrives over SMTP from an unauthenticated session.
- It is addressed to one of the [`inboundReportAddresses`](/docs/ref/object/report-settings#inboundreportaddresses) on the [ReportSettings](/docs/ref/object/report-settings) singleton (found in the WebUI under <!-- breadcrumb:ReportSettings --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Reports › General<!-- /breadcrumb:ReportSettings -->).
- It contains a report: a DMARC aggregate report in XML, a TLS report in JSON, or a feedback report in the Abuse Reporting Format ([RFC 5965](https://www.rfc-editor.org/rfc/rfc5965)). The Abuse Reporting Format covers abuse complaints and DKIM, SPF and DMARC failure reports.

Reports compressed with gzip or zip are decompressed first. Only the first report found in a message is analysed. Messages to the report addresses that contain no report are delivered like any other message.

The report addresses are compared with the original recipient of the message. By default, the list holds <!-- default:ReportSettings.inboundReportAddresses -->`postmaster@*`<!-- /default -->, which intercepts the postmaster address of every domain. An entry may start or end with `*` to match any prefix or suffix.

Intercepting an address does not create it. The intercepted addresses must exist, as accounts, aliases or a catch-all, because the SMTP server accepts the messages only then. The following object body intercepts the addresses usually published for DMARC and TLS reports:

```json
{
  "inboundReportAddresses": {"dmarc-reports@*": true, "tls-reports@*": true, "postmaster@*": true}
}
```

After analysis, a report can also be delivered to a mailbox, which [`inboundReportForwarding`](/docs/ref/object/report-settings#inboundreportforwarding) decides. While it is <!-- default:ReportSettings.inboundReportForwarding as=enabled -->enabled<!-- /default -->, as it is by default, an analysed report is also delivered to the mailbox of its recipient. When it is disabled, the report is not delivered to the report addresses, and a message addressed only to them is accepted and only analysed.

Compressed reports have a size limit of their own. [`maxInboundReportSize`](/docs/ref/object/report-settings#maxinboundreportsize) limits the decompressed size of a compressed report. A report that exceeds it, or that cannot be decompressed, is skipped and logged as `incoming-report.decompress-error`.

## Events

The results of the analysis reach the administrator through events. Each analysed report is logged at the `info` level as an event of the `incoming-report` group: `incoming-report.dmarc-report`, `incoming-report.tls-report`, `incoming-report.abuse-report`, `incoming-report.auth-failure-report` and the other feedback types.

Two events, at the `warn` level, signal that a report describes a problem:

- `incoming-report.dmarc-report-with-warnings`: the DMARC report lists messages that failed SPF or DKIM, or that the receiver quarantined or rejected.
- `incoming-report.tls-report-with-warnings`: the TLS report lists failed TLS sessions to the domain's servers.

Reports that cannot be parsed are logged as `incoming-report.message-parse-failed`, `incoming-report.dmarc-parse-failed`, `incoming-report.tls-rpc-parse-failed` or `incoming-report.arf-parse-failed`.

A [webhook](/docs/telemetry/webhooks) or a tracer that collects the warning events turns them into alerts.

## Storage

Analysed reports are stored as DmarcExternalReport, TlsExternalReport and ArfExternalReport objects. They can be viewed and deleted as described in [Queue and report management](/docs/mta/management#received-reports).

The reports are kept for the period set by [`holdMtaReportsFor`](/docs/ref/object/data-retention#holdmtareportsfor) on the [DataRetention](/docs/ref/object/data-retention) singleton, <!-- default:DataRetention.holdMtaReportsFor -->30 days<!-- /default --> by default. With the field set to `null`, reports are still analysed and logged, but they are not stored.
