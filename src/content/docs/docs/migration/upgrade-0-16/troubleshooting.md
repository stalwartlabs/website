---
sidebar_position: 8
title: "Troubleshooting"
description: "Known limitations of stalwart-migrate and the refusals it reports, with their causes and resolutions."
---

Most problems during a migration with `stalwart-migrate` are refusals. The tool stops before it would put the 0.16 data or the integrity of the copy at risk, and it names the reason. This page lists those messages, followed by the known limitations of the tool. [Verifying the migration](/docs/migration/upgrade-0-16/verify) describes how to find accounts in error, and the objects that could not be copied.

## Refusals

Each refusal is reported with one of the following messages:

| Message | Cause and resolution |
|---|---|
| `the target store is not empty; the first run requires an empty target` | The first run found data in the target. Create a new, empty store. |
| `the v1 target is an existing store that this tool did not create; ...` | The target database holds tables or a store that another installation created. Use a new database; on PostgreSQL, other schemas must not be on the connecting user's search path. |
| `the v1 --target already holds a v1 store that this --state did not create; ...` | Another migration filled the target. Use the state directory of that migration, or a new store. |
| `another state directory has used this target since this one last ran; ...` | A different state directory, or a backup or copy of this one, ran against the target after this one last did. Use the state directory that ran last. A state directory restored from a backup or copied cannot continue: start again with a new state directory and a new, empty target. |
| `the target store is empty but the state database records earlier progress; use a new --state directory` | The target was recreated after earlier runs. Start again with a new state directory. |
| `the --state directory <dir> overlaps the <store> <path>; keep the state outside every store` | The state directory lies inside or around a data store or file system blob store. Move it elsewhere. |
| `the target store <path> overlaps the source <store> <path>; the target must be a separate, new location` | The 1.0 target shares a location with the 0.16 data or blob store. Choose a separate path. |
| `source change counters moved during the 30 second observation window; stop every v0.16 node before run --final` | A 0.16 node is still running. Stop every node and repeat the final run. |
| `a v0.16 server started on the SQLite source <path> after it was opened; stop every v0.16 server and rerun` | 0.16 was started during a run against a SQLite store. Stop it and repeat the command. |
| `run --final needs an interactive confirmation; pass --yes when no terminal is attached` | The final run was started without a terminal. Add `--yes` once 0.16 is stopped. |
| `the final run has already completed and v1 may be live; use --force-after-final to write anyway` | The migration is done. Do not write again unless 1.0 has not been started, as described in [Final run](/docs/migration/upgrade-0-16/migrate#final-run). |
| `<dir>/answers.toml not found; run prepare first` | `prepare` has not been run with this state directory. |
| `prepare is interactive and needs a terminal. ...` | Attach a terminal, or validate an existing `answers.toml` with `prepare --non-interactive`. |
| `answers.toml selects the <edition> edition but this binary is the <edition> edition` | The answers were recorded with the other build of the tool. Install the build that matches the Stalwart server, as described in [Installation](/docs/migration/upgrade-0-16/installation). |
| `the <side> store definition differs from the one recorded in the state database` | `--source` or `--target` changed since the previous run. Use the original files, or a new state directory and target. |
| `not finalizing: accounts are in error (use --allow-errors to finalize anyway)` | Some accounts failed. Check `status` and `report --severity error`, fix the cause and repeat, or accept the losses with `--allow-errors`. |
| `the source lists <n> fewer accounts than the state database (<m> tracked); ...` | The [mass-removal guard](/docs/migration/upgrade-0-16/migrate#removals-and-the-mass-removal-guard) held the removals. Check the source configuration, or pass `--allow-mass-removal` when the removals are intended. |
| `the <side> store path <path> is a SQLite URI; use a plain file system path` | SQLite stores are given as file paths. |
| `the v0.16 rollback target <path> already exists; rollback writes into a new, empty location only` | The rollback target must be new. |

## Known limitations

The tool has the following limitations:

- A SQLite source on NFS, or opened through hard links, is not supported while 0.16 is running. SQLite locking is unreliable over NFS, and the tool detects a running server by the paths of the database and its write-ahead log.
- Pending thread merges are not copied. Conversations that 0.16 was about to merge stay split in 1.0. The final run reports one warning per account, with the number of pending merges.
- Only emails are written with several slots per account. The other collections of a very large account are copied by a single writer, as described in [Tuning the copy](/docs/migration/upgrade-0-16/migrate#tuning-the-copy).
- Verification checks that every email and file blob exists in the target, but does not compare blob contents.
- 0.16 does not record when a scheduled task that is being retried first failed. The copied task keeps its retry state, and uses the time the task was created as its first failure.
- 0.16 stores a trace when it ends, under an identifier taken when it started. Each run therefore reads traces again from six hours before the newest trace it has seen, and copies the ones it has not seen yet. A trace that 0.16 stores more than six hours after it started is not copied, and the verification after the final run reports it as missing. Metrics are read again from ten minutes back, for the same reason.
- Copied metrics are stored as written by node 0. 0.16 records the writing node in the metric identifier, but the 1.0 cluster may number its nodes differently.

## WebUI bundle

Stalwart 1.0 loads a WebUI bundle only when it contains an application manifest. The 2.x bundles have one, and the 1.x bundles lack it. A 0.16 deployment that still named a 1.x bundle would therefore answer `404 Not Found` on `/admin` and `/account` after the switch.

The migration handles the official bundle on its own: it replaces the URL of the official 1.x bundle in the `resourceUrl` field of each [Application](/docs/ref/object/application) with the official 2.x bundle. A custom bundle URL is kept, and the report lists it with the warning `custom WebUI bundle URL kept; v1 requires a WebUI v2 bundle (manifest major version 2), otherwise /admin and /account are not served`. Before the switch, point `resourceUrl` at a 2.x build of the custom bundle, or at the official bundle.
