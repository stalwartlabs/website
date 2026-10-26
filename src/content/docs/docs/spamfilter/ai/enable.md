---
title: "Enabling the AI classifier"
description: "Connect an AI model to the spam filter, evaluate it in shadow mode, inspect individual verdicts, and switch it to scoring."
sidebar_position: 2
---

:::tip[Enterprise feature]
This feature is available in the [Enterprise edition](/docs/server/enterprise) of Stalwart.
:::

A language model can misjudge mail in ways that are hard to predict, so it should not influence real verdicts until its behaviour on the server's own traffic is known. This page enables the [AI classifier](/docs/spamfilter/ai/) of the spam filter in a way that lets the verdicts be checked before they affect any message.

The procedure has two phases. The classifier first runs in shadow mode, which records the verdicts without scoring them. Once the verdicts have been reviewed, it is switched to scoring. Two optional steps follow: a second model for difficult messages, and learning from the verdicts.

The classifier is configured on the [SpamAi](/docs/ref/object/spam-ai) singleton, found in the WebUI under <!-- breadcrumb:SpamAi --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> Spam Filter › AI Classifier<!-- /breadcrumb:SpamAi -->.

## Create an AI model

The classifier does not connect to a model directly. It refers to a model defined as an [AiModel](/docs/ref/object/ai-model), as described in [AI models](/docs/server/ai-models), so the first step is to define one. Any of the provider types can be used.

The choice of model affects the precision of the verdicts. A model that can return the probabilities of its output, through the `logprobs` setting of the `OpenAi`, `Gemini` and `Ollama` types, gives the classifier a measured probability. Other models state their confidence in words, which is less precise. The following model runs on a local Ollama server:

```json
{
  "@type": "Ollama",
  "name": "spam-small",
  "url": "http://10.0.0.20:11434",
  "model": "qwen3:8b",
  "apiKey": {"@type": "None"},
  "logprobs": true,
  "timeout": 60000
}
```

Note the identifier that the server assigns to the new object. The classifier refers to the model by this identifier in the next step.

## Enable the classifier in shadow mode

Next, enable SpamAi in `Shadow` mode, with one tier that uses the model. A tier is a level at which a model is consulted, and [Add a second tier](#add-a-second-tier) describes escalation to further tiers. The following object body does so, keeping the defaults of all other settings:

```json
{
  "@type": "Enable",
  "mode": "Shadow",
  "tiers": {"0": {"modelId": "<AiModel id>"}},
  "learn": {"@type": "Disable"},
  "webSearch": {"@type": "Disable"}
}
```

From then on, every message that passes the [gate](/docs/spamfilter/ai/#skipped-messages) is sent to the model. Its verdict is logged and added to the message in the `X-Spam-AI` header with the `shadow` flag, without changing the score.

## Watch the verdicts

The evaluation relies on the server's telemetry. The following events and metrics show what the classifier is doing:

| Event or metric | Level | Content |
|---|---|---|
| `ai.spam-verdict` | info | One verdict: category, probability, confidence, tier, model, the tags it would add, and whether it was a shadow or automatic verdict. |
| `ai.spam-skipped` | debug | A message not sent to the model, with the reason (`authenticated`, `decided`, `condition`, `unavailable`, `no-content`). |
| `ai.api-error` | warn | A failed request, with the model and the error. |
| `ai.breaker-open` | warn | A model disabled for a period after repeated failures. |
| `ai.request-time`, `ai.input-tokens`, `ai.output-tokens` | metrics | Latency of the requests and the number of tokens sent and received. |

Two comparisons show whether the model is useful. Compare the verdicts with the final classification of the same messages, which appears in their `X-Spam-Score` header. Compare them also with what users report as spam or ham, since a model that disagrees with the filter may still be right.

The metrics answer the question of cost. The token metrics give the cost of a hosted model. For a self-hosted model, the latency and the number of messages not skipped show the load. [Telemetry](/docs/telemetry/) describes how to collect events and metrics.

## Inspect individual messages

Logs show verdicts in aggregate. A single surprising verdict is easier to understand with the `ClassifySpam` [action](/docs/management/tasks-actions/actions), which runs the spam filter on a message without delivering it and shows the AI classifier's part in detail. The action is created with `x:Action/set`. The following object classifies the raw message given in `message`, as if it had been received from the client at `remoteIp`:

```json
{
  "@type": "ClassifySpam",
  "message": "From: billing@bank.example\r\nTo: user@example.org\r\nSubject: Verify your account\r\n\r\n...",
  "remoteIp": "192.0.2.25",
  "ehloDomain": "mail.bank.example",
  "mailFrom": "billing@bank.example",
  "rcptTo": {"user@example.org": true}
}
```

Besides the score, the verdict and the tags, the result contains three fields about the AI classifier. `aiGate` states whether the classifier ran, or the reason it was skipped. `aiFacts` holds the exact JSON record that was sent to the model. `aiVerdict` gives the verdict, in the format of the `X-Spam-AI` header.

`aiFacts` deserves particular attention. It shows what the model is basing its decision on, and also what message content leaves the server.

## Switch to scoring

When the verdicts are satisfactory, set `mode` to `Automatic`. From then on, the `AI_*` tags are added to the messages and count towards their score:

```json
{
  "mode": "Automatic"
}
```

The weight of the verdicts is still adjustable after the switch. The scores of the `AI_*` tags come from the rule set, and can be changed like any other tag score ([Scores](/docs/spamfilter/settings/scores)). A server that receives much targeted phishing might, for example, give `AI_PHISHING_HIGH` more weight.

## Add a second tier

A second, more capable model can be added, and consulted only for the messages on which the first one is not conclusive, and for the categories in which a mistake is costly. The following object body queries the large model when the small one is not confident, or when it reports phishing or malware:

```json
{
  "tiers": {
    "0": {"modelId": "<small AiModel id>", "escalateBelow": 0.3, "escalateOn": {"phishing": true, "malware": true}},
    "1": {"modelId": "<large AiModel id>"}
  }
}
```

[Tiers](/docs/spamfilter/ai/#tiers) describes the escalation rules.

## Enable learning

Once the model is trusted, its confident verdicts can also train the statistical classifier, so that it learns to recognise the same kind of messages without a model. This step is optional. The following object body enables learning with the default thresholds:

```json
{
  "learn": {"@type": "Enable", "minProbability": 0.95, "sampleRate": 0.1}
}
```

[Learning from AI verdicts](/docs/spamfilter/ai/#learning-from-ai-verdicts) describes which verdicts are used.
