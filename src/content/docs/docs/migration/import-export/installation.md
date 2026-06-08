---
sidebar_position: 2
title: "Installation"
---

Vandelay is distributed as a single self-contained binary with no runtime dependencies, built for macOS, Linux and Windows. Several installation channels are provided so that the tool can be obtained whichever way best fits the environment, from a one-line install script to a build from source. All channels deliver the same `vandelay` executable; the choice between them is a matter of packaging and update preference.

## Install script (macOS and Linux)

The quickest way to install on macOS or Linux is the published install script, which downloads the correct binary for the host platform and architecture and places it on the path:

```sh
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/stalwartlabs/vandelay/releases/latest/download/vandelay-installer.sh | sh
```

The `--proto '=https'` and `--tlsv1.2` options ensure the download happens only over a modern, encrypted transport.

## Homebrew

On macOS and Linux systems that use Homebrew, Vandelay is available from the Stalwart tap, which also makes future upgrades a matter of the usual `brew upgrade`:

```sh
brew install stalwartlabs/tap/vandelay
```

## Windows

On Windows, the equivalent install script is run through PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -c "irm https://github.com/stalwartlabs/vandelay/releases/latest/download/vandelay-installer.ps1 | iex"
```

A signed `.msi` installer package is also published with every release for environments that prefer a conventional Windows installer or managed software deployment.

## npm

For environments that already manage tooling through Node.js, Vandelay is published as an npm package that installs the binary globally:

```sh
npm install -g @stalwartlabs/vandelay
```

## Building from source

Vandelay is written in Rust and can be compiled from a checkout of the repository with a recent toolchain. Building from source is the appropriate choice when a platform-specific build is needed, when running an unreleased revision, or when local modifications are involved:

```sh
cargo install --path .
```

## Verifying the installation

After installation, confirming that the binary is on the path and reporting its version is a useful first step:

```sh
vandelay --version
```

The same command surface is available regardless of how Vandelay was installed. The [Usage](usage) page introduces the commands and the flags they share.
