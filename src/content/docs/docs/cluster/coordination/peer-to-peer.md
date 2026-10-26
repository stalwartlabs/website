---
sidebar_position: 2
title: "Peer-to-Peer"
description: "Use Eclipse Zenoh for peer-to-peer coordination between cluster nodes in a custom build of Stalwart."
---

The other coordinators all route notifications through a messaging server. With peer-to-peer coordination, the nodes of a cluster instead send notifications to each other directly, over the [Eclipse Zenoh](https://zenoh.io/) protocol, with no server in between. The nodes find each other in one of two ways: automatically, on networks that allow multicast, or through a configured list of peers.

Peer-to-peer coordination removes the messaging server, but not the other shared services. A cluster coordinated through Zenoh still requires a Redis-based [in-memory store](/docs/storage/in-memory), configured before the coordinator as described in [Coordination mechanism](/docs/cluster/configuration/coordination#order-of-configuration). That Redis deployment could serve as the coordinator as well, so Zenoh does not reduce the number of services a cluster depends on.

Zenoh support is not part of the official binaries. Using it requires [compiling Stalwart](/docs/development/compile) with the `zenoh` feature, and an official binary on which Zenoh is selected logs `Binary was not compiled with the selected coordinator backend`.

## Configuration

Zenoh coordination is selected with the `Zenoh` variant of the [Coordinator](/docs/ref/object/coordinator) object (found in the WebUI under <!-- breadcrumb:Coordinator --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" /><path d="m7 16.5-4.74-2.85" /><path d="m7 16.5 5-3" /><path d="M7 16.5v5.17" /><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" /><path d="m17 16.5-5-3" /><path d="m17 16.5 4.74-2.85" /><path d="M17 16.5v5.17" /><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" /><path d="M12 8 7.26 5.15" /><path d="m12 8 4.74-2.85" /><path d="M12 13.5V8" /></svg> Cluster › Coordinator<!-- /breadcrumb:Coordinator -->). Its single field, [`config`](/docs/ref/object/coordinator#config), contains a Zenoh configuration document in JSON5 syntax, which Stalwart passes to Zenoh unchanged. The [Zenoh configuration reference](https://zenoh.io/docs/manual/configuration/) describes the available options. If the document cannot be parsed, the coordinator is not started, and the server reports `Invalid Zenoh config: <reason>`.

On a network that allows multicast, the nodes can discover each other without any list. The following configuration runs each node as a Zenoh peer, and discovers the other nodes by multicast scouting on Zenoh's default group, `224.0.0.224`, port 7446:

```json
{
  "@type": "Zenoh",
  "config": "{ mode: \"peer\", scouting: { multicast: { enabled: true, address: \"224.0.0.224:7446\" } } }"
}
```

Multicast is often unavailable between hosts in cloud environments and across routed networks. In those cases, disable multicast scouting and list the other nodes as endpoints to connect to:

```json
{
  "@type": "Zenoh",
  "config": "{ mode: \"peer\", scouting: { multicast: { enabled: false } }, listen: { endpoints: [\"tcp/0.0.0.0:7447\"] }, connect: { endpoints: [\"tcp/10.0.0.11:7447\", \"tcp/10.0.0.12:7447\"] } }"
}
```

Each node then listens on the given port and connects to the listed peers, so the port must be reachable between the nodes.
