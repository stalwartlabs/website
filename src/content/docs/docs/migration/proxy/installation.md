---
sidebar_position: 2
title: "Installation"
description: "Install the migration proxy as a container image or with the install script, verify the release, and run the binary."
---

The proxy is distributed in two forms: as a single binary, and as a container image. Both read the same configuration file and behave identically.

At startup, the proxy parses and validates the configuration. It refuses to start when a destination, certificate or credential setting is invalid, so that a configuration error stops the proxy before it serves any session. Binding is the exception. An address that cannot be bound, for a listener or for the management API, is logged, and the proxy keeps running without it.

The configuration file is in TOML, the proxy's own format, which is unrelated to how Stalwart itself is configured.

## Container image

Images are published to the GitHub Container Registry as `ghcr.io/stalwartlabs/proxy`, and to Docker Hub as `stalwartlabs/proxy`, with the same tags on both. Each release is built for `amd64`, `arm64`, `armv7` and `armv6`, in two variants. The default image is based on Debian and glibc. The Alpine image is based on musl, and its tags carry the `-alpine` suffix. The tags are:

| Tag | Image |
| --- | --- |
| `v1.0.5` | One release exactly |
| `v1.0` | The newest patch release of one minor release |
| `latest` | The newest release |

During a migration, use a tag that names one release exactly, such as `v1.0.5`. Recreating the container then cannot change the proxy's version in the middle of the migration.

Every image is signed with cosign keyless signing, and carries a build provenance attestation in the registry. `cosign verify` and `gh attestation verify` check them.

The image reads its configuration from `/etc/proxy`, mounted from the host, and runs `proxy /etc/proxy/config.toml`. It runs as the unprivileged user `stalwart-proxy` (uid 2000), with the `CAP_NET_BIND_SERVICE` capability, which allows it to bind the mail ports below 1024. It exposes ports 24, 25, 110, 143, 465, 587, 993, 995, 4190, 443 and 9443.

The image also has a built-in health check. It requests the management API's health endpoint at the URL in the `PROXY_HEALTHCHECK_URL` environment variable, by default `https://127.0.0.1:9443/healthz`. The container therefore reports itself unhealthy when the management API is not enabled at that address.

A minimal deployment mounts a host directory that holds `config.toml`, the TLS certificate and key, and the mapping file:

```bash
docker run -d --name proxy \
  -v /srv/proxy:/etc/proxy \
  -p 25:25 -p 993:993 -p 995:995 -p 143:143 -p 110:110 \
  -p 587:587 -p 465:465 -p 4190:4190 \
  -p 443:443 \
  ghcr.io/stalwartlabs/proxy:v1.0.5
```

The same deployment, as a Compose service:

```yaml
services:
  proxy:
    image: ghcr.io/stalwartlabs/proxy:v1.0.5
    restart: unless-stopped
    volumes:
      - /srv/proxy:/etc/proxy
    ports:
      - "25:25"
      - "993:993"
      - "995:995"
      - "143:143"
      - "110:110"
      - "587:587"
      - "465:465"
      - "4190:4190"
      - "443:443"
```

The sample configurations bind the management API to `127.0.0.1:9443`, inside the container, where the health check reaches it. That choice has a consequence: an address bound to the container's loopback interface cannot be published with `-p`. To administer the proxy from outside the container, either bind the management API to the container's network address and publish the port only on a trusted network, or run the management calls with `docker exec`.

## Install script

On a host, the install script installs the binary, a service account, a service definition and sample configuration files. It downloads the release archive for the host from `https://github.com/stalwartlabs/proxy/releases/latest/download`, so the host needs outbound HTTPS access, and `curl` or `wget`. The script runs as root:

```bash
curl --proto '=https' --tlsv1.2 -sSf \
  https://raw.githubusercontent.com/stalwartlabs/proxy/main/install.sh | sudo sh
```

Without an argument, the script installs into the standard locations:

| Component | Path |
| --- | --- |
| Binary | `/usr/local/bin/proxy` |
| Configuration | `/etc/proxy/config.toml` |
| Mapping file | `/etc/proxy/mappings.tsv` |
| TLS material | `/etc/proxy/tls/` |
| Management token | `/etc/proxy/admin.token` |
| Environment file | `/etc/proxy/proxy.env` |
| Log directory | `/var/log/proxy/` |

The proxy itself logs to standard output and standard error, which the systemd journal collects.

With a directory argument, such as `install.sh /opt/proxy`, the script installs a tree under that directory instead, with the binary in `bin/`, the configuration in `etc/` and the logs in `logs/`. The sample configuration it writes still refers to the paths under `/etc/proxy/` for the certificate, the mapping file and the token. Edit these paths to point into the new tree.

The script creates the service account `stalwart-proxy` (`_stalwart-proxy` on macOS). The name avoids a collision with the `proxy` user that Debian ships. Depending on the platform, the script then installs a systemd unit, an init.d script or a launchd property list. The systemd unit grants `CAP_NET_BIND_SERVICE`, and raises the open-file limit for many concurrent connections.

The service is enabled but not started, because the sample configuration contains placeholder destinations and certificate paths.

The script also generates a management token of 48 random characters at the token path, which the sample configuration references. Existing configuration, mapping, environment and token files are never overwritten, so running the script again to upgrade the binary keeps a customised deployment.

Four tasks complete the installation:

1. Edit the destinations and listeners in the configuration.
2. Place the TLS certificate and key in the `tls/` directory.
3. Fill the mapping file.
4. Start the service, for example with `systemctl start proxy`.

### Release verification

The install script does not verify what it downloads. Verification is available for a manual installation instead. Each release archive on the [releases page](https://github.com/stalwartlabs/proxy/releases) is accompanied by a Sigstore bundle (`<archive>.sigstore.json`), and covered by a GitHub build provenance attestation. To verify an archive before installing it by hand, download it and check it with `gh attestation verify <archive> --repo stalwartlabs/proxy`. Releases publish no checksum files.

### Environment file

The service reads the environment file before starting the proxy. The file offers two settings, both commented out:

- `PROXY_ADMIN_TOKEN` supplies the management token, and takes precedence over the token file.
- `RUST_LOG` overrides the configured log level with a tracing filter expression.

## Running the binary

The binary takes the path of its configuration file as its first argument, or reads it from the `PROXY_CONFIG` environment variable:

```bash
proxy /etc/proxy/config.toml
```

At startup, the proxy validates the configuration, binds every configured listener, and starts serving. On `SIGINT` or `SIGTERM`, it stops accepting connections, and lets established sessions finish within the configured grace period before it exits. The [configuration file](/docs/migration/proxy/configuration) is described next.
