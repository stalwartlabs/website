---
sidebar_position: 1
---

import SetupWizard from './_setup-wizard.mdx';
import NextSteps from './_next-steps.mdx';

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

No arguments are required. The script follows the Filesystem Hierarchy Standard and places the binary under `/usr/local/bin/stalwart`, the configuration file under `/etc/stalwart/config.json`, environment variables under `/etc/stalwart/stalwart.env`, application data under `/var/lib/stalwart/` and log files under `/var/log/stalwart/`.

A dedicated `stalwart` service account is created if it does not already exist. The script then writes the appropriate service unit (`systemd`, SysV `init.d`, or `launchd` depending on the operating system), enables the service at boot, and starts it immediately.

When the standard FHS paths cannot be used (for example on a host that mounts `/opt` on a separate volume), a single prefix argument relocates the whole installation under that directory:

```bash
$ sudo sh install.sh /opt/stalwart
```

The default build includes support for SQLite, PostgreSQL, MySQL, RocksDB, S3, Azure Blob Storage, Redis, and NATS. For installations that use FoundationDB as the main data store, see [FoundationDB](#foundationdb) under *Additional topics* below.

## Retrieve the administrator credentials

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

To avoid relying on a log-extracted temporary password, a fixed credential can be set in advance. Edit `/etc/stalwart/stalwart.env` and uncomment the `STALWART_RECOVERY_ADMIN` line, setting the desired username and password. On the next start, the administrator credentials will match the configured value and no temporary password will be generated.

## Open the setup wizard

<SetupWizard />

## Restart service

Once the wizard has been completed, restart Stalwart so that the new configuration takes effect. The exact command depends on the service manager that the installer wrote a unit for at install time.

On Linux with **systemd** (the default on most modern distributions):

```bash
$ sudo systemctl restart stalwart
```

On Linux with **SysV init**:

```bash
$ sudo service stalwart restart
```

On **macOS** (launchd):

```bash
$ sudo launchctl kickstart -k system/stalwart.mail
```

<NextSteps />
