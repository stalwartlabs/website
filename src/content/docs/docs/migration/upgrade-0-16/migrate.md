---
sidebar_position: 4
title: "Running the migration"
description: "Copy a Stalwart 0.16 deployment into the new store in one maintenance window or with incremental runs, finish with the final run, and start Stalwart 1.0."
---

With the answers recorded and the empty store in place, the data can be copied. Every migration ends with the final run, `run --final`, which completes the migration, and every 0.16 node is stopped while it runs.

Whether other runs come before it depends on the length of the maintenance window. A deployment that can be stopped for a complete copy needs only the final run. A larger one copies the bulk of its data beforehand, with 0.16 serving users, so that the final run copies only the last changes.

## Migrating in one window

When a maintenance window long enough for a complete copy is available, the migration is a single final run:

1. Upgrade the deployment to 0.16.27 if necessary, then run [`prepare`](/docs/migration/upgrade-0-16/prepare#converting-the-settings).
2. Create the new 1.0 store and its configuration file.
3. Stop every 0.16 node.
4. Run the final copy:

   ```bash
   stalwart-migrate run --final \
     --source /etc/stalwart/config.json \
     --target /etc/stalwart-v1/config.json \
     --state /var/lib/stalwart-migrate
   ```

   The command asks the operator to type `yes` to confirm that 0.16 is stopped; `--yes` confirms in advance when no terminal is attached. The command then watches the 0.16 change counters for 30 seconds, and stops if they move. This protects the copy from a node that is still running.
5. Check the result printed at the end of the run and review the report, as described in [Verifying the migration](/docs/migration/upgrade-0-16/verify).
6. Start the 1.0 server with the target configuration.

## Migrating with minimal downtime

For a larger deployment, the bulk of the copy runs while 0.16 keeps serving users, and the downtime covers only the last changes:

1. Run `prepare`, then create the empty 1.0 store and its configuration file.
2. Start the first full copy with 0.16 running:

   ```bash
   stalwart-migrate run \
     --source /etc/stalwart/config.json \
     --target /etc/stalwart-v1/config.json \
     --state /var/lib/stalwart-migrate
   ```

   This run copies every account, and can take hours or days on a large deployment. It can be interrupted at any time, and resumed by running the same command again. `--max-ops-per-sec` limits the load it places on the live server.
3. Repeat the same command as often as needed. Each incremental run reads the change log of every account, and copies only what changed since the previous run, including settings, new accounts and deleted ones. An account whose change log 0.16 has already purged beyond the last copied position is copied in full again. An incremental run shortly before the window keeps the final delta small, and with it the downtime.
4. At the start of the maintenance window, stop every 0.16 node.
5. Run the final copy, with the command shown in [Migrating in one window](#migrating-in-one-window). It asks for the same confirmation, and waits 30 seconds to make sure that 0.16 is stopped.
6. Optionally verify every account before starting 1.0, with `verify --full` as described in [Verifying the migration](/docs/migration/upgrade-0-16/verify).
7. Start the 1.0 server with the target configuration.

## Final run

The final run performs the remaining work of the migration, in four stages. It copies the changes made since the previous run and the final-run categories, finalises the 1.0 store, verifies a sample of the accounts, and marks the migration as done.

Finalising prepares the copied data for 1.0. It recalculates quotas, schedules calendar alarms and queues every copied object for search indexing. It also records one change per DAV collection, so that clients fetch the new entity tags, and checks that every 1.0 counter is at least its 0.16 value.

The verification normally covers a sample. With `--verify-full`, the sample is replaced by a complete comparison, which takes as long as reading both stores again.

A final run that completes writes `final-report.txt` into the state directory, and prints a checklist for the switch. The report lists the errors, the warnings (dropped, truncated, clamped, skipped and changed items) and the verification mismatches.

When the final run reports errors, or its verification fails, the migration is not marked as done. The run prints the reason. Finalising is itself resumable, so repeating `run --final` after fixing the cause resumes where it stopped. When the remaining errors are acceptable losses, `--allow-errors` finalises anyway and records the accepted errors, which later verifications take into account.

Once the final run has completed, later runs refuse to write, because 1.0 may already serve users from the target. `--force-after-final` overrides this when 1.0 has not been started yet and a further copy is needed. It removes the done mark, so `run --final` must complete again before 1.0 starts. Never use it once 1.0 serves users from the target.

## Interruptions and repeated runs

Every run can be interrupted and repeated, for two reasons. The tool records progress only after the corresponding write to the target has been committed. Every write also uses the original identifiers, so repeating a batch overwrites identical data and never creates duplicates.

After a crash, a power failure or a killed process, the same command with the same state directory resumes from the last recorded position. `status` lists the interrupted run as `interrupted`.

The tool handles signals in two steps. The first SIGINT or SIGTERM, for example from `docker stop` or Kubernetes, asks the tool to finish the batches in progress, save its state and exit. A second signal exits immediately, which is still safe.

Errors are handled according to their kind:

- Transient errors, such as serialisation conflicts, lost connections and S3 throttling, are retried with exponential backoff, within the limits set by `--retry-attempts` and `--retry-budget`.
- A batch that exceeds the transaction limits of the target is split in half and retried, down to single objects.
- A batch write that does not finish within 15 minutes, or within 1 second per MB of the batch when that is longer, fails its account with an error instead of stalling the run. The next run copies the account again.
- An object that cannot be converted, such as an unparseable message or an invalid calendar event, never stops its account. It is skipped or repaired according to a documented fallback, and reported.
- An account that fails as a whole is marked in error and retried by the next run, while the other accounts continue.

## Selecting categories for one run

The [data categories](/docs/migration/upgrade-0-16/prepare#data-categories) chosen in `prepare` apply to every run. `--include` and `--exclude` override them for a single run, with comma-separated category names. The following final run also hands the queue and the scheduled tasks over to 1.0:

```bash
stalwart-migrate run --final --include queue,tasks \
  --source /etc/stalwart/config.json \
  --target /etc/stalwart-v1/config.json \
  --state /var/lib/stalwart-migrate
```

Likewise, a run with `--exclude files,telemetry` leaves files and telemetry out.

Changing categories between runs has lasting effects. A category included later is copied for every account by the next run. An excluded one is no longer updated, and what was already copied stays in the target. The run logs the change as `data categories changed since the previous run; newly included categories are copied for every account by this run, and data of excluded categories stays in the target as last copied`.

## Removals and the mass-removal guard

When an account or a setting disappears from 0.16, the next run deletes it from the target, which keeps the copy faithful. The same mechanism carries a risk, though. A source configuration that points at the wrong store, or a store that reads as empty, would wipe the copy. The tool therefore holds back large removals:

- Account removals are held when the source lists no accounts, or when at least 10 accounts and more than 10% of the tracked ones would be removed.
- Setting removals are held per object type under the same threshold, and whenever the source lists no accounts, domains or tenants while some are tracked.

A held removal is reported as an error, for example:

```text
the source lists 250 fewer accounts than the state database (1200 tracked); not wiping them. Check the source configuration or pass --allow-mass-removal
```

The run then fails, and `run --final` refuses to finalise. When the removals are intended, pass `--allow-mass-removal` to apply them.

## Tuning the copy

Throughput depends mostly on the target backend, and on how many accounts are copied at once. These options adjust `run`, `verify` and `rollback`:

| Option | Effect |
|---|---|
| `--concurrency <N>` | Number of write slots, 4 per CPU by default: the maximum number of accounts copied at once, and of batches written at once |
| `--account-split <N>` | Maximum number of write slots one account may use at once for its emails (default 8); `1` copies every account with a single writer |
| `--batch-ops <N>` | Maximum operations per target transaction (default 1000) |
| `--batch-bytes <N>` | Maximum bytes per target transaction (default 5242880) |
| `--fdb-txn-bytes <N>` | Maximum bytes per FoundationDB transaction (default 2097152), which keeps transactions well under the FoundationDB size and time limits |
| `--blob-concurrency <N>` | Number of blobs copied in parallel when blobs are copied (default: the number of write slots, at least 16) |
| `--read-ahead <N>` | Number of batches read ahead of the writes for each account (default 2) |
| `--max-ops-per-sec <N>` | Global rate limit, which protects a live 0.16 server during incremental runs |
| `--retry-attempts <N>`, `--retry-budget <SECONDS>` | Retry limits for each batch (defaults 10 attempts and 300 seconds) |

Accounts with the most pending changes are copied first, so large mailboxes start at the beginning of a run instead of finishing alone at its end. Once fewer accounts than write slots remain, the remaining large accounts write their emails through the idle slots, up to `--account-split` each. An account takes extra slots only when no waiting account needs them. Other collections, such as calendars, contacts and files, are written by one writer per account, one collection after another.

`run` and `rollback` print a progress line every 15 seconds. `--progress-interval` changes the interval, and 0 disables it.
