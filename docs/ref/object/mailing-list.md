---
title: MailingList
description: Defines a mailing list that distributes messages to a group of recipients.
custom_edit_url: null
---

# MailingList

Defines a mailing list that distributes messages to a group of recipients.

This object can be configured from the [WebUI](/docs/management/webui/overview) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg> Directory › Mailing Lists

## Fields


##### `name`

> Type: <code>EmailLocalPart</code> · required
>
> Name of the mailing list, typically an email address local part.


##### `domainId`

> Type: <code>Id&lt;</code>[<code>Domain</code>](./domain.md)<code>&gt;</code> · required
>
> Identifier for the domain this mailing list belongs to. This is used to determine the email address of the mailing list, which is formed as name@domain.


##### `emailAddress`

> Type: <code>EmailAddress</code> · server-set
>
> The email address of the mailing list, formed as name@domain.


##### `description`

> Type: <code>String?</code>
>
> Description of the mailing list


##### `aliases`

> Type: [<code>EmailAlias</code>](#emailalias)<code>[]</code>
>
> List of email aliases for the mailing list


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](./tenant.md)<code>&gt;?</code>
>
> Identifier for the tenant this mailing list belongs to


##### `recipients`

> Type: <code>EmailAddress[]</code>
>
> List of email addresses that are members of the mailing list



## JMAP API

The MailingList object is available via the `urn:stalwart:jmap` capability.


### `x:MailingList/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysMailingListGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MailingList/get",
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



### `x:MailingList/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports create, update, and destroy operations in a single call.



#### Create

This operation requires the `sysMailingListCreate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MailingList/set",
          {
            "create": {
              "new1": {
                "aliases": {},
                "domainId": "<Domain id>",
                "name": "alice",
                "recipients": {}
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

This operation requires the `sysMailingListUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MailingList/set",
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

This operation requires the `sysMailingListDestroy` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MailingList/set",
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




### `x:MailingList/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysMailingListQuery` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MailingList/query",
          {
            "filter": {
              "text": "example"
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




The `x:MailingList/query` `filter` argument accepts the following conditions (combinable with `AnyOf` / `AllOf` / `Not` per RFC 8620):

| Condition | Kind |
|---|---|
| `text` | text |
| `memberTenantId` | id of Tenant |

## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/overview) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get MailingList id1
```


### Create

```sh
stalwart-cli create MailingList \
  --field name=alice \
  --field 'domainId=<Domain id>' \
  --field 'aliases={}' \
  --field 'recipients={}'
```


### Query

```sh
stalwart-cli query MailingList
stalwart-cli query MailingList --where text=example
```


### Update

```sh
stalwart-cli update MailingList id1 --field description='updated value'
```


### Delete

```sh
stalwart-cli delete MailingList --ids id1
```



## Nested types


### EmailAlias {#emailalias}

Defines an email alias for an account or mailing list.



##### `enabled`

> Type: <code>Boolean</code> · default: `true`
>
> Whether this email alias is enabled


##### `name`

> Type: <code>EmailLocalPart</code> · required
>
> The local part of the email alias (the part before the @ symbol)


##### `domainId`

> Type: <code>Id&lt;</code>[<code>Domain</code>](./domain.md)<code>&gt;</code> · required
>
> Identifier for the domain of the email alias (the part after the @ symbol).


##### `description`

> Type: <code>String?</code>
>
> Description of the email alias





