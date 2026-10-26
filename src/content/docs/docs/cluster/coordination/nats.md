---
sidebar_position: 4
title: "NATS"
description: "Use a NATS messaging server or cluster as the cluster coordinator."
---

[NATS](https://nats.io/) is a lightweight publish and subscribe messaging system. It can serve as the [coordinator](/docs/cluster/coordination/) of a cluster in two situations: when coordination traffic should run on a dedicated messaging service, and when NATS is already operated. NATS support is included in the official binaries. Stalwart uses only core NATS publish and subscribe, so JetStream, the persistence layer of NATS, is not required.

Choosing NATS for coordination does not remove the need for Redis. A cluster coordinated through NATS still requires a Redis-based [in-memory store](/docs/storage/in-memory), which must be configured before the coordinator, as described in [Coordination mechanism](/docs/cluster/configuration/coordination#order-of-configuration).

## Configuration

NATS coordination is selected with the `Nats` variant of the [Coordinator](/docs/ref/object/coordinator) object (found in the WebUI under <!-- breadcrumb:Coordinator --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" /><path d="m7 16.5-4.74-2.85" /><path d="m7 16.5 5-3" /><path d="M7 16.5v5.17" /><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" /><path d="m17 16.5-5-3" /><path d="m17 16.5 4.74-2.85" /><path d="M17 16.5v5.17" /><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" /><path d="M12 8 7.26 5.15" /><path d="m12 8 4.74-2.85" /><path d="M12 13.5V8" /></svg> Cluster › Coordinator<!-- /breadcrumb:Coordinator -->).

[`hosts`](/docs/ref/object/coordinator#hosts) lists the NATS servers as `host:port` pairs. Listing several servers of a NATS cluster allows the client to fail over between them. [`useTls`](/docs/ref/object/coordinator#usetls) enables TLS, and [`allowInvalidCerts`](/docs/ref/object/coordinator#allowinvalidcerts) accepts an invalid server certificate.

NATS servers accept two kinds of credential, and either can be configured. The first is a user name and password, in [`authUsername`](/docs/ref/object/coordinator#authusername) and [`authSecret`](/docs/ref/object/coordinator#authsecret). The second is a JWT credentials string, in [`credentials`](/docs/ref/object/coordinator#credentials), which can be read from a NATS credentials file. Each secret can be given as a value, read from an environment variable or read from a file, and `None` disables it.

The remaining fields control the connection, and they rarely need to change:

- [`connectTimeout`](/docs/ref/object/coordinator#connecttimeout) and [`requestTimeout`](/docs/ref/object/coordinator#requesttimeout) limit connection establishment and requests.
- [`pingInterval`](/docs/ref/object/coordinator#pinginterval) sets how often the client checks the connection, and [`maxReconnects`](/docs/ref/object/coordinator#maxreconnects) limits the reconnection attempts after the connection is lost. When it is unset, the client keeps reconnecting.
- [`noEcho`](/docs/ref/object/coordinator#noecho) stops a node from receiving the notifications it published itself.
- [`clientCapacity`](/docs/ref/object/coordinator#clientcapacity), [`subscriptionCapacity`](/docs/ref/object/coordinator#subscriptioncapacity) and [`readBufferCapacity`](/docs/ref/object/coordinator#readbuffercapacity) size the client's internal buffers. A subscription whose buffer fills is treated by NATS as a slow consumer, and messages are dropped.

The following coordinator connects to a two-server NATS cluster, with a password read from an environment variable:

```json
{
  "@type": "Nats",
  "hosts": {"nats1.example.com:4222": true, "nats2.example.com:4222": true},
  "authUsername": "stalwart",
  "authSecret": {"@type": "EnvironmentVariable", "variableName": "NATS_PASSWORD"},
  "credentials": {"@type": "None"}
}
```
