---
sidebar_position: 8
title: "AUTH stage"
description: "SMTP authentication: the SASL mechanisms offered on each port, when authentication is required, the TLS rule for OAuth tokens and API keys, failure handling, and what mustMatchSender checks."
---

Users and applications that submit mail must prove who they are before the server sends their messages on. They do this with the SMTP `AUTH` command, before they start a message. Authentication lets the server identify the account, and that identity decides what the client may do: an authenticated client may relay mail to other domains, and its messages are signed with the account's domain.

SMTP authentication uses SASL, a framework of interchangeable authentication mechanisms. Stalwart supports four of them. `PLAIN` and `LOGIN` carry a user name and a password. `OAUTHBEARER` ([RFC 7628](https://www.rfc-editor.org/rfc/rfc7628)) and `XOAUTH2` carry an OAuth access token or an [API key](/docs/auth/authentication/api-key) instead. The stage is configured on the [MtaStageAuth](/docs/ref/object/mta-stage-auth) singleton (found in the WebUI under <!-- breadcrumb:MtaStageAuth --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Session › AUTH Stage<!-- /breadcrumb:MtaStageAuth -->).

## Mechanisms and requirement

Two separate decisions govern authentication: which mechanisms the server offers, and whether the client must use one of them.

The first is [`saslMechanisms`](/docs/ref/object/mta-stage-auth#saslmechanisms). It is an expression that returns the list of mechanisms offered to the client in the `EHLO` response, or `false` to offer none. The default offers all four mechanisms on encrypted connections to any port except 25, and none otherwise:

```json
{
  "saslMechanisms": {
    "match": {"0": {"if": "local_port != 25 && is_tls", "then": "[plain, login, oauthbearer, xoauth2]"}},
    "else": "false"
  }
}
```

The default follows from the role of each port. Port 25 is where other mail servers deliver, and they do not authenticate, so authentication is not offered there. On the submission ports, authentication is offered only once TLS is established, implicitly on port 465 or with `STARTTLS` on port 587. As a result, credentials never travel in the clear.

The token-based mechanisms follow a stricter rule that no expression can relax. On a connection without TLS, `OAUTHBEARER` and `XOAUTH2` are removed from the list whatever the expression returns, so they are neither advertised nor accepted. The same rule applies to IMAP, POP3 and ManageSieve.

Two details refine this rule. A connection that reaches Stalwart through a TLS-terminating proxy counts as encrypted only when the proxy sends a [PROXY protocol](/docs/server/reverse-proxy/proxy-protocol) version 2 header with the SSL TLV. A server in bootstrap or recovery mode skips the check altogether.

An access token is also checked for its scope. It must carry the `mail` scope to be accepted for SMTP. A token without it is refused with `550 5.7.1 Your account is not authorized to use this service.` [Mail, calendar and contacts clients](/docs/auth/oauth/mail-clients) describes which clients support OAuth.

The second decision is [`require`](/docs/ref/object/mta-stage-auth#require), which decides whether the client must authenticate before `MAIL FROM`. The default, <!-- default:MtaStageAuth.require -->`local_port != 25`<!-- /default -->, requires authentication on every port except 25. An unauthenticated client on those ports receives `503 5.5.1 You must authenticate first.` Port 25 accepts unauthenticated mail, but only for local recipients unless relaying is allowed ([RCPT TO stage](/docs/mta/inbound/rcpt)).

The `require` expression is also evaluated for LMTP sessions. LMTP sessions cannot authenticate on a cleartext connection, so an [LMTP listener](/docs/mta/#listeners) needs `require` to exempt it, for example with `local_port != 25 && protocol != 'lmtp'`.

## Failures

Each kind of failed authentication has its own reply, which tells the client, and the administrator reading the logs, what went wrong:

| Situation | Reply |
|---|---|
| Wrong credentials | `535 5.7.8 Authentication credentials invalid.` |
| Expired OAuth token | `535 5.7.8 OAuth token expired.` |
| Account requires a second factor | `334 5.7.8 This account requires multi-factor authentication. Alternatively, you can use an app password if your account has one.` |
| Account not allowed to send, or token without the `mail` scope | `550 5.7.1 Your account is not authorized to use this service.` |
| Mechanism not offered | `554 5.7.8 Authentication mechanism not supported.` |
| AUTH not offered on this connection | `503 5.5.1 AUTH not allowed.` |
| Too many failures | `455 4.3.0 Too many authentication errors, disconnecting.` |

Two settings slow down password guessing. After each failure, the server waits for the duration of [`waitOnFail`](/docs/ref/object/mta-stage-auth#waitonfail) before it answers, <!-- default:MtaStageAuth.waitOnFail as=duration -->5 seconds<!-- /default --> by default. Once the session reaches [`maxFailures`](/docs/ref/object/mta-stage-auth#maxfailures) failures, <!-- default:MtaStageAuth.maxFailures -->`3`<!-- /default --> by default, the server closes the connection. Repeated failures from the same address also count towards the [automatic ban](/docs/server/auto-ban) of that address. Once the address is banned, connections from it are dropped without a reply.

Accounts that use two-factor authentication need special handling in mail clients. Such an account cannot sign in with its password alone, so the mail client needs an [app password](/docs/auth/authentication/app-password) instead.

## Sender verification

Authentication proves who the client is, but on its own it does not restrict the sender address the client may use. [`mustMatchSender`](/docs/ref/object/mta-stage-auth#mustmatchsender) adds that restriction, and it is <!-- default:MtaStageAuth.mustMatchSender -->`true`<!-- /default --> by default. It requires the envelope sender that an authenticated client gives in `MAIL FROM` to be one of the account's own identities: the account's name or one of its email addresses, including the addresses of the groups the account belongs to.

A sender that is not one of them is refused. `MAIL FROM` is answered with `501 5.5.4 You are not allowed to send from this address.`, and the event `smtp.mail-from-unauthorized` is logged. The null sender `<>` is refused as well. [Addresses, aliases and catch-all](/docs/domains/addresses) describes which addresses an account has. To let a user send as a shared address, add the user to a group that owns the address.

The check covers only the envelope sender. The `From` header of the message, which is the address recipients see, is not checked, so an authenticated user can still put any address there. To require the `From` header to match the envelope sender, add a system Sieve script at the DATA stage, as shown in [Sieve examples](/docs/sieve/examples#require-the-from-header-to-match-the-sender-of-authenticated-mail). Masked addresses cannot be used as senders ([Masked email](/docs/email/management/masked-email)).

## Directory selection

:::tip[Enterprise feature]
Selecting a directory per domain is available in the [Enterprise edition](/docs/server/enterprise) of Stalwart.
:::

A directory is the source of accounts and credentials. The credentials of an SMTP client are verified by the directory that serves the account's domain. That is either the internal directory, or the external directory (LDAP, SQL or OpenID Connect) set in the domain's [`directoryId`](/docs/ref/object/domain#directoryid), as described in [Authentication backends](/docs/auth/backend/). MtaStageAuth therefore has no directory setting of its own.

The directory that validates an access token must also be the one that serves the account's domain. When an access token validated by an external OpenID Connect directory belongs to an account whose domain is served by a different directory, the login fails. The SMTP client receives `535 5.7.8 Authentication credentials invalid.`, and the server log records the reason, `The account's domain is not served by the directory that authenticated it`.
