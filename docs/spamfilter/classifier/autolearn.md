---
sidebar_position: 3
---

# Learning

In addition to explicitly labeled training samples provided by users or administrators, Stalwart supports automatic learning. Automatic learning allows the classifier to incorporate new training samples without direct user intervention, but only under conditions where the system has high confidence in the correctness of the label. The purpose of this mechanism is to accelerate adaptation to new patterns while minimizing the risk of reinforcing incorrect classifications.

Automatic learning is deliberately conservative. It does not rely on the classifier’s own probabilistic output alone, but instead uses strong external signals and contextual information to determine whether a message should be treated as spam or ham. These signals include user-specific trust relationships, conversational context, and infrastructure-level indicators such as spam traps and DNS block lists. Only when these conditions are met is a message promoted to a training sample and incorporated into the model.

## Address books

Stalwart also uses user-specific context to correct misclassifications. If a message is classified as spam but the sender is present in the recipient’s address book, the system treats this as strong evidence that the message is legitimate. In this case, the message is automatically added as a ham training sample.

This mechanism allows the classifier to quickly adjust to trusted correspondents and reduces repeated false positives for known senders. Because address book entries are curated by users, they provide a high-confidence signal that complements statistical inference.

## Sent message threads

A further automatic learning rule applies to message threads. If a message is classified as spam but belongs to a conversation thread that contains messages in the recipient’s Sent Items folder, Stalwart interprets this as a reply to a message the user previously sent. Such messages are highly likely to be legitimate.

When this condition is met, the message is automatically added as a ham training sample. This helps the classifier learn conversational patterns and prevents false positives in ongoing exchanges, particularly in cases where replies contain short or atypical content that might otherwise resemble spam.

## Spam traps

Stalwart can automatically learn spam from messages delivered to administrator-defined [spam traps](/docs/spamfilter/spamtrap), also known as honey pots. Spam traps are addresses that are not used for legitimate communication and are intended solely to attract unsolicited messages. Any message received by such an address is assumed to be spam with a high degree of confidence.

Messages sent to spam traps are automatically added as spam training samples. This mechanism provides a reliable source of high-quality spam data and allows the classifier to learn about new spam campaigns early, often before they reach regular users.

## DNS block lists

Another source of automatic spam learning is [DNS-based block lists](/docs/spamfilter/dnsbl). When a message originates from a sender domain or IP address that is listed in multiple DNS block lists, this is treated as strong evidence of spam activity. By default, Stalwart requires the sender to be listed in at least two block lists before this condition is satisfied, although this threshold is configurable.

When the requirement is met, the message is automatically added as a spam training sample. Using multiple block list confirmations reduces the risk of false positives and ensures that only well-established spam sources contribute to automatic learning.

## Configuration

The following configuration options are available for the spam classifier’s automatic learning process:

- `spam-filter.classifier.auto-learn.spam-rbl-count`: Specifies the minimum number of DNS block lists that must list the sender’s domain or IP address for a message to be automatically treated as spam for training purposes. The default value is `2`.
- `spam-filter.classifier.auto-learn.spam-trap`:  When set to `true`, messages delivered to administrator-defined spam trap addresses are automatically added as spam training samples. The default value is `true`.
- `spam-filter.card-is-ham.learn`: When set to `true`, messages from senders in the recipient’s address book that are classified as spam are automatically added as ham training samples. The default value is `true`.
- `spam-filter.trusted-reply.learn`: When set to `true`, messages classified as spam that belong to threads containing messages in the recipient’s Sent Items folder are automatically added as ham training samples. The default value is `true`.

Example:

```toml
[spam-filter.classifier.auto-learn]
spam-rbl-count = 2
spam-trap = true

[spam-filter.card-is-ham]
learn = true

[spam-filter.trusted-reply]
learn = true
```

