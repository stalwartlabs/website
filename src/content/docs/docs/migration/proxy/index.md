---
sidebar_position: 1
title: "Overview"
description: "What the Stalwart migration proxy does, how it routes each connection to a backend, and the example configurations for migration and cluster routing."
---

The Stalwart migration proxy is a multi-protocol mail proxy that sits in front of one or more mail servers, called backends. For each account, it decides which backend the account's connections go to. Clients keep the server name, ports and passwords they already use.

The proxy accepts IMAP, POP3, ManageSieve, SMTP submission and HTTP (including JMAP and WebDAV) sessions. For each session, it identifies the account from the credentials the client presents, looks up the destination assigned to that account, and connects the session to that backend. Inbound SMTP and LMTP carry no login, so they cannot be routed per account; they are passed through to one fixed backend.

## Purpose

The proxy serves three purposes:

- **Migrating from another mail server.** Accounts move one at a time from Dovecot, Cyrus or another IMAP, POP3 and SMTP server to Stalwart. The proxy announces the client to such a backend with the conventions that the backend understands: the XCLIENT extension of Postfix and Dovecot, and the IMAP `ID` command. The backend therefore still records the client's address.
- **Migrating from one Stalwart server to another.** Two Stalwart servers run side by side behind the proxy, and accounts move one at a time. The proxy reads the account name from Stalwart's OAuth bearer tokens, so it can route HTTP and JMAP traffic, including WebSocket connections, together with the mail protocols.
- **Account-to-node routing in a cluster.** A Stalwart [cluster](/docs/cluster/) needs no proxy, and any node can serve any account. A node serves an account more efficiently, though, when the account's data is already in that node's caches. A proxy that sends each account to the same node keeps those caches warm.

The [migration guide](/docs/migration/guide/) describes the complete procedure in which the proxy is used for a migration.

## Connection routing

The proxy cannot know where to send a session until the client has identified itself, so it conducts the beginning of each session on its own. It sends the greeting, advertises capabilities, negotiates STARTTLS where applicable, and reads the client's authentication command.

From the credentials, the proxy derives a routing identifier, usually the login name or the address carried in an OAuth token. It looks the identifier up in a mapping store, and caches the result in memory, so that repeated connections for the same account do not reach the store. The lookup returns a destination. An account without a mapping goes to the default destination.

The proxy then connects to the destination. It can start the connection with a PROXY protocol header, or announce the client with XCLIENT or IMAP `ID`, and it then replays the client's authentication. When the backend accepts it, the two connections are joined, and the session continues between client and backend.

The proxy does not verify credentials itself, does not authenticate to the backend on the client's behalf, and never stores passwords. By default, it also refuses to send credentials to a backend over an unencrypted connection.

The proxy's configuration is a TOML file. This format belongs to the proxy alone: Stalwart itself is configured through objects, and the TOML examples in this section apply only to the proxy.

## Examples

The examples section contains a complete configuration for each of the three purposes, and explains the decisions around it:

- [Migrating from Dovecot](/docs/migration/proxy/examples/dovecot) puts the proxy in front of a Dovecot and Postfix stack and a new Stalwart server, routes per account with a mapping file, and announces clients to the Dovecot and Postfix backend with XCLIENT.
- [Migrating between Stalwart servers](/docs/migration/proxy/examples/stalwart) puts the proxy in front of an existing Stalwart server and a new one, routes the mail protocols and HTTP per account, and announces clients to both with the PROXY protocol.
- [Cluster routing](/docs/migration/proxy/examples/cluster) puts the proxy in front of a Stalwart cluster and assigns each account to a node.

The configuration elements used in the examples are described under [Destinations](/docs/migration/proxy/destinations), [Listeners](/docs/migration/proxy/listeners), [Mappings](/docs/migration/proxy/mappings/) and [Routing](/docs/migration/proxy/routing/).
