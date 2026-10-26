---
sidebar_position: 1
title: "Overview"
description: "Scope, prerequisites, steps, downtime and rollback of a side-by-side, account-by-account migration from a self-hosted mail server to Stalwart."
---

This guide moves the accounts of a running, self-hosted mail server to a new Stalwart deployment. The two servers run side by side, and the accounts move one at a time. Each account can be checked after it moves, and it can be routed back to the existing server until the migration is finalised. Throughout the guide, the existing server is called the source.

The guide covers earlier Stalwart releases and Dovecot and Postfix stacks such as Mail-in-a-Box and mailcow. Other self-hosted IMAP, POP3 and SMTP servers follow the same steps by analogy.

## Use cases

The procedure suits any source whose network and ports the operator controls.

For a Stalwart source, it is the procedure to use in four situations:

- Moving from a release before 1.0, whose data store Stalwart 1.0 cannot open
- Moving to a later release whose release notes state that the source's data store cannot be upgraded in place
- Moving a server to new hardware or another storage backend without downtime
- Consolidating several servers into one

A hosted service such as Google Workspace or Microsoft 365 cannot be placed behind the proxy. It is migrated as described in [Hosted services](/docs/migration/guide/hosted) instead, which replaces the proxy and the account-by-account steps with a cutover of the whole domain.

Two tools carry the migration. The [migration proxy](/docs/migration/proxy/) sits in front of both servers. It routes each client connection to the server that holds the account, based on the credentials the client presents. [Vandelay](/docs/migration/import-export/) copies each account's data from the source to the new deployment, through a local archive file.

## Migration process

The migration rests on three ideas: inbound mail always enters through the new deployment, client sessions are routed account by account, and nothing is deleted from the source.

The new deployment becomes the public mail exchanger at the cutover, and it stays in that role for the whole migration. The proxy passes all inbound SMTP on port 25 to it, and the new deployment performs split delivery. Split delivery means that the new deployment looks at each recipient: a message for an account that has moved is delivered locally, and a message for an account still on the source is relayed to the source. Because one server receives all inbound mail from start to finish, the MX records never change during the migration.

Client sessions, by contrast, are routed per account. The proxy resolves IMAP, POP3, ManageSieve, SMTP submission and HTTP requests through its mapping table. An account without an entry resolves to the source, and a moved account has an entry that points to the new deployment. Moving an account therefore consists of two actions: copying its data, and changing its mapping entry. The account's clients reach the new deployment on their next connection.

The migration copies data and never deletes it from the source. The source keeps a complete copy of each account as it stood when the account moved, so a moved account can be routed back to the source until the source is decommissioned. The rollback does not bring back what happened after the move, though: data that the account received or created on the new deployment after the move has to be carried back separately.

One kind of mail bypasses the new deployment. When an account still on the source sends mail to an account that has already moved, the source delivers it locally, because the source still holds the moved account (it is kept for a rollback). The catch-up run after the switch copies what arrived until then. Later mail of this kind is handled in one of two ways: by repeating the catch-up, or, on a Dovecot and Postfix source, by a transport entry for each moved account that sends such mail to the new deployment. [Migrating accounts](/docs/migration/guide/migrate-accounts/#migrating-many-accounts) describes both.

## Prerequisites

The migration requires:

- A host for the new Stalwart deployment, separate from the source
- A host for the proxy that can take over the public hostname and ports of the source
- Access to the DNS records of the public hostname and of the migrated domains
- The possibility to reload the source, and for a Stalwart source to restart it, once during a maintenance window
- An administrative host for Vandelay with access to both servers and enough free disk space for the archives kept at the same time, as described in [Preparation](/docs/migration/guide/preparation/#installing-vandelay)
- Administrator credentials for the source and the new deployment
- A test account on the source, used to check each stage before real accounts depend on it

## Steps

The migration has seven steps, each with its own page. Only the fifth one interrupts service, briefly:

1. [Preparation](/docs/migration/guide/preparation/): plan the addresses and install the new deployment, the command-line interface, the proxy and Vandelay. No interruption.
2. [Configuring the new deployment](/docs/migration/guide/configure-new/): create the domains, prepare keys and DNS, configure split delivery and trust the proxy. No interruption.
3. [Configuring the proxy](/docs/migration/guide/configure-proxy/): write the proxy configuration and its initial mapping file. No interruption.
4. [Configuring the source server](/docs/migration/guide/configure-source/): stage the settings that let the source accept the proxy and the relay from the new deployment. No interruption.
5. [Starting the proxy](/docs/migration/guide/cutover/): apply the source's settings, start the proxy, repoint the public hostname and test every protocol. A short interruption, and the only planned one.
6. [Migrating accounts](/docs/migration/guide/migrate-accounts/): copy, validate and switch each account, repeated for every account. Each account's open sessions are disconnected once, at its switch.
7. [Finalizing the migration](/docs/migration/guide/finalize/): let the new deployment answer clients directly, remove the migration settings and decommission the source. No interruption.

The [troubleshooting](/docs/migration/guide/troubleshooting/) page lists the problems that most often occur along the way.

## Downtime

Steps 1 to 4 cause no downtime, because they do not change the path that clients take to the source. The settings staged on the source take effect only later, when the source is reloaded or restarted at the cutover.

The cutover is the one short interruption. The source applies its staged settings, the proxy takes over the public ports, and the public hostname is repointed to the proxy. A Stalwart source is restarted, while a Dovecot and Postfix source is only reloaded. The DNS change reaches clients gradually, as their resolvers' cached records expire, so the TTL of the public hostname is lowered a day in advance. Once the proxy is live, every account is served from the source as before.

Moving an account causes no downtime. When its mapping entry changes, the account's open sessions are disconnected, and clients reconnect to the new deployment automatically.

Clients do, however, see the moved account's data as new data. Vandelay creates every object afresh on the new deployment, and the new deployment assigns its own identifiers: a new UIDVALIDITY and new UIDs for each IMAP folder, new JMAP identifiers, and new resource names and collection identifiers for calendars, contacts and files. This has three visible consequences. IMAP clients download the mailbox contents again. CalDAV, CardDAV and WebDAV clients synchronise their collections again. A saved link to a single event, contact or file on the source no longer resolves.

Messages also gain two keywords. Every message carries one of `$hasattachment` and `$hasnoattachment`, which Stalwart sets from the message's content. IMAP clients list them with the other keywords of a message, and cannot set or remove them.

## Account names and client settings

Clients keep the public hostname, the ports and, in most cases, their settings. The exception is a source on which users sign in with a bare name, such as `alice`, instead of a full address. Such a source needs two adjustments, one for each group of protocols:

- IMAP, POP3, SMTP submission, ManageSieve and JMAP clients keep working with the bare name. The new deployment completes a bare login with its default domain, which must be set for this purpose, and the proxy routes the bare name once the account has its own mapping entry.
- CalDAV, CardDAV and WebDAV clients whose collection URL contains the bare name, such as `/dav/cal/alice/`, must be reconfigured after the account moves. On the new deployment, the path contains either one of the account's full addresses, percent-encoded (`/dav/cal/alice%40example.org/`), or the account's numeric identifier in the form `_<id>`. Clients that discover their collections from `/.well-known/caldav` or `/.well-known/carddav` find the new path by running discovery again. The proxy cannot hide this change, because it routes HTTP requests by their credentials and does not rewrite paths.

[Login names after migration](/docs/migration/guide/migrate-accounts/#login-names-after-migration) describes both adjustments in detail.

## Items not carried over

Vandelay copies an account's data: its mailboxes and messages, identities, Sieve scripts, address books and contacts, calendars and events, and files, as far as the source protocol exposes them. The following items are not carried by Vandelay:

- **Passwords and other credentials.** Accounts are created on the new deployment as a separate step, and that step determines whether passwords are kept. On a Dovecot and Postfix source, a stored password hash in a supported format is kept. On a source running a previous Stalwart version, the password hash is kept as well. App passwords and API keys are not carried, so users create their app passwords again. Two-factor authentication secrets are carried from a Stalwart 0.16 source only, so users of other sources enrol their second factor again.
- **Participant identities.** These are the addresses under which a user takes part in calendar scheduling, and they are not copied. The new deployment creates them the first time they are read: one for each address of the account, including the addresses under each domain alias and those of the groups the account belongs to. Each is named after the account's description, and the first of the account's own addresses becomes the default. A user who scheduled under another name or under a subset of addresses adjusts the identities after the move.
- **Aliases and account settings.** Additional addresses, quotas and other account properties are set when the account is created on the new deployment.
- **Groups and mailing lists.** They are recreated on the new deployment by hand.
- **Sharing.** Access rights granted to other accounts on mailboxes, calendars, address books and files are not copied. They are granted again after both accounts have moved.
- **Domain settings.** DKIM keys and other per-domain settings are set up on the new deployment, as described in [Configuring the new deployment](/docs/migration/guide/configure-new/).
- **Vacation responses from other sources.** Vandelay copies the vacation response of a Stalwart source. Other sources keep an automatic reply in a Sieve script, which is copied with the other scripts. The new deployment, however, reserves the script name `vacation` for its own vacation response, and refuses a script with that name with `The 'vacation' name is reserved, please use a different name.` Such a script is therefore renamed on the source before the copy.
- **Server settings and server-wide Sieve scripts.** Only the scripts that belong to an account are copied.
- **Client authorisations.** Push subscriptions, OAuth grants and WebUI sessions are tied to the server that issued them. Clients that use OAuth therefore sign in again after their account moves.

## Rolling back at each stage

Each step has its own rollback section. The following table summarises, for each stage, what a rollback undoes and which data it puts at risk:

| Stage | What is undone | Data at risk |
| --- | --- | --- |
| Preparation, configuration of the new deployment and the proxy | Nothing serves clients yet; the new components are left unused or removed. | None |
| Source configuration | Staged settings are cleared before they take effect. | None |
| Proxy started, no account moved | The public hostname is repointed to the source and the proxy is stopped; a Stalwart source is restarted without its listener settings. | None |
| An account has moved | The account's mapping entry points to the source again. | Mail and changes the account received on the new deployment after the move, which are carried back separately |
| Proxy removed, source still running | The proxy is started again and the hostname repointed to it. | As for a moved account |
| Source decommissioned | No rollback possible. | Not applicable |
