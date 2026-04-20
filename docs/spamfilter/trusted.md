---
sidebar_position: 10
---

# Trusted senders

Trusted sender mechanisms take precedence over the spam filter's final score and ensure that a message is delivered to the recipient's inbox when specific trust conditions are met. These mechanisms are independent of the statistical classifier and apply at a higher decision level, providing deterministic guarantees for messages that are strongly associated with the recipient's legitimate correspondence. Their purpose is to prevent false positives in cases where contextual knowledge is more reliable than statistical inference.

Stalwart supports two trusted-sender mechanisms: recognising senders present in the recipient's address book, and recognising messages that belong to conversation threads in which the recipient has previously sent messages. Both are configured on the [SpamSettings](/docs/ref/object/spam-settings) singleton (found in the WebUI under <!-- breadcrumb:SpamSettings --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> Spam Filter › General<!-- /breadcrumb:SpamSettings -->).

## Address book

If the sender of a message is present in the recipient's address book, the message is treated as trusted. Address books are curated directly by users and therefore represent an explicit signal of trust. When this condition is met, the message bypasses spam filtering decisions and is placed in the recipient's inbox, regardless of the score that would otherwise be assigned.

This mechanism is particularly useful for avoiding false positives involving infrequent correspondents, automated systems operated by trusted contacts, or messages with atypical structure that may resemble spam at a superficial level.

The feature is controlled by [`trustContacts`](/docs/ref/object/spam-settings#trustcontacts) on SpamSettings, which defaults to `true`.

## Sent message thread

A message is also considered trusted if it belongs to a conversation thread that contains messages in the recipient's Sent Items folder. This indicates that the recipient has previously participated in the conversation, and the message is a reply to something they sent. Such messages are overwhelmingly likely to be legitimate, even if their content or formatting triggers spam-like heuristics.

When this condition is met, the message is delivered to the inbox and is not treated as spam. This ensures continuity of conversations and avoids disruption caused by incorrect filtering of replies.

The feature is controlled by [`trustReplies`](/docs/ref/object/spam-settings#trustreplies) on SpamSettings, which defaults to `true`.

## Automatic learning

When the spam classifier is enabled, trusted-sender mechanisms also serve as a source of high-confidence corrective feedback. If a message from a trusted sender would otherwise have been classified as spam, the system treats this as a misclassification and can add the message as a ham training sample. This allows the classifier to learn from its mistakes and to adjust to recipient-specific communication patterns.

This form of automatic learning is conservative and relies on strong trust signals rather than probabilistic confidence. It complements explicit user feedback and helps reduce repeated false positives over time while preserving the deterministic behaviour of trusted-sender overrides.

Automatic learning from address-book matches is controlled by [`learnHamFromCard`](/docs/ref/object/spam-classifier#learnhamfromcard) on the [SpamClassifier](/docs/ref/object/spam-classifier) singleton; automatic learning from sent-thread matches is controlled by [`learnHamFromReply`](/docs/ref/object/spam-classifier#learnhamfromreply). Both default to `true`. See the [Learning](/docs/spamfilter/classifier/autolearn) section for details on how automatic learning interacts with trusted-sender mechanisms.
