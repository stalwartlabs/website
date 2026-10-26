---
title: "AI classifier"
description: "How the spam filter asks a language model to classify messages whose score is inconclusive, what the model is given, how its verdict becomes tags and a header, and how failures, cost and learning are handled."
sidebar_position: 1
---

:::tip[Enterprise feature]
This feature is available in the [Enterprise edition](/docs/server/enterprise) of Stalwart.
:::

The rules and the statistical classifier of the [spam filter](/docs/spamfilter/) recognise spam by its patterns. That works well for the bulk of spam, which is sent in large runs and looks alike. It works less well for messages written to look legitimate, such as targeted phishing, fake invoices and impersonated colleagues, where the pattern is the absence of anything unusual.

The AI classifier addresses those messages by asking a language model to read them. It sends a summary of the message to the model and asks which category the message belongs to, for example legitimate correspondence, newsletter, phishing or malware. The model's verdict is turned into tags, whose scores count towards the spam score like any other tag.

Querying a model takes time and, with a hosted model, costs money for every request. The classifier is therefore consulted only for the messages whose score is still inconclusive after the other checks.

The classifier is configured on the [SpamAi](/docs/ref/object/spam-ai) singleton, which stays disabled until it is switched to its `Enable` variant. It uses the models defined as [AI models](/docs/server/ai-models). [Enabling the AI classifier](/docs/spamfilter/ai/enable) describes the steps.

## Position in the scoring order

The AI classifier runs late in the [scoring order](/docs/spamfilter/#scoring-order). The built-in analyses, [Pyzor](/docs/spamfilter/digests), the [statistical classifier](/docs/spamfilter/classifier/) and the [rules](/docs/spamfilter/rules) that do not depend on it all run first. Their result decides whether the model is needed at all, so that the classifier can be skipped when the result is already conclusive.

The rules that test `AI_*` tags, directly or through a tag added by another such rule, run after the classifier, so that they can react to its verdict. A rule that builds a tag name at run time is not recognised as depending on the AI classifier, and runs before it.

## Skipped messages

Before it queries a model, the classifier passes each message through a gate. The gate tests the following conditions in order. The first that applies skips the message, and its name is logged as the reason in the `ai.spam-skipped` event:

| Reason | Condition |
|---|---|
| `authenticated` | The message comes from an authenticated session. |
| `decided` | A reject or discard tag has already decided the message. |
| `condition` | The [`condition`](/docs/ref/object/spam-ai#condition) expression returned `false`. |
| `unavailable` | Every model is temporarily disabled after repeated failures (see [Failures](#failures-and-deadlines)). |
| `no-content` | The message has no text and no attachments. |

When none applies, the reason is `run` and the model is queried. The default condition is <!-- default:SpamAi.condition -->`spam_score > -2 && spam_score < spam_threshold + 6 && (spam_probability < 0 || (spam_probability > 0.15 && spam_probability < 0.85))`<!-- /default -->.

The expression uses three variables. `spam_score` is the score of the message so far. `spam_threshold` is the spam threshold of [General settings](/docs/spamfilter/settings/general). `spam_probability` is the statistical classifier's probability, or `-1` when it did not run. The variables `spam_score` and `spam_threshold` exist only in this expression ([`SpamAiVariable`](/docs/ref/expression/variable/spam-ai-variable)).

Read in those terms, the default condition queries the model when the score so far lies between -2 and 6 points above the spam threshold, and the statistical classifier is either untrained or not confident in either direction. Messages that are clearly ham or clearly spam are not sent.

The condition therefore controls how many messages reach the model. Widening it sends more messages to the model, which raises cost and latency. Narrowing it saves requests, but leaves more borderline messages to the other checks.

## Facts sent to the model

The model does not receive the raw message. Stalwart sends a JSON record of facts that it has already established instead, so that the model reasons about verified data and not about headers a sender may have forged. The record contains these facts:

- The sender's display name, address and domain, the envelope sender, the `Reply-To` address, the number of recipients and their domains
- The results of SPF, DKIM, DMARC and ARC, and the domains of passing DKIM signatures, when [`includeAuth`](/docs/ref/object/spam-ai#includeauth) is enabled
- The subject, whether the message is a reply, and whether it carries a `List-Unsubscribe` header
- For each link, its visible text and its real destination host, after following [URL redirectors](/docs/spamfilter/settings/domain-lists#url-redirectors), up to [`maxLinks`](/docs/ref/object/spam-ai#maxlinks) links, when [`includeLinks`](/docs/ref/object/spam-ai#includelinks) is enabled
- The name and content type of each attachment, up to [`maxAttachments`](/docs/ref/object/spam-ai#maxattachments), when [`includeAttachments`](/docs/ref/object/spam-ai#includeattachments) is enabled
- The text of the body, with quoted replies and signatures removed when [`trimQuotes`](/docs/ref/object/spam-ai#trimquotes) is enabled, truncated to [`maxInputChars`](/docs/ref/object/spam-ai#maxinputchars) characters

The record is preceded by the [`instructions`](/docs/ref/object/spam-ai#instructions). These describe the task, list the categories and the questions to answer, and tell the model that the content of the message is untrusted data whose instructions it must ignore.

That warning does not make the model immune. A message can still contain text crafted to influence a model, a technique known as prompt injection. This is one reason the verdict is combined with the other findings instead of deciding on its own.

The record also raises a question of privacy. When the model runs outside the organisation's infrastructure, the record, including the text of the body, is sent to its provider. Use a self-hosted model where message content must not leave the organisation. The exact record sent for a given message can be inspected with the `ClassifySpam` action ([Enabling the AI classifier](/docs/spamfilter/ai/enable#inspect-individual-messages)).

## Verdicts and tags

The model answers with two things: a category, and yes-or-no answers to a set of questions, called signals. Both lists can be redefined, and their defaults are:

- Categories ([`categories`](/docs/ref/object/spam-ai#categories)): `legitimate`, `transactional`, `newsletter`, `unsolicited_sales`, `bulk_spam`, `phishing` and `malware`, each with a description and examples given to the model.
- Signals ([`signals`](/docs/ref/object/spam-ai#signals)): `impersonation` (the message claims to come from an organisation its addresses or links do not belong to), `credential_request` (it asks for a password, code or payment detail) and `requested` (it shows that the recipient asked for it, as a reply or a subscription).

The verdict also carries a probability for the category, and how it is obtained depends on the model. Some models can return the probabilities of their output, which is enabled with the `logprobs` setting of the [AI model](/docs/server/ai-models). The probability is then computed from them. Other models state their confidence in words, as high, medium or low. These words are mapped to [`verbalHigh`](/docs/ref/object/spam-ai#verbalhigh), [`verbalMedium`](/docs/ref/object/spam-ai#verbalmedium) and [`verbalLow`](/docs/ref/object/spam-ai#verballow), by default <!-- default:SpamAi.verbalHigh -->0.9<!-- /default -->, <!-- default:SpamAi.verbalMedium -->0.7<!-- /default --> and <!-- default:SpamAi.verbalLow -->0.55<!-- /default -->.

The category, the probability and the signals then become tags:

| Tag | Added when |
|---|---|
| `AI_<CATEGORY>_HIGH` | The probability is at least [`bucketHigh`](/docs/ref/object/spam-ai#buckethigh), by default <!-- default:SpamAi.bucketHigh -->0.85<!-- /default -->. |
| `AI_<CATEGORY>_MEDIUM` | The probability is at least [`bucketMedium`](/docs/ref/object/spam-ai#bucketmedium), by default <!-- default:SpamAi.bucketMedium -->0.65<!-- /default -->. |
| `AI_<CATEGORY>_LOW` | The probability is lower. |
| `AI_UNCERTAIN` | The model's confidence is below [`uncertainBelow`](/docs/ref/object/spam-ai#uncertainbelow), by default <!-- default:SpamAi.uncertainBelow -->0.3<!-- /default -->. Replaces the category tag. |
| `AI_<SIGNAL>` | The model answered yes to the signal. |
| `AI_ERROR` | No model could produce a verdict. |

The category name is written in upper case, so a confident phishing verdict produces `AI_PHISHING_HIGH`. The scores of these tags are part of the rule set, for example 7.0 for `AI_PHISHING_HIGH`, 5.0 for `AI_BULK_SPAM_HIGH`, -3.0 for `AI_LEGITIMATE_HIGH`, 3.0 for `AI_IMPERSONATION`, and 0 for `AI_UNCERTAIN` and `AI_ERROR`. They can be changed like any other score ([Scores](/docs/spamfilter/settings/scores)).

When categories or signals are redefined, the tags of a new category or signal start without a score. They need scores of their own to have an effect.

## Tiers

Models differ in cost and ability, and most messages do not need the most capable one. The models are therefore queried in tiers, an ordered list in [`tiers`](/docs/ref/object/spam-ai#tiers), each naming an AI model.

The first tier is queried for every message that passes the gate. The next tier is queried only when the verdict of the previous one is not conclusive, which is the case in any of these situations: its confidence is below the tier's `escalateBelow`, by default <!-- default:SpamAi.SpamAiTier.escalateBelow -->0.3<!-- /default -->; it is uncertain; its probability falls in the low bucket; or its category is listed in the tier's `escalateOn`. The verdict of the last tier that answered is used.

With this arrangement, a small, fast model can handle most messages, and a larger model only the difficult ones or the categories where a mistake is costly, such as phishing.

## Failures and deadlines

A model that fails never blocks mail. When the model of a tier fails, the next tier is queried. When no tier produces a verdict, the message is scored without one and, in `Automatic` mode, receives `AI_ERROR`.

A slow model is treated as a failing one, so that a message is not held up indefinitely. All requests for a message share one time limit, [`deadline`](/docs/ref/object/spam-ai#deadline), which is <!-- default:SpamAi.deadline -->10 seconds<!-- /default --> by default. A request still running when the deadline expires fails.

A model that keeps failing is taken out of rotation for a while, a mechanism known as a circuit breaker. After [`breakerThreshold`](/docs/ref/object/spam-ai#breakerthreshold) consecutive failures, by default <!-- default:SpamAi.breakerThreshold -->5<!-- /default -->, the model is not queried for [`breakerCooldown`](/docs/ref/object/spam-ai#breakercooldown), by default <!-- default:SpamAi.breakerCooldown -->1 minute<!-- /default -->, and the event `ai.breaker-open` is logged. While every model is in this state, messages are skipped with the reason `unavailable`.

Provider errors are logged as `ai.api-error`. The concurrency and rate limits of each model, `maxConcurrentRequests` and `rateLimit`, are set on the [AI model](/docs/server/ai-models).

## Shadow mode

A new model should be judged on real traffic before it is allowed to change verdicts, and shadow mode serves that purpose. With [`mode`](/docs/ref/object/spam-ai#mode) set to `Shadow`, the classifier queries the model, and logs and records its verdict. It adds no tags and does not learn, so the score of the message is unaffected.

In `Automatic` mode, the tags are added and count towards the score. The mode is <!-- default:SpamAi.mode -->`Automatic`<!-- /default --> by default.

## X-Spam-AI header

The verdict is also recorded in the message itself, where it can be read later. While [`addHeader`](/docs/ref/object/spam-ai#addheader) is enabled, which it is <!-- default:SpamAi.addHeader as=enabled -->enabled<!-- /default --> by default, the verdict is added in an `X-Spam-AI` header, placed between `X-Spam-Result` and `X-Spam-Score`:

```text
X-Spam-AI: phishing; p=0.93; confidence=0.88; model=qwen3-8b; tier=1
```

The fields are the category, its probability (`p`), the model's confidence, the model identifier reported by the provider, and the tier that produced the verdict.

Further fields are added when they apply. An uncertain verdict carries `uncertain`. An escalated message carries `tier1=<category>/<p>` for each earlier tier, so the header shows how each tier judged it. Shadow mode adds `shadow`. When [`explanation`](/docs/ref/object/spam-ai#explanation) is enabled, `reason="..."` holds a short explanation from the model.

When no verdict could be obtained, the header reads `X-Spam-AI: error; tier=<n>; error="<description>"`, for example with `Request timed out`.

## Learning from AI verdicts

Every query to a model costs time, and often money. The AI verdicts can train the [statistical classifier](/docs/spamfilter/classifier/), so that it learns to recognise, without a model, the kind of messages the model classified.

Learning stays off until [`learn`](/docs/ref/object/spam-ai#learn) is set to `Enable`. Because a wrong sample teaches the classifier the wrong lesson, the conditions are strict. A verdict becomes a training sample only when all of the following hold:

- The mode is `Automatic` and the verdict is not uncertain.
- Its probability is at least `minProbability`, by default <!-- default:SpamAi.SpamAiLearnProperties.minProbability -->0.95<!-- /default -->.
- The statistical classifier had a probability for the message between 0.15 and 0.85, so the sample teaches it something it did not know.
- The message is not from an authenticated sender and has no `TRUSTED_DOMAIN` tag.
- The first AI tag of the verdict has a non-zero score, which decides whether the sample is spam (positive) or ham (negative), and that label agrees with the final classification of the message.
- A random draw selects the message, with probability `sampleRate`, by default <!-- default:SpamAi.SpamAiLearnProperties.sampleRate -->0.1<!-- /default -->.

The sampling rate exists for a specific reason: it keeps a model's systematic mistakes from dominating the classifier's training. [Automatic learning](/docs/spamfilter/classifier/autolearn) describes the other sources of samples.
