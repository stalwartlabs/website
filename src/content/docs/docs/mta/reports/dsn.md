---
sidebar_position: 2
title: "Delivery status notifications"
description: "When Stalwart sends delivery status notifications, how the NOTIFY, RET, ENVID and ORCPT parameters affect them, their sender settings, suppressing them, and DKIM2 validation of incoming notifications."
---

When a message cannot reach a recipient, the sender needs to know, because otherwise the message is silently lost. A delivery status notification (DSN, [RFC 3464](https://www.rfc-editor.org/rfc/rfc3464)) is the message that carries this news. A mail server sends it to the envelope sender of a message to report what happened to the message. It can report three outcomes: that the message could not be delivered to a recipient, that its delivery is delayed and still being retried, or, when the sender asked for it, that it was delivered. Users know these notifications as bounces.

Stalwart sends DSNs for the messages in its [queue](/docs/mta/outbound/queue). This page describes when it sends them, how senders control them, who they come from and how to suppress them. It also covers the other direction: how Stalwart uses DKIM2 to check the DSNs it receives.

## Notification types

Stalwart checks after each delivery attempt whether the sender should learn about any recipient. It then sends one DSN per message, which reports every recipient whose status the sender should learn. A recipient is reported in one of three kinds of notification:

| Notification | Reported when |
|---|---|
| Failure | The recipient failed permanently, because the receiving server refused it or the message [expired](/docs/mta/outbound/schedule) in the queue. |
| Delay | The recipient is still being retried and a delay notification is due according to the recipient's [schedule](/docs/mta/outbound/schedule). |
| Success | The recipient was delivered, and the sender requested a success notification. |

Each recipient is reported once for each kind. The subject of the DSN reflects its content, for example `Failed to deliver message`, `Warning: Delay in message delivery`, `Successfully delivered message` or `Partially delivered message`.

The DSN itself is a `multipart/report` message ([RFC 6522](https://www.rfc-editor.org/rfc/rfc6522)), a format that combines a part for people with parts for software. It contains the following:

- A readable explanation.
- A machine-readable delivery status for each recipient.
- The headers of the original message, up to 4 KiB, whatever the `RET` parameter requests.

The DSN carries `Auto-Submitted: auto-generated`, and the remote server's reply for each failed recipient.

No DSN is sent for a message whose envelope sender is empty (`<>`). DSNs themselves are sent with that empty sender, so this rule ensures that two servers never exchange bounces about bounces.

## DSN parameters

Senders differ in which notifications they want for a message. The SMTP DSN extension ([RFC 3461](https://www.rfc-editor.org/rfc/rfc3461)) lets the sender of a message control its notifications with parameters on the SMTP commands. These parameters are available only when the extension is offered to the client, which by default is to authenticated sessions only ([EHLO stage](/docs/mta/inbound/ehlo#smtp-extensions)):

| Parameter | Command | Effect |
|---|---|---|
| `NOTIFY` | `RCPT TO` | Which notifications to send for the recipient: `NEVER`, or any of `SUCCESS`, `FAILURE` and `DELAY`. Without the parameter, failure and delay notifications are sent. |
| `ORCPT` | `RCPT TO` | The original address of the recipient, reported in the `Original-Recipient` field. |
| `ENVID` | `MAIL FROM` | An identifier of the message chosen by the sender, reported in the `Original-Envelope-Id` field. |
| `RET` | `MAIL FROM` | `FULL` or `HDRS`. Stalwart returns only the headers in its own DSNs, and passes the parameter on to the next server. |

The parameters do not stop at Stalwart. When the next server also supports the DSN extension, Stalwart passes the parameters on to it, so that the final server can report to the original sender.

## Sender settings

A DSN is a message like any other, so it needs a sender and, to be trusted by receivers, a DKIM signature. These are set on the [DsnReportSettings](/docs/ref/object/dsn-report-settings) singleton (found in the WebUI under <!-- breadcrumb:DsnReportSettings --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Reports › DSN<!-- /breadcrumb:DsnReportSettings -->). Each field is an expression evaluated with the [queue sender variables](/docs/ref/expression/variable/mta-queue-sender-variable), so the values can depend on the message being reported:

- [`fromName`](/docs/ref/object/dsn-report-settings#fromname) and [`fromAddress`](/docs/ref/object/dsn-report-settings#fromaddress) set the display name and the address of the DSN's sender.
- [`dkimSignDomain`](/docs/ref/object/dsn-report-settings#dkimsigndomain) sets the domain whose DKIM keys sign the DSN.

The default sender address and signing domain are built from `system('report_domain')`. This expression returns the [report domain](/docs/mta/reports/#shared-settings) shared by all reports, or the default domain unless the report domain is set.

The `Reporting-MTA` field of each DSN, which names the server that produced it, is the [`outboundReportSubmitter`](/docs/mta/reports/#shared-settings) of the server. The following object body sends DSNs from a postmaster address of the organisation's domain:

```json
{
  "fromName": {"else": "'Mail Delivery System'"},
  "fromAddress": {"else": "'postmaster@example.org'"},
  "dkimSignDomain": {"else": "'example.org'"}
}
```

## Suppressing notifications

Some recipients should never cause a notification, whatever the sender requested. A system [Sieve script](/docs/sieve/interpreter/trusted) at the RCPT TO stage can override the `NOTIFY` parameter of a recipient by setting `envelope.notify`. The following script suppresses notifications for messages sent to any `mailer-daemon` address:

```sieve
require ["variables", "envelope"];

if envelope :matches "to" "mailer-daemon@*" {
    set "envelope.notify" "NEVER";
}
```

<!-- sievepad { "envelopeTo": [ "mailer-daemon@example.org" ] } -->
<p><a href="https://sievepad.com/#w=XU9BTsNADPyK5SMKlbiGCwd67YFWXLo5mNQNK-16w64TqKJIvIvn8BKcSkUFX6yZ8YztCUes7yoUiow1bpXCO2WFQ2pLDY8c_Mj5BEVJhwKS1B99S-qTFPj-_ILt0PeZS_HS_VWxwtJm32vBej9d8iN5WZQ05HbBmd8Gnxn2DkfKnl4CF4cVOGQZOaSeHTb3Tpz4I1woqCNp-8rFxjQ5tGa5gfPtgTgmebgxbnICVoX1Kmx1PvF0tmzWz-snhxY-O8G5qTDaH9TxcrAhc6p9ZWj69e-Saf-W8QfFPvAq5Q6bef4B" target="_blank" rel="noopener">Try this script in Sievepad</a></p>
<!-- /sievepad -->

The script takes effect once it is selected with the [`script`](/docs/ref/object/mta-stage-rcpt#script) field of MtaStageRcpt.

## Incoming notifications and DKIM2

Forged DSNs are a common way to deliver unwanted mail. A server cannot tell from a DSN alone whether it really sent the message being reported, so a spammer can disguise a message as a bounce of mail the recipient never sent. [DKIM2](/docs/mta/authentication/dkim/dkim2) closes this gap, because a DKIM2-signed DSN returns the signed original, and the original sender can check its own signature on it.

Stalwart applies this check when three conditions hold:

- A DSN signed with DKIM2 arrives.
- `dkimVerify` is enabled, as it is with its default of <!-- default:SenderAuth.dkimVerify -->`relaxed`<!-- /default -->.
- The message that the DSN returns is also signed with DKIM2.

Stalwart then verifies that both chains of signatures are valid and that the DSN reports a message this server sent. A DSN that fails these checks is refused with `550 5.7.1 DSN rejected due to DKIM2 verification failure.`

A check can also fail to complete because a public key lookup failed temporarily. The outcome then depends on the mode of `dkimVerify`. When it is `strict`, the DSN is refused with `451 4.7.5 Unable to verify DKIM2 DSN, try again later.` In `relaxed` mode, the DSN is accepted, and the result is logged as `smtp.dkim2-fail`.

Each refusal is logged as [`smtp.dkim2-dsn-rejected`](/docs/ref/events#smtp), with the reason in its details. The exact conditions are listed in [DKIM2](/docs/mta/authentication/dkim/dkim2#delivery-status-notifications).

The DSNs that Stalwart sends are new messages, so they carry no DKIM2 chain of their own, and their DKIM2 signature starts a chain at `i=1`. They are signed with DKIM2 only when their `From` header field is Authentic for the signing domain. Otherwise they are sent without DKIM2 header fields ([Reports and notifications](/docs/mta/authentication/dkim/dkim2#reports-and-notifications)).
