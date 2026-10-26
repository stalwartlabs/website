---
sidebar_position: 1
title: "Overview"
description: "The reports Stalwart sends (delivery status notifications, DMARC, TLS, DKIM and SPF reports) and receives, and the settings they share."
---

A mail server rarely learns directly what happens to the mail it sends. A message may bounce at a remote server, fail an authentication check, or travel over a connection that could not be encrypted, and none of this is visible to the sender unless the receiving side reports it. Mail servers therefore exchange reports. These reports tell senders and domain owners three kinds of thing: whether a message was delivered, whether messages that claim to come from a domain passed authentication, and whether TLS connections to a domain's servers succeeded.

Stalwart takes part in this exchange in both directions. It sends reports about the mail it handles, and it analyses the reports that other servers send about the domains it hosts. The following table lists the reports it sends, who receives each one and which standard defines it:

| Report | Sent to | Standard | Page |
|---|---|---|---|
| Delivery status notification | The sender of a message that could not be delivered, was delayed or, on request, was delivered | [RFC 3464](https://www.rfc-editor.org/rfc/rfc3464), [RFC 3461](https://www.rfc-editor.org/rfc/rfc3461) | [DSN](/docs/mta/reports/dsn) |
| DMARC aggregate report | Domains whose DMARC record has an `rua` address, about the mail received from them | [RFC 9990](https://www.rfc-editor.org/rfc/rfc9990) | [DMARC](/docs/mta/reports/dmarc#aggregate-reports) |
| DMARC failure report | Domains whose DMARC record has a `ruf` address, for each message that fails | [RFC 9991](https://www.rfc-editor.org/rfc/rfc9991) | [DMARC](/docs/mta/reports/dmarc#failure-reports) |
| TLS report | Domains that publish a TLS reporting record, about the TLS connections made to them | [RFC 8460](https://www.rfc-editor.org/rfc/rfc8460) | [TLS](/docs/mta/reports/tls) |
| DKIM failure report | Domains whose DKIM signatures request reports, for each failing signature | [RFC 6651](https://www.rfc-editor.org/rfc/rfc6651) | [DKIM](/docs/mta/reports/dkim) |
| SPF failure report | Domains whose SPF records request reports, for each failing check | [RFC 6652](https://www.rfc-editor.org/rfc/rfc6652) | [SPF](/docs/mta/reports/spf) |

Delivery status notifications go to the sender of each affected message. The other reports are different: DMARC, TLS, DKIM and SPF reports are sent only to domains that ask for them in their DNS records. DMARC reports are also never sent about mail whose DMARC domain is hosted on this server.

Reports also arrive in the other direction. Other servers send DMARC and TLS aggregate reports, and feedback reports in the Abuse Reporting Format, to the domains hosted here. Stalwart recognises, analyses and stores these reports as described in [Analysis](/docs/mta/reports/analysis), and they can be viewed in the WebUI ([Queue and report management](/docs/mta/management)).

## Shared settings

Every report needs a sender address, a domain to sign it with and a name that identifies the reporting server. Rather than configure these separately for each report type, the administrator can set them once. The settings that all reports share are fields of the [ReportSettings](/docs/ref/object/report-settings) singleton (found in the WebUI under <!-- breadcrumb:ReportSettings --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Reports › General<!-- /breadcrumb:ReportSettings -->).

[`outboundReportDomain`](/docs/ref/object/report-settings#outboundreportdomain) is the domain from which reports and delivery status notifications are sent, unless their own settings name another. Several defaults depend on it: the default sender address and DKIM signing domain of every report type, and the organisation named in DMARC and TLS aggregate reports. Each of these defaults is built from the expression `system('report_domain')`, which returns this domain, or the default domain when the field is empty.

Because all those defaults read the same value, setting `outboundReportDomain` moves all reports to another domain in one place, for example to a subdomain reserved for reporting. The exception is a report field that has been set to an expression that does not use `system('report_domain')`: such a field keeps its own value. The following object body sends reports from `reports.example.org`:

```json
{
  "outboundReportDomain": "reports.example.org"
}
```

[`outboundReportSubmitter`](/docs/ref/object/report-settings#outboundreportsubmitter) is the host name that identifies the reporting server. It appears in three places: in the `Reporting-MTA` field of delivery status notifications, as the submitter of aggregate reports, and in report identifiers. It defaults to <!-- default:ReportSettings.outboundReportSubmitter -->`system('hostname')`<!-- /default -->, the server host name. The submitter is not the organisation named in DMARC and TLS reports, which is set with each report's own organisation field. The following object body sets the submitter:

```json
{
  "outboundReportSubmitter": {"else": "'mx.example.org'"}
}
```

Beyond these shared values, each report type has settings of its own, described on the pages listed above. Every type has its own sender address, display name and DKIM signing domain, and aggregate reports also have a sending frequency and a size limit. The DMARC failure, DKIM and SPF reports have a configurable subject as well. The other subjects are fixed: a DMARC or TLS aggregate report follows the format that its RFC sets, and a delivery status notification has a subject that describes its content.
