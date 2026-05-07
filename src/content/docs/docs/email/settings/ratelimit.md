---
sidebar_position: 4
title: "Rate limiting"
---

Rate limiting is a strategy to limit network traffic by capping how often a given action (for example, a login attempt) can be repeated within a time window. Rate limiting helps mitigate abuse such as brute-force attacks and reduces load on the mail server.

## IMAP/POP3

IMAP and POP3 rate-limit fields live on the [Imap](/docs/ref/object/imap) singleton (found in the WebUI under <!-- breadcrumb:Imap --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › IMAP<!-- /breadcrumb:Imap -->).

### Concurrency

The maximum number of concurrent IMAP and POP3 connections a user may hold is set by [`maxConcurrent`](/docs/ref/object/imap#maxconcurrent). The default is `16`; lowering it, for example to four connections per user:

```json
{
  "maxConcurrent": 4
}
```

### Requests

The per-minute request cap is set by [`maxRequestRate`](/docs/ref/object/imap#maxrequestrate), which takes a `Rate` value of `count` and `period`. The default is 2000 requests per minute.

For example, to allow 2000 requests per minute:

```json
{
  "maxRequestRate": {"count": 2000, "period": "1m"}
}
```

## JMAP

Refer to the [JMAP Protocol limits](/docs/http/jmap/protocol) page for details on how JMAP request limits and concurrency are configured on the [Jmap](/docs/ref/object/jmap) singleton.
