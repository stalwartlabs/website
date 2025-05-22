---
sidebar_position: 4
---

# NATS

NATS is a lightweight, high-performance messaging system designed for cloud-native and edge environments. Built for simplicity, speed, and scalability, NATS provides a publish-subscribe model that enables services to communicate in real time with minimal latency and overhead. It is well-suited for distributed systems that require fast, reliable event propagation without the operational complexity of more heavyweight platforms like Apache Kafka.

As a coordination backend in a Stalwart cluster, NATS facilitates the exchange of internal events between nodes, allowing them to stay synchronized and respond to changes throughout the system. When a mailbox is updated on one node, a push notification needs to be triggered, or an IP address is blocked due to abuse, NATS ensures that this information is immediately disseminated to other nodes in the cluster.

NATS is particularly well-matched to medium-sized Stalwart deployments where low-latency communication is essential, but the full durability and message persistence features of Kafka are not required. Its compact footprint and straightforward configuration also make it a good option for teams looking to minimize operational overhead while still benefiting from robust coordination capabilities.

Though NATS does not persist messages in the same way Kafka does (unless extended via JetStream), it excels in real-time scenarios where speed and efficiency take priority over long-term storage. For many organizations, it offers the ideal balance between performance, simplicity, and scalability for coordinating distributed mail services.

## Configuration

To use **NATS** as a coordination backend in Stalwart, you must define the connection parameters under a dedicated store section. NATS provides fast, reliable messaging through a lightweight publish/subscribe model, making it a great choice for real-time coordination in distributed environments.

The following configuration settings are available for NATS, which are specified under the `store.<name>` section of the configuration file:

- `address`:  A required list of NATS server addresses to which Stalwart should connect.
- `user` / `password`:  Optional basic authentication credentials. If provided, they will be used to authenticate with the NATS server.
- `credentials`: An optional text value containing the JWT (JSON Web Token) used for authentication with the NATS server. This is an alternative to the `user` and `password` options.
- `no-echo`:  When enabled, prevents clients from receiving messages they publish themselves. This is typically enabled in coordination scenarios to avoid redundant updates (default: `true`).
- `tls.enable`: Enables or disables TLS for encrypted communication with NATS servers (default: `false`).
- `timeout.connection`: Maximum time to wait for establishing a connection to a NATS server (default: `5s`).
- `timeout.request`: Timeout for request/response operations over NATS (default: `10s`).
- `ping-interval`: Interval between ping messages sent to NATS servers to maintain connection health (default: `60s`).
- `max-reconnects`: Specifies how many times to attempt reconnection after a connection is lost. Setting this to `0` disables reconnections (default: unlimited).
- `capacity.client`:  Size of the internal channel for handling outgoing client operations (default: `2048`).
- `capacity.subscription`: Capacity of the internal channel for message subscriptions (default: `65536`).
- `capacity.read-buffer`:  Size of the read buffer for incoming messages from the NATS server (default: `65535`).

Example:

```toml
[store."nats"]
type = "nats"
address = ["nats1:4222", "nats2:4222"]
user = "nats-user"
password = "nats-password"
ping-interval = "60s"
max-reconnects = 0
no-echo = true
tls.enable = false

[store."nats".timeout]
connection = "5s"
request = "10s"

[store."nats".capacity]
client = 2048
subscription = 65536
read-buffer = 65535

[cluster]
coordinator = "nats"
```
