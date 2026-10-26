---
sidebar_position: 1
title: "Overview"
description: "Rewriting the envelope addresses and the content of messages as Stalwart receives them: which mechanism to use for each task."
---

Stalwart can change a message while it receives it. Two parts of a message can be changed. The first is its envelope: the sender and recipient addresses given in the SMTP session, which decide where the message is delivered and where bounces go. The second is its content: the headers and the body that recipients see.

All rewriting happens during the SMTP session, before the message is queued. As a result, the changed message is the one that is delivered, and for outgoing mail it is also the one that is signed with DKIM.

Each kind of change has its own mechanism, and the following table shows which one to use for each task:

| Task | Mechanism | Page |
|---|---|---|
| Change the sender or a recipient address | The `rewrite` expressions of the MAIL FROM and RCPT TO stages, or a system Sieve script | [Envelope](/docs/mta/rewrite/address) |
| Add, change or remove header fields | A system Sieve script at the DATA stage, with the `editheader` extension | [Headers](/docs/mta/rewrite/headers) |
| Change the body, such as adding a disclaimer or removing attachments | A system Sieve script at the DATA stage, with the `mime`, `foreverypart` and `replace` extensions | [Content](/docs/mta/rewrite/content) |
| Any of these, in an external program | A [milter](/docs/mta/filter/milter) or an [MTA hook](/docs/mta/filter/mtahooks) | [Filtering](/docs/mta/filter/) |

Two cautions apply to every content rewrite. First, the DATA-stage script runs for mail received from other servers and for mail submitted by users alike. A script meant for only one direction must therefore test which kind of mail it is handling, as the examples show. Second, rewriting a signed message received from another server invalidates its DKIM signatures, and the next receiver may count the broken signatures against the message.
