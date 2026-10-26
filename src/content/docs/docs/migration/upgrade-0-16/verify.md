---
sidebar_position: 5
title: "Verifying the migration"
description: "Compare the 0.16 and 1.0 stores with verify, follow progress with status, and review the dropped, changed and failed objects in the report before the switch."
---

The final run already verifies a sample of accounts on its own, and its report lists every difference that the conversion introduced on purpose. Before 1.0 starts serving users, the operator can go further. This page describes how to compare the stores in more depth, follow the progress of a migration, and read the report.

## Comparing the stores

`verify` compares the 0.16 and 1.0 stores through the same record layer that the copy uses. Differences that the migration made deliberately, and reported, are therefore not counted as mismatches:

```bash
stalwart-migrate verify \
  --source /etc/stalwart/config.json \
  --target /etc/stalwart-v1/config.json \
  --state /var/lib/stalwart-migrate
```

By default, `verify` checks a sample. `--sample` sets the percentage of accounts (1 by default). Every account changed since the last run is added to the sample, which has a minimum of 16 accounts. `--full` instead checks every account and every row of every change log. The two options exclude each other.

For each checked account, the comparison covers the following:

- The settings
- The set of objects in every collection
- The fields of mailboxes, emails, calendars, contacts, files and Sieve scripts
- The last change of every change log
- The counters for document identifiers, UIDs and changes

Calendar and contact data is compared after parsing, so equivalent iCalendar and vCard texts are equal. Blobs are checked more lightly: the presence of every email and file blob in the target is checked, but the blob contents are not read again. The command ends with a summary line such as:

```text
verify: 120 accounts checked, 0 mismatches, 0 not explained by earlier reports (ok)
```

Every mismatch is written to the report with severity `verify`. The command exits with status 1 when a mismatch is not explained by an earlier report row.

Timing matters for the result. A verification against a running 0.16 server reports the changes made since the last run as mismatches. A meaningful result therefore requires 0.16 to be stopped and the final run to have completed. `run --final` and `rollback` run the same verification automatically.

## Following progress

`status` summarises a state directory without opening any store, so it can run while another command is in progress:

```bash
stalwart-migrate status --state /var/lib/stalwart-migrate
```

It shows the following:

- The tool version and build
- Whether the final run is done
- The number of accounts in each phase
- The accounts in error, with their last error
- The recent runs, with their duration and counters
- The report counts by severity and kind, for the latest run and for all runs

`--format json` produces the same data for monitoring.

## Reading the report

The report lists every difference between what 0.16 held and what 1.0 received. Some data has no place in 1.0 or exceeds a 1.0 limit, and some settings change meaning. The conversion handles each case with a documented fallback and records it, so nothing is lost silently. Each row has a kind:

| Kind | Meaning |
|---|---|
| `dropped` | The object or field has no 1.0 equivalent and was not copied. |
| `changed` | The value was converted to a different 1.0 form. |
| `truncated` | A list or text exceeded a 1.0 limit and was shortened. |
| `clamped` | A number was outside the 1.0 range and was set to the nearest allowed value. |
| `skipped` | The object could not be read or converted and was not copied. |
| `failed` | The write to the target failed. |
| `mismatch` | Verification found a difference. |

Each row also has a severity: `info`, `warning`, `error` or `verify`. Error rows make a run fail, and keep `run --final` from finalising until they are fixed or accepted with `--allow-errors`. The schema differences behind the settings conversions are listed in [SCHEMA_CHANGES.md](https://github.com/stalwartlabs/stalwart-migrate/blob/main/SCHEMA_CHANGES.md).

`report` lists the rows. They can be filtered by run (`--run`), severity (`--severity`), kind (`--category`), account identifier (`--account`) and number of rows (`--limit`), and printed as text, CSV or JSON (`--format`). The following commands list the errors, export one run as CSV, and show the truncated objects of one account:

```bash
stalwart-migrate report --state /var/lib/stalwart-migrate --severity error
stalwart-migrate report --state /var/lib/stalwart-migrate --run 7 --format csv > run7.csv
stalwart-migrate report --state /var/lib/stalwart-migrate --account 42 --category truncated
```

Before the switch, review the rows of the final run, and those with severity `error` and `verify`.

## Files in the state directory

The state directory contains the following files:

| Path | Content |
|---|---|
| `answers.toml` | The answers recorded by `prepare` |
| `prepare-report.txt` | The settings conversion plan written by `prepare` |
| `final-report.txt` | The report of a completed final run |
| `state.sqlite` | Progress, runs and report rows |
| `state.lock` | The lock that keeps two commands from writing the same state at once |
| `logs/` | One log file per command, named after the command, the start time and the process identifier |

Console output is controlled separately: `--log-format` selects text or JSON, and `--log-level` sets the verbosity.

## Exit codes

Every command ends with one of these exit codes, which scripts and CI jobs can test:

| Code | Meaning |
|---|---|
| 0 | The command succeeded. |
| 1 | The command failed: a run that failed or reported errors, a verification with unexplained mismatches, `prepare` with open questions, or an error opening a store. |
| 2 | Invalid usage or a refusal before any work: wrong arguments, a missing `answers.toml`, an unconfirmed final run, or a tool build that does not match the recorded answers. |
| 130 | The command was interrupted by a signal. |
