---
sidebar_position: 11
title: "Configuration reference"
description: "Every Stalwart Keep setting, how settings are read from flags, environment variables and the configuration file, and the rules that combine them."
---

This page lists every setting of the `keep` server. `keep --help` prints the same list for the installed version. Stalwart's own settings for connecting to Keep are in the [InMemoryStore](/docs/ref/object/in-memory-store) and [Coordinator](/docs/ref/object/coordinator) references, and [Connecting Stalwart](/docs/cluster/keep/stalwart) explains them.

## Settings sources

Each setting can be given in three places, and it is taken from the first that holds it:

1. A flag on the command line, such as `--max-lock-ttl 600`.
2. An environment variable: `KEEP_`, then the flag name in upper case, with `-` as `_`, such as `KEEP_MAX_LOCK_TTL`.
3. The TOML file named by `--config` or `KEEP_CONFIG`, in which each key is the flag name without the dashes, such as `max-lock-ttl = 600`.

In the file, numbers are TOML integers, names, addresses and paths are strings, `stats-shards` is a boolean and `members` is an array of strings. A `node` id above the largest TOML integer can be written as a string of digits. Relative paths resolve against the server's working directory, not the directory of the file, so absolute paths are safer.

Secrets stay out of the file. It names the secret files, and the secrets themselves are only in those files or in `KEEP_SECRET` and `KEEP_PEER_SECRET`. These two variables hold the secret itself, and setting one together with its `_FILE` form is refused.

Keep reads its settings only at start, so changing one means a restart. Startup refuses unknown keys, invalid values and settings that do not fit together, naming the flag or key. An error in a single setting exits with status 2, and settings that do not fit together exit with status 1. Variables that start with `KEEP_` but match no flag are ignored, because other software sets some of them. A misspelled variable therefore has no effect.

## Network and identity

| Flag | Default | Purpose |
|---|---|---|
| `--listen` | `0.0.0.0:7000` | Client address to bind |
| `--advertise` | The bound address | Client address given to clients. In a cluster, it must match this member's entry |
| `--node` | Random | This member's id, a non-zero number. Required in a cluster |
| `--config` | `KEEP_CONFIG` | TOML configuration file. Cannot be set inside the file |

## Cluster

| Flag | Default | Purpose |
|---|---|---|
| `--members` | A single server | Every member, this one included, as `node@client_ip:port/peer_ip:port/shards`. The peer address can be a port alone |
| `--peer-listen` | The unspecified address with this member's peer port | UDP and TCP peer address to bind |
| `--start` | `rejoin` | `bootstrap` only for a first start, or a restart together with every client. See [First start](/docs/cluster/keep/setup#first-start) |
| `--incarnation` | The wall-clock second | Starting number for this run, which must be higher than earlier runs. Peers raise it past any newer run they remember |
| `--ready-file` | None | A file kept present while this member is settled, or while a single server listens |

## Secrets and TLS

| Flag | Default | Purpose |
|---|---|---|
| `--secret-file` | `KEEP_SECRET` | The cluster secret, 32 hexadecimal digits, shared with clients |
| `--peer-secret-file` | `KEEP_PEER_SECRET` | The peer secret, 32 hexadecimal digits, members only. Must differ from the cluster secret |
| `--tls` | `rpk` | `rpk` for raw public keys, `ca` for certificates, `off` for plaintext with a challenge |
| `--tls-key` | None | This server's private key, PEM or DER (`rpk` and `ca`) |
| `--tls-clients` | None | Client public keys the client port accepts, PEM (`rpk`) |
| `--tls-servers` | None | Member public keys the peer port accepts and dials, this member's included, PEM (`rpk`, cluster members) |
| `--tls-cert` | None | This server's certificate chain, PEM (`ca`) |
| `--tls-ca` | None | The CA every client chain leads to, PEM (`ca`) |
| `--tls-peer-ca` | None | The CA every member chain leads to, PEM (`ca`, cluster members) |

A TLS flag that the selected mode does not use is refused at startup. [Security](/docs/cluster/keep/security) explains the modes.

## CPU

| Flag | Default | Purpose |
|---|---|---|
| `--shards` | The CPU budget | Shard count, from the cpuset and cgroup `cpu.max`. In a cluster, it must match this member's entry |
| `--cpus` | The allowed CPUs | CPUs for the shards, as in `0-3,8` |
| `--pin` | `auto` | `auto` pins shards when the budget is exclusive and has a CPU per shard; `never` leaves them unpinned |
| `--steering` | `auto` | `auto` uses CPU steering when every shard is pinned and owns one receive queue; `hash` and `cpu` force a method. `cpu` needs a CPU for every shard |
| `--spin-us` | 0 | Microseconds an idle shard polls before it parks, at most 1,000. Needs pinned shards and no CPU quota |

[Tuning](/docs/cluster/keep/tuning) explains how to choose these values.

## Limits

| Flag | Default | Purpose |
|---|---|---|
| `--memory` | None | Memory cap in bytes, split evenly between the shards |
| `--max-value` | 4,194,304 | Largest value or event payload in bytes, at most 4 MiB. Stalwart needs at least 512 KiB plus a header |
| `--max-lock-ttl` | 600 | Longest lock TTL in seconds, which sets the [lock quarantine](/docs/cluster/keep/operations#lock-quarantine). Must be equal on all members, and at least 6 in a cluster. Stalwart needs at least 600 |
| `--max-stop` | 30 | Longest total pause with a stopped clock that the deployment accepts, in seconds, at most 600. Added to the quarantine |

A cluster warns when `--max-lock-ttl` is below 16 seconds, since a leaving member then discards its keys before the members receiving them stop waiting.

## Streams

| Flag | Default | Purpose |
|---|---|---|
| `--stream-coalesce-us` | 100 | Microseconds a busy subscriber's output may be held to combine events, at most 10,000. 0 disables it |
| `--stream-coalesce-fanout` | 16 | Subscriber connections needed before coalescing applies. 0 applies it at any number |

## Statistics

| Flag | Default | Purpose |
|---|---|---|
| `--stats-interval` | 0 | Seconds between [statistics lines](/docs/cluster/keep/operations#statistics) on standard error. 0 prints none |
| `--stats-shards` | Off | Adds one line per shard. Needs `--stats-interval` |

## Fixed limits

The following limits have no setting:

- Keys are at most 255 bytes. Stalwart shortens longer keys, written by expressions and Sieve scripts, with a hash.
- TTLs are whole seconds. An entry lives at least its TTL, and at most one second longer.
- A shard accepts at most 65,536 connections, and a connection holds at most 4,096 subscriptions.
- A subscriber with more than 16 MiB of pending output starts to skip events, and is told about it.
- A cluster can list up to 4,096 members, and 16,384 slots divide the keys among them.
- Keys whose first byte is 0, 1 or 14 to 17 are never evicted, and locks must use them. Stalwart's do.
