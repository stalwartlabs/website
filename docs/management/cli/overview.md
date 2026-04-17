---
sidebar_position: 1
---

# Overview

`stalwart-cli` is a small, schema-driven command line tool for administering a Stalwart Mail and Collaboration server. It speaks exclusively to the JMAP API and operates on the management/configuration objects (those whose JMAP type names are prefixed with `x:`) exposed via the `urn:stalwart:jmap` capability.

The tool is **schema-driven**: on first use it downloads (and caches) a JSON schema from the server that describes every object, its fields, the forms used to render it, and the lists used to render queries. All command behaviour, validation, and human-readable output is derived from that schema, so the same binary works against any compatible Stalwart deployment without recompilation.

## Capabilities at a glance

| Task | Command | Title |
|---|---|---|
| Inspect what objects and enums the server exposes | `describe` | [Exploring the schema](./describe.md) |
| Read a single object by id (or a singleton) | `get` | [Fetching a single object](./get.md) |
| List or filter objects of a given type | `query` | [Searching and listing](./query.md) |
| Create one or more objects | `create` | [Creating objects](./create.md) |
| Modify an existing object (or singleton) | `update` | [Updating objects](./update.md) |
| Destroy one or more objects | `delete` | [Removing objects](./delete.md) |
| Apply a bulk plan from a JSON file | `apply` | [Declarative bulk operations](./apply.md) |
| Export live server state as an apply plan | `snapshot` | [Exporting server state](./snapshot.md) |

## Installation

Pre-built binaries are produced for macOS (Intel and Apple Silicon), Linux (x86_64 and aarch64, glibc and musl), and Windows (x86_64 and aarch64). Pick the installer that matches the platform.

### macOS / Linux (shell installer)

```sh
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/stalwartlabs/cli/releases/latest/download/stalwart-cli-installer.sh | sh
```

### Windows (PowerShell installer)

```powershell
powershell -ExecutionPolicy Bypass -c "irm https://github.com/stalwartlabs/cli/releases/latest/download/stalwart-cli-installer.ps1 | iex"
```

### Homebrew (macOS / Linux)

```sh
brew install stalwartlabs/tap/stalwart-cli
```

### npm (Node.js, all platforms)

```sh
npm install -g @stalwartlabs/cli
```

### Windows MSI

A signed `.msi` installer is published with each release at
`https://github.com/stalwartlabs/cli/releases/latest`. Download and run it for a standard Windows install.

### Building from source

With a recent Rust toolchain (edition 2024):

```sh
git clone https://github.com/stalwartlabs/cli.git
cd cli
cargo install --path .
```

Verify the install with:

```sh
stalwart-cli --version
```

## Connecting to a server

Every invocation needs a server URL and a credential. The same flags are global and may appear before or after the subcommand.

| Flag | Environment variable | Purpose |
|---|---|---|
| `--url <URL>` | `STALWART_URL` | The Stalwart server endpoint (required). |
| `--user <USER>` | `STALWART_USER` | Basic-auth username. |
| `--password <PASS>` | `STALWART_PASSWORD` | Basic-auth password. Prompted interactively if absent and stdin is a TTY. |
| `--api-key <TOKEN>` | `STALWART_TOKEN` | Bearer token. Mutually exclusive with `--user`. |
| `--insecure` / `-k` | (none) | Skip TLS certificate verification (matches `curl -k`). |
| `--no-color` | (none) | Disable ANSI color output. The `NO_COLOR` environment variable also disables colors. |

A typical invocation against a local development server:

```sh
stalwart-cli --url http://localhost:8080 --user admin --password admin describe
```

Equivalent with environment variables (recommended for scripts and CI):

```sh
export STALWART_URL=https://mail.example.com
export STALWART_USER=admin
export STALWART_PASSWORD='changeme'
stalwart-cli describe
```

For unattended use, prefer an API token:

```sh
export STALWART_URL=https://mail.example.com
export STALWART_TOKEN='eyJhbGciOi...'
stalwart-cli describe
```

## Object naming

The CLI accepts object names with or without the `x:` prefix and is case-insensitive. The following are all equivalent:

```sh
stalwart-cli get Domain abc123
stalwart-cli get domain abc123
stalwart-cli get x:Domain abc123
stalwart-cli get X:DOMAIN abc123
```

Internally, names are normalised to the canonical form before any JMAP request leaves the client. In all human-readable output, the `x:` prefix is stripped (so `x:Domain` is shown as `Domain`).

## Singletons

Some configuration objects are *singletons*: there is exactly one instance per server. Singletons accept (or default to) the literal id `singleton`. For example, the JMAP limits singleton can be fetched with either of these:

```sh
stalwart-cli get jmap
stalwart-cli get jmap singleton
```

Singletons cannot be created or destroyed, only updated. The [Updating objects](./update.md) and [Fetching a single object](./get.md) pages cover the specifics.

## Multi-variant objects

Some objects (for example `Account`) have multiple variants discriminated by an `@type` field (`User`, `Group`, etc.). When [creating](./create.md) such an object, two equivalent forms are accepted:

* The shorthand `Object/Variant` syntax (`stalwart-cli create account/user ...`), which auto-injects `@type`.
* Passing `@type` explicitly via `--field` or as part of a `--json` payload.

For [`get`](./get.md), [`query`](./query.md), [`update`](./update.md), and [`delete`](./delete.md), only the bare object name is accepted (the slash form is rejected).

## Output formats

Most read commands support `--json` for machine-readable output (compact, single-line). Without `--json`, the CLI renders a human-friendly view driven by the schema's form definitions, with ANSI color when stdout is a TTY.

Color is automatically disabled when:

* stdout is not a TTY (for example, when piping to `head`, `less`, or a file).
* The `NO_COLOR` environment variable is set.
* `--no-color` is passed explicitly.

## Schema cache

The schema is fetched from `/api/schema` and cached locally under the standard XDG cache directory:

* Linux: `~/.cache/stalwart-cli/<server-hash>/`
* macOS: `~/Library/Caches/stalwart-cli/<server-hash>/`
* Windows: `%LOCALAPPDATA%\stalwart-cli\<server-hash>\`

`<server-hash>` is a URL-safe base64 of the SHA-256 of the normalised server URL, so multiple Stalwart deployments coexist in the cache without collision. The cache is consulted before each command. If the server hash hasn't changed, no schema download is issued. If the network is unreachable but a cached copy exists, the CLI emits a warning and proceeds with the cached schema.

## Errors

All errors are written to stderr in the form `error: <message>` and the process exits with a non-zero status. JMAP-level errors are surfaced with their `type` and `description`. Per-object set errors (validation failures, primary key violations, dependent-object protection, etc.) include the affected properties and any linked-object information returned by the server.

Piping output to a short-lived consumer such as `head` or `less` is handled cleanly: a broken pipe is treated as a normal end of output, not as an error.

## Getting help

Standard help is available for every subcommand:

```sh
stalwart-cli --help
stalwart-cli get --help
stalwart-cli apply --help
```

For schema-driven help (descriptions of objects, fields, enums, filters, and sort options), use the [`describe`](./describe.md) command.
