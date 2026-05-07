---
title: SystemSettings
description: Configures core server settings including hostname, thread pool, and network services.
custom_edit_url: null
---

# SystemSettings

Configures core server settings including hostname, thread pool, and network services.

This object can be configured from the [WebUI](/docs/management/webui/) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › Services<svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › General

## Fields


##### `defaultHostname`

> Type: <code>HostName</code> · required
>
> The default hostname to use in SMTP greetings, MTA reports and other places where a hostname is needed but not specified.


##### `defaultDomainId`

> Type: <code>Id&lt;</code>[<code>Domain</code>](/docs/ref/object/domain)<code>&gt;</code> · required
>
> Default domain to use for authentication and reports.


##### `defaultCertificateId`

> Type: <code>Id&lt;</code>[<code>Certificate</code>](/docs/ref/object/certificate)<code>&gt;?</code>
>
> Default TLS certificate to use when no SNI is provided by the client


##### `threadPoolSize`

> Type: <code>UnsignedInt?</code> · min: 1
>
> The number of threads in the global thread pool for CPU intensive tasks. Defaults to the number of CPU cores


##### `maxConnections`

> Type: <code>UnsignedInt</code> · default: `8192` · min: 1
>
> The maximum number of concurrent connections the server will accept


##### `proxyTrustedNetworks`

> Type: <code>IpMask[]</code>
>
> Enable proxy protocol for connections from these networks


##### `mailExchangers`

> Type: [<code>MailExchanger</code>](#mailexchanger)<code>[]</code> · default: `[{"priority":10}]`
>
> List of mail exchangers to publish in DNS MX records.


##### `services`

> Type: <code>Map&lt;</code>[<code>ServiceProtocol</code>](#serviceprotocol)<code>, </code>[<code>Service</code>](#service)<code>&gt;</code> · default: `{"caldav":{"cleartext":false},"carddav":{"cleartext":false},"imap":{"cleartext":false},"jmap":{"cleartext":false},"managesieve":{"cleartext":false},"pop3":{"cleartext":false},"smtp":{"cleartext":false},"webdav":{"cleartext":false}}`
>
> List of services to advertise in DNS and auto configuration services


##### `providerInfo`

> Type: <code>Map&lt;</code>[<code>ProviderInfo</code>](#providerinfo)<code>, String&gt;</code>
>
> Information about the provider to advertise in auto configuration services.



## JMAP API

The SystemSettings singleton is available via the `urn:stalwart:jmap` capability.


### `x:SystemSettings/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysSystemSettingsGet` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:SystemSettings/get",
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



### `x:SystemSettings/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysSystemSettingsUpdate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:SystemSettings/set",
          {
            "update": {
              "singleton": {
                "defaultHostname": "mail.example.com"
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
stalwart-cli get SystemSettings
```


### Update

```sh
stalwart-cli update SystemSettings --field defaultHostname=mail.example.com
```



## Nested types


### MailExchanger

Defines a mail exchanger for DNS MX records.



##### `hostname`

> Type: <code>HostName?</code>
>
> The hostname of the mail exchanger, or null to use the default hostname


##### `priority`

> Type: <code>UnsignedInt</code> · default: `10` · min: 1 · max: 65535
>
> The priority of the mail exchanger, lower values are preferred. Mail exchangers with the same priority will be selected randomly.





### Service

Defines a service endpoint advertised in auto-configuration.



##### `hostname`

> Type: <code>HostName?</code>
>
> The hostname of the service, or null to use the server's default hostname


##### `cleartext`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to advertise the service as available without TLS encryption. This does not affect whether the service actually accepts cleartext connections, which is configured separately for each network listener.





## Enums


### ServiceProtocol



| Value | Label |
|---|---|
| `jmap` | JMAP |
| `imap` | IMAP |
| `pop3` | POP3 |
| `smtp` | SMTP submission |
| `caldav` | CalDAV |
| `carddav` | CardDAV |
| `webdav` | WebDAV |
| `managesieve` | ManageSieve |


### ProviderInfo



| Value | Label |
|---|---|
| `providerName` | Provider name |
| `providerShortName` | Short provider name |
| `userDocumentation` | URL with user-facing documentation |
| `developerDocumentation` | URL with developer-facing documentation |
| `contactUri` | Contact information URI |
| `logoUrl` | URL to a logo image for the provider |
| `logoWidth` | Logo width in pixels |
| `logoHeight` | Logo height in pixels |


