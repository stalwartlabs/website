---
sidebar_position: 1
title: "Overview"
description: "The Stalwart SMTP server: how mail flows from a listener through the session stages, filters and queue to delivery, and which listeners serve MX, submission and LMTP traffic."
---

The message transfer agent (MTA) of Stalwart is its SMTP server, the part of Stalwart that moves mail between systems. It has three jobs. It receives mail that other servers deliver for the domains it hosts. It accepts the mail that users submit for sending. And it delivers both kinds of mail to their destination: to local mailboxes, or over SMTP to the servers responsible for other domains.

Moving mail safely between independent servers takes more than SMTP itself, so the MTA also implements the standards that surround it. The authentication standards (SPF, DKIM, DKIM2, ARC and DMARC) let receivers decide whether a message really comes from the domain it claims. The transport security mechanisms (DANE, MTA-STS and TLS reporting) protect delivery between servers against interception. Finally, a set of extension points (Sieve scripts, milters and MTA hooks) lets administrators filter and modify mail as it passes through.

## Mail flow

Every message follows the same path through the MTA, from the connection that brings it in to its final delivery. A message passes through the following steps:

1. A client connects to a [listener](#listeners), a port on which Stalwart accepts SMTP or LMTP connections.
2. The SMTP session proceeds through the [connect, EHLO, AUTH, MAIL FROM, RCPT TO and DATA stages](/docs/mta/inbound/). At each stage, settings decide whether the client may continue. At every stage except AUTH, a system [Sieve script](/docs/sieve/), [milters](/docs/mta/filter/milter) and [MTA hooks](/docs/mta/filter/mtahooks) can also inspect the command and reject it. Throughout the session, [throttles](/docs/mta/inbound/rate-limit) limit how fast a client may send.
3. When the message has been transferred, Stalwart verifies its [authentication](/docs/mta/authentication/), analyses incoming reports and prepares its trace headers. It then runs the [spam filter](/docs/spamfilter/) and the DATA-stage filters, and signs the message with [DKIM](/docs/mta/authentication/dkim/). [Message checks at DATA](/docs/mta/inbound/data#order-of-processing) lists these checks in order.
4. The accepted message is written to the [queue](/docs/mta/outbound/queue). Only then does the client receive `250`, the reply that confirms the server has taken responsibility for the message.
5. For each recipient, the [outbound strategy](/docs/mta/outbound/strategy) chooses the route, the schedule, the connection settings and the TLS policy. Messages for local recipients are stored in their mailboxes, where user Sieve scripts run. Messages for other domains are delivered to the domain's MX hosts or to a relay. A failed attempt is retried according to the schedule, and when a message cannot be delivered at all, the sender receives a [delivery status notification](/docs/mta/reports/dsn).

Messages submitted over JMAP follow the same path. They have no network connection, so they enter at the MAIL FROM stage of step 2.

## Submission and relay

The same SMTP server handles two kinds of traffic. They differ in who the client is and in what the client may do.

Incoming mail, also called MX traffic, is mail that other mail servers deliver for the local domains. The client does not authenticate, so it may address only local recipients, and its messages are verified and filtered. This traffic arrives on port 25, because that is where receiving servers expect it.

Submission is the traffic of users and applications that send messages through their own server. Here the client authenticates, and once it has done so it may address any recipient. Its messages are signed with DKIM and relayed to their destination. Submission uses ports 465 and 587.

The port number does not make this distinction on its own. Instead, the default expressions of the stage objects test `local_port`: they apply MX behaviour on port 25 and submission behaviour on every other port. Changing those expressions therefore changes how a port is treated. With the default expressions, the following rules apply:

- Authentication is required on every port except 25 ([AUTH stage](/docs/mta/inbound/auth)).
- Relaying to non-local recipients is allowed only to authenticated sessions ([RCPT TO stage](/docs/mta/inbound/rcpt)).
- SPF, reverse DNS and DMARC checks are performed on port 25.
- The spam filter runs for unauthenticated sessions.

## Listeners

A listener is the network port on which a service accepts connections. The SMTP service is provided by the [NetworkListener](/docs/ref/object/network-listener) objects (found in the WebUI under <!-- breadcrumb:NetworkListener --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › Listeners<!-- /breadcrumb:NetworkListener -->) whose [`protocol`](/docs/ref/object/network-listener#protocol) is `smtp` or `lmtp`. A new installation has two of them, one on port 25 and one on port 465, and the others are added as needed. [Listeners](/docs/server/listener) describes all listener settings.

The following table shows the ports commonly used for mail and how each is set up:

| Port | Use | `implicitTls` | Authentication with default settings | Created by default |
|---|---|---|---|---|
| 25 | Incoming mail from other servers (MX), with `STARTTLS` | `false` | Not offered | Yes |
| 465 | Submission over implicit TLS ([RFC 8314](https://www.rfc-editor.org/rfc/rfc8314)) | `true` | Required | Yes |
| 587 | Submission with `STARTTLS` ([RFC 6409](https://www.rfc-editor.org/rfc/rfc6409)) | `false` | Required, after `STARTTLS` | No |
| 24 | LMTP delivery from another MTA that handles SMTP itself | `false` | Required, unless exempted as described below | No |

The [`implicitTls`](/docs/ref/object/network-listener#implicittls) setting decides when encryption starts. When it is `true`, TLS starts as soon as the client connects. When it is `false`, the connection starts in clear text and the client upgrades it with `STARTTLS`. The following object adds a submission listener on port 587:

```json
{
  "name": "submission",
  "protocol": "smtp",
  "bind": {"[::]:587": true},
  "implicitTls": false
}
```

LMTP ([RFC 2033](https://www.rfc-editor.org/rfc/rfc2033)) is a variant of SMTP for the last step of delivery. It is used when another MTA in front of Stalwart receives the mail and hands it over to Stalwart for storage, and it is needed only in that arrangement. An LMTP listener needs one change to the AUTH stage. The default [`require`](/docs/mta/inbound/auth#mechanisms-and-requirement) expression of that stage, `local_port != 25`, also applies to LMTP sessions, and those sessions cannot authenticate on a cleartext connection. The expression must therefore exempt the LMTP listener, for example as `local_port != 25 && protocol != 'lmtp'`. Otherwise LMTP clients receive `503 5.5.1 You must authenticate first.`

The greeting that clients see when they connect is not a listener setting. It is set by the [`smtpGreeting`](/docs/ref/object/mta-stage-connect#smtpgreeting) expression of the [connect stage](/docs/mta/inbound/connect), although that expression can return a different greeting for each listener.
