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

Peer-to-peer coordination is configured by selecting the `Zenoh` variant on the [Coordinator](/docs/ref/object/coordinator) singleton (found in the WebUI under <!-- breadcrumb:Coordinator --><!-- /breadcrumb:Coordinator -->). The variant carries a single field, [`config`](/docs/ref/object/coordinator#config), which holds the Zenoh configuration as a JSON5 string.

For example:

```json
{
  "@type": "Zenoh",
  "config": "{\n  mode: peer,\n  scouting: {\n    multicast: {\n      enabled: true,\n      address: \"224.0.0.224:7446\",\n      interface: \"auto\",\n      autoconnect: { router: [], peer: [\"router\", \"peer\"] },\n      listen: true,\n    },\n  },\n}"
}
```

The embedded string is evaluated as a Zenoh JSON5 document; refer to the [Zenoh documentation](https://zenoh.io) for the full set of scouting, multicast, and connection options.
