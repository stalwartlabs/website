---
sidebar_position: 12
title: "Spam traps"
description: "Addresses that receive only spam: how to set them up so that the spam filter tags, optionally discards and learns from the messages sent to them."
---

A spam trap is an address that no person uses and that is never given out for legitimate correspondence. Typically, it is published only where address harvesters will find it, for example in hidden text on a web page. Since nobody has a legitimate reason to write to it, every message sent to a spam trap is spam by definition.

That certainty makes a trap useful in two ways. The filter can mark the messages sent to it as spam with confidence, and the messages are a reliable source of spam for training the [statistical classifier](/docs/spamfilter/classifier/).

## Setting up a spam trap

A spam trap needs two things: the SMTP server must accept the address, and the address must be listed as a trap. The first step is easy to overlook, because a trap that the server refuses never sees any mail.

1. Make the address an accepted local recipient: an address of an account, an alias, or an address covered by the domain's catch-all address ([Addresses, aliases and catch-all](/docs/domains/addresses)). An address that does not exist is rejected at `RCPT TO` with `550 5.1.1 Mailbox does not exist.`, and the message never reaches the spam filter.
2. Add the address to the `spam-traps` list, as a [MemoryLookupKey](/docs/ref/object/memory-lookup-key) with the namespace `spam-traps`. These keys are found in the WebUI under <!-- breadcrumb:MemoryLookupKey/SpamTrap --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> Spam Filter › Lists › Spam Traps<!-- /breadcrumb:MemoryLookupKey/SpamTrap -->. The following object adds `trap@example.org`:

```json
{
  "namespace": "spam-traps",
  "key": "trap@example.org"
}
```

The filter compares each recipient address as the sender gave it at `RCPT TO`, before aliases or catch-all rules rewrite it. The list therefore contains the trap addresses themselves, not the account they are delivered to.

## Trapped messages

A message sent to a trap address receives the `SPAM_TRAP` tag, which scores 15.0 in the rule set. With the default thresholds, that score alone makes the message spam. The statistical classifier is not consulted for the message, because the verdict is already certain.

In every other respect, the message is processed like any other. It is delivered to the Junk folder of the account that receives the trap address, unless a reject or discard threshold below its score applies.

To drop trapped messages instead of storing them, set the `SPAM_TRAP` tag to discard with a [SpamTag](/docs/ref/object/spam-tag) of the `Discard` variant, as shown in [Scores](/docs/spamfilter/settings/scores). The discard applies to the whole message, so a message sent to a trap and to other recipients is then discarded for all of them.

## Learning from spam traps

Each trapped message that is classified as spam is also stored as a spam sample for the classifier, as described in [Automatic learning](/docs/spamfilter/classifier/autolearn). This source of samples is controlled by [`learnSpamFromTraps`](/docs/ref/object/spam-classifier#learnspamfromtraps) on the [SpamClassifier](/docs/ref/object/spam-classifier) singleton, which is <!-- default:SpamClassifier.learnSpamFromTraps as=enabled -->enabled<!-- /default --> by default.
