---
sidebar_position: 6
title: "Rolling back"
description: "Return a migrated deployment to Stalwart 0.16, either by restarting 0.16 on its untouched store or by copying the 1.0 store into a new 0.16 store with rollback."
---

How a deployment returns to 0.16 depends on whether 1.0 has already been started.

Until 1.0 has been started, rolling back needs no tool. The migration never writes to the 0.16 data store, so restarting 0.16 on its original store is enough. A shared blob store adds one condition: this holds only while the 0.16 spam models are still in place. That is no longer the case once a final run with the `spam_model` category has completed, as described in [Shared blob stores](/docs/migration/upgrade-0-16/prepare#shared-blob-stores).

Once 1.0 has served users, the original store no longer holds the mail, events and files written since the switch. With a shared blob store, it may also already miss blobs. `rollback` covers this case. It copies the 1.0 store into a new, empty 0.16 store, so that the deployment returns to 0.16 without losing that data.

## Running the rollback

The rollback is a one-shot copy, run with 1.0 stopped. It never writes into the original 0.16 store, so its target is a new, empty 0.16 store, and it uses a new state directory of its own:

1. Stop every 1.0 node.
2. Create a new, empty store for 0.16 and a 0.16 configuration file that points to it.
3. Run the rollback, naming the 1.0 configuration as the source and the new 0.16 configuration as the target:

   ```bash
   stalwart-migrate rollback \
     --source /etc/stalwart-v1/config.json \
     --target /etc/stalwart-rollback/config.json \
     --state /var/lib/stalwart-rollback \
     --forward-state /var/lib/stalwart-migrate
   ```

   Like a final run, the rollback asks the operator to type `yes` to confirm that 1.0 is stopped, and watches the 1.0 change counters for 30 seconds before it writes. Before copying anything, it also prints what it would delete or overwrite outside the new 0.16 store, and whether the options given permit it.
4. Review the result and the report with `stalwart-migrate report --state /var/lib/stalwart-rollback`.
5. Start 0.16.27 with the new configuration.

The rollback copies the default categories, and keeps account, document and thread identifiers, UIDs and UIDVALIDITY values. At the end, it verifies a sample of accounts and marks the rollback as done. A completed rollback is not run again, while an interrupted one resumes when the same command is repeated with the same `--state`.

## Options

The options decide how much of the original state is restored and how far the rollback may reach outside the new store:

| Option | Effect |
|---|---|
| `--forward-state <DIR>` | Reads the state directory of the forward migration. Settings that 1.0 did not change since the migration are restored with their exact original 0.16 values, and settings that the migration dropped or could not write are restored from their original form. Without it, every setting is converted back from its 1.0 form, and dropped settings are lost. |
| `--allow-shared-deletes` | Allows changes to services shared with 1.0, chiefly the blob store: overwriting and deleting entries that the rollback would otherwise leave in place, and writing the 0.16 spam models back over the 1.0 models in a shared blob store. Without it, the rollback writes only into the new store and to content-addressed blob keys, and skips the rest with a warning. |
| `--keep-v1-spam-model` | In a shared blob store, leaves the 1.0 spam models in place instead of writing the 0.16 models back. Cannot be combined with `--allow-shared-deletes`. |
| `--yes` | Confirms in advance that every 1.0 node is stopped, when no terminal is attached. |
| `--allow-errors` | Completes the rollback even when objects could not be copied, accepting them as losses. |
| `--allow-mass-removal` | Applies removals held by the [mass-removal guard](/docs/migration/upgrade-0-16/migrate#removals-and-the-mass-removal-guard). |
| `--verify-full` | Verifies every account at the end instead of a sample. |
| `--owner <UID:GID>` | Sets the owner of the files the rollback creates. |
| `--path-map <FROM=TO>` | Rewrites path prefixes in the 1.0 source configuration. |

A shared blob store needs a decision about the spam models. When the new 0.16 store shares its blob store with 1.0, the spam model keys hold the 1.0 format, which 0.16 cannot load. The rollback therefore refuses to start until one of two options decides what happens to them:

- `--allow-shared-deletes` writes the 0.16 models back.
- `--keep-v1-spam-model` keeps the 1.0 models.

0.16 fails to start while it finds the 1.0 format under its keys. With `--keep-v1-spam-model`, the two keys, `STALWART_SPAM_CLASSIFIER_MODEL.lz4` and `STALWART_SPAM_TRAIN_DATA.lz4`, are therefore deleted before 0.16 starts, and 0.16 then trains a new model.

## Data not rolled back

Queued messages, the aggregation of outbound DMARC and TLS reports, scheduled tasks and telemetry stay with 1.0, which keeps delivering what is queued in it.

Submissions are affected by this. A held or pending email submission comes back to 0.16 as sent, because the message itself stays in the 1.0 queue. Let the 1.0 queue drain before stopping 1.0 for the rollback. The rollback states this in its output, and records it as a warning.

Data that exists only in 1.0 is dropped and reported. This covers settings and objects that 0.16 does not have, private metadata, per-instance event data such as colours, keywords and alerts, direct calendar notifications, file symlinks, and similar fields with no 0.16 equivalent.

Change logs are copied back where 0.16 can encode them. DAV clients fetch their data once more after the rollback.
