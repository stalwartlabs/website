---
sidebar_position: 10
title: "Microsoft Exchange (EWS)"
---

:::caution[Experimental]
The Microsoft Exchange importers are experimental. The flag surface and behaviour may change between releases, and migrations of large or unusual mailboxes should be validated against a test target before committing to them.
:::

The EWS importer reads a Microsoft Exchange mailbox into a local archive over Exchange Web Services, the SOAP and XML protocol that Exchange publishes for programmatic access. A single invocation produces mail, calendars and contacts together: the importer enumerates the mailbox folders, reconciles items by their EWS item identifier, downloads message bodies as MIME, and converts calendar and contact items from their Exchange property bags into JSCalendar and JSContact. It is the right path for on-premises Exchange Server deployments, which expose EWS but not Microsoft Graph, and it remains available for Exchange Online while Microsoft continues to operate the EWS endpoint. For Exchange Online specifically, the [Microsoft Graph importer](exchange-graph) is the preferred path.

## Endpoint and autodiscovery

The EWS endpoint can be named directly with `--url`, pointing at the fully-qualified service URL (for an on-premises server this is typically the `EWS/Exchange.asmx` path on the Client Access server). When `--url` is omitted, Vandelay performs Autodiscover to locate the endpoint, which requires the target mailbox address to be supplied with `--mailbox`. The `--mailbox` address is also required when authenticating with an application-only OAuth credential, because that flow carries no user identity of its own.

## Mailbox surface

A mailbox exposes more than one store, and `--mailbox-kind` selects which one to read. The default `primary` reads the main mailbox; `archive` reads the In-Place Archive associated with the mailbox; and `public-folders` reads the organisation's public folder hierarchy. Each surface is recorded distinctly, so the primary mailbox and its archive can be captured into separate archives without colliding.

## Authentication

EWS accepts a broader set of credentials than the other importers, because it must serve both modern Exchange Online tenants and legacy on-premises servers. Exactly one method is required.

Basic authentication, selected with `--auth-basic <USER>` and a password from `--auth-password`, the `VANDELAY_PASSWORD` environment variable or a prompt, applies to on-premises servers that still permit it. Modern authentication uses `--auth-bearer`. A token may be supplied inline or through `VANDELAY_TOKEN`, in which case it is used as presented. When `--auth-bearer` is given without an inline token, Vandelay acquires one through Microsoft Entra, and the flow is chosen by the accompanying flags:

- The interactive device-code flow is selected with `--ews-device-code`. It requires `--ews-client-id` (the Entra application id) and accepts `--ews-tenant` (the tenant id or short name, defaulting to the multi-tenant `common` authority). Vandelay prints a verification URL and code for an administrator or the mailbox owner to complete in a browser.
- The application-only client-credentials flow is selected by supplying `--ews-client-secret` (or the `VANDELAY_EWS_CLIENT_SECRET` environment variable) together with `--ews-client-id` and `--ews-tenant`. This flow signs in as the application itself rather than a user, so the target mailbox must be named with `--mailbox` and the application must hold the appropriate full-access permission.

## Throughput and protocol tuning

Folders are read over several parallel connections set by `--ews-connections`, defaulting to four with a hard ceiling of eight, additionally capped by the worker pool size. Items are fetched in batches of `--ews-getitem-batch` identifiers (default twenty) and attachments in batches of `--ews-attachment-batch` (default five). Vandelay prefers the efficient `SyncFolderItems` operation for delta enumeration and falls back automatically where it is unavailable; `--ews-no-syncfolderitems` forces the broader `FindItem` enumeration instead, which can help against servers whose sync support is unreliable.

## Source-change protection

The archive records the EWS source and mailbox surface it was first filled from, and a later run against a different one is refused unless `--allow-source-change` is supplied.

## Examples

Importing from an on-premises Exchange Server with Basic authentication against a known endpoint:

```sh
export VANDELAY_PASSWORD='exchange-password'
vandelay import exchange-ews \
  --url https://mail.corp.example.com/EWS/Exchange.asmx \
  --auth-basic 'CORP\alice' \
  alice.sqlite
```

Importing an Exchange Online mailbox interactively with the device-code flow, letting Autodiscover find the endpoint:

```sh
vandelay import exchange-ews \
  --mailbox alice@contoso.com \
  --auth-bearer \
  --ews-device-code \
  --ews-tenant contoso.onmicrosoft.com \
  --ews-client-id 11111111-2222-3333-4444-555555555555 \
  alice.sqlite
```

Importing the same mailbox unattended with an application-only credential, reading the In-Place Archive instead of the primary store:

```sh
export VANDELAY_EWS_CLIENT_SECRET='entra-app-client-secret'
vandelay import exchange-ews \
  --mailbox alice@contoso.com \
  --mailbox-kind archive \
  --auth-bearer \
  --ews-tenant contoso.onmicrosoft.com \
  --ews-client-id 11111111-2222-3333-4444-555555555555 \
  alice.sqlite
```

Each run may be repeated to resume after an interruption, and `--dry-run` reports the folder and item plan without writing to the archive.
