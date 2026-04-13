---
sidebar_position: 10
---

# Trusted Senders

Trusted senders are mechanisms that take precedence over the spam filter’s final score and ensure that a message is delivered to the user’s inbox when specific trust conditions are met. These mechanisms are independent of the statistical classifier and apply at a higher decision level, providing deterministic guarantees for messages that are strongly associated with the user’s legitimate correspondence. Their purpose is to prevent false positives in cases where contextual knowledge is more reliable than statistical inference.

Stalwart currently supports two trusted sender mechanisms: recognizing senders that are present in the user’s address book, and recognizing messages that belong to conversation threads in which the user has previously sent messages.

## Address book

If the sender of a message is present in the recipient’s address book, the message is treated as trusted. Address books are curated directly by users and therefore represent an explicit signal of trust. When this condition is met, the message bypasses spam filtering decisions and is placed in the user’s inbox, regardless of the spam score that would otherwise be assigned.

This mechanism is particularly important for preventing false positives involving infrequent correspondents, automated systems operated by trusted contacts, or messages with atypical structure that may resemble spam at a superficial level.

Whether to enable this behavior can be controlled via the `spam-filter.card-is-ham.enable` configuration option. By default, this setting is enabled.

Example:

```toml
[spam-filter.card-is-ham]
enable = true
```

## Sent message thread

A message is also considered trusted if it belongs to a conversation thread that contains messages in the recipient’s Sent Items folder. This indicates that the user has previously participated in the conversation and that the message is a reply to something the user sent. Such messages are overwhelmingly likely to be legitimate, even if their content or formatting triggers spam-like heuristics.

When this condition is detected, the message is delivered to the inbox and is not treated as spam. This ensures continuity of conversations and avoids disruption caused by incorrect filtering of replies.

Whether to enable this behavior can be controlled via the `spam-filter.trusted-reply.enable` configuration option. By default, this setting is enabled.

Example:

```toml
[spam-filter.trusted-reply]
enable = true
```

## Automatic learning

When the spam classifier is enabled, trusted sender mechanisms also serve as a source of high-confidence corrective feedback. If a message from a trusted sender would otherwise have been classified as spam, the system treats this as a misclassification and may add the message as a ham training sample. This allows the classifier to learn from its mistakes and adjust its parameters to better reflect user-specific communication patterns.

This form of automatic learning is conservative and relies on strong trust signals rather than probabilistic confidence. It complements explicit user feedback and helps reduce repeated false positives over time while preserving the deterministic behavior of trusted sender overrides.

Please refer to the [Learning](/docs/spamfilter/classifier/autolearn) section for more details on how automatic learning is configured and operates in conjunction with trusted sender mechanisms.