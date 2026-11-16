---
sidebar_position: 1
title: "Overview"
description: "stalwart-cli, the command-line tool and interactive console for managing Stalwart: installation, connecting and signing in, object names, output formats and common tasks."
---

`stalwart-cli` is the command-line tool for administering a Stalwart server. It covers the same ground as the [WebUI](/docs/management/webui/), but from a terminal, which makes it the natural choice for scripts, for automation and for [declarative deployments](/docs/management/cli/infrastructure-as-code), in which the desired configuration is kept in files and applied to the server on every change.

Everything the CLI does goes through the server's management API. Stalwart describes its configuration as objects, such as domains, accounts and listeners, and exposes them over JMAP, the HTTP and JSON protocol that it also offers to mail clients. The configuration objects belong to the `urn:stalwart:jmap` capability, and their JMAP type names carry the `x:` prefix. The CLI reads and changes these objects through the same API that the WebUI uses, so a change made with one tool is visible in the other.

The tool is schema-driven. On first use, it downloads from the server a description of every object, its fields and its forms, and caches it locally. The CLI derives its validation and its output from this schema. The same binary therefore works with any Stalwart server version without being rebuilt.

The CLI works in two ways. Its subcommands each perform one task and suit scripts and automation. Run without arguments in a terminal, it opens the [interactive console](/docs/management/cli/console) instead: a full-screen interface for browsing and editing the configuration, watching the dashboard and following live traces, aimed at administrators who work from a terminal.

## Capabilities at a glance

Each task has its own subcommand, and each subcommand has its own page:

| Task | Command | Title |
|---|---|---|
| Browse and edit the server interactively | `tui`, or no arguments | [Interactive console](/docs/management/cli/console) |
| Inspect what objects and enums the server exposes | `describe` | [Exploring the schema](/docs/management/cli/describe) |
| Read a single object by id (or a singleton) | `get` | [Fetching a single object](/docs/management/cli/get) |
| List or filter objects of a given type | `query` | [Searching and listing](/docs/management/cli/query) |
| Create a single object | `create` | [Creating objects](/docs/management/cli/create) |
| Modify an existing object (or singleton) | `update` | [Updating objects](/docs/management/cli/update) |
| Destroy one or more objects | `delete` | [Removing objects](/docs/management/cli/delete) |
| Apply a plan of operations from an NDJSON file | `apply` | [Declarative bulk operations](/docs/management/cli/apply), [Plan file format](/docs/management/cli/plan-format), [Idempotent plans](/docs/management/cli/idempotent-plans) |
| Export the server's configuration as a plan | `snapshot` | [Exporting server state](/docs/management/cli/snapshot) |
| Sign out and forget a stored sign-in | `logout` | [Stored sessions](#stored-sessions) |

The six commands from `describe` to `delete` work on one object, or one list of objects, at a time. `apply` and `snapshot` work on whole plans, which are files that describe many changes at once. [Infrastructure as code](/docs/management/cli/infrastructure-as-code) shows how to drive them from Ansible, Terraform, NixOS, Pulumi and CI pipelines.

## Installation

Binaries are published for macOS (Intel and Apple Silicon), Linux (x86_64, aarch64, armv7 and arm, glibc and musl) and Windows (x86_64). A multi-architecture Docker image is published alongside them.

The installers below cover the common platforms. On macOS and Linux, the shell installer detects the host and downloads the matching binary:

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
npm install -g stalwart-cli
```

### Docker (all platforms)

Every release publishes a multi-architecture image, for `linux/amd64` and `linux/arm64`, to both GitHub Container Registry and Docker Hub:

```sh
docker run --rm ghcr.io/stalwartlabs/cli --version
docker run --rm stalwartlabs/cli --version
```

The image tags follow the releases. A full version such as `:1.2.3` pins one release, the minor series such as `:1.2` follows its patch releases, and `:latest` follows the newest release. The images are signed with [cosign](https://docs.sigstore.dev/cosign/overview/) and carry build-provenance attestations, so their origin can be verified before they are run.

Inside a container, the connection settings come from the environment. Commands that read or write files, such as `apply --file` and `snapshot --output`, also need a working directory bind-mounted into the container, because the container cannot otherwise see the host's files:

```sh
docker run --rm \
  -e STALWART_URL=https://mail.example.com \
  -e STALWART_TOKEN \
  ghcr.io/stalwartlabs/cli query Account --fields id,name

docker run --rm \
  -v "$PWD:/work" -w /work \
  -e STALWART_URL -e STALWART_TOKEN \
  ghcr.io/stalwartlabs/cli apply --file plan.ndjson
```

The container runs as a non-root user whose home is `/home/nonroot`. Each new container starts with an empty home, so it would download the schema again on every run. Mounting a volume at `/home/nonroot/.cache` keeps the [schema cache](#schema-cache) across runs and avoids that download:

```sh
docker run --rm \
  -v stalwart-cli-cache:/home/nonroot/.cache \
  -e STALWART_URL -e STALWART_TOKEN \
  ghcr.io/stalwartlabs/cli describe
```

A [stored sign-in](#stored-sessions) is kept elsewhere, under `/home/nonroot/.local/share`, so a container that signs in with a device code needs a second volume there to stay signed in. The [interactive console](/docs/management/cli/console) also needs a terminal, which `docker run` allocates with `-it`:

```sh
docker run --rm -it \
  -v stalwart-cli-cache:/home/nonroot/.cache \
  -v stalwart-cli-data:/home/nonroot/.local/share \
  -e STALWART_URL \
  ghcr.io/stalwartlabs/cli
```

### Windows MSI

Each release also publishes a signed `.msi` installer at `https://github.com/stalwartlabs/cli/releases/latest`. Running it performs a standard Windows install.

### Building from source

Building from source requires a Rust toolchain recent enough to support edition 2024:

```sh
git clone https://github.com/stalwartlabs/cli.git
cd cli
cargo install --path .
```

Whatever the installation method, the following command confirms that the binary runs:

```sh
stalwart-cli --version
```

## Connecting to a server

Every invocation needs two things: the URL of the server and a credential to authenticate with. Both are given through global options, which may appear before or after the subcommand, or through the matching environment variables:

| Flag | Environment variable | Purpose |
|---|---|---|
| `--url <URL>` | `STALWART_URL` | The Stalwart server endpoint (required). |
| `--user <USER>` | `STALWART_USER` | Basic-auth username. |
| `--password <PASS>` | `STALWART_PASSWORD` | Basic-auth password. Prompted interactively if absent and stdin is a TTY. |
| `--api-key <TOKEN>` | `STALWART_TOKEN` | Bearer token: an [API key](/docs/auth/authentication/api-key) or an OAuth access token. Mutually exclusive with `--user`. |
| `--auth <METHOD>` | `STALWART_AUTH` | Sign-in method when neither `--api-key` nor `--user` is given: `device` or `basic` ([Device sign-in](#device-sign-in)). |
| `--client-id <ID>` | `STALWART_CLIENT_ID` | OAuth client to use for the device sign-in, instead of registering one. |
| `--insecure` / `-k` | (none) | Skip TLS certificate verification (matches `curl -k`). |
| `--no-color` | (none) | Disable ANSI colour output. The `NO_COLOR` environment variable also disables colours. |
| `--debug` | `STALWART_DEBUG` | Print diagnostics of the HTTP requests and responses to standard error. |

The choice of credential depends on who runs the CLI. An administrator at a terminal is best served by the [device sign-in](#device-sign-in), which stores a session and asks for nothing on later runs, or by a user name and password. Unattended jobs are better served by a bearer token. Against a local development server, the options are usually passed on the command line:

```sh
stalwart-cli --url http://localhost:8080 --user admin --password admin describe
```

Scripts and CI pipelines are better served by the environment variables, because they keep the credentials out of the command line:

```sh
export STALWART_URL=https://mail.example.com
export STALWART_USER=admin
export STALWART_PASSWORD='changeme'
stalwart-cli describe
```

For unattended use, an API key avoids storing an account password at all:

```sh
export STALWART_URL=https://mail.example.com
export STALWART_TOKEN='API_<key>'
stalwart-cli describe
```

The credential also determines what the CLI may do, because the server checks every call against the permissions of the account behind it. A key used with the CLI needs the `authenticate` permission and the `sys*` permissions of the objects it reads and changes. Editing domains, for example, takes `sysDomainGet` and `sysDomainUpdate`. Reading the schema requires no further permission.

The CLI talks to two endpoints. It sends its management calls to the JMAP endpoint named in the server's session, and it fetches the schema from `/api/schema`.

### Device sign-in

The device sign-in authenticates the CLI with OAuth instead of a password. It uses the [device authorization flow](/docs/auth/oauth/authorization#device-authorization-flow), designed for programs that cannot show a sign-in page themselves: the CLI obtains a short code from the server, the administrator opens the server's verification page in any browser, enters the code and signs in there, and the CLI receives a token once the request is approved. The password never passes through the CLI, and an account protected by [two-factor authentication](/docs/auth/authentication/2fa) signs in this way like any other.

When a command runs at a terminal with neither `--api-key` nor `--user`, and no [stored session](#stored-sessions) exists for the server, the CLI starts the device sign-in on its own, provided that the server supports it. It writes the instructions to standard error and waits for the approval:

```text
To sign in, open <verification URL>
and enter the code <code>
(or open <verification URL with the code filled in>)
Waiting for approval...
Signed in as <account>.
```

Only a code shown by the CLI itself should ever be approved. A code received from someone else would grant that person access to the account.

`--auth device` requests the device sign-in explicitly, and `--auth basic` rules it out, so that the CLI fails rather than waits for a browser that nobody will open. Without a terminal, for example in a CI job, the CLI never starts the device sign-in and needs an explicit credential.

The device sign-in needs an OAuth client. Against Stalwart's own authorization server, the CLI [registers itself](/docs/auth/oauth/register-client#register-a-native-or-mail-client-dynamically) on first use under the name `Stalwart CLI` and remembers the client for later sign-ins. A server that refuses dynamic registration, or that delegates sign-in to an external identity provider, requires a client registered in advance, whose id is passed with `--client-id`; the client's `grantTypes` must include `deviceCode`. Without it, an external identity provider is refused with `an OAuth client id registered with the identity provider is required`.

### Stored sessions

A successful device sign-in is stored, so that later commands, and the [interactive console](/docs/management/cli/console), reuse it without any option. The CLI refreshes the access token before it expires and signs in again only when the refresh token itself is no longer valid, at which point commands fail with `session expired; sign in again`.

Sessions are kept per server and per account, readable by the owner only, in the user's local data directory:

* Linux: `~/.local/share/stalwart-cli/auth/`
* macOS: `~/Library/Application Support/stalwart-cli/auth/`
* Windows: `%LOCALAPPDATA%\stalwart-cli\auth\`

An explicit credential always takes precedence: `--api-key` or `--user` ignore the stored session for that command. `logout` signs out of the server named by `--url`. It revokes the session's tokens on the server and deletes the stored session, and when no session is stored it reports `Not signed in to <url>.` Without `--user` it signs out the account that signed in last; with `--user`, or `STALWART_USER`, it signs out that account. When no session is stored for that account, it reports `Not signed in to <url> as <account>.`, and names the account that did sign in last if there is one, which helps when `STALWART_USER` is still exported from an earlier password sign-in:

```sh
stalwart-cli --url https://mail.example.com logout
```

## Object naming

Object names are flexible on the command line. The CLI accepts them with or without the `x:` prefix, and it ignores case, so the following commands are all equivalent:

```sh
stalwart-cli get Domain abc123
stalwart-cli get domain abc123
stalwart-cli get x:Domain abc123
stalwart-cli get X:DOMAIN abc123
```

Before it sends a request, the CLI converts the name to its canonical form. The human-readable output leaves out the `x:` prefix, so `x:Domain` is shown as `Domain`.

## Singletons

Most object types can have any number of instances, but some configuration objects are singletons: they have exactly one instance per server, such as the server-wide settings or the JMAP limits. A singleton has no id of its own. It is addressed by the literal id `singleton`, and the CLI uses that id when none is given, so the JMAP limits singleton can be fetched with either of these commands:

```sh
stalwart-cli get jmap
stalwart-cli get jmap singleton
```

Because there is always exactly one instance, a singleton cannot be created or destroyed, only updated. [Updating objects](/docs/management/cli/update) and [Fetching a single object](/docs/management/cli/get) cover the details.

## Multi-variant objects

Some objects come in several variants, which share a type name but have different fields. `Account` is one: an account is either a `User` or a `Group`. An `@type` field records the variant of each object. [Creating](/docs/management/cli/create) such an object therefore needs the variant, which can be given in either of two equivalent forms:

* The `Object/Variant` shorthand, as in `stalwart-cli create Account/User ...`, which sets `@type`. The variant name is matched without regard to case.
* An explicit `@type`, passed with `--field` or as part of a `--json` payload.

The shorthand is accepted only by `create`. The other commands, [`get`](/docs/management/cli/get), [`query`](/docs/management/cli/query), [`update`](/docs/management/cli/update) and [`delete`](/docs/management/cli/delete), take only the bare object name and reject the slash form.

## Output formats

Every read command can produce output for people or for programs. By default, the CLI renders a human-readable view, laid out according to the form definitions in the schema. With `--json`, it writes compact, machine-readable JSON instead.

The shape of the JSON depends on the command. `get --json` writes a single line, because it returns one object. `query --json`, `apply --json` and `snapshot` write NDJSON (newline-delimited JSON), in which every line is a complete JSON record and there is no enclosing array. A program can therefore process the output record by record, and it pipes directly into `jq` and similar tools. When a tool needs a single JSON array, `jq -s '.'` turns an NDJSON stream into one.

The human-readable view uses ANSI colour when its stream is a terminal. Standard output, which carries the results, and standard error, which carries progress, warnings and errors, are judged separately, so piping the results to a file keeps the progress coloured. Colour is turned off in any of the following cases:

* The stream is not a terminal, for example when the output is piped to `head`, `less` or a file.
* The `NO_COLOR` environment variable is set to a non-empty value.
* The `TERM` environment variable is `dumb`.
* `--no-color` is passed.

These rules also apply to the help screens.

## Schema cache

So that it does not download the schema on every command, the CLI fetches it from `/api/schema` and caches it under the standard XDG cache directory:

* Linux: `~/.cache/stalwart-cli/<server-hash>/`
* macOS: `~/Library/Caches/stalwart-cli/<server-hash>/`
* Windows: `%LOCALAPPDATA%\stalwart-cli\<server-hash>\`

The `<server-hash>` is derived from the server URL, which keeps the schemas of several servers apart. Before each command, the CLI checks whether the server's schema has changed, and downloads it again only if it has. When the server cannot be reached but a cached copy exists, the CLI prints a warning and carries on with the cached schema.

## Errors

The CLI reports every error in the same way. It writes the error to stderr in the form `error: <message>` and exits with status 1, so a script can detect a failure from the exit status alone.

The message carries as much detail as the server provides. A JMAP-level error is reported with its `type` and `description`. A per-object set error, such as a validation failure, a primary key violation or a refusal to delete an object that others depend on, also includes the affected properties and any linked objects that the server returns.

When the output is piped to a program that exits early, such as `head`, the closed pipe ends the output without an error.

## Getting help

Every subcommand has standard help:

```sh
stalwart-cli --help
stalwart-cli get --help
stalwart-cli apply --help
```

This help describes the options of the CLI. Help on the schema itself, meaning the descriptions of objects, fields, enumerations, filters and sort options, comes from the [`describe`](/docs/management/cli/describe) command.

## Common tasks

### Create the first administrator

A new server has no administrator account yet. Its only administrative credential is the [recovery administrator](/docs/configuration/recovery-mode#recovery-administrator), set with the `STALWART_RECOVERY_ADMIN` environment variable. Sign in with those credentials and create a permanent administrator account. In the following command, `b` is the id of the domain:

```sh
export STALWART_URL=https://mail.example.com
stalwart-cli --user admin --password '<recovery password>' create Account/User \
  --field name=admin \
  --field domainId=b \
  --field 'roles={"@type":"Admin"}' \
  --field 'credentials={"0":{"@type":"Password","secret":"<new password>"}}'
```

Then sign in as the new account and remove `STALWART_RECOVERY_ADMIN`. [Managing accounts](/docs/auth/accounts/manage) covers the other account operations.

### Copy configuration between servers

Copying configuration takes two commands. [`snapshot`](/docs/management/cli/snapshot) exports configuration objects of one server as a plan, and [`apply`](/docs/management/cli/apply) recreates them on another. A dry run before the real apply checks the plan without changing the target:

```sh
stalwart-cli --url https://old.example.com snapshot Tenant Domain \
    --allow-unresolved Role,Directory,AcmeProvider,Certificate,DkimSignature,DnsServer \
    --output plan.ndjson
stalwart-cli --url https://new.example.com apply --file plan.ndjson --dry-run
stalwart-cli --url https://new.example.com apply --file plan.ndjson
```

The plan does not carry secrets unless the snapshot is taken with `--include-secrets` from a server that returns them ([Secrets](/docs/management/cli/snapshot#secrets)). [Idempotent plans](/docs/management/cli/idempotent-plans) explains how to make such a plan safe to run repeatedly.

### Command failures

A failed command writes `error: <message>` to standard error and exits with status 1. The message usually names the cause, and these are the ones that come up most often:

- `no credentials provided (use --user / --password, --api-key or --auth device)`: the command has no credential, no stored session exists for the server, and the device sign-in did not start, because no terminal is attached or `--auth basic` was given.
- `no credentials provided and device sign-in is unavailable: <reason> (use --user / --password or --api-key)`: the CLI tried the device sign-in at a terminal, but the server cannot offer it, and the message names the reason. The usual causes are a server in [recovery mode](/docs/configuration/recovery-mode), a server without a device authorization endpoint, and an external identity provider for which no `--client-id` was given.
- `authentication failed (HTTP 401)`: the credential is wrong, expired, or lacks `authenticate`. An account with [two-factor authentication](/docs/auth/authentication/2fa) refuses a password alone, so use the [device sign-in](#device-sign-in) or an API key for it.
- `session expired; sign in again`: the stored session can no longer be refreshed, for example because it was revoked. `stalwart-cli logout` followed by a new device sign-in replaces it.
- `the sign-in request was denied` or `the sign-in code expired`: the device sign-in was refused in the browser, or not completed before the code expired.
- `permission denied (HTTP 403)`, or a `forbidden` error on an object: the credential lacks the `sys*` permission of the object or, when changing an account, a permission that the account holds ([Granting permissions to other accounts](/docs/auth/authorization/permissions#granting-permissions-to-other-accounts)).
- `not found (HTTP 404)`: `--url` points to the wrong address, for example a WebUI path such as `https://mail.example.com/admin`. It must name the server, such as `https://mail.example.com`.
- `URL '<url>' is missing a scheme; prefix it with https:// or http://`: the URL needs `https://` or `http://`.
- An unknown object, field or variant after a server upgrade: the cached schema is out of date. The CLI downloads the new schema when the server reports a change, and deleting the [schema cache](#schema-cache) directory forces a download.

When the summary is not enough, the global `--debug` option prints diagnostics of the HTTP requests and responses, which show the server's own error text.
