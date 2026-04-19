---
sidebar_position: 2
---

# Windows

The Windows distribution of Stalwart is a single executable that runs as a Windows service. The instructions below use [NSSM](http://nssm.cc/download) to wrap the binary as a service so that it starts automatically at boot and so that its output can be captured in a log file. Administrator access on the target machine and outgoing HTTPS connectivity are required for the steps below.

## Download the binary

Open a browser on the Windows host and download the latest `stalwart-x86_64-pc-windows-msvc.zip` archive from the [releases page](https://github.com/stalwartlabs/stalwart/releases/latest). Extract the archive to reveal `stalwart.exe`.

## Create the installation directories

Open an elevated PowerShell window (right-click **Windows PowerShell** and choose **Run as administrator**) and create the directory layout that Stalwart expects:

```powershell
PS> mkdir "C:\Program Files\Stalwart\bin"
PS> mkdir "C:\Program Files\Stalwart\etc"
PS> mkdir "C:\Program Files\Stalwart\data"
PS> mkdir "C:\Program Files\Stalwart\logs"
```

Move `stalwart.exe` into the `bin` directory (adjust the source path if the archive was extracted somewhere other than `Downloads`):

```powershell
PS> Move-Item "$env:USERPROFILE\Downloads\stalwart.exe" "C:\Program Files\Stalwart\bin\stalwart.exe"
```

The resulting layout is:

| Path | Contents |
| --- | --- |
| `C:\Program Files\Stalwart\bin\stalwart.exe` | The server binary |
| `C:\Program Files\Stalwart\etc\config.json` | Main configuration file (created by the daemon on first start) |
| `C:\Program Files\Stalwart\data\` | Persistent application data |
| `C:\Program Files\Stalwart\logs\` | Stdout/stderr captures and, once enabled in the setup wizard, server-managed logs |

## Install the service with NSSM

Download [NSSM](http://nssm.cc/download), extract the archive, and copy `nssm.exe` (from the `win64` subdirectory) to a convenient location such as `C:\Program Files\Stalwart\bin\`. In the elevated PowerShell window run:

```powershell
PS> & "C:\Program Files\Stalwart\bin\nssm.exe" install Stalwart
```

The NSSM graphical installer appears. Configure the following tabs:

### Application tab

| Field | Value |
| --- | --- |
| Path | `C:\Program Files\Stalwart\bin\stalwart.exe` |
| Startup directory | `C:\Program Files\Stalwart` |
| Arguments | `--config "C:\Program Files\Stalwart\etc\config.json"` |

### I/O tab

Stalwart writes its bootstrap administrator credentials to standard error at first startup. To make those credentials retrievable, configure NSSM to redirect the streams to files:

| Field | Value |
| --- | --- |
| Output (stdout) | `C:\Program Files\Stalwart\logs\stdout.log` |
| Error (stderr) | `C:\Program Files\Stalwart\logs\stderr.log` |

### Details tab

Set **Display name** to `Stalwart Mail Server`, add a short description, and leave **Startup type** as `Automatic`.

Click **Install service** to close the dialog, then start the service from PowerShell:

```powershell
PS> Start-Service Stalwart
```

## Retrieve the bootstrap administrator credentials

After the service starts for the first time, Stalwart runs in **bootstrap mode**. A temporary administrator account is generated with a random password and the credentials are written to the redirected stderr stream. Bootstrap mode is a transient phase intended only to reach the setup wizard, after which a permanent administrator account is provisioned.

Open the stderr log that NSSM was configured to write:

```powershell
PS> Get-Content "C:\Program Files\Stalwart\logs\stderr.log"
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

### Alternative: pin a credential via a service variable

To avoid relying on a log-extracted temporary password, a fixed credential can be set as an NSSM environment variable before the first start. Re-open NSSM for the Stalwart service:

```powershell
PS> & "C:\Program Files\Stalwart\bin\nssm.exe" edit Stalwart
```

On the **Environment** tab, add:

```
STALWART_RECOVERY_ADMIN=admin:mySecretPass
```

Save the change and restart the service:

```powershell
PS> Restart-Service Stalwart
```

The administrator credentials will match the configured value and no temporary password will be generated.

## Open the setup wizard

With the bootstrap credentials in hand, open a web browser and navigate to:

```
http://<hostname>:8080/admin
```

Replace `<hostname>` with the hostname or IP address of the Windows machine running Stalwart. On the machine itself, `http://127.0.0.1:8080/admin` works for local access. Sign in using `admin` as the username and the password retrieved above, then follow the setup wizard to complete the initial configuration.

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

Once you have completed the setup instructions, restart Stalwart.

### Next steps

If you have selected to use the internal directory, you can now add your users in the `Management` > `Directory` > `Accounts` section. If you have selected an external directory, you will need to create users in your directory server.

If everything went well, your users should now be able to connect to the server and send and receive emails. If you are unable to connect to the server, check the log files from the web-admin or under `<INSTALL_DIR>/logs` for any errors.

If you encounter any issues, please refer to the [troubleshooting](/docs/management/troubleshoot) section for help. If you have questions please check the [FAQ](/docs/faq) section or start a discussion in the [community forum](https://github.com/stalwartlabs/stalwart/discussions).

:::tip 

Before making your server publicly accessible, please make sure to read the [securing your server](/docs/install/security) section.

:::

### Setup demonstration

![Setup screencast](/img/screencast-setup.gif)
