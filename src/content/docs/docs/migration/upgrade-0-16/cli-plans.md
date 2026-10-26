---
sidebar_position: 7
title: "Converting CLI plans"
description: "Convert stalwart-cli plans written for Stalwart 0.16 to the 1.0 schema with convert_plan.py, answer its questions and check the result before applying it."
---

Deployments managed as code with `stalwart-cli` keep their settings in plans: the NDJSON files that `stalwart-cli apply` reads and `stalwart-cli snapshot` writes. A plan written for 0.16 uses the 0.16 schema, which 1.0 rejects. The `convert_plan.py` script converts such a plan to the 1.0 schema, with the same mapping rules and questions that `stalwart-migrate` applies to the settings it copies.

Plans are converted separately from the data migration. The migrated 1.0 store already holds the converted settings, so a converted plan is needed for two purposes only: to keep managing the 1.0 deployment with plans, or to set up a new 1.0 server from one.

## Getting the converter

The converter is not part of the release archives or the Docker image. It requires Python 3.11 or later, and no other modules. It runs from a checkout of the tool's repository at the tag of the release, because it reads the schema snapshots and mapping rules kept in the repository:

```bash
git clone --depth 1 --branch v1.0.0 https://github.com/stalwartlabs/stalwart-migrate.git
cd stalwart-migrate
```

## Converting a plan

A plan is converted in three steps:

1. Answer the questions that the plan raises. `prepare` is interactive and needs a terminal:

   ```bash
   python3 cli-plan/convert_plan.py prepare plan.ndjson --answers plan.answers.toml
   ```

2. Convert the plan:

   ```bash
   python3 cli-plan/convert_plan.py convert plan.ndjson -o plan-v1.ndjson \
     --answers plan.answers.toml --report plan-v1-report.txt
   ```

3. Review the report, then check the converted plan offline and against the 1.0 server, with a dry run, before applying it:

   ```bash
   python3 cli-plan/convert_plan.py validate plan-v1.ndjson
   stalwart-cli apply --file plan-v1.ndjson --dry-run
   stalwart-cli apply --file plan-v1.ndjson
   ```

The questions are those of [Converting the settings](/docs/migration/upgrade-0-16/prepare#converting-the-settings), asked for the plan entries they concern. The questions about blob stores and data categories do not apply to plans.

The answers file has the format of the `answers.toml` written by `stalwart-migrate prepare`, and the two files can share answers up to a point. Answers that name no object, such as the handling of changed defaults and new permissions, apply to both. Answers about a single object are keyed differently, though: by the object identifier in the state directory, and by the client identifier of the plan entry in a plan. `convert` rewrites the answers file, so start from a copy of the state directory's `answers.toml`, never from the file itself.

## Points to check

The conversion keeps the order of the plan entries and their client identifiers. It also accepts plans written for earlier 0.16 releases, and copies a plan that already uses the 1.0 schema unchanged. Some cases need attention:

- Without `--answers`, `prepare` uses `<plan>.answers.toml` and `convert` uses `<output>.answers.toml`, so the two steps would use different files. Give both steps the same `--answers`.
- When no terminal is attached, `convert` applies the recommended answer to every open question, and lists each one as `default applied:` in the report. `--strict` makes it refuse instead, which suits unattended runs.
- Entries whose content has no 1.0 equivalent are dropped, and an entry left empty is removed from the plan. References to a dropped entry are cleared where the field allows it, and reported as errors otherwise. Check that every entry still comes after the entries it references.
- Secrets that `stalwart-cli snapshot` masked as `****` stay masked, and are reported as warnings; set them on the 1.0 server after applying. Secrets present in the plan are copied in clear. Secrets given as answers are stored in clear in the answers file, which is created readable only by its owner.
- Annotation lines starting with `#`, as used in the `stalwart-cli` documentation, are not valid NDJSON and must be removed before converting.

## Reading the report

Each report line has the form `<level>: <object> [<property>]: <text>`, with level `info`, `warning` or `error`. The report lists every dropped value with its original content (secrets masked), every clamped number, every conversion of a changed setting, and the defaults applied to open questions. Without `--report`, it is printed on standard error.

The exit status of `convert` tells scripts how the conversion went:

- 0: the plan was converted without issues.
- 1: the converted plan was written, but has validation issues or references that `convert` could not clear.
- 2: `convert` refused to convert, because of an invalid plan or answers file, open questions with `--strict`, or an answer that stops the conversion.
