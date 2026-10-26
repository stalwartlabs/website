---
sidebar_position: 3
title: "Preparing the migration"
description: "Describe both stores to stalwart-migrate, review the conversion of the 0.16 settings with prepare, choose the data categories and decide how a shared blob store is handled."
---

Before any data is copied, the tool needs to know two things: where the two stores are, and how the 0.16 settings become 1.0 settings. This step provides both. It describes the two stores, sets up a state directory that keeps the migration's progress, and runs `prepare`, which converts the settings and records the decisions that the conversion needs. Nothing is written to either store yet.

## Configuration files

The tool learns about each server from its local configuration file, the `config.json` that defines the data store. It reads the remaining settings from the registry inside the store.

Two options name these files. `--source` names the 0.16 configuration. `--target` names the configuration that the 1.0 server will use, so the same file later becomes the configuration of the 1.0 server. The target names a new, empty store. A RocksDB target, for example, is defined as:

```json
{
  "@type": "RocksDb",
  "path": "/var/lib/stalwart-v1/"
}
```

A PostgreSQL target names a new database:

```json
{
  "@type": "PostgreSql",
  "host": "db.example.org",
  "port": 5432,
  "database": "stalwart_v1",
  "authUsername": "stalwart",
  "authSecret": { "@type": "Value", "secret": "<password>" }
}
```

Create the new store (an empty database, FoundationDB cluster or directory) and its configuration file before the first run. The tool records a fingerprint of both definitions, and refuses to continue a migration with a different source or target.

## State directory

All progress lives in the state directory, named by `--state` or by the `STALWART_MIGRATE_STATE` environment variable. It holds three things: the answers recorded by `prepare`, a SQLite database with the position of every account and every reported issue, and the logs of each command.

Every later command of the same migration uses the same state directory. `rollback` also reads it, to restore the original 0.16 settings, so keep the directory until the 0.16 deployment is retired.

The state directory must lie outside every store. The tool refuses a directory that is inside, or overlaps, the 0.16 or 1.0 data store or a file system blob store. Its files are created readable only by their owner, because the answers and the state database may contain secrets from the 0.16 settings.

## Converting the settings

`prepare` reads the 0.16 settings, converts them to 1.0, and asks about every conversion that needs a decision. It runs interactively, and needs a terminal on both its input and its output, so answers piped into it are not accepted: without a terminal it stops with `prepare is interactive and needs a terminal.` In a container, attach a terminal with `docker run -it`, `docker compose run --rm migrate prepare` or `kubectl exec -it`. The command is:

```bash
stalwart-migrate prepare \
  --source /etc/stalwart/config.json \
  --state /var/lib/stalwart-migrate
```

The questions are grouped in sections: Target, Data categories, Authentication, Network, AI and spam filtering, and Other settings. Each question shows how 0.16 behaved and how 1.0 behaves, with a recommendation where one exists. Pressing Enter accepts the value in brackets.

Two questions are always asked. The first is whether 1.0 reuses an external blob store or copies it into the target, described under [Shared blob stores](#shared-blob-stores). The second is which [data categories](#data-categories) to migrate.

The other questions appear only when the 0.16 settings contain the object concerned:

| Question | Asked when |
|---|---|
| OpenID Connect directory | For every OIDC directory: accepted audiences, opaque token validation, and the access granted to tokens without Stalwart scopes |
| OAuth token lifetimes | An OIDC provider uses lifetimes below the 1.0 minimums |
| OAuth client registration | For every OIDC provider, because 1.0 rejects unregistered client identifiers |
| Counter reads in expressions | An expression calls `counter_get`, which 1.0 no longer has |
| Client address behind a reverse proxy | `useXForwarded` is enabled: the header and the number of trusted proxies |
| AI spam classifier | The LLM spam classifier is enabled |
| AI model provider | For every AI model |
| RFC 2136 DNS server with SIG(0) | A DNS server uses SIG(0), which 1.0 does not support |
| Azure blob store authentication | An Azure store has neither an access key nor a SAS token |
| In-memory store in a cluster | A cluster coordinator is enabled while the in-memory store is the data store, which 1.0 refuses: a cluster needs a Redis, Redis Cluster, Redis Sentinel or sharded Redis store |
| Features missing from the 1.0 server build | The 0.16 settings use objects that the 1.0 server build cannot store |
| New permissions | Custom roles grant permissions that have new 1.0 counterparts |
| Changed defaults | Settings still hold a 0.16 default that changed in 1.0 |

When every question has an answer, `prepare` prints a summary with the number of objects to write, the objects dropped, the warnings and the errors.

The dropped count needs careful reading, because it covers whole objects only. A property that 1.0 does not have is reported as a warning on its object instead. The report therefore lists dropped values even when the summary counts no dropped object.

After confirmation, `prepare` writes two files into the state directory:

- `answers.toml`, the decisions, which later runs read without asking. The file belongs to the tool, and it can be edited by hand.
- `prepare-report.txt`, the plan: the summary, every dropped object and every change applied to the settings.

`run` refuses to start while a question is unanswered. When a later change to the 0.16 settings raises a new question, run `prepare` again.

Without a terminal, for example in a CI job or after editing `answers.toml`, use `prepare --non-interactive`. It validates the existing answers, prints the summary and writes the report, and it exits with status 1 while questions remain open.

## Data categories

The data is divided into categories. They are selected in `prepare`, and the selection applies to every run:

| Category | Content | Default |
|---|---|---|
| `settings` | Server settings | On |
| `principals` | Accounts, groups, domains and other principals | On |
| `mail` | Mailboxes, emails and submissions | On |
| `calendars` | Calendars and events | On |
| `contacts` | Address books and contacts | On |
| `files` | Files | On |
| `sieve` | Sieve scripts | On |
| `identities` | Identities | On |
| `push_subscriptions` | Push subscriptions | On |
| `spam_samples` | Spam training samples | On |
| `reports` | Received DMARC, TLS and ARF reports | On |
| `archive` | Archived items | On |
| `spam_model` | Learned spam filter models; final run only | On |
| `queue` | The outbound queue and the aggregation of outbound DMARC and TLS reports; final run only | Off |
| `tasks` | Scheduled tasks; final run only | Off |
| `telemetry` | Stored traces and metrics | Off |

The queue and the scheduled tasks are off by default. While both servers run, copying them would deliver the same messages and perform the same work twice. Including the queue in the final run, on the other hand, hands every queued message over to 1.0, with its due times and recipient states, and 1.0 continues the delivery.

Categories marked "final run only" are skipped by incremental runs even when selected. They are copied only by `run --final`, when 0.16 is stopped. A single run can override the selection, as described in [Selecting categories for one run](/docs/migration/upgrade-0-16/migrate#selecting-categories-for-one-run).

## Shared blob stores

0.16 may keep message bodies, attachments and files in an external blob store. 1.0 can read the same blobs under the same keys, so the recommended answer in `prepare` is to reuse the store. The tool then copies no blob contents. It writes only the data store entries that link each object to its blob, which saves both the time and the storage of a second copy.

Blobs kept in the 0.16 data store itself are always copied, even when the reuse answer was recorded, and the run logs a warning to that effect. `prepare` asks the question in that case as well, but the answer has no effect.

The tool never deletes or modifies a blob that 0.16 uses. In a shared store, it only adds keys of two kinds: Sieve scripts, which 1.0 stores in a different form, and blobs copied in copy mode, which are written under content-addressed keys that already describe the same bytes.

The learned spam filter models are the exception. 0.16 and 1.0 store the classifier and trainer models under the same fixed keys, in formats that neither release can read from the other. For this reason, the `spam_model` category is copied at the very end of `run --final`, with 0.16 stopped: after the store is finalised and verified, and immediately before the migration is marked done. At that point, the tool writes the converted model over the 0.16 model in the shared store, or deletes a model kind that the source does not have. Incremental runs, and final runs that fail or do not finalise, never touch these keys. The `prepare` summary announces the overwrite, and the run report records it.

Excluding `spam_model` leaves the 0.16 model in place, but 1.0 cannot load it. Deleting its two keys, `STALWART_SPAM_CLASSIFIER_MODEL.lz4` and `STALWART_SPAM_TRAIN_DATA.lz4`, lets 1.0 train a new model from the spam training samples.

Once 1.0 runs on a shared blob store, the original 0.16 store is no longer a safe fallback, for two reasons. Stalwart 1.0 deletes the blobs it no longer references, including blobs that the stale 0.16 store still links to. The spam model keys also hold the 1.0 format. A return to 0.16 after the switch therefore goes through [`rollback`](/docs/migration/upgrade-0-16/rollback), into a new store.
