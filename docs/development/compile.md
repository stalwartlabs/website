---
sidebar_position: 2
---

# Compiling Stalwart

Compiling Stalwart from the source has the main advantage that binaries are built with optimizations specific to your hardware which may result in better performance.
Another advantage is that you may enable or disable features to suit your needs, thus reducing the size of the binary and the memory footprint.

## Install Rust

To compile Stalwart you need the latest version of [Rust](https://www.rust-lang.org/). The fastest way to install rust is with ``rustup``. On Unix systems run the following in your terminal, then follow the onscreen instructions

```bash
$ curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

If you are running Windows 64-bit, download and run [rustup‑init.exe](https://rustup.rs), then follow the onscreen instructions. 

## Clone the repository

Clone the Stalwart repository:

```bash
$ git clone https://github.com/stalwartlabs/stalwart.git
$ cd stalwart
```

## Install any required dependencies

If you are compiling the Foundation DB backend, download and install the [Foundation DB client library](https://github.com/apple/foundationdb/releases).

## Compile

For example, to compile Stalwart with the RocksDB, ElasticSearch support and Enterprise [features](#available-features):

```bash
$ cargo build --release -p stalwart --no-default-features --features "rocks elastic redis enterprise"
```

Or, to compile the FoundationDB backend:

```bash
$ cargo build --release -p stalwart  --no-default-features --features "foundationdb enterprise"
```

:::tip Grab a cup of coffee

Rust is a powerful language, but it can take some time to compile large projects like Stalwart, especially with multiple features enabled. Be patient!

:::

Once the compilation process is completed, the Stalwart binary will be available under ``target/release/stalwart``.

## Available Features

You can enable the following features when compiling Stalwart by using the ``--features`` flag:

### Data store backends

- `rocks`: RocksDB backend
- `sqlite`: SQLite backend
- `foundationdb`: FoundationDB backend
- `postgres`: PostgreSQL backend
- `mysql`: MySQL backend

### Blob store backends

- `s3`: S3 backend
- `azure`: Azure backend

### FTS backends

- `elastic`: ElasticSearch backend

### In-memory backends

- `redis`: Redis backend

### Message queue backends

- `nats`: NATS backend
- `zenoh`: Eclipse Zenoh backend
- `kafka`: Kafka backend

### Other features

- `enterprise`: Enterprise features
