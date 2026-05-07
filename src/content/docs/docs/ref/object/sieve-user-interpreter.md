---
title: SieveUserInterpreter
description: Configures the user-level Sieve script interpreter settings and limits.
custom_edit_url: null
---

# SieveUserInterpreter

Configures the user-level Sieve script interpreter settings and limits.

This object can be configured from the [WebUI](/docs/management/webui/) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /><path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="M10 12.5 8 15l2 2.5" /><path d="m14 12.5 2 2.5-2 2.5" /></svg> Sieve › User Interpreter

## Fields


##### `defaultExpiryDuplicate`

> Type: <code>Duration</code> · default: `"7d"`
>
> Default expiration time for IDs stored by the duplicate extension from user scripts


##### `defaultExpiryVacation`

> Type: <code>Duration</code> · default: `"30d"`
>
> Default expiration time for IDs stored by the vacation extension


##### `disableCapabilities`

> Type: [<code>SieveCapability</code>](#sievecapability)<code>[]</code>
>
> List of capabilities to disable in the user interpreter


##### `allowedNotifyUris`

> Type: <code>String[]</code> · default: `["mailto"]`
>
> List of allowed URIs for the notify extension


##### `protectedHeaders`

> Type: <code>String[]</code> · default: `["Original-Subject","Original-From","Received","Auto-Submitted"]`
>
> List of headers that cannot be deleted or added using the editheader extension


##### `defaultSubject`

> Type: <code>String</code> · default: `"Automated reply"`
>
> Default subject of vacation responses


##### `defaultSubjectPrefix`

> Type: <code>String</code> · default: `"Auto: "`
>
> Default subject prefix of vacation responses


##### `maxCpuCycles`

> Type: <code>UnsignedInt</code> · default: `5000` · min: 1
>
> Maximum number CPU cycles a script can use


##### `maxHeaderSize`

> Type: <code>UnsignedInt</code> · default: `1024` · min: 1
>
> Maximum size of a header


##### `maxIncludes`

> Type: <code>UnsignedInt</code> · default: `3` · min: 1
>
> Maximum number of includes


##### `maxLocalVars`

> Type: <code>UnsignedInt</code> · default: `128` · min: 1
>
> Maximum number of local variables


##### `maxMatchVars`

> Type: <code>UnsignedInt</code> · default: `30` · min: 1
>
> Maximum number of match variables


##### `maxScriptNameLength`

> Type: <code>UnsignedInt</code> · default: `512` · min: 1
>
> Maximum length of a script name


##### `maxNestedBlocks`

> Type: <code>UnsignedInt</code> · default: `15` · min: 1
>
> Maximum number of nested blocks


##### `maxNestedForEvery`

> Type: <code>UnsignedInt</code> · default: `3` · min: 1
>
> Maximum number of nested foreach blocks


##### `maxNestedIncludes`

> Type: <code>UnsignedInt</code> · default: `3` · min: 1
>
> Maximum number of nested includes


##### `maxNestedTests`

> Type: <code>UnsignedInt</code> · default: `15` · min: 1
>
> Maximum number of nested tests


##### `maxOutMessages`

> Type: <code>UnsignedInt</code> · default: `3`
>
> Maximum number of outgoing messages


##### `maxReceivedHeaders`

> Type: <code>UnsignedInt</code> · default: `10` · min: 1
>
> Maximum number of received headers


##### `maxRedirects`

> Type: <code>UnsignedInt</code> · default: `1`
>
> Maximum number of redirects


##### `maxScriptSize`

> Type: <code>Size</code> · default: `"100kb"` · min: 1
>
> Maximum size of a script


##### `maxStringLength`

> Type: <code>UnsignedInt</code> · default: `4096` · min: 1
>
> Maximum length of a string


##### `maxVarNameLength`

> Type: <code>UnsignedInt</code> · default: `32` · min: 1
>
> Maximum length of a variable name


##### `maxVarSize`

> Type: <code>UnsignedInt</code> · default: `4096` · min: 1
>
> Maximum size of a variable


##### `maxScripts`

> Type: <code>UnsignedInt?</code> · default: `100` · min: 1
>
> The default maximum number of sieve scripts a user can create



## JMAP API

The SieveUserInterpreter singleton is available via the `urn:stalwart:jmap` capability.


### `x:SieveUserInterpreter/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysSieveUserInterpreterGet` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:SieveUserInterpreter/get",
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



### `x:SieveUserInterpreter/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysSieveUserInterpreterUpdate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:SieveUserInterpreter/set",
          {
            "update": {
              "singleton": {
                "defaultSubject": "updated value"
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
stalwart-cli get SieveUserInterpreter
```


### Update

```sh
stalwart-cli update SieveUserInterpreter --field defaultSubject='updated value'
```



## Enums


### SieveCapability



| Value | Label |
|---|---|
| `envelope` | Envelope Test |
| `envelope-dsn` | Envelope DSN (Delivery Status Notification) |
| `envelope-deliverby` | Envelope Deliver-By |
| `fileinto` | File Into Mailbox |
| `encoded-character` | Encoded Character Support |
| `comparator-elbonia` | Elbonia Comparator |
| `comparator-i;octet` | Octet Comparator |
| `comparator-i;ascii-casemap` | ASCII Case Map Comparator |
| `comparator-i;ascii-numeric` | ASCII Numeric Comparator |
| `body` | Body Test |
| `convert` | Message Conversion |
| `copy` | Copying Without Side Effects |
| `relational` | Relational Tests |
| `date` | Date Tests |
| `index` | Header Index |
| `duplicate` | Duplicate Delivery Detection |
| `variables` | Variables |
| `editheader` | Edit Header |
| `foreverypart` | For Every MIME Part |
| `mime` | MIME Part Tests |
| `replace` | MIME Part Replacement |
| `enclose` | MIME Part Enclosure |
| `extracttext` | Extract Text from MIME Parts |
| `enotify` | Email Notifications |
| `redirect-dsn` | Redirect with DSN |
| `redirect-deliverby` | Redirect with Deliver-By |
| `environment` | Environment Information |
| `reject` | Reject Message |
| `ereject` | Extended Reject (SMTP-level) |
| `extlists` | Externally Stored Lists |
| `subaddress` | Subaddress (Detail) Matching |
| `vacation` | Vacation Auto-Reply |
| `vacation-seconds` | Vacation with Seconds Parameter |
| `fcc` | File Carbon Copy |
| `mailbox` | Mailbox Existence Check |
| `mailboxid` | Mailbox by OBJECTID |
| `mboxmetadata` | Mailbox Metadata Access |
| `servermetadata` | Server Metadata Access |
| `special-use` | Special-Use Mailboxes |
| `imap4flags` | IMAP Flags |
| `ihave` | Conditional Extension Test |
| `imapsieve` | IMAP Events in Sieve |
| `include` | Script Inclusion |
| `regex` | Regular Expression Matching |
| `spamtest` | Spam Test |
| `spamtestplus` | Extended Spam Test |
| `virustest` | Virus Test |
| `vnd.stalwart.while` | While Loop (Stalwart) |
| `vnd.stalwart.expressions` | Expression Evaluation (Stalwart) |


