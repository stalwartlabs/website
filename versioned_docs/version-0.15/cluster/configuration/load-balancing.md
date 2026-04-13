---
sidebar_position: 4
---

# Load Balancing

By default, Stalwart automatically assigns the server hostname based on the underlying system's hostname during installation. This hostname is used in protocol responses, logging, and internal identification. However, when Stalwart is deployed behind a **load balancer**, it's important that all backend nodes use a **consistent hostname** that matches the public-facing identity of the service. This ensures uniformity in client communications and protocol-level interactions, particularly for protocols like SMTP, which expose the server’s hostname during the handshake.

For example, if you have three Stalwart nodes—`mx1.example.org`, `mx2.example.org`, and `mx3.example.org`—behind a load balancer that publicly serves mail as `mx.example.org`, then each node should override its hostname using the `server.hostname` setting:

```toml
[server]
hostname = "mx.example.org"
```

This ensures that all nodes respond with the same hostname (`mx.example.org`), maintaining consistency for clients and avoiding potential confusion or misidentification.

Failing to configure this correctly may result in inconsistencies in SMTP banners, TLS certificates, and protocol-level responses, especially when multiple backend nodes serve the same clients in a round-robin or failover configuration.

