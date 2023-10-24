---
sidebar_position: 7
---

# DNS

The DNS resolver is responsible for resolving human-readable domain names into IP addresses and other type of machine-readable records. This is done by sending DNS queries to a DNS server, which then responds with the associated record of the domain name in question. 

## Settings

The DNS resolver is configured with the following attributes, which are available under the `resolver` key:

- `type`: The type of the DNS resolver.
- `preserve-intermediates`: Whether to preserve the intermediate name servers in the DNS resolution results.
- `concurrency`: The number of concurrent resolution requests that can be made at the same time.
- `timeout`: The time after which a resolution request will be timed out if no response is received.
- `attempts`: The number of times a resolution request will be retried before it is considered failed.
- `try-tcp-on-error`: Whether to try using TCP for resolution requests if an error occurs during a UDP resolution request.

The supported DNS resolver types for the `resolver.type` value are:

- `cloudflare`: Use Cloudflare's public DNS service.
- `cloudflare-tls`: Use Cloudflare's public DNS service over a secure TLS connection.
- `quad9`: Use Quad9's public DNS service.
- `quad9-tls`: Use Quad9's public DNS service over a secure TLS connection.
- `google`: Use Google's public DNS service.
- `system`: Use the system's default DNS resolver.

Please note that `system` should be used when using [DNS block lists](/docs/spamfilter/dnsbl) as lookups from public DNS services are not allowed by most DNSBL services.

Example:

```toml
[resolver]
type = "system"
preserve-intermediates = true
concurrency = 2
timeout = "5s"
attempts = 2
try-tcp-on-error = true
```

## Caching

DNS caching is a technique used to store DNS query results in a cache to reduce the number of DNS queries and improve the performance of applications that rely on DNS resolution. The cache is stored in memory and is used to quickly answer subsequent queries for the same domain name without the need to query the authoritative DNS servers again.

The caching size is configured under the `resolver.cache` key and indicate the maximum number of items that can be stored in the cache for each of the following DNS record types:

- `txt`: DNS Text (TXT) records.
- `mx`: DNS Mail Exchange (MX) records.
- `ipv4`: DNS A (Address) records for IPv4 addresses.
- `ipv6`: DNS AAAA (Address) records for IPv6 addresses.
- `ptr`: DNS Pointer (PTR) records.
- `tlsa`: DNS Transport Layer Security Association (TLSA) records.
- `mta-sts`: DNS MTA-STS (Mail Transfer Agent Strict Transport Security) records.

Example:

```toml
[resolver.cache]
txt = 2048
mx = 1024
ipv4 = 1024
ipv6 = 1024
ptr = 1024
tlsa = 1024
mta-sts = 1024
```

## Public Suffix List

The [Public Suffix List](https://publicsuffix.org/) is a list of top-level domain names (or suffixes) under which Internet users can register domain names. This list is used by the SMTP server to determine the root domain of a given domain name. For example, the root domain of `example.com` is `com` and the root domain of `example.co.uk` is `co.uk`.

The URL to the Public Suffix list is configured under the `resolver.public-suffix` key. The list can also be loaded from a local file by using the `file://` URL scheme. When both a remote URL and a local file are specified, the local file will be used as a fallback in case the remote URL is unavailable.

Example:

```toml
[resolver]
public-suffix = ["https://publicsuffix.org/list/public_suffix_list.dat", 
                 "file://%{BASE_PATH}%/etc/spamfilter/maps/suffix_list.dat.gz"]

```
