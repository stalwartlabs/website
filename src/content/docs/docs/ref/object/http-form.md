---
title: HttpForm
description: Configures the contact form submission endpoint.
custom_edit_url: null
---

# HttpForm

Configures the contact form submission endpoint.

This object can be configured from the [WebUI](/docs/management/webui/) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › HTTP › Contact Form

## Fields


##### `deliverTo`

> Type: <code>EmailAddress[]</code>
>
> List of local e-mail addresses to deliver the contact form to.


##### `defaultFromAddress`

> Type: <code>String</code> · default: `"postmaster@localhost"`
>
> The default e-mail address to use when the sender does not provide one.


##### `fieldEmail`

> Type: <code>String?</code>
>
> The name of the field in the contact form that contains the e-mail address of the sender.


##### `enable`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to enable contact form submissions.


##### `fieldHoneyPot`

> Type: <code>String?</code>
>
> The name of the field in the contact form that is used as a honey pot to catch spam bots.


##### `maxSize`

> Type: <code>Size</code> · default: `"100kb"`
>
> Maximum size of the contact form submission in bytes.


##### `defaultName`

> Type: <code>String</code> · default: `"Anonymous"`
>
> The default name to use when the sender does not provide one.


##### `fieldName`

> Type: <code>String?</code>
>
> The name of the field in the contact form that contains the name of the sender.


##### `rateLimit`

> Type: [<code>Rate</code>](#rate)<code>?</code> · default: `{"count":5,"period":"1h"}`
>
> Maximum number of contact form submissions that can be made in a timeframe by a given IP address.


##### `defaultSubject`

> Type: <code>String</code> · default: `"Contact form submission"`
>
> The default subject to use when the sender does not provide one.


##### `fieldSubject`

> Type: <code>String?</code>
>
> The name of the field in the contact form that contains the subject of the message.


##### `validateDomain`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to validate the domain of the sender's email address.



## JMAP API

The HttpForm singleton is available via the `urn:stalwart:jmap` capability.


### `x:HttpForm/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysHttpFormGet` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:HttpForm/get",
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



### `x:HttpForm/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysHttpFormUpdate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:HttpForm/set",
          {
            "update": {
              "singleton": {
                "defaultFromAddress": "updated value"
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
stalwart-cli get HttpForm
```


### Update

```sh
stalwart-cli update HttpForm --field defaultFromAddress='updated value'
```



## Nested types


### Rate

Defines a rate limit as a count over a time period.



##### `count`

> Type: <code>UnsignedInt</code> · default: `0` · min: 1 · max: 1000000
>
> Count


##### `period`

> Type: <code>Duration</code> · default: `"0s"` · min: 1
>
> Period





