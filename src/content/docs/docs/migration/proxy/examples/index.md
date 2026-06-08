---
sidebar_position: 1
title: "Overview"
---

The pages in this section present complete, working configurations for the three scenarios the proxy is designed for. Each is a self-contained TOML file with the surrounding context explained, and each can be adapted by substituting real hostnames, addresses, ports and certificate paths.

- [Migrating from Dovecot](/docs/migration/proxy/examples/dovecot) fronts a legacy Dovecot and Postfix stack alongside a new Stalwart server, routing per account with file mappings and using `XCLIENT` forwarding for the legacy backend.
- [Upgrading Stalwart](/docs/migration/proxy/examples/stalwart-upgrade) places an older and a newer Stalwart deployment behind the proxy, cutting accounts over one at a time and routing both mail and HTTP/JMAP traffic with PROXY protocol forwarding.
- [Cluster cache-locality routing](/docs/migration/proxy/examples/cluster) uses the proxy in front of a Stalwart cluster to pin each account to a consistent node, keeping that node's caches warm.

The general principles behind these configurations are covered under [Destinations](/docs/migration/proxy/destinations), [Listeners](/docs/migration/proxy/listeners), [Mappings](/docs/migration/proxy/mappings/) and [Routing](/docs/migration/proxy/routing/); the examples show how the pieces fit together.
