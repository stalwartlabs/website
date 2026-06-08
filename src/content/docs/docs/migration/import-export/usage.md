---
sidebar_position: 3
title: "Usage"
---

[Vandelay](https://github.com/stalwartlabs/vandelay) presents a small command surface built around three subcommands. The `import` command reads a source account into a local archive, the `export` command reconciles an archive onto a target JMAP server, and the `inspect` command displays the contents of an archive without touching the network. Every invocation follows the same shape, with the local archive given as the final positional argument:

```sh
vandelay <import|export|inspect> [options...] <ARCHIVE>
```

The archive is a single SQLite file holding exactly one account. The `import` and `export` commands create it if it does not already exist; `inspect` only reads it.

## The two sync modes

There are exactly two synchronisation modes, `import` and `export`, and there is no separate command for discovery, resume or incremental update. Those are all expressed by re-running an import or an export against the same archive, because both modes are convergent. An interrupted run is completed by repeating it; a later run captures or applies whatever has changed since the previous one. This is the central idea to keep in mind when operating the tool: the safe response to almost any interruption is to run the same command again.

## Credentials

Sources and targets that require authentication accept their secrets in three ways, and the order in which Vandelay looks for them is designed so that secrets need never appear on the command line. A secret may be passed through a flag, but is more safely provided through an environment variable, and when neither is present Vandelay prompts for it interactively on the terminal. The environment variables are `VANDELAY_PASSWORD` for Basic-authentication passwords, `VANDELAY_TOKEN` for bearer tokens, `VANDELAY_EWS_CLIENT_SECRET` for the Exchange EWS application-only flow, and `VANDELAY_GRAPH_TOKEN` for a pre-acquired Microsoft Graph token. Passing a password or token directly as a flag value is supported for scripting but discouraged, because it exposes the secret in the process table and the shell history.

## Global flags

A set of flags is common to every command, controlling concurrency, logging, retry behaviour and TLS handling.

| Flag | Default | Meaning |
| --- | --- | --- |
| `-j, --threads <N>` | logical CPUs | Worker pool size, clamped down to the server's advertised concurrency limit. |
| `--dry-run` | off | Compute and report the full plan; perform no writes. |
| `-v, --verbose` | off | Increase log verbosity; repeatable up to `-vvv`. Mutually exclusive with `--quiet`. |
| `-q, --quiet` | off | Restrict output to warnings and errors. |
| `--max-retries <N>` | 5 | Maximum retry attempts per request on transient failures. |
| `--allow-invalid-certs` | off | Accept self-signed or otherwise invalid TLS certificates. |

The worker pool governs how many requests run in parallel, but Vandelay never exceeds the concurrency a server advertises, so the value set here is an upper bound rather than a guarantee. Verbosity climbs from the default of per-type progress lines and a final summary, through per-chunk progress and retry notices at `-v`, to a full record of every protocol call at `-vv` and complete request and response bodies at `-vvv`; the deeper levels are written to standard error so that standard output stays parseable, and secrets are always redacted regardless of level. Accepting invalid certificates should be reserved for test servers.

## Dry runs

Every command accepts `--dry-run`, which performs all the reading and reconciliation needed to determine exactly what would change but writes nothing, neither to the archive on import nor to the target on export. The plan it prints, including the counts of objects that would be created, updated or removed, is the recommended way to preview a migration before committing to it, particularly before a destructive export.

## Inspecting an archive

The `inspect` command provides a read-only view of an archive. It never opens a network connection and never modifies the data, which makes it safe to run at any time to verify that an import captured what was expected before proceeding to export.

```sh
vandelay inspect <ARCHIVE> [TYPE] [--limit <N>] [--offset <N>]
```

Run without a type, `inspect` prints a per-type summary giving the count of every object kind in the archive together with blob-storage statistics. Given an object type, it dumps that type's contents: the accepted tokens are `mailbox`, `email`, `identity`, `sievescript`, `addressbook`, `contactcard`, `calendar`, `calendarevent`, `participantidentity` and `filenode`. The `mailbox` and `filenode` types are rendered as a tree and ignore the pagination options, while the other types are listed in pages and honour `--limit` and `--offset` for stepping through large collections.

## Exit codes

Vandelay reports the outcome of a run through its exit status, which is useful when driving it from scripts and schedulers.

| Code | Meaning |
| --- | --- |
| 0 | Success. All selected types were reconciled, though warnings may have been printed. |
| 1 | Usage error, such as a bad flag or a missing required argument. |
| 2 | Connection, authentication or session-discovery failure. |
| 3 | Account resolution failure: the account was not found or was ambiguous. |
| 4 | Source-change protection triggered without `--allow-source-change`. |
| 5 | Partial failure: some objects or types failed, while the archive was left consistent and resumable. |
| 6 | Aborted by the operator at the `--prune` confirmation prompt. |
| 7 | Local archive or input/output failure: the archive could not be opened, created or read. |

A partial failure, code 5, is always safe to retry, because import converges by recomputing its identifier difference and export converges by re-matching. Code 7 indicates a local problem, such as a bad path, a stale lock or insufficient disk, and never points to anything wrong on the remote side.
