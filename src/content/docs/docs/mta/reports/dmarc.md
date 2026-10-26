---
sidebar_position: 5
title: "DMARC"
description: "DMARC aggregate and failure reports sent by Stalwart: when they are sent and to whom, their settings and frequencies, and how to suppress them."
---

A domain owner who publishes a [DMARC](/docs/mta/authentication/dmarc) policy needs to know how that policy affects real mail before making it stricter. DMARC therefore lets the owner ask receivers to report on the mail they receive that claims to come from the domain. Two kinds of report exist:

- Aggregate reports ([RFC 9990](https://www.rfc-editor.org/rfc/rfc9990)), requested with the `rua=` tag of the DMARC record, summarise the mail per sending IP address: how many messages passed or failed SPF, DKIM and DMARC, and what the receiver did with them.
- Failure reports ([RFC 9991](https://www.rfc-editor.org/rfc/rfc9991)), requested with the `ruf=` tag, describe individual messages that failed.

With these reports, a domain owner learns which servers send mail in the domain's name before tightening the policy.

Stalwart sends both kinds of report for the mail it receives, as long as DMARC verification is enabled ([DMARC](/docs/mta/authentication/dmarc)). It sends them to the addresses that the sending domain's record lists, with two restrictions:

- Reports are not sent about mail whose DMARC domain is a domain hosted on this server, including its alias domains. Stalwart therefore never reports to itself, and no setting is needed to prevent it.
- A report address in a domain other than the one it reports on receives reports only when that domain publishes the authorisation record that RFC 9990 requires for external destinations.

The settings of both kinds of report are fields of the [DmarcReportSettings](/docs/ref/object/dmarc-report-settings) singleton (found in the WebUI under <!-- breadcrumb:DmarcReportSettings --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Reports › DMARC<!-- /breadcrumb:DmarcReportSettings -->). Each is an expression, and the moment at which it is evaluated decides which variables it can use:

- The two frequency fields and the failure report fields are evaluated for the received message, with the [RCPT TO variables](/docs/ref/expression/variable/mta-rcpt-to-variable).
- The other aggregate report fields are evaluated when the report is sent. At that point only `rcpt_domain` is available, and it holds the domain the report is about.
- `aggregateDkimSignDomain` is the exception among the aggregate fields: it is evaluated when the report message is signed, with the [sender variables](/docs/ref/expression/variable/mta-queue-sender-variable).

## Aggregate reports

Stalwart records the DMARC result of each received message. At the end of each period, which is <!-- default:DmarcReportSettings.aggregateSendFrequency -->`daily`<!-- /default --> by default, it sends one aggregate report per reporting domain. The reports go out between five and fifteen minutes after the end of the period, spread over that interval. Each report is an XML document, compressed and attached to a message. When a report would exceed `maxAggregateReportSize`, it keeps the rows that cover the most messages.

The fields of aggregate reports decide how often they are sent, how large they may be, and how the report presents its sender:

| Field | Purpose |
|---|---|
| [`aggregateSendFrequency`](/docs/ref/object/dmarc-report-settings#aggregatesendfrequency) | Reporting period: `hourly`, `daily` or `weekly`, or `disable` to send no aggregate reports. |
| [`maxAggregateReportSize`](/docs/ref/object/dmarc-report-settings#maxaggregatereportsize) | Maximum size of a report. |
| [`aggregateFromName`](/docs/ref/object/dmarc-report-settings#aggregatefromname) | Display name of the report's sender. |
| [`aggregateFromAddress`](/docs/ref/object/dmarc-report-settings#aggregatefromaddress) | Address of the report's sender. |
| [`aggregateOrgName`](/docs/ref/object/dmarc-report-settings#aggregateorgname) | Organisation named in the report. |
| [`aggregateContactInfo`](/docs/ref/object/dmarc-report-settings#aggregatecontactinfo) | Contact address included in the report, or none. |
| [`aggregateDkimSignDomain`](/docs/ref/object/dmarc-report-settings#aggregatedkimsigndomain) | Domain whose DKIM keys sign the report. |

The default sender addresses, organisation name and signing domains are built from `system('report_domain')`. This expression returns the [report domain](/docs/mta/reports/#shared-settings) shared by all reports, or the default domain unless the report domain is set.

The subject of an aggregate report is not configurable. [RFC 9990, section 3.5.2](https://www.rfc-editor.org/rfc/rfc9990#section-3.5.2) requires a fixed format, `Report Domain: <domain> Submitter: <submitter> Report-ID: <<id>>`. In it, `<domain>` is the domain the report is about and `<submitter>` is the [`outboundReportSubmitter`](/docs/ref/object/report-settings#outboundreportsubmitter) host name.

The frequency values are constants, so they are written without quotes: `daily`, not `'daily'`. This matters because a mistake goes unnoticed. A quoted value, or any other value, is not a valid frequency, and it disables aggregate reporting for the messages it applies to without a warning.

Within a report, each message has a disposition, which records what the receiver did with it: `none`, `pass`, `quarantine` or `reject`.

Until they are sent, pending aggregate reports are DmarcInternalReport objects ([Queue and report management](/docs/mta/management#outgoing-reports)).

## Failure reports

A failure report is sent for a single message that fails DMARC. It uses the Abuse Reporting Format ([RFC 6591](https://www.rfc-editor.org/rfc/rfc6591)), a standard format for reports about individual messages, and contains the headers of the message, the client's IP address and the authentication results. Not every failure is reported: the `fo=` tag of the domain's DMARC record decides which ones are, as RFC 9991 specifies.

The fields of failure reports decide how many are sent and how the report message presents itself:

| Field | Purpose |
|---|---|
| [`failureSendFrequency`](/docs/ref/object/dmarc-report-settings#failuresendfrequency) | Rate of reports to each report address: a count and a period. `false` disables failure reports. |
| [`failureFromName`](/docs/ref/object/dmarc-report-settings#failurefromname) | Display name of the report's sender. |
| [`failureFromAddress`](/docs/ref/object/dmarc-report-settings#failurefromaddress) | Address of the report's sender. |
| [`failureSubject`](/docs/ref/object/dmarc-report-settings#failuresubject) | Subject of the report message. |
| [`failureDkimSignDomain`](/docs/ref/object/dmarc-report-settings#failuredkimsigndomain) | Domain whose DKIM keys sign the report. |

The rate matters because each failure report concerns one message. The default rate of <!-- default:DmarcReportSettings.failureSendFrequency as=rate -->1 per day<!-- /default --> limits the failure reports sent to each address. As a result, a spoofing campaign against a domain cannot make the server send a report for every forged message.

## Suppressing reports

Reports can be turned off for some mail rather than for all of it, by making the frequency expressions return `disable` or `false` under a condition. The frequency fields are evaluated for each received message, and two variables are useful in the condition: `rcpt_domain`, the domain of the message's last accepted recipient, and `sender_domain`, the domain of its envelope sender. The domain the report is about, the `From` domain, is not available as a variable. The following object body sends no reports about mail received for `example.org`, and sends the others as usual:

```json
{
  "aggregateSendFrequency": {
    "match": {"0": {"if": "rcpt_domain == 'example.org'", "then": "disable"}},
    "else": "daily"
  },
  "failureSendFrequency": {
    "match": {"0": {"if": "rcpt_domain == 'example.org'", "then": "false"}},
    "else": "[1, 1d]"
  }
}
```

To stop all DMARC reports, set `aggregateSendFrequency` to `disable` and `failureSendFrequency` to `false`.
