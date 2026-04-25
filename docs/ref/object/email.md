---
title: Email
description: Configures email message limits, encryption, compression, and default folder settings.
custom_edit_url: null
---

# Email

Configures email message limits, encryption, compression, and default folder settings.

This object can be configured from the [WebUI](/docs/management/webui/overview) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" /></svg> Email › Defaults<svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" /></svg> Email › Encryption<svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" /></svg> Email › Limits<svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" /></svg> Email › Storage

## Fields


##### `maxAttachmentSize`

> Type: <code>Size</code> · default: `50000000` · min: 1
>
> Specifies the maximum size for an email attachment


##### `maxMessageSize`

> Type: <code>Size</code> · default: `75000000` · min: 1
>
> Determines the maximum size for an email message


##### `maxMailboxDepth`

> Type: <code>UnsignedInt</code> · default: `10` · min: 1
>
> Restricts the maximum depth of nested mailboxes a user can create


##### `maxMailboxNameLength`

> Type: <code>UnsignedInt</code> · default: `255` · min: 1
>
> Establishes the maximum length of a mailbox name


##### `encryptOnAppend`

> Type: <code>Boolean</code> · default: `false`
>
> Encrypt messages that are manually appended by the user using JMAP or IMAP


##### `encryptAtRest`

> Type: <code>Boolean</code> · default: `true`
>
> Allow users to configure encryption at rest for their data


##### `compressionAlgorithm`

> Type: [<code>CompressionAlgo</code>](#compressionalgo) · default: `"lz4"`
>
> Algorithm to use to compress e-mail data


##### `defaultFolders`

> Type: <code>Map&lt;</code>[<code>SpecialUse</code>](#specialuse)<code>, </code>[<code>EmailFolder</code>](#emailfolder)<code>&gt;</code>
>
> Default special-use folders to create for new users


##### `maxMessages`

> Type: <code>UnsignedInt?</code> · min: 1
>
> The default maximum number of emails a user can create


##### `maxSubmissions`

> Type: <code>UnsignedInt?</code> · default: `500` · min: 1
>
> The default maximum number of email submissions a user can create


##### `maxIdentities`

> Type: <code>UnsignedInt?</code> · default: `20` · min: 1
>
> The default maximum number of identities a user can create


##### `maxMailboxes`

> Type: <code>UnsignedInt?</code> · default: `250` · min: 1
>
> The default maximum number of mailboxes a user can create


##### `maxMaskedAddresses`

> Type: <code>UnsignedInt?</code> · [enterprise](/docs/server/enterprise) · default: `5` · min: 1
>
> The default maximum number of masked email addresses a user can create


##### `maxPublicKeys`

> Type: <code>UnsignedInt?</code> · default: `5` · min: 1
>
> The default maximum number of encryption-at-rest public keys a user can create



## JMAP API

The Email singleton is available via the `urn:stalwart:jmap` capability.


### `x:Email/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysEmailGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Email/get",
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



### `x:Email/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysEmailUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Email/set",
          {
            "update": {
              "singleton": {
                "maxAttachmentSize": 50000000
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

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/overview) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get Email
```


### Update

```sh
stalwart-cli update Email --field maxAttachmentSize=50000000
```



## Nested types


### EmailFolder {#emailfolder}

Defines a default email folder configuration.



##### `name`

> Type: <code>String</code> · required
>
> Default name for the folder


##### `create`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to create the folder automatically


##### `subscribe`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to subscribe to the folder automatically


##### `aliases`

> Type: <code>String[]</code>
>
> List of folder aliases





## Enums


### CompressionAlgo {#compressionalgo}



| Value | Label |
|---|---|
| `lz4` | LZ4 |
| `none` | None |


### SpecialUse {#specialuse}



| Value | Label |
|---|---|
| `inbox` | Inbox |
| `trash` | Trash |
| `junk` | Junk |
| `drafts` | Drafts |
| `archive` | Archive |
| `sent` | Sent |
| `shared` | Shared Folders |
| `important` | Important |
| `memos` | Memos |
| `scheduled` | Scheduled |
| `snoozed` | Snoozed |


