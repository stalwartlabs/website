---
sidebar_position: 3
title: "DKIM"
description: "DKIM failure reports: when Stalwart sends them, to whom, and their settings."
---

A domain that signs its mail with DKIM has no direct way to see that its signatures fail at the receiving end. DKIM failure reporting ([RFC 6651](https://www.rfc-editor.org/rfc/rfc6651)) gives it that view: a receiving server reports each signature that fails verification back to the signing domain. A failure points to one of a few problems: a broken signing setup, a key that is not published, or messages modified in transit.

A signer opts in to these reports in two places. Its signatures carry the `r=y` tag, which requests reports, and a TXT record at `_report._domainkey.<domain>` publishes the address to report to. Each report is a message in the Abuse Reporting Format ([RFC 6591](https://www.rfc-editor.org/rfc/rfc6591)), a standard format for reports about individual messages, and describes one failed signature.

Stalwart plays both roles. As a receiver, it sends a DKIM failure report when it [verifies](/docs/mta/authentication/dkim/verify) a message whose signature fails and requests reports, at the rate allowed by `sendFrequency`. As a signer, its own signatures request reports while their [`report`](/docs/ref/object/dkim-signature#report) field is <!-- default:DkimSignature.report as=enabled -->enabled<!-- /default -->, as it is by default ([Signing](/docs/mta/authentication/dkim/sign)).

The reports that Stalwart sends are configured on the [DkimReportSettings](/docs/ref/object/dkim-report-settings) singleton (found in the WebUI under <!-- breadcrumb:DkimReportSettings --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Reports › DKIM<!-- /breadcrumb:DkimReportSettings -->). Each field is an expression evaluated with the [RCPT TO variables](/docs/ref/expression/variable/mta-rcpt-to-variable). The fields answer two questions: how many reports to send, and what the report message looks like.

[`sendFrequency`](/docs/ref/object/dkim-report-settings#sendfrequency) decides how many reports go to each report address, as a count and a period. Setting it to `false` disables DKIM failure reports altogether. The default rate of <!-- default:DkimReportSettings.sendFrequency as=rate -->1 per day<!-- /default --> limits the reports sent to each address.

The other fields describe the report message:

- [`fromName`](/docs/ref/object/dkim-report-settings#fromname) and [`fromAddress`](/docs/ref/object/dkim-report-settings#fromaddress) set the display name and the address of the report's sender.
- [`subject`](/docs/ref/object/dkim-report-settings#subject) sets the subject of the report message.
- [`dkimSignDomain`](/docs/ref/object/dkim-report-settings#dkimsigndomain) sets the domain whose DKIM keys sign the report.

The default sender address and signing domain are built from `system('report_domain')`. This expression returns the [report domain](/docs/mta/reports/#shared-settings) shared by all reports, or the default domain unless the report domain is set.

The following object body disables DKIM failure reports:

```json
{
  "sendFrequency": {"else": "false"}
}
```

Reports also travel in the other direction. Failure reports that other servers send about the domains hosted on Stalwart are analysed as described in [Analysis](/docs/mta/reports/analysis).
