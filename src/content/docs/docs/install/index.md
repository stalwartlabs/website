---
sidebar_position: 1
title: "Overview"
description: "The path from a new host to a Stalwart server that sends and receives mail: requirements, installation for each platform, securing the server and the next steps."
---

Stalwart is a mail and collaboration server. It stores the mail, calendars, contacts and files of its users, and gives their clients access to all of them over standard internet protocols. The first of these protocols is [JMAP](/docs/http/jmap/), an HTTP-based protocol that exchanges JSON. Through a single API it gives a client access to every kind of data the server holds: mail and mailboxes, Sieve filters, calendars, contacts and files. Clients that do not use JMAP connect through the established protocols, which Stalwart serves alongside it: IMAP and POP3 for reading mail, SMTP for submitting mail and exchanging it with other mail servers, ManageSieve for managing filter scripts, CalDAV and CardDAV for calendars and contacts, and WebDAV for files.

The server is a single binary written in Rust. Every protocol runs in the same process and works with the same accounts and the same stored data, so a message that a phone moves to a folder over IMAP appears in that folder in a JMAP client as well, and each account signs in to every protocol with the same credentials. The accounts come from Stalwart's own directory or from an existing LDAP server, SQL database or OpenID Connect identity provider.

Some functions of a mail system are built into the server as well. A spam and phishing filter checks incoming mail with a set of rules, a statistical classifier, DNS blocklists and greylisting, and the server obtains and renews its TLS certificates through ACME. The data lives by default in RocksDB, a database embedded in the server that keeps its files on the local disk and needs no other service. Other backends can take its place: FoundationDB, PostgreSQL, MySQL or SQLite for the data, S3-compatible or Azure object storage for message contents, and Redis for short-lived data. With shared storage, several Stalwart servers form a [cluster](/docs/cluster/) that serves the same accounts, coordinated through Kafka, NATS or Redis.

This section sets up such a server from the beginning, with the defaults that suit a single machine. It starts with a new host and ends with a single Stalwart server that sends and receives mail for one domain, which a mail client can use and which other mail providers trust. It then covers the steps that prepare that server for production use and points to the parts of the documentation that a growing deployment needs next.

## Installation process

A new Stalwart server has no configuration, so it cannot start its mail services straight away. At its first start it finds no configuration file and enters [bootstrap mode](/docs/configuration/bootstrap-mode): it opens a single plain HTTP port, 8080, and serves only the setup wizard there. The server prints a temporary administrator password to its output, and the administrator signs in to the wizard with it.

The setup wizard is a short form in the WebUI, the server's web interface. It asks for the server hostname and the first mail domain, and offers defaults for everything else: where the data is stored, where accounts come from, where the log goes and how the DNS records are published. When the form is submitted, the wizard writes the configuration file and, when accounts are kept in Stalwart itself, creates a permanent administrator account.

The server reads the new configuration when it restarts. From then on it runs normally: it opens the mail ports and HTTPS on port 443, requests a TLS certificate from Let's Encrypt, and serves the WebUI at `https://<hostname>/admin`. The rest of the installation takes place there. The administrator publishes the DNS records that the server has computed for the domain, so that other mail servers can find it and trust its mail, creates a user account and confirms with a test message that mail flows in both directions.

## Steps from host to production

The section is meant to be read in order:

1. Check the [system requirements](/docs/install/requirements). A mail server depends on its network more than on its hardware, and however well the server is configured, a blocked port 25 stops mail delivery and a missing reverse DNS record makes many receivers reject or downgrade its mail. The requirements are therefore worth confirming with the hosting provider before anything is installed.
2. Follow the installation tutorial for the platform. Each tutorial takes the server through the whole setup in eight steps: installing the server, opening and completing the setup wizard, restarting, signing in to the WebUI, publishing the DNS records, creating a user account and sending a test message. Every step states the result to expect and the problems that most often occur at that point.
3. [Secure the server](/docs/install/security). Some protections depend on how the server is deployed, for example which listeners it needs, so they cannot be active by default and have to be set before the server is used in production.
4. Continue with the [next steps](/docs/install/next-steps): further domains and accounts, mail clients, backups and the options that a first installation leaves at their defaults.

## Choosing a platform

Stalwart installs in the same way on every platform, and the tutorials differ only in how the server is installed, started and restarted:

| Platform | Method | Tutorial |
|---|---|---|
| Linux (x86_64, aarch64, ARMv7, ARMv6), macOS (Apple silicon and Intel), FreeBSD (x86_64) | Installation script and a service of the host's service manager | [Linux, macOS and FreeBSD](/docs/install/platform/linux) |
| Any host with Docker or another OCI runtime | Container image | [Docker](/docs/install/platform/docker) |
| Windows (x86_64) | Binary run as a service under NSSM | [Windows](/docs/install/platform/windows) |

The tutorials use the defaults of the setup wizard, which suit a single server: all data in a local database, accounts managed in Stalwart, and DNS records published by hand. Deployments that need other storage, an existing identity system, several nodes or an automated installation start from the same tutorials and change the relevant choices. [Next steps](/docs/install/next-steps#options-left-at-their-defaults) lists where each option is described.

## Installation problems

Each tutorial describes the frequent problems of the installation at the step where they occur, with the exact error text. [Troubleshooting installation](/docs/install/troubleshooting) lists them by symptom, for a reader who has an error message but does not know which step caused it, and describes the rarer ones in full.
