---
sidebar_position: 9
title: "AI models"
description: "Connect Stalwart to OpenAI, Anthropic, Gemini, Ollama, TypeSafe or any OpenAI-compatible server, and control the cost, latency and failure behaviour of model calls."
---

Some decisions are hard to express as fixed rules. Whether a message is a phishing attempt, for example, depends on its wording and intent as much as on any header. A large language model can make such judgements, and Stalwart can delegate these decisions to one. Two features use this capability:

- The [AI spam classifier](/docs/spamfilter/ai) asks a model to categorise messages that the other spam filter checks cannot classify with confidence, and adds the verdict to the spam score.
- The `llm_prompt` function of the [Sieve](/docs/sieve/) filtering language sends a prompt composed by a script to a model and returns the reply to the script, as described in [LLM integration](/docs/sieve/llm).

Neither feature connects to a provider directly. Both refer instead to an [AiModel](/docs/ref/object/ai-model) (found in the WebUI under <!-- breadcrumb:AiModel --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M12 18V5" /><path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4" /><path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5" /><path d="M17.997 5.125a4 4 0 0 1 2.526 5.77" /><path d="M18 18a4 4 0 0 0 2-7.464" /><path d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517" /><path d="M6 18a4 4 0 0 1-2-7.464" /><path d="M6.003 5.125a4 4 0 0 0-2.526 5.77" /></svg> AI<!-- /breadcrumb:AiModel -->), which defines the endpoint, the credentials and the request limits for one model. Keeping these details in one place has two advantages: a single definition can serve both features, and changing provider requires editing only that definition.

:::tip[Enterprise feature]
This feature is available in the [Enterprise edition](/docs/server/enterprise) of Stalwart.
:::

## Providers

Each provider exposes a different API, so AiModel is a multi-variant object, and its `@type` selects the protocol to speak. The variant also determines the default address and the header that carries the API key:

| `@type` | API | Default base URL | API key header |
|---|---|---|---|
| `OpenAi` | OpenAI Chat Completions and compatible servers | `https://api.openai.com/v1` | `Authorization: Bearer`; `api-key` with the Azure profile |
| `Anthropic` | Anthropic Messages | `https://api.anthropic.com` | `x-api-key` |
| `Gemini` | Google Gemini `generateContent` | `https://generativelanguage.googleapis.com/v1beta` | `x-goog-api-key` |
| `Ollama` | Ollama chat | `http://localhost:11434` | `Authorization: Bearer` |
| `TypeSafe` | TypeSafe hosted spam classification | `https://api.typesafe.ai` | `Authorization: Bearer` |

The variants fall into two groups, which matters for the choice of feature. The first four are generative models, which produce free text, so both features can use them. `TypeSafe` is a classification service: it answers the spam classifier's questions directly and does not produce free text. It can therefore be used only by the spam classifier. An `llm_prompt` call that names a TypeSafe model returns no reply, and the server logs `Operation not supported by this model`.

Many servers implement the OpenAI API, but they differ in details: the name of the token limit parameter, the format used to request structured output, and the authentication header. The [`profile`](/docs/ref/object/ai-model#profile) field of the `OpenAi` variant selects which of these dialects to speak: `OpenAi`, `Azure`, `Vllm`, `LlamaCpp`, or `Generic` for other compatible servers.

The [`url`](/docs/ref/object/ai-model#url) field contains the base URL of the provider. When it is empty, the default from the table is used. Stalwart appends the API path, such as `/chat/completions`, unless the URL already ends with it, so a complete endpoint URL such as `https://api.openai.com/v1/chat/completions` is also accepted. All `OpenAi` profiles share OpenAI's address as their default. `url` must therefore be set for Azure OpenAI and for self-hosted vLLM or llama.cpp servers.

The [`apiKey`](/docs/ref/object/ai-model#apikey) field takes the key in one of three forms: a value entered directly, the name of an environment variable, or the path of a file that contains the key. Local servers that do not require authentication use `None` instead.

Two further settings adapt the connection to the network in between. [`httpHeaders`](/docs/ref/object/ai-model#httpheaders) adds headers to every request, for example the routing header of an API gateway. [`allowInvalidCerts`](/docs/ref/object/ai-model#allowinvalidcerts) accepts self-signed certificates on internal endpoints.

## Generation settings

The four generative variants share the following settings. They apply to every request sent to the model, and they trade the quality of the reply against its cost and latency.

[`maxOutputTokens`](/docs/ref/object/ai-model#maxoutputtokens) limits the length of the reply, measured in tokens, the units of text a model processes. The limit is <!-- default:AiModel.maxOutputTokens -->4096<!-- /default --> tokens unless changed. It includes reasoning tokens, so a reasoning model can exhaust it before it produces an answer. When `reasoning` is `Off`, the spam classifier sends its own, lower limit to models other than `Anthropic`. Otherwise this limit applies.

[`reasoning`](/docs/ref/object/ai-model#reasoning) sets the reasoning effort requested from models that support it: `Default` (the provider's setting), `Off`, `Low`, `Medium` or `High`. Higher levels let the model reason longer before it answers. That costs latency and token usage, and the reasoning tokens count against `maxOutputTokens`. Whether a higher level improves the result depends on the model and the task. For a high-volume task such as spam classification the added latency applies to every message, so compare the results of the levels on a sample of real messages before choosing one.

[`temperature`](/docs/ref/object/ai-model#temperature) controls the randomness of the reply, in the range 0 to 2. Lower values make the replies more predictable. The field has no default: when it is empty, the parameter is omitted, and the provider's default applies. The third argument of `llm_prompt`, limited to the range 0 to 1, takes precedence over this field.

Providers offer more options than the fields above cover. [`extraParameters`](/docs/ref/object/ai-model#extraparameters) contains a JSON object whose members are added to every request body, which makes those options available. If the value is not a JSON object, the model is not loaded and the server reports `Extra parameters must be a JSON object`.

Two settings exist only for some variants. The `OpenAi`, `Gemini` and `Ollama` variants can request token log probabilities ([`logprobs`](/docs/ref/object/ai-model#logprobs)), the probabilities that the model assigns to each token of its reply. The spam classifier then uses these probabilities as its confidence value, in place of the confidence level that the model states. Enable this setting only for providers and models that return log probabilities.

The `Ollama` variant also provides [`keepAlive`](/docs/ref/object/ai-model#keepalive), the time Ollama keeps the model loaded after a request. A model that is unloaded between messages incurs its loading time again on the next request.

## Limits and failures

A model call goes to an external service, which can be slow, overloaded or down. Three settings bound the time and the volume of model calls.

[`timeout`](/docs/ref/object/ai-model#timeout) is the time an `llm_prompt` call may take in total, <!-- default:AiModel.timeout -->1 minute<!-- /default --> unless changed. The time includes waiting for a free request slot or for the rate limit, and one retry of a failed request. Establishing the connection is limited to at most 10 seconds within that time. The spam classifier sets the time per message with its own, shorter deadline, [`SpamAi.deadline`](/docs/ref/object/spam-ai#deadline), so `timeout` has no effect there.

[`maxConcurrentRequests`](/docs/ref/object/ai-model#maxconcurrentrequests) limits the number of requests sent to the model at the same time. Additional requests wait until a request completes. If the time available for them runs out first, they fail with `Concurrency or rate limit reached`.

[`rateLimit`](/docs/ref/object/ai-model#ratelimit) limits the requests to `count` per `period`, spaced evenly across the period, which keeps the server within a provider's quota.

Each model is also protected by a circuit breaker, a mechanism that stops sending requests to a model that is failing. The breaker opens in two situations:

- After five consecutive failures
- Immediately on an authentication or billing error: HTTP status 401, 403 or 402, or a reply that reports an exhausted quota or spending limit

While the breaker is open, the model is skipped for 60 seconds, and the server logs the `ai.breaker-open` event. The spam classifier configures its own threshold and duration, with [`breakerThreshold`](/docs/ref/object/spam-ai#breakerthreshold) and [`breakerCooldown`](/docs/ref/object/spam-ai#breakercooldown).

Completed requests are logged as `ai.request` events at debug level, with the model, latency and token usage. Failed requests are logged as `ai.api-error` events.

A model failure does not prevent mail delivery. When a model of the spam classifier fails, the classifier tries the next configured model. Only when every model has failed does it add the `AI_ERROR` tag and score the message without a verdict. When every model is skipped because its breaker is open, the classifier adds no tag. `llm_prompt` returns `false` to the script when its model fails.

A model definition that cannot be loaded is reported when the configuration is loaded. Examples are `Invalid AI model URL` when the URL is invalid, and `Unable to obtain AI model API key` when the API key cannot be read. The consequence depends on when the error occurs. At startup, the model is unavailable to both features. A settings reload with such an error is refused, and the previous configuration stays in use.

## Examples

The following model is served by vLLM on the local network, requires no authentication and has reasoning disabled:

```json
{
  "@type": "OpenAi",
  "name": "local-qwen",
  "profile": "Vllm",
  "url": "http://10.0.0.12:8000/v1",
  "model": "Qwen/Qwen3-8B",
  "apiKey": {"@type": "None"},
  "reasoning": "Off",
  "timeout": 30000,
  "maxConcurrentRequests": 8
}
```

The following Anthropic model reads its API key from an environment variable and is limited to 50 requests per minute:

```json
{
  "@type": "Anthropic",
  "name": "claude",
  "model": "claude-haiku-4-5",
  "apiKey": {"@type": "EnvironmentVariable", "variableName": "ANTHROPIC_API_KEY"},
  "rateLimit": {"count": 50, "period": 60000}
}
```

The two features refer to a model in different ways. The spam classifier references a model by its identifier, in the tiers of [SpamAi](/docs/ref/object/spam-ai), the ordered list of models it queries. Sieve scripts reference a model by its [`name`](/docs/ref/object/ai-model#name), as in `llm_prompt("claude", prompt, 0.2)`.

Access from scripts depends on who installed them. Trusted scripts, which the administrator installs, can call any model. Scripts installed by users require the `interactAi` [permission](/docs/ref/permissions).
