---
sidebar_position: 5
title: "Reverse DNS"
description: "Forward-confirmed reverse DNS verification of SMTP clients: how the check works, its modes and replies, and how its result is used."
---

Legitimate mail servers almost always have a PTR record for their IP address, and the name in that record resolves back to the same address. This property is called forward-confirmed reverse DNS. Hosts that send spam from compromised machines or from dynamic address ranges often lack it, so its absence is a useful signal about a client. Stalwart checks the property for each SMTP client. RFC 8601 (section 2.7.3) calls this check `iprev`, and it proceeds in three steps:

1. Look up the PTR records of the client's IP address.
2. Look up the addresses of the names found, at most the first two.
3. The check passes when the client's IP address is among them.

The name that the client gave in `EHLO` plays no part in the check. The check is made once per session, at `MAIL FROM`.

## Settings

The check is controlled by [`reverseIpVerify`](/docs/ref/object/sender-auth#reverseipverify) on the [SenderAuth](/docs/ref/object/sender-auth) singleton (found in the WebUI under <!-- breadcrumb:SenderAuth --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Inbound › Sender Authentication<!-- /breadcrumb:SenderAuth -->). The field is an expression that returns one of three modes. Its default expression applies `relaxed` on port 25 and `disable` on the other ports:

```json
{
  "reverseIpVerify": {
    "match": {"0": {"if": "local_port == 25", "then": "relaxed"}},
    "else": "disable"
  }
}
```

The modes differ in what happens when the check does not pass:

| Mode | Effect |
|---|---|
| `relaxed` | Perform the check and record the result, in the `Authentication-Results` header, for the spam filter and for system Sieve scripts (`env.iprev.result`, `env.iprev.ptr`). |
| `strict` | Also refuse `MAIL FROM` when the check does not pass, including when the address has no PTR record: `550 5.7.25 Reverse DNS validation failed.`, or `451 4.7.25 Temporary error validating reverse DNS.` for a temporary DNS error. |
| `disable` | Do not perform the check. |

The choice between the first two modes is a trade-off. `strict` refuses mail from servers whose operators have not set up reverse DNS, and some of those are small but legitimate servers. In `relaxed` mode, the message is still accepted, and the missing record instead counts against it in the [spam filter](/docs/spamfilter/), as the `RDNS_NONE` tag. The submission ports are not checked by default, because users connect from networks whose addresses often have no matching reverse DNS.
