---
sidebar_position: 4
title: "Cluster routing"
description: "Proxy configuration that assigns each account of a Stalwart cluster to one node, so that the node's caches for the account stay warm."
---

This example uses the proxy as a permanent router in front of a [Stalwart cluster](/docs/cluster/), not for a migration.

A Stalwart cluster needs no proxy, and any node can serve any account. A node serves an account more efficiently, however, when the account's data is already in that node's caches. The caches stay warm only when the account keeps reaching the same node. A proxy in front of the cluster that assigns each account to one node provides that.

Here, the mapping is a lasting assignment of accounts to nodes, not a record of a migration in progress. A shared mapping store lets several proxies in front of the cluster use the same assignment. This example uses a SQL store; a Redis store works the same way.

All nodes are configured alike, apart from their addresses. All are announced with the PROXY protocol, so that each node records the client's address.

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
port = 465
tls = "implicit"
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
port = 465
tls = "implicit"
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
port = 465
tls = "implicit"
[destination.node3.protocol.http]
port = 443
tls = "implicit"

[[http.route]]
match = "/**"
extract = { from = "authorization" }
fallback = "node1"

[listener.imap]
protocol = "imap"
bind = ["[::]:993"]
tls = "implicit"
[listener.submission]
protocol = "submission"
bind = ["[::]:587"]
tls = "starttls"
[listener.https]
protocol = "http"
bind = ["[::]:443"]
tls = "implicit"
forwarded = "off"

[admin]
bind = "127.0.0.1:9443"
tls = "implicit"
bearer_token_file = "/etc/proxy/admin.token"
```

Requests that identify no account, and accounts without an assignment, go to `node1`, which is both the default destination and the HTTP route's fallback.

The example declares only IMAP, submission and HTTP; other protocols are added the same way. Submission reaches the nodes on port 465 with implicit TLS, because Stalwart has no submission listener on port 587 by default. The proxy, meanwhile, accepts submission from clients on port 587.

## Assigning accounts to nodes

The `account_nodes` table holds the assignment of each account to a node. Whatever process provisions accounts also fills the table. A new account is assigned by inserting a row, which the proxy reads on the account's first connection and then caches.

The assignment changes rarely, so the example caches it for `30m`, longer than in a migration. Once an account is active, the store is therefore read rarely.

Draining a node for maintenance takes three steps:

1. Reassign its accounts, by updating their rows.
2. Invalidate the affected cache entries, or the whole cache, through the [management API](/docs/migration/proxy/management/cache). New connections then reach the new node.
3. Move open sessions with `POST /connections/kick`.

Several proxies can share the same table and route consistently, each with its own cache.

## Effect on cache locality

With this configuration, every connection of an account reaches the same node for as long as its assignment holds. That node's caches for the account therefore remain filled between connections.

The proxy's own cache hit rate, reported by `GET /stats`, shows that the mapping lookups stay off the hot path. Accounts can be rebalanced at any time by changing the table, without changing the clients.
