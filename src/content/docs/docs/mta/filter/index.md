---
sidebar_position: 1
title: "Overview"
description: "The four ways to filter mail in Stalwart (the spam filter, system and user Sieve scripts, milters and MTA hooks), the stages at which each runs, and the order in which they run at DATA."
---

Most mail systems need to look at messages as they arrive: to score spam, to scan for viruses, to enforce a policy or to sort mail into folders. Stalwart offers several mechanisms for this, and each of them can inspect, reject and modify messages. The mechanisms differ in two ways: who writes the logic, and where that logic runs.

- The built-in spam filter is part of the server.
- Sieve scripts are written in the Sieve filtering language and run inside the server.
- External filters run as separate programs and are reached over the network, either through the milter protocol or through HTTP MTA hooks.

The mechanisms can be combined. A common arrangement uses the spam filter for scoring, a milter such as ClamAV for virus scanning, and user Sieve scripts for sorting. The following table compares them:

| Mechanism | Logic written as | Runs at | Can |
|---|---|---|---|
| [Spam filter](/docs/spamfilter/) | Built-in analyses and rules expressed as [expressions](/docs/configuration/expressions/) | DATA | Score, tag, reject or discard the message |
| [System Sieve scripts](/docs/sieve/interpreter/trusted) | Sieve, installed by the administrator | Connect, EHLO, MAIL FROM, RCPT TO, DATA | Reject commands or the message; modify headers and content |
| [Milters](/docs/mta/filter/milter) | Any program speaking the Sendmail milter protocol | Connect, EHLO, MAIL FROM, RCPT TO, DATA | Accept, reject, discard or quarantine; at DATA also modify the envelope, headers and body |
| [MTA hooks](/docs/mta/filter/mtahooks) | Any HTTP service receiving and returning JSON | Connect, EHLO, MAIL FROM, RCPT TO, DATA | The same as milters |
| [User Sieve scripts](/docs/sieve/interpreter/untrusted) | Sieve, uploaded by each user | Delivery to the user's mailbox | File, flag, forward, reply to or discard the message for that user |

One important difference is when each mechanism runs. All of them except user scripts run during the SMTP session, while the client is still connected. A rejection is therefore reported to the sender at once, in the SMTP reply. User scripts run later, when the message is delivered to the mailbox.

The mechanisms also differ in which mail they see. System Sieve scripts, milters and hooks run for every SMTP session, including authenticated submissions, and for messages submitted over JMAP. The spam filter, with its default settings, runs only for unauthenticated sessions.

None of these mechanisms runs when the queue delivers a message to another server, so Stalwart has no outbound filtering stage. Outgoing mail is filtered instead at the point where it is submitted.

## Order at DATA

The DATA stage is where most filtering happens, because it is the first point at which the whole message is available. When a message has been received, the mechanisms run in the following order:

1. The [authentication checks](/docs/mta/authentication/) (DKIM, ARC, DKIM2, DMARC).
2. The spam filter, which adds its `X-Spam-Result` and `X-Spam-Score` headers.
3. The milters, in the order in which they are defined.
4. The MTA hooks, in the order in which they are defined.
5. The DATA-stage system Sieve script, which sees the message with the changes made by the milters and hooks.
6. After the message has been queued and is delivered locally, the recipient's user Sieve script.

The order determines what each mechanism sees. The milters, the hooks and the DATA-stage Sieve script receive the message as the client sent it, without the headers that Stalwart adds (`Received`, `Authentication-Results` and the spam filter's headers). The milters and hooks do not see each other's changes. The Sieve script, however, sees the message with those changes applied, and it receives the authentication results and the spam score as variables.

[DATA stage](/docs/mta/inbound/data#order-of-processing) gives the complete sequence of the stage, including the steps that are not filters.
