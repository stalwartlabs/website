---
sidebar_position: 2
title: "Scores"
---

As described in the [tags and scores](/docs/spamfilter/#tags-and-scores) section, the spam filter analyses each incoming message and produces a set of tags. Each tag contributes a score (positive values push the message toward spam, negative values toward ham), or triggers a direct discard or reject action. The cumulative score determines the final classification.

Tag-to-score mappings are configured through the [SpamTag](/docs/ref/object/spam-tag) object (found in the WebUI under <!-- breadcrumb:SpamTag --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> Spam Filter › Scores<!-- /breadcrumb:SpamTag -->). SpamTag is a multi-variant object: the variant selects what happens when the tag fires on a message.

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
