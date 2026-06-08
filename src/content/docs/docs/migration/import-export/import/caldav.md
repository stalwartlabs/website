---
sidebar_position: 4
title: "CalDAV"
---

The CalDAV importer copies calendars and their events from any CalDAV server into a local archive. Each calendar collection on the source becomes a JMAP calendar, and the iCalendar objects it contains are parsed into JSCalendar events ready to be reproduced on a JMAP target. It is the path to use when migrating scheduling data from hosted providers such as Apple iCloud, Fastmail or Google, or from self-hosted servers such as Nextcloud, Radicale or Baikal. Calendars and contacts are distinct CalDAV and CardDAV services even when a provider hosts both, so a full migration pairs this importer with the CardDAV path against the same archive.

## Collection discovery

The `--url` argument is deliberately forgiving about how much of the path the operator already knows. Vandelay resolves the calendars to import through a four-step fallback chain: the URL is first treated as a collection or calendar-home set and queried directly; failing that, the current-user-principal is read and its calendar-home set followed; failing that, the well-known CalDAV location is probed; and as a last resort the URL is treated as a home set to enumerate. This means a bare service hostname, a principal URL, or a direct calendar-home URL are all acceptable, and pointing the importer straight at a single calendar collection imports just that calendar.

## Authentication

Exactly one authentication method is required. HTTP Basic authentication uses `--auth-basic <USER>` with the password resolved from `--auth-password`, the `VANDELAY_PASSWORD` environment variable, or an interactive prompt; passing the password on the command line is supported but discouraged. Providers that authenticate with OAuth use `--auth-bearer`, whose token is read inline, from `VANDELAY_TOKEN`, or from a prompt. When a server is reached over plain `http://`, credentials are withheld unless `--allow-cleartext` is set.

## Event conversion

Each iCalendar resource is parsed and converted to a JSCalendar event, with its UID preserved so that the same event can be matched on export rather than duplicated. A resource that fails to parse is skipped rather than aborting the run: the failure is logged as a warning and counted toward the partial-failure exit code, so the operator can see exactly how many objects were dropped and why while the rest of the calendar still imports cleanly.

## Throughput tuning

Calendar collections are read over several parallel connections, set by `--dav-connections` with a default of four and a hard ceiling of eight; the value is additionally capped by the worker pool size. Event bodies are retrieved in batches with the calendar-multiget REPORT, whose size is governed by `--multiget-batch`, defaulting to fifty hrefs per request. Larger batches reduce round trips on servers that handle them well, while smaller batches suit servers with tighter request limits.

## Source-change protection

The archive records the CalDAV source it was first filled from and refuses a later run against a different source unless `--allow-source-change` is given.

## Examples

Importing iCloud calendars with an app-specific password. iCloud requires the dedicated CalDAV hostname and accepts the Apple ID as the user:

```sh
export VANDELAY_PASSWORD='apple-app-specific-password'
vandelay import caldav \
  --url https://caldav.icloud.com \
  --auth-basic alice@icloud.com \
  alice.sqlite
```

Importing Fastmail calendars, where discovery proceeds from the principal:

```sh
export VANDELAY_PASSWORD='fastmail-app-password'
vandelay import caldav \
  --url https://caldav.fastmail.com \
  --auth-basic alice@fastmail.com \
  alice.sqlite
```

Importing from a self-hosted Nextcloud or Radicale server by pointing directly at the calendar-home URL:

```sh
export VANDELAY_PASSWORD='nextcloud-password'
vandelay import caldav \
  --url https://cloud.example.com/remote.php/dav/calendars/alice/ \
  --auth-basic alice \
  alice.sqlite
```

An OAuth provider reached with a bearer token:

```sh
export VANDELAY_TOKEN='caldav-oauth-access-token'
vandelay import caldav \
  --url https://apidata.googleusercontent.com/caldav/v2/ \
  --auth-bearer \
  alice.sqlite
```

As with every importer, a run may be repeated to resume or to capture changes, and `--dry-run` reports the calendar and event plan without writing.
