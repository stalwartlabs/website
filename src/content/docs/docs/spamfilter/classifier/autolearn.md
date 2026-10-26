---
sidebar_position: 3
title: "Automatic learning"
description: "The conditions under which the spam filter adds training samples on its own: spam traps, DNS blocklists, trusted senders and the AI classifier."
---

Users create most training samples by marking messages, but they report slowly, and a new server has few reports at all. The spam filter can therefore add training samples on its own, when the classification of a message is certain for a reason independent of the classifier.

Automatic learning speeds up training, especially on a new server. It also carries a risk: a wrong automatic sample teaches the classifier the wrong lesson. Each source of automatic samples therefore requires strong evidence. The sources are configured on the [SpamClassifier](/docs/ref/object/spam-classifier) singleton, found in the WebUI under <!-- breadcrumb:SpamClassifier --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> Spam Filter › Classifier<!-- /breadcrumb:SpamClassifier -->.

Where a sample is learned decides which part of the [model](/docs/spamfilter/classifier/#classification-model) it trains. Samples learned from a message received over SMTP train the shared weights. Samples learned at delivery, when the recipient is known, train the recipient's account as well.

## Spam traps

Mail sent to a [spam trap](/docs/spamfilter/spamtrap) is spam by definition, which makes traps the most reliable source of spam samples. A message sent to a trap address and classified as spam is added as a spam sample when [`learnSpamFromTraps`](/docs/ref/object/spam-classifier#learnspamfromtraps) is enabled. The field is <!-- default:SpamClassifier.learnSpamFromTraps as=enabled -->enabled<!-- /default --> by default, so a server with spam traps trains the classifier from them without further configuration.

## DNS blocklists

One blocklist can be wrong about a sender, but several independent lists rarely agree by accident. This source therefore counts listings. A message classified as spam is added as a spam sample when it has received at least [`learnSpamFromRblHits`](/docs/ref/object/spam-classifier#learnspamfromrblhits) distinct `RBL_*` tags that score more than 1.0, which are the tags added by the [IP blocklists](/docs/spamfilter/dnsbl).

The field is <!-- default:SpamClassifier.learnSpamFromRblHits -->2<!-- /default --> by default and at most 100, and `0` disables this source. A higher value demands more agreement before a message is learned. Two kinds of tag do not count: tags for addresses found in `Received` headers (`RECEIVED_*`), and the zero-scoring `*_BLOCKED` tags, which carry no information about the sender.

## Trusted senders

Ham is harder to learn automatically, because legitimate mail rarely carries proof of being legitimate. The [trusted-sender](/docs/spamfilter/trusted) rules provide such proof. A message that the filter classified as spam, but that a trusted-sender rule delivered to the inbox, is added as a ham sample for the recipient.

One field controls this for each rule. [`learnHamFromCard`](/docs/ref/object/spam-classifier#learnhamfromcard) covers messages from an authenticated sender in the recipient's address book, and is <!-- default:SpamClassifier.learnHamFromCard as=enabled -->enabled<!-- /default --> by default. [`learnHamFromReply`](/docs/ref/object/spam-classifier#learnhamfromreply) covers replies in a conversation in which the recipient has written, and is <!-- default:SpamClassifier.learnHamFromReply as=enabled -->enabled<!-- /default --> by default.

These samples correct the classifier where it was wrong, which is where a sample is most informative. They require the corresponding trusted-sender rule to be enabled as well: [`trustContacts`](/docs/ref/object/spam-settings#trustcontacts) or [`trustReplies`](/docs/ref/object/spam-settings#trustreplies) on [SpamSettings](/docs/ref/object/spam-settings).

## AI classifier

When the [AI classifier](/docs/spamfilter/ai/) is enabled, its verdicts can also become samples. This source stays off until it is enabled with the `learn` setting of the AI classifier. Even then, it is selective. It samples only a fraction of the confident verdicts that agree with the final classification, and only for messages on which the statistical classifier was uncertain. [Learning from AI verdicts](/docs/spamfilter/ai/#learning-from-ai-verdicts) describes the conditions.

## Configuration

The following object body learns from spam traps and from messages listed by at least three blocklists. It keeps learning from contacts, but does not learn from replies:

```json
{
  "learnSpamFromTraps": true,
  "learnSpamFromRblHits": 3,
  "learnHamFromCard": true,
  "learnHamFromReply": false
}
```
