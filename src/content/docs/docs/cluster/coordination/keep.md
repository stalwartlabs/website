---
sidebar_position: 1.5
title: "Stalwart Keep"
description: "Use Stalwart Keep as the cluster coordinator, on its own or together with a Keep in-memory store."
---

[Stalwart Keep](/docs/cluster/keep/) carries cluster events as well as short-lived state, which makes it the recommended [coordinator](/docs/cluster/coordination/) for a Stalwart cluster. A cluster that already uses Keep as its [in-memory store](/docs/storage/in-memory) needs no other service.

Keep does not store events. A node that is not connected when an event is published does not receive it, but Keep numbers each subscription's events, so the node learns that it may have missed some. Stalwart responds as described in [Coordinator outages](/docs/cluster/coordination/#coordinator-outages): the node discards its caches and checks its queues.

## Configuration

Keep coordination is selected on the [Coordinator](/docs/ref/object/coordinator) object (found in the WebUI under <!-- breadcrumb:Coordinator --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" /><path d="m7 16.5-4.74-2.85" /><path d="m7 16.5 5-3" /><path d="M7 16.5v5.17" /><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" /><path d="m17 16.5-5-3" /><path d="m17 16.5 4.74-2.85" /><path d="M17 16.5v5.17" /><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" /><path d="M12 8 7.26 5.15" /><path d="m12 8 4.74-2.85" /><path d="M12 13.5V8" /></svg> Cluster › Coordinator<!-- /breadcrumb:Coordinator -->). With Keep as the in-memory store, the `Default` variant reuses its connection:

```json
{
  "@type": "Default"
}
```

The `Keep` variant opens a separate connection, and has the same fields as the Keep in-memory store. It is used when coordination should run on a different Keep deployment, or alongside another in-memory store. Even then, the in-memory store must be a shared one, because the registry refuses a coordinator while the in-memory store is the local default.

The following coordinator connects to a separate Keep cluster over TLS with raw public keys:

```json
{
  "@type": "Keep",
  "hosts": {
    "10.0.1.1:7000": true,
    "10.0.1.2:7000": true,
    "10.0.1.3:7000": true
  },
  "clusterDiscovery": true,
  "secret": {"@type": "EnvironmentVariable", "variableName": "KEEP_SECRET"},
  "tls": {
    "@type": "RawPublicKeys",
    "keyPath": "/etc/stalwart/keep/node.key",
    "serverKeysPath": "/etc/stalwart/keep/servers.pem"
  }
}
```

[Connecting Stalwart](/docs/cluster/keep/stalwart#coordinator) describes these settings and the choice of `streamMode`.
