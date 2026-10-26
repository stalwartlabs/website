---
sidebar_position: 2
title: "System requirements"
description: "What a host needs before Stalwart is installed: a supported platform, a network that allows mail delivery, DNS access, memory, CPU and disk, and the outbound connections the server makes."
---

A mail server depends more on its network than on its hardware. A web server that is slow still serves its pages, but a mail server whose port 25 is blocked, or whose address other providers do not trust, delivers nothing at all, however well it is configured. Most of these conditions are set outside the server, by the hosting provider, the internet provider or the DNS provider. They are therefore worth checking before anything is installed.

This page lists what a host needs before Stalwart is installed. The checklist summarises the requirements, and the sections after it explain each one: first the platform and the network conditions, which decide whether the server can work at all, then the memory, CPU, disk and outbound connections, which decide how well it works under load.

## Checklist

- A host running a [supported platform](#supported-platforms), with memory for the default limits described in [Memory](#memory).
- A domain name for the mail addresses, and a server hostname that resolves to the server's IP address, as do `autoconfig`, `autodiscover`, `mta-sts` and `ua-auto-config` under the domain.
- A static public IP address, with a reverse DNS (PTR) record that can be set to the server hostname.
- Port 25 open in both directions at the hosting or internet provider.
- Inbound access to the ports of the mail protocols and to port 443.
- Control over the DNS zone of the mail domain.
- Outbound HTTPS access, which the server uses at the first start to download the WebUI and the spam filter rules.

## Supported platforms

Release binaries are published for the following targets:

| Operating system | Architectures | Notes |
|---|---|---|
| Linux | x86_64, aarch64, ARMv7, ARMv6 | Built against both glibc and musl; the installation script selects the variant matching the host. |
| macOS | aarch64 (Apple silicon), x86_64 | |
| FreeBSD | x86_64 | |
| Windows | x86_64 | No ARM build is published. |

The container image is published for the same Linux architectures, in a Debian-based variant and an Alpine-based variant.

## Network prerequisites

A server that sends and receives mail on the internet needs a domain name and a server hostname, both of which the setup wizard asks for. The domain, for example `example.com`, is the part of the mail addresses after the `@`. The server hostname, for example `mail.example.com`, is the name under which the server is reached, and it must resolve to the server's IP address through an A or AAAA record.

The names `autoconfig`, `autodiscover`, `mta-sts` and `ua-auto-config` under the domain, for example `autoconfig.example.com`, must also resolve to the server before the first start after setup. The TLS certificate the server requests covers these names, and the certificate authority does not issue it while any of them fails to resolve.

The IP address must be static and public, because receiving servers keep a reputation per IP address and the domain's MX record points at a fixed address. The address also needs a reverse DNS (PTR) record whose name matches the server hostname, and the hostname's A or AAAA record must point back at the same address. Many receivers reject or downgrade mail from addresses without matching reverse DNS. The provider of the address sets the PTR record, not the domain's zone.

Port 25 must be open in both directions. Many cloud and residential providers block connections on port 25 by default, which prevents delivery to other servers or reception from them, so the administrator either asks the provider to lift the block or relays outbound mail through a smart host, as described in [Outbound routing](/docs/mta/outbound/routing).

The firewall must accept inbound connections on the ports of the [default listeners](/docs/server/listener#default-listeners): 25 for SMTP from other servers, 465 for mail submission from clients, 993 for IMAP, 995 for POP3, 4190 for ManageSieve and 443 for HTTPS. Port 8080 serves the setup wizard and must not be reachable from the internet, which is why the installation tutorials restrict access to it.

## Memory

Memory use is set mainly by limits in the configuration: the caches of mailbox and message data, the cache of the data store, and the memory reserved for messages in transit. The defaults of the last two grow with the memory of the host, and the caches fill only as accounts are used, so an idle server stays well below its limits and a busy one approaches them.

With every setting at its default, the limits add up to about 2.4 GiB on a host with 2 GiB of memory. Of that, <!-- default:Cache.messagesLarge -->512 MiB<!-- /default --> is the cache for accounts of more than about 5.6 million messages at the default cache size, and <!-- default:Cache.groupwareLarge -->512 MiB<!-- /default --> the cache for accounts whose calendars, address books or files are too large for their caches. Both stay empty on a host without such accounts. A host that holds them needs more memory or smaller large-account caches. [Sizing memory](/docs/performance/memory) adds up the defaults for a given host size and lists what to lower.

## CPU

CPU use depends on mail volume and on what clients do, not on the number of accounts. The most expensive operations are password verification at sign-in, spam filtering and DKIM signing, full-text indexing of new messages and attachments, and TLS handshakes. Password verification is expensive by design, because the default password hash is deliberately slow. A server that receives or indexes large volumes of mail, or accepts many password sign-ins per second, therefore needs more cores.

As an estimate from benchmarks on a 16 vCPU x86_64 server, one password sign-in takes about 26 to 34 ms of CPU time, and receiving a 4 KB message with spam filtering about 0.7 to 1.8 ms, the higher figure applying to RocksDB, whose storage work runs in the Stalwart process. Under that load the server accepted more than 3,000 such messages per second, and served IMAP fetches and JMAP queries at a fraction of a millisecond of CPU time each. Full-text indexing of new mail ran at about 900 to 2,000 messages per second, depending on the data store. These figures vary with message size and content, and [Measuring performance](/docs/performance/measuring) describes how to find which of these operations dominates on a running server.

Message parsing and encoding use the AVX2 instruction set on x86_64 processors that support it, so a virtual machine should expose the host's processor model, as described in [CPU instruction sets](/docs/performance/cpu).

## Disk

The data store needs space for the messages, their metadata and the full-text index, and, unless a separate [blob store](/docs/storage/blob) is configured, the message contents as well. As an estimate from a benchmark of 8 million synthetic messages stored with their contents in the data store and full-text indexing enabled, RocksDB used about 0.95 GB of disk for each GB of mail, and PostgreSQL and FoundationDB about 1.45 GB. Real mail with attachments that are already compressed, such as images and PDF files, may need more on RocksDB, which compresses its data. Disk usage grows with the mail received, and [Maintenance](/docs/storage/maintenance) describes how the server reclaims space.

## File descriptors

Every client connection, every outbound SMTP connection and every open database file uses a file descriptor. The connection limit applies to each listener separately. [`SystemSettings.maxConnections`](/docs/ref/object/system-settings#maxconnections), <!-- default:SystemSettings.maxConnections -->8192<!-- /default --> by default, is the limit of every listener that does not set its own, so with the seven default listeners the process limit must be sized for several times that number of connections.

The installation script raises the limit to 65536 for the service it creates. A service unit or container started by other means inherits the default of the service manager, which is often 1024 and too low for a production server.

## Outbound network requirements

Some server functions connect to the internet at startup or on a schedule. On a host behind a restrictive egress firewall, the firewall must allow these connections, otherwise the corresponding feature does not work:

- The WebUI and other hosted [applications](/docs/management/applications/) are downloaded at startup: the WebUI bundle from `https://github.com/stalwartlabs/webui/releases/download/v2/webui.zip`, and any other application from its [`resourceUrl`](/docs/ref/object/application#resourceurl). Until the first download succeeds, the `/admin` and `/account` paths return `404 Not Found`. Where the firewall does not permit outbound HTTPS to GitHub, an internal HTTPS server can host the bundle instead, as described in [WebUI](/docs/management/webui/#outbound-network-requirement).
- The spam filter rule set is downloaded from `https://github.com/stalwartlabs/spam-filter/releases/latest/download/spam-filter-rules.json.gz` at first start and whenever an administrator runs a rule update. [Rule set updates](/docs/spamfilter/settings/general#rule-set-updates) describes how to load it from a local file instead.
- Certificates are issued through the configured ACME directory, `https://acme-v02.api.letsencrypt.org/directory` for Let's Encrypt. Without access to it, the server can neither obtain nor renew certificates automatically.
- The [Asn](/docs/server/asn) object created at first start downloads IP-to-ASN and IP-to-country lists from `https://github.com/sapics/ip-location-db/releases/` once a day. The spam filter and country-based expressions use them.
- When a license API key is configured, the license is renewed through `https://license.stalw.art/`, as described in [Licensing](/docs/server/enterprise).
- Lookups of MX, SPF, DKIM, DMARC, DNSBL and similar records need outbound DNS on UDP and TCP port 53, or DNS over HTTPS or TLS when the [resolver](/docs/server/dns/resolver) is configured for it.
- When a domain uses automatic DNS management, the server connects to the API endpoint of its DNS provider, as described in [DNS providers](/docs/server/dns/provider).

## Next step

Choose the installation tutorial for the platform: [Linux, macOS and FreeBSD](/docs/install/platform/linux), [Docker](/docs/install/platform/docker) or [Windows](/docs/install/platform/windows).
