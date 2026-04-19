---
sidebar_position: 4
---

# SPF

SPF authentication-failure reporting generates reports for sending mail servers when SPF checks fail at the receiver. The receiver verifies that an incoming message is authorised by the domain specified in the envelope (the `MAIL FROM` identity). When the check fails, a failure report is sent back to the sender, including the SPF record, the IP address of the sending server, and relevant header details. These reports help sending operators identify and correct issues with their SPF records.

Stalwart [automatically analyses](/docs/mta/reports/analysis) received SPF failure reports from external hosts and can also generate its own SPF reports for other hosts. Outgoing SPF failure reports are configured on the [SpfReportSettings](/docs/ref/object/spf-report-settings) singleton (found in the WebUI under <!-- breadcrumb:SpfReportSettings --><!-- /breadcrumb:SpfReportSettings -->):

- [`fromName`](/docs/ref/object/spf-report-settings#fromname): expression returning the name used in the `From` header of the report. Default `'Report Subsystem'`.
- [`fromAddress`](/docs/ref/object/spf-report-settings#fromaddress): expression returning the email address used in the `From` header. Default `'noreply-spf@' + system('domain')`.
- [`subject`](/docs/ref/object/spf-report-settings#subject): expression returning the report subject. Default `'SPF Authentication Failure Report'`.
- [`sendFrequency`](/docs/ref/object/spf-report-settings#sendfrequency): expression returning the rate at which reports are sent to a given address. Default `[1, 1d]`. Returning `false` disables SPF failure reporting.
- [`dkimSignDomain`](/docs/ref/object/spf-report-settings#dkimsigndomain): expression returning the domain whose [DKIM](/docs/mta/authentication/dkim/overview) signatures sign the outgoing report. Default `system('domain')`.

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
