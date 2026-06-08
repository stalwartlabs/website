---
sidebar_position: 2
title: "Installation"
---

The proxy is distributed as a single self-contained binary and as a container image. Both forms read the same TOML configuration file and behave identically; the choice between them is a matter of how the surrounding infrastructure is operated. Whichever method is used, the configuration is parsed and fully validated at startup, and the process refuses to start if any destination, certificate or credential path is invalid. This is intentional: a misconfigured proxy fails loudly at boot rather than silently misrouting live sessions.

## Container image

Official images are published to both the GitHub Container Registry at `ghcr.io/stalwartlabs/proxy` and Docker Hub. Each release is built for multiple architectures (`amd64`, `arm64`, `armv7` and `armv6`) and in two variants: the default image, built against glibc, and an Alpine variant built against musl, distinguished by the `-alpine` tag suffix.

The image expects its configuration directory to be mounted at `/etc/proxy`, and it runs `proxy /etc/proxy/config.toml` by default. The container runs as a dedicated unprivileged user (`stalwart-proxy`, uid 2000) and is granted the `CAP_NET_BIND_SERVICE` capability so it can bind the privileged mail ports without running as root. The mail and management ports are exposed (24, 25, 110, 143, 465, 587, 993, 995, 4190, 443 and 9443), and a built-in health check polls the management endpoint at `https://127.0.0.1:9443/healthz`.

A minimal deployment mounts a host directory containing `config.toml`, the TLS certificate and key, and the mapping file:

```bash
docker run -d --name proxy \
  -v /srv/proxy:/etc/proxy \
  -p 993:993 -p 995:995 -p 143:143 \
  -p 587:587 -p 465:465 -p 4190:4190 \
  -p 443:443 \
  ghcr.io/stalwartlabs/proxy:latest
```

The same deployment expressed as a Compose service:

```yaml
services:
  proxy:
    image: ghcr.io/stalwartlabs/proxy:latest
    restart: unless-stopped
    volumes:
      - /srv/proxy:/etc/proxy
    ports:
      - "993:993"
      - "995:995"
      - "143:143"
      - "587:587"
      - "465:465"
      - "4190:4190"
      - "443:443"
```

The management listener on port 9443 binds to the loopback address by default and is reached from inside the container by the health check; it should only be published to the host or network if remote administration is required, and then only on a trusted network.

## Install script

For installations directly on a host, an install script provisions the binary, a service account, a service unit and a set of sample configuration files. It downloads the appropriate release artifact from `https://github.com/stalwartlabs/proxy/releases/latest/download`, so the host needs outbound HTTPS access and either `curl` or `wget`. The script must be run as root.

```bash
curl --proto '=https' --tlsv1.2 -sSf \
  https://raw.githubusercontent.com/stalwartlabs/proxy/main/install.sh | sudo sh
```

With no argument the script installs into standard filesystem locations:

| Component | Path |
| --- | --- |
| Binary | `/usr/local/bin/proxy` |
| Configuration | `/etc/proxy/config.toml` |
| Mapping file | `/etc/proxy/mappings.tsv` |
| TLS material | `/etc/proxy/tls/` |
| Admin token | `/etc/proxy/admin.token` |
| Environment file | `/etc/proxy/proxy.env` |
| Logs | `/var/log/proxy/` |

Passing a prefix argument (`install.sh /opt/proxy`) instead lays out a self-contained directory tree under that prefix, with the binary in `bin/`, configuration in `etc/`, and logs in `logs/`.

The script creates a dedicated service account named `stalwart-proxy` (the unusual name avoids colliding with the system `proxy` user that Debian ships) and installs a service definition appropriate to the platform: a systemd unit on systemd hosts, an init.d script otherwise, and a launchd property list on macOS. The unit is enabled but deliberately not started, because the sample configuration ships with placeholder destinations and certificate paths that must be edited before the proxy can run. The systemd unit grants `CAP_NET_BIND_SERVICE` and raises the open-file limit so the proxy can serve many concurrent connections.

An administration bearer token of 48 random characters is generated at the token path and referenced from the sample configuration. Existing configuration, mapping, environment and token files are never overwritten, so re-running the script to upgrade the binary leaves a customized deployment intact.

After the script completes, the deployment is finished by editing the configuration for the local destinations and listeners, installing the inbound TLS certificate and key under the `tls/` directory, populating the mapping file, and then starting the service (for example `systemctl start proxy`).

### Environment file

The generated environment file is sourced by the service before the proxy starts. It exposes two overrides, both commented out by default: `PROXY_ADMIN_TOKEN`, which supplies the management API token directly and takes precedence over the token file, and `RUST_LOG`, which overrides the configured log level using the standard tracing filter syntax.

## Running the binary directly

The binary takes the path to its configuration file as its first argument, or reads the path from the `PROXY_CONFIG` environment variable:

```bash
proxy /etc/proxy/config.toml
```

On startup the proxy installs its cryptographic provider, validates the configuration, builds the routing and TLS state, binds every configured listener, and begins serving. On receiving `SIGINT` or `SIGTERM` it stops accepting new connections and drains existing ones within the configured grace period before exiting. The next page describes the [configuration file](/docs/migration/proxy/configuration) in detail.
