---
title: DnsServer
description: Defines a DNS server for automatic record management.
custom_edit_url: null
---

Defines a DNS server for automatic record management.

This object can be configured from the [WebUI](/docs/management/webui/) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › DNS › DNS Providers

## Fields

DnsServer is a **multi-variant** object: each instance has an `@type` discriminator selecting one of the variants below, and each variant carries its own set of fields.


### `@type: "Tsig"`

RFC2136 (TSIG)


##### `host`

> Type: <code>IpAddr</code> · required
>
> The IP address of the DNS server


##### `port`

> Type: <code>UnsignedInt</code> · default: `53` · max: 65535 · min: 1
>
> The port used to communicate with the DNS server


##### `keyName`

> Type: <code>String</code> · required
>
> The key used to authenticate with the DNS server


##### `key`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `protocol`

> Type: [<code>IpProtocol</code>](#ipprotocol) · default: `"udp"`
>
> The protocol used to communicate with the DNS server


##### `tsigAlgorithm`

> Type: [<code>TsigAlgorithm</code>](#tsigalgorithm) · default: `"hmac-sha512"`
>
> The TSIG algorithm used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Deprecated1"`

RFC2136 (SIG0 - deprecated)



### `@type: "Cloudflare"`

Cloudflare


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "DigitalOcean"`

DigitalOcean


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "DeSEC"`

DeSEC


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Ovh"`

OVH


##### `applicationKey`

> Type: <code>String</code> · required
>
> The application key used to authenticate with the OVH DNS server


##### `applicationSecret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The application secret used to authenticate with the OVH DNS server


##### `consumerKey`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The consumer key used to authenticate with the OVH DNS server


##### `ovhEndpoint`

> Type: [<code>OvhEndpoint</code>](#ovhendpoint) · default: `"ovh-eu"`
>
> Which OVH endpoint to use


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Bunny"`

BunnyDNS


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Porkbun"`

Porkbun


##### `apiKey`

> Type: <code>String</code> · required
>
> The API key used to authenticate with Porkbun


##### `secretApiKey`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret API key used to authenticate with Porkbun


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Dnsimple"`

DNSimple


##### `authToken`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The authentication token used to authenticate with DNSimple


##### `accountIdentifier`

> Type: <code>String</code> · required
>
> The account ID used to authenticate with DNSimple


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Spaceship"`

Spaceship


##### `apiKey`

> Type: <code>String</code> · required
>
> The API key used to authenticate with Spaceship


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Route53"`

AWS Route53


##### `accessKeyId`

> Type: <code>String</code> · required
>
> The AWS access key ID


##### `secretAccessKey`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The AWS secret access key


##### `sessionToken`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · required
>
> Optional session token for temporary AWS credentials


##### `region`

> Type: <code>String</code> · default: `"us-east-1"`
>
> The AWS region


##### `hostedZoneId`

> Type: <code>String?</code>
>
> Hosted zone ID to use (resolved automatically by name if not set)


##### `privateZoneOnly`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to restrict zone resolution to private zones only


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "GoogleCloudDns"`

Google Cloud DNS


##### `serviceAccountJson`

> Type: [<code>SecretText</code>](#secrettext) · required
>
> Service account JSON credentials used to authenticate with Google Cloud


##### `projectId`

> Type: <code>String</code> · required
>
> The Google Cloud project ID that owns the managed zone


##### `managedZone`

> Type: <code>String?</code>
>
> Managed zone name (resolved automatically by longest suffix match if not set)


##### `privateZone`

> Type: <code>Boolean</code> · default: `false`
>
> Whether to restrict zone resolution to private zones only


##### `impersonateServiceAccount`

> Type: <code>String?</code>
>
> Optional service account email to impersonate


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Alidns"`

Alibaba Cloud DNS


##### `accessKey`

> Type: <code>String</code> · required
>
> The Alibaba Cloud access key ID


##### `secretKey`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The Alibaba Cloud access key secret


##### `region`

> Type: <code>String?</code>
>
> Optional regional endpoint (defaults to the global endpoint)


##### `securityToken`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · required
>
> Optional STS security token for temporary credentials


##### `line`

> Type: <code>String?</code>
>
> Optional ISP line identifier (used for split-resolution accounts)


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "ArvanCloud"`

ArvanCloud


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Autodns"`

InterNetX AutoDNS


##### `username`

> Type: <code>String</code> · required
>
> AutoDNS account username


##### `password`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> AutoDNS account password


##### `context`

> Type: <code>UnsignedInt?</code>
>
> Optional account context identifier


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "AzureDns"`

Microsoft Azure DNS


##### `tenantId`

> Type: <code>String</code> · required
>
> Azure Active Directory tenant ID


##### `clientId`

> Type: <code>String</code> · required
>
> Application (client) ID


##### `clientSecret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> Application client secret


##### `subscriptionId`

> Type: <code>String</code> · required
>
> Azure subscription ID that owns the DNS zone


##### `resourceGroup`

> Type: <code>String</code> · required
>
> Resource group that contains the DNS zone


##### `environment`

> Type: [<code>AzureEnvironment</code>](#azureenvironment) · default: `"public"`
>
> Azure cloud environment


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "BaiduCloud"`

Baidu Cloud DNS


##### `accessKey`

> Type: <code>String</code> · required
>
> Baidu Cloud access key


##### `secretKey`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> Baidu Cloud secret key


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "BluecatV2"`

BlueCat Address Manager


##### `baseUrl`

> Type: <code>String</code> · required
>
> Base URL of the BlueCat Address Manager


##### `username`

> Type: <code>String</code> · required
>
> BlueCat account username


##### `password`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> BlueCat account password


##### `configName`

> Type: <code>String</code> · required
>
> BlueCat configuration name


##### `viewName`

> Type: <code>String</code> · required
>
> BlueCat DNS view name


##### `skipDeploy`

> Type: <code>Boolean</code> · default: `false`
>
> Skip deploying changes after applying them


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "ClouDns"`

ClouDNS


##### `authId`

> Type: <code>String?</code>
>
> ClouDNS auth ID (use either auth-id or sub-auth-id)


##### `subAuthId`

> Type: <code>String?</code>
>
> ClouDNS sub-auth ID


##### `password`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> ClouDNS auth password


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Constellix"`

Constellix


##### `apiKey`

> Type: <code>String</code> · required
>
> Constellix API key


##### `secretKey`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> Constellix secret key


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Cpanel"`

cPanel


##### `baseUrl`

> Type: <code>String</code> · required
>
> Base URL of the cPanel server (e.g. https://host:2083)


##### `username`

> Type: <code>String</code> · required
>
> cPanel account username


##### `token`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> cPanel API token


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Ddnss"`

DDNSS.de


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "DnsMadeEasy"`

DNS Made Easy


##### `apiKey`

> Type: <code>String</code> · required
>
> DNS Made Easy API key


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> DNS Made Easy API secret


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Domeneshop"`

Domeneshop


##### `authToken`

> Type: <code>String</code> · required
>
> Domeneshop API token


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> Domeneshop API secret


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Dreamhost"`

Dreamhost


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "DuckDns"`

DuckDNS


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Dynu"`

Dynu


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "EasyDns"`

EasyDNS


##### `token`

> Type: <code>String</code> · required
>
> EasyDNS token


##### `key`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> EasyDNS key


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "EdgeDns"`

Akamai EdgeDNS


##### `host`

> Type: <code>String</code> · required
>
> Akamai API host


##### `clientToken`

> Type: <code>String</code> · required
>
> Akamai client token


##### `clientSecret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> Akamai client secret


##### `accessToken`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> Akamai access token


##### `accountSwitchKey`

> Type: <code>String?</code>
>
> Optional account switch key for managing multiple accounts


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Exoscale"`

Exoscale


##### `apiKey`

> Type: <code>String</code> · required
>
> Exoscale API key


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> Exoscale API secret


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "FreeMyIp"`

freemyip.com


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "GandiV5"`

Gandi LiveDNS v5


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Gcore"`

Gcore


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Glesys"`

GleSYS


##### `apiUser`

> Type: <code>String</code> · required
>
> GleSYS API user


##### `apiKey`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> GleSYS API key


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Godaddy"`

GoDaddy


##### `apiKey`

> Type: <code>String</code> · required
>
> GoDaddy API key


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> GoDaddy API secret


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Hetzner"`

Hetzner


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "HostingDe"`

hosting.de


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Hostinger"`

Hostinger


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "HuaweiCloud"`

Huawei Cloud DNS


##### `accessKey`

> Type: <code>String</code> · required
>
> Huawei Cloud access key


##### `secretKey`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> Huawei Cloud secret key


##### `region`

> Type: <code>String</code> · default: `"ap-southeast-1"`
>
> Huawei Cloud region


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Hurricane"`

Hurricane Electric


##### `credentials`

> Type: [<code>HurricaneCredential</code>](#hurricanecredential)<code>[]</code> · min items: 1
>
> Per-zone Hurricane Electric DDNS keys


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "IbmCloud"`

IBM Cloud


##### `username`

> Type: <code>String</code> · required
>
> IBM Cloud account username


##### `apiKey`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> IBM Cloud API key


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Infoblox"`

Infoblox NIOS WAPI


##### `host`

> Type: <code>String</code> · required
>
> Infoblox grid master host


##### `port`

> Type: <code>String?</code>
>
> Optional port (defaults to 443)


##### `username`

> Type: <code>String</code> · required
>
> Infoblox account username


##### `password`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> Infoblox account password


##### `wapiVersion`

> Type: <code>String?</code>
>
> WAPI version to use (defaults to 2.11)


##### `dnsView`

> Type: <code>String?</code>
>
> DNS view name (defaults to External)


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Infomaniak"`

Infomaniak


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Inwx"`

INWX


##### `username`

> Type: <code>String</code> · required
>
> INWX account username


##### `password`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> INWX account password


##### `sharedSecret`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · required
>
> Optional shared secret for TOTP-based two-factor authentication


##### `sandbox`

> Type: <code>Boolean</code> · default: `false`
>
> Use the INWX sandbox API instead of production


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Ionos"`

IONOS


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Ipv64"`

IPv64


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Joker"`

Joker


##### `auth`

> Type: [<code>JokerAuth</code>](#jokerauth) · required
>
> Joker authentication method


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Lightsail"`

AWS Lightsail


##### `accessKeyId`

> Type: <code>String</code> · required
>
> AWS access key ID


##### `secretAccessKey`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> AWS secret access key


##### `sessionToken`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · required
>
> Optional session token for temporary AWS credentials


##### `region`

> Type: <code>String?</code>
>
> AWS region (defaults to us-east-1)


##### `domain`

> Type: <code>String?</code>
>
> Optional Lightsail domain name to scope record operations to


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Linode"`

Linode


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "LuaDns"`

LuaDNS


##### `username`

> Type: <code>String</code> · required
>
> LuaDNS account email or username


##### `authToken`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> LuaDNS API token


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "MythicBeasts"`

Mythic Beasts


##### `username`

> Type: <code>String</code> · required
>
> Mythic Beasts API key ID


##### `password`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> Mythic Beasts API key secret


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Namecheap"`

Namecheap


##### `apiUser`

> Type: <code>String</code> · required
>
> Namecheap API user


##### `apiKey`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> Namecheap API key


##### `clientIp`

> Type: <code>String</code> · required
>
> Whitelisted client IP address registered with Namecheap


##### `username`

> Type: <code>String?</code>
>
> Optional account username (defaults to the API user)


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "NameDotCom"`

Name.com


##### `username`

> Type: <code>String</code> · required
>
> Name.com account username


##### `authToken`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> Name.com API token


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "NameSilo"`

NameSilo


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Netcup"`

Netcup


##### `customerNumber`

> Type: <code>String</code> · required
>
> Netcup customer number


##### `apiKey`

> Type: <code>String</code> · required
>
> Netcup API key


##### `password`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> Netcup API password


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Netlify"`

Netlify


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Nifcloud"`

Nifcloud


##### `accessKey`

> Type: <code>String</code> · required
>
> Nifcloud access key


##### `secretKey`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> Nifcloud secret key


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Ns1"`

NS1


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "OracleCloud"`

Oracle Cloud


##### `tenancyOcid`

> Type: <code>String</code> · required
>
> Tenancy OCID


##### `userOcid`

> Type: <code>String</code> · required
>
> User OCID


##### `fingerprint`

> Type: <code>String</code> · required
>
> API signing key fingerprint


##### `privateKeyPem`

> Type: [<code>SecretText</code>](#secrettext) · required
>
> API signing private key in PEM format


##### `privateKeyPassword`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · required
>
> Optional passphrase for the private key


##### `region`

> Type: <code>String</code> · required
>
> OCI region (e.g. us-ashburn-1)


##### `compartmentOcid`

> Type: <code>String</code> · required
>
> Compartment OCID that owns the DNS zone


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Plesk"`

Plesk


##### `baseUrl`

> Type: <code>String</code> · required
>
> Base URL of the Plesk server (e.g. https://host:8443)


##### `apiKey`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> Plesk API key


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Safedns"`

ANS SafeDNS


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Scaleway"`

Scaleway


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "TencentCloud"`

Tencent Cloud DNSPod


##### `secretId`

> Type: <code>String</code> · required
>
> Tencent Cloud secret ID


##### `secretKey`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> Tencent Cloud secret key


##### `region`

> Type: <code>String?</code>
>
> Optional regional endpoint


##### `sessionToken`

> Type: [<code>SecretKeyOptional</code>](#secretkeyoptional) · required
>
> Optional STS session token for temporary credentials


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Transip"`

TransIP


##### `username`

> Type: <code>String</code> · required
>
> TransIP account login


##### `privateKeyPem`

> Type: [<code>SecretText</code>](#secrettext) · required
>
> TransIP private key in PEM format


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "UltraDns"`

UltraDNS


##### `username`

> Type: <code>String</code> · required
>
> UltraDNS account username


##### `password`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> UltraDNS account password


##### `endpoint`

> Type: <code>String?</code>
>
> Optional REST API endpoint override


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Vercel"`

Vercel


##### `authToken`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> Vercel auth token


##### `teamId`

> Type: <code>String?</code>
>
> Optional team ID to scope API requests to


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Volcengine"`

Volcano Engine


##### `accessKey`

> Type: <code>String</code> · required
>
> Volcengine access key


##### `secretKey`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> Volcengine secret key


##### `region`

> Type: <code>String?</code>
>
> Optional regional endpoint


##### `host`

> Type: <code>String?</code>
>
> Optional API host override


##### `scheme`

> Type: <code>String?</code>
>
> Optional URL scheme (http or https)


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "Vultr"`

Vultr


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> The secret or token used to authenticate with the DNS server


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "WebSupport"`

WebSupport


##### `apiKey`

> Type: <code>String</code> · required
>
> WebSupport API key


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> WebSupport API secret


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)



### `@type: "YandexCloud"`

Yandex Cloud


##### `apiKey`

> Type: [<code>SecretText</code>](#secrettext) · required
>
> Base64-encoded IAM service account key JSON


##### `folderId`

> Type: <code>String</code> · required
>
> Yandex Cloud folder ID that owns the DNS zone


##### `description`

> Type: <code>String</code> · required
>
> Short description of this DNS server


##### `memberTenantId`

> Type: <code>Id&lt;</code>[<code>Tenant</code>](/docs/ref/object/tenant)<code>&gt;?</code>
>
> Identifier for the tenant this DNS server belongs to


##### `timeout`

> Type: <code>Duration</code> · default: `"30s"`
>
> Request timeout for the DNS server


##### `ttl`

> Type: <code>Duration</code> · default: `"5m"`
>
> The TTL for new DNS record


##### `pollingInterval`

> Type: <code>Duration</code> · default: `"15s"`
>
> How often to check for DNS records to propagate


##### `propagationTimeout`

> Type: <code>Duration</code> · default: `"1m"`
>
> How long to wait for DNS records to propagate


##### `propagationDelay`

> Type: <code>Duration?</code>
>
> Initial delay before first propagation check (useful for slow providers)




## JMAP API

The DnsServer object is available via the `urn:stalwart:jmap` capability.


### `x:DnsServer/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysDnsServerGet` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:DnsServer/get",
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



### `x:DnsServer/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports create, update, and destroy operations in a single call.



#### Create

This operation requires the `sysDnsServerCreate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:DnsServer/set",
          {
            "create": {
              "new1": {
                "@type": "Tsig",
                "description": "Example",
                "host": "192.0.2.1",
                "key": {
                  "@type": "Value",
                  "secret": "Example"
                },
                "keyName": "Example"
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

This operation requires the `sysDnsServerUpdate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:DnsServer/set",
          {
            "update": {
              "id1": {
                "keyName": "updated value"
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

This operation requires the `sysDnsServerDestroy` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:DnsServer/set",
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




### `x:DnsServer/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysDnsServerQuery` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:DnsServer/query",
          {
            "filter": {
              "memberTenantId": "id1"
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




The `x:DnsServer/query` `filter` argument accepts the following conditions (combinable with `AnyOf` / `AllOf` / `Not` per RFC 8620):

| Condition | Kind |
|---|---|
| `memberTenantId` | id of Tenant |

## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get DnsServer id1
```


### Create

```sh
stalwart-cli create DnsServer/Tsig \
  --field host=192.0.2.1 \
  --field keyName=Example \
  --field 'key={"@type":"Value","secret":"Example"}' \
  --field description=Example
```


### Query

```sh
stalwart-cli query DnsServer
stalwart-cli query DnsServer --where memberTenantId=id1
```


### Update

```sh
stalwart-cli update DnsServer id1 --field keyName='updated value'
```


### Delete

```sh
stalwart-cli delete DnsServer --ids id1
```



## Nested types


### SecretKey

A secret value provided directly, from an environment variable, or from a file.


- **`Value`**: Secret value. Carries the fields of [`SecretKeyValue`](#secretkeyvalue).
- **`EnvironmentVariable`**: Secret read from environment variable. Carries the fields of [`SecretKeyEnvironmentVariable`](#secretkeyenvironmentvariable).
- **`File`**: Secret read from file. Carries the fields of [`SecretKeyFile`](#secretkeyfile).




#### SecretKeyValue

A secret value provided directly.



##### `secret`

> Type: <code>String</code> · required · secret
>
> Password or secret value





#### SecretKeyEnvironmentVariable

A secret value read from an environment variable.



##### `variableName`

> Type: <code>String</code> · required
>
> Environment variable name to read the secret from





#### SecretKeyFile

A secret value read from a file.



##### `filePath`

> Type: <code>String</code> · required
>
> File path to read the secret from





### SecretKeyOptional

An optional secret value, or none.


- **`None`**: No secret. No additional fields.
- **`Value`**: Secret value. Carries the fields of [`SecretKeyValue`](#secretkeyvalue).
- **`EnvironmentVariable`**: Secret read from environment variable. Carries the fields of [`SecretKeyEnvironmentVariable`](#secretkeyenvironmentvariable).
- **`File`**: Secret read from file. Carries the fields of [`SecretKeyFile`](#secretkeyfile).




### SecretText

A secret text value provided directly, from an environment variable, or from a file.


- **`Text`**: Secret value. Carries the fields of [`SecretTextValue`](#secrettextvalue).
- **`EnvironmentVariable`**: Secret read from environment variable. Carries the fields of [`SecretKeyEnvironmentVariable`](#secretkeyenvironmentvariable).
- **`File`**: Secret read from file. Carries the fields of [`SecretKeyFile`](#secretkeyfile).




#### SecretTextValue

A secret text value provided directly.



##### `secret`

> Type: <code>Text</code> · required · secret
>
> Password or secret value





### HurricaneCredential

Hurricane Electric per-zone DDNS credential.



##### `zone`

> Type: <code>DomainName</code> · required
>
> DNS zone (origin) the credential applies to


##### `secret`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> DDNS key for the zone





### JokerAuth

Joker DMAPI authentication credentials.


- **`ApiKey`**: API Key. Carries the fields of [`JokerAuthApiKey`](#jokerauthapikey).
- **`UsernamePassword`**: Username and Password. Carries the fields of [`JokerAuthUsernamePassword`](#jokerauthusernamepassword).




#### JokerAuthApiKey

Joker API key authentication.



##### `apiKey`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> Joker DMAPI API key





#### JokerAuthUsernamePassword

Joker username/password authentication.



##### `username`

> Type: <code>String</code> · required
>
> Joker DMAPI account username


##### `password`

> Type: [<code>SecretKey</code>](#secretkey) · required
>
> Joker DMAPI account password





## Enums


### IpProtocol



| Value | Label |
|---|---|
| `udp` | UDP |
| `tcp` | TCP |


### TsigAlgorithm



| Value | Label |
|---|---|
| `hmac-md5` | HMAC-MD5 |
| `gss` | GSS |
| `hmac-sha1` | HMAC-SHA1 |
| `hmac-sha224` | HMAC-SHA224 |
| `hmac-sha256` | HMAC-SHA256 |
| `hmac-sha256-128` | HMAC-SHA256-128 |
| `hmac-sha384` | HMAC-SHA384 |
| `hmac-sha384-192` | HMAC-SHA384-192 |
| `hmac-sha512` | HMAC-SHA512 |
| `hmac-sha512-256` | HMAC-SHA512-256 |


### OvhEndpoint



| Value | Label |
|---|---|
| `ovh-eu` | OVH EU |
| `ovh-ca` | OVH CA |
| `kimsufi-eu` | Kimsufi EU |
| `kimsufi-ca` | Kimsufi CA |
| `soyoustart-eu` | Soyoustart EU |
| `soyoustart-ca` | Soyoustart CA |


### AzureEnvironment



| Value | Label |
|---|---|
| `public` | Public |
| `china` | China |
| `us-government` | US Government |


