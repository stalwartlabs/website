---
sidebar_position: 2
title: "DNS Providers"
---

The [DnsServer](/docs/ref/object/dns-server) object (found in the WebUI under <!-- breadcrumb:DnsServer --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › DNS › DNS Providers<!-- /breadcrumb:DnsServer -->) is multi-variant, and each variant corresponds to a supported provider or protocol. Each variant carries its own credential fields (API keys, tokens, service-account JSON, or account identifiers as appropriate) alongside the shared timing fields that control TTLs, polling, and propagation checks. The authoritative list of fields for every variant is documented on the [DnsServer](/docs/ref/object/dns-server) reference page.

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
