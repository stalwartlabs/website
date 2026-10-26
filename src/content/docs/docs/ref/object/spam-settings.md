---
title: "SpamSettings"
description: "Configures global spam filter thresholds, greylisting, and trust settings."
custom_edit_url: null
---

Configures global spam filter thresholds, greylisting, and trust settings.

This object can be configured from the [WebUI](/docs/management/webui/) under <span data-target="SpamSettings"><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> Spam Filter › General</span>

## Fields


##### `trustContacts`

> Type: <code>Boolean</code> · default: `true`
>
> Never classify messages as spam if they are sent from addresses present in the user's address book.


##### `enable`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to enable the spam filter


##### `greylistFor`

> Type: <code>Duration?</code>
>
> How long a sender and recipient pair is remembered after its first delivery attempt was deferred. Retries for the same pair within this period are accepted; once it expires, the pair is greylisted again. Only applies to unauthenticated sessions. Disabled when unset.


##### `scoreDiscard`

> Type: <code>Float</code> · default: `0` · max: 100 · min: -100
>
> Discard messages with a score at or above this threshold. Set to 0 or below to disable; rejection takes precedence


##### `scoreReject`

> Type: <code>Float</code> · default: `0` · max: 100 · min: -100
>
> Reject messages with a score at or above this threshold. Set to 0 or below to disable


##### `scoreSpam`

> Type: <code>Float</code> · default: `5` · max: 100 · min: -100
>
> Mark as Spam messages with a score at or above this threshold


##### `trustReplies`

> Type: <code>Boolean</code> · default: `true`
>
> Never classify messages as spam if they are replies to messages sent by the recipient.


##### `spamFilterRulesUrl`

> Type: <code>Uri?</code> · default: `"https://github.com/stalwartlabs/spam-filter/releases/latest/download/spam-filter-rules.json.gz"`
>
> URL to download spam filter rules from


##### `maxBodyText`

> Type: <code>Size</code> · default: `262144` · min: 1024 · max: 16777216
>
> Maximum amount of text analysed from each body text part, the rest is ignored


##### `maxAttachmentText`

> Type: <code>Size</code> · default: `65536` · min: 1024 · max: 16777216
>
> Maximum amount of text analysed from each non-body text part, such as text attachments


##### `maxMessageText`

> Type: <code>Size</code> · default: `1048576` · min: 1024 · max: 67108864
>
> Maximum amount of text analysed per message across all parts


##### `maxRedirectUrls`

> Type: <code>UnsignedInt</code> · default: `10` · max: 1000
>
> Maximum number of URL redirector requests sent per message; cached results do not count towards this limit


##### `redirectTimeout`

> Type: <code>Duration</code> · default: `5000`
>
> Time after which a URL redirector request is considered failed


##### `redirectCacheTtl`

> Type: <code>Duration</code> · default: `86400000`
>
> Time to cache the destination of a resolved URL redirect



## JMAP API

The SpamSettings singleton is available via the `urn:stalwart:jmap` capability.


### `x:SpamSettings/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysSpamSettingsGet` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:SpamSettings/get",
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



### `x:SpamSettings/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysSpamSettingsUpdate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:SpamSettings/set",
          {
            "update": {
              "singleton": {
                "trustContacts": true
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
stalwart-cli get SpamSettings
```


### Update

```sh
stalwart-cli update SpamSettings --field trustContacts=true
```



