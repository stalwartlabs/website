---
sidebar_position: 4
title: "SPF"
description: "SPF failure reports: when Stalwart sends them, to whom, and their settings."
---

An SPF record lists the servers that may send mail with a domain in the SMTP envelope, but on its own it does not tell the domain owner when mail fails the check at a receiving server. SPF failure reporting ([RFC 6652](https://www.rfc-editor.org/rfc/rfc6652)) closes that gap: a receiving server tells the domain when mail claiming the domain in the envelope fails its SPF check. A failure points to servers that send in the domain's name without being listed in its SPF record.

A domain requests reports with modifiers in its SPF record:

- `ra=` names the local part of the address to report to.
- `rp=`, which is optional, sets the percentage of failures to report.
- `rr=`, which is optional, selects the kinds of result to report.

Each report is a message in the Abuse Reporting Format ([RFC 6591](https://www.rfc-editor.org/rfc/rfc6591)), a standard format for reports about individual messages.

Stalwart sends an SPF failure report when its [SPF check](/docs/mta/authentication/spf) of a domain that requests reports fails. The number of reports is limited by the rate that `sendFrequency` allows.

The reports are configured on the [SpfReportSettings](/docs/ref/object/spf-report-settings) singleton (found in the WebUI under <!-- breadcrumb:SpfReportSettings --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Reports › SPF<!-- /breadcrumb:SpfReportSettings -->). Each field is an expression evaluated with the [MAIL FROM variables](/docs/ref/expression/variable/mta-mail-from-variable). The fields answer two questions: how many reports to send, and what the report message looks like.

[`sendFrequency`](/docs/ref/object/spf-report-settings#sendfrequency) decides how many reports go to each report address, as a count and a period. Setting it to `false` disables SPF failure reports altogether. The default rate of <!-- default:SpfReportSettings.sendFrequency as=rate -->1 per day<!-- /default --> limits the reports sent to each address.

The other fields describe the report message:

- [`fromName`](/docs/ref/object/spf-report-settings#fromname) and [`fromAddress`](/docs/ref/object/spf-report-settings#fromaddress) set the display name and the address of the report's sender.
- [`subject`](/docs/ref/object/spf-report-settings#subject) sets the subject of the report message.
- [`dkimSignDomain`](/docs/ref/object/spf-report-settings#dkimsigndomain) sets the domain whose DKIM keys sign the report.

The default sender address and signing domain are built from `system('report_domain')`. This expression returns the [report domain](/docs/mta/reports/#shared-settings) shared by all reports, or the default domain unless the report domain is set.

The following object body disables SPF failure reports:

```json
{
  "sendFrequency": {"else": "false"}
}
```

Reports also travel in the other direction. Failure reports that other servers send about the domains hosted on Stalwart are analysed as described in [Analysis](/docs/mta/reports/analysis).
