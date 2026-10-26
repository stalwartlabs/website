---
sidebar_position: 4
title: "CalDAV"
description: "Import calendars, events, tasks and notes from a CalDAV server: collection discovery, authentication, what is carried, throughput and examples."
---

The CalDAV importer copies calendars and their entries from a CalDAV server into an archive. It is the importer for calendars at hosted providers such as Apple iCloud, Fastmail or Google, and on self-hosted servers such as Nextcloud, Radicale or Baikal.

Each calendar collection becomes a JMAP calendar, and its iCalendar objects are converted to JSCalendar, ready for export to a JMAP target. Calendars and contacts are separate services, even at providers that offer both. A complete migration therefore combines this importer with the [CardDAV](/docs/migration/import-export/import/carddav) importer, into the same archive.

## Collection discovery

`--url` can name the server, a principal, the calendar home or a single calendar. Vandelay tries three ways to find the calendars, in this order:

1. It lists `--url` as a calendar home or a calendar.
2. It reads the current user's principal (`current-user-principal`) and lists its calendar home.
3. It queries `/.well-known/caldav` on the server and repeats the two previous steps from where it leads.

Redirects are followed at most five times, and the credentials are not sent to another host that a redirect leads to. When no calendar is found, the run stops with `no DAV collections found under --url "<url>"` and exit code 1.

The form of `--url` also decides the scope. Naming a single calendar imports only that calendar. Naming the calendar home is the most reliable form for servers whose discovery is incomplete.

## Authentication and transport

One authentication method is required: `--auth-basic <USER>` with a password, or `--auth-bearer` with a token, as described under [Credentials](/docs/migration/import-export/usage#credentials). The credentials are sent with the first request. An `http://` URL is refused with `http:// URL requires --allow-cleartext`, unless `--allow-cleartext` is given.

## Carried data

The importer carries the following data:

| Carried | Notes |
| --- | --- |
| Calendars | Name, description, colour, sort order and time zone |
| Events (`VEVENT`) | Converted to JSCalendar, with their UID. A recurring event and its modified occurrences form one resource and are carried together |
| Tasks (`VTODO`) and journal entries (`VJOURNAL`) | Stored as calendar entries |

Entries without a UID are skipped. An iCalendar resource that cannot be parsed is skipped with a warning, and counted towards the partial failure exit code. The rest of the calendar is still imported.

## Change detection

On each run, the importer compares each calendar's resources and their ETags with the archive. New resources are read, resources whose ETag changed are read again, and resources that disappeared are removed. A dry run has no comparison to make, and reports every resource as new.

The archive records the server and the principal, so a run against another account is refused, as described under [Source-change protection](/docs/migration/import-export/import/#source-change-protection). CalDAV, CardDAV and WebDAV sources do not conflict with each other.

## Throughput

<!-- include:dav-tuning -->
| Option | Default | Effect |
| --- | --- | --- |
| `--dav-connections <N>` | `4` | Parallel connections to the server, from 1 to 8, and at most `--threads`. |
| `--multiget-batch <N>` | `50` | Number of resources requested per `calendar-multiget` or `addressbook-multiget` REPORT. Has no effect on WebDAV, which reads each file with its own request. |

More connections shorten the copy of a large collection, and increase the load on the server. Larger batches reduce the number of requests on servers that handle them well, while smaller batches suit servers with strict request limits.
<!-- /include:dav-tuning -->

## Examples

The following command imports iCloud calendars, with an app-specific password. iCloud uses its CalDAV host name, and the Apple ID as the user:

```sh
export VANDELAY_PASSWORD='<app-specific password>'
vandelay import caldav \
  --url https://caldav.icloud.com \
  --auth-basic alice@icloud.com \
  alice.sqlite
```

Fastmail calendars are discovered from the principal:

```sh
export VANDELAY_PASSWORD='<app password>'
vandelay import caldav \
  --url https://caldav.fastmail.com \
  --auth-basic alice@fastmail.com \
  alice.sqlite
```

A Nextcloud server is reached by its calendar home:

```sh
export VANDELAY_PASSWORD='<app password>'
vandelay import caldav \
  --url https://cloud.example.com/remote.php/dav/calendars/alice/ \
  --auth-basic alice \
  alice.sqlite
```

The last command reaches a provider with an OAuth token from the environment. The URL follows `--auth-bearer`, so that the archive is not read as the token:

```sh
export VANDELAY_TOKEN='<access token>'
vandelay import caldav \
  --auth-bearer \
  --url https://apidata.googleusercontent.com/caldav/v2/ \
  alice.sqlite
```

Each run can be repeated, to complete an interrupted transfer or to copy changes.
