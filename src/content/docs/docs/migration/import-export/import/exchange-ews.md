---
sidebar_position: 10
title: "Microsoft Exchange (EWS)"
description: "Import an Exchange mailbox over Exchange Web Services: endpoint and Autodiscover, mailbox stores, authentication flows, throughput and examples."
---

The EWS importer reads a Microsoft Exchange mailbox into an archive over Exchange Web Services (EWS), the SOAP protocol that Exchange offers for programmatic access. It is the importer for Exchange Server installed on premises, which offers EWS but not Microsoft Graph.

A single run produces mail, calendars and contacts. The importer lists the mailbox folders, reads messages as MIME, and converts calendar and contact items to JSCalendar and JSContact, the JSON formats for events and contacts that JMAP uses.

For Exchange Online, the [Microsoft Graph importer](/docs/migration/import-export/import/exchange-graph) is the importer to use. Microsoft is retiring EWS in Exchange Online: since 1 October 2026, it works only when a tenant administrator sets `EwsEnabled` to `True` and adds the application's client identifier to `EwsAllowedAppIDs`. On 1 April 2027, it is switched off for every tenant. Exchange Server on premises is not affected.

## Endpoint and Autodiscover

`--url` names the EWS endpoint, for an Exchange Server usually `https://<server>/EWS/Exchange.asmx`. Without `--url`, Vandelay finds the endpoint with Autodiscover.

`--mailbox` gives the mailbox's address. Vandelay can do without it only when the address follows from the credentials, that is, when the Basic user name is an address, or the token names the user. Autodiscover and the application-only flow described below always need it. When the address cannot be resolved, the run ends with exit code 3 and `could not resolve mailbox SMTP; pass --mailbox`.

## Mailbox stores

`--mailbox-kind` selects the store to read:

- `primary`, the main mailbox (the default)
- `archive`, the mailbox's In-Place Archive
- `public-folders`, the organisation's public folder hierarchy

Each store is recorded as a separate source, so the main mailbox and its In-Place Archive are read into separate archives. Importing both into one archive is refused by source-change protection, unless `--allow-source-change` is given.

## Authentication

One authentication method is required.

`--auth-basic <USER>` applies to Exchange Server installations that still accept Basic authentication. The password comes from `--auth-password`, `VANDELAY_PASSWORD` or a prompt. The option is refused for plain `http://` endpoints, and for the Exchange Online hosts (`outlook.office365.com`, `outlook.office.com`, `outlook.office365.us`, `office365.us`), with `Basic auth is disabled on Exchange Online; use --auth-bearer` and exit code 2.

`--auth-bearer` uses OAuth. A token given as the option's value is used as it is. Otherwise, Vandelay obtains the token by the first of the following methods that applies:

1. With `--ews-device-code`, the interactive device code flow: Vandelay prints a URL and a code, which an administrator or the mailbox owner completes in a browser.
2. With `--ews-client-secret`, the application-only client credentials flow: Vandelay signs in as the application, and acts on the mailbox named by `--mailbox` through Exchange impersonation. The application needs the permission to access that mailbox.
3. The token in the `VANDELAY_TOKEN` environment variable, used as it is.
4. With `--ews-client-id` and a client secret in the `VANDELAY_EWS_CLIENT_SECRET` environment variable, the client credentials flow.
5. A prompt for the token, when standard input is a terminal. Otherwise Vandelay stops with a usage error.

The device code and client credentials flows sign in through Microsoft Entra, with the application identifier given in `--ews-client-id`. `--ews-tenant` names the tenant, by default the multi-tenant `common` authority. `--ews-device-code` or `--ews-client-secret` without `--ews-client-id` stops with `--ews-client-id is required with --ews-device-code or --ews-client-secret`.

The order of the list matters when several sources are present. Because `--ews-device-code` and `--ews-client-secret` come first, an exported `VANDELAY_TOKEN` does not override them. It does take precedence over a client secret in `VANDELAY_EWS_CLIENT_SECRET`, so an unattended run that relies on that variable needs `VANDELAY_TOKEN` unset.

## Carried data

The importer carries the following data:

| Carried | Notes |
| --- | --- |
| Mail folders and messages | Messages as MIME |
| Calendars and events | Converted to JSCalendar, including the exceptions of recurring events |
| Contact folders and contacts | Converted to JSContact, with photos and categories |

## Change detection and throughput

Items are identified by their EWS item identifier. Vandelay lists changes with the `SyncFolderItems` operation, and falls back to `FindItem` where it is not available. `--ews-no-syncfolderitems` always uses `FindItem`, which helps with servers whose synchronisation support is unreliable.

Folders are read over several connections, set by `--ews-connections`: 4 by default, from 1 to 8, and at most `--threads`. Items are read in batches of `--ews-getitem-batch` identifiers, 20 by default, and attachments in batches of `--ews-attachment-batch`, 5 by default. `--dry-run` lists the folders that would be read, without reading items.

The archive records the endpoint and the mailbox, with the store, so a run against another mailbox is refused, as described under [Source-change protection](/docs/migration/import-export/import/#source-change-protection).

## Examples

The following command imports an Exchange Server mailbox with Basic authentication, at a known endpoint:

```sh
export VANDELAY_PASSWORD='<password>'
vandelay import exchange-ews \
  --url https://mail.corp.example.com/EWS/Exchange.asmx \
  --mailbox alice@corp.example.com \
  --auth-basic 'CORP\alice' \
  alice.sqlite
```

The next command imports an Exchange Online mailbox, while the tenant allows EWS, with the device code flow and Autodiscover:

```sh
vandelay import exchange-ews \
  --mailbox alice@contoso.com \
  --auth-bearer \
  --ews-device-code \
  --ews-tenant contoso.onmicrosoft.com \
  --ews-client-id 11111111-2222-3333-4444-555555555555 \
  alice.sqlite
```

The last command imports the In-Place Archive of the same mailbox, unattended, with the application-only flow:

```sh
export VANDELAY_EWS_CLIENT_SECRET='<client secret>'
vandelay import exchange-ews \
  --mailbox alice@contoso.com \
  --mailbox-kind archive \
  --auth-bearer \
  --ews-tenant contoso.onmicrosoft.com \
  --ews-client-id 11111111-2222-3333-4444-555555555555 \
  alice-archive.sqlite
```

Each run can be repeated, to complete an interrupted transfer or to copy changes.
