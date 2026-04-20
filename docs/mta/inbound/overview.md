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

Session-wide limits are configured on the [MtaInboundSession](/docs/ref/object/mta-inbound-session) singleton (found in the WebUI under <!-- breadcrumb:MtaInboundSession --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Inbound › Session<!-- /breadcrumb:MtaInboundSession -->). The relevant fields are [`timeout`](/docs/ref/object/mta-inbound-session#timeout) (how long to wait for a client command before the connection is terminated, default 5 minutes), [`transferLimit`](/docs/ref/object/mta-inbound-session#transferlimit) (the maximum number of bytes transferred within a single session, default 262144000, 250 MB), and [`maxDuration`](/docs/ref/object/mta-inbound-session#maxduration) (the maximum length of a single SMTP session, default 10 minutes). Each field accepts an expression and may branch on listener, remote IP, or other connection-level variables.

Example configuration with all three limits set together:

```json
{
  "timeout": {"else": "5m"},
  "transferLimit": {"else": "262144000"},
  "maxDuration": {"else": "10m"}
}
```
