---
sidebar_position: 3
title: "DNS resolver"
description: "Choose and configure the DNS resolver Stalwart uses for MX, authentication, DANE and DNSBL lookups."
---

Stalwart resolves DNS names itself, with a built-in resolver, and every DNS lookup the server makes goes through it. When it delivers outgoing mail, the resolver finds the MX and address records of the recipient's domain. When it checks incoming mail, it reads SPF, DKIM and DMARC records, and when it secures connections, MTA-STS and TLSA records. It also looks up the reverse DNS names of connecting clients, sends the DNSBL queries of the spam filter, and runs the propagation checks of automatic DNS management. The choice of name servers behind the resolver therefore affects much more than speed: it decides whether spam blocklists answer and whether DANE can be used at all.

The resolver sends its queries to the name servers selected on the [DnsResolver](/docs/ref/object/dns-resolver) singleton (found in the WebUI under <!-- breadcrumb:DnsResolver --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › DNS › DNS Resolver<!-- /breadcrumb:DnsResolver -->).

## Choosing the name servers

The variant of the DnsResolver decides where queries go:

- `System` sends them to the name servers configured on the host, which on Unix systems are listed in `/etc/resolv.conf`.
- `Cloudflare`, `Quad9` and `Google` send them to the public resolvers of these operators. Cloudflare and Quad9 are queried over TLS unless `useTls` is turned off.
- `Custom` sends them to the name servers listed in [`servers`](/docs/ref/object/dns-resolver#servers). Each entry has an `address`, a `port` and a `protocol`, which is `udp`, `tcp` or `tls`.

Two considerations decide the choice: DNSBL queries and DANE.

### DNSBL queries

A DNS blocklist (DNSBL) publishes the reputation of IP addresses and domains as DNS records, and the spam filter queries it for each message. Most blocklists refuse queries that arrive through large public resolvers, because the volume from those resolvers exceeds their free usage limits. Some answer such queries with a special code that means "query refused" instead. A server that uses Cloudflare, Google or Quad9 therefore loses most of its DNSBL checks.

To keep them, use a local caching resolver that queries the blocklists directly. It can be reached through `System`, provided that the host's own resolver configuration does not forward to a public resolver, or configured as a `Custom` server.

### DNSSEC and DANE

DANE lets a sending server authenticate the receiving server through TLSA records published in DNS. A TLSA record only has meaning when it has been validated with DNSSEC, because otherwise anyone able to forge DNS answers could also forge the record. Stalwart validates DNSSEC itself. For that, it needs a resolver that passes DNSSEC records through, and at least one name server reachable over TCP or TLS.

The server checks these conditions at startup. If the check fails, [DANE](/docs/mta/transport-security/dane) verification of outgoing mail is turned off, and the server logs this warning:

```text
The configured DNS resolver cannot validate DNSSEC. DANE has been disabled to avoid deferring mail. Ensure the resolver is DNSSEC-capable and reachable over TCP.
```

The `System` variant connects to the host's name servers over both UDP and TCP, so it meets the TCP condition on its own. A `Custom` resolver meets it only when at least one of its servers has `protocol` set to `tcp` or `tls`.

### Recommended setup

A local validating resolver, such as Unbound running on the same host, satisfies both considerations. It queries the blocklists directly and validates DNSSEC, and it also caches answers for all the processes on the host.

## Lookup settings

Every variant shares a set of settings that control how each lookup is carried out:

- [`timeout`](/docs/ref/object/dns-resolver#timeout) is the time to wait for an answer before the query is considered failed.
- [`attempts`](/docs/ref/object/dns-resolver#attempts) is the number of times a failed query is retried.
- [`maxConcurrentRequests`](/docs/ref/object/dns-resolver#maxconcurrentrequests) is the number of name servers queried in parallel for each lookup, when several are configured. A value of 0 or 1 queries them one at a time.
- [`tcpOnError`](/docs/ref/object/dns-resolver#tcponerror) retries a query over TCP when it fails over UDP.
- [`enableEdns`](/docs/ref/object/dns-resolver#enableedns) turns on EDNS, the DNS extension that allows larger answers. DNSSEC needs it.
- [`preserveIntermediates`](/docs/ref/object/dns-resolver#preserveintermediates) keeps the intermediate records of a CNAME chain in the result.

## Caching

Stalwart caches each answer for its TTL, in caches whose sizes are set on the [Cache](/docs/ref/object/cache) object. Negative answers, which state that a name or record does not exist, are cached as well, for at most [`Cache.negativeTtl`](/docs/ref/object/cache#negativettl). That limit is <!-- default:Cache.negativeTtl -->1 hour<!-- /default --> unless changed. A record published after a failed lookup can therefore take that long to be seen by the server.

## Example

The following resolver queries two local name servers. One of them is reached over TCP, so that DNSSEC validation, and with it DANE, remains available:

```json
{
  "@type": "Custom",
  "servers": {
    "0": {"address": "192.0.2.1", "port": 53, "protocol": "udp"},
    "1": {"address": "192.0.2.3", "port": 53, "protocol": "tcp"}
  },
  "maxConcurrentRequests": 1
}
```
