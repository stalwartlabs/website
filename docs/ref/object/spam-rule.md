---
title: SpamRule
description: Defines a spam filter rule for message classification.
custom_edit_url: null
---

# SpamRule

Defines a spam filter rule for message classification.

This object can be configured from the [WebUI](/docs/management/webui/overview) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> Spam Filter › Rules

## Fields

SpamRule is a **multi-variant** object: each instance has an `@type` discriminator selecting one of the variants below, and each variant carries its own set of fields.


### `@type: "Any"`

Any


##### `condition`

> Type: [<code>Expression</code>](#expression) · required
>
> Expression that returns the tag to assign to the message.
>
> Available variables: [`SpamGenericVariable`](../expression/variable/spam-generic-variable.md).


##### `name`

> Type: <code>String</code> · read-only
>
> Short name for the rule


##### `description`

> Type: <code>String?</code>
>
> Description for the rule


##### `enable`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to enable this rule


##### `priority`

> Type: <code>Integer</code> · default: `500` · max: 99999 · min: -99999
>
> The priority of the rule



### `@type: "Url"`

URL


##### `condition`

> Type: [<code>Expression</code>](#expression) · required
>
> Expression that returns the tag to assign to the message.
>
> Available variables: [`SpamUrlVariable`](../expression/variable/spam-url-variable.md).


##### `name`

> Type: <code>String</code> · read-only
>
> Short name for the rule


##### `description`

> Type: <code>String?</code>
>
> Description for the rule


##### `enable`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to enable this rule


##### `priority`

> Type: <code>Integer</code> · default: `500` · max: 99999 · min: -99999
>
> The priority of the rule



### `@type: "Domain"`

Domain


##### `condition`

> Type: [<code>Expression</code>](#expression) · required
>
> Expression that returns the tag to assign to the message.
>
> Available variables: [`SpamGenericVariable`](../expression/variable/spam-generic-variable.md).


##### `name`

> Type: <code>String</code> · read-only
>
> Short name for the rule


##### `description`

> Type: <code>String?</code>
>
> Description for the rule


##### `enable`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to enable this rule


##### `priority`

> Type: <code>Integer</code> · default: `500` · max: 99999 · min: -99999
>
> The priority of the rule



### `@type: "Email"`

E-mail


##### `condition`

> Type: [<code>Expression</code>](#expression) · required
>
> Expression that returns the tag to assign to the message.
>
> Available variables: [`SpamEmailVariable`](../expression/variable/spam-email-variable.md).


##### `name`

> Type: <code>String</code> · read-only
>
> Short name for the rule


##### `description`

> Type: <code>String?</code>
>
> Description for the rule


##### `enable`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to enable this rule


##### `priority`

> Type: <code>Integer</code> · default: `500` · max: 99999 · min: -99999
>
> The priority of the rule



### `@type: "Ip"`

IP


##### `condition`

> Type: [<code>Expression</code>](#expression) · required
>
> Expression that returns the tag to assign to the message.
>
> Available variables: [`SpamIpVariable`](../expression/variable/spam-ip-variable.md).


##### `name`

> Type: <code>String</code> · read-only
>
> Short name for the rule


##### `description`

> Type: <code>String?</code>
>
> Description for the rule


##### `enable`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to enable this rule


##### `priority`

> Type: <code>Integer</code> · default: `500` · max: 99999 · min: -99999
>
> The priority of the rule



### `@type: "Header"`

Header


##### `condition`

> Type: [<code>Expression</code>](#expression) · required
>
> Expression that returns the tag to assign to the message.
>
> Available variables: [`SpamHeaderVariable`](../expression/variable/spam-header-variable.md).


##### `name`

> Type: <code>String</code> · read-only
>
> Short name for the rule


##### `description`

> Type: <code>String?</code>
>
> Description for the rule


##### `enable`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to enable this rule


##### `priority`

> Type: <code>Integer</code> · default: `500` · max: 99999 · min: -99999
>
> The priority of the rule



### `@type: "Body"`

Body


##### `condition`

> Type: [<code>Expression</code>](#expression) · required
>
> Expression that returns the tag to assign to the message.
>
> Available variables: [`SpamGenericVariable`](../expression/variable/spam-generic-variable.md).


##### `name`

> Type: <code>String</code> · read-only
>
> Short name for the rule


##### `description`

> Type: <code>String?</code>
>
> Description for the rule


##### `enable`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to enable this rule


##### `priority`

> Type: <code>Integer</code> · default: `500` · max: 99999 · min: -99999
>
> The priority of the rule




## JMAP API

The SpamRule object is available via the `urn:stalwart:jmap` capability.


### `x:SpamRule/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysSpamRuleGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:SpamRule/get",
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



### `x:SpamRule/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports create, update, and destroy operations in a single call.



#### Create

This operation requires the `sysSpamRuleCreate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:SpamRule/set",
          {
            "create": {
              "new1": {
                "@type": "Any",
                "condition": {
                  "else": "Example",
                  "match": {}
                }
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

This operation requires the `sysSpamRuleUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:SpamRule/set",
          {
            "update": {
              "id1": {
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


#### Destroy

This operation requires the `sysSpamRuleDestroy` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:SpamRule/set",
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




### `x:SpamRule/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysSpamRuleQuery` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:SpamRule/query",
          {
            "filter": {
              "name": "example"
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




The `x:SpamRule/query` `filter` argument accepts the following conditions (combinable with `AnyOf` / `AllOf` / `Not` per RFC 8620):

| Condition | Kind |
|---|---|
| `name` | text |

## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/overview) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get SpamRule id1
```


### Create

```sh
stalwart-cli create SpamRule/Any \
  --field 'condition={"else":"Example","match":{}}'
```


### Query

```sh
stalwart-cli query SpamRule
stalwart-cli query SpamRule --where name=example
```


### Update

```sh
stalwart-cli update SpamRule id1 --field description='updated value'
```


### Delete

```sh
stalwart-cli delete SpamRule --ids id1
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





## Expression references

The following expression contexts are used by fields on this page:

- [`SpamGenericVariable`](../expression/variable/spam-generic-variable.md) (Variables)
- [`SpamUrlVariable`](../expression/variable/spam-url-variable.md) (Variables)
- [`SpamEmailVariable`](../expression/variable/spam-email-variable.md) (Variables)
- [`SpamIpVariable`](../expression/variable/spam-ip-variable.md) (Variables)
- [`SpamHeaderVariable`](../expression/variable/spam-header-variable.md) (Variables)

