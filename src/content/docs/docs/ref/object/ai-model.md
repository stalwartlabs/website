---
title: AiModel
description: Defines an AI model endpoint for LLM-based features.
custom_edit_url: null
---

# AiModel

Defines an AI model endpoint for LLM-based features.

:::note[Enterprise feature]
This object is only available with an [Enterprise license](/docs/server/enterprise).
:::

This object can be configured from the [WebUI](/docs/management/webui/) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M12 18V5" /><path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4" /><path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5" /><path d="M17.997 5.125a4 4 0 0 1 2.526 5.77" /><path d="M18 18a4 4 0 0 0 2-7.464" /><path d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517" /><path d="M6 18a4 4 0 0 1-2-7.464" /><path d="M6.003 5.125a4 4 0 0 0-2.526 5.77" /></svg> AI

## Fields


##### `name`

> Type: <code>String</code> · required
>
> Short name for the AI Model


##### `allowInvalidCerts`

> Type: <code>Boolean</code> · default: `false`
>
> Whether Stalwart should connect to an endpoint that has an invalid TLS certificate


##### `temperature`

> Type: <code>Float</code> · default: `0.7` · max: 1 · min: 0
>
> The temperature of the AI model, which controls the randomness of the output. A higher temperature will produce more random output.


##### `model`

> Type: <code>String</code> · required
>
> The name of the AI model to use.


##### `timeout`

> Type: <code>Duration</code> · default: `"2m"`
>
> Maximum amount of time that Stalwart will wait for a response from this endpoint


##### `modelType`

> Type: [<code>AiModelType</code>](#aimodeltype) · default: `"Chat"`
>
> API type


##### `url`

> Type: <code>Uri</code> · required
>
> URL of the OpenAI compatible endpoint


##### `httpAuth`

> Type: [<code>HttpAuth</code>](#httpauth) · required
>
> The type of HTTP authentication to use


##### `httpHeaders`

> Type: <code>Map&lt;String, String&gt;</code>
>
> Additional headers to include in HTTP requests



## JMAP API

The AiModel object is available via the `urn:stalwart:jmap` capability.


### `x:AiModel/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysAiModelGet` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
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

Supports create, update, and destroy operations in a single call.



#### Create

This operation requires the `sysAiModelCreate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:AiModel/set",
          {
            "create": {
              "new1": {
                "httpAuth": {
                  "@type": "Unauthenticated"
                },
                "httpHeaders": {},
                "model": "Example",
                "name": "Example",
                "url": "https://example.com"
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
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:AiModel/set",
          {
            "update": {
              "id1": {
                "name": "updated value"
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
curl -X POST https://mail.example.com/api \
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
curl -X POST https://mail.example.com/api \
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
stalwart-cli create AiModel \
  --field name=Example \
  --field model=Example \
  --field url=https://example.com \
  --field 'httpAuth={"@type":"Unauthenticated"}' \
  --field 'httpHeaders={}'
```


### Query

```sh
stalwart-cli query AiModel
```


### Update

```sh
stalwart-cli update AiModel id1 --field name='updated value'
```


### Delete

```sh
stalwart-cli delete AiModel --ids id1
```



## Nested types


### HttpAuth

Defines the HTTP authentication method to use for HTTP requests.


- **`Unauthenticated`**: Anonymous. No additional fields.
- **`Basic`**: Basic Authentication. Carries the fields of [`HttpAuthBasic`](#httpauthbasic).
- **`Bearer`**: Bearer Token. Carries the fields of [`HttpAuthBearer`](#httpauthbearer).




#### HttpAuthBasic

HTTP Basic authentication credentials.



##### `username`

> Type: <code>String</code> · required
>
> Username for HTTP Basic Authentication


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> Password for HTTP Basic Authentication





##### SecretKey

A secret value provided directly, from an environment variable, or from a file.


- **`Value`**: Secret value. Carries the fields of [`SecretKeyValue`](#secretkeyvalue).
- **`EnvironmentVariable`**: Secret read from environment variable. Carries the fields of [`SecretKeyEnvironmentVariable`](#secretkeyenvironmentvariable).
- **`File`**: Secret read from file. Carries the fields of [`SecretKeyFile`](#secretkeyfile).




##### SecretKeyValue

A secret value provided directly.



##### `secret`

> Type: <code>String</code> · required · secret
>
> Password or secret value





##### SecretKeyEnvironmentVariable

A secret value read from an environment variable.



##### `variableName`

> Type: <code>String</code> · required
>
> Environment variable name to read the secret from





##### SecretKeyFile

A secret value read from a file.



##### `filePath`

> Type: <code>String</code> · required
>
> File path to read the secret from





#### HttpAuthBearer

HTTP Bearer token authentication.



##### `bearerToken`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> Bearer token for HTTP Bearer Authentication





## Enums


### AiModelType



| Value | Label |
|---|---|
| `Chat` | Chat Completion |
| `Text` | Text Generation |


