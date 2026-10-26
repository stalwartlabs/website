---
sidebar_position: 7
title: "TLS"
description: "SMTP TLS reports (TLS-RPT): what they contain, when Stalwart sends them to recipient domains, their settings, and receiving reports for the domains Stalwart hosts."
---

A domain that requires encrypted delivery, through an [MTA-STS](/docs/mta/transport-security/mta-sts) policy or [DANE](/docs/mta/transport-security/dane) TLSA records, cannot see the connections that fail on the sending side. Without reports, a failure such as a broken certificate or a policy that cannot be fetched is visible only to the sending server. SMTP TLS Reporting (TLS-RPT, [RFC 8460](https://www.rfc-editor.org/rfc/rfc8460)) solves this. It lets a domain receive reports from the servers that deliver mail to it about the TLS connections they made.

A domain requests these reports by publishing a TXT record at `_smtp._tls.<domain>` with a `rua=` address. It then receives one report per sending organisation per day. Each report covers every policy that applied, whether the domain's MTA-STS policy or its DANE TLSA records. For each policy, it counts the connections that succeeded and those that failed, with the reason for each failure. Typical reasons are a host that did not offer `STARTTLS`, a certificate that did not validate or match the policy, and a policy that could not be fetched.

With these reports, a domain owner learns that senders cannot deliver to it securely before the senders give up.

## Sending reports

As a sending server, Stalwart records the outcome of its TLS connections to each recipient domain. At the end of each period, which is <!-- default:TlsReportSettings.sendFrequency -->`daily`<!-- /default --> by default, it sends an aggregate report to each domain that publishes a TLS reporting record.

How a report is delivered depends on the address the domain publishes:

- Reports to an `https://` address are posted over HTTPS, with the same restrictions as the fetching of MTA-STS policies ([Fetching policies](/docs/mta/transport-security/mta-sts#fetching-policies)).
- Reports to a `mailto:` address are sent by mail.

Reports are sent between five and fifteen minutes after the end of the period. A report that would exceed `maxReportSize` keeps the rows that cover the most connections. Once the period has ended, pending reports are TlsInternalReport objects until they are sent ([Queue and report management](/docs/mta/management#outgoing-reports)).

The reports are configured on the [TlsReportSettings](/docs/ref/object/tls-report-settings) singleton (found in the WebUI under <!-- breadcrumb:TlsReportSettings --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Reports › TLS<!-- /breadcrumb:TlsReportSettings -->). Each field is an expression, and the moment at which it is evaluated decides which variables it can use:

- `sendFrequency` is evaluated for each delivery to a recipient domain, with the [host variables](/docs/ref/expression/variable/mta-queue-host-variable). The reporting period can therefore depend on the domain being delivered to.
- `dkimSignDomain` is evaluated when the report message is signed, with the [sender variables](/docs/ref/expression/variable/mta-queue-sender-variable).
- The other fields are evaluated when the report is generated. At that point only `rcpt_domain` is available, and it holds the domain the report is about.

The fields decide how often reports are sent, how large they may be, and how the report presents its sender:

| Field | Purpose |
|---|---|
| [`sendFrequency`](/docs/ref/object/tls-report-settings#sendfrequency) | Reporting period: `hourly`, `daily` or `weekly`, or `disable` to send no reports. Written without quotes. |
| [`maxReportSize`](/docs/ref/object/tls-report-settings#maxreportsize) | Maximum size of a report. |
| [`fromName`](/docs/ref/object/tls-report-settings#fromname) | Display name of the report's sender. |
| [`fromAddress`](/docs/ref/object/tls-report-settings#fromaddress) | Address of the report's sender. |
| [`orgName`](/docs/ref/object/tls-report-settings#orgname) | Organisation named in the report. |
| [`contactInfo`](/docs/ref/object/tls-report-settings#contactinfo) | Contact address included in the report, or none. |
| [`dkimSignDomain`](/docs/ref/object/tls-report-settings#dkimsigndomain) | Domain whose DKIM keys sign reports sent by mail. |

The default sender address, organisation name and signing domain are built from `system('report_domain')`. This expression returns the [report domain](/docs/mta/reports/#shared-settings) shared by all reports, or the default domain unless the report domain is set.

The subject of a report sent by mail is not configurable, because it follows the format that [RFC 8460, section 5.3](https://www.rfc-editor.org/rfc/rfc8460#section-5.3) recommends: `Report Domain: <domain> Submitter: <submitter> Report-ID: <<id>>`. In it, `<domain>` is the domain the report is about and `<submitter>` is the [`outboundReportSubmitter`](/docs/ref/object/report-settings#outboundreportsubmitter) host name. The report identifier lets the receiving domain discard duplicate reports.

The following object body sends weekly reports with a contact address:

```json
{
  "sendFrequency": {"else": "weekly"},
  "contactInfo": {"else": "'postmaster@example.org'"}
}
```

## Receiving reports

The domains hosted on Stalwart can receive TLS reports as well. To receive them for a domain, publish a TLS reporting record for it. With [automatic DNS management](/docs/domains/dns-records), the record is published by default.

Reports that arrive at the intercepted report addresses are analysed and stored as described in [Analysis](/docs/mta/reports/analysis). Reports that describe failed connections are logged as `incoming-report.tls-report-with-warnings`.
