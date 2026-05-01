---
sidebar_position: 3
title: "IMAP and POP3"
---

IMAP protocol settings cover request handling, authentication, timeouts, and rate limits. Several of these settings also apply to the POP3 server, as both protocols share the same configuration surface. IMAP and POP3 settings are carried on the [Imap](/docs/ref/object/imap) singleton (found in the WebUI under <!-- breadcrumb:Imap --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › IMAP<!-- /breadcrumb:Imap -->). Default special-use folders, which are used by IMAP clients as well as JMAP, are configured on the [Email](/docs/ref/object/email) singleton (found in the WebUI under <!-- breadcrumb:Email --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" /></svg> Email › Defaults, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" /></svg> Email › Encryption, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" /></svg> Email › Limits, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" /></svg> Email › Storage<!-- /breadcrumb:Email -->).

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
