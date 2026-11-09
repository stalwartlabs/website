---
sidebar_position: 4
title: "Installation"
description: "Install Stalwart Keep from a release binary with a systemd unit, from a Docker image or from source, and verify what was downloaded."
---

Keep is a single binary with no runtime dependencies beyond the C library. This page installs it on a host or as a container. [Cluster setup](/docs/cluster/keep/setup) then creates its keys and configuration and starts it.

## Requirements

Keep runs only on Linux. Some of the following requirements are conditions of its guarantees, so a host that does not meet them is outside what Keep promises:

| Requirement | Value |
|---|---|
| Operating system | Linux, kernel 6.12 or later |
| C library | glibc 2.34 or later |
| CPU | x86_64 at the x86-64-v2 level (SSE4.2 and POPCNT), or aarch64 |
| Clock | A clock source whose raw rate is within 833 ppm of real time |

Debian 13, RHEL 10, Amazon Linux 2023 with its 6.12 kernel, and Ubuntu 24.04 with a 6.12 or later HWE kernel all qualify.

Keep times everything on the raw hardware clock, which NTP does not adjust, so wall-clock steps and slews have no effect on it. The 833 ppm requirement concerns the oscillator itself, and any server or cloud VM meets it. NTP cannot reveal a worse oscillator, because it corrects far larger errors without complaint. Keep therefore logs the kernel's correction whenever it goes above 500 ppm: a host that runs with NTP for a day without that line meets the requirement.

A host must also not be checkpointed and restored onto another host, as CRIU does, because its clocks then jump in ways Keep cannot detect.

## Network ports

Keep uses two ports. The following table shows what each carries and who must be able to reach it:

| Port | Protocol | Purpose | Reachable from |
|---|---|---|---|
| 7000 | TCP | Client connections | Stalwart nodes |
| 7100 | TCP and UDP | Heartbeats and key handoff between members | Other members only |

The peer port restriction is a requirement, not a precaution. [Peer network isolation](/docs/cluster/keep/security#peer-network-isolation) explains why, and gives an example firewall.

## Install the binary

Each [release](https://github.com/stalwartlabs/keep/releases) carries a binary for `x86_64-unknown-linux-gnu` and one for `aarch64-unknown-linux-gnu`, built against glibc 2.34 so that they run on all the systems above. The following commands download the x86_64 binary and place it in `/usr/local/bin`:

```bash
curl -LO https://github.com/stalwartlabs/keep/releases/latest/download/keep-x86_64-unknown-linux-gnu.tar.gz
sudo tar -xzf keep-x86_64-unknown-linux-gnu.tar.gz -C /usr/local/bin keep
```

## Verify a download

Release archives and images are signed with Sigstore and carry a build attestation, so a download can be traced back to the workflow in the Keep repository that built it. Verification is optional, and it needs the [cosign](https://docs.sigstore.dev/cosign/) or [GitHub](https://cli.github.com/) command-line tool on the machine that performs it.

The following command checks an archive against its Sigstore bundle, which is published next to it in the release:

```bash
curl -LO https://github.com/stalwartlabs/keep/releases/latest/download/keep-x86_64-unknown-linux-gnu.tar.gz.sigstore.json
cosign verify-blob \
  --bundle keep-x86_64-unknown-linux-gnu.tar.gz.sigstore.json \
  --certificate-identity-regexp '^https://github.com/stalwartlabs/keep/\.github/workflows/.+@refs/tags/v' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  keep-x86_64-unknown-linux-gnu.tar.gz
```

The following command checks the signature of a container image:

```bash
cosign verify ghcr.io/stalwartlabs/keep:latest \
  --certificate-identity-regexp '^https://github.com/stalwartlabs/keep/\.github/workflows/.+@refs/tags/v' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
```

The GitHub command-line tool checks the build attestation instead, for an archive or for an image. It requires a prior `gh auth login`, and it prints nothing on success unless given `--format json`:

```bash
gh attestation verify keep-x86_64-unknown-linux-gnu.tar.gz --repo stalwartlabs/keep
gh attestation verify oci://ghcr.io/stalwartlabs/keep:latest --repo stalwartlabs/keep
```

## Run under systemd

Keep ships no service unit, so the following steps create one. The first step creates an unprivileged account for the server, and a configuration directory that the account can read but not change:

```bash
sudo useradd --system --user-group --no-create-home --shell /usr/sbin/nologin keep
sudo install -d -m 0750 -o root -g keep /etc/keep
```

The second step installs the unit, as `/etc/systemd/system/keep.service`:

```ini
[Unit]
Description=Stalwart Keep
Documentation=https://stalw.art/docs/cluster/keep/
After=network-online.target
Wants=network-online.target

[Service]
Type=exec
User=keep
Group=keep
ExecStart=/usr/local/bin/keep --config /etc/keep/keep.toml
WorkingDirectory=/run/keep
RuntimeDirectory=keep
Restart=on-failure
RestartSec=5
RestartPreventExitStatus=2
KillSignal=SIGTERM
TimeoutStopSec=16
LimitNOFILE=1048576
NoNewPrivileges=yes
ProtectSystem=strict
ProtectHome=yes
PrivateTmp=yes
SystemCallFilter=@system-service

[Install]
WantedBy=multi-user.target
```

Three settings in this unit follow from how Keep behaves:

- `TimeoutStopSec=16` gives a stopping member time to hand over its keys. A member leaves the cluster on SIGTERM, which can take up to 16 seconds, and systemd must not kill it during the handoff.
- `RestartPreventExitStatus=2` stops the restart loop on a malformed configuration. Keep exits with status 2 on a syntax error, an unknown key or an invalid value. Every other failure exits with status 1 and is retried, as [Startup errors](/docs/cluster/keep/setup#startup-errors) describes.
- `RuntimeDirectory=keep` creates `/run/keep` for the ready file, which [Cluster setup](/docs/cluster/keep/setup#readiness) describes, and removes it when the service stops.

The unit must not set `CPUQuota`, unless the shard count is sized for it, because a quota below the number of CPUs leaves the shards unpinned. It must also never pass `--start bootstrap`, because a member restarted by systemd with that flag could grant a lock that a client still holds. [First start](/docs/cluster/keep/setup#first-start) shows how to perform a first start under this unit.

Enable the unit once the configuration exists, so that the server starts at boot:

```bash
sudo systemctl daemon-reload
sudo systemctl enable keep
```

## Run with Docker

Images for `linux/amd64` and `linux/arm64` are published as `stalwartlabs/keep` on Docker Hub and as `ghcr.io/stalwartlabs/keep`. The image runs `keep` as an unprivileged user with uid 2000, and reads its settings from `/etc/keep/keep.toml`. The host directory and the files mounted into the container must therefore be readable by that uid. Unlike the `keep` account above, which has a host-assigned group, the image needs group 2000, so a host that uses Docker prepares its directory as follows:

```bash
sudo install -d -m 0750 -o root -g 2000 /etc/keep
```

The private files created in [Cluster setup](/docs/cluster/keep/setup#create-keys-and-secrets) then take `root:2000` in place of `root:keep`, and the public lists and `keep.toml` also need group 2000 if they are not world-readable.

The following command runs a container with the configuration from the host. Any arguments after the image name are added to the settings in the file:

```bash
docker run -d --name keep --network host --stop-timeout 16 \
  --ulimit nofile=1048576:1048576 \
  -v /etc/keep:/etc/keep:ro stalwartlabs/keep
```

Two of these options are essential. Members address each other by IP address, so they use `--network host`. The `--stop-timeout 16` option replaces Docker's default of 10 seconds, which would kill a member during its handoff. In Compose, the equivalent setting is `stop_grace_period: 16s`. The `--ulimit` option matches the open file limit of the systemd unit, because a container can otherwise start with a limit as low as 1,024.

## Build from source

Building from source needs a Rust toolchain and produces `target/release/keep`:

```bash
git clone https://github.com/stalwartlabs/keep.git
cd keep
cargo build --release -p keep-server
```

The binary needs the glibc version it was built against, so a binary built on a recent distribution does not necessarily run on an older one.
