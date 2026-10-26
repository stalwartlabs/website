---
title: "AiModel"
description: "Defines an AI model endpoint used by AI-assisted features such as the spam classifier and the Sieve llm_prompt function."
custom_edit_url: null
---

Defines an AI model endpoint used by AI-assisted features such as the spam classifier and the Sieve llm_prompt function.

:::note[Enterprise feature]
This object is only available with an [Enterprise license](/docs/server/enterprise).
:::

This object can be configured from the [WebUI](/docs/management/webui/) under <span data-target="AiModel"><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M12 18V5" /><path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4" /><path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5" /><path d="M17.997 5.125a4 4 0 0 1 2.526 5.77" /><path d="M18 18a4 4 0 0 0 2-7.464" /><path d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517" /><path d="M6 18a4 4 0 0 1-2-7.464" /><path d="M6.003 5.125a4 4 0 0 0-2.526 5.77" /></svg> AI</span>

## Fields

AiModel is a **multi-variant** object: each instance has an `@type` discriminator selecting one of the variants below, and each variant carries its own set of fields.


### `@type: "OpenAi"`

OpenAI compatible


##### `profile`

> Type: [<code>AiOpenAiProfile</code>](#aiopenaiprofile) · default: `"OpenAi"`
>
> Server profile, which selects the token limit parameter, the structured output format and the authentication header


##### `logprobs`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to request token log probabilities and use them as the classifier confidence


##### `maxOutputTokens`

> Type: <code>UnsignedInt</code> · default: `4096` · min: 1 · max: 1000000
>
> Maximum number of tokens the model may generate, including reasoning tokens. The spam classifier uses its own smaller limit.


##### `temperature`

> Type: <code>Float?</code> · min: 0 · max: 2
>
> Sampling temperature. When empty, the parameter is omitted and the provider default is used.


##### `reasoning`

> Type: [<code>AiReasoning</code>](#aireasoning) · default: `"Default"`
>
> Reasoning effort requested from the model


##### `extraParameters`

> Type: <code>Text?</code>
>
> JSON object whose members are merged into every request body


##### `name`

> Type: <code>String</code> · required
>
> Short name used to reference this model


##### `model`

> Type: <code>String</code> · required
>
> Model identifier sent to the provider


##### `url`

> Type: <code>Uri?</code>
>
> Base URL of the provider API. When empty, the provider's default URL is used.


##### `apiKey`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · default: `{"@type":"None"}`
>
> API key sent to the provider using its native authentication header


##### `httpHeaders`

> Type: <code>Map&lt;String, String&gt;</code>
>
> Additional headers to include in requests to the provider


##### `allowInvalidCerts`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to accept invalid TLS certificates from the endpoint


##### `timeout`

> Type: <code>Duration</code> · default: `60000`
>
> Maximum time to wait for a single response from the endpoint


##### `maxConcurrentRequests`

> Type: <code>UnsignedInt</code> · default: `16` · min: 1 · max: 4096
>
> Maximum number of requests sent to this model at the same time


##### `rateLimit`

> Type: [<code>Rate</code>](#rate)<code>?</code>
>
> Maximum number of requests sent to this model within the rate period, spaced evenly. When empty, no rate limit is applied.



### `@type: "Anthropic"`

Anthropic


##### `maxOutputTokens`

> Type: <code>UnsignedInt</code> · default: `4096` · min: 1 · max: 1000000
>
> Maximum number of tokens the model may generate, including reasoning tokens. The spam classifier uses its own smaller limit.


##### `temperature`

> Type: <code>Float?</code> · min: 0 · max: 2
>
> Sampling temperature. When empty, the parameter is omitted and the provider default is used.


##### `reasoning`

> Type: [<code>AiReasoning</code>](#aireasoning) · default: `"Default"`
>
> Reasoning effort requested from the model


##### `extraParameters`

> Type: <code>Text?</code>
>
> JSON object whose members are merged into every request body


##### `name`

> Type: <code>String</code> · required
>
> Short name used to reference this model


##### `model`

> Type: <code>String</code> · required
>
> Model identifier sent to the provider


##### `url`

> Type: <code>Uri?</code>
>
> Base URL of the provider API. When empty, the provider's default URL is used.


##### `apiKey`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · default: `{"@type":"None"}`
>
> API key sent to the provider using its native authentication header


##### `httpHeaders`

> Type: <code>Map&lt;String, String&gt;</code>
>
> Additional headers to include in requests to the provider


##### `allowInvalidCerts`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to accept invalid TLS certificates from the endpoint


##### `timeout`

> Type: <code>Duration</code> · default: `60000`
>
> Maximum time to wait for a single response from the endpoint


##### `maxConcurrentRequests`

> Type: <code>UnsignedInt</code> · default: `16` · min: 1 · max: 4096
>
> Maximum number of requests sent to this model at the same time


##### `rateLimit`

> Type: [<code>Rate</code>](#rate)<code>?</code>
>
> Maximum number of requests sent to this model within the rate period, spaced evenly. When empty, no rate limit is applied.



### `@type: "Gemini"`

Google Gemini


##### `logprobs`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to request token log probabilities and use them as the classifier confidence


##### `maxOutputTokens`

> Type: <code>UnsignedInt</code> · default: `4096` · min: 1 · max: 1000000
>
> Maximum number of tokens the model may generate, including reasoning tokens. The spam classifier uses its own smaller limit.


##### `temperature`

> Type: <code>Float?</code> · min: 0 · max: 2
>
> Sampling temperature. When empty, the parameter is omitted and the provider default is used.


##### `reasoning`

> Type: [<code>AiReasoning</code>](#aireasoning) · default: `"Default"`
>
> Reasoning effort requested from the model


##### `extraParameters`

> Type: <code>Text?</code>
>
> JSON object whose members are merged into every request body


##### `name`

> Type: <code>String</code> · required
>
> Short name used to reference this model


##### `model`

> Type: <code>String</code> · required
>
> Model identifier sent to the provider


##### `url`

> Type: <code>Uri?</code>
>
> Base URL of the provider API. When empty, the provider's default URL is used.


##### `apiKey`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · default: `{"@type":"None"}`
>
> API key sent to the provider using its native authentication header


##### `httpHeaders`

> Type: <code>Map&lt;String, String&gt;</code>
>
> Additional headers to include in requests to the provider


##### `allowInvalidCerts`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to accept invalid TLS certificates from the endpoint


##### `timeout`

> Type: <code>Duration</code> · default: `60000`
>
> Maximum time to wait for a single response from the endpoint


##### `maxConcurrentRequests`

> Type: <code>UnsignedInt</code> · default: `16` · min: 1 · max: 4096
>
> Maximum number of requests sent to this model at the same time


##### `rateLimit`

> Type: [<code>Rate</code>](#rate)<code>?</code>
>
> Maximum number of requests sent to this model within the rate period, spaced evenly. When empty, no rate limit is applied.



### `@type: "Ollama"`

Ollama


##### `logprobs`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to request token log probabilities and use them as the classifier confidence


##### `keepAlive`

> Type: <code>Duration?</code>
>
> How long Ollama keeps the model loaded after a request. When empty, the server default is used.


##### `maxOutputTokens`

> Type: <code>UnsignedInt</code> · default: `4096` · min: 1 · max: 1000000
>
> Maximum number of tokens the model may generate, including reasoning tokens. The spam classifier uses its own smaller limit.


##### `temperature`

> Type: <code>Float?</code> · min: 0 · max: 2
>
> Sampling temperature. When empty, the parameter is omitted and the provider default is used.


##### `reasoning`

> Type: [<code>AiReasoning</code>](#aireasoning) · default: `"Default"`
>
> Reasoning effort requested from the model


##### `extraParameters`

> Type: <code>Text?</code>
>
> JSON object whose members are merged into every request body


##### `name`

> Type: <code>String</code> · required
>
> Short name used to reference this model


##### `model`

> Type: <code>String</code> · required
>
> Model identifier sent to the provider


##### `url`

> Type: <code>Uri?</code>
>
> Base URL of the provider API. When empty, the provider's default URL is used.


##### `apiKey`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · default: `{"@type":"None"}`
>
> API key sent to the provider using its native authentication header


##### `httpHeaders`

> Type: <code>Map&lt;String, String&gt;</code>
>
> Additional headers to include in requests to the provider


##### `allowInvalidCerts`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to accept invalid TLS certificates from the endpoint


##### `timeout`

> Type: <code>Duration</code> · default: `60000`
>
> Maximum time to wait for a single response from the endpoint


##### `maxConcurrentRequests`

> Type: <code>UnsignedInt</code> · default: `16` · min: 1 · max: 4096
>
> Maximum number of requests sent to this model at the same time


##### `rateLimit`

> Type: [<code>Rate</code>](#rate)<code>?</code>
>
> Maximum number of requests sent to this model within the rate period, spaced evenly. When empty, no rate limit is applied.



### `@type: "TypeSafe"`

TypeSafe


##### `name`

> Type: <code>String</code> · required
>
> Short name used to reference this model


##### `model`

> Type: <code>String</code> · required
>
> Model identifier sent to the provider


##### `url`

> Type: <code>Uri?</code>
>
> Base URL of the provider API. When empty, the provider's default URL is used.


##### `apiKey`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · default: `{"@type":"None"}`
>
> API key sent to the provider using its native authentication header


##### `httpHeaders`

> Type: <code>Map&lt;String, String&gt;</code>
>
> Additional headers to include in requests to the provider


##### `allowInvalidCerts`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to accept invalid TLS certificates from the endpoint


##### `timeout`

> Type: <code>Duration</code> · default: `60000`
>
> Maximum time to wait for a single response from the endpoint


##### `maxConcurrentRequests`

> Type: <code>UnsignedInt</code> · default: `16` · min: 1 · max: 4096
>
> Maximum number of requests sent to this model at the same time


##### `rateLimit`

> Type: [<code>Rate</code>](#rate)<code>?</code>
>
> Maximum number of requests sent to this model within the rate period, spaced evenly. When empty, no rate limit is applied.




## JMAP API

The AiModel object is available via the `urn:stalwart:jmap` capability.


### `x:AiModel/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysAiModelGet` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:AiModel/get",
          {
            "ids": [
              "id1"
            ]
          },
          "c1"
        ]
      ],
      "using": [
        "urn:ietf:params:jmap:core",
        "urn:stalwart:jmap"
      ]
    }'
```



### `x:AiModel/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports the following operations in a single call: create, update, destroy.



#### Create

This operation requires the `sysAiModelCreate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:AiModel/set",
          {
            "create": {
              "new1": {
                "@type": "OpenAi",
                "apiKey": {
                  "@type": "None"
                },
                "httpHeaders": {},
                "model": "Example",
                "name": "Example"
              }
            }
          },
          "c1"
        ]
      ],
      "using": [
        "urn:ietf:params:jmap:core",
        "urn:stalwart:jmap"
      ]
    }'
```


#### Update

This operation requires the `sysAiModelUpdate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:AiModel/set",
          {
            "update": {
              "id1": {
                "extraParameters": "updated value"
              }
            }
          },
          "c1"
        ]
      ],
      "using": [
        "urn:ietf:params:jmap:core",
        "urn:stalwart:jmap"
      ]
    }'
```


#### Destroy

This operation requires the `sysAiModelDestroy` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:AiModel/set",
          {
            "destroy": [
              "id1"
            ]
          },
          "c1"
        ]
      ],
      "using": [
        "urn:ietf:params:jmap:core",
        "urn:stalwart:jmap"
      ]
    }'
```




### `x:AiModel/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysAiModelQuery` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:AiModel/query",
          {
            "filter": {}
          },
          "c1"
        ]
      ],
      "using": [
        "urn:ietf:params:jmap:core",
        "urn:stalwart:jmap"
      ]
    }'
```




## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get AiModel id1
```


### Create

```sh
stalwart-cli create AiModel/OpenAi \
  --field name=Example \
  --field model=Example \
  --field 'apiKey={"@type":"None"}' \
  --field 'httpHeaders={}'
```


### Query

```sh
stalwart-cli query AiModel
```


### Update

```sh
stalwart-cli update AiModel id1 --field extraParameters='updated value'
```


### Delete

```sh
stalwart-cli delete AiModel --ids id1
```



## Nested types


### SecretKeyOptional

An optional secret value, or none.


- **`None`**: No secret. No additional fields.
- **`Value`**: Secret value. Carries the fields of [`SecretKeyValue`](#secretkeyvalue).
- **`EnvironmentVariable`**: Secret read from environment variable. Carries the fields of [`SecretKeyEnvironmentVariable`](#secretkeyenvironmentvariable).
- **`File`**: Secret read from file. Carries the fields of [`SecretKeyFile`](#secretkeyfile).




#### SecretKeyValue

A secret value provided directly.



##### `secret`

> Type: <code>String</code> · required · secret
>
> Password or secret value





#### SecretKeyEnvironmentVariable

A secret value read from an environment variable.



##### `variableName`

> Type: <code>String</code> · required
>
> Environment variable name to read the secret from





#### SecretKeyFile

A secret value read from a file.



##### `filePath`

> Type: <code>String</code> · required
>
> File path to read the secret from





### Rate

Defines a rate limit as a count over a time period.



##### `count`

> Type: <code>UnsignedInt</code> · default: `0` · min: 1 · max: 1000000
>
> Count


##### `period`

> Type: <code>Duration</code> · default: `0` · min: 1
>
> Period





## Enums


### AiOpenAiProfile



| Value | Label |
|---|---|
| `OpenAi` | OpenAI |
| `Azure` | Azure OpenAI |
| `Vllm` | vLLM |
| `LlamaCpp` | llama.cpp |
| `Generic` | Generic |


### AiReasoning



| Value | Label |
|---|---|
| `Default` | Provider default |
| `Off` | Off |
| `Low` | Low |
| `Medium` | Medium |
| `High` | High |


