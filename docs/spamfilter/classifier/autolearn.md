---
sidebar_position: 3
---

# Learning

In addition to explicitly labelled training samples provided by users or administrators, Stalwart supports automatic learning. Automatic learning allows the classifier to incorporate new samples without direct user intervention, but only under conditions where the system has high confidence in the correctness of the label. The aim is to accelerate adaptation to new patterns while minimising the risk of reinforcing incorrect classifications.

Automatic learning is deliberately conservative. It does not rely on the classifier's own probabilistic output alone; it uses strong external signals and contextual information to decide whether a message should be treated as spam or ham. Those signals include user-specific trust relationships, conversational context, and infrastructure-level indicators such as spam traps and DNS block lists. Only when one of these conditions is met is a message promoted to a training sample and incorporated into the model.

## Address books

Stalwart uses the recipient's address book as a source of corrective feedback. If a message is classified as spam but the sender is present in the recipient's address book, the system treats this as strong evidence that the message is legitimate and automatically adds it as a ham training sample.

This mechanism allows the classifier to adjust quickly to trusted correspondents and to reduce repeated false positives for known senders. Because address book entries are curated by users, they provide a high-confidence signal that complements statistical inference.

## Sent message threads

A similar rule applies to message threads. If a message is classified as spam but belongs to a conversation thread that contains messages in the recipient's Sent Items folder, Stalwart interprets this as a reply to a message the recipient previously sent. Such messages are highly likely to be legitimate, even when their content is short or atypical.

When this condition is met, the message is automatically added as a ham training sample. This helps the classifier learn conversational patterns and prevents false positives in ongoing exchanges.

## Spam traps

Stalwart can automatically learn spam from messages delivered to administrator-defined [spam traps](/docs/spamfilter/spamtrap), also known as honey pots. A spam trap is an address that is not used for legitimate communication and is intended solely to attract unsolicited messages; any message received at such an address is assumed to be spam with a high degree of confidence.

Messages sent to spam traps are automatically added as spam training samples. This provides a reliable source of high-quality spam data and allows the classifier to learn about new spam campaigns early, often before they reach regular recipients.

## DNS block lists

Another source of automatic spam learning is [DNS-based block lists](/docs/spamfilter/dnsbl). When a message originates from a sender domain or IP address that is listed in multiple DNS block lists, this is treated as strong evidence of spam activity. By default, Stalwart requires the sender to be listed in at least two block lists before this condition is satisfied.

When the requirement is met, the message is automatically added as a spam training sample. Using multiple block list confirmations reduces the risk of false positives and ensures that only well-established spam sources contribute to automatic learning.

## Configuration

Automatic learning is configured on the [SpamClassifier](/docs/ref/object/spam-classifier) singleton (found in the WebUI under <!-- breadcrumb:SpamClassifier --><!-- /breadcrumb:SpamClassifier -->) and on the [SpamSettings](/docs/ref/object/spam-settings) singleton (found in the WebUI under <!-- breadcrumb:SpamSettings --><!-- /breadcrumb:SpamSettings -->). The relevant fields are:

- [`learnSpamFromRblHits`](/docs/ref/object/spam-classifier#learnspamfromrblhits) on SpamClassifier: the minimum number of DNS block lists that must list the sender's domain or IP address before a message is automatically treated as spam for training purposes. Default `2`.
- [`learnSpamFromTraps`](/docs/ref/object/spam-classifier#learnspamfromtraps) on SpamClassifier: when `true`, messages delivered to administrator-defined spam trap addresses are added as spam training samples. Default `true`.
- [`learnHamFromCard`](/docs/ref/object/spam-classifier#learnhamfromcard) on SpamClassifier: when `true`, messages from senders in the recipient's address book that would otherwise be classified as spam are added as ham training samples. Default `true`.
- [`learnHamFromReply`](/docs/ref/object/spam-classifier#learnhamfromreply) on SpamClassifier: when `true`, messages classified as spam that belong to threads containing messages in the recipient's Sent Items folder are added as ham training samples. Default `true`.

The trusted-sender overrides that feed these automatic-learning rules are themselves controlled by [`trustContacts`](/docs/ref/object/spam-settings#trustcontacts) and [`trustReplies`](/docs/ref/object/spam-settings#trustreplies) on SpamSettings.
