---
sidebar_position: 2
title: "Installation"
description: "Install Vandelay with the install script, Homebrew, npm, a Windows installer or from source, and verify a release."
---

Vandelay is a single binary without runtime dependencies, built for Linux, macOS and Windows. Every installation method below delivers the same `vandelay` executable.

Vandelay is versioned independently of Stalwart. Its current release is the one to use with any Stalwart release.

## Install script (Linux and macOS)

The install script downloads the binary for the host's platform and architecture, and installs it into the Cargo binary directory (`$CARGO_HOME/bin`, by default `~/.cargo/bin`):

```sh
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/stalwartlabs/vandelay/releases/latest/download/vandelay-installer.sh | sh
```

The `--proto '=https'` and `--tlsv1.2` options restrict the download to HTTPS with TLS 1.2 or later. Piping a downloaded script into a shell runs it without inspection. To review the script first, download it to a file, and run it after reading it.

## Homebrew

On systems that use Homebrew, Vandelay is installed from the Stalwart tap, and upgraded with `brew upgrade`:

```sh
brew install stalwartlabs/tap/vandelay
```

## Windows

On Windows, the install script runs in PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -c "irm https://github.com/stalwartlabs/vandelay/releases/latest/download/vandelay-installer.ps1 | iex"
```

Each release also includes an `.msi` installer for x86-64 Windows, for environments that deploy software with a conventional installer.

## npm

Where tools are managed with Node.js, Vandelay is installed globally from npm:

```sh
npm install -g @stalwartlabs/vandelay
```

## Building from source

Vandelay is written in Rust. It can be built from a checkout of its repository with a recent toolchain, for example to run an unreleased revision:

```sh
cargo install --path .
```

## Verifying a release

For each release, the [releases page](https://github.com/stalwartlabs/vandelay/releases) publishes archives of the binary for every platform, a SHA-256 checksum file for each archive (`<archive>.sha256`), and a combined `sha256.sum`. Releases are also covered by GitHub build provenance attestations, which `gh attestation verify <file> --repo stalwartlabs/vandelay` checks. To verify a manually downloaded archive against its checksum file:

```sh
sha256sum -c vandelay-x86_64-unknown-linux-gnu.tar.gz.sha256
```

## Checking the installation

The installed version is printed by:

```sh
vandelay --version
```

The [Usage](/docs/migration/import-export/usage) page introduces the commands and the options they share.
