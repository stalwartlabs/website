---
title: "Hosted services"
description: "Move mailboxes from Google Workspace or Microsoft 365 to Stalwart with Vandelay and a cutover of the domain's MX and client settings."
sidebar_position: 8.5
prev:
  link: /docs/migration/guide/
  label: Overview
next: false
---

This page moves the accounts of a domain from a hosted mail service to Stalwart. Typical sources are Google Workspace (including Gmail) and Microsoft 365 (Exchange Online). The data is copied with [Vandelay](/docs/migration/import-export/), and the domain moves to Stalwart when its MX records and client settings are changed. An on-premises Exchange Server is migrated the same way, with the EWS importer.

## Differences from a self-hosted migration

A self-hosted source is placed behind the [migration proxy](/docs/migration/proxy/), and its accounts move one at a time, as described in the [migration guide](/docs/migration/guide/). A hosted service cannot be placed behind the proxy, because the operator controls neither its network nor its ports. The migration of a hosted domain is therefore a cutover of the whole domain, in four steps:

1. Stalwart is prepared and every account is created on it.
2. Vandelay copies every account while users keep working on the hosted service.
3. The MX records and client settings of the domain are changed to Stalwart. From then on, new mail arrives at Stalwart and users sign in to Stalwart.
4. A final Vandelay pass copies what reached the hosted service before and during the change.

There is no per-account switch and no split delivery. Until the MX change, all mail is delivered to the hosted service, and after it, all mail is delivered to Stalwart.

## Preparing Stalwart

Vandelay writes to existing accounts and does not create them. The domain and its accounts are therefore created on Stalwart before any data is copied, as described in [Managing accounts](/docs/auth/accounts/manage).

Passwords need a decision. Hosted services do not export password hashes, so the accounts cannot keep their passwords. There are two alternatives. Each account can be created with a new password that its user receives before the cutover. Users can also sign in through an external identity provider, with [OpenID Connect](/docs/auth/backend/oidc). With an external provider, mail clients that do not support OAuth with that provider use app passwords, as the OpenID Connect page describes.

Before the cutover, prepare the DNS records that Stalwart needs: DKIM keys, SPF, DMARC, MTA-STS and the autoconfig and Autodiscover names. [DNS records](/docs/domains/dns-records) and [Setting up clients](/docs/server/clients) describe them. Lower the TTL of the MX records a day in advance, so that the change reaches sending servers quickly.

Vandelay writes many accounts in a short time, which runs into the limits that protect Stalwart from abusive clients. The [Preparing for bulk import](/docs/migration/guide/configure-new/#preparing-for-bulk-import) section of the migration guide lists the rate limits and JMAP limits to raise on Stalwart while it does so.

## Copying mail, calendars and contacts

Each account is copied in two steps: an import from the hosted service into a local archive, one archive per account, and an export from the archive to Stalwart. The importer depends on the service.

For Google Workspace and Gmail, mail is read with the [IMAP importer](/docs/migration/import-export/import/imap) from `imap.gmail.com`, authenticated with an app password or an OAuth token. Calendars are read with the [CalDAV importer](/docs/migration/import-export/import/caldav), and contacts with the [CardDAV importer](/docs/migration/import-export/import/carddav), all into the same archive.

The [Takeout importer](/docs/migration/import-export/import/takeout) offers an alternative: it reads a Google Takeout export of mail, calendars and contacts from disk. A Takeout export is a snapshot taken at one moment, however, so the final pass after the cutover is made over IMAP.

Microsoft 365 has two importers. The [Microsoft Graph importer](/docs/migration/import-export/import/exchange-graph) reads mail, calendars, contacts and OneDrive files, authenticated with a Microsoft Entra token. The [EWS importer](/docs/migration/import-export/import/exchange-ews) reads mail, calendars and contacts from Exchange Online, for as long as Microsoft operates the EWS endpoint, and from an on-premises Exchange Server.

The archive is then written to the account on Stalwart with [`vandelay export`](/docs/migration/import-export/export). The following example writes Alice's archive to a Stalwart server at `stalwart.example.org`, authenticated as the Stalwart administrator and acting on her account:

```bash
export VANDELAY_PASSWORD='<Stalwart administrator password>'
vandelay export \
  --url https://stalwart.example.org \
  --auth-basic admin \
  --account-name alice@example.org \
  alice.sqlite
```

The importer pages describe the flags and credentials of each source.

A large account takes long to copy, so start the first copy well before the cutover. The copy can be repeated at any time, and each repetition copies only what changed since the previous run.

## Cutting over

The cutover changes the MX records of the domain to Stalwart, and points clients to Stalwart, either through the autoconfig and Autodiscover records or by changing their settings. The change does not take effect everywhere at once. Sending servers pick up the new MX records as their cached records expire, so for some time after the change, mail still arrives at the hosted service.

The final pass collects that mail. Once the old MX records have expired, run the import and the export of each account again, into the same archives. The import picks up what reached the hosted service since the previous run, and the export adds the new messages, events and contacts to Stalwart, without duplicating what was already copied.

The final pass has one limit. The export does not change objects that already exist on Stalwart, so changes made on the hosted service to objects copied earlier, such as read state or edited events, are not carried. Keep the hosted service active until this final pass has completed for every account.

## Rolling back

Until the hosted service is cancelled, the domain can be returned to it by restoring the previous MX records and client settings.

Mail that Stalwart received after the cutover exists only on Stalwart. It has to be carried back to the hosted service separately, for example by having users move it with a mail client connected to both services. A rollback is therefore simplest shortly after the cutover.

## Items not carried over

Besides the items listed in [Items not carried over](/docs/migration/guide/#items-not-carried-over) for any migration, the following stay on the hosted service:

- Passwords, as described above
- Sharing and delegation settings, such as delegated mailboxes and shared calendars, which are granted again on Stalwart
- Filters and rules created in the hosted service's web interface, which are not Sieve scripts and are recreated by users or as Sieve scripts
- The configuration of the service itself, such as groups, distribution lists and retention policies

Each importer page lists what that importer copies.
