---
sidebar_position: 20
title: "Queue and report management"
description: "Inspecting, rescheduling and cancelling queued messages, pausing the queue, and managing the DMARC, TLS and feedback reports Stalwart receives and sends."
---

While the MTA runs, it keeps two kinds of records that administrators need to inspect and act on. The first is the queue: the messages that are waiting to be delivered. The second is the set of reports that Stalwart exchanges with other mail servers about authentication and TLS. An administrator looks at the queue to find out why a message has not arrived or to retry it after a fault is fixed, and at the reports to learn how other servers see the local domains.

The server creates both kinds of record itself as mail flows, and an administrator cannot create them. They are managed through the [WebUI](/docs/management/webui/), the [CLI](/docs/management/cli/) or the JMAP API. Each kind of record allows only the operations that make sense for it:

| Object | List and view | Create | Update | Delete |
|---|---|---|---|---|
| [QueuedMessage](/docs/ref/object/queued-message) | Yes | No | Yes: reschedule, cancel recipients | Yes |
| [DmarcInternalReport](/docs/ref/object/dmarc-internal-report), [TlsInternalReport](/docs/ref/object/tls-internal-report) | Yes | No | Yes | Yes |
| [DmarcExternalReport](/docs/ref/object/dmarc-external-report), [TlsExternalReport](/docs/ref/object/tls-external-report), [ArfExternalReport](/docs/ref/object/arf-external-report) | Yes | No | No | Yes |

## Queued messages

Each message in the queue is a QueuedMessage (found in the WebUI under <!-- breadcrumb:QueuedMessage --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" /><path d="m21.854 2.147-10.94 10.939" /></svg> Emails › Queued<!-- /breadcrumb:QueuedMessage -->). The object shows the envelope sender of the message, its size and its priority. For each recipient, it also shows the delivery state:

- The virtual queue the recipient is in
- The delivery status and the number of attempts made
- The time of the next attempt, of the next delay notification and of the expiry
- The error returned by the last attempt

Messages can be searched by text, by recipient, by queue, by sender or by due time. The following commands list the queued messages for a recipient and then show one of them:

```sh
stalwart-cli query QueuedMessage --where to=jane@example.net
stalwart-cli get QueuedMessage <id>
```

### Rescheduling delivery

After a problem on the remote server has been fixed, there is no need to wait for the next scheduled attempt: the message can be retried at once. Setting `nextRetry` to a time reschedules every recipient of the message that has not failed permanently. The following command sets the next attempt to a given time, which in this case is the present moment:

```sh
stalwart-cli update QueuedMessage <id> --field nextRetry=2026-10-15T12:00:00Z
```

To reschedule a single recipient instead of the whole message, use the field `recipients/<address>/retryDue` in place of `nextRetry`.

A recipient that has failed permanently is not affected by `nextRetry`. Retrying it takes two steps. First, set its status back to scheduled with `--field 'recipients/<address>/status={"@type":"Scheduled"}'`. Then reschedule it in a separate update.

### Cancelling delivery

Delivery can be cancelled for one recipient or for the whole message. Removing a recipient from the message with `--field 'recipients/<address>=null'` cancels its delivery, and the cancellation is recorded as `Delivery canceled.` Once no recipient is left to deliver, the message itself is removed. To remove the message with all its recipients at once, delete the QueuedMessage:

```sh
stalwart-cli delete QueuedMessage --ids <id>
```

### Pausing the queue

Sometimes deliveries must stop for a while without refusing new mail. The `PauseMtaQueue` and `ResumeMtaQueue` [actions](/docs/management/tasks-actions/actions) stop and restart the delivery of queued messages, and they act on every node of the cluster. While the queue is paused, Stalwart still accepts messages and queues them, but it delivers nothing until the queue is resumed. Pausing is useful during maintenance of a relay or of the network. It is also useful to examine the queue while no delivery is changing it:

```sh
stalwart-cli create Action/PauseMtaQueue
stalwart-cli create Action/ResumeMtaQueue
```

## Received reports

Other organisations send reports about the mail they receive from the local domains. Stalwart keeps these reports for review for the period set by [`holdMtaReportsFor`](/docs/ref/object/data-retention#holdmtareportsfor) on the [DataRetention](/docs/ref/object/data-retention) singleton, which is <!-- default:DataRetention.holdMtaReportsFor -->30 days<!-- /default --> unless changed. When the field is not set, received reports are not kept. Three kinds of report are stored:

- [DmarcExternalReport](/docs/ref/object/dmarc-external-report) (found in the WebUI under <!-- breadcrumb:DmarcExternalReport --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /><path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></svg> Reports › Inbox › DMARC<!-- /breadcrumb:DmarcExternalReport -->): DMARC aggregate reports. Each summarises how a receiver evaluated SPF, DKIM and DMARC for the messages that claimed to come from a local domain.
- [TlsExternalReport](/docs/ref/object/tls-external-report) (found in the WebUI under <!-- breadcrumb:TlsExternalReport --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /><path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></svg> Reports › Inbox › TLS<!-- /breadcrumb:TlsExternalReport -->): TLS reports. Each describes whether other servers could establish TLS when they delivered mail to the local domains.
- [ArfExternalReport](/docs/ref/object/arf-external-report) (found in the WebUI under <!-- breadcrumb:ArfExternalReport --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /><path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></svg> Reports › Inbox › ARF<!-- /breadcrumb:ArfExternalReport -->): feedback reports in the Abuse Reporting Format, such as abuse complaints and authentication failure reports.

These reports are records of what other servers observed, so they cannot be modified. They can only be viewed and deleted. [Report analysis](/docs/mta/reports/analysis) describes how Stalwart recognises and stores them.

## Outgoing reports

Stalwart also sends DMARC and TLS reports to other domains, and these reports are built up over a reporting period. While a period is open, Stalwart keeps the results it collects as counters, which are not listed anywhere. About five minutes after the period ends, a `DmarcReportWindow` or `TlsReportWindow` [task](/docs/management/tasks-actions/tasks) turns the counters into one report object per destination domain. Each report is kept until it is sent, which happens between five and fifteen minutes after the end of the period. Two kinds of pending report exist:

- [DmarcInternalReport](/docs/ref/object/dmarc-internal-report) (found in the WebUI under <!-- breadcrumb:DmarcInternalReport --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /><path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></svg> Reports › Outbox › DMARC<!-- /breadcrumb:DmarcInternalReport -->): DMARC aggregate reports for the domains whose DMARC record requests them.
- [TlsInternalReport](/docs/ref/object/tls-internal-report) (found in the WebUI under <!-- breadcrumb:TlsInternalReport --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /><path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></svg> Reports › Outbox › TLS<!-- /breadcrumb:TlsInternalReport -->): TLS reports for the domains that publish a TLS reporting record.

Deleting a pending report discards it, so the report is never sent. [DMARC reports](/docs/mta/reports/dmarc) and [TLS reports](/docs/mta/reports/tls) describe how the reports are produced and sent.
