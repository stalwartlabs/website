---
sidebar_position: 5
title: "TLS"
---

TLS reporting is the mechanism by which an MTA publishes outcomes of certificate validation during outbound message delivery. Recipients of TLS reports learn whether certificates were valid, expired, or revoked, which helps identify security issues and misconfigurations in the sending MTA.

## Configuration

Stalwart [automatically analyses](/docs/mta/reports/analysis) TLS reports received from external hosts and can also generate aggregate reports to inform other hosts about the results of TLS validation. Outgoing TLS aggregate reports are configured on the [TlsReportSettings](/docs/ref/object/tls-report-settings) singleton (found in the WebUI under <!-- breadcrumb:TlsReportSettings --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Reports › TLS<!-- /breadcrumb:TlsReportSettings -->):

- [`fromName`](/docs/ref/object/tls-report-settings#fromname): expression returning the name used in the `From` header of the report. Default `'Report Subsystem'`.
- [`fromAddress`](/docs/ref/object/tls-report-settings#fromaddress): expression returning the email address used in the `From` header. Default `'noreply-tls@' + system('domain')`.
- [`subject`](/docs/ref/object/tls-report-settings#subject): expression returning the report subject. Default `'TLS Aggregate Report'`.
- [`orgName`](/docs/ref/object/tls-report-settings#orgname): expression returning the organisation name included in the report. Default `system('domain')`.
- [`contactInfo`](/docs/ref/object/tls-report-settings#contactinfo): optional expression returning contact information for the reporting organisation.
- [`sendFrequency`](/docs/ref/object/tls-report-settings#sendfrequency): expression returning the frequency at which aggregate reports are sent. Supported values are `hourly`, `daily`, `weekly`, and `never`. Default `daily`.
- [`maxReportSize`](/docs/ref/object/tls-report-settings#maxreportsize): expression returning the maximum report size in bytes. Default 5242880 (5 MB).
- [`dkimSignDomain`](/docs/ref/object/tls-report-settings#dkimsigndomain): expression returning the domain whose [DKIM](/docs/mta/authentication/dkim/) signatures sign the outgoing report. Default `system('domain')`.

Example:

```json
{
  "fromName": {"else": "'TLS Report'"},
  "fromAddress": {"else": "'noreply-tls@example.org'"},
  "subject": {"else": "'TLS Aggregate Report'"},
  "orgName": {"else": "'The Foobar Organization'"},
  "contactInfo": {"else": "'jane@example.org'"},
  "sendFrequency": {"else": "daily"},
  "maxReportSize": {"else": "26214400"},
  "dkimSignDomain": {"else": "'example.org'"}
}
```

The submitter address for TLS reports is configured on the [ReportSettings](/docs/ref/object/report-settings) singleton via [`outboundReportSubmitter`](/docs/ref/object/report-settings#outboundreportsubmitter).
