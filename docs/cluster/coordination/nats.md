---
sidebar_position: 4
---

# NATS

NATS is a lightweight messaging system built for cloud-native and edge environments. It provides a publish/subscribe model for real-time communication with low latency and low overhead. NATS suits distributed systems that need fast, reliable event propagation without the operational complexity of heavier platforms such as Apache Kafka.

As a coordination backend in a Stalwart cluster, NATS handles the exchange of internal events between nodes, keeping the cluster synchronised. When a mailbox is updated on one node, a push notification is triggered, or an IP address is blocked for abuse, NATS disseminates the information to the other nodes.

NATS is well-matched to medium-sized deployments where low-latency communication is essential but Kafka-level durability and persistence are not required. Its compact footprint and straightforward configuration also suit teams that want to minimise operational overhead while retaining reliable coordination.

NATS does not persist messages in the same way as Kafka (unless extended via JetStream), but it excels in real-time scenarios where speed and efficiency matter more than long-term storage. For many organisations, it balances performance, simplicity, and scalability for distributed mail coordination.

## Configuration

NATS coordination is configured by selecting the `Nats` variant on the [Coordinator](/docs/ref/object/coordinator) singleton (found in the WebUI under <!-- breadcrumb:Coordinator --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" /><path d="m7 16.5-4.74-2.85" /><path d="m7 16.5 5-3" /><path d="M7 16.5v5.17" /><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" /><path d="m17 16.5-5-3" /><path d="m17 16.5 4.74-2.85" /><path d="M17 16.5v5.17" /><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" /><path d="M12 8 7.26 5.15" /><path d="m12 8 4.74-2.85" /><path d="M12 13.5V8" /></svg> Cluster › Coordinator<!-- /breadcrumb:Coordinator -->). The variant carries the following fields:

- [`addresses`](/docs/ref/object/coordinator#addresses): list of NATS server addresses. Default `["127.0.0.1:4444"]`; at least one address is required.
- [`authUsername`](/docs/ref/object/coordinator#authusername) and [`authSecret`](/docs/ref/object/coordinator#authsecret): optional basic authentication credentials. `authSecret` is a [SecretKeyOptional](/docs/ref/object/coordinator#secretkeyoptional), which accepts a direct value, an environment-variable reference, or a file reference.
- [`credentials`](/docs/ref/object/coordinator#credentials): a [SecretTextOptional](/docs/ref/object/coordinator#secrettextoptional) holding a JWT used for authentication; an alternative to the username/password pair.
- [`noEcho`](/docs/ref/object/coordinator#noecho): when enabled, prevents clients from receiving messages they publish themselves. Recommended for coordination to avoid redundant updates. Default `true`.
- [`useTls`](/docs/ref/object/coordinator#usetls): enables TLS for encrypted communication with NATS servers. Default `false`.
- [`timeoutConnection`](/docs/ref/object/coordinator#timeoutconnection): maximum time to wait when establishing a connection. Default `"5s"`.
- [`timeoutRequest`](/docs/ref/object/coordinator#timeoutrequest): timeout for request/response operations. Default `"10s"`.
- [`pingInterval`](/docs/ref/object/coordinator#pinginterval): interval between pings sent to maintain connection health. Default `"60s"`.
- [`maxReconnects`](/docs/ref/object/coordinator#maxreconnects): number of reconnection attempts after a connection is lost. When left unset the client reconnects indefinitely.
- [`capacityClient`](/docs/ref/object/coordinator#capacityclient): internal channel size for outgoing client operations. Default `2048`.
- [`capacitySubscription`](/docs/ref/object/coordinator#capacitysubscription): capacity of the internal channel for message subscriptions. Default `65536`.
- [`capacityReadBuffer`](/docs/ref/object/coordinator#capacityreadbuffer): size of the read buffer for incoming messages. Default `65535`.

For example:

```json
{
  "@type": "Nats",
  "addresses": ["nats1:4222", "nats2:4222"],
  "authUsername": "nats-user",
  "authSecret": {
    "@type": "Value",
    "secret": "nats-password"
  },
  "pingInterval": "60s",
  "noEcho": true,
  "useTls": false,
  "timeoutConnection": "5s",
  "timeoutRequest": "10s",
  "capacityClient": 2048,
  "capacitySubscription": 65536,
  "capacityReadBuffer": 65535
}
```
