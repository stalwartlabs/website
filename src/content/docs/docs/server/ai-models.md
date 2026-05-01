---
sidebar_position: 9
title: "AI Models"
---

Stalwart can call out to large language models for tasks such as [spam classification](/docs/spamfilter/llm), threat detection, and [message categorization](/docs/sieve/llm). Any endpoint that exposes an OpenAI-compatible chat or text-completion API is supported, whether hosted by a provider such as OpenAI or Anthropic or run locally through a tool such as LocalAI. This choice lets operators balance cost, latency, and privacy according to the deployment.

:::tip Enterprise feature

This feature is available exclusively in the [Enterprise Edition](/docs/server/enterprise) of Stalwart and is not included in the Community Edition.

:::

## Configuration

Each AI endpoint is represented by an [AiModel](/docs/ref/object/ai-model) object (found in the WebUI under <!-- breadcrumb:AiModel --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M12 18V5" /><path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4" /><path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5" /><path d="M17.997 5.125a4 4 0 0 1 2.526 5.77" /><path d="M18 18a4 4 0 0 0 2-7.464" /><path d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517" /><path d="M6 18a4 4 0 0 1-2-7.464" /><path d="M6.003 5.125a4 4 0 0 0-2.526 5.77" /></svg> AI<!-- /breadcrumb:AiModel -->). The relevant fields are:

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
