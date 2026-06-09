---
sidebar_position: 1
title: "Overview"
---

This guide describes how to migrate a running Stalwart deployment of version 0.15 or below to the latest release. The releases that followed 0.15 introduced extensive changes to the configuration model, the storage layout and the administration interfaces, which makes an in-place upgrade across that boundary impractical for a populated server. Instead, the migration runs the old deployment and a new deployment side by side and moves accounts from one to the other gradually, so that the change can be verified account by account and reversed at any point before it is finalized.

The migration is built around two tools. The [migration proxy](/docs/migration/proxy/) sits in front of both deployments and decides, from the credentials each client already presents, which deployment currently holds a given account. Because the routing decision is made from the login itself, clients keep the same hostname, ports and passwords throughout the migration and require no reconfiguration. [Vandelay](/docs/migration/import-export/) is the data mover: it reads an account from the old deployment into a local archive and writes that archive onto the new deployment, one account at a time.

## How the migration is structured

The new deployment becomes the public mail exchanger for the entire duration of the migration. All inbound mail on port 25 is delivered to the new server, which performs split delivery: a message for an account that has already been moved is delivered locally, while a message for an account that still lives on the old server is relayed there. This arrangement means that mail never has to be re-pointed mid-migration. The new server is the single front door from the moment the proxy goes live, and the relay quietly fills the gap for accounts that have not been moved yet.

Interactive sessions, by contrast, are routed per account. IMAP, POP3, ManageSieve, SMTP submission and JMAP connections are resolved through a mapping table: an account with no entry resolves to the old deployment, and an account that has been migrated resolves to the new one. Moving an account is therefore a matter of copying its data and then flipping a single mapping entry, after which that account's clients follow to the new server on their next connection.

Because migration is a copy rather than a move, the old deployment retains a complete copy of every account until it is decommissioned. This is what makes the process reversible: until an account accumulates new data on the new server, rolling it back is simply a matter of routing it to the old deployment again.

## The steps

The migration proceeds through the following stages, each documented on its own page.

The process begins with [preparation](/docs/migration/guide/preparation/), which installs the new Stalwart deployment, the command-line interface, the migration proxy and Vandelay. It continues with [configuring the new deployment](/docs/migration/guide/configure-new/) for its role as the split-delivery front, [configuring the proxy](/docs/migration/guide/configure-proxy/) to route between the two servers, and [configuring the old deployment](/docs/migration/guide/configure-old/) to accept the proxy and the relay. With everything in place, [starting the proxy](/docs/migration/guide/cutover/) brings the combined system online with every account still served from the old deployment, and provides the tests that confirm each protocol works before any account is moved. [Migrating accounts](/docs/migration/guide/migrate-accounts/) then covers the end-to-end move of a single account, including validation and rollback, and is repeated for every account. Once the old deployment is empty, [finalizing the migration](/docs/migration/guide/finalize/) removes the proxy and lets the new deployment answer clients directly. A [troubleshooting](/docs/migration/guide/troubleshooting/) reference collects the problems most likely to arise along the way.

## Downtime

The preparatory stages carry no downtime. Installing the new deployment, configuring it, configuring the proxy and preparing the old deployment all happen alongside the live server without affecting it, because none of these actions change the path that existing clients take to reach their mailboxes. The configuration changes applied to the old deployment do not take effect until its configuration is reloaded, which is deliberately deferred to the cutover.

A short interruption occurs at the cutover, when the old server is reloaded and the proxy takes over the public ports. From that point clients connect to the proxy rather than to the old server directly. The interruption lasts only as long as it takes to reload the old server and start the proxy, and once the proxy is live every account continues to be served from the old deployment exactly as before. Migrating individual accounts after that introduces no further downtime: each account is briefly disconnected when its mapping is flipped and reconnects to the new deployment automatically.

## A note on account names

Stalwart releases after 0.15 require account names to be full e-mail addresses. An account that was addressed on the old server by a bare local part, such as `alice`, becomes `alice@example.org` on the new server, where `example.org` is the account's domain. Clients that signed in with a bare account name will need to sign in with the full e-mail address once their account has been migrated. The proxy can be told to accept both login forms during the transition, which is described in the steps that follow.
