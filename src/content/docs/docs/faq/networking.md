---
title: "TLS, DNS, proxies and bans"
description: "Frequently asked questions about ACME and manual certificates, automatic DNS records, automatic IP bans, reverse proxies, listener addresses and client autoconfiguration."
sidebar_position: 5
---

## Certificates

### Can Stalwart issue RSA certificates through ACME?

No. A certificate obtained through ACME always has an ECDSA P-256 private key, and no setting changes the key type. A server that needs an RSA certificate has to install it by hand, as a [Certificate](/docs/server/tls/certificates) object. See [Names in a certificate](/docs/server/tls/acme/configuration#names-in-a-certificate).

### Which names does an ACME order cover, and why did the whole order fail?

The server requests all names of a certificate in a single order. If the validation of any one name fails, the whole order fails and no certificate is issued, so a single unreachable name blocks the certificate for all the others.

Which names are requested depends on the challenge type when `subjectAlternativeNames` is empty:

- A DNS-01 or DNS-PERSIST-01 order requests the domain and its wildcard.
- An HTTP-01 or TLS-ALPN-01 order requests the `mta-sts`, `autoconfig`, `autodiscover` and `ua-auto-config` names, together with the server, mail exchanger and service hostnames that lie within the domain. Each of these names must reach this server, because the certificate authority validates it by connecting there.

An order that fails for a network, DNS or validation error is retried according to the task retry policy, and the server does not give up. Results that cannot change, such as a domain whose certificates are managed manually, are not retried. See [One order per certificate](/docs/server/tls/acme/configuration#one-order-per-certificate) and [Failed orders](/docs/server/tls/acme/configuration#failed-orders).

### How do I load a certificate renewed by certbot or acme.sh?

Run the `ReloadTlsCertificates` [action](/docs/management/tasks-actions/actions) after the file is replaced. The server reads a certificate file only when it loads certificates, so a new file on disk goes unnoticed until then. The action is available in the WebUI under Management › Actions, or as `stalwart-cli create Action/ReloadTlsCertificates`.

The same applies to changes made to a Certificate object: they take effect only after this action or a restart. Certificates renewed by ACME, however, are loaded automatically. See [Reloading certificates](/docs/server/tls/certificates#reloading-certificates).

## Automatic DNS

### Which DNS records does automatic DNS publish, and when are they updated?

The domain's `publishRecords` setting selects the record types to publish. Among them are MX, SPF, DKIM, DMARC, TLS-RPT, MTA-STS, SRV, CAA, the autoconfiguration records and TLSA.

The records are written by a `DnsManagement` task, not continuously. A later change to the settings they are derived from, such as the mail exchangers or the service hostnames, is therefore published only when such a task runs. See [Records published](/docs/domains/dns-records#records-published) and [Refresh records](/docs/domains/dns-records#refresh-records).

### Automatic DNS fails with my provider. What should I check?

Check the credential first. It must be able to read, create, update and delete every record of the zone. A credential restricted to `_acme-challenge` TXT records is enough for ACME DNS-01 validation, but it makes automatic DNS management fail.

Some providers, among them Namecheap and Vultr, also require the server's IP address on an allow list. Even with the right access, individual updates fail when a CNAME record exists at a name where a TXT record is to be written, or when the provider's rate limits are reached. See [Minimum permissions](/docs/server/dns/provider-notes#minimum-permissions) and [Failures that originate at the provider](/docs/server/dns/provider-notes#failures-that-originate-at-the-provider).

### Why are old DNS records left after I remove a domain or rotate a DKIM key?

Stalwart publishes records but does not clean them up in these situations. It does not delete records when a domain is deleted, when the domain is switched to manual DNS management or when a record type is removed from `publishRecords`.

Records also remain when a deletion fails: a record during a DKIM key rotation, or an `_acme-challenge` record during cleanup. Such a failure is logged as `dns.record-deletion-failed` at the `debug` level, which is below the default level of a tracer, so a default log does not show it. Remove these records at the provider by hand. See [Records Stalwart does not remove](/docs/server/dns/provider-notes#records-stalwart-does-not-remove).

## Bans and proxies

### Why are connections closed with no reply and nothing in the logs?

The client's address has most likely been banned by [auto-ban](/docs/server/auto-ban), which blocks addresses after repeated authentication failures, abuse, loitering or scanning. A connection from a banned address is closed as soon as it is accepted, on every listener, before the TLS handshake and before any greeting. That is why the client sees no reply.

The server does record the ban: it logs a `security.ip-blocked` event. Unless a ban period is set, every automatic ban is permanent, so the address stays blocked until an administrator removes it. See [Diagnosing and clearing a ban](/docs/server/auto-ban#diagnosing-and-clearing-a-ban).

### How do I unban an IP address, including my own?

The server stores banned addresses as [BlockedIp](/docs/ref/object/blocked-ip) objects. Delete the address from this blocked list, in the WebUI or with `stalwart-cli delete BlockedIp --ids <id>`, and then run the `ReloadBlockedIps` action so that the server applies the change.

To also keep the address from being banned again, add it to the allowed list as an [AllowedIp](/docs/ref/object/allowed-ip) object. Once the `ReloadSettings` action has run, this lifts the ban and prevents new ones.

Loopback addresses are never banned. An administrator whose own address is blocked can therefore still reach the server from loopback, or in [recovery mode](/docs/configuration/recovery-mode), which does not enforce bans. See [Diagnosing and clearing a ban](/docs/server/auto-ban#diagnosing-and-clearing-a-ban).

### My reverse proxy's IP keeps getting banned. What do I do?

Make the proxy pass on the client's address. When it does not, every connection appears to come from the proxy, so auto-ban counts every user's failures against the proxy's address, and a ban of that address locks out every user.

Forward the client address with the [PROXY protocol](/docs/server/reverse-proxy/proxy-protocol), and list the proxy's network in `proxyTrustedNetworks` of the [SystemSettings](/docs/ref/object/system-settings) object. The networks listed there are never banned. A per-listener `overrideProxyTrustedNetworks` does not carry that exemption, so a proxy trusted only through it has to be added to the allowed list. See [Exemptions](/docs/server/auto-ban#exemptions) and [Preserving the client IP](/docs/server/reverse-proxy/#preserving-the-client-ip).

### Do I need PROXY protocol or X-Forwarded-For?

Use one mechanism per connection path. The two work differently:

- The PROXY protocol prefixes each connection with a header that carries the client address, and it works for every protocol. Every connection from a network trusted for the PROXY protocol must begin with such a header. A connection that starts with anything else, including a direct client from that range, is closed and logged as a `network.proxy-error` event.
- A forwarding header such as `X-Forwarded-For` applies to HTTP only. The `clientIpSource` setting of the [Http](/docs/ref/object/http) object enables it, and that setting applies to every HTTP listener.

See [Preserving the client IP](/docs/server/reverse-proxy/#preserving-the-client-ip) and [Connections without the header](/docs/server/reverse-proxy/proxy-protocol#connections-without-the-header).

### How do I run Stalwart behind Caddy, NGINX, Traefik or HAProxy?

Each of these proxies has its own page with a working configuration: [Caddy](/docs/server/reverse-proxy/caddy), [NGINX](/docs/server/reverse-proxy/nginx), [Traefik](/docs/server/reverse-proxy/traefik) and [HAProxy](/docs/server/reverse-proxy/haproxy). See [Reverse proxy](/docs/server/reverse-proxy/).

### Can I use fail2ban or CrowdSec with Stalwart?

Stalwart already blocks abusive clients itself. [Auto-ban](/docs/server/auto-ban) counts authentication failures, abuse, loitering and scanning per address and bans offenders, with an allowed list for trusted networks. That covers password-guessing and scanning bans.

Log-parsing filters written for such tools may need adjusting after an upgrade, because event names and the log layout can change between releases. See [Counted events](/docs/server/auto-ban#counted-events).

## Listeners and discovery

### How do I bind a listener to one internal IP?

Set the `bind` addresses of the [NetworkListener](/docs/ref/object/network-listener). For example, `127.0.0.1:8080` restricts the default `http` listener to loopback.

One listener is an exception. The listener used in bootstrap and recovery mode always binds to all interfaces, on port 8080 or the port set by `STALWART_RECOVERY_MODE_PORT`. In Docker, keep it local by publishing it as `-p 127.0.0.1:8080:8080`. See [Bind addresses and protocol](/docs/server/listener#bind-addresses-and-protocol).

### Why don't autoconfig and autodiscover work for my clients?

Clients look up their settings at the `autoconfig`, `autodiscover` and `ua-auto-config` host names, so most failures come from those names. The most common causes are a certificate that does not cover them and missing DNS records for them.

Not every client reads these documents. Apple Mail and iOS do not read Mozilla autoconfig documents and are set up manually ([Setting up clients](/docs/server/clients)). The Autodiscover JSON endpoint is also narrow: it answers only `Protocol=AutodiscoverV1`, with the address of the XML endpoint, and answers any other protocol with `400`. See [Discovery failures](/docs/server/autoconfig#discovery-failures).
