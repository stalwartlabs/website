---
sidebar_position: 1
---

# Linux / MacOS

Stalwart ships with an installation script that downloads the latest release, creates a dedicated service account, installs the binary under the standard Unix paths, writes a service unit, and starts the daemon. Root access on the target machine and outgoing HTTPS connectivity are required for the steps below.

## Run the installer

Open a terminal on the target host and fetch the installation script:

```bash
$ curl --proto '=https' --tlsv1.2 -sSf https://get.stalw.art/install.sh -o install.sh
```

Execute the script as root:

```bash
$ sudo sh install.sh
```

No arguments are required. The script follows the Filesystem Hierarchy Standard and places the pieces as follows:

| Path | Contents |
| --- | --- |
| `/usr/local/bin/stalwart` | The server binary |
| `/etc/stalwart/config.json` | Main configuration file (created by the daemon on first start) |
| `/etc/stalwart/stalwart.env` | Environment variables read by the service at startup |
| `/var/lib/stalwart/` | Persistent application data (RocksDB database, local blobs, bootstrap registry) |
| `/var/log/stalwart/` | Server-managed log files |

A dedicated `stalwart` service account is created if it does not already exist. The script then writes the appropriate service unit (`systemd`, SysV `init.d`, or `launchd` depending on the operating system), enables the service at boot, and starts it immediately.

### Optional: custom installation prefix

When the standard FHS paths cannot be used (for example on a host that mounts `/opt` on a separate volume), a single prefix argument relocates the whole installation under that directory:

```bash
$ sudo sh install.sh /opt/stalwart
```

With a prefix, the layout becomes self-contained under that directory: `/opt/stalwart/bin/stalwart`, `/opt/stalwart/etc/config.json`, `/opt/stalwart/etc/stalwart.env`, `/opt/stalwart/data/`, and `/opt/stalwart/logs/`.

### Optional: FoundationDB edition

The default build includes support for SQLite, PostgreSQL, MySQL, RocksDB, S3, Azure Blob Storage, Redis, and NATS. A separate build with FoundationDB support is available. Add the `--fdb` flag to install it:

```bash
$ sudo sh install.sh --fdb
```

## Retrieve the bootstrap administrator credentials

Immediately after the first start, Stalwart runs in **bootstrap mode**. A temporary administrator account is generated with a random password and printed to standard error. Bootstrap mode is a transient phase intended only to reach the setup wizard, after which a permanent administrator account is provisioned.

The temporary password is shown exactly once at startup. Retrieve it from the service manager's log facility.

### On Linux with systemd

```bash
$ sudo journalctl -u stalwart -n 200 | grep -A8 'bootstrap mode'
```

### On Linux with SysV init

Depending on the distribution's syslog daemon, the output lands in `/var/log/syslog` or `/var/log/messages`:

```bash
$ sudo grep -A8 'bootstrap mode' /var/log/syslog 2>/dev/null \
    || sudo grep -A8 'bootstrap mode' /var/log/messages
```

### On MacOS

```bash
$ sudo log show --predicate 'process == "stalwart"' --last 5m
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

### Alternative: pin a credential in the env file

To avoid relying on a log-extracted temporary password, a fixed credential can be set in advance. Edit `/etc/stalwart/stalwart.env` and uncomment the `STALWART_RECOVERY_ADMIN` line, setting the desired username and password:

```
STALWART_RECOVERY_ADMIN=admin:mySecretPass
```

Restart the service afterwards:

- `sudo systemctl restart stalwart` on systemd hosts
- `sudo service stalwart restart` on SysV init hosts
- `sudo launchctl kickstart -k system/stalwart` on MacOS

On the next start, the administrator credentials will match the configured value and no temporary password will be generated.

## Open the setup wizard

With the bootstrap credentials in hand, open a web browser and navigate to:

```
http://<hostname>:8080/admin
```

Replace `<hostname>` with the hostname or IP address of the machine running Stalwart. On the machine itself, `http://127.0.0.1:8080/admin` works for local access. Sign in using `admin` as the username and the password retrieved above, then follow the setup wizard to complete the initial configuration.

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

### Restart service

Once you have completed the setup instructions, restart Stalwart:

```bash
$ sudo systemctl restart stalwart
```

Or, if you are using MacOS:

```bash
$ sudo launchctl kickstart -k stalwart.mail
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
