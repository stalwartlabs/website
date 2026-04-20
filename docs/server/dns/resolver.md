---
sidebar_position: 3
---

# DNS Resolver

The DNS resolver translates human-readable domain names into IP addresses and other machine-readable records. It is used throughout the MTA for MX lookups, IP reputation queries, MTA-STS policy retrieval, and many other operations.

The DNS resolver is configured on the [DnsResolver](/docs/ref/object/dns-resolver) singleton (found in the WebUI under <!-- breadcrumb:DnsResolver --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › DNS › DNS Resolver<!-- /breadcrumb:DnsResolver -->). It is a multi-variant object: each instance selects one of several resolver backends, and the chosen variant determines which fields apply. The supported variants are:

- `System`: use the operating-system resolver configured on the host.
- `Cloudflare`: use Cloudflare's public DNS service. A TLS option is available via the variant fields.
- `Quad9`: use Quad9's public DNS service. A TLS option is available via the variant fields.
- `Google`: use Google's public DNS service.
- `Custom`: use a list of DNS servers supplied via the [`servers`](/docs/ref/object/dns-resolver#servers) field. Each entry is a `DnsCustomResolver` with its own [`address`](/docs/ref/object/dns-resolver#dnscustomresolver), [`port`](/docs/ref/object/dns-resolver#dnscustomresolver) (default `53`), and [`protocol`](/docs/ref/object/dns-resolver#dnscustomresolver) (`udp`, `tcp`, or `tls`).

DNSBL lookups are typically performed against the system resolver or a custom resolver, since most public DNSBL services do not accept queries from public open resolvers.

## Common settings

Every variant exposes the following fields with identical semantics:

- [`preserveIntermediates`](/docs/ref/object/dns-resolver#preserveintermediates): whether to preserve intermediate name servers in resolution results. Default `true`.
- [`concurrency`](/docs/ref/object/dns-resolver#concurrency): maximum number of concurrent resolution requests. Default 2.
- [`timeout`](/docs/ref/object/dns-resolver#timeout): time after which a resolution request is considered failed. Default 5 seconds.
- [`attempts`](/docs/ref/object/dns-resolver#attempts): number of times a resolution request is retried before failing. Default 2.
- [`tcpOnError`](/docs/ref/object/dns-resolver#tcponerror): whether to retry over TCP when a UDP query errors. Default `true`.
- [`enableEdns`](/docs/ref/object/dns-resolver#enableedns): whether to enable EDNS, required for some DNS features such as DNSSEC. Default `true`.

A System-resolver configuration using the default values:

```json
{
  "@type": "System",
  "preserveIntermediates": true,
  "concurrency": 2,
  "timeout": "5s",
  "attempts": 2,
  "tcpOnError": true,
  "enableEdns": true
}
```

A custom resolver pointing at two local DNS servers and one public one:

```json
{
  "@type": "Custom",
  "servers": [
    {"address": "192.0.2.1", "port": 55, "protocol": "udp"},
    {"address": "192.0.2.3", "port": 55, "protocol": "tcp"},
    {"address": "8.8.8.8"}
  ]
}
```
