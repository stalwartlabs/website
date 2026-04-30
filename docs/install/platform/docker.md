---
sidebar_position: 3
---

import SetupWizard from './_setup-wizard.mdx';
import NextSteps from './_next-steps.mdx';

# Docker

Stalwart is distributed as a multi-architecture Docker image that bundles the server binary and a minimal Debian runtime, covering JMAP, IMAP, POP3, SMTP, WebDAV, and the management HTTP interface. The image is published to both Docker Hub and GitHub Container Registry.

The `latest` tag tracks the newest release and moves forward as new versions ship. For production deployments, pin to a `v<major>.<minor>` tag such as `v0.16`. The CI publishes this short form in addition to the full `v<major>.<minor>.<patch>` tag and `edge` (latest build from the main branch), so picking the short form keeps deployments on a single minor series and avoids breaking semver changes on upgrade.

```bash
$ docker pull stalwartlabs/stalwart:v0.16
```

Replace `v0.16` with the current stable release if a newer minor version has shipped. For installations that use FoundationDB as the main data store, see [FoundationDB](#foundationdb) under *Additional topics* below.

## Start the container

The image declares two volumes for configuration and data persistence. The volume `/etc/stalwart` is intended for the configuration file, while `/var/lib/stalwart` is meant for application data. 

The data volume is only written to when Stalwart uses a local storage backend such as RocksDB. Deployments that rely exclusively on external stores (S3, PostgreSQL, MySQL, Redis, Azure Blob, NATS) can leave the data volume empty. Application logs are written to the container's standard output and captured by Docker's log driver, so no dedicated log volume is required.

Create named Docker volumes and start the container with the full set of mail and management ports published to the host:

```bash
$ docker volume create stalwart-etc
$ docker volume create stalwart-data
$ docker run -d --name stalwart \
    --restart unless-stopped \
    -p 443:443 -p 8080:8080 \
    -p 25:25 -p 587:587 -p 465:465 \
    -p 143:143 -p 993:993 \
    -p 110:110 -p 995:995 \
    -p 4190:4190 \
    -v stalwart-etc:/etc/stalwart \
    -v stalwart-data:/var/lib/stalwart \
    stalwartlabs/stalwart:v0.16
```

Publishing every port is not required. Internal deployments that only need, for example, submission (`587`) and IMAPS (`993`) can prune the list accordingly. Refer to the [securing your server](/docs/install/security) documentation for guidance on which ports to expose.

The image runs as an unprivileged `stalwart` user (UID 2000). Docker's default capability set is sufficient for binding ports below 1024 on Linux: the binary carries the `cap_net_bind_service` file capability, so no `--cap-add` or `--privileged` flag is needed. Starting the container with `--cap-drop NET_BIND_SERVICE` causes the binary to fail at exec time.

:::note Reverse proxies and custom ports

When the host port mapping is not `443`, or a reverse proxy fronts the container on a different URL, pass the public-facing URL through `STALWART_PUBLIC_URL` so that discovery documents publish the URL clients actually use. For example: ` -e STALWART_PUBLIC_URL=https://mail.example.com:8443`. The variable accepts a full base URL with scheme, host, optional port, and optional path prefix (e.g. `https://example.com/mail`). It does not change which ports the container itself binds to; those continue to be controlled by `-p` and the [NetworkListener](/docs/ref/object/network-listener) objects. See [Public URLs](/docs/configuration/environment-variables#public-urls) for the full reference.

:::

:::note Bind-mounts and UID 2000

The example above uses named Docker volumes, which are populated with the correct ownership automatically. When bind-mounting host directories instead (for example `-v /srv/stalwart/config:/etc/stalwart`), the host directory must be owned by UID 2000 so the service account can read and write it. Run `chown 2000:2000 /srv/stalwart/config /srv/stalwart/data` on the host before starting the container.

:::

## Retrieve the administrator credentials

After the container starts for the first time, Stalwart runs in **bootstrap mode**. A temporary administrator account is generated with a random password and the credentials are written to the container's standard error. Bootstrap mode is a transient phase intended only to reach the setup wizard, after which a permanent administrator account is provisioned.

Print the container logs and locate the bootstrap banner:

```bash
$ docker logs stalwart 2>&1 | grep -A8 'bootstrap mode'
```

The block to look for looks like this:

```
════════════════════════════════════════════════════════════
🔑 Stalwart bootstrap mode - temporary administrator account

   username: admin
   password: XXXXXXXXXXXXXXXX

Use these credentials to complete the initial setup at the
/admin web UI. Once setup is done, Stalwart will provision a
permanent administrator and this temporary account will no
longer apply.
════════════════════════════════════════════════════════════
```

Copy the 16-character password from the `password:` line. This is the only time the value appears in the logs.

To avoid relying on a log-extracted temporary password, a fixed credential can be set at container start time. Pass the value via `-e`, for example `-e STALWART_RECOVERY_ADMIN=admin:mySecretPass`. The administrator credentials will match the configured value and no temporary password will be generated. The same variable can also be placed in a Docker Compose `environment:` block or sourced from a Compose `env_file:` entry.

## Open the setup wizard

<SetupWizard />

## Restart the container

Once the wizard has been completed, restart the container so that the new configuration takes effect.

For a container started with `docker run`:

```bash
$ docker restart stalwart
```

For deployments managed with Docker Compose, restart only the Stalwart service:

```bash
$ docker compose restart stalwart
```

<NextSteps />
