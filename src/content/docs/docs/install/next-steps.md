---
sidebar_position: 5
title: "Next steps"
description: "What to do after the installation tutorial and the security checklist: domains, accounts, clients, backups, upgrades, and where the options left at their defaults are described."
---

After the installation tutorial and [Securing the server](/docs/install/security), the server sends and receives mail for one domain and has one user account. That is a working mail server, but not yet the service that its users need: they have more addresses, more devices and more data, and the server has to stay current, backed up and observed for as long as it runs.

This page lists the tasks that usually follow, in roughly the order a new deployment meets them, and points to the pages that describe the choices the tutorial left at their defaults.

## Add domains and accounts

The administrator adds further domains in the WebUI, and each needs the same DNS records as the first one. [Domains](/docs/domains/) describes the procedure, and the domain's zone file lists the records as in Step 6 of the tutorial. With the internal directory, accounts are created in the WebUI or with the [CLI](/docs/management/cli/), as described in [Managing accounts](/docs/auth/accounts/manage). [Addresses and aliases](/docs/domains/addresses) explains how further addresses are assigned to an account.

## Set up the users' clients

[Setting up clients](/docs/server/clients) lists the server settings that mail, calendar and contacts clients need, and how clients find them automatically through the DNS records published in Step 6.

## Back up the server

Back up the data store and `config.json`, which contains the location of the data store, as described in [Backup and restore](/docs/management/maintenance/backup). The backup is also the only way back if an upgrade has to be reverted.

## Keep the server current

[Upgrading](/docs/install/upgrade) describes the release types and how to install a newer 1.x release on each platform. Existing mailboxes from another server or a hosted service are moved as described in [Migrating from another system](/docs/install/migrate).

## Watch the server

The log goes to the destination chosen in the wizard. [Tracing](/docs/telemetry/tracing/) describes the log destinations and levels, and [Telemetry](/docs/telemetry/) the metrics and alerts. [Troubleshooting](/docs/management/troubleshoot) lists the tools that explain a rejected message or a failed sign-in.

## Options left at their defaults

The tutorial uses the defaults that suit a single server. A deployment with other needs changes some of them, and each of the following options has its own page:

- Storage: PostgreSQL, MySQL, SQLite or FoundationDB as the data store, object storage for messages and attachments, and a separate search engine, in [Choosing a database](/docs/install/store)
- Directory: accounts from LDAP, an SQL database or an OpenID Connect identity provider, in [Choosing a directory](/docs/install/directory)
- Automatic DNS management, when the wizard left the domain on manual management: the server publishes and updates the domain's records through the API of the DNS provider, in [Automatic DNS records](/docs/domains/dns-records)
- Certificates: other ACME challenges and providers, or certificates installed by hand, in [TLS certificates](/docs/domains/tls-certificates)
- Transport security for incoming mail: an MTA-STS policy and DANE, in [Publishing an MTA-STS policy](/docs/domains/mta-sts) and [DANE](/docs/mta/transport-security/dane)
- Reverse proxy: running the server behind NGINX, Caddy, Traefik or HAProxy, in [Reverse proxy](/docs/server/reverse-proxy/)
- Several nodes: shared storage and a coordinator for a cluster, in [Clustering](/docs/cluster/)
- Automated installation: a deployment tool applies the configuration instead of the wizard, in [Declarative deployments](/docs/configuration/declarative-deployments)
- Spam filtering: the scoring rules and the classifier that learns from users, in [Spam filter](/docs/spamfilter/)
- Performance: settings for large or busy servers, in [Performance tuning](/docs/performance/)

## Getting help

The [FAQ](/docs/faq/) answers the most frequent questions, each with a link to the page that covers it. Questions not covered by the documentation can be asked on the [community forum](https://support.stalw.art).
