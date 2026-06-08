---
sidebar_position: 11
title: "Microsoft Exchange (Graph)"
---

:::caution[Experimental]
The Microsoft Exchange importers are experimental. The flag surface and behaviour may change between releases, and migrations of large or unusual mailboxes should be validated against a test target before committing to them.
:::

The Graph importer reads an Exchange Online mailbox into a local archive over the Microsoft Graph v1.0 REST API. It is the preferred path for Exchange Online, because Graph is the interface Microsoft actively develops and because it exposes immutable item identifiers that keep reconciliation stable even when the mailbox owner moves messages between folders between runs. A single invocation produces mail, calendars and contacts: folders and items are enumerated through the Graph collection endpoints, message bodies are fetched as raw MIME, and calendar and contact resources are converted into JSCalendar and JSContact. On-premises Exchange Server, which does not offer Graph, is served by the [EWS importer](exchange-ews) instead.

## Immutable identifiers

Outlook assigns item ids that change when an item moves between folders or mailboxes, which would make a naive importer record every moved message as one deletion plus one new arrival on each run. Vandelay avoids this by requesting immutable ids on every Graph call, so an item keeps the same reconciliation key for the life of the mailbox. This is what makes repeated runs converge cleanly: a re-run after an interruption fetches only the items still missing, and a re-run against a changed mailbox pulls only the delta.

## Authentication

Access to Graph is always through a Microsoft Entra OAuth token, obtained in one of two ways. A pre-acquired token can be supplied with `--access-token`, read inline, from the `VANDELAY_GRAPH_TOKEN` environment variable, or from an interactive prompt; this suits environments that already mint tokens through their own tooling. Otherwise Vandelay runs the interactive device-code flow, which requires the Entra application id in `--client-id` and accepts `--tenant` (the authority tenant id or short name, defaulting to the multi-tenant `common` authority). The device-code flow prints a verification URL and code to complete in a browser, after which Vandelay holds the resulting token for the duration of the run.

## Mailbox selection

By default the importer reads the mailbox of the signed-in identity. A different mailbox that the signed-in account is permitted to read can be targeted with `--user`, naming it by user principal name or object id. The `--mailbox-kind` flag chooses the surface: the default `primary` reads the main mailbox and `archive` reads the In-Place Archive. The public-folders surface is not available over Graph; a request for it is rejected at parse time with a pointer to the EWS importer, which does support public folders.

## Surface selection

The data types imported can be narrowed with `--objects`, a comma-separated list drawn from `mail`, `calendar` and `contacts`; the default imports all three. The body representation requested for calendar events is controlled by `--event-body-format`, which accepts `text` (the default) or `html`.

## Throughput tuning

Items are read over several parallel connections set by `--graph-connections`, defaulting to four with a hard ceiling of sixteen, capped by the worker pool size. The page size of each collection request is set by `--top`, defaulting to one hundred and accepting any value from one to one thousand. Larger pages reduce the number of round trips, while smaller pages can ease pressure against a heavily throttled tenant.

## Source-change protection

The archive records the Graph source and mailbox surface it was first filled from, and a later run against a different one is refused unless `--allow-source-change` is supplied.

## Examples

Importing an Exchange Online mailbox interactively with the device-code flow:

```sh
vandelay import exchange-graph \
  --client-id 11111111-2222-3333-4444-555555555555 \
  --tenant contoso.onmicrosoft.com \
  alice.sqlite
```

Importing with a token already acquired by external tooling, restricted to mail and calendar data:

```sh
export VANDELAY_GRAPH_TOKEN='entra-access-token'
vandelay import exchange-graph \
  --access-token \
  --objects mail,calendar \
  alice.sqlite
```

Reading the In-Place Archive of a delegated mailbox the signed-in administrator can access:

```sh
vandelay import exchange-graph \
  --client-id 11111111-2222-3333-4444-555555555555 \
  --tenant contoso.onmicrosoft.com \
  --user alice@contoso.com \
  --mailbox-kind archive \
  alice.sqlite
```

Each run may be repeated to resume or to capture changes since the previous snapshot, and `--dry-run` reports the full plan without writing.
