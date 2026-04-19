---
sidebar_position: 2
---

# DNS Providers

The [DnsServer](/docs/ref/object/dns-server) object (found in the WebUI under <!-- breadcrumb:DnsServer --><!-- /breadcrumb:DnsServer -->) is multi-variant, and each variant corresponds to a supported provider or protocol. Each variant carries its own credential fields (API keys, tokens, service-account JSON, or account identifiers as appropriate) alongside the shared timing fields that control TTLs, polling, and propagation checks. The authoritative list of fields for every variant is documented on the [DnsServer](/docs/ref/object/dns-server) reference page.

## Self-hosted BIND-compatible servers

Two variants implement dynamic DNS updates as defined in RFC 2136 for self-hosted authoritative name servers:

- The `Tsig` variant authenticates updates with a shared TSIG key.
- The `Sig0` variant authenticates updates with a SIG(0) asymmetric key pair.

## Hosted DNS APIs

The remaining variants integrate with hosted DNS services through each provider's management API:

- Cloudflare
- AWS Route 53
- Google Cloud DNS
- OVH
- deSEC
- DigitalOcean
- Bunny DNS
- Porkbun
- DNSimple
- Spaceship
