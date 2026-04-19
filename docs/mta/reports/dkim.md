---
sidebar_position: 3
---

# DKIM

DKIM authentication-failure reporting lets domain owners receive notifications when messages sent from their domain fail DKIM authentication at recipient mail servers. Reports use an email-based format sent to a designated address within the domain and typically include the sender, recipient, and specific DKIM verification result. Analysing these reports helps domain owners detect issues with their DKIM implementation and protect their domain reputation.

Stalwart [automatically analyses](/docs/mta/reports/analysis) received DKIM failure reports from external hosts and can also generate its own DKIM reports to inform other hosts about the authentication outcomes of the signatures it has processed. Outgoing DKIM failure reports are configured on the [DkimReportSettings](/docs/ref/object/dkim-report-settings) singleton (found in the WebUI under <!-- breadcrumb:DkimReportSettings --><!-- /breadcrumb:DkimReportSettings -->):

- [`fromName`](/docs/ref/object/dkim-report-settings#fromname): expression returning the name used in the `From` header of the DKIM report email. Default `'Report Subsystem'`.
- [`fromAddress`](/docs/ref/object/dkim-report-settings#fromaddress): expression returning the email address used in the `From` header. Default `'noreply-dkim@' + system('domain')`.
- [`subject`](/docs/ref/object/dkim-report-settings#subject): expression returning the subject of the report email. Default `'DKIM Authentication Failure Report'`.
- [`sendFrequency`](/docs/ref/object/dkim-report-settings#sendfrequency): expression returning the rate at which reports are sent to a given address. When the rate is exceeded, no further failure reports are sent to that address. Default `[1, 1d]`. Returning `false` disables DKIM failure reporting.
- [`dkimSignDomain`](/docs/ref/object/dkim-report-settings#dkimsigndomain): expression returning the domain whose DKIM signatures should sign the outgoing report. Default `system('domain')`.

Example configuration using explicit values:

```json
{
  "fromName": {"else": "'Report Subsystem'"},
  "fromAddress": {"else": "'noreply-dkim@example.org'"},
  "subject": {"else": "'DKIM Authentication Failure Report'"},
  "sendFrequency": {"else": "[1, 1d]"},
  "dkimSignDomain": {"else": "'example.org'"}
}
```
