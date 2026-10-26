---
sidebar_position: 4
title: "Load balancing"
description: "Place a cluster behind a load balancer: the hostname presented by every node, health checks, and preserving the client address."
---

Clients and other mail servers should see a cluster as one server, even though several nodes answer them. The usual way to achieve this is a load balancer, or several DNS records, that distributes connections among the nodes. Any node can serve any account, so the load balancer needs no session affinity: consecutive connections of the same client can go to different nodes. This page describes the settings that make the nodes behave as one server behind the load balancer.

## Hostname

Stalwart presents a hostname in many places: in the SMTP greeting and `EHLO` response, in `Received` headers, in DSNs and reports, and in the URLs it generates. In a cluster, every node presents the same name, the public name of the service. It is set in [`defaultHostname`](/docs/ref/object/system-settings#defaulthostname) on the [SystemSettings](/docs/ref/object/system-settings) object (found in the WebUI under <!-- breadcrumb:SystemSettings --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › Services, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › General<!-- /breadcrumb:SystemSettings -->). SystemSettings is kept in the shared data store, so the value is automatically the same on every node.

A different name per node is still possible, but only through expressions. The [`hostname`](/docs/ref/object/mta-stage-connect#hostname) expression of the SMTP greeting, for example, can use the node's own hostname.

For example, three nodes `mx1.example.org`, `mx2.example.org` and `mx3.example.org` behind a load balancer that serves `mx.example.org` all present `mx.example.org`:

```json
{
  "defaultHostname": "mx.example.org"
}
```

The TLS certificates presented by the nodes must cover this name.

Each node also has its own hostname, taken from the operating system or from `STALWART_HOSTNAME`, and it serves a different purpose: it determines the node's [node identifier](/docs/cluster/configuration/node-id). Clients see it only where an expression uses it. It has one other effect: a new server takes its initial `defaultHostname` from it.

## Health checks

A load balancer should send traffic only to nodes that can serve it, and an orchestrator should restart a node that has stopped responding. Each node answers two HTTP endpoints for these purposes, on its HTTP listeners.

The first, `/healthz/live`, returns `200` whenever the process is running and serving HTTP. It is suited to liveness checks, which restart a node that no longer responds.

The second, `/healthz/ready`, returns `200` when the node has its data store open, and `503` otherwise. It is suited to readiness checks, which decide whether a node receives traffic.

Both endpoints are unauthenticated, and they count towards the rate limit for anonymous HTTP requests, so a check interval of a few seconds is appropriate. Any other path, such as `/health`, returns `404`. The [HTTP API](/docs/http/api) reference lists the endpoints with the other HTTP routes.

Mail protocols are checked differently. Most load balancers have no SMTP or IMAP health checks, so a TCP connection check on the protocol port is the usual choice.

## Preserving the client address

Stalwart uses the client's IP address for rate limiting, automatic blocking, SPF, DNSBL lookups and logging. Behind a load balancer, however, connections arrive from the load balancer's address, unless the load balancer passes the original address on. How it does so depends on the layer at which it forwards the traffic.

For mail protocols forwarded at the TCP level (layer 4), the load balancer sends the [PROXY protocol](/docs/server/reverse-proxy/proxy-protocol) header. Stalwart accepts that header only from trusted addresses, listed in [`proxyTrustedNetworks`](/docs/ref/object/system-settings#proxytrustednetworks) on SystemSettings, or in a listener's [`overrideProxyTrustedNetworks`](/docs/ref/object/network-listener#overrideproxytrustednetworks).

For HTTP forwarded by a proxy that terminates TLS (layer 7), the address travels in a header instead. The [`clientIpSource`](/docs/ref/object/http#clientipsource) field of the [Http](/docs/ref/object/http) object selects the `X-Forwarded-For` or `Forwarded` header as the source of the client address, and [`forwardedHops`](/docs/ref/object/http#forwardedhops) sets the number of trusted proxies in front of the node. The [reverse proxy](/docs/server/reverse-proxy/) pages describe both settings.

SMTP, IMAP, POP3 and ManageSieve are normally forwarded at layer 4. The node then performs TLS itself, and STARTTLS works as it does on a direct connection.

## Restarting nodes

Some settings take effect only after a restart. Before restarting a node, take it out of the load balancer and let the existing connections finish. IMAP and JMAP clients reconnect to another node, and SMTP clients retry. Restarting the nodes one at a time keeps the service available.
