---
sidebar_position: 6
---

# Analysis

Stalwart automatically analyses incoming DMARC, DKIM, SPF, and TLS reports sent by other domains, removing the need for manual intervention and saving time for administrators. If TLS or message-authentication issues are detected, an event is recorded in the log file or sent to [OpenTelemetry](/docs/telemetry/tracing/opentelemetry). Turning reports into actionable events allows administrators to detect and respond to configuration errors and abuse (such as spam or phishing), helping maintain the integrity of the email system.

## Settings

Inbound analysis is configured on the [ReportSettings](/docs/ref/object/report-settings) singleton (found in the WebUI under <!-- breadcrumb:ReportSettings --><!-- /breadcrumb:ReportSettings -->):

- [`inboundReportAddresses`](/docs/ref/object/report-settings#inboundreportaddresses): list of addresses (with optional wildcards) from which reports are intercepted and analysed. These addresses must be routable. Default `["postmaster@*"]`.
- [`inboundReportForwarding`](/docs/ref/object/report-settings#inboundreportforwarding): whether reports are forwarded to their final recipient after analysis. Default `true`.

Example intercepting `dmarc@*` and `abuse@*` while still forwarding the report to the original recipient:

```json
{
  "inboundReportAddresses": ["dmarc@*", "abuse@*"],
  "inboundReportForwarding": true
}
```

## Retention

How long intercepted reports are kept is controlled globally by the [DataRetention](/docs/ref/object/data-retention) singleton (found in the WebUI under <!-- breadcrumb:DataRetention --><!-- /breadcrumb:DataRetention -->) through the [`holdMtaReportsFor`](/docs/ref/object/data-retention#holdmtareportsfor) field, which accepts a duration or `null` to disable storage. The default is `30d`.
