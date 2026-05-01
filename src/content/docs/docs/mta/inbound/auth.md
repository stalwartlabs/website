---
sidebar_position: 8
title: "AUTH stage"
---

The `AUTH` command authenticates a user wishing to send an email message through an SMTP server. Once issued, the client supplies credentials using SASL, a framework for authentication and data security in network protocols. SASL supports mechanisms such as username and password, public-key cryptography, and bearer tokens.

## Settings

SASL authentication is configured on the [MtaStageAuth](/docs/ref/object/mta-stage-auth) singleton (found in the WebUI under <!-- breadcrumb:MtaStageAuth --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Session › AUTH Stage<!-- /breadcrumb:MtaStageAuth -->). The relevant fields are:

- [`saslMechanisms`](/docs/ref/object/mta-stage-auth#saslmechanisms): a list of [SASL mechanisms](https://www.iana.org/assignments/sasl-mechanisms/sasl-mechanisms.xhtml) offered to clients, or an empty list to disable authentication. Stalwart supports `PLAIN`, `LOGIN`, `OAUTHBEARER`, and `XOAUTH2`. The default policy offers `[plain, login, oauthbearer, xoauth2]` on TLS-protected submission ports and `[oauthbearer, xoauth2]` on non-TLS submission ports, while disabling AUTH on port 25.
- [`require`](/docs/ref/object/mta-stage-auth#require): whether authentication is required to send email messages. The default expression requires authentication when `local_port != 25`.
- [`mustMatchSender`](/docs/ref/object/mta-stage-auth#mustmatchsender): whether the authenticated user (or one of their associated email addresses) must match the sender of the message. Default `true`.
- [`maxFailures`](/docs/ref/object/mta-stage-auth#maxfailures): maximum number of authentication errors allowed before the session is disconnected. Default 3.
- [`waitOnFail`](/docs/ref/object/mta-stage-auth#waitonfail): time to wait after an authentication failure. Default 5 seconds.

Example restricting `PLAIN` and `LOGIN` to TLS-protected submission ports and requiring authentication outside port 25:

```json
{
  "saslMechanisms": {
    "match": [{"if": "local_port != 25 && is_tls", "then": "[plain, login]"}],
    "else": "false"
  },
  "require": {
    "match": [{"if": "listener != 'smtp'", "then": "true"}],
    "else": "false"
  },
  "mustMatchSender": {"else": "true"},
  "maxFailures": {"else": "3"},
  "waitOnFail": {"else": "5s"}
}
```

## Directory selection

The authentication backend is selected automatically based on the domain name supplied in the credentials. Stalwart matches the domain against the configured [Domain](/docs/ref/object/domain) objects and routes the authentication request to the [`directoryId`](/docs/ref/object/domain#directoryid) associated with that domain, falling back to the internal directory when no explicit directory is set. No per-stage directory field exists on MtaStageAuth.
