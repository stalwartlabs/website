---
sidebar_position: 1
title: "Overview"
---

The Stalwart migration proxy is a multi-protocol e-mail proxy that sits in front of one or more mail backends and decides, on a per-account basis, which backend a given connection belongs to. It terminates IMAP, POP3, ManageSieve, SMTP submission, SMTP/LMTP and HTTP (JMAP) sessions, identifies the account behind each connection, looks up the destination that account has been assigned to, and then bridges the session to that backend. Because the decision is made from the credentials the client already presents, no client reconfiguration is required: existing users keep the same server name, ports and passwords while the proxy quietly routes them to the correct system.

## Purpose

Migrating a populated mail server is rarely instantaneous. Mailboxes are copied in batches, and during the transition some accounts live on the old system while others have already been moved to the new one. The proxy makes that split invisible to clients. A single hostname continues to answer on the familiar ports, and the proxy consults a mapping table to send each account to whichever backend currently holds its data. As mailboxes are migrated, their entries in the mapping table are flipped from the old destination to the new one, and the corresponding clients follow without noticing.

The same mechanism serves three distinct purposes:

- **Migrating from legacy servers.** Accounts can be moved from Dovecot, Cyrus or any other IMAP/POP3/SMTP server onto Stalwart gradually. The proxy speaks to legacy backends using the conventions they expect, including the Dovecot and Postfix `XCLIENT` extension and the IMAP `ID` command, so the backend still sees the real client address rather than the proxy's.
- **Migrating between Stalwart versions.** An older Stalwart deployment and a newer one can run side by side behind the proxy, with accounts cut over one at a time. The proxy understands Stalwart's OAuth bearer tokens and routes HTTP/JMAP traffic, including WebSocket connections, alongside the classic mail protocols.
- **Cache-locality routing in a cluster.** Stalwart does not require a proxy or an external directory to run, and it can operate as a cluster without one. A proxy is nonetheless useful in front of a cluster because it can pin each account to a consistent node. Sending the same account to the same node on every connection keeps that node's in-memory caches warm for that account, which improves overall efficiency.

## Operating model

Every connection follows the same path. The proxy first completes the protocol's pre-authentication dialogue itself: it presents a greeting, advertises capabilities, negotiates STARTTLS where applicable, and accepts the client's authentication command. From the credentials it extracts a routing identifier, typically the login name or the e-mail address inside an OAuth token. That identifier is normalized and looked up in a mapping store, with results cached in memory so that repeated connections for the same account resolve without touching the store. The lookup yields a destination, and if the account has no explicit mapping the proxy falls back to a configurable default destination.

Once the destination is known, the proxy opens a connection to that backend, optionally prefixed with a PROXY protocol header or annotated with `XCLIENT` and `ID` metadata so the backend can attribute the session to the real client. It replays the authentication the client supplied, and if the backend accepts it the two streams are spliced together and the session proceeds normally. The client's credentials are forwarded to the backend over an encrypted leg; the proxy never authenticates the backend on the client's behalf and never persists passwords.

