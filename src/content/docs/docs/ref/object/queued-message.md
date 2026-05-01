---
title: QueuedMessage
description: Represents a queued email message pending delivery.
custom_edit_url: null
---

# QueuedMessage

Represents a queued email message pending delivery.

This object can be configured from the [WebUI](/docs/management/webui/) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" /><path d="m21.854 2.147-10.94 10.939" /></svg> Emails › Queued

## Fields


##### `createdAt`

> Type: <code>UTCDateTime</code> · server-set
>
> When the message was received and queued


##### `nextRetry`

> Type: <code>UTCDateTime?</code>
>
> When the next delivery attempt is scheduled


##### `nextNotify`

> Type: <code>UTCDateTime?</code> · server-set
>
> When the next DSN notification is scheduled


##### `blobId`

> Type: <code>BlobId</code> · server-set
>
> Reference to the stored message content


##### `returnPath`

> Type: <code>String</code> · server-set
>
> Envelope sender address (MAIL FROM)


##### `recipients`

> Type: <code>Map&lt;EmailAddress, </code>[<code>QueuedRecipient</code>](#queuedrecipient)<code>&gt;</code>
>
> List of envelope recipients and their delivery status


##### `receivedFromIp`

> Type: <code>IpAddr</code> · server-set
>
> IP address of the client that submitted the message


##### `receivedViaPort`

> Type: <code>UnsignedInt</code> · server-set · default: `25` · min: 1 · max: 65535
>
> Local port on which the message was received


##### `flags`

> Type: [<code>MessageFlag</code>](#messageflag)<code>[]</code> · server-set
>
> Classification flags for the message


##### `envId`

> Type: <code>String?</code>
>
> SMTP ENVID parameter for delivery status notifications


##### `priority`

> Type: <code>Integer</code> · default: `0` · min: -100 · max: 100
>
> Message priority (lower values = higher priority)


##### `size`

> Type: <code>UnsignedInt</code> · server-set · default: `0`
>
> Size of the message in bytes



## JMAP API

The QueuedMessage object is available via the `urn:stalwart:jmap` capability.


### `x:QueuedMessage/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysQueuedMessageGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:QueuedMessage/get",
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



### `x:QueuedMessage/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports create, update, and destroy operations in a single call.



#### Create

This operation requires the `sysQueuedMessageCreate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:QueuedMessage/set",
          {
            "create": {
              "new1": {
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

This operation requires the `sysQueuedMessageUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:QueuedMessage/set",
          {
            "update": {
              "id1": {
                "envId": "updated value"
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

This operation requires the `sysQueuedMessageDestroy` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:QueuedMessage/set",
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




### `x:QueuedMessage/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysQueuedMessageQuery` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:QueuedMessage/query",
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




The `x:QueuedMessage/query` `filter` argument accepts the following conditions (combinable with `AnyOf` / `AllOf` / `Not` per RFC 8620):

| Condition | Kind |
|---|---|
| `text` | text |
| `to` | text |
| `due` | date |
| `queueName` | text |
| `returnPath` | text |

## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get QueuedMessage id1
```


### Create

```sh
stalwart-cli create QueuedMessage \
  --field 'recipients={}'
```


### Query

```sh
stalwart-cli query QueuedMessage
stalwart-cli query QueuedMessage --where text=example
```


### Update

```sh
stalwart-cli update QueuedMessage id1 --field envId='updated value'
```


### Delete

```sh
stalwart-cli delete QueuedMessage --ids id1
```



## Nested types


### QueuedRecipient {#queuedrecipient}

Delivery status and scheduling for a message recipient.



##### `retryCount`

> Type: <code>UnsignedInt</code> · default: `0`
>
> Number of delivery attempts made


##### `retryDue`

> Type: <code>UTCDateTime</code> · required
>
> When the next delivery attempt is scheduled


##### `notifyCount`

> Type: <code>UnsignedInt</code> · default: `0`
>
> Number of DSN notifications sent


##### `notifyDue`

> Type: <code>UTCDateTime</code> · required
>
> When the next DSN notification is scheduled


##### `expires`

> Type: [<code>QueueExpiry</code>](#queueexpiry) · required
>
> Message expiry information for this recipient


##### `queueName`

> Type: <code>String</code> · server-set · max length: 8
>
> Queue name for this recipient


##### `status`

> Type: [<code>RecipientStatus</code>](#recipientstatus) · required
>
> Current delivery status


##### `flags`

> Type: [<code>RecipientFlag</code>](#recipientflag)<code>[]</code> · server-set
>
> Status flags for this recipient


##### `orcpt`

> Type: <code>String?</code>
>
> Original recipient address (SMTP ORCPT parameter)





#### QueueExpiry {#queueexpiry}

Message expiry strategy for a queued recipient.


- **`Ttl`**: TTL-based expiry. Carries the fields of [`QueueExpiryTtl`](#queueexpiryttl).
- **`Attempts`**: Attempt-based expiry. Carries the fields of [`QueueExpiryAttempts`](#queueexpiryattempts).




##### QueueExpiryTtl {#queueexpiryttl}

TTL-based message expiry settings.



##### `expiresAt`

> Type: <code>UTCDateTime</code> · required
>
> Absolute time when the message expires





##### QueueExpiryAttempts {#queueexpiryattempts}

Attempt-based message expiry settings.



##### `expiresAttempts`

> Type: <code>UnsignedInt</code> · default: `0`
>
> Maximum number of delivery attempts before the message expires





#### RecipientStatus {#recipientstatus}

Delivery status for a queued message recipient.


- **`Scheduled`**: Delivery is pending. No additional fields.
- **`Completed`**: Message was successfully delivered. Carries the fields of [`ServerResponse`](#serverresponse).
- **`TemporaryFailure`**: Delivery failed temporarily, will retry. Carries the fields of [`DeliveryError`](#deliveryerror).
- **`PermanentFailure`**: Delivery failed permanently, will not retry. Carries the fields of [`DeliveryError`](#deliveryerror).




##### ServerResponse {#serverresponse}

SMTP server response details.



##### `responseHostname`

> Type: <code>String?</code>
>
> Hostname of the remote server that responded


##### `responseCode`

> Type: <code>UnsignedInt?</code> · min: 100 · max: 599
>
> SMTP response code from the remote server


##### `responseEnhanced`

> Type: <code>String?</code>
>
> SMTP enhanced status code (e.g., "4.7.1")


##### `responseMessage`

> Type: <code>String?</code>
>
> SMTP response message from the remote server





##### DeliveryError {#deliveryerror}

Details of a delivery error including the triggering command.



##### `errorType`

> Type: [<code>DeliveryErrorType</code>](#deliveryerrortype) · required
>
> Type of delivery error encountered


##### `errorMessage`

> Type: <code>String?</code>
>
> Detailed error message


##### `errorCommand`

> Type: <code>String?</code>
>
> SMTP command that triggered an unexpected response


##### `responseHostname`

> Type: <code>String?</code>
>
> Hostname of the remote server that responded


##### `responseCode`

> Type: <code>UnsignedInt?</code> · min: 100 · max: 599
>
> SMTP response code from the remote server


##### `responseEnhanced`

> Type: <code>String?</code>
>
> SMTP enhanced status code (e.g., "4.7.1")


##### `responseMessage`

> Type: <code>String?</code>
>
> SMTP response message from the remote server





## Enums


### DeliveryErrorType {#deliveryerrortype}



| Value | Label |
|---|---|
| `dnsError` | DNS resolution failed |
| `unexpectedResponse` | Remote server returned an unexpected SMTP response |
| `connectionError` | Failed to establish connection to remote server |
| `tlsError` | TLS handshake or encryption failed |
| `daneError` | DANE validation failed |
| `mtaStsError` | MTA-STS policy validation failed |
| `rateLimited` | Delivery delayed due to rate limiting |
| `concurrencyLimited` | Delivery delayed due to connection limits |
| `io` | Network I/O error occurred |


### RecipientFlag {#recipientflag}



| Value | Label |
|---|---|
| `dsnSent` | A delivery status notification has been sent for this recipient |
| `spamPayload` | Message content was classified as spam |


### MessageFlag {#messageflag}



| Value | Label |
|---|---|
| `authenticated` | Message was received from an authenticated session |
| `unauthenticated` | Message was received without authentication |
| `unauthenticatedDmarc` | Message was received without authentication but passed DMARC |
| `dsn` | Message is a Delivery Status Notification |
| `report` | Message is an automated report (DMARC, TLS-RPT, etc.) |
| `autogenerated` | Message was automatically generated by the server |


