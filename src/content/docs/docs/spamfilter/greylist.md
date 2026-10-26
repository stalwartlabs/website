---
sidebar_position: 11
title: "Greylisting"
description: "How greylisting delays the first message from each sender to each recipient, the reply senders receive, and how to enable it."
---

Greylisting exploits a difference in behaviour between real mail servers and many spam-sending programs. The first time a sending server delivers mail from a given sender to a given recipient, the receiving server asks it to try again later. Mail servers retry deferred messages, as RFC 5321 requires, so legitimate mail arrives on the next attempt. Many spam-sending programs do not retry, and their messages are never delivered.

The technique is cheap. It needs no analysis of the message, only a lookup in the in-memory store for each recipient. Its cost is the delay: a first contact arrives only after the sender's retry interval, which is often several minutes and sometimes much longer. Greylisting is also less effective against senders that do retry.

## Deferral and acceptance

Greylisting is evaluated at `RCPT TO`, after the recipient has been accepted, whether as a local address or for relaying. Stalwart records each combination of envelope sender address and recipient address that it has seen, and the treatment of a recipient depends on whether its combination is new.

The first time a combination is seen, Stalwart records it and refuses the recipient with `452 4.2.2 Greylisted, please try again in a few moments.`. The event `smtp.rcpt-to-greylisted` is logged. Any later attempt with the same sender and recipient is accepted, including an immediate retry, because there is no minimum waiting time.

A combination is not remembered forever. It is kept for the duration of `greylistFor`, counted from the first attempt. After that, it is forgotten, and the next message with that combination is deferred again.

The client IP address is not part of the combination. A sender whose retries come from a different server of the same provider is therefore accepted. Messages from authenticated sessions are never greylisted.

The combinations are kept in the [in-memory store](/docs/storage/in-memory). In a cluster, all nodes share them when the in-memory store is shared, so a retry that reaches a different node is still recognised.

## Enabling greylisting

Greylisting is configured on the [SpamSettings](/docs/ref/object/spam-settings) singleton, found in the WebUI under <!-- breadcrumb:SpamSettings --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> Spam Filter › General<!-- /breadcrumb:SpamSettings -->. It stays off until [`greylistFor`](/docs/ref/object/spam-settings#greylistfor) is set. The value of that field is the time a combination is remembered, in milliseconds. The following object body enables greylisting and remembers each combination for 30 days:

```json
{
  "greylistFor": 2592000000
}
```

The duration is a trade-off. A short duration greylists returning senders again soon after their entry expires. A long one keeps the store larger, but delays only first contacts. Setting the field to `null` disables greylisting.

Other policies are possible through Sieve. A policy that also takes the client IP address into account, for example, can be implemented in a system Sieve script at the RCPT TO stage. The script uses the key-value functions `key_exists` and `key_set` ([Function reference](/docs/sieve/reference#key-value-store-functions-trusted-only)), and rejects the first attempt with a `451 4.7.1` reply.
