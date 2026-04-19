---
sidebar_position: 2
---

# Scores

As described in the [tags and scores](/docs/spamfilter/overview#tags-and-scores) section, the spam filter analyses each incoming message and produces a set of tags. Each tag contributes a score (positive values push the message toward spam, negative values toward ham), or triggers a direct discard or reject action. The cumulative score determines the final classification.

Tag-to-score mappings are configured through the [SpamTag](/docs/ref/object/spam-tag) object (found in the WebUI under <!-- breadcrumb:SpamTag --><!-- /breadcrumb:SpamTag -->). SpamTag is a multi-variant object: the variant selects what happens when the tag fires on a message.

- `Score`: adds a numeric score to the cumulative total. Carries a [`tag`](/docs/ref/object/spam-tag#tag) name and a [`score`](/docs/ref/object/spam-tag#score) value (positive values raise the spam score, negative values reduce it).
- `Discard`: discards the message outright (no delivery, no bounce). Carries a [`tag`](/docs/ref/object/spam-tag#tag) name only.
- `Reject`: rejects the message at SMTP time, causing the sending server to receive a delivery failure. Carries a [`tag`](/docs/ref/object/spam-tag#tag) name only.

## Examples

Assign a negative score to the classifier's "likely ham" medium-confidence output:

```json
{
  "@type": "Score",
  "tag": "PROB_HAM_MEDIUM",
  "score": -3.0
}
```

Assign a high positive score when the sender is on the Spamhaus DROP list:

```json
{
  "@type": "Score",
  "tag": "RBL_SPAMHAUS_DROP",
  "score": 7.0
}
```

Discard any message that lands on a configured spam trap:

```json
{
  "@type": "Discard",
  "tag": "SPAM_TRAP"
}
```
