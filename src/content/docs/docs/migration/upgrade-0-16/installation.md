---
sidebar_position: 2
title: "Installation"
description: "Install stalwart-migrate from the install script, a release archive or the Docker image, and map the paths and file ownership of both stores."
---

`stalwart-migrate` runs on a host that meets the [requirements](/docs/migration/upgrade-0-16/#requirements), where it reaches both stores under the paths and network names that the servers use. The way to install it follows the way Stalwart itself was installed:

- **As a binary**, for a Stalwart server installed with the install script or from a release archive. The binary is installed with its own [install script](#installing-with-the-script) or from a [release archive](#downloading-a-release-archive), for Linux and macOS.
- **As a Docker image**, for a Stalwart server running in Docker. The [image](#running-the-docker-image) sees the same paths, networks and file ownership as the Stalwart container, and nothing is installed on the host.

Only one of the two is needed. Windows is not supported natively, so Windows hosts run the Docker image, or the Linux binary in WSL.

The build to choose depends on the data store. The standard build supports every data store and blob store except FoundationDB. Deployments on FoundationDB install the `-fdb` build instead, which adds FoundationDB to the standard build. It is available for Linux on x86_64 and aarch64 with glibc 2.34 or later, and it requires the FoundationDB 7.4 client library (`libfdb_c.so`) on the host. The `-fdb` image already contains the library.

:::note
A Stalwart server compiled without the `enterprise` feature is migrated with the `-oss` version of the tool: the `--oss` option of the install script, the `stalwart-migrate-oss-<target>.tar.xz` archives, or the image tags ending in `-oss`.
:::

## Installing the binary

The binary is installed either with the install script, which picks the right archive for the host, or by hand from a release archive. The two methods install the same binary.

### Installing with the script

The install script detects the operating system and CPU, downloads the matching archive of the latest release, verifies its SHA-256 checksum, and installs the binary:

```bash
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/stalwartlabs/stalwart-migrate/releases/latest/download/stalwart-migrate-installer.sh | sh
```

Options are passed to the script after `sh -s --`, for example `| sh -s -- --fdb`. The script accepts the following options:

| Option | Effect |
|---|---|
| `--fdb` | Installs the `-fdb` build. |
| `--version <VER>` | Installs release `<VER>`, for example `1.0.0`, instead of the latest one. |
| `--to <DIR>` | Installs into `<DIR>`. The `STALWART_MIGRATE_INSTALL_DIR` environment variable has the same effect. |
| `--musl` | On Linux, installs the statically linked musl build. |

Without `--to`, the binary goes to `/usr/local/bin` when the script runs as root, and to `~/.local/bin` otherwise. On Linux, the script chooses between two builds: the glibc build when the host has glibc 2.28 or later, and the musl build otherwise, for example on Alpine Linux.

### Downloading a release archive

Every release on the [releases page](https://github.com/stalwartlabs/stalwart-migrate/releases) carries one archive per build and platform. The standard build is named `stalwart-migrate-<target>.tar.xz`, and the `-fdb` build `stalwart-migrate-fdb-<target>.tar.xz`, with these targets:

| Platform | Target |
|---|---|
| Linux x86_64 (glibc) | `x86_64-unknown-linux-gnu` |
| Linux x86_64 (musl, static) | `x86_64-unknown-linux-musl` |
| Linux aarch64 (glibc) | `aarch64-unknown-linux-gnu` |
| Linux aarch64 (musl, static) | `aarch64-unknown-linux-musl` |
| Linux ARMv7 (glibc) | `armv7-unknown-linux-gnueabihf` |
| Linux ARMv7 (musl, static) | `armv7-unknown-linux-musleabihf` |
| macOS Apple silicon | `aarch64-apple-darwin` |
| macOS Intel | `x86_64-apple-darwin` |

The `-fdb` archives exist only for the two glibc targets on x86_64 and aarch64. The ARMv7 archives are built on a best-effort basis, so a release may lack them.

Each archive comes with a `.sha256` file, and `sha256.sum` lists the checksums of all archives and of the install script. The archives also carry GitHub build provenance attestations. The following commands verify an archive and install the binary from it:

```bash
sha256sum -c stalwart-migrate-x86_64-unknown-linux-gnu.tar.xz.sha256
gh attestation verify stalwart-migrate-x86_64-unknown-linux-gnu.tar.xz --repo stalwartlabs/stalwart-migrate
tar -xJf stalwart-migrate-x86_64-unknown-linux-gnu.tar.xz
sudo install -m 0755 stalwart-migrate-x86_64-unknown-linux-gnu/stalwart-migrate /usr/local/bin/
```

The macOS binaries are not notarised. A web browser marks a downloaded archive as quarantined, and macOS refuses to run a binary from such an archive until the attribute is removed with `xattr -d com.apple.quarantine stalwart-migrate`. Archives downloaded with the install script or with `curl` are not quarantined.

## Running the Docker image

This method replaces the binary installation above. The tool runs in a container next to the Stalwart container, and every command is passed to the container.

The image is published as `stalwartlabs/stalwart-migrate` on Docker Hub and as `ghcr.io/stalwartlabs/stalwart-migrate`, for `linux/amd64` and `linux/arm64`, and it is signed with cosign. Its tags follow the releases (`1.0.0`, `1.0`, `latest`). The `-fdb` image uses the same tags with a suffix (`1.0.0-fdb`, `latest-fdb`).

The image is built on the same base as the Stalwart image, and runs as the same `stalwart` user (uid and gid 2000). The files it creates in the 1.0 store therefore belong to the user that the 1.0 container runs as. The image declares these volumes:

| Path | Content |
|---|---|
| `/etc/stalwart` | The 0.16 configuration directory, as in the Stalwart image |
| `/var/lib/stalwart` | The 0.16 data directory, as in the Stalwart image |
| `/etc/stalwart-v1` | The configuration directory of the new 1.0 server |
| `/var/lib/stalwart-v1` | The data directory of the new 1.0 server |
| `/var/lib/stalwart-migrate` | The [state directory](/docs/migration/upgrade-0-16/prepare#state-directory) |

### Running a command

The entry point is `stalwart-migrate`, so the command and its options follow the image name. The container runs on the network of the Stalwart deployment, with the environment file and the volumes of the Stalwart service. It then reaches the stores under the same names and paths as the server:

```bash
docker run --rm -it \
  --network <compose-network> \
  --env-file <same env as the stalwart service> \
  -v <stalwart-etc-volume>:/etc/stalwart:ro \
  -v <stalwart-data-volume>:/var/lib/stalwart \
  -v <new-v1-etc-volume>:/etc/stalwart-v1 \
  -v <new-v1-data-volume>:/var/lib/stalwart-v1 \
  -v <migrate-state-volume>:/var/lib/stalwart-migrate \
  stalwartlabs/stalwart-migrate:<version> run \
    --source /etc/stalwart/config.json \
    --target /etc/stalwart-v1/config.json \
    --state /var/lib/stalwart-migrate
```

### Using Docker Compose

With Docker Compose, the same setup is a service that shares the network, volumes and environment file of the `stalwart` service. The `migrate` profile keeps the service from starting with the rest of the deployment:

```yaml
services:
  migrate:
    image: stalwartlabs/stalwart-migrate:<version>
    profiles: [migrate]
    env_file: stalwart.env
    volumes:
      - stalwart-etc:/etc/stalwart:ro
      - stalwart-data:/var/lib/stalwart
      - stalwart-v1-etc:/etc/stalwart-v1
      - stalwart-v1-data:/var/lib/stalwart-v1
      - migrate-state:/var/lib/stalwart-migrate

volumes:
  stalwart-v1-etc:
  stalwart-v1-data:
  migrate-state:
```

The `stalwart-etc` and `stalwart-data` volumes are those already declared for the `stalwart` service. Each command then runs with `docker compose run --rm migrate <command> <options>`. For example, `prepare` runs as follows:

```bash
docker compose run --rm migrate prepare \
  --source /etc/stalwart/config.json \
  --state /var/lib/stalwart-migrate
```

### Mounting the new store in the 1.0 container

The target configuration serves two readers. Its paths are the paths that the tool writes to, and the 1.0 server later reads the same configuration. The 1.0 container must therefore mount the new data volume at the path that the target configuration names, `/var/lib/stalwart-v1` in these examples. Its configuration volume, by contrast, can be mounted at the usual `/etc/stalwart`.

The data can also be mounted at `/var/lib/stalwart` in the 1.0 container. In that case, the target configuration names `/var/lib/stalwart`, and the tool is run with `--target-path-map /var/lib/stalwart=/var/lib/stalwart-v1`, as described below.

## Paths and file ownership

The configuration files and the 0.16 settings contain paths, such as a RocksDB directory, a SQLite file, a file system blob store or a FoundationDB cluster file. The tool reads these paths exactly as the servers see them.

The tool may run where those paths differ, for example against the volumes of a Docker deployment from the host. Two options then rewrite path prefixes: `--path-map` on the 0.16 side, and `--target-path-map` on the 1.0 side. Both can be given several times. The following run reads and writes the volumes of a Docker deployment from the host:

```bash
stalwart-migrate run \
  --source ./v016/config.json \
  --target ./v1/config.json \
  --state /var/lib/stalwart-migrate \
  --path-map /var/lib/stalwart=/srv/docker/stalwart/data \
  --target-path-map /var/lib/stalwart-v1=/srv/docker/stalwart-v1/data \
  --owner 2000:2000
```

`--owner` sets the owner of the files and directories that the tool creates for the target. It matters when the tool runs as root and the 1.0 server runs as another user. The official container image runs as uid 2000, and a server installed with the install script runs as the `stalwart` user, whose owner is given as `--owner "$(id -u stalwart):$(id -g stalwart)"`. Without the option, the 1.0 server cannot open the files that a run as root created. Running as root without `--owner` produces a warning before any target file is created.

`prepare` asks its questions interactively, so in a container it needs a terminal attached: `docker run -it`, `docker compose run`, `kubectl run -it` or `kubectl exec -it`.
