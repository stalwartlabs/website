---
sidebar_position: 1
title: "Overview"
description: "The stages of an inbound SMTP session, the limits that apply to the whole session, the memory budget, and the replies Stalwart sends when it rejects or defers a command."
---

Every message that reaches Stalwart over SMTP arrives in a session. A session is one connection from a client, and the client can be another mail server delivering mail to the local domains or a user's mail client submitting mail for sending. During the session, the server decides step by step whether to accept what the client sends. These decisions keep spam out, stop the server from relaying mail for clients that may not use it, and tell the client, through the reply code, why a command was refused.

The session progresses through stages, and each stage corresponds to a command of the protocol. Each stage is configured by its own object, so that different rules can apply at each point of the conversation:

| Stage | Command | Configured on | Decides |
|---|---|---|---|
| [Connect](/docs/mta/inbound/connect) | (connection) | [MtaStageConnect](/docs/ref/object/mta-stage-connect) | The greeting and host name; whether to accept the client. |
| [EHLO](/docs/mta/inbound/ehlo) | `EHLO`, `HELO`, `LHLO` | [MtaStageEhlo](/docs/ref/object/mta-stage-ehlo), [MtaExtensions](/docs/ref/object/mta-extensions) | Whether the client's name is acceptable; which extensions are offered. |
| [AUTH](/docs/mta/inbound/auth) | `AUTH` | [MtaStageAuth](/docs/ref/object/mta-stage-auth) | Whether and how the client may authenticate. |
| [MAIL FROM](/docs/mta/inbound/mail) | `MAIL FROM` | [MtaStageMail](/docs/ref/object/mta-stage-mail) | Whether the sender is accepted; sender rewriting. |
| [RCPT TO](/docs/mta/inbound/rcpt) | `RCPT TO` | [MtaStageRcpt](/docs/ref/object/mta-stage-rcpt) | Whether each recipient is accepted; relaying; recipient rewriting. |
| [DATA](/docs/mta/inbound/data) | `DATA`, `BDAT` | [MtaStageData](/docs/ref/object/mta-stage-data) | Whether the message is accepted, after authentication checks, filtering and signing. |

Most settings of these objects are [expressions](/docs/configuration/expressions/) rather than fixed values. Stalwart evaluates them for each session, with variables that describe it: the listener, the client's IP address and the authenticated account, and, from the stage where they become known, the sender and the recipients. Because of this, a single setting can behave differently on port 25 and on the submission ports, for a particular network, or for authenticated users.

The stage objects are not the only way to act on a session. At every stage except AUTH, a system [Sieve script](/docs/sieve/interpreter/trusted), [milters](/docs/mta/filter/milter) and [MTA hooks](/docs/mta/filter/mtahooks) can inspect the command and reject it. Separately, [throttles](/docs/mta/inbound/rate-limit) limit the rate of connections, senders and recipients.

## Session limits

Some limits apply to the session as a whole rather than to one command. They stop a client from holding a connection open indefinitely or from sending an unbounded amount of data. These limits are fields of the [MtaInboundSession](/docs/ref/object/mta-inbound-session) singleton (found in the WebUI under <!-- breadcrumb:MtaInboundSession --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Inbound › Session<!-- /breadcrumb:MtaInboundSession -->). Each is an expression, so it can depend on the listener or the client:

| Field | Default | Limit | Reply when exceeded |
|---|---|---|---|
| [`idleTimeout`](/docs/ref/object/mta-inbound-session#idletimeout) | <!-- default:MtaInboundSession.idleTimeout as=duration -->5 minutes<!-- /default --> | Time the server waits for the next command. | `221 2.0.0 <host> Disconnecting inactive client.` |
| [`maxDuration`](/docs/ref/object/mta-inbound-session#maxduration) | <!-- default:MtaInboundSession.maxDuration as=duration -->10 minutes<!-- /default --> | Total duration of the session. | `421 4.3.2 <host> Session open for too long.` |
| [`transferLimit`](/docs/ref/object/mta-inbound-session#transferlimit) | <!-- default:MtaInboundSession.transferLimit as=size -->250 MiB<!-- /default --> | Bytes the client may send in the session. | `452 4.7.28 <host> Session exceeded transfer quota.` |

Because the limits are expressions, they can be tighter for unknown servers than for the server's own users. The following object body gives clients on port 25 one minute between commands and authenticated clients ten:

```json
{
  "idleTimeout": {
    "match": {"0": {"if": "local_port == 25", "then": "1m"}},
    "else": "10m"
  }
}
```

Other limits concern a single message rather than the whole session. The size of a message is limited at the [DATA](/docs/mta/inbound/data#message-limits) stage, which also limits the number of messages per session. The number of recipients is limited at the [RCPT TO](/docs/mta/inbound/rcpt) stage.

## Memory budget

Stalwart buffers incoming messages in memory, and it limits the memory used for this buffering. The limit is [`maxBufferedMemory`](/docs/ref/object/system-settings#maxbufferedmemory) on the [SystemSettings](/docs/ref/object/system-settings) singleton. When the setting is not set, the budget is one quarter of the memory available to the server, and a container's memory limit is taken into account.

When the budget is exhausted, the server defers new messages instead of accepting them. `MAIL FROM`, `DATA` and `BDAT` are answered with `452 4.3.1 Insufficient system storage, try again later.`, and the event `limit.memory-budget` is logged as a warning. Sending servers retry later, so no mail is lost. A server that logs this event frequently, however, has too little memory for its load. [Sizing memory](/docs/performance/memory) describes the budget and how to size it.

## Rejections and deferrals

When Stalwart refuses a command, the reply code tells the client how to proceed. A `5xx` code means that the refusal is permanent, so the client must not try again. A `4xx` code means that it is temporary, and the client should retry later. The following table lists the replies most often seen in logs and bounce messages, with the check that produces each of them:

| Reply | Stage | Cause |
|---|---|---|
| `550 5.5.0 Invalid EHLO domain.` | EHLO | The EHLO name is not a fully qualified domain name and [`rejectNonFqdn`](/docs/mta/inbound/ehlo) is enabled (the default on port 25). |
| `503 5.5.1 Polite people say EHLO first.` | MAIL FROM | The client sent `MAIL FROM` without `EHLO`. |
| `503 5.5.1 You must authenticate first.` | MAIL FROM | The port requires [authentication](/docs/mta/inbound/auth) (every port except 25 by default). |
| `535 5.7.8 Authentication credentials invalid.` | AUTH | Wrong credentials, or an account whose domain is served by another directory. |
| `550 5.7.1 Your account is not authorized to use this service.` | AUTH | The account may not send mail, or the access token lacks the `mail` scope ([AUTH stage](/docs/mta/inbound/auth#failures)). |
| `501 5.5.4 You are not allowed to send from this address.` | MAIL FROM | The sender address does not belong to the authenticated account ([`mustMatchSender`](/docs/mta/inbound/auth#sender-verification)). |
| `550 5.7.1 Sender address not allowed.` | MAIL FROM | The sender is refused by [`isSenderAllowed`](/docs/mta/inbound/mail). |
| `550 5.7.23 SPF validation failed, status: <result>.` | EHLO, MAIL FROM | Strict [SPF](/docs/mta/authentication/spf) verification failed. `451 4.7.24` for a temporary DNS error. |
| `550 5.7.25 Reverse DNS validation failed.` | MAIL FROM | Strict [reverse DNS](/docs/mta/authentication/iprev) verification failed. `451 4.7.25` for a temporary error. |
| `550 5.1.1 Mailbox does not exist.` | RCPT TO | The recipient is not a local address. |
| `550 5.7.1 Relay not allowed.` | RCPT TO | The recipient is in a domain that is not local, and the session may not relay ([RCPT TO](/docs/mta/inbound/rcpt)). |
| `452 4.2.2 Greylisted, please try again in a few moments.` | RCPT TO | [Greylisting](/docs/spamfilter/greylist): the first attempt from this sender to this recipient. |
| `452 4.4.5 Rate limit exceeded, try again later.` | MAIL FROM, RCPT TO | A [throttle](/docs/mta/inbound/rate-limit) was exceeded. |
| `455 4.5.3 Too many recipients.` | RCPT TO | The message has more recipients than [`maxRecipients`](/docs/mta/inbound/rcpt). |
| `552 5.3.4 Message too big for system.` | MAIL FROM, DATA | The message exceeds the [maximum message size](/docs/mta/inbound/data#message-limits). |
| `552 5.3.4 Message header too large.` | DATA | The header section exceeds the [header limits](/docs/mta/inbound/data#message-limits). |
| `550 5.7.20 No passing DKIM signatures found.` | DATA | Strict [DKIM](/docs/mta/authentication/dkim/verify) verification found no valid signature. `451 4.7.20` for a temporary error. |
| `550 5.7.29 ARC validation failed.` | DATA | Strict [ARC](/docs/mta/authentication/arc) verification failed. `451 4.7.29` for a temporary error. |
| `550 5.7.7 Failed to parse message.` | DATA | The message could not be parsed. |
| `550 5.7.1 DSN rejected due to DKIM2 verification failure.` | DATA | A delivery status notification signed with [DKIM2](/docs/mta/authentication/dkim/dkim2) fails verification or does not concern a message this server sent. `451 4.7.5 Unable to verify DKIM2 DSN, try again later.` for a temporary DNS error when `dkimVerify` is `strict`. |
| `451 4.7.5 Unable to verify DKIM2 signatures, try again later.` | DATA | The [DKIM2](/docs/mta/authentication/dkim/dkim2#broken-chains) chain could not be verified because of a temporary DNS error, `dkimVerify` is `strict`, and the message has a recipient on another system and would be signed with DKIM2. |
| `550 5.7.1 Email rejected per DMARC policy.` | DATA | [DMARC](/docs/mta/authentication/dmarc) failed and the domain's policy is `reject`. `451 4.7.1` for a temporary error. |
| `550 5.7.1 Multiple author domains in From header are not allowed.` | DATA | The `From` header holds addresses in several domains ([DMARC](/docs/mta/authentication/dmarc#messages-with-several-author-domains)). |
| `550 5.7.1 Message rejected due to excessive spam score.` | DATA | The [spam filter](/docs/spamfilter/) score reached the reject threshold, or a reject tag matched. |
| `450 4.4.6 Too many Received headers. Possible loop detected.` | DATA | The message has passed through more servers than [`maxReceivedHeaders`](/docs/mta/inbound/data#message-limits) allows. |
| `452 4.3.1 Mail system full, try again later.` | DATA | A [queue quota](/docs/mta/outbound/quota) is exhausted. |
| `452 4.3.1 Insufficient system storage, try again later.` | MAIL FROM, DATA | The [memory budget](#memory-budget) is exhausted. |
| `503 5.5.3 <text>` | any | A Sieve script rejected the command with a text that does not start with a reply code ([Trusted interpreter](/docs/sieve/interpreter/trusted#replies-and-actions)). |

Each rejection is also logged as an event, with the client's address and the reason. Many of these events are logged at the `debug` level, among them failed authentication (`auth.failed`), refused senders (`smtp.mail-from-unauthorized`, `smtp.mail-from-not-allowed`), spam filter rejections and Sieve rejections. A tracer at the default `info` level therefore does not show them. To investigate a rejection, raise the level of the tracer as described in [Telemetry](/docs/telemetry/).
