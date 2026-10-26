---
title: "FAQ"
description: "Frequently asked questions about Stalwart, grouped by topic, each answered briefly with a link to the page that holds the full answer."
sidebar_position: 1
---

These pages answer the questions that administrators ask most often about installing and running Stalwart. Each answer states the fact that resolves most cases and links to the page that describes the mechanism in full. Problems that need a diagnosis, such as mail that is not delivered or a sign-in that fails, are collected by symptom in [Troubleshooting](/docs/management/troubleshoot).

## Most asked

- [Why do I see the setup wizard again after a restart or upgrade?](/docs/faq/installation#why-do-i-see-the-setup-wizard-again-after-a-restart-or-upgrade)
- [Why are connections closed with no reply and nothing in the logs?](/docs/faq/networking#why-are-connections-closed-with-no-reply-and-nothing-in-the-logs)
- [My reverse proxy's IP keeps getting banned. What do I do?](/docs/faq/networking#my-reverse-proxys-ip-keeps-getting-banned-what-do-i-do)
- [Which URL do I open: `/admin`, `/account` or `/login`?](/docs/faq/installation#which-url-do-i-open-admin-account-or-login)
- [Why does `/admin` return 404?](/docs/faq/installation#why-does-admin-return-404)
- [How do I add an alias, a catch-all or plus addressing?](/docs/faq/accounts#how-do-i-add-an-alias-a-catch-all-or-plus-addressing)
- [How do I back up Stalwart?](/docs/faq/operations#how-do-i-back-up-stalwart)
- [I deleted mail but disk usage did not drop. Why?](/docs/faq/operations#i-deleted-mail-but-disk-usage-did-not-drop-why)
- [Can I sign in to the WebUI with Keycloak, Authentik or another OIDC provider?](/docs/faq/sign-in#can-i-sign-in-to-the-webui-with-keycloak-authentik-or-another-oidc-provider)
- [Why is my outgoing mail not DKIM-signed?](/docs/faq/mail#why-is-my-outgoing-mail-not-dkim-signed)
- [Which Sieve features work in system scripts and which in user scripts?](/docs/faq/mail#which-sieve-features-work-in-system-scripts-and-which-in-user-scripts)
- [Automatic DNS fails with my provider. What should I check?](/docs/faq/networking#automatic-dns-fails-with-my-provider-what-should-i-check)

## Browse by topic

- [Installation and the WebUI](/docs/faq/installation): hardware, the setup wizard, containers and service managers, the data store, recovery access, WebUI URLs and sign-in.
- [Accounts, domains and addresses](/docs/faq/accounts): domain names, aliases, catch-all and plus addressing, sending as another address, suspending and administering accounts.
- [Sign-in, directories and API access](/docs/faq/sign-in): LDAP, SQL and OpenID Connect directories, single sign-on, OAuth in mail clients, two-factor authentication, app passwords and API keys.
- [TLS, DNS, proxies and bans](/docs/faq/networking): certificates, automatic DNS, automatic IP bans, reverse proxies, listeners and client autoconfiguration.
- [Mail delivery, spam and Sieve](/docs/faq/mail): smart hosts and routing, DKIM and DMARC, the spam filter, greylisting and Sieve scripts.
- [Storage, backup, logs and clusters](/docs/faq/operations): backups, disk space, backends, memory, search indexing, logs, alerts and clusters.
- [Calendars, contacts and clients](/docs/faq/collaboration): client setup, CalDAV and CardDAV addresses, invitations and exports.
- [Licensing, migration and limits](/docs/faq/licensing): the Enterprise license, upgrading, migrating from other servers and features that are not supported.

## General

### Is Stalwart ready for production?

Yes. Version 1.0 is a stable release, and the 1.x series follows rules about what each kind of release may change. Patch releases contain only fixes. Minor releases may add settings or change defaults. Only a major release may change the data format or remove settings.

Even so, back up the data stores and `config.json` before every minor or major upgrade. A newer release can write data that an older release cannot read, which means that after an upgrade the older release may no longer be able to open the data. See [Release types](/docs/install/upgrade#release-types).

### Where is my data stored?

Stalwart divides its data among four stores, each suited to one kind of data:

- The data store holds accounts, mailboxes, message metadata, configuration and other structured records.
- The blob store holds the raw messages with their attachments and other large objects.
- The search store holds the full-text index.
- The in-memory store holds short-lived data such as rate-limit counters.

Only one small file lives on the local disk: `config.json`. It names the data store and nothing else, because every other setting is a configuration object stored in the data store itself. See [Storage](/docs/storage/) and [Configuration file](/docs/configuration/#configuration-file).

### Is my data safe?

Stalwart keeps its data in established database and storage systems, such as RocksDB, PostgreSQL, MySQL, FoundationDB or S3-compatible object storage, chosen separately for each store.

The server does not take backups itself, and two things that may look like backups are not. Copying the files of a running data store is not a backup. The built-in export is an offline dump of a stopped server, intended for moving between backends. Back up each store with the tools of its backend instead. See [Backup and restore](/docs/management/maintenance/backup).

### Does Stalwart still use TOML configuration files?

No. Settings are now configuration objects stored in the data store. They are edited in the WebUI, with the command-line interface or through the JMAP management API. The only local file, `config.json`, says where the data store is and nothing else, because every other setting is stored there. See [Configuration](/docs/configuration/).

### How many users can one installation handle?

No measured figure of users per node is published. A single server grows with its hardware, and beyond that, Stalwart scales out: the data moves to a shared external data store, and a cluster of up to 512 nodes serves it.

For planning, the sizing pages give estimates per connection and per login, labelled as estimates. An IMAP session waiting in IDLE, for example, takes about 70 KB of memory. See [Sizing](/docs/cluster/deployment/sizing) and [Sizing memory](/docs/performance/memory).

### Can messages be encrypted at rest?

Yes, per account. A user registers an OpenPGP public key or an S/MIME certificate and enables encryption at rest. From then on, the server encrypts each incoming message with that key before it stores the message.

The matching private key never reaches the server, so only its holder can read the contents of those messages. The encryption covers the contents only: header fields such as the sender, the recipients and the subject remain readable. See [Encryption at rest](/docs/encryption/#scope-of-protection).
