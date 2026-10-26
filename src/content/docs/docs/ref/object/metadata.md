---
title: "Metadata"
description: "Configures object metadata: JMAP metadata, WebDAV dead properties and IMAP annotations."
custom_edit_url: null
---

Configures object metadata: JMAP metadata, WebDAV dead properties and IMAP annotations.

This object can be configured from the [WebUI](/docs/management/webui/) under <span data-target="Metadata"><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › Metadata</span>

## Fields


##### `dataTypes`

> Type: <code>Set&lt;</code>[<code>MetadataDataType</code>](#metadatadatatype)<code>&gt;</code> · default: `{"AddressBook":true,"Calendar":true,"CalendarEvent":true,"ContactCard":true,"Email":true,"FileNode":true,"Mailbox":true,"SieveScript":true}`
>
> JMAP data types that support the metadata and privateMetadata properties


##### `vendorNamespaces`

> Type: <code>Boolean</code> · default: `true`
>
> Whether JMAP clients may store metadata under vendor (domain name) namespaces


##### `privateMetadata`

> Type: <code>Boolean</code> · default: `true`
>
> Whether users may store private metadata that only they can see


##### `maxDepth`

> Type: <code>UnsignedInt?</code> · default: `8` · min: 1
>
> Maximum nesting depth of a JMAP metadata namespace value. Leave empty for no limit


##### `maxEntrySize`

> Type: <code>Size</code> · default: `8192` · min: 1024
>
> Maximum size of a single entry: a JMAP namespace value, a WebDAV dead property or an IMAP annotation


##### `maxSize`

> Type: <code>Size</code> · default: `65536` · min: 1024
>
> Maximum size of the shared metadata of an object


##### `maxPrivateSize`

> Type: <code>Size</code> · default: `16384` · min: 1024
>
> Maximum size of the private metadata a user stores on an object


##### `maxEntries`

> Type: <code>UnsignedInt</code> · default: `128` · min: 10
>
> Maximum number of entries in the metadata of an object


##### `maxQueryScan`

> Type: <code>UnsignedInt</code> · default: `50000` · min: 1
>
> Maximum number of annotated objects a JMAP query scans to evaluate a metadata text condition. Queries above this limit reject text conditions


##### `imapServerComment`

> Type: <code>Text?</code>
>
> Comment returned to IMAP clients as the /shared/comment server annotation


##### `imapServerAdmin`

> Type: <code>Uri?</code>
>
> URI for contacting the server administrator (for example mailto:postmaster@example.org), returned to IMAP clients as the /shared/admin server annotation



## JMAP API

The Metadata singleton is available via the `urn:stalwart:jmap` capability.


### `x:Metadata/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysMetadataGet` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Metadata/get",
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



### `x:Metadata/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysMetadataUpdate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Metadata/set",
          {
            "update": {
              "singleton": {
                "imapServerComment": "updated value"
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
stalwart-cli get Metadata
```


### Update

```sh
stalwart-cli update Metadata --field imapServerComment='updated value'
```



## Enums


### MetadataDataType



| Value | Label |
|---|---|
| `Email` | Email |
| `Mailbox` | Mailbox |
| `SieveScript` | Sieve Script |
| `Calendar` | Calendar |
| `CalendarEvent` | Calendar Event |
| `AddressBook` | Address Book |
| `ContactCard` | Contact Card |
| `FileNode` | File Node |


