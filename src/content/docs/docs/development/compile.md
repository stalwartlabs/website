---
sidebar_position: 2
title: "Compiling Stalwart"
description: "Build Stalwart from source with Rust: the build dependencies, the release to check out, and the Cargo features that select storage and coordination backends."
---

The official releases suit most installations, but there are two reasons to compile Stalwart from source. The first is to choose which storage and coordination backends the binary includes, and a binary built with fewer backends is smaller. The second is to build for a platform that has no official release. Official releases and the Docker image are built with the feature set listed in [Available features](#available-features).

## Install Rust

Stalwart is written in Rust, and it requires Rust 1.98 or later. The recommended way to install Rust is `rustup`, the official installer, which also keeps the toolchain up to date. On Unix systems, run the following command and follow the instructions it prints:

```bash
$ curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

On 64-bit Windows, download and run [rustup-init.exe](https://rustup.rs).

## Install the build dependencies

Some parts of Stalwart are built from C and C++ code, so a few tools and libraries are needed in addition to Rust. Which ones depends on the features selected:

| Dependency | Needed for |
|---|---|
| A C and C++ compiler and `make` (`build-essential` on Debian and Ubuntu) | every build |
| `libclang` (`libclang-dev` on Debian and Ubuntu) | the `rocks` feature, which generates the RocksDB bindings |
| `cmake` | the `kafka` feature |
| The [FoundationDB client library](https://github.com/apple/foundationdb/releases), version 7.4 | the `foundationdb` feature |

## Clone the repository

Clone the Stalwart repository:

```bash
$ git clone https://github.com/stalwartlabs/stalwart.git
$ cd stalwart
```

Then find the latest tagged release and check it out, for example:

```bash
$ git tag --sort=-version:refname | head -1
v1.0.0
$ git checkout tags/v1.0.0
```

:::caution
Do not compile Stalwart from the `main` branch, which may contain unfinished changes. Always build a tagged release.
:::

## Compile

A build is a `cargo build` command whose `--features` option selects the backends to include. The following command builds Stalwart with the RocksDB data store, the Redis in-memory store and the Enterprise features:

```bash
$ cargo build --release -p stalwart --no-default-features --features "rocks redis enterprise"
```

The following command builds with the FoundationDB data store instead:

```bash
$ cargo build --release -p stalwart --no-default-features --features "foundationdb redis enterprise"
```

Without `--no-default-features` and `--features`, the build includes only `rocks` and `enterprise`. In every case, the resulting binary is written to `target/release/stalwart`.

The `enterprise` feature includes the features of the [Enterprise edition](/docs/server/enterprise). These features are activated by a subscription rather than by a separate build, so the Community and Enterprise editions are the same binary.

## Available features

The following features can be passed to `--features`, grouped by the store they provide.

Data store backends:

- `rocks`: RocksDB
- `sqlite`: SQLite
- `foundationdb`: FoundationDB
- `postgres`: PostgreSQL
- `mysql`: MySQL and MariaDB

Blob store backends:

- `s3`: S3 and S3-compatible services
- `azure`: Azure Blob Storage

In-memory store backends:

- `redis`: Redis, Redis Cluster and Redis Sentinel, also used for cluster coordination through Redis

Cluster coordination backends:

- `nats`: NATS
- `zenoh`: Eclipse Zenoh
- `kafka`: Apache Kafka

Other features:

- `enterprise`: the Enterprise edition features

Some backends need no feature at all. The ElasticSearch and Meilisearch search stores and the file system blob store are included in every build. Other features cover more than one store: `postgres`, `mysql` and `foundationdb` also provide the blob and search stores of the same backend.

A binary meant for a cluster must include `redis`. A cluster coordinator requires a Redis in-memory store, so a cluster cannot be formed without it ([In-memory store](/docs/storage/in-memory)).

Official releases are built with `sqlite postgres mysql rocks s3 redis azure nats enterprise`.
