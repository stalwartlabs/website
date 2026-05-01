---
title: SpamLlm
description: Configures the LLM-based spam classifier.
custom_edit_url: null
---

# SpamLlm

Configures the LLM-based spam classifier.

:::note[Enterprise feature]
This object is only available with an [Enterprise license](/docs/server/enterprise).
:::

This object can be configured from the [WebUI](/docs/management/webui/) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> Spam Filter › LLM Classifier

## Fields

SpamLlm is a **multi-variant** object: each instance has an `@type` discriminator selecting one of the variants below, and each variant carries its own set of fields.


### `@type: "Disable"`

Disabled



### `@type: "Enable"`

Enabled


##### `categories`

> Type: <code>String[]</code> · default: `["Unsolicited","Commercial","Harmful","Legitimate"]` · min items: 2
>
> The expected categories in the LLM response


##### `confidence`

> Type: <code>String[]</code> · default: `["High","Medium","Low"]`
>
> The expected confidence levels in the LLM response


##### `responsePosCategory`

> Type: <code>UnsignedInt</code> · default: `0`
>
> The position of the category field in the LLM response.


##### `responsePosConfidence`

> Type: <code>UnsignedInt?</code> · default: `1`
>
> The position of the confidence field in the LLM response.


##### `responsePosExplanation`

> Type: <code>UnsignedInt?</code> · default: `2`
>
> The position of the explanation field in the LLM response.


##### `modelId`

> Type: <code>Id&lt;</code>[<code>AiModel</code>](./ai-model.md)<code>&gt;</code> · required
>
> The AI model to use for the LLM classifier


##### `prompt`

> Type: <code>Text</code> · required
>
> The prompt to use for the LLM classifier


##### `separator`

> Type: <code>String</code> · default: `","`
>
> The separator character used to parse the LLM response.


##### `temperature`

> Type: <code>Float</code> · default: `0.5` · max: 1 · min: 0
>
> The temperature to use for the LLM classifier




## JMAP API

The SpamLlm singleton is available via the `urn:stalwart:jmap` capability.


### `x:SpamLlm/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysSpamLlmGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:SpamLlm/get",
          {
            "ids": [
              "singleton"
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



### `x:SpamLlm/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysSpamLlmUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:SpamLlm/set",
          {
            "update": {
              "singleton": {
                "description": "updated value"
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




## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get SpamLlm
```


### Update

```sh
stalwart-cli update SpamLlm --field description='updated value'
```



