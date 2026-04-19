---
sidebar_position: 9
---

# AI Models

Stalwart can call out to large language models for tasks such as [spam classification](/docs/spamfilter/llm), threat detection, and [message categorization](/docs/sieve/llm). Any endpoint that exposes an OpenAI-compatible chat or text-completion API is supported, whether hosted by a provider such as OpenAI or Anthropic or run locally through a tool such as LocalAI. This choice lets operators balance cost, latency, and privacy according to the deployment.

:::tip Enterprise feature

This feature is available exclusively in the [Enterprise Edition](/docs/server/enterprise) of Stalwart and is not included in the Community Edition.

:::

## Configuration

Each AI endpoint is represented by an [AiModel](/docs/ref/object/ai-model) object (found in the WebUI under <!-- breadcrumb:AiModel --><!-- /breadcrumb:AiModel -->). The relevant fields are:

- [`name`](/docs/ref/object/ai-model#name): short identifier for the model within Stalwart.
- [`url`](/docs/ref/object/ai-model#url): full URL of the OpenAI-compatible endpoint (for example `https://api.openai.com/v1/chat/completions`).
- [`model`](/docs/ref/object/ai-model#model): the model name to send to the endpoint, such as `gpt-4`.
- [`modelType`](/docs/ref/object/ai-model#modeltype): `Chat` for chat completions or `Text` for text completions. Default `Chat`.
- [`timeout`](/docs/ref/object/ai-model#timeout): maximum time to wait for a response. Default `"2m"`.
- [`temperature`](/docs/ref/object/ai-model#temperature): randomness of the response, in the range `0.0` to `1.0`. Default `0.7`.
- [`allowInvalidCerts`](/docs/ref/object/ai-model#allowinvalidcerts): whether to accept invalid TLS certificates. Default `false`. Recommended only for local or self-signed endpoints.
- [`httpAuth`](/docs/ref/object/ai-model#httpauth): authentication method, either `Unauthenticated`, `Basic`, or `Bearer`.
- [`httpHeaders`](/docs/ref/object/ai-model#httpheaders): additional HTTP headers sent with every request.

For example, a chat endpoint authenticated with a bearer token and an extra custom header:

```json
{
  "name": "chat",
  "url": "https://api.openai.com/v1/chat/completions",
  "model": "gpt-4",
  "modelType": "Chat",
  "timeout": "2m",
  "temperature": 0.7,
  "allowInvalidCerts": false,
  "httpAuth": {
    "@type": "Bearer",
    "bearerToken": {
      "@type": "Value",
      "secret": "my-secret-token"
    }
  },
  "httpHeaders": {
    "X-My-Header": "my-value"
  }
}
```
