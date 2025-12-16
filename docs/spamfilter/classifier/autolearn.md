---
sidebar_position: 3
---

# Learning

In addition to explicitly labeled training samples provided by users or administrators, Stalwart supports automatic learning. Automatic learning allows the classifier to incorporate new training samples without direct user intervention, but only under conditions where the system has high confidence in the correctness of the label. The purpose of this mechanism is to accelerate adaptation to new patterns while minimizing the risk of reinforcing incorrect classifications.

Automatic learning is deliberately conservative. It does not rely on the classifier’s own probabilistic output alone, but instead uses external signals and contextual information that strongly indicate whether a message should be treated as spam or ham. Only when these conditions are met is a message promoted to a training sample and fed back into the model.

## Threshold-based classification

One mechanism for automatic learning is based on the global spam score assigned to a message. This score is the result of combining multiple independent indicators, such as DNS-based block lists, protocol-level signals, authentication results, and other heuristic or reputation-based checks. It is distinct from the classifier’s internal probability or confidence score.

When the global spam score exceeds an administrator-defined upper threshold, the message may be automatically treated as spam for training purposes. Conversely, when the score falls below a lower threshold, the message may be treated as ham. These thresholds are intentionally separate from delivery or filtering actions and exist solely to control automatic learning.

To reduce the risk of mislabeling, it is recommended to configure these thresholds conservatively, such that only messages with overwhelming evidence are included. By default, Stalwart uses a threshold of 8.0 for spam and −8.0 for ham. Messages falling between these bounds are never used for automatic training and require explicit user feedback to influence the model.

## Address books

Stalwart also uses user-specific context to correct misclassifications. If a message is classified as spam but the sender is present in the recipient’s address book, the system treats this as strong evidence that the message is legitimate. In this case, the message is automatically added as a ham training sample.

This mechanism allows the classifier to quickly adjust to trusted correspondents and reduces repeated false positives for known senders. Because address book entries are curated by users, they provide a high-confidence signal that complements statistical inference.

## Sent message threads

A further automatic learning rule applies to message threads. If a message is classified as spam but belongs to a conversation thread that contains messages in the recipient’s Sent Items folder, Stalwart interprets this as a reply to a message the user previously sent. Such messages are highly likely to be legitimate.

When this condition is met, the message is automatically added as a ham training sample. This helps the classifier learn conversational patterns and prevents false positives in ongoing exchanges, particularly in cases where replies contain short or atypical content that might otherwise resemble spam.

Together, these automatic learning mechanisms provide a controlled way for the classifier to improve itself using reliable contextual signals. They are designed to complement explicit user feedback, increasing training throughput while maintaining a strong bias toward correctness.

## Configuration

The following configuration options are available for the spam classifier’s automatic learning process:

- `spam-filter.classifier.auto-learn.spam-score`: Specifies the upper spam score threshold above which messages are automatically treated as spam for training purposes. The default value is `8.0`. Messages with a spam score exceeding this threshold are added as spam training samples.
- `spam-filter.classifier.auto-learn.ham-score`: Specifies the lower spam score threshold below which messages are automatically treated as ham for training purposes. The default value is `-8.0`. Messages with a spam score below this threshold are added as ham training samples.
- `spam-filter.card-is-ham.learn`: When set to `true`, messages from senders in the recipient’s address book that are classified as spam are automatically added as ham training samples. The default value is `true`.
- `spam-filter.trusted-reply.learn`: When set to `true`, messages classified as spam that belong to threads containing messages in the recipient’s Sent Items folder are automatically added as ham training samples. The default value is `true`.

Example:

```toml
[spam-filter.classifier.auto-learn]
spam-score = 8.0
ham-score = -8.0

[spam-filter.card-is-ham]
learn = true

[spam-filter.trusted-reply]
learn = true
```

