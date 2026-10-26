---
sidebar_position: 7
title: "DATA stage"
description: "The DATA stage of an SMTP session: the order in which a received message is checked, filtered and signed, message and header limits, the DATA-stage filters, DKIM signing and the trace headers Stalwart adds."
---

The DATA stage is where the message itself arrives, and where most of the work on it is done. The client transfers the message with the `DATA` command, or with one or more `BDAT` commands when it uses chunking. When the transfer ends, Stalwart checks, filters and signs the message. It then either queues the message and answers `250`, or refuses it. Because the client is still connected, a refusal at this stage reaches the sender at once.

The stage is configured on the [MtaStageData](/docs/ref/object/mta-stage-data) singleton (found in the WebUI under <!-- breadcrumb:MtaStageData --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Session › DATA Stage<!-- /breadcrumb:MtaStageData -->). Its expressions can use the [RCPT TO variables](/docs/ref/expression/variable/mta-rcpt-to-variable). In these expressions, `rcpt` and `rcpt_domain` refer to the last recipient.

## Order of processing

After the message has been received, the following steps run in order. A step that refuses the message ends the processing, and the client receives that step's reply:

1. **Size and header limits**: the [message limits](#message-limits) below.
2. **Loop detection**: a message with more `Received` headers than `maxReceivedHeaders` is refused.
3. **[DKIM](/docs/mta/authentication/dkim/verify)**: the signatures of the message are verified.
4. **[ARC](/docs/mta/authentication/arc)**: the authentication chain of forwarded messages is verified.
5. **[DKIM2](/docs/mta/authentication/dkim/dkim2)**: DKIM2 signatures are verified, and DKIM2-signed delivery status notifications that fail verification are refused.
6. **[DMARC](/docs/mta/authentication/dmarc)**: the DMARC policy of the `From` domain is evaluated, using the SPF result of `MAIL FROM` and the DKIM results. Messages with several author domains are refused.
7. **Reports**: DMARC, TLS and abuse reports addressed to the [report addresses](/docs/mta/reports/analysis) are analysed.
8. **Trace headers**: the `Received`, `Authentication-Results` and `Received-SPF` headers are prepared ([Headers](#headers)).
9. **[Spam filter](/docs/spamfilter/)**: the message is scored, and the `X-Spam-Result` and `X-Spam-Score` headers are added. A message above the reject or discard threshold is refused or dropped here.
10. **[Milters](/docs/mta/filter/milter)**, then **[MTA hooks](/docs/mta/filter/mtahooks)**: external filters can accept, reject or modify the message.
11. **Sieve script**: the DATA-stage [system script](#sieve-script) runs on the message as modified by the milters and hooks.
12. **Final headers**: `Return-Path` is added when configured, and `Date` and `Message-ID` when configured and missing.
13. **Queue**: the [queue quotas](/docs/mta/outbound/quota) are checked, the message is [signed](#dkim-signing) with DKIM and DKIM2, and it is queued. The client receives `250 2.0.0 Message queued with id <id>.`

The order explains what each step can rely on. The authentication checks run before the spam filter, so their results are among the evidence that the filter scores. Milters, MTA hooks and the Sieve script receive the message as the client sent it, without the headers added in steps 8 and 9. The Sieve script runs after the milters and hooks, so it sees their changes, and it receives the authentication results and the spam score as variables.

Not every step runs for every message. Steps that a setting disables are skipped, such as DMARC on the submission ports or the spam filter for authenticated sessions. Messages submitted by users go through the same steps, but with the default settings DMARC is evaluated only on port 25, and the spam filter runs only for unauthenticated sessions.

## Message limits

The first steps check the size and structure of the message, before any other work is done on it, against the following limits:

| Field | Default | Limit | Reply when exceeded |
|---|---|---|---|
| [`maxMessageSize`](/docs/ref/object/mta-stage-data#maxmessagesize) | <!-- default:MtaStageData.maxMessageSize as=size -->100 MiB<!-- /default --> | Size of a message, advertised to clients with `SIZE`. `0` removes the limit and the advertisement. | `552 5.3.4 Message too big for system.` |
| [`maxMessages`](/docs/ref/object/mta-stage-data#maxmessages) | <!-- default:MtaStageData.maxMessages -->`10`<!-- /default --> | Messages per session. | `452 4.4.5 Maximum number of messages per session exceeded.` |
| [`maxReceivedHeaders`](/docs/ref/object/mta-stage-data#maxreceivedheaders) | <!-- default:MtaStageData.maxReceivedHeaders -->`50`<!-- /default --> | `Received` headers in a message, a sign of a mail loop when exceeded. | `450 4.4.6 Too many Received headers. Possible loop detected.` |
| [`maxHeaderSize`](/docs/ref/object/email#maxheadersize) on Email | <!-- default:Email.maxHeaderSize -->512 KiB<!-- /default --> | Size of the top-level header section. | `552 5.3.4 Message header too large.` |
| [`maxHeaderCount`](/docs/ref/object/email#maxheadercount) on Email | <!-- default:Email.maxHeaderCount -->5000<!-- /default --> | Header fields in the top-level header section. In addition, a message may have at most 65534 header fields across all its parts. | `552 5.3.4 Message header too large.` |

Each field of MtaStageData is an [expression](/docs/configuration/expressions/), a rule evaluated for each message that returns the value to apply. The size limit can therefore differ, for example, between port 25 and the submission ports. The following object body accepts messages up to 50 MiB on port 25 and up to 25 MiB elsewhere:

```json
{
  "maxMessageSize": {
    "match": {"0": {"if": "local_port == 25", "then": "52428800"}},
    "else": "26214400"
  }
}
```

The header limits work differently. They are fields of the [Email](/docs/ref/object/email) singleton, not of MtaStageData, and they apply to every protocol ([Message and mailbox limits](/docs/email/settings/jmap)). At the DATA stage, they apply to messages received from SMTP clients. An exceeded limit is logged as `smtp.message-too-large`.

The size limit of the DATA stage applies to messages in transit. The size of a message stored in a mailbox is limited separately, by [`maxMessageSize`](/docs/ref/object/email#maxmessagesize) on the Email singleton.

## Spam filtering

[`enableSpamFilter`](/docs/ref/object/mta-stage-data#enablespamfilter) decides whether the [spam filter](/docs/spamfilter/) runs for a message. The default, <!-- default:MtaStageData.enableSpamFilter -->`is_empty(authenticated_as)`<!-- /default -->, filters mail from unauthenticated sessions and skips mail from authenticated users. The filter can also be limited to particular listeners. The following object body filters only the mail received on the listener named `smtp`:

```json
{
  "enableSpamFilter": {"else": "listener == 'smtp'"}
}
```

## Sieve script

A system [Sieve script](/docs/sieve/interpreter/trusted) at this stage can act on the complete message, which the earlier stages never see. [`script`](/docs/ref/object/mta-stage-data#script) selects the script to run on the message. The script sees the following:

- The whole message as the client sent it, with the changes made by milters and MTA hooks, but without the trace and spam filter headers that Stalwart adds
- All the recipients, in `envelope.to`
- The authentication results and the spam score, as environment variables ([Variables](/docs/sieve/variables))

The script can reject the message or discard it. It can also modify it with `addheader`, `deleteheader`, `replace` and the other editing extensions, and the modified message is the one that is queued.

The same script runs for messages received from other servers and for messages submitted by users. A script meant only for outgoing mail must therefore tell the two apart: it tests `env.authenticated_as`, or it is selected only for the submission ports. The following expression runs a script named `outgoing` for authenticated sessions only:

```json
{
  "script": {
    "match": {"0": {"if": "!is_empty(authenticated_as)", "then": "'outgoing'"}},
    "else": "false"
  }
}
```

[Header rewriting](/docs/mta/rewrite/headers), [Content rewriting](/docs/mta/rewrite/content) and [Sieve examples](/docs/sieve/examples) give scripts for common tasks.

## DKIM signing

Signing a message with DKIM lets receiving servers verify that the signing domain sent it. [`dkimSignDomain`](/docs/ref/object/mta-stage-data#dkimsigndomain) decides which domain signs the message with [DKIM](/docs/mta/authentication/dkim/) and [DKIM2](/docs/mta/authentication/dkim/dkim2), or returns `false` for no signature. The default signs with the sender's domain when the session is authenticated and the domain is hosted on the server:

```json
{
  "dkimSignDomain": {
    "match": {"0": {"if": "is_local_domain(sender_domain) && !is_empty(authenticated_as)", "then": "sender_domain"}},
    "else": "false"
  }
}
```

As a result, relayed messages from unauthenticated sessions are not signed. [DKIM signing](/docs/mta/authentication/dkim/sign) describes how to change the expression and how the keys of the domain are selected.

## Headers

Stalwart adds trace headers to the messages it accepts. These headers record where a message came from and how it was authenticated. Each of the following fields is an expression, and by default each adds its header only on port 25, where messages arrive from other servers:

| Field | Header |
|---|---|
| [`addReceivedHeader`](/docs/ref/object/mta-stage-data#addreceivedheader) | `Received`, with the client's name and address and the TLS version used. |
| [`addAuthResultsHeader`](/docs/ref/object/mta-stage-data#addauthresultsheader) | `Authentication-Results`, with the SPF, DKIM, DKIM2, DMARC and reverse DNS results. |
| [`addReceivedSpfHeader`](/docs/ref/object/mta-stage-data#addreceivedspfheader) | `Received-SPF`, with the SPF result for the sender, when SPF was checked. |
| [`addReturnPathHeader`](/docs/ref/object/mta-stage-data#addreturnpathheader) | `Return-Path`, with the envelope sender. |
| [`addDateHeader`](/docs/ref/object/mta-stage-data#adddateheader) | `Date`, when the message has none. |
| [`addMessageIdHeader`](/docs/ref/object/mta-stage-data#addmessageidheader) | `Message-ID`, when the message has none. |

One header is controlled differently. [`addDeliveredToHeader`](/docs/ref/object/mta-stage-data#adddeliveredtoheader) is a plain Boolean rather than an expression, and it is <!-- default:MtaStageData.addDeliveredToHeader as=enabled -->enabled<!-- /default --> by default. It adds a `Delivered-To` header with the recipient's address when a message is stored in a local mailbox.

Mail clients normally create the `Date` and `Message-ID` headers themselves. Some applications submit messages without them, and for these the two headers can be enabled on the submission ports as well. The following object body adds them for every message:

```json
{
  "addDateHeader": {"else": "true"},
  "addMessageIdHeader": {"else": "true"}
}
```
