---
title: MtaMilter
description: Defines a Milter filter endpoint for message processing.
custom_edit_url: null
---

# MtaMilter

Defines a Milter filter endpoint for message processing.

This object can be configured from the [WebUI](/docs/management/webui/) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Filters › Milters

## Fields


##### `allowInvalidCerts`

> Type: <code>Boolean</code> · default: `false`
>
> Whether Stalwart should connect to a Milter filter server that has an invalid TLS certificate


##### `enable`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"true"}`
>
> Expression that determines whether to enable this milter
>
> Available variables: [`MtaRcptToVariable`](../expression/variable/mta-rcpt-to-variable.md).


##### `hostname`

> Type: <code>String</code> · required
>
> Hostname or IP address of the server where the Milter filter is running


##### `maxResponseSize`

> Type: <code>Size</code> · default: `52428800`
>
> Maximum size, in bytes, of a response that Stalwart will accept from this Milter server


##### `tempFailOnError`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to respond with a temporary failure (typically a 4xx SMTP status code) when Stalwart encounters an error while communicating with this Milter server


##### `protocolVersion`

> Type: [<code>MilterVersion</code>](#milterversion) · default: `"v6"`
>
> Version of the Milter protocol that Stalwart should use when communicating with the Milter server


##### `port`

> Type: <code>UnsignedInt</code> · default: `11332` · max: 65535 · min: 1
>
> Network port on the Milter filter host server


##### `stages`

> Type: [<code>MtaStage</code>](#mtastage)<code>[]</code> · default: `["data"]` · min items: 1
>
> Which SMTP stages to run the milter on


##### `timeoutCommand`

> Type: <code>Duration</code> · default: `"30s"`
>
> How long Stalwart will wait to send a command to the Milter server


##### `timeoutConnect`

> Type: <code>Duration</code> · default: `"30s"`
>
> Maximum amount of time that Stalwart will wait to establish a connection with this Milter server


##### `timeoutData`

> Type: <code>Duration</code> · default: `"60s"`
>
> Maximum amount of time Stalwart will wait for a response from the Milter server


##### `useTls`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to use Transport Layer Security (TLS) for the connection between Stalwart and the Milter filter


##### `flagsAction`

> Type: <code>UnsignedInt?</code>
>
> Optional flags to set on the Milter connection. See the Milter protocol documentation for details on available flags.


##### `flagsProtocol`

> Type: <code>UnsignedInt?</code>
>
> Optional protocol flags to set on the Milter connection. See the Milter protocol documentation for details on available protocol flags.



## JMAP API

The MtaMilter object is available via the `urn:stalwart:jmap` capability.


### `x:MtaMilter/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysMtaMilterGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaMilter/get",
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



### `x:MtaMilter/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports create, update, and destroy operations in a single call.



#### Create

This operation requires the `sysMtaMilterCreate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaMilter/set",
          {
            "create": {
              "new1": {
                "hostname": "Example"
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

This operation requires the `sysMtaMilterUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaMilter/set",
          {
            "update": {
              "id1": {
                "hostname": "updated value"
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

This operation requires the `sysMtaMilterDestroy` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaMilter/set",
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




### `x:MtaMilter/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysMtaMilterQuery` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaMilter/query",
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
stalwart-cli get MtaMilter id1
```


### Create

```sh
stalwart-cli create MtaMilter \
  --field hostname=Example
```


### Query

```sh
stalwart-cli query MtaMilter
```


### Update

```sh
stalwart-cli update MtaMilter id1 --field hostname='updated value'
```


### Delete

```sh
stalwart-cli delete MtaMilter --ids id1
```



## Nested types


### Expression {#expression}

A conditional expression with match rules and a default value.



##### `match`

> Type: [<code>ExpressionMatch</code>](#expressionmatch)<code>[]</code>
>
> List of conditions and their corresponding results


##### `else`

> Type: <code>String</code> · required
>
> Else condition





#### ExpressionMatch {#expressionmatch}

A single condition-result pair in an expression.



##### `if`

> Type: <code>String</code> · required
>
> If condition


##### `then`

> Type: <code>String</code> · required
>
> Then clause





## Enums


### MilterVersion {#milterversion}



| Value | Label |
|---|---|
| `v2` | Version 2 |
| `v6` | Version 6 |


### MtaStage {#mtastage}



| Value | Label |
|---|---|
| `connect` | Connect |
| `ehlo` | EHLO |
| `auth` | AUTH |
| `mail` | MAIL FROM |
| `rcpt` | RCPT TO |
| `data` | DATA |


## Expression references

The following expression contexts are used by fields on this page:

- [`MtaRcptToVariable`](../expression/variable/mta-rcpt-to-variable.md) (Variables)

