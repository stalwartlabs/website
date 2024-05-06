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

- `system`: Use the system's default DNS resolver.
- `cloudflare`: Use Cloudflare's public DNS service.
- `cloudflare-tls`: Use Cloudflare's public DNS service over a secure TLS connection.
- `quad9`: Use Quad9's public DNS service.
- `quad9-tls`: Use Quad9's public DNS service over a secure TLS connection.
- `google`: Use Google's public DNS service.
- `custom`: Use a custom list of DNS servers which are specified under the `resolver.custom` key.

When using a custom DNS resolver, the list of DNS servers have to be specified under the `resolver.custom` key using the `[protocol://]IP:PORT` format. For example:

```toml
[resolver]
custom = ["udp://192.0.2.1:55", "tcp://192.0.2.3:55", "8.8.8.8"]
```

Please note that `system` or `custom` should be used when using [DNS block lists](/docs/spamfilter/dnsbl) as lookups from public DNS services are not allowed by most DNSBL services.

### Example

```toml
[resolver]
type = "system"
preserve-intermediates = true
concurrency = 2
timeout = "5s"
attempts = 2
try-tcp-on-error = true
```

## Public Suffix List

The [Public Suffix List](https://publicsuffix.org/) is a list of top-level domain names (or suffixes) under which Internet users can register domain names. This list is used by the SMTP server to determine the root domain of a given domain name. For example, the root domain of `example.com` is `com` and the root domain of a domain ending in `.co.uk` is `co.uk`.

The URL to the Public Suffix list is configured under the `resolver.public-suffix` key. For example:

```toml
[resolver]
public-suffix = ["https://publicsuffix.org/list/public_suffix_list.dat", 
                 "https://raw.githubusercontent.com/publicsuffix/list/master/public_suffix_list.dat"]

```
