---
sidebar_position: 2
---

# Peer-to-Peer

Peer-to-peer coordination is a decentralised approach in which each node communicates directly with its peers, without a central coordinator or external messaging infrastructure. The model suits small to medium deployments where operational simplicity matters more than absolute throughput.

In Stalwart, peer-to-peer coordination uses [Eclipse Zenoh](https://zenoh.io), a protocol for data distribution in distributed and edge computing environments. Zenoh combines publish/subscribe messaging with distributed key-value storage, providing low-latency communication between nodes in real time.

When Stalwart is configured to run in peer-to-peer mode, each instance discovers and connects to other nodes in the cluster automatically. Connected nodes exchange internal events and state changes such as mailbox updates, push notifications, and operational signals (blocked IP addresses, TLS certificate renewals, and the like). Because there is no intermediary, messages are delivered with low overhead.

Zenoh is designed to handle dynamic network conditions, including node failures and network partitions, which suits high-availability environments. It supports automatic reconnection, efficient routing, and scalable data dissemination, so Stalwart nodes stay synchronised under adverse conditions.

Peer-to-peer coordination removes the need for Kafka or NATS at the cost of a modest amount of CPU on each node, since coordination runs inside the mail server process. Deployments with high throughput requirements or very large clusters may prefer to offload coordination to a dedicated backend.

For many environments, especially ones that value deployment simplicity, self-discovery, and low-latency messaging, Stalwart's peer-to-peer coordination over Eclipse Zenoh is a good fit.

:::tip Note

Peer-to-peer coordination is not included in the default Stalwart binary. To enable it, [build](/docs/development/compile) Stalwart with the `zenoh` feature flag.

:::

## Configuration

Peer-to-peer coordination is configured by selecting the `Zenoh` variant on the [Coordinator](/docs/ref/object/coordinator) singleton (found in the WebUI under <!-- breadcrumb:Coordinator --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" /><path d="m7 16.5-4.74-2.85" /><path d="m7 16.5 5-3" /><path d="M7 16.5v5.17" /><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" /><path d="m17 16.5-5-3" /><path d="m17 16.5 4.74-2.85" /><path d="M17 16.5v5.17" /><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" /><path d="M12 8 7.26 5.15" /><path d="m12 8 4.74-2.85" /><path d="M12 13.5V8" /></svg> Cluster › Coordinator<!-- /breadcrumb:Coordinator -->). The variant carries a single field, [`config`](/docs/ref/object/coordinator#config), which holds the Zenoh configuration as a JSON5 string.

For example:

```json
{
  "@type": "Zenoh",
  "config": "{\n  mode: peer,\n  scouting: {\n    multicast: {\n      enabled: true,\n      address: \"224.0.0.224:7446\",\n      interface: \"auto\",\n      autoconnect: { router: [], peer: [\"router\", \"peer\"] },\n      listen: true,\n    },\n  },\n}"
}
```

The embedded string is evaluated as a Zenoh JSON5 document; refer to the [Zenoh documentation](https://zenoh.io) for the full set of scouting, multicast, and connection options.
