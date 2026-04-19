---
sidebar_position: 1
---

# Overview

A "session" refers to a single incoming SMTP connection. Each SMTP session progresses through a series of distinct stages, each with its own function:

- [Connect](/docs/mta/inbound/connect): the initial stage, where the server and client establish a connection.
- [EHLO](/docs/mta/inbound/ehlo): the client introduces itself to the server.
- [AUTH](/docs/mta/inbound/auth): the client provides authentication details.
- [MAIL](/docs/mta/inbound/mail): the client specifies the sender of the message.
- [RCPT](/docs/mta/inbound/rcpt): the client provides one or more recipients.
- [DATA](/docs/mta/inbound/data): the client transmits the actual message content.

Each stage is configured by its own singleton so that specific behaviour can be applied at each point in an SMTP session. Most stages support running [Sieve scripts](/docs/sieve/overview), allowing custom filters that reject, alter, or reroute incoming messages based on a wide range of criteria.

## Limits

Session-wide limits are configured on the [MtaInboundSession](/docs/ref/object/mta-inbound-session) singleton (found in the WebUI under <!-- breadcrumb:MtaInboundSession --><!-- /breadcrumb:MtaInboundSession -->). The relevant fields are [`timeout`](/docs/ref/object/mta-inbound-session#timeout) (how long to wait for a client command before the connection is terminated, default 5 minutes), [`transferLimit`](/docs/ref/object/mta-inbound-session#transferlimit) (the maximum number of bytes transferred within a single session, default 262144000, 250 MB), and [`maxDuration`](/docs/ref/object/mta-inbound-session#maxduration) (the maximum length of a single SMTP session, default 10 minutes). Each field accepts an expression and may branch on listener, remote IP, or other connection-level variables.

Example configuration with all three limits set together:

```json
{
  "timeout": {"else": "5m"},
  "transferLimit": {"else": "262144000"},
  "maxDuration": {"else": "10m"}
}
```
