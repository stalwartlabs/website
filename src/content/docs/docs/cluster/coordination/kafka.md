---
sidebar_position: 3
title: "Apache Kafka / Redpanda"
description: "Use Apache Kafka or Redpanda as the cluster coordinator in a custom build of Stalwart."
---

[Apache Kafka](https://kafka.apache.org/) is a distributed event streaming platform, and [Redpanda](https://www.redpanda.com/) is a Kafka-compatible implementation. Either can serve as the [coordinator](/docs/cluster/coordination/) of a cluster. This suits organisations that already operate Kafka as their messaging infrastructure.

Kafka support is not part of the official binaries. Using it requires [compiling Stalwart](/docs/development/compile) with the `kafka` feature, and an official binary on which Kafka is selected logs `Binary was not compiled with the selected coordinator backend`. Kafka also does not replace Redis. A cluster coordinated through Kafka still requires a Redis-based [in-memory store](/docs/storage/in-memory), configured before the coordinator as described in [Coordination mechanism](/docs/cluster/configuration/coordination#order-of-configuration).

## Configuration

Kafka coordination is selected with the `Kafka` variant of the [Coordinator](/docs/ref/object/coordinator) object (found in the WebUI under <!-- breadcrumb:Coordinator --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" /><path d="m7 16.5-4.74-2.85" /><path d="m7 16.5 5-3" /><path d="M7 16.5v5.17" /><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" /><path d="m17 16.5-5-3" /><path d="m17 16.5 4.74-2.85" /><path d="M17 16.5v5.17" /><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" /><path d="M12 8 7.26 5.15" /><path d="m12 8 4.74-2.85" /><path d="M12 13.5V8" /></svg> Cluster › Coordinator<!-- /breadcrumb:Coordinator -->).

[`hosts`](/docs/ref/object/coordinator#hosts) lists the bootstrap brokers, the brokers a client first contacts to discover the rest of the Kafka cluster, as `host:port` pairs. At least one is required.

Kafka delivers each message once to every consumer group, so the way nodes form groups decides who receives what. [`groupId`](/docs/ref/object/coordinator#groupid) is the prefix of the consumer groups. Each node joins a group of its own, named `<groupId>-<nodeId>` after the prefix and its [node identifier](/docs/cluster/configuration/node-id), so that every node receives every notification. A new group starts reading at the latest offset, so a node that joins does not replay earlier notifications.

Two timeouts govern the connection to the brokers. [`sessionTimeout`](/docs/ref/object/coordinator#sessiontimeout) is the consumer session timeout: when the broker receives no heartbeat from a consumer within this time, it considers the consumer failed. [`messageTimeout`](/docs/ref/object/coordinator#messagetimeout) is the time allowed for a message to be delivered to the brokers.

[`useTls`](/docs/ref/object/coordinator#usetls) enables TLS for the broker connections, and [`allowInvalidCerts`](/docs/ref/object/coordinator#allowinvalidcerts) accepts an invalid broker certificate.

The following coordinator connects to two brokers over TLS:

```json
{
  "@type": "Kafka",
  "hosts": {"kafka1.example.com:9093": true, "kafka2.example.com:9093": true},
  "groupId": "stalwart-cluster",
  "useTls": true
}
```
