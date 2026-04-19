---
title: HttpLookup
description: Defines an HTTP-based lookup list.
custom_edit_url: null
---

# HttpLookup

Defines an HTTP-based lookup list.

This object can be configured from the [WebUI](/docs/management/webui/overview) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="m21 21-4.34-4.34" /><circle cx="11" cy="11" r="8" /></svg> Lookups › HTTP Lists

## Fields


##### `namespace`

> Type: <code>String</code> · read-only
>
> Unique identifier for this store when used in lookups


##### `enable`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to enable this HTTP list


##### `format`

> Type: [<code>HttpLookupFormat</code>](#httplookupformat) · required
>
> Format of the list


##### `isGzipped`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to use gzip compression when downloading the list


##### `maxEntries`

> Type: <code>UnsignedInt</code> · default: `100000` · max: 1048576 · min: 1
>
> Maximum number of entries allowed in the list. The list is truncated if it exceeds this limit.


##### `maxEntrySize`

> Type: <code>Size</code> · default: `512` · max: 1048576 · min: 1
>
> Maximum length of an entry in the list.


##### `maxSize`

> Type: <code>Size</code> · default: `"100mb"` · max: 1073741824 · min: 10
>
> Maximum size of the list. The list is truncated if it exceeds this size.


##### `refresh`

> Type: <code>Duration</code> · default: `"12h"`
>
> How often to refresh the list


##### `retry`

> Type: <code>Duration</code> · default: `"1h"`
>
> How long to wait before retrying to download the list in case of failure.


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> How long to wait for the list to download before timing out


##### `url`

> Type: <code>Uri</code> · required
>
> URL of the list



## JMAP API

The HttpLookup object is available via the `urn:stalwart:jmap` capability.


### `x:HttpLookup/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysHttpLookupGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:HttpLookup/get",
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



### `x:HttpLookup/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports create, update, and destroy operations in a single call.



#### Create

This operation requires the `sysHttpLookupCreate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:HttpLookup/set",
          {
            "create": {
              "new1": {
                "enable": true,
                "format": {
                  "@type": "Csv",
                  "indexKey": 0,
                  "indexValue": 1000,
                  "separator": ",",
                  "skipFirst": false
                },
                "isGzipped": false,
                "maxEntries": 100000,
                "maxEntrySize": 512,
                "maxSize": "100mb",
                "refresh": "12h",
                "retry": "1h",
                "timeout": "30s",
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

This operation requires the `sysHttpLookupUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:HttpLookup/set",
          {
            "update": {
              "id1": {
                "enable": true
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

This operation requires the `sysHttpLookupDestroy` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:HttpLookup/set",
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




### `x:HttpLookup/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysHttpLookupQuery` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:HttpLookup/query",
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

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/overview) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get http-lookup id1
```


### Create

```sh
stalwart-cli create http-lookup \
  --field enable=true \
  --field 'format={"@type":"Csv","indexKey":0,"indexValue":1000,"separator":",","skipFirst":false}' \
  --field isGzipped=false \
  --field maxEntries=100000 \
  --field maxEntrySize=512 \
  --field maxSize=100mb \
  --field refresh=12h \
  --field retry=1h \
  --field timeout=30s \
  --field url=https://example.com
```


### Query

```sh
stalwart-cli query http-lookup
```


### Update

```sh
stalwart-cli update http-lookup id1 --field description='Updated'
```


### Delete

```sh
stalwart-cli delete http-lookup --ids id1
```



## Nested types


### HttpLookupFormat {#httplookupformat}

Format of HTTP lookup lists.


- **`Csv`**: CSV. Carries the fields of [`HttpLookupCsv`](#httplookupcsv).
- **`List`**: List. No additional fields.




#### HttpLookupCsv {#httplookupcsv}

CSV parsing settings for HTTP lookup lists.



##### `indexKey`

> Type: <code>UnsignedInt</code> · default: `0`
>
> The position of the key field in the HTTP List.


##### `indexValue`

> Type: <code>UnsignedInt?</code>
>
> The position of the value field in the HTTP List.


##### `separator`

> Type: <code>String</code> · default: `","`
>
> The separator character used to parse the HTTP list.


##### `skipFirst`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to skip the first line of the list





