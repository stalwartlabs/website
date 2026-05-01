---
sidebar_position: 2
title: "Windows"
---


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

<!-- include:setup-wizard -->
With the bootstrap credentials in hand, open a web browser and navigate to:

```
http://<hostname>:8080/admin
```

Replace `<hostname>` with the hostname or IP address of the machine running Stalwart. On the machine itself, `http://127.0.0.1:8080/admin` works for local access. Sign in using `admin` as the username and the temporary password retrieved in the previous step; the setup wizard appears automatically.

The wizard presents five screens plus a final confirmation. Every field has a sensible default, so most installations only need to enter their hostname and domain and click through the rest. Deployments that prefer to skip the wizard entirely and drive the same configuration from the CLI should consult [Non-interactive setup](#non-interactive-setup) under *Additional topics* below.

### Step 1 of 5: Server identity

Two required fields plus two optional toggles.

* **Server hostname:**
    > The public hostname this Stalwart server answers to, for example `mail.example.com`. This value appears in SMTP greetings, outgoing message headers, and TLS certificate requests. It must be a valid domain name resolving via public DNS to this server's IP address. For test or internal deployments, Stalwart accepts the RFC 6761 reserved TLDs (`.test`, `.local`, `.localhost`, `.invalid`, `.example`); add the hostname to `/etc/hosts` or to the private DNS zone that serves the deployment.
    >
    > By default, this hostname also becomes the base URL published in OAuth, OIDC, and JMAP discovery documents, served over HTTPS on port `443`. Reverse-proxy deployments, custom HTTPS ports, and path-prefixed mounts should set [`STALWART_PUBLIC_URL`](/docs/configuration/environment-variables#public-urls) to override the published base URL; see [Reverse proxy](/docs/server/reverse-proxy/).

* **Default email domain:**
    > The primary domain this installation will serve, for example `example.com`. Must be a valid domain name. Additional domains can be added at any time after setup. For test deployments, use a `.test` domain (e.g. `example.test`).

* **Automatically obtain TLS certificate**:
    > Leave enabled to have Stalwart request a free TLS certificate for the server hostname from Let's Encrypt using the ACME protocol. This is the recommended option for most deployments, because mail and web clients can then connect securely on the very first start without any additional steps. Disable the checkbox only if a certificate will be uploaded manually later, or if TLS is terminated by a reverse proxy in front of Stalwart.

* **Generate email signing keys:** 
    > Leave enabled to have Stalwart generate DKIM signing keys for the default domain. DKIM cryptographically signs outgoing messages and significantly improves the chances that they are accepted by remote servers rather than classified as spam. Disable only when DKIM keys are managed externally.

:::note[ACME challenge method]

When the *automatically obtain TLS certificate* option is enabled and an automatic DNS provider is selected in [Step 5](#step-5-of-5-automatic-dns-management), Stalwart validates certificate requests with the DNS-01 challenge, which does not require any ports to be reachable from the internet. When DNS management is left manual in Step 5, Stalwart falls back to the TLS-ALPN-01 challenge, which Let's Encrypt validates by connecting directly to the server on **TCP port 443**. In that case, before restarting the server after the wizard, make sure that the machine is reachable from the public internet on port 443, that no reverse proxy or load balancer is intercepting the connection, and that the server hostname entered above resolves to this machine in public DNS. See [ACME challenge types](/docs/server/tls/acme/challenges) for the full picture.

:::

### Step 2 of 5: Storage

Storage is split into four independent stores. All four default to RocksDB on local disk, which is the recommended configuration for single-node installations and requires no action. Each store can be moved to an external backend later through the WebUI without reinstalling.

* **Main data storage:**
    > Where structured data lives: email metadata, calendar events, address book entries, mailbox state, and every server settings object. The default is RocksDB. PostgreSQL, MySQL, SQLite, and FoundationDB are available for larger deployments or when a specific database is mandated by operations policy.

* **Attachment and file storage:**
    > Where the raw bytes of email messages, attachments, and other large files are stored. Leave set to *Use Data Store* to keep blobs alongside metadata; switch to a dedicated backend such as S3 or Azure Blob Storage for deployments with many attachments or when long-term object storage is preferable.

* **Full-text search index:**
    > Where the full-text search index is kept so that users can search across message bodies and attachments. Leave set to *Use Data Store* for single-node deployments; point to a dedicated search backend (Elasticsearch or Meilisearch) when the search workload is large enough to warrant it.

* **Cache and temporary data:**
    > Where short-lived state lives: session caches, rate-limit counters, authentication tokens. Leave set to *Use Data Store* for a single node; point to Redis for faster lookups and especially for multi-node deployments where cache state must be shared across the cluster.

### Step 3 of 5: Account directory

Stalwart can source user accounts from its own internal directory or delegate authentication to an external identity provider.

* **Directory type:**
    > Leave set to *Use the Internal Directory* for the simplest installation: accounts are created and managed through the WebUI, and the wizard generates an administrator credential on the final screen. Select an external directory (OIDC, LDAP, or SQL) for single sign-on or for integration with an existing identity system.

The choice here affects the final screen. With the internal directory, a generated administrator credential is printed when the wizard finishes. With an external directory, no credential is generated; the administrator must be promoted after the first sign-in (see [External directory promotion](#external-directory-promotion) below for the procedure).

### Step 4 of 5: Logging

**Log destination.** Where the server writes log messages, traces, and diagnostic events.

- *Log File* writes rotating log files to disk under the data directory. This is appropriate whenever the server has persistent disk and rotation is handled directly by Stalwart.
- *Console* writes log lines to standard output. Select this for containerised deployments so the orchestrator's log driver (Docker, Kubernetes, and so on) can capture them.

Additional destinations (OpenTelemetry, journald, remote webhooks) can be added after setup through the [Tracer](/docs/ref/object/tracer) object.

:::note[Docker]

Docker users should select **Console** here. A file-based logger inside a container writes to an ephemeral filesystem that is lost on every container restart; the Console logger emits structured log lines to standard output, which Docker captures through its log driver.

:::

### Step 5 of 5: Automatic DNS management

The DNS records a mail server needs (SPF, DKIM, DMARC, MX, MTA-STS, autoconfig, and so on) can either be published manually by the operator or generated and maintained by Stalwart on the operator's behalf.

**DNS server type.** Leave set to *Manual DNS Server Management* to keep full control of the DNS records. Select a supported provider (Cloudflare, AWS Route 53, Google Cloud DNS, etc, or a BIND-compatible server via RFC 2136) to have Stalwart publish and update the zone entries automatically through the provider's API. See [DNS provider integration](/docs/server/dns/) for the supported providers and the credentials each one needs. The choice is not final; provider integration can be enabled, disabled, or changed later.

#### Retrieving the DNS zone file

When manual management is kept, Stalwart still generates the full set of records that must be published and makes them available as a ready-to-import zone file.

From the WebUI, open the Domain list (found in the WebUI under <!-- breadcrumb:Domain --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg> Domains › Domains<!-- /breadcrumb:Domain -->), click the three-dot menu next to the relevant domain, and select **View DNS Zone file**. The returned zone file can be pasted into the DNS provider's control panel or imported as a zone template where the provider supports it. See [Setting up DNS](/docs/install/dns) for a per-record explanation of what each entry does.

The same records can also be retrieved from the command line; see [Retrieving DNS records via CLI](#retrieving-dns-records-via-cli) under *Additional topics* below.

### Setup complete

The final screen confirms that the server has been configured. What happens next depends on the directory chosen in Step 3.

**Internal directory.** The wizard prints an email address and a randomly generated password for the new administrator account, for example:

```
admin@example.com
onMjJfFMO83tQcCX
```

Write both down. The password is shown only on this screen and cannot be retrieved from the server logs afterwards. The credentials are used to sign in to the WebUI once the server has been restarted (see the platform-specific Restart section below).

**External directory (OIDC / LDAP / SQL).** No administrator credential is generated here, because an account from the external directory does not exist locally until it has authenticated at least once. The administrator must be promoted manually after the first sign-in; see [External directory promotion](#external-directory-promotion) under *Additional topics* below for the procedure.
<!-- /include:setup-wizard -->

## Restart service

Once the wizard has been completed, restart the Windows service so that the new configuration takes effect. In an **elevated PowerShell** window (the same admin session used during installation), run:

```powershell
PS> Restart-Service Stalwart
```

<!-- include:next-steps -->
## Continue setup

After the restart, sign in at `https://<hostname>/admin` with the administrator credentials printed on the final wizard screen, where `<hostname>` is the value entered in Step 1. If TLS or DNS for that hostname is not in place yet, sign in at `http://<host>:8080/admin` instead and switch to the HTTPS URL once the production listener is reachable.

:::note[Special cases]

- Deployments using an external directory (OIDC, LDAP, or SQL) must promote the administrator account after first sign-in. See [External directory promotion](#external-directory-promotion) under *Additional topics* below.
- Deployments behind a reverse proxy should follow the [Reverse proxy](#reverse-proxy) guidance under *Troubleshooting* below before signing in.
- If the new HTTPS URL does not load, see [HTTPS not yet reachable](#https-not-yet-reachable) under *Troubleshooting* below.

:::

## Next steps

With the internal directory, additional user accounts can be added through the WebUI's Account Manager, or directly by creating [Account](/docs/ref/object/account) objects through the WebUI administration console or the [CLI](/docs/management/cli/). See [Individual accounts](/docs/auth/principals/individual) for the full field reference. With an external directory (OIDC, LDAP, or SQL), accounts continue to be provisioned and authenticated through the identity provider; any Stalwart-specific overrides are set on the local Account record that is created on first sign-in.

Diagnostic output is written to the log destination configured in Step 4 of the wizard, and can also be viewed live from the WebUI under Telemetry. 

Once `https://<hostname>/admin` is reachable and a permanent administrator is in use, disable the HTTP configuration listener so that `http://<host>:8080/admin` no longer accepts sign-ins. Remove the `STALWART_RECOVERY_ADMIN` environment variable, or delete the HTTP listener through the WebUI, then restart the service.

If something does not behave as expected, consult [Troubleshooting](#troubleshooting) below. Further questions can be raised on the [community forum](https://github.com/stalwartlabs/stalwart/discussions).

:::tip

Before exposing the server to the public internet, review the [securing your server](/docs/install/security) checklist.

:::

## Setup demonstration

<video src="/img/setup.mp4" autoplay loop muted playsinline style="max-width: 100%; height: auto"  ></video>

## Troubleshooting

### Certificate warning on first sign-in

When *automatically obtain TLS certificate* was enabled in Step 1 of the wizard, the certificate from Let's Encrypt can take a minute or two to be issued after the restart. While the request is still in flight, the browser may show a warning because the server is presenting a self-signed fallback certificate. Accepting that warning for the initial sign-in is safe; the warning disappears once the ACME certificate has been installed and the page is reloaded. When the certificate option was disabled, the self-signed fallback remains in place until a certificate is uploaded or a reverse proxy terminates TLS in front of the server.

### HTTPS not yet reachable

If the configured hostname does not yet resolve in DNS, port `443` is not reachable from the browser, or the deployment cannot present a trusted certificate for any other reason, sign in at `http://<host>:8080/admin` for as long as `STALWART_RECOVERY_ADMIN` is set in the service environment. Once HTTPS is in place, switch to `https://<hostname>/admin` and disable the HTTP listener as described in [Next steps](#next-steps).

If the HTTP listener has already been disabled and the deployment is locked out (for example because the configured hostname is no longer reachable, the external OIDC provider is down, or the administrator account was deleted), start the server in [recovery mode](/docs/configuration/recovery-mode) (`STALWART_RECOVERY_MODE=1`). Recovery mode re-enables the HTTP listener on port `8080` with the path-relative issuer used during bootstrap and accepts the credentials in `STALWART_RECOVERY_ADMIN`, regardless of the directory state. Restart without the flag once normal sign-in is restored.

### Reverse proxy

When Stalwart sits behind a reverse proxy (NGINX, Traefik, Caddy, HAProxy, or similar) and the wizard or first sign-in does not behave as expected, the issue is almost always that the URL Stalwart publishes in its OAuth and JMAP discovery documents does not match the URL clients reach the proxy on. Set [`STALWART_PUBLIC_URL`](/docs/configuration/environment-variables#public-urls) to the public-facing base URL (scheme, host, port if non-`443`, path if mounted under a prefix) and restart the server. For example, `STALWART_PUBLIC_URL=https://mail.example.com:8443` for a proxy listening on port `8443`, or `https://example.com/mail` for a path-prefixed mount. The full reverse-proxy model (HTTP vs HTTPS upstream, Proxy Protocol, and per-product configuration for NGINX / Caddy / Traefik / HAProxy) is documented under [Reverse proxy › Overview](/docs/server/reverse-proxy/).

### Further diagnostics

For issues that go beyond initial setup (email delivery, DMARC, authentication, and so on), consult the general [troubleshooting](/docs/management/troubleshoot) guide or the [FAQ](/docs/faq).

## Additional topics

### External directory promotion

When the wizard is completed with an external directory (OIDC, LDAP, or SQL), no administrator credential is generated on the final screen, because an account from the external directory does not exist locally until it has authenticated at least once. The administrator must be promoted manually after the first sign-in using the existing recovery admin credentials. The procedure, carried out after the platform-specific restart, is:

1. Keep `STALWART_RECOVERY_ADMIN=<username>:<password>` set in the service environment. The variable is honoured while the server is running normally, so this does not require recovery mode.
2. Have the account that will become the administrator sign in once through the WebUI. Any successful authentication against the directory provisions the account locally in Stalwart.
3. Sign in as the recovery administrator in a separate browser session and assign the appropriate administrator role to the newly provisioned account, either through the WebUI or through the CLI.
4. Sign in as the promoted account to confirm that the assignment took effect.
5. Remove `STALWART_RECOVERY_ADMIN` from the service environment and restart the server so that the backdoor credential is no longer active.

### FoundationDB

A separate build with FoundationDB support is available for installations that use FoundationDB as the main data store. The default build does not include FoundationDB because multiple FoundationDB client versions exist and a single default would break deployments that rely on a different client.

**Linux / macOS.** Run the installation script with the `--fdb` flag:

```bash
$ sudo sh install.sh --fdb
```

**Docker.** No pre-built FoundationDB image is published. To produce a FoundationDB-enabled image, use the `Dockerfile.fdb` file available in the [stalwartlabs/stalwart](https://github.com/stalwartlabs/stalwart) repository as a starting point.

### Retrieving DNS records via CLI

When manual DNS management is in effect, the zone file generated by Stalwart can also be fetched from the command line. List the configured domains and read the [`dnsZoneFile`](/docs/ref/object/domain#dnszonefile) field on the desired one:

```bash
$ stalwart-cli query domain
$ stalwart-cli get domain <id> --fields dnsZoneFile
```

The returned zone file can be pasted into the DNS provider's control panel or imported as a zone template where the provider supports it.

### Non-interactive setup

Deployments that prefer command-line or infrastructure-as-code workflows can skip the wizard entirely and drive the same configuration from the CLI; see [bootstrap mode](/docs/configuration/bootstrap-mode) and [declarative deployments](/docs/configuration/declarative-deployments).
<!-- /include:next-steps -->
