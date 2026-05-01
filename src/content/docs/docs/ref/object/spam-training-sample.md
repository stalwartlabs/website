---
title: SpamTrainingSample
description: Stores an email sample used for spam classifier training.
custom_edit_url: null
---

# SpamTrainingSample

Stores an email sample used for spam classifier training.

This object can be configured from the [WebUI](/docs/management/webui/) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg> Account › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z" /></svg> Spam Samples

## Fields


##### `from`

> Type: <code>EmailAddress</code> · read-only · server-set
>
> Email address of the sender of the message associated with this training sample


##### `subject`

> Type: <code>String</code> · server-set
>
> Subject of the message associated with this training sample


##### `blobId`

> Type: <code>BlobId</code> · read-only
>
> Reference to the stored message content


##### `isSpam`

> Type: <code>Boolean</code> · read-only · default: `false`
>
> Indicates whether the sample is spam (true) or ham (false)


##### `accountId`

> Type: <code>Id&lt;</code>[<code>Account</code>](/docs/ref/object/account)<code>&gt;?</code> · read-only
>
> Identifier of the account associated with this training sample


##### `expiresAt`

> Type: <code>UTCDateTime</code> · server-set
>
> Timestamp when the training sample is scheduled to expire


##### `deleteAfterUse`

> Type: <code>Boolean</code> · read-only · default: `false`
>
> Indicates whether the training sample should be deleted after being used for training



## JMAP API

The SpamTrainingSample object is available via the `urn:stalwart:jmap` capability.


### `x:SpamTrainingSample/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysSpamTrainingSampleGet` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:SpamTrainingSample/get",
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



### `x:SpamTrainingSample/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports create, update, and destroy operations in a single call.



#### Create

This operation requires the `sysSpamTrainingSampleCreate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:SpamTrainingSample/set",
          {
            "create": {
              "new1": {}
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

This operation requires the `sysSpamTrainingSampleUpdate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:SpamTrainingSample/set",
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

This operation requires the `sysSpamTrainingSampleDestroy` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:SpamTrainingSample/set",
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




### `x:SpamTrainingSample/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysSpamTrainingSampleQuery` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:SpamTrainingSample/query",
          {
            "filter": {
              "accountId": "id1"
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




The `x:SpamTrainingSample/query` `filter` argument accepts the following conditions (combinable with `AnyOf` / `AllOf` / `Not` per RFC 8620):

| Condition | Kind |
|---|---|
| `accountId` | id of Account |

## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get SpamTrainingSample id1
```


### Create

```sh
stalwart-cli create SpamTrainingSample
```


### Query

```sh
stalwart-cli query SpamTrainingSample
stalwart-cli query SpamTrainingSample --where accountId=id1
```


### Update

```sh
stalwart-cli update SpamTrainingSample id1 --field description='updated value'
```


### Delete

```sh
stalwart-cli delete SpamTrainingSample --ids id1
```



