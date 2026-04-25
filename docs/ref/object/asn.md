---
title: Asn
description: Configures ASN and geolocation data sources for IP address lookups.
custom_edit_url: null
---

# Asn

Configures ASN and geolocation data sources for IP address lookups.

This object can be configured from the [WebUI](/docs/management/webui/overview) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › ASN & GeoIP

## Fields

Asn is a **multi-variant** object: each instance has an `@type` discriminator selecting one of the variants below, and each variant carries its own set of fields.


### `@type: "Disabled"`

Disabled



### `@type: "Resource"`

URL Resource


##### `expires`

> Type: <code>Duration</code> · default: `"1d"`
>
> How often to refresh the ASN/Geo data.


##### `maxSize`

> Type: <code>Size</code> · default: `"100mb"`
>
> Maximum size of the ASN/Geo data file.


##### `timeout`

> Type: <code>Duration</code> · default: `"5m"`
>
> Time after which the ASN/Geo resource fetch is considered failed.


##### `asnUrls`

> Type: <code>String[]</code>
>
> URLs to fetch CSV file containing the IP to ASN mappings.


##### `geoUrls`

> Type: <code>String[]</code>
>
> URLs to fetch CSV file containing the IP to country code mappings.


##### `httpAuth`

> Type: [<code>HttpAuth</code>](#httpauth) · required
>
> The type of HTTP authentication to use


##### `httpHeaders`

> Type: <code>Map&lt;String, String&gt;</code>
>
> Additional headers to include in HTTP requests



### `@type: "Dns"`

DNS Lookup


##### `indexAsn`

> Type: <code>UnsignedInt</code> · default: `0`
>
> The position of the ASN in the DNS TXT record.


##### `indexAsnName`

> Type: <code>UnsignedInt?</code>
>
> The position of the ASN Name in the DNS TXT record.


##### `indexCountry`

> Type: <code>UnsignedInt?</code>
>
> The position of the country code in the DNS TXT record.


##### `separator`

> Type: <code>String</code> · default: `"|"`
>
> The separator character used in the DNS TXT record.


##### `zoneIpV4`

> Type: <code>String</code> · required
>
> The DNS zone to query for IPv4 ASN and geolocation data.


##### `zoneIpV6`

> Type: <code>String</code> · required
>
> The DNS zone to query for IPv6 ASN and geolocation data.




## JMAP API

The Asn singleton is available via the `urn:stalwart:jmap` capability.


### `x:Asn/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysAsnGet` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Asn/get",
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



### `x:Asn/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysAsnUpdate` [permission](../permissions.md).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Asn/set",
          {
            "update": {
              "singleton": {
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




## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/overview) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get Asn
```


### Update

```sh
stalwart-cli update Asn --field description='updated value'
```



## Nested types


### HttpAuth {#httpauth}

Defines the HTTP authentication method to use for HTTP requests.


- **`Unauthenticated`**: Anonymous. No additional fields.
- **`Basic`**: Basic Authentication. Carries the fields of [`HttpAuthBasic`](#httpauthbasic).
- **`Bearer`**: Bearer Token. Carries the fields of [`HttpAuthBearer`](#httpauthbearer).




#### HttpAuthBasic {#httpauthbasic}

HTTP Basic authentication credentials.



##### `username`

> Type: <code>String</code> · required
>
> Username for HTTP Basic Authentication


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> Password for HTTP Basic Authentication





##### SecretKey {#secretkey}

A secret value provided directly, from an environment variable, or from a file.


- **`Value`**: Secret value. Carries the fields of [`SecretKeyValue`](#secretkeyvalue).
- **`EnvironmentVariable`**: Secret read from environment variable. Carries the fields of [`SecretKeyEnvironmentVariable`](#secretkeyenvironmentvariable).
- **`File`**: Secret read from file. Carries the fields of [`SecretKeyFile`](#secretkeyfile).




##### SecretKeyValue {#secretkeyvalue}

A secret value provided directly.



##### `secret`

> Type: <code>String</code> · required · secret
>
> Password or secret value





##### SecretKeyEnvironmentVariable {#secretkeyenvironmentvariable}

A secret value read from an environment variable.



##### `variableName`

> Type: <code>String</code> · required
>
> Environment variable name to read the secret from





##### SecretKeyFile {#secretkeyfile}

A secret value read from a file.



##### `filePath`

> Type: <code>String</code> · required
>
> File path to read the secret from





#### HttpAuthBearer {#httpauthbearer}

HTTP Bearer token authentication.



##### `bearerToken`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> Bearer token for HTTP Bearer Authentication





