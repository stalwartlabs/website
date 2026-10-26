---
sidebar_position: 2
title: "DNS providers"
description: "The DNS providers Stalwart can update through their APIs or RFC 2136, the credential fields each needs, and the timing settings shared by all of them."
---

A DNS provider is the service that hosts a domain's zone. Stalwart can write records to the zone itself, which saves the administrator from copying records into the provider's control panel and keeps them in step with the server's configuration. It writes them for two purposes:

- [Automatic DNS management](/docs/domains/dns-records) publishes and maintains a domain's mail records.
- The [DNS-01 ACME challenge](/docs/server/tls/acme/challenges#dns-01) creates temporary validation records, to prove control of a name to a certificate authority.

Stalwart reaches the zone in one of two ways. For a hosted provider, it uses the provider's API. For a self-hosted name server, it sends RFC 2136 dynamic updates.

The provider and its credentials are stored in a [DnsServer](/docs/ref/object/dns-server) object, found in the WebUI under <!-- breadcrumb:DnsServer --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › DNS › DNS Providers<!-- /breadcrumb:DnsServer -->. Domains refer to a DnsServer from their DNS management settings, so one DnsServer can serve every domain hosted at the same provider account.

## Choosing the credential

The credential must allow Stalwart to read, create, replace and delete records in every zone it manages. Each of these permissions has a purpose:

- Stalwart reads the existing records at a name before writing, so that unrelated TXT and CAA records are kept.
- It creates and replaces the records it publishes.
- It deletes records it no longer needs, such as retired DKIM keys and ACME challenge records.

Some ACME client documentation suggests a credential restricted to `_acme-challenge` TXT records. Such a credential is sufficient for DNS-01 alone, but not for automatic DNS management. [DNS provider notes](/docs/server/dns/provider-notes) lists the minimum permissions for the common providers, and the errors seen when they are missing.

Like other secrets in the configuration, credentials can be stored inline, read from an environment variable or read from a file.

## Settings shared by all providers

Every variant has a required [`description`](/docs/ref/object/dns-server#description), which identifies the DnsServer when it is selected for a domain.

Every variant also shares a set of timing settings. The first two govern the records and the requests:

- [`ttl`](/docs/ref/object/dns-server#ttl) is the TTL of the records Stalwart creates.
- [`timeout`](/docs/ref/object/dns-server#timeout) is the timeout of each request to the provider.

The other three govern the wait for a new record to become visible on the provider's name servers:

- [`pollInterval`](/docs/ref/object/dns-server#pollinterval) sets how often Stalwart checks whether a record it is waiting for has become visible.
- [`propagationTimeout`](/docs/ref/object/dns-server#propagationtimeout) sets how long it waits before giving up.
- [`propagationDelay`](/docs/ref/object/dns-server#propagationdelay) is an optional delay before the first check, for providers that take a while to serve new records.

The wait applies only where a record must be visible before the next step: before a DNS-01 validation, and before signing with a rotated DKIM key. [Propagation](/docs/domains/dns-records#propagation) describes it.

## RFC 2136 (TSIG)

The `Tsig` variant serves zones on a self-hosted authoritative name server, such as BIND, Knot or PowerDNS. It sends dynamic updates, defined in [RFC 2136](https://www.rfc-editor.org/rfc/rfc2136), which change records in a zone over the DNS protocol itself. The updates are authenticated with a TSIG key ([RFC 8945](https://www.rfc-editor.org/rfc/rfc8945)), a secret shared between Stalwart and the name server.

The variant has the following fields:

- [`host`](/docs/ref/object/dns-server#host) is the IP address of the primary name server. A host name is not accepted.
- [`port`](/docs/ref/object/dns-server#port) and [`protocol`](/docs/ref/object/dns-server#protocol) (`udp` or `tcp`) select how to reach the name server.
- [`keyName`](/docs/ref/object/dns-server#keyname) is the name of the TSIG key, as configured on the name server.
- [`key`](/docs/ref/object/dns-server#key) is the key secret, base64 encoded as name servers print it. A value that is not valid base64 is reported as `Failed to base64 decode TSIG key`.
- [`tsigAlgorithm`](/docs/ref/object/dns-server#tsigalgorithm) is the key's algorithm.

The name server's update policy must allow the key to change all the record types that Stalwart publishes in the zone, not only TXT records. Those are MX, TXT, SRV, CNAME and CAA records and, if used, TLSA records.

## Hosted providers

Each hosted provider is a variant of DnsServer with its own credential fields. The [DnsServer reference](/docs/ref/object/dns-server) describes every field. The following table lists the variants, and the fields each one requires or accepts in addition to the shared settings.

| Provider | Variant | Credential and connection fields |
|---|---|---|
| Akamai EdgeDNS | `EdgeDns` | `host`, `clientToken`, `clientSecret`, `accessToken`, `accountSwitchKey` |
| Alibaba Cloud DNS | `Alidns` | `accessKeyId`, `secretKey`, `region`, `sessionToken`, `line` |
| ANS SafeDNS | `Safedns` | `secret` |
| ArvanCloud | `ArvanCloud` | `secret` |
| AWS Lightsail | `Lightsail` | `accessKeyId`, `secretKey`, `sessionToken`, `region`, `domain` |
| AWS Route53 | `Route53` | `accessKeyId`, `secretKey`, `sessionToken`, `region`, `hostedZoneId`, `privateZoneOnly` |
| Baidu Cloud DNS | `BaiduCloud` | `accessKeyId`, `secretKey` |
| BlueCat Address Manager | `BluecatV2` | `url`, `username`, `password`, `configName`, `viewName`, `skipDeploy` |
| BunnyDNS | `Bunny` | `secret` |
| Cloudflare | `Cloudflare` | `secret` |
| ClouDNS | `ClouDns` | `authId`, `subAuthId`, `password` |
| Constellix | `Constellix` | `apiKeyId`, `secretKey` |
| cPanel | `Cpanel` | `url`, `username`, `token` |
| DDNSS.de | `Ddnss` | `secret` |
| DeSEC | `DeSEC` | `secret` |
| DigitalOcean | `DigitalOcean` | `secret` |
| DNS Made Easy | `DnsMadeEasy` | `apiKeyId`, `secret` |
| DNSimple | `Dnsimple` | `token`, `accountIdentifier` |
| Domeneshop | `Domeneshop` | `token`, `secret` |
| Dreamhost | `Dreamhost` | `secret` |
| DuckDNS | `DuckDns` | `secret` |
| Dynu | `Dynu` | `secret` |
| EasyDNS | `EasyDns` | `token`, `key` |
| Exoscale | `Exoscale` | `apiKeyId`, `secret` |
| freemyip.com | `FreeMyIp` | `secret` |
| Gandi LiveDNS v5 | `GandiV5` | `secret` |
| Gcore | `Gcore` | `secret` |
| GleSYS | `Glesys` | `username`, `apiKey` |
| GoDaddy | `Godaddy` | `apiKeyId`, `secret` |
| Google Cloud DNS | `GoogleCloudDns` | `serviceAccountJson`, `projectId`, `managedZone`, `privateZone`, `impersonateServiceAccount` |
| Hetzner | `Hetzner` | `secret` |
| hosting.de | `HostingDe` | `secret` |
| Hostinger | `Hostinger` | `secret` |
| Huawei Cloud DNS | `HuaweiCloud` | `accessKeyId`, `secretKey`, `region` |
| Hurricane Electric | `Hurricane` | `credentials` |
| IBM Cloud | `IbmCloud` | `username`, `apiKey` |
| Infoblox NIOS WAPI | `Infoblox` | `host`, `port`, `username`, `password`, `wapiVersion`, `dnsView` |
| Infomaniak | `Infomaniak` | `secret` |
| InterNetX AutoDNS | `Autodns` | `username`, `password`, `context` |
| INWX | `Inwx` | `username`, `password`, `sharedSecret`, `sandbox` |
| IONOS | `Ionos` | `secret` |
| IPv64 | `Ipv64` | `secret` |
| Joker | `Joker` | `auth` |
| Linode | `Linode` | `secret` |
| LuaDNS | `LuaDns` | `username`, `token` |
| Microsoft Azure DNS | `AzureDns` | `tenantId`, `clientId`, `clientSecret`, `subscriptionId`, `resourceGroup`, `environment` |
| Mythic Beasts | `MythicBeasts` | `username`, `password` |
| Name.com | `NameDotCom` | `username`, `token` |
| Namecheap | `Namecheap` | `apiUser`, `apiKey`, `clientIp`, `username` |
| NameSilo | `NameSilo` | `secret` |
| Netcup | `Netcup` | `customerNumber`, `apiKeyId`, `password` |
| Netlify | `Netlify` | `secret` |
| Nifcloud | `Nifcloud` | `accessKeyId`, `secretKey` |
| NS1 | `Ns1` | `secret` |
| Oracle Cloud | `OracleCloud` | `tenancyOcid`, `userOcid`, `fingerprint`, `privateKeyPem`, `privateKeyPassword`, `region`, `compartmentOcid` |
| OVH | `Ovh` | `applicationKey`, `applicationSecret`, `consumerKey`, `ovhEndpoint` |
| Plesk | `Plesk` | `url`, `apiKey` |
| Porkbun | `Porkbun` | `apiKeyId`, `secret` |
| PowerDNS Authoritative | `PowerDns` | `apiKey`, `url`, `serverId` |
| Scaleway | `Scaleway` | `secret` |
| Spaceship | `Spaceship` | `apiKeyId`, `secret` |
| Tencent Cloud DNSPod | `TencentCloud` | `accessKeyId`, `secretKey`, `region`, `sessionToken` |
| TransIP | `Transip` | `username`, `privateKeyPem` |
| UltraDNS | `UltraDns` | `username`, `password`, `url` |
| Vercel | `Vercel` | `token`, `teamId` |
| Volcano Engine | `Volcengine` | `accessKeyId`, `secretKey`, `region`, `host`, `scheme` |
| Vultr | `Vultr` | `secret` |
| WebSupport | `WebSupport` | `apiKeyId`, `secret` |
| Yandex Cloud | `YandexCloud` | `apiKey`, `folderId` |
