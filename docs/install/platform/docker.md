---
sidebar_position: 3
---

# Docker

Stalwart is distributed as a multi-architecture Docker image that bundles the server binary and a minimal Debian runtime, covering JMAP, IMAP, POP3, SMTP, WebDAV, and the management HTTP interface. The image is published to both Docker Hub and GitHub Container Registry.

## Pin the image version

The `latest` tag tracks the newest release and moves forward as new versions ship. For production deployments, pin to a `v<major>.<minor>` tag such as `v0.16`. The CI publishes this short form in addition to the full `v<major>.<minor>.<patch>` tag and `edge` (latest build from the main branch), so picking the short form keeps deployments on a single minor series and avoids breaking semver changes on upgrade.

```bash
$ docker pull stalwartlabs/stalwart:v0.16
```

Replace `v0.16` with the current stable release if a newer minor version has shipped.

:::tip FoundationDB edition

No pre-built FoundationDB image is published: multiple FoundationDB client versions exist and shipping a single default would break deployments that rely on a different client. To produce a FoundationDB-enabled image, use the `Dockerfile.fdb` file available in the [stalwartlabs/stalwart](https://github.com/stalwartlabs/stalwart) repository as a starting point.

:::

## Start the container

The image declares two volumes:

| Volume | Purpose |
| --- | --- |
| `/etc/stalwart` | Configuration directory (contains `config.json` after first start) |
| `/var/lib/stalwart` | Persistent application data (RocksDB database, local blobs, bootstrap registry) |

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

:::note Bind-mounts and UID 2000

The example above uses named Docker volumes, which are populated with the correct ownership automatically. When bind-mounting host directories instead (for example `-v /srv/stalwart/config:/etc/stalwart`), the host directory must be owned by UID 2000 so the service account can read and write it. Run `chown 2000:2000 /srv/stalwart/config /srv/stalwart/data` on the host before starting the container.

:::

## Retrieve the bootstrap administrator credentials

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

### Alternative: pin a credential via an environment variable

To avoid relying on a log-extracted temporary password, a fixed credential can be set at container start time. Pass the value via `-e`:

```bash
$ docker run -d --name stalwart \
    -e STALWART_RECOVERY_ADMIN=admin:mySecretPass \
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

The administrator credentials will match the configured value and no temporary password will be generated. The same variable can also be placed in a Docker Compose `environment:` block or sourced from a Compose `env_file:` entry.

## Open the setup wizard

With the bootstrap credentials in hand, open a web browser and navigate to:

```
http://<hostname>:8080/admin
```

Replace `<hostname>` with the hostname or IP address of the Docker host. For a local container, `http://127.0.0.1:8080/admin` works. Sign in using `admin` as the username and the password retrieved above, then follow the setup wizard to complete the initial configuration.

### Choose where to store your data

Once you have logged in, go to the `Settings` > `Storage` section and configure your [data](/docs/storage/data), [blob](/docs/storage/blob), [full-text](/docs/storage/fts) and [in-memory](/docs/storage/in-memory) stores. Read the [choosing a database](/docs/install/store) section for more details on the available options. 

If you would like an external authentication directory such as [LDAP](/docs/auth/backend/ldap.md) or [SQL](/docs/auth/backend/sql), go to the `Settings` > `Authentication` section and configure your [authentication backend](/docs/install/directory).

:::tip Optional

Stalwart comes pre-configured with `RocksDB` as the default backend for all stores. You can skip this step if you are happy with the default configuration.

:::

### Configure your hostname and domain

Next, make sure that the server hostname in `Settings` > `Server` > `Network` is correct. Then, add your main domain name in `Management` > `Directory` > `Domains`. After creating the domain, the interface will display the DNS records that you need to add to your domain's DNS settings. 

For example:

```txt
MX  example.org.                      10 mail.example.org.
TXT 202404e._domainkey.example.org.   v=DKIM1; k=ed25519; h=sha256; p=MCowBQYDK2VwAyEAOT2JN9F8SLTVFNEODDu22SD9RJDC282mugCAeXkzjH0=
TXT 202404r._domainkey.example.org.   v=DKIM1; k=rsa; h=sha256; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAykeYJjv5N0AlnJ8gKF+/8qjbStiMFWvPg+p3JPh96GPXEN6l9W/Ee6Lag6i3vLyTVH5dnRVRBhfWhc+Dc0nKreZe4f5i4L5M4RI31+RpEgu4bCmncUIk2WzJgGBW5XbiOwXjge6OKWtJQN9d8Lc1AuryL5xeged9iS6xd/+EJz4WxAf18U+j38xmAm8fJUTBnQVeb/AZup+voSKAS59jyumsb0jQtXfX5xnwTFXdiX2OF8LRrmmNs/ObHozgHftxAv+YCiSU4bqSlKNPQIrN5kk1YnZDnLlc1Gr66AWlmdUVE7PWtZPTy4f8+uHO93EW3WUxLmynZm+Syn9FTJC2uwIDAQAB
TXT mail.example.org.                 v=spf1 a -all ra=postmaster
TXT example.org.                      v=spf1 mx -all ra=postmaster
TXT _dmarc.example.org.               v=DMARC1; p=reject; rua=mailto:postmaster@example.org; ruf=mailto:postmaster@example.org
```

:::tip 

Some of the autogenerated records may be optional depending on your setup, read the [setting up DNS](/docs/install/dns) section for more information.

:::

### Enable TLS

Stalwart requires a valid TLS certificate to secure the connection between the server and the client. You can enable TLS in one of the following ways:

- If you already have a TLS certificate for your server, you can upload it in the `Settings` > `Server` > `TLS` > `Certificates` section. 
- If you don't have a certificate, you can enable automatic TLS certificates from Let's Encrypt using [ACME](/docs/server/tls/acme/overview). To enable ACME, go to the `Settings` > `Server` > `TLS` > `ACME Providers` section and add Let's Encrypt as your ACME provider making sure that your server hostname is listed as one of the Subject Names. Stalwart supports the `tls-alpn-01`, `dns-01` and `http-01` challenges, if you are unsure which one to use, read the [ACME challenge types](/docs/server/tls/acme/challenges) documentation.
- If you are running Stalwart behind a [reverse proxy](/docs/server/reverse-proxy/overview) such as Traefik, Caddy, HAProxy or NGINX, you should skip this step and configure TLS in your reverse proxy instead.

### Restart the container

Once you have completed the setup instructions, restart the container:

```bash
$ docker restart stalwart
```

### Next steps

If you have selected to use the internal directory, you can now add your users in the `Management` > `Directory` > `Accounts` section. If you have selected an external directory, you will need to create users in your directory server.

If everything went well, your users should now be able to connect to the server and send and receive emails. If you are unable to connect to the server, check the log files from the web-admin or under `<INSTALL_DIR>/logs` for any errors.

If you encounter any issues, please refer to the [troubleshooting](/docs/management/troubleshoot) section for help. If you have questions please check the [FAQ](/docs/faq) section or start a discussion in the [community forum](https://github.com/stalwartlabs/stalwart/discussions).

:::tip 

Before making your server publicly accessible, please make sure to read the [securing your server](/docs/install/security) section.

:::

### Setup demonstration

![Setup screencast](/img/screencast-setup.gif)
