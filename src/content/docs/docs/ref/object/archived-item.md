---
title: ArchivedItem
description: Represents an archived item that can be restored.
custom_edit_url: null
---

# ArchivedItem

Represents an archived item that can be restored.

:::note[Enterprise feature]
This object is only available with an [Enterprise license](/docs/server/enterprise).
:::

This object can be configured from the [WebUI](/docs/management/webui/) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg> Account › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="5" x="2" y="3" rx="1" /><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" /><path d="M10 12h4" /></svg> Archived Items

## Fields

ArchivedItem is a **multi-variant** object: each instance has an `@type` discriminator selecting one of the variants below, and each variant carries its own set of fields.


### `@type: "Email"`

Archived Email message


##### `from`

> Type: <code>String</code> · required
>
> Sender of the archived email message


##### `subject`

> Type: <code>String</code> · required
>
> Subject of the archived email message


##### `receivedAt`

> Type: <code>UTCDateTime</code> · required
>
> Received date of the archived email message


##### `size`

> Type: <code>Size</code> · read-only · default: `0`
>
> Size of the archived email message


##### `accountId`

> Type: <code>Id&lt;</code>[<code>Account</code>](./account.md)<code>&gt;</code> · required
>
> The account to which the archived item belongs


##### `archivedAt`

> Type: <code>UTCDateTime</code> · required
>
> Timestamp when the item was archived


##### `archivedUntil`

> Type: <code>UTCDateTime</code> · required
>
> Timestamp until which the archived item will be deleted permanently if not restored


##### `blobId`

> Type: <code>BlobId</code> · required
>
> Identifier of the archived blob


##### `status`

> Type: [<code>ArchivedItemStatus</code>](#archiveditemstatus) · required
>
> Current status of the archived item



### `@type: "FileNode"`

Archived File


##### `name`

> Type: <code>String</code> · required
>
> Name of the archived file


##### `createdAt`

> Type: <code>UTCDateTime</code> · server-set
>
> Creation date of the archived file


##### `accountId`

> Type: <code>Id&lt;</code>[<code>Account</code>](./account.md)<code>&gt;</code> · required
>
> The account to which the archived item belongs


##### `archivedAt`

> Type: <code>UTCDateTime</code> · required
>
> Timestamp when the item was archived


##### `archivedUntil`

> Type: <code>UTCDateTime</code> · required
>
> Timestamp until which the archived item will be deleted permanently if not restored


##### `blobId`

> Type: <code>BlobId</code> · required
>
> Identifier of the archived blob


##### `status`

> Type: [<code>ArchivedItemStatus</code>](#archiveditemstatus) · required
>
> Current status of the archived item



### `@type: "CalendarEvent"`

Archived Calendar Event


##### `title`

> Type: <code>String</code> · required
>
> Title of the archived calendar event


##### `startTime`

> Type: <code>UTCDateTime?</code>
>
> Start time of the archived calendar event


##### `createdAt`

> Type: <code>UTCDateTime</code> · server-set
>
> Creation date of the archived calendar event


##### `accountId`

> Type: <code>Id&lt;</code>[<code>Account</code>](./account.md)<code>&gt;</code> · required
>
> The account to which the archived item belongs


##### `archivedAt`

> Type: <code>UTCDateTime</code> · required
>
> Timestamp when the item was archived


##### `archivedUntil`

> Type: <code>UTCDateTime</code> · required
>
> Timestamp until which the archived item will be deleted permanently if not restored


##### `blobId`

> Type: <code>BlobId</code> · required
>
> Identifier of the archived blob


##### `status`

> Type: [<code>ArchivedItemStatus</code>](#archiveditemstatus) · required
>
> Current status of the archived item



### `@type: "ContactCard"`

Archived Contact Card


##### `name`

> Type: <code>String?</code>
>
> Full name of the archived contact card


##### `createdAt`

> Type: <code>UTCDateTime</code> · server-set
>
> Creation date of the archived contact card


##### `accountId`

> Type: <code>Id&lt;</code>[<code>Account</code>](./account.md)<code>&gt;</code> · required
>
> The account to which the archived item belongs


##### `archivedAt`

> Type: <code>UTCDateTime</code> · required
>
> Timestamp when the item was archived


##### `archivedUntil`

> Type: <code>UTCDateTime</code> · required
>
> Timestamp until which the archived item will be deleted permanently if not restored


##### `blobId`

> Type: <code>BlobId</code> · required
>
> Identifier of the archived blob


##### `status`

> Type: [<code>ArchivedItemStatus</code>](#archiveditemstatus) · required
>
> Current status of the archived item



### `@type: "SieveScript"`

Archived Sieve Script


##### `name`

> Type: <code>String</code> · required
>
> Name of the archived sieve script


##### `createdAt`

> Type: <code>UTCDateTime</code> · server-set
>
> Creation date of the archived sieve script


##### `content`

> Type: <code>String</code> · required
>
> Content of the archived sieve script


##### `accountId`

> Type: <code>Id&lt;</code>[<code>Account</code>](./account.md)<code>&gt;</code> · required
>
> The account to which the archived item belongs


##### `archivedAt`

> Type: <code>UTCDateTime</code> · required
>
> Timestamp when the item was archived


##### `archivedUntil`

> Type: <code>UTCDateTime</code> · required
>
> Timestamp until which the archived item will be deleted permanently if not restored


##### `blobId`

> Type: <code>BlobId</code> · required
>
> Identifier of the archived blob


##### `status`

> Type: [<code>ArchivedItemStatus</code>](#archiveditemstatus) · required
>
> Current status of the archived item




## JMAP API

The ArchivedItem object is available via the `urn:stalwart:jmap` capability.


### `x:ArchivedItem/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysArchivedItemGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:ArchivedItem/get",
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



### `x:ArchivedItem/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports create, update, and destroy operations in a single call.



#### Create

This operation requires the `sysArchivedItemCreate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:ArchivedItem/set",
          {
            "create": {
              "new1": {
                "@type": "Email",
                "accountId": "<Account id>",
                "archivedAt": "2026-01-01T00:00:00Z",
                "archivedUntil": "2026-01-01T00:00:00Z",
                "blobId": "abc123",
                "from": "Example",
                "receivedAt": "2026-01-01T00:00:00Z",
                "subject": "Example"
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

This operation requires the `sysArchivedItemUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:ArchivedItem/set",
          {
            "update": {
              "id1": {
                "from": "updated value"
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

This operation requires the `sysArchivedItemDestroy` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:ArchivedItem/set",
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




### `x:ArchivedItem/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysArchivedItemQuery` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:ArchivedItem/query",
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




The `x:ArchivedItem/query` `filter` argument accepts the following conditions (combinable with `AnyOf` / `AllOf` / `Not` per RFC 8620):

| Condition | Kind |
|---|---|
| `accountId` | id of Account |

## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get ArchivedItem id1
```


### Create

```sh
stalwart-cli create ArchivedItem/Email \
  --field from=Example \
  --field subject=Example \
  --field receivedAt=2026-01-01T00:00:00Z \
  --field 'accountId=<Account id>' \
  --field archivedAt=2026-01-01T00:00:00Z \
  --field archivedUntil=2026-01-01T00:00:00Z \
  --field blobId=abc123
```


### Query

```sh
stalwart-cli query ArchivedItem
stalwart-cli query ArchivedItem --where accountId=id1
```


### Update

```sh
stalwart-cli update ArchivedItem id1 --field from='updated value'
```


### Delete

```sh
stalwart-cli delete ArchivedItem --ids id1
```



## Enums


### ArchivedItemStatus {#archiveditemstatus}



| Value | Label |
|---|---|
| `archived` | Item is archived and available for restoration |
| `requestRestore` | Request item restoration |


