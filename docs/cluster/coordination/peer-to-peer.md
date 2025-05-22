---
sidebar_position: 2
---

# Peer-to-Peer

Peer-to-peer coordination is a decentralized approach to cluster communication in which each node communicates directly with its peers, without relying on a central coordinator or external messaging infrastructure. This model offers simplicity and autonomy, making it especially attractive for small to medium-sized deployments where minimizing operational complexity is a priority.

In Stalwart, peer-to-peer coordination is powered by [Eclipse Zenoh](https://zenoh.io), a cutting-edge protocol designed for high-performance data distribution in distributed and edge computing environments. Zenoh combines the benefits of publish-subscribe messaging with distributed key-value storage, enabling efficient, low-latency communication between nodes in real time.

When Stalwart is configured to operate in peer-to-peer mode, each instance automatically discovers and connects to other nodes in the cluster. Once connected, nodes exchange internal events and state changes such as mailbox updates, push notifications, and operational signals like blocked IP addresses or TLS certificate renewals. Because there is no intermediary, messages are delivered quickly and with minimal overhead, ensuring responsive coordination across the cluster.

Zenoh's protocol is designed to handle dynamic network conditions gracefully, including node failures and network partitions, which makes it well-suited for high-availability environments. It supports automatic reconnection, efficient routing, and scalable data dissemination, ensuring that Stalwart nodes remain synchronized even under adverse conditions.

While peer-to-peer coordination simplifies deployment by removing the need for additional services like Kafka or NATS, it's important to note that this approach introduces a modest computational cost. Since coordination duties are handled by the mail server itself, organizations with higher performance requirements or large-scale clusters may prefer to offload these responsibilities to a dedicated coordination backend.

Nonetheless, for many use cases—especially in environments where infrastructure simplicity, self-discovery, and low-latency messaging are key—Stalwart’s peer-to-peer coordination powered by Eclipse Zenoh provides an elegant and robust solution.

## Configuration

To enable peer-to-peer coordination in a Stalwart cluster, you must configure the coordination backend to use the zenoh protocol. Stalwart uses Eclipse Zenoh under the hood for decentralized, low-latency communication between nodes. Configuration for Zenoh must be provided in JSON5 format, and embedded under the `store.<id>.config` key in Stalwart's configuration file.

Example:

```toml
[store."peer-to-peer"]
type = "zenoh"
config = '''
{
  mode: peer,
  scouting: {
    multicast: {
      enabled: true,
      address: "224.0.0.224:7446",
      interface: "auto",
      autoconnect: { router: [], peer: ["router", "peer"] }, 
      listen: true,
    },
  },
}'''

[cluster]
coordinator = "peer-to-peer"
```

