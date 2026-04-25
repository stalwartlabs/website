---
title: Action
description: Defines server management actions such as reloads, troubleshooting and cache operations.
custom_edit_url: null
---

# Action

Defines server management actions such as reloads, troubleshooting and cache operations.

This object can be configured from the [WebUI](/docs/management/webui/overview) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" /></svg> Actions

## Fields

Action is a **multi-variant** object: each instance has an `@type` discriminator selecting one of the variants below, and each variant carries its own set of fields.


### `@type: "ReloadSettings"`

Reload: Server settings



### `@type: "ReloadTlsCertificates"`

Reload: TLS certificates



### `@type: "ReloadLookupStores"`

Reload: Lookup stores



### `@type: "ReloadBlockedIps"`

Reload: Blocked IPs list



### `@type: "UpdateApps"`

Application Management: Update applications



### `@type: "TroubleshootDmarc"`

DMARC: Troubleshooting


##### `remoteIp`

> Type: <code>IpAddr</code> · required
>
> Remote IP address of the SMTP client


##### `ehloDomain`

> Type: <code>String</code> · required
>
> EHLO domain provided by the SMTP client


##### `mailFrom`

> Type: <code>EmailAddress</code> · required
>
> MAIL FROM address provided by the SMTP client


##### `message`

> Type: <code>Text?</code>
>
> Body of the email message used for DMARC troubleshooting, if applicable


##### `spfEhloDomain`

> Type: <code>String</code> · required
>
> Domain used for SPF check based on EHLO domain


##### `spfEhloResult`

> Type: [<code>DmarcTroubleshootAuthResult</code>](#dmarctroubleshootauthresult) · server-set
>
> Result of the SPF check based on EHLO domain


##### `spfMailFromDomain`

> Type: <code>String</code> · required
>
> Domain used for SPF check based on MAIL FROM address


##### `spfMailFromResult`

> Type: [<code>DmarcTroubleshootAuthResult</code>](#dmarctroubleshootauthresult) · server-set
>
> Result of the SPF check based on MAIL FROM address


##### `ipRevResult`

> Type: [<code>DmarcTroubleshootAuthResult</code>](#dmarctroubleshootauthresult) · server-set
>
> Result of the reverse DNS check for the remote IP address


##### `ipRevPtr`

> Type: <code>String[]</code> · server-set
>
> PTR records returned by the reverse DNS lookup for the remote IP address


##### `dkimResults`

> Type: [<code>DmarcTroubleshootAuthResult</code>](#dmarctroubleshootauthresult)<code>[]</code> · server-set
>
> Results of the DKIM signature verification checks


##### `dkimPass`

> Type: <code>Boolean</code> · server-set · default: `false`
>
> Whether the DKIM checks passed


##### `arcResult`

> Type: [<code>DmarcTroubleshootAuthResult</code>](#dmarctroubleshootauthresult) · server-set
>
> Result of the ARC validation check


##### `dmarcResult`

> Type: [<code>DmarcTroubleshootAuthResult</code>](#dmarctroubleshootauthresult) · server-set
>
> Result of the DMARC check


##### `dmarcPass`

> Type: <code>Boolean</code> · server-set · default: `false`
>
> Whether the DMARC check passed


##### `dmarcPolicy`

> Type: [<code>DmarcDisposition</code>](#dmarcdisposition) · server-set
>
> DMARC policy applied to the email message


##### `elapsed`

> Type: <code>Duration</code> · server-set · default: `"0ms"`
>
> Time taken to perform the DMARC troubleshooting



### `@type: "ClassifySpam"`

Spam Filter: Classify a message


##### `message`

> Type: <code>Text</code> · required
>
> Raw email message to classify for spam


##### `remoteIp`

> Type: <code>IpAddr</code> · required
>
> Remote IP address of the SMTP client


##### `ehloDomain`

> Type: <code>String</code> · required
>
> EHLO domain provided by the SMTP client


##### `authenticatedAs`

> Type: <code>String?</code>
>
> Authentication identity of the SMTP client, if authenticated


##### `isTls`

> Type: <code>Boolean</code> · default: `true`
>
> Whether the SMTP connection is secured with TLS


##### `envFrom`

> Type: <code>EmailAddress</code> · required
>
> MAIL FROM address provided by the SMTP client


##### `envFromParameters`

> Type: [<code>SpamClassifyParameters</code>](#spamclassifyparameters)<code>?</code>
>
> Parameters related to the MAIL FROM address


##### `envRcptTo`

> Type: <code>EmailAddress[]</code>
>
> List of RCPT TO addresses provided by the SMTP client


##### `score`

> Type: <code>Float</code> · server-set · default: `0`
>
> Spam score for the classified message


##### `tags`

> Type: <code>Map&lt;String, </code>[<code>SpamClassifyTag</code>](#spamclassifytag)<code>&gt;</code> · server-set
>
> List of tags contributing to the spam classification of the message


##### `result`

> Type: [<code>SpamClassifyResult</code>](#spamclassifyresult) · server-set
>
> Overall spam classification result for the message



### `@type: "InvalidateCaches"`

Cache: Invalidate all caches



### `@type: "InvalidateNegativeCaches"`

Cache: Invalidate negative caches



### `@type: "PauseMtaQueue"`

MTA: Pause queue processing



### `@type: "ResumeMtaQueue"`

MTA: Resume queue processing




## JMAP API

The Action object is available via the `urn:stalwart:jmap` capability.


### `x:Action/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysActionGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Action/get",
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



### `x:Action/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports create, update, and destroy operations in a single call.



#### Create

This operation requires the `sysActionCreate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Action/set",
          {
            "create": {
              "new1": {
                "@type": "ReloadSettings"
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

This operation requires the `sysActionUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Action/set",
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

This operation requires the `sysActionDestroy` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Action/set",
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




### `x:Action/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysActionQuery` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Action/query",
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
stalwart-cli get Action id1
```


### Create

```sh
stalwart-cli create Action/ReloadSettings
```


### Query

```sh
stalwart-cli query Action
```


### Update

```sh
stalwart-cli update Action id1 --field description='updated value'
```


### Delete

```sh
stalwart-cli delete Action --ids id1
```



## Nested types


### DmarcTroubleshootAuthResult {#dmarctroubleshootauthresult}

Authentication check result for DMARC troubleshooting.


- **`Pass`**: Pass. No additional fields.
- **`Fail`**: Fail. Carries the fields of [`DmarcTroubleshootDetails`](#dmarctroubleshootdetails).
- **`SoftFail`**: SoftFail. Carries the fields of [`DmarcTroubleshootDetails`](#dmarctroubleshootdetails).
- **`TempError`**: TempError. Carries the fields of [`DmarcTroubleshootDetails`](#dmarctroubleshootdetails).
- **`PermError`**: PermError. Carries the fields of [`DmarcTroubleshootDetails`](#dmarctroubleshootdetails).
- **`Neutral`**: Neutral. Carries the fields of [`DmarcTroubleshootDetails`](#dmarctroubleshootdetails).
- **`None`**: None. No additional fields.




#### DmarcTroubleshootDetails {#dmarctroubleshootdetails}

Details for a failed authentication check.



##### `details`

> Type: <code>String?</code> · server-set
>
> Authentication result details





### SpamClassifyTag {#spamclassifytag}

A tag and score contributing to spam classification.



##### `score`

> Type: <code>Float</code> · server-set · default: `0`
>
> Score associated with the tag


##### `disposition`

> Type: [<code>SpamClassifyTagDisposition</code>](#spamclassifytagdisposition) · server-set
>
> Disposition associated with the tag





## Enums


### DmarcDisposition {#dmarcdisposition}



| Value | Label |
|---|---|
| `none` | No specific action requested |
| `quarantine` | Treat failing messages as suspicious |
| `reject` | Reject failing messages |
| `unspecified` | Disposition not specified |


### SpamClassifyParameters {#spamclassifyparameters}



| Value | Label |
|---|---|
| `bit7` | 7-bit message content |
| `bit8Mime - 8-bit MIME message content` | bit8Mime - 8-bit MIME message content |
| `binaryMime` | Binary MIME message content |
| `smtpUtf8` | UTF-8 message content |


### SpamClassifyTagDisposition {#spamclassifytagdisposition}



| Value | Label |
|---|---|
| `score` | Assign the tag's score to the overall spam score |
| `reject` | Reject the message |
| `discard` | Discard the message |


### SpamClassifyResult {#spamclassifyresult}



| Value | Label |
|---|---|
| `spam` | Classify as spam |
| `ham` | Classify as non-spam (ham) |
| `reject` | Reject message |
| `discard` | Discard message |


