---
sidebar_position: 7
title: "Variables"
description: "The variables available to expressions in each context: SMTP session stages, the outbound queue, reports, HTTP requests, sub-addressing and the spam filter."
---

An [expression](/docs/configuration/expressions/) computes a setting from the operation it is evaluated for. A rate limit might depend on the client's address, or a route on the envelope sender. Expressions reach this data through variables.

Which variables are available depends on the setting, because each expression is evaluated at a particular point of an operation, and only what is known at that point can be used. An expression evaluated when an SMTP client connects, for example, knows the client's address but not the recipients, which arrive later. The set of variables available to a setting is called its variable context.

Each expression-valued field on the reference pages names its variable context. An expression that uses a variable outside its context is refused when the setting is saved, so a mistake of this kind is caught before it can take effect.

## Contexts

The following table lists each variable context and the settings that use it. The reference page of each context lists its variables with their meaning. The sections after the table explain how the contexts relate to each other.

| Context | Used by | Variables |
|---|---|---|
| [MtaConnectionVariable](/docs/ref/expression/variable/mta-connection-variable) | Inbound session limits, the connect and EHLO stages, the SPF and reverse IP checks | Connection variables |
| [MtaEhloVariable](/docs/ref/expression/variable/mta-ehlo-variable) | The AUTH stage | Connection variables, `helo_domain` |
| [MtaMailFromVariable](/docs/ref/expression/variable/mta-mail-from-variable) | The MAIL stage, SMTP extensions, `mustMatchSender`, SPF report settings | Connection variables, `sender`, `sender_domain`, `authenticated_as` |
| [MtaRcptToVariable](/docs/ref/expression/variable/mta-rcpt-to-variable) | The RCPT and DATA stages, DKIM signing, milters, hooks, inbound throttles, the system Sieve interpreter, DKIM report settings, the frequencies of DMARC reports and the DMARC failure report settings | Connection variables and all SMTP session variables |
| [MtaRcptVariable](/docs/ref/expression/variable/mta-rcpt-variable) | The `Custom` [sub-addressing](/docs/domains/addresses#sub-addressing) rule of a domain | `rcpt`, the local part of the address |
| [MtaRcptDomainVariable](/docs/ref/expression/variable/mta-rcpt-domain-variable) | The sender, organisation, contact and size settings of DMARC and TLS aggregate reports, the report submitter | `rcpt_domain`, the domain the report is about |
| [MtaQueueRcptVariable](/docs/ref/expression/variable/mta-queue-rcpt-variable) | Outbound route and schedule | Queue variables of a recipient |
| [MtaQueueHostVariable](/docs/ref/expression/variable/mta-queue-host-variable) | Outbound connection and TLS strategies, outbound throttles, queue quotas, the frequency of TLS reports | Queue variables of a recipient, `mx`, `remote_ip`, `local_ip` |
| [MtaQueueSenderVariable](/docs/ref/expression/variable/mta-queue-sender-variable) | DSN settings, the DKIM signing domain of DMARC and TLS aggregate reports and of Sieve-generated messages | `sender`, `sender_domain`, `priority`, `recipients` |
| [HttpVariable](/docs/ref/expression/variable/http-variable) | HTTP [access control](/docs/http/access-control) | Connection variables, request variables |
| [SpamDefaultVariable](/docs/ref/expression/variable/spam-default-variable) and the other `Spam*Variable` contexts | Spam filter rules and DNSBL servers | Message variables plus those of the element being checked |
| [SpamAiVariable](/docs/ref/expression/variable/spam-ai-variable) | The condition and sample rate of the [AI spam classifier](/docs/spamfilter/ai/) | Message variables, `spam_score`, `spam_threshold` |

## SMTP session variables

The SMTP session contexts build on each other, because each stage of the session adds what the client has sent in it. The connection variables, such as `remote_ip`, `local_port`, `is_tls` and `listener`, are known from the start. `helo_domain` is added at `EHLO`. `sender`, `sender_domain` and `authenticated_as` are added at `MAIL FROM`, and the recipient variables at `RCPT TO`.

Two connection variables come from outside the session. `asn` and `country` come from the [ASN and GeoIP](/docs/server/asn) data. When the address is not found there, they hold `0` and an empty string.

A message can have many recipients, and the RCPT and DATA contexts offer them in two forms. `rcpt` and `rcpt_domain` hold the most recent recipient, lowercased. `recipients` lists all recipients accepted so far.

`priority` holds the value that the client requested with the MT-PRIORITY extension, as a number from `-9` to `9`. When the client did not request one, it holds `0`. Because it is always a number, it can be compared with numbers, as in `priority > 0`, and used in arithmetic.

## Queue variables

Queue expressions are evaluated for a queued message, and the three queue contexts differ in how much of the delivery they describe.

The recipient context describes one recipient of the message. It holds the recipient's address, the message's sender and priority, and how the message was received. It also holds the delivery attempts made so far for the recipient, in `retry_num`, `notify_num`, `last_status`, `last_error` and `expires_in`.

The host context adds the host being tried, in `mx`, `remote_ip` and `local_ip`. Until a host has been selected, `mx` is empty and the addresses are `0.0.0.0`.

In both of these contexts, `rcpt` differs from the SMTP session: it keeps the case of the local part as received, and only its domain is lowercased.

The sender context offers only `sender`, `sender_domain`, `priority` and `recipients`, because it is evaluated once for a whole message. `recipients` lists every recipient of the original message, not only those that a notification reports on.

The narrow context follows from what the settings describe. A delivery status notification reports on all recipients of a message together, whether they failed, were delayed or were delivered. Values that belong to one recipient, such as `retry_num` or `last_status`, therefore have no single value when the notification's settings are evaluated.

`source` records how the message entered the queue. With it, a strategy can treat locally generated mail differently from submitted mail. It takes one of the following values:

- `authenticated`: submitted by an authenticated sender.
- `dmarc_pass`: received from an unauthenticated sender and passing DMARC.
- `unauthenticated`: received from an unauthenticated sender that did not pass DMARC.
- `dsn`: a delivery status notification.
- `report`: a DMARC or other report.
- `autogenerated`: an iMIP message, an automatic reply or a similar generated message.
- `unknown`: none of the above.

## Report variables

The settings of DMARC and TLS aggregate reports are evaluated at different points, so they use different contexts.

The settings that describe a report, such as its sender, organisation and contact address, are evaluated when the report is generated, for the domain it is about. Their only variable is `rcpt_domain`.

The DKIM signing domain of both reports is evaluated later, when the report message is signed, with the sender variables.

The frequencies are evaluated for each event that a report covers. The frequency of TLS reports is evaluated for each delivery to a recipient domain, with the host variables. The frequency of DMARC reports is evaluated for each received message, with the RCPT TO variables, as described in [DMARC reports](/docs/mta/reports/dmarc).

## HTTP variables

HTTP access control expressions use the connection variables, apart from `asn` and `country`. They add the variables of the request: `url`, `path`, `headers` and `method`.

Some of these hold their values in a particular form. In HTTP expressions, `protocol` is `https` on a TLS connection and `http` otherwise. `url` is the request target as received, which is the path and the query string, without scheme and host. `headers` is an array of `Name: value` strings.

## Spam filter variables

The spam filter evaluates its rules and DNSBL lookups against the message as a whole, and against individual elements of it, such as each URL or each address.

Every spam filter context offers the message variables, which the [SpamDefaultVariable](/docs/ref/expression/variable/spam-default-variable) page lists. They describe the client, the envelope, the address headers, the subject and the body. Two of them describe the check itself: `location` holds where the element being checked was found, and `spam_probability` holds the probability that the spam classifier assigned to the message.

Rules and DNSBL lookups that check one element add the variables of that element, which the reference page of each context lists. Most of these variables are named after the part of the element they hold, and the following table describes the others. Several elements also offer `value` as a generic name for the element itself, next to its specific name:

| Context | Element | Variables |
|---|---|---|
| [SpamUrlVariable](/docs/ref/expression/variable/spam-url-variable) | URLs | `url` and `value` hold the URL, and `url_original` the URL as it appeared in the message, before redirects were followed. The other variables hold the parts of the URL, and `sld` the registered domain of its host. |
| [SpamEmailVariable](/docs/ref/expression/variable/spam-email-variable) | Email addresses | `email` and `value` hold the address, and `name` its display name. The other variables hold the parts of the address, and `sld` the registered domain of its domain part. |
| [SpamIpVariable](/docs/ref/expression/variable/spam-ip-variable) | IP addresses | `ip` and `value` hold the address, and `ip_reverse` the address in the reversed form used for DNSBL queries, such as `1.0.0.127` for `127.0.0.1` (reversed nibbles for IPv6). `octets` holds its bytes as an array of integers, and `is_v4` and `is_v6` its version. |
| [SpamHeaderVariable](/docs/ref/expression/variable/spam-header-variable) | Headers | `name` holds the header name and `value` its parsed value: the addresses of an address header, the type and subtype of `Content-Type`, and a date in RFC 3339 form. `attributes` holds the display names of an address header and the `name=value` parameters of `Content-Type`, and `raw` the value as it appears in the message. Each `_lower` variant holds the lowercased form. |
| [SpamGenericVariable](/docs/ref/expression/variable/spam-generic-variable) | Other values | `value` holds the value being checked. |

The [AI spam classifier](/docs/spamfilter/ai/) context adds two variables of its own. `spam_score` is the score the message has reached, and `spam_threshold` is the score from which it is classified as spam.
