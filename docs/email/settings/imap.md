---
sidebar_position: 3
---

# IMAP and POP3

IMAP protocol settings cover request handling, authentication, timeouts, and rate limits. Several of these settings also apply to the POP3 server, as both protocols share the same configuration surface. IMAP and POP3 settings are carried on the [Imap](/docs/ref/object/imap) singleton (found in the WebUI under <!-- breadcrumb:Imap --><!-- /breadcrumb:Imap -->). Default special-use folders, which are used by IMAP clients as well as JMAP, are configured on the [Email](/docs/ref/object/email) singleton (found in the WebUI under <!-- breadcrumb:Email --><!-- /breadcrumb:Email -->).

## Request size

The [`maxRequestSize`](/docs/ref/object/imap#maxrequestsize) field sets the maximum size of an IMAP request that the server will accept. Requests larger than this limit are rejected. The default is `"50mb"`.

## Authentication

Two fields on the Imap singleton control IMAP and POP3 authentication behaviour:

- [`maxAuthFailures`](/docs/ref/object/imap#maxauthfailures): maximum number of authentication attempts allowed before the session is disconnected. Default `3`.
- [`allowPlainTextAuth`](/docs/ref/object/imap#allowplaintextauth): whether plain-text authentication is permitted over an unencrypted connection. For security reasons, this should be left at its default `false` unless strictly required, so that credentials are not transmitted in the clear.

Example:

```json
{
  "maxAuthFailures": 3,
  "allowPlainTextAuth": false
}
```

## Default folders

Default special-use folders created for new accounts are defined by [`defaultFolders`](/docs/ref/object/email#defaultfolders) on the [Email](/docs/ref/object/email) singleton. The field is a map keyed by special-use type; supported keys are `inbox`, `trash`, `junk`, `drafts`, `archive`, `sent`, `shared`, `important`, `memos`, `scheduled`, and `snoozed`.

Each entry carries the fields of the nested `EmailFolder` type:

- [`name`](/docs/ref/object/email#name): display name of the folder. Required.
- [`create`](/docs/ref/object/email#create): whether the folder is created automatically. Default `true`.
- [`subscribe`](/docs/ref/object/email#subscribe): whether the folder is subscribed by default. Default `true`.
- [`aliases`](/docs/ref/object/email#aliases): additional names under which the folder is recognised.

Example:

```json
{
  "defaultFolders": {
    "sent": {"name": "Sent Items", "create": true, "subscribe": true},
    "junk": {"name": "SPAM", "create": true, "subscribe": false},
    "shared": {"name": "Shared Folders"}
  }
}
```

## Timeouts

Idle timeouts are controlled by three fields on the Imap singleton:

- [`timeoutAuthenticated`](/docs/ref/object/imap#timeoutauthenticated): time an authenticated session can remain idle before the server terminates it. Default `"30m"`.
- [`timeoutAnonymous`](/docs/ref/object/imap#timeoutanonymous): time an anonymous (unauthenticated) session can stay inactive before being ended by the server. Default `"1m"`.
- [`timeoutIdle`](/docs/ref/object/imap#timeoutidle): time a connection can stay idle in the IMAP `IDLE` state before the server breaks the connection. Default `"30m"`.

Example:

```json
{
  "timeoutAuthenticated": "30m",
  "timeoutAnonymous": "1m",
  "timeoutIdle": "30m"
}
```
