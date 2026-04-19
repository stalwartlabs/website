---
sidebar_position: 4
---

# Rate limiting

Rate limiting is a strategy to limit network traffic by capping how often a given action (for example, a login attempt) can be repeated within a time window. Rate limiting helps mitigate abuse such as brute-force attacks and reduces load on the mail server.

## IMAP/POP3

IMAP and POP3 rate-limit fields live on the [Imap](/docs/ref/object/imap) singleton (found in the WebUI under <!-- breadcrumb:Imap --><!-- /breadcrumb:Imap -->).

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
