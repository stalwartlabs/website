---
sidebar_position: 4
title: "SPF"
---

SPF authentication-failure reporting generates reports for sending mail servers when SPF checks fail at the receiver. The receiver verifies that an incoming message is authorised by the domain specified in the envelope (the `MAIL FROM` identity). When the check fails, a failure report is sent back to the sender, including the SPF record, the IP address of the sending server, and relevant header details. These reports help sending operators identify and correct issues with their SPF records.

Stalwart [automatically analyses](/docs/mta/reports/analysis) received SPF failure reports from external hosts and can also generate its own SPF reports for other hosts. Outgoing SPF failure reports are configured on the [SpfReportSettings](/docs/ref/object/spf-report-settings) singleton (found in the WebUI under <!-- breadcrumb:SpfReportSettings --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Reports › SPF<!-- /breadcrumb:SpfReportSettings -->):

- [`fromName`](/docs/ref/object/spf-report-settings#fromname): expression returning the name used in the `From` header of the report. Default `'Report Subsystem'`.
- [`fromAddress`](/docs/ref/object/spf-report-settings#fromaddress): expression returning the email address used in the `From` header. Default `'noreply-spf@' + system('domain')`.
- [`subject`](/docs/ref/object/spf-report-settings#subject): expression returning the report subject. Default `'SPF Authentication Failure Report'`.
- [`sendFrequency`](/docs/ref/object/spf-report-settings#sendfrequency): expression returning the rate at which reports are sent to a given address. Default `[1, 1d]`. Returning `false` disables SPF failure reporting.
- [`dkimSignDomain`](/docs/ref/object/spf-report-settings#dkimsigndomain): expression returning the domain whose [DKIM](/docs/mta/authentication/dkim/) signatures sign the outgoing report. Default `system('domain')`.

Example configuration using explicit values:

```json
{
  "fromName": {"else": "'Report Subsystem'"},
  "fromAddress": {"else": "'noreply-spf@example.org'"},
  "subject": {"else": "'SPF Authentication Failure Report'"},
  "sendFrequency": {"else": "[1, 1d]"},
  "dkimSignDomain": {"else": "'example.org'"}
}
```
