---
sidebar_position: 1
---

# Compile

Compiling Stalwart from the source has the main advantage that binaries are built
with optimizations specific to your hardware which may result in better performance.
Another advantage is that you may enable or disable features to suit your needs.

## Install Rust

To compile Stalwart you need the latest version of [Rust](https://www.rust-lang.org/). The fastest way to install rust is with ``rustup``. On Unix systems run the following in your terminal, then follow the onscreen instructions

```bash
$ curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

If you are running Windows 64-bit, download and run [rustup‑init.exe](https://rustup.rs), then follow the onscreen instructions. 

## Clone Repo

Clone the Stalwart repository:

```bash
$ git clone https://github.com/stalwartlabs/stalwart.git
$ cd stalwart
```

## Install required dependencies

The following build dependencies are required:

- `gcc`
- `clang`
- `make`
- `protoc`

```bash
$ sudo apt-get install gcc clang make protobuf-compiler
```

- If you are compiling the Foundation DB backend, download and install the [Foundation DB client library](https://github.com/apple/foundationdb/releases).

## Compile

Compile Stalwart with the default SQLite backend by executing:

```bash
$ cargo build --manifest-path=crates/main/Cargo.toml --release
```

Or, to compile the FoundationDB backend:

```bash
$ cargo build --manifest-path=crates/main/Cargo.toml --no-default-features --features foundationdb --release
```

Once the compilation process is completed, the Stalwart
binary will be available under ``target/release/stalwart``.

