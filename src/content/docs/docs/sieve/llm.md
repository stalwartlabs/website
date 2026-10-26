---
sidebar_position: 5
title: "AI models in Sieve"
description: "The llm_prompt function, which sends a prompt to a configured AI model from a Sieve script and returns the reply, with its arguments, permissions, failure behaviour and the security and cost considerations of using it."
---

:::tip[Enterprise feature]
This feature is available in the [Enterprise edition](/docs/server/enterprise) of Stalwart.
:::

Some sorting rules are easy to state in words and hard to express as Sieve tests: "messages from my family", "anything about cycling", "sales pitches that are not about work". The `llm_prompt` function lets a script hand such decisions to a language model. It sends a prompt to one of the [AI models](/docs/server/ai-models) configured on the server, and returns the model's reply as a string.

A Sieve script can use the reply to classify a message, extract information from it, or decide where to file it, following rules written in natural language. The function belongs to the `vnd.stalwart.expressions` extension, and is called from an [expression](/docs/sieve/expressions), for example in a `let` instruction.

The function is available to system scripts in the [trusted interpreter](/docs/sieve/interpreter/trusted), and to user scripts in the [untrusted interpreter](/docs/sieve/interpreter/untrusted). It is the one function in user scripts that reaches an external system, so access to it is controlled per account. In a user script, it works only when the account holds the `interactAi` [permission](/docs/auth/authorization/permissions). Without it, each call returns `false`, and the refusal is logged as `security.unauthorized`.

The default User and System Administrator roles hold the permission. Remove it from the roles of accounts that should not use AI models.

## Syntax

```text
llm_prompt(model, prompt, temperature)
```

- `model` is the `name` of an [AiModel](/docs/ref/object/ai-model). When exactly one AI model is configured, an empty string selects it.
- `prompt` is the text sent to the model, usually built from a fixed instruction and parts of the message.
- `temperature` is a number between `0` and `1` that controls how much the model varies its answers, with lower values giving more consistent replies. Values outside the range are clamped. A value that is not a number leaves the temperature to the model's configuration.

The prompt is sent as plain text, without a system prompt, and the reply is returned as text. Everything else about the request comes from the AiModel. The model's own settings, such as `maxOutputTokens`, `reasoning`, `extraParameters` and `timeout`, apply as configured there. Its `maxConcurrentRequests` and `rateLimit` limit the calls made from all scripts together.

A model call can fail for many reasons, and the function reports all of them the same way: it returns `false`. Failures include an unknown model name, a missing permission, a timeout, a rate limit or concurrency limit reached, an open circuit breaker, and an error returned by the provider. Errors from the provider are logged as `ai.api-error`, with the model name and the reason. A script should therefore test the reply before using it, as the example below does.

## Writing the prompt

A prompt is usually long enough to be kept in its own variable, assigned with `let`. Writing it requires care with quoting. The value of a `let` is parsed as an expression, so literal text must be quoted inside the Sieve string, and a multi-line prompt is written in a `text:` block. [Literal text in let and eval](/docs/sieve/expressions#literal-text-in-let-and-eval) gives the quoting rules. The following line assigns a two-line prompt:

```sieve
let "prompt" "'Classify the message into one of the folders listed below.\nIf the category is not clear, respond with Inbox.'";
```

<!-- sievepad { "noCapabilityCheck": true } -->
<p><a href="https://sievepad.com/#w=NY-xboNADIZfxfKSBUXqSqeKiTlDh16H4zBg9TijsxOKIqQ8Vx6nT1JI2s2ff_n_f1_xguVLgcmPhCWezMfZZ4NWgpbwVsMoLUUFTnBiuhD83O7wntk49WADwZRlnAwL1JB5MsXy4_rvNnpOuyLnHHaOZODweeFwGw9V9KrcLQ-rkVR9T1uWCUgikO6x7yS2lBUiq1ELDUWZj86l-ikHb9RLXoAVkhiESD4XkEknSS3MbAPUqZHv48Hhq0u4fhb4l7XX3UjJ9oc22rpL5SffcGRbqoHCF5aWz7Suvw" target="_blank" rel="noopener">Try this script in Sievepad</a></p>
<!-- /sievepad -->

## Example

The following user script asks a model named `classifier` to choose a folder for each incoming message, based on its subject and text. It files the message into that folder only when the reply names one of the expected folders:

```sieve
require ["fileinto", "vnd.stalwart.expressions"];

let "prompt" text:
"You classify personal email into folders.
Analyse the subject and body of the message below and respond with exactly one
of these folder names and nothing else: Family, Cycling, Work, Junk Mail, Inbox.

- Family: the message is signed by a member of the Doe family.
- Cycling: the message is about cycling.
- Work: the message is about Dunder Mifflin Paper Company or paper supplies.
- Junk Mail: the message tries to sell something and is not about work.
- Inbox: none of the above applies."
.
;

let "subject" "thread_name(header.subject)";
let "body" "body.to_text";

let "reply" "llm_prompt('classifier', prompt + '\n\nSubject: ' + subject + '\n\n' + body, 0.2)";

if eval "contains(['Family', 'Cycling', 'Work', 'Junk Mail'], reply)" {
    fileinto "${reply}";
}
```

<!-- sievepad skip: calls an AI model, which Sievepad cannot reach -->

The final test makes the script robust. When the call fails, `reply` is `false`, no folder matches, and the message is delivered to the inbox. The same test also guards against unexpected replies, as described below.

The same pattern works in a system script at the DATA stage. There, the reply can decide whether to add a header or reject the message.

## Security and privacy

The text of a message is written by its sender, and the sender may include instructions addressed to the model, for example asking it to reply with a particular folder name. This technique is known as prompt injection. A script must therefore treat the reply as untrusted input. It should accept only values from a fixed list, as the example does, and never use the reply to build a reject text, an address for `redirect`, or any other action whose effect the sender should not control.

Privacy is the second concern. Calling a model that runs outside the server sends the prompt, and with it the parts of the message the script includes, to that provider. Use a model hosted on infrastructure the organisation controls when message content must not leave it.

## Performance and cost

Each call is a request to the model, and the delivery of the message waits for it. A user script that calls a model runs for every message delivered to the account, so the number of requests grows with the volume of mail and with the number of users who have such scripts.

The cost takes different forms depending on where the model runs. A self-hosted model without GPU acceleration may take seconds per request, and delay delivery accordingly. A hosted model charges for the input and output tokens of every request.

Two controls bound this cost. The AiModel's `timeout`, `maxConcurrentRequests` and `rateLimit` bound the load a model receives, and the `interactAi` permission controls which users may call models at all.
