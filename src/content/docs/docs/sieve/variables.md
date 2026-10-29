---
sidebar_position: 3
title: "Variables"
description: "Environment and envelope variables available to system scripts at each SMTP stage and to user scripts at delivery."
---

Many filtering decisions depend on how a message arrived rather than on what it says: which client sent it, whether the session was encrypted, whether the sender passed SPF or DMARC. Besides the variables a script defines itself, a Sieve script can therefore read values that describe the SMTP session and the message envelope.

How much a script can read depends on where it runs. System scripts, which run during the SMTP session in the [trusted interpreter](/docs/sieve/interpreter/trusted), see the most. User scripts, which run at delivery in the [untrusted interpreter](/docs/sieve/interpreter/untrusted), see the envelope only. Which values exist also depends on the stage at which the script runs, as described in [Execution points](/docs/sieve/#execution-points).

## Environment

The session values are read as `env.<name>`. They can be used in an expression, or in a string with the `${env.<name>}` syntax of the variables extension. A value becomes available at the stage where the server learns it, so the DKIM, ARC and DMARC results, for example, exist only at DATA. The following variables are set for system scripts:

| Variable | Stages | Value |
|---|---|---|
| `env.remote_ip` | all | IP address of the SMTP client. |
| `env.remote_ip.reverse` | all | The client IP address in reverse notation, for building DNS list queries. |
| `env.helo_domain` | all, once sent | Domain given in the `EHLO` or `LHLO` command, in lower case. |
| `env.authenticated_as` | all | Name of the authenticated account, or empty. |
| `env.asn` | all | Autonomous system number of the client IP address, or `0` when unknown. |
| `env.country` | all | Country code of the client IP address, when known. |
| `env.tls.version` | all | TLS version of the connection, empty on a cleartext connection. |
| `env.tls.cipher` | all | TLS cipher suite of the connection. |
| `env.stage` | all | The current stage: `connect`, `ehlo`, `mail`, `rcpt` or `data`. |
| `env.now` | all | Current time, in seconds since the Unix epoch. |
| `env.spf_ehlo.result` | all | Result of the [SPF](/docs/mta/authentication/spf) check of the EHLO domain, empty when no check was made. |
| `env.spf.result` | all | Result of the SPF check of the MAIL FROM address, empty when no check was made. |
| `env.iprev.result` | after MAIL FROM | Result of the [reverse DNS](/docs/mta/authentication/iprev) check, set only when the check ran. |
| `env.iprev.ptr` | after MAIL FROM | Host name found by the reverse DNS check, in lower case, set only when a PTR record was found. |
| `env.param.body` | after MAIL FROM | `BODY` parameter of the `MAIL FROM` command: `7bit`, `8bitmime` or `binarymime`. |
| `env.param.smtputf8` | after MAIL FROM | `1` when the `SMTPUTF8` parameter was given. |
| `env.param.requiretls` | after MAIL FROM | `1` when the `REQUIRETLS` parameter was given. |
| `env.dkim.result` | DATA | Result of [DKIM](/docs/mta/authentication/dkim/) verification: the first passing result, otherwise the first result, or empty for an unsigned message. |
| `env.dkim.domains` | DATA | List of the domains whose DKIM signatures passed verification, in lower case. |
| `env.arc.result` | DATA | Result of [ARC](/docs/mta/authentication/arc) verification. |
| `env.dmarc.result` | DATA | Result of the [DMARC](/docs/mta/authentication/dmarc) check. |
| `env.dmarc.policy` | DATA | The DMARC policy of the From domain: `none`, `quarantine` or `reject`. |
| `env.spam.score` | DATA | Score computed by the [spam filter](/docs/spamfilter/), set only when the filter ran and accepted the message. |
| `env.spam.is_spam` | DATA | Whether the score reached the spam threshold, set under the same condition. |

The authentication results take the values that also appear in the `Authentication-Results` header, such as `pass`, `fail`, `softfail`, `neutral`, `none`, `temperror` and `permerror`. A script can therefore test them with the same vocabulary that receivers use. When the spam filter ran at DATA, a system script can also use the `spamtest` extension.

User scripts have no access to these session variables. Both interpreters do provide the standard values of the environment extension ([RFC 5183](https://www.rfc-editor.org/rfc/rfc5183)) through the `environment` test. Examples are `name` (`Stalwart Server`), `version`, `location` (`MS`) and `phase` (`during`).

## Envelope

The envelope is the addressing information that the SMTP client gives, as distinct from the headers inside the message: the return path and the recipients, with their parameters. It is read with the `envelope` test, or as `envelope.<name>` variables. In system scripts, the envelope exists from the MAIL FROM stage onwards, and the recipients accumulate as the session proceeds:

| Variable | Value |
|---|---|
| `envelope.from` | The return path from `MAIL FROM`, in lower case; empty for the null sender `<>`. |
| `envelope.to` | At MAIL FROM, empty; at RCPT TO, the recipient being added; at DATA, the list of all accepted recipients. |
| `envelope.orcpt` | The `ORCPT` parameter of the recipients, in the same form as `envelope.to`: one value at RCPT TO, a list in the same order as `envelope.to` at DATA. |
| `envelope.envid` | The `ENVID` parameter of `MAIL FROM`. |
| `envelope.ret` | The `RET` parameter of `MAIL FROM`: `FULL` or `HDRS`. |
| `envelope.by_mode` | The mode of the `BY` parameter of the deliver-by extension: `N` or `R`. |

Some envelope variables defined by the Sieve extensions are never set: the `NOTIFY` parameter (`envelope.notify`), the deliver-by time values (`envelope.by_time_absolute` and `envelope.by_time_relative`) and the trace flag (`envelope.by_trace`).

A user script runs for a single recipient, so its view of the envelope is narrower. It sees three envelope parts. `from` is the return path of the message. `to` is the address of the recipient whose script is running. `orcpt` is the original recipient: the address as it was written before Stalwart rewrote it, for instance by removing a sub-address or expanding a mailing list, or otherwise the `ORCPT` parameter supplied by the sending server. It is prefixed with the address type, as in `rfc822;jane+shop@example.org`, and is absent when neither applies.

A user script cannot change the envelope sender. Setting `envelope.from` has no effect on the message, or on any reply the script sends.
