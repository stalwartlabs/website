---
sidebar_position: 1
title: "System settings"
description: "Server-wide settings on the SystemSettings object: hostname, mail exchangers and advertised services, connection and memory limits, trusted proxies, worker threads and privilege dropping."
---

A few settings describe the server as a whole, and many other features depend on them. The hostname, for example, appears in every SMTP session, in the DNS records the server generates and in its public URL. These settings are grouped on the [SystemSettings](/docs/ref/object/system-settings) singleton (found in the WebUI under <!-- breadcrumb:SystemSettings --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › Services, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › General<!-- /breadcrumb:SystemSettings -->).

The setup wizard fills in the hostname and the default domain. The other settings have defaults that suit a single server. They are mainly changed in three situations: when the server is published under several names, when it runs behind a load balancer, and when it needs a different memory or connection budget.

## Hostname and default domain

[`defaultHostname`](/docs/ref/object/system-settings#defaulthostname) is the name the server uses for itself, and it appears in many places:

- In the SMTP greeting and in `EHLO`
- In the `Received` and `Message-ID` headers, and in DSNs and reports
- As the target of the CNAME and SRV records the server generates
- As the base of the public HTTPS URL, unless `STALWART_PUBLIC_URL` sets another one or the JMAP entry of `services`, described below, has a host name of its own

Remote mail servers compare this name with the reverse DNS name of the server's IP address, so the two should match.

[`defaultDomainId`](/docs/ref/object/system-settings#defaultdomainid) names the default domain. The server uses it for authentication and for the reports it sends.

## Mail exchangers and advertised services

The server publishes two kinds of name. Mail exchangers are the hosts that other mail servers deliver to, and services are the hosts that clients connect to. Each is configured in its own list.

[`mailExchangers`](/docs/ref/object/system-settings#mailexchangers) lists the hosts that receive mail for the server's domains. Each entry has a priority and an optional hostname, and an entry without a hostname uses the default hostname. The list determines several things at once: the MX records and SPF records the server generates for each domain, the TLSA records for port 25, and the names included in ACME certificate orders. A server published under several MX names therefore lists each of them here.

[`services`](/docs/ref/object/system-settings#services) describes each client protocol: IMAP, POP3, SMTP submission, JMAP, CalDAV, CardDAV, WebDAV and ManageSieve. For each protocol it gives the hostname under which clients reach it and whether a cleartext port is advertised. The entries feed the following:

- The SRV records
- The [autoconfiguration](/docs/server/autoconfig) responses
- The names in ACME certificate orders
- The TLSA records of ports 993, 995, 465 and 443
- The host names the server accepts for OAuth sign-in

Only the implicit-TLS ports are advertised by default. Turning on the `cleartext` flag of an entry adds the cleartext port, 143, 110 or 587, to the advertisements. The flag changes only what is advertised, however. Clients can connect to those ports only when a [listener](/docs/server/listener) exists for them.

[`providerInfo`](/docs/ref/object/system-settings#providerinfo) supplies the provider name, logo, contact address and documentation URLs that autoconfiguration documents include.

## Connection limit

[`maxConnections`](/docs/ref/object/system-settings#maxconnections) limits the number of concurrent connections of each listener that does not set its own [`maxConnections`](/docs/ref/object/network-listener#maxconnections). The limit is <!-- default:SystemSettings.maxConnections -->8192<!-- /default --> unless changed.

The limit applies to every listener separately, which means that the server as a whole can hold the sum of the listener limits. The process file descriptor limit must cover that sum, as described in [System requirements](/docs/install/requirements#file-descriptors).

A connection that arrives while its listener is at the limit is closed immediately and logged as a `limit.concurrent-connection` event. Changes to the limit take effect after a restart.

## Memory budget

Messages and blobs in transit are held in memory: messages being received over SMTP, and message contents being sent to IMAP, POP3, JMAP and DAV clients. [`maxBufferedMemory`](/docs/ref/object/system-settings#maxbufferedmemory) caps the memory they may use.

When the field is unset, the budget is one quarter of the memory available to the server. That is the container memory limit when one is set, and the physical memory otherwise. The budget cannot be set below 16 MiB. When the available memory cannot be determined, the server uses 1 GiB and logs the warning `Unable to detect the available memory, using 1 GiB for maxBufferedMemory`.

When the budget is exhausted, new transfers are refused with a temporary error, which clients retry later. Each protocol reports it in its own way:

- SMTP replies `452 4.3.1`.
- JMAP and DAV answer HTTP `503` with `Retry-After`.
- IMAP replies `NO [UNAVAILABLE]`.
- POP3 replies `-ERR [SYS/TEMP]`.

Each refusal logs a `limit.memory-budget` event. [Sizing memory](/docs/performance/memory) explains how to size the budget against the caches.

## Trusted proxies

A load balancer or proxy in front of the server hides the address of the original client, because the server sees only the proxy's connection. The PROXY protocol solves this: the proxy sends a header with the original client address at the start of each connection. [PROXY protocol](/docs/server/reverse-proxy/proxy-protocol) describes the mechanism.

[`proxyTrustedNetworks`](/docs/ref/object/system-settings#proxytrustednetworks) lists the networks of the proxies that send this header, and the server takes the client address from the header only on connections from them. Every connection from these networks must begin with a PROXY header, otherwise it is dropped. A listener can replace the list with its own [`overrideProxyTrustedNetworks`](/docs/ref/object/network-listener#overrideproxytrustednetworks).

The networks listed on SystemSettings are also exempt from [auto-ban](/docs/server/auto-ban), which blocks addresses after repeated failures, and from IP blocking. The exemption ensures that the proxy itself is never banned. The per-listener list does not grant it.

The two uses of the list pick up changes at different times. A changed list reaches the exemption at the next settings reload, while the listeners apply it only after a restart.

## Worker threads

The server runs its network and protocol work on a pool of worker threads, by default one per CPU. The `TOKIO_WORKER_THREADS` environment variable sets the pool size. It is read at start and described in [Environment variables](/docs/configuration/environment-variables).

The RocksDB and SQLite data stores run their disk operations on a separate pool, sized by the store's [`poolWorkers`](/docs/ref/object/data-store#poolworkers) setting. By default that pool has one thread per CPU, and at least four. [Data store tuning](/docs/performance/data-store) describes when to change it.

## Secrets in API responses

The management API hides passwords, keys and other secret values in its responses. [`includeSecrets`](/docs/ref/object/system-settings#includesecrets) turns this protection off. Enable it only for the duration of an export of the configuration that must carry the secrets, for example a migration to another server, and disable it again afterwards.

## Running as an unprivileged user

Binding ports below 1024 requires privileges. On Linux, the installation script and the container image grant the binary the `CAP_NET_BIND_SERVICE` capability, so the server runs as an unprivileged user from the start.

Where this is not possible, for example on FreeBSD, the server can be started as root with the `RUN_AS_USER` environment variable set, and optionally `RUN_AS_GROUP`. The server then binds its listeners first and switches to that user and group afterwards. The FreeBSD service script written by the installer uses this method.
