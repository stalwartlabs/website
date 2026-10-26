---
sidebar_position: 3
title: "Testing Stalwart"
description: "How Stalwart is tested before release: unit and integration suites across every storage backend, third-party compliance suites, fuzzing, and long-running stress tests and benchmarks on dedicated hardware."
---

Administrators who run Stalwart in production want to know how a release is validated before it reaches them. Stalwart Labs tests the server with a private test suite, and separately with a benchmarking and stress testing programme. This page describes what both of them cover.

The tests themselves are not published. A build of the public source therefore cannot be checked with them.

## Private test suites

The test suites are kept in a private repository, for a specific reason. A complete test suite gives an automated code generator a way to check a reimplementation against every behaviour the original was built to handle. With it, a verified copy of the server could be produced under different license terms with little effort. Keeping the tests private removes that shortcut.

The decision changes nothing about the software itself. The source code of every release remains public, under the AGPL-3.0 license. The public repository builds on its own, as described in [Compiling Stalwart](/docs/development/compile). Bug fixes still receive regression tests, in the private suite. [Protecting Stalwart](/blog/protecting-stalwart) explains the reasoning behind the decision in more detail.

## Unit tests

Unit tests check components in isolation. Every crate of the server has its own, and there are more than 5,000 in total. They cover the protocol parsers for IMAP, JMAP, SMTP, WebDAV and SCIM, the iCalendar and vCard library, the Sieve interpreter, the spam filter and its text processing, document text extraction, the data store layer and the configuration registry. Tests that depend on a particular storage engine run once for each backend that supports them.

## Integration tests

Integration tests check the behaviour that an administrator or a user observes. They start complete server instances and talk to them over the network, as real clients do. The suite contains several hundred test scenarios, grouped by area:

- SMTP: inbound sessions, authentication, DKIM, DKIM2, ARC, SPF and DMARC verification and signing, Sieve and milter filtering, throttling and limits; outbound delivery with DANE, MTA-STS and TLS; the queue; and DMARC and TLS reporting.
- JMAP: mail, mailboxes, threads, submission, vacation responses, sharing, quotas, contacts, calendars, file storage and object metadata.
- IMAP, POP3 and ManageSieve, including CONDSTORE and QRESYNC, IDLE, ACLs and the IMAP4rev2 extensions.
- WebDAV, CalDAV and CardDAV: collections, properties, locking, synchronisation, access control, calendar queries, alarms and iTIP scheduling.
- Accounts and administration: directories (LDAP, SQL and OpenID Connect), authentication and authorisation, multi-tenancy and tenant isolation, SCIM provisioning, quotas, encryption at rest, archiving, purging and background tasks.
- Automation: ACME certificate issuance, DKIM key management and dynamic DNS updates.
- Storage, caching, clustering and telemetry.

Every external service that a test needs runs in a container started by the suite, so each run begins from a clean state.

The suite runs across the storage options as well. It runs against each data store backend (RocksDB, SQLite, PostgreSQL, MySQL and FoundationDB), against the S3, file system and Azure blob stores, and against Redis in standalone, cluster and Sentinel deployments. S3 compatibility is checked against several S3 implementations, including a simulated service that injects errors, truncated responses and stalls. Cluster tests run several nodes over a shared store and coordinator, to check cache invalidation and change notification between nodes.

A test that fails intermittently is treated as a bug to be fixed. It is not retried until it passes.

## Compliance and interoperability

Third-party suites and services check that Stalwart behaves as other implementations expect:

- Dovecot's [ImapTest](https://www.imapwiki.org/ImapTest) checks IMAP4rev1 and IMAP4rev2 compliance.
- [Litmus](https://github.com/notroj/litmus) checks WebDAV compliance.
- An independent SCIM conformance checker tests the SCIM 2.0 endpoint.
- Sign-in through OpenID Connect is tested against Keycloak, Authelia, Authentik, Kanidm, Pocket ID, Rauthy and Zitadel.
- ACME issuance is tested against Pebble, the test server of Let's Encrypt, and dynamic DNS updates against PowerDNS.

## Fuzzing

Fuzzing feeds a parser large amounts of generated, malformed input to find the cases that crash it or make it misbehave. Stalwart fuzzes the parsers that read untrusted input. These are the IMAP and SMTP command parsers, the parsers of DMARC, TLS and ARF reports, of iCalendar and vCard data, of JSON and JMAP requests, and of WebDAV XML. They also include the text extractors for PDF, office documents and archives, and the spam filter's HTML handling and text normalisation. Fuzzing campaigns run on dedicated cloud machines.

## Stress testing and benchmarking

Functional tests show that the server does the right thing. They do not show how it behaves under load, with very large mailboxes or after hours of continuous use. That is the purpose of a separate benchmarking programme, which has consumed thousands of machine-hours on dedicated cloud hardware.

The programme works in cycles. Each cycle benchmarks a fixed commit of the server, and files every regression and defect found. The next cycle benchmarks the fixes again, against the results of the previous one. Measurements are taken on the release build, so the figures describe the binary that is shipped.

The benchmarks run on RocksDB, PostgreSQL and FoundationDB, with Redis as the in-memory store where a scenario needs it. The server, the database and the load generators run on separate machines. The test network is closed: it has its own DNS servers, certificate authority and receiving mail servers, so no message leaves it. The scenarios cover:

- Protocol throughput and latency: every common IMAP, JMAP, WebDAV and SMTP operation at saturation and at fixed fractions of capacity, on a dataset of 500 accounts holding 1.6 million messages and 750,000 calendar, contact and file items.
- Very large mailboxes: accounts holding up to 5 million messages, and datasets of 8 million messages in total.
- Large collections: calendars, address books and file trees with up to a million items each.
- Mail transfer: inbound and outbound throughput, relaying, local delivery, queues grown to 10 million messages, retry and bounce storms, and the cost of spam filtering by message size.
- Connections and authentication: connection and TLS handshake storms, thousands of idle connections, slow clients, repeated and failed sign-ins, rate limits and directory lookups.
- Push notifications: IMAP IDLE, EventSource and WebSocket clients, with up to a thousand subscribers on a single account.
- Ingestion and search: bulk imports, full-text indexing, attachment text extraction and attachments of up to 100 MB.
- Hostile input: oversized, malformed and deliberately expensive requests at the protocol limits, to confirm that they are rejected or bounded.
- Caching: a cache budget smaller than the working set, and recovery of the cache after a restart or an abrupt kill of the process.
- Administration: purges, deletion of accounts holding millions of messages, report processing and task and queue listings.
- Clusters: several nodes sharing a data store and an in-memory store under mixed load.
- Endurance: runs of six hours or more under mixed protocol load, sustained mail transfer and repeated configuration reloads, with memory profiled throughout to detect leaks and fragmentation.

Each run records throughput, latency percentiles, CPU time per operation, memory use and the number of database round trips per operation, together with CPU profiles of the server. To keep noise out of the results, a change in performance has to reproduce across repeated runs before it is filed, and differences within measurement noise are not reported as changes.
