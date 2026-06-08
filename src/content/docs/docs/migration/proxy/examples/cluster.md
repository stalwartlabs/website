---
sidebar_position: 4
title: "Cluster cache-locality routing"
---

This example uses the proxy not for migration but as a steady-state router in front of a Stalwart cluster. Stalwart does not require a proxy to form or run a cluster; any node can serve any account. A node serves an account most efficiently, however, when that account's data and metadata are already in its caches, and caches stay warm only when the same account keeps landing on the same node. Placing the proxy in front of the cluster and pinning each account to a consistent node achieves exactly that, turning what would otherwise be a scattered access pattern into a localized one.

Unlike the migration scenarios, the mapping here is not a transient cutover table but a durable assignment of accounts to nodes. A shared mapping store is a natural fit, so that several proxy instances in front of the cluster agree on the assignment; this example uses a SQL store, though Redis works equally well. Because all nodes are identical Stalwart instances, every destination is configured the same way apart from its address, and all use PROXY protocol forwarding so that each node sees the real client address.

## Configuration

```toml
[server]
hostname = "mail.example.com"

[tls.certificate.default]
cert = "/etc/proxy/tls/fullchain.pem"
key = "/etc/proxy/tls/privkey.pem"
default = true

[mapping]
source = "sql"
normalize = "lowercase"
positive_ttl = "30m"

[mapping.sql]
url = "postgres://proxy:secret@10.0.3.2/cluster"
query = "SELECT node FROM account_nodes WHERE identifier = $1"
upsert_query = "INSERT INTO account_nodes (identifier, node) VALUES ($1, $2) ON CONFLICT (identifier) DO UPDATE SET node = excluded.node"
delete_query = "DELETE FROM account_nodes WHERE identifier = $1"

[routing]
default_destination = "node1"

[destination.node1]
host = "10.0.1.11"
tls_server_name = "node1.example.com"
proxy_protocol = true
forwarding = "proxy"
forwarded = true
[destination.node1.protocol.imap]
port = 993
tls = "implicit"
[destination.node1.protocol.submission]
port = 587
tls = "starttls"
[destination.node1.protocol.http]
port = 443
tls = "implicit"

[destination.node2]
host = "10.0.1.12"
tls_server_name = "node2.example.com"
proxy_protocol = true
forwarding = "proxy"
forwarded = true
[destination.node2.protocol.imap]
port = 993
tls = "implicit"
[destination.node2.protocol.submission]
port = 587
tls = "starttls"
[destination.node2.protocol.http]
port = 443
tls = "implicit"

[destination.node3]
host = "10.0.1.13"
tls_server_name = "node3.example.com"
proxy_protocol = true
forwarding = "proxy"
forwarded = true
[destination.node3.protocol.imap]
port = 993
tls = "implicit"
[destination.node3.protocol.submission]
port = 587
tls = "starttls"
[destination.node3.protocol.http]
port = 443
tls = "implicit"

[[http.route]]
match = "/**"
extract = { from = "authorization" }
fallback = "default"

[listener.imap]
protocol = "imap"
bind = ["0.0.0.0:993", "[::]:993"]
tls = "implicit"
[listener.submission]
protocol = "submission"
bind = ["0.0.0.0:587", "[::]:587"]
tls = "starttls"
[listener.https]
protocol = "http"
bind = ["0.0.0.0:443", "[::]:443"]
tls = "implicit"
forwarded = "off"

[admin]
bind = "127.0.0.1:9443"
tls = "implicit"
bearer_token_file = "/etc/proxy/admin.token"
```

## Assigning accounts to nodes

The `account_nodes` table holds the authoritative assignment of each account to a cluster node, and is populated by whatever process owns account provisioning. A new account is assigned to a node by inserting a row, which the proxy reads on the account's first connection and caches thereafter. Because the assignment is durable, the positive cache lifetime is set higher than in a migration scenario (`30m` here), so the store is consulted rarely once an account is active.

When a node is drained for maintenance, the accounts assigned to it are reassigned to other nodes by updating their rows; invalidating the affected entries (or the whole cache) makes the change take effect on the next connection. Several proxy instances may share the same `account_nodes` table, in which case they route consistently, and each maintains its own local cache.

## Effect on locality

With this in place, every connection for a given account is routed to the same node for as long as its assignment holds, so that node's caches for that account remain populated across connections. The proxy's own cache hit rate, visible through `GET /stats`, confirms that the routing layer itself stays off the hot path; the benefit to the cluster is the improved locality of access on each node. The accounts can be rebalanced at any time by editing the assignment table, without reconfiguring clients.
