---
sidebar_position: 3
title: "Docker"
description: "Run Stalwart from the official container image step by step: volumes and ports, setup wizard, first sign-in, DNS records, a user account and a test message."
---

This tutorial runs Stalwart from the official container image with Docker or Docker Compose and takes it to the point where it sends and receives mail. Each step explains what it does and why, gives the result to expect, and links to the problems that most often occur at that point, which [Common problems](#common-problems) near the end of the page describes with their fixes. The choice of image tag and the image's health check are described in [Container details](#container-details) at the end of the page.

<!-- include:prerequisites -->
## Prerequisites

The host must meet the [system requirements](/docs/install/requirements): a static public IP address, a server hostname that resolves to it, port 25 open in both directions, and control over the DNS zone of the mail domain.
<!-- /include:prerequisites -->

The commands below use Docker Engine, with the Compose plugin for the Compose example ([Docker installation guide](https://docs.docker.com/engine/install/)), and other OCI runtimes accept the same image. The server downloads the WebUI and the spam filter rules from GitHub at its first start, so the host also needs outbound HTTPS access.

## Step 1: Start the container

This step creates the storage the server keeps across container restarts and starts the server for the first time. The container needs two decisions: which image tag to follow, and which ports to publish. The commands below use the major version tag `v1`, for the reasons given in [Choosing a tag](#choosing-a-tag).

### Run the container

The following commands create two volumes and start the container with the ports of the [default listeners](/docs/server/listener#default-listeners). The options that matter are explained after the commands.

```bash
$ docker volume create stalwart-etc
$ docker volume create stalwart-data
$ docker run -d --name stalwart --init \
    --restart unless-stopped \
    -p 25:25 -p 465:465 -p 993:993 -p 995:995 -p 4190:4190 -p 443:443 \
    -p 127.0.0.1:8080:8080 \
    -v stalwart-etc:/etc/stalwart \
    -v stalwart-data:/var/lib/stalwart \
    stalwartlabs/stalwart:v1
```

- `/etc/stalwart` holds `config.json`, the configuration file that the setup wizard creates in Step 3, and `/var/lib/stalwart` holds the data. Both volumes must be persistent, because a server that finds no `config.json` at startup runs the setup wizard again.
- Port 8080 is published on the host's loopback interface only, because it serves the setup wizard without protection against password guessing ([Protect the setup listener](/docs/install/security#protect-the-setup-listener)). From another machine, reach it through an SSH tunnel: `ssh -L 8080:127.0.0.1:8080 <host>`.
- `--init` runs a minimal init process as PID 1, which forwards signals to the server and reaps exited child processes.

The equivalent Docker Compose service, for a deployment managed with Compose:

```yaml
services:
  stalwart:
    image: stalwartlabs/stalwart:v1
    container_name: stalwart
    init: true
    restart: unless-stopped
    ports:
      - "25:25"
      - "465:465"
      - "993:993"
      - "995:995"
      - "4190:4190"
      - "443:443"
      - "127.0.0.1:8080:8080"
    volumes:
      - stalwart-etc:/etc/stalwart
      - stalwart-data:/var/lib/stalwart

volumes:
  stalwart-etc:
  stalwart-data:
```

Once the container has started, `docker ps` lists it as running, and after the first [health check](#health-check) as `healthy`.

If something goes wrong in this step, [Step 1: Container start](#step-1-container-start) under Common problems lists the usual causes and their fixes.

<!-- include:open-wizard -->
## Step 2: Open the setup wizard

At its first start the server finds no configuration file and therefore starts in [bootstrap mode](/docs/configuration/bootstrap-mode). In this mode it serves only the setup wizard, over plain HTTP on port 8080, and creates a temporary administrator account with which the administrator signs in to it. This step retrieves that account's password and opens the wizard.
<!-- /include:open-wizard -->

### Retrieve the administrator credentials

The temporary account is named `admin` and has a random 16-character password. The server prints both once to the container output, in a block that starts with `Stalwart bootstrap mode - temporary administrator account`, and the following command shows it:

```bash
$ docker logs stalwart 2>&1 | grep -A8 'bootstrap mode'
```

Open `http://127.0.0.1:8080/admin` on the host, or through the SSH tunnel, and sign in as `admin` with the temporary password. The wizard opens after sign-in.

If something goes wrong in this step, [Step 2: Setup wizard access](#step-2-setup-wizard-access) under Common problems lists the usual causes and their fixes.

<!-- include:setup-wizard -->
## Step 3: Complete the setup wizard

The setup wizard turns the empty server into a configured one. Its five screens cover the server's identity, its storage, the source of its accounts, its log and the publication of its DNS records, and every field on them has a default that suits a single server. On a first installation, therefore, only the server hostname and the default domain have to be entered. [Setup wizard](/docs/install/setup-wizard) describes every field in detail and shows a recording of the wizard.

### Screen 1: Server identity

Enter the **Server Hostname**, for example `mail.example.com`, and the **Default Email Domain**, for example `example.com`. The wizard pre-fills both fields from the machine's host name, so check both and replace them. Clients and other mail servers reach the server under its hostname, so the hostname must resolve to the server's address, as listed in the [system requirements](/docs/install/requirements). The domain is the first mail domain the server hosts, the part of its addresses after the `@`. A name the wizard does not accept is reported only when **Finish setup** is pressed, as described in [Setup wizard reports an error](/docs/install/troubleshooting#setup-wizard-reports-an-error). [Step 1: Server identity](/docs/install/setup-wizard#step-1-server-identity) describes the pre-filled values and the names the wizard accepts.

Leave both options on this screen enabled, because together they give the server what other systems need in order to trust it. **Automatically Obtain TLS Certificate** has the server request its certificate from Let's Encrypt through ACME, the protocol certificate authorities use to issue certificates automatically, so no certificate has to be installed by hand. **Generate Email Signing Keys** creates the domain's DKIM keys. DKIM adds a signature to outgoing mail with which receiving servers verify that the message was sent by the domain, and mail without a signature is more likely to be classified as spam.

### Screen 2: Storage

Leave the four fields on this screen at their defaults. The **Main Data Storage** is the database that holds all mail, accounts and settings. By default it is RocksDB, an embedded database kept in a local directory, so the server needs no separate database server. The three other fields keep attachments, the search index and temporary data in that same database or in memory. The wizard proposes `/var/lib/stalwart/` as the directory, or `/var/db/stalwart/` on FreeBSD. An installation made with a prefix needs other directories, as described in [Other installation options](/docs/install/platform/linux#other-installation-options). On Windows, enter `C:\Program Files\Stalwart\data`.

The wizard refuses a data store that already holds the data of a Stalwart server, as described in [Setup wizard reports an error](/docs/install/troubleshooting#setup-wizard-reports-an-error).

A server that may later become part of a cluster needs shared storage from the start, because changing the data store later requires a data migration. [Choosing a database](/docs/install/store) explains the options, and [Step 2: Storage](/docs/install/setup-wizard#step-2-storage) lists the other backends the screen offers.

### Screen 3: Account directory

The directory is where the server keeps accounts and their passwords. Leave **Directory Type** at *Use the internal directory*, which stores them in Stalwart, where the administrator manages them in the WebUI. With this choice, the wizard also creates an administrator account on its last screen.

### Screen 4: Logging

The log destination decides where the server writes its log once the setup is complete, and the right choice depends on how the platform collects output. Choose the **Log Destination** for the platform:

| Platform | Log destination | Where the log goes |
|---|---|---|
| Linux, macOS, FreeBSD | *Log file* (the default) | Daily files named `stalwart.log.<date>` in `/var/log/stalwart/` |
| Docker | *Console* | The container output, read with `docker logs` |
| Windows | *Console* | The standard output file configured in NSSM |

Docker needs *Console*: a container has no `/var/log/stalwart/` directory, so with *Log file* the server writes no log at all.

Turn off **Use ANSI colors**, which is <!-- default:Tracer.Log.ansi as=enabled -->enabled<!-- /default --> for a log file, when the log is read by anything other than a terminal. [Step 4: Logging](/docs/install/setup-wizard#step-4-logging) explains the option.

### Screen 5: Automatic DNS management

A mail domain needs a set of DNS records, and several of them change while the server runs: DKIM keys are replaced periodically, and each new key needs its own record. With automatic DNS management, the server writes these records through the API of the DNS provider that hosts the domain's zone and keeps them current, so that they never have to be copied by hand. In **DNS Server Type**, select the provider that hosts the zone, and enter the API credentials that the screen then asks for, which for most providers is a single API token. [DNS providers](/docs/server/dns/provider) lists the supported providers, among them Cloudflare, Route 53, Google Cloud DNS and any DNS server that accepts RFC 2136 updates, together with the credentials each one needs. The credentials must allow the server to list, create, replace and delete records in the zone, and [DNS provider notes](/docs/server/dns/provider-notes) gives the minimum permissions for common providers.

A provider also simplifies the certificate. With a provider, the server proves to Let's Encrypt that it controls the domain with the DNS-01 challenge, which publishes a temporary TXT record in the zone, so the validation needs no inbound connection. The server requests the certificate after the restart, as soon as it has published the DNS records.

Keep *Manual DNS server management* only when the zone's provider is not supported, or when the zone must stay under manual control. The server then computes the records and lists them in a zone file, and the administrator copies them to the provider in Step 6. This choice has two consequences. First, the DKIM keys are never rotated, because the server cannot publish the record of a new key. Second, Let's Encrypt validates the certificate with the TLS-ALPN-01 challenge, for which it connects to the server on port 443 under every name in the certificate: the `mta-sts`, `autoconfig`, `autodiscover` and `ua-auto-config` names under the domain, and the server hostname when it lies within the domain. Before the restart in Step 4, therefore, create a CNAME record for each of these four names that points at the server hostname, for example `mta-sts.example.com. CNAME mail.example.com.`, and make sure that port 443 is reachable from the internet. Otherwise the first certificate order fails, and the server retries it only later.

The choice can be changed after the setup, as described in [Automatic DNS records](/docs/domains/dns-records).

After **Finish setup** is pressed, the last screen shows the credentials of the new administrator account: the address `admin@<domain>` and a random 16-character password, for example:

```text
admin@example.com
onMjJfFMO83tQcCX
```

Record both before leaving the page, because the wizard shows the password only on this screen and does not write it to the log. The temporary bootstrap password from Step 2 is no longer needed.

The wizard has now written the configuration file. The server, however, keeps running in bootstrap mode and serves only the wizard until it is restarted.

:::note[Special cases]
Some servers need additional settings around the restart and the first sign-in: a server behind a reverse proxy, a server with an external directory, and a server on which HTTPS on the server hostname cannot work yet. [Special cases](#special-cases) at the end of this page describes them.
:::
<!-- /include:setup-wizard -->

<!-- include:restart -->
## Step 4: Restart the server

The wizard has written the configuration, but the server reads it only when it starts. A restart therefore ends bootstrap mode and starts the mail services.
<!-- /include:restart -->

Restart the container:

```bash
$ docker restart stalwart
```

With Docker Compose:

```bash
$ docker compose restart stalwart
```

<!-- include:restart-result -->
The server then starts with the configuration from the wizard and opens the mail, IMAP, POP3, ManageSieve and HTTPS ports.
<!-- /include:restart-result -->

With the *Console* log destination chosen in the wizard, `docker logs stalwart` shows its log.

<!-- include:restart-problems -->
If something goes wrong in this step, [Step 4: Restart](#step-4-restart) under Common problems lists the usual causes and their fixes.
<!-- /include:restart-problems -->

<!-- include:sign-in -->
## Step 5: Sign in to the WebUI

The WebUI is the server's web administration interface, and the rest of the installation takes place in it. After the restart, the server serves it over HTTPS on the server hostname. Open `https://<hostname>/admin` in a browser, where `<hostname>` is the server hostname entered in the wizard, and sign in with the administrator address and password shown on the wizard's last screen. The [WebUI](/docs/management/webui/) page describes its sections.

The first visit may show a certificate warning. At its first regular start the server requests the TLS certificate chosen in the wizard, with automatic DNS management once it has published the DNS records, and until the certificate arrives it presents a self-signed certificate for `localhost`. Do not accept the warning, because once it is accepted the browser can no longer detect an interception of the connection. Wait a short while and reload the page instead.

Once the certificate is in place, the browser connects without a warning and shows a certificate issued by Let's Encrypt for the hostname. After sign-in, the administration interface opens, and the default domain appears in the domain list.

If something goes wrong in this step, [Step 5: WebUI sign-in](#step-5-webui-sign-in) under Common problems lists the usual causes and their fixes.
<!-- /include:sign-in -->

<!-- include:dns-records -->
## Step 6: Publish the DNS records

So far the server works, but the rest of the internet does not know about it. Other mail servers find and trust a domain through DNS: MX records name the server that receives the domain's mail, and SPF, DKIM and DMARC records let receivers check that a message sent in the domain's name really comes from its server. Further records let mail clients find their settings automatically. This step makes sure that all of these records are in the domain's zone. The server has already computed them for the domain, so with automatic DNS management it has published most of them itself, and with manual DNS management the work consists of copying them to the DNS provider. [DNS records](/docs/install/dns) explains each of them.

### Automatic DNS management

When a DNS provider was selected on Screen 5 of the wizard, the server published the DKIM, SPF, DMARC, SRV, MTA-STS, TLS reporting and autoconfiguration records through the provider's API shortly after the restart, and it keeps them current from then on. The wizard leaves two record types out of this set. The CAA record is optional and can be added later, as described in [DNS records](/docs/install/dns). The MX record, however, is what directs the domain's mail to the server, so create it in the provider's control panel: an MX record at the domain that points at the server hostname, such as:

```
example.com.	MX	10 mail.example.com.
```

The domain's zone file, described below, lists the same MX record with the values for this server.

### Manual DNS management

In the WebUI, open the domain list (<!-- breadcrumb:Domain --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg> Domains › Domains<!-- /breadcrumb:Domain -->), open the menu next to the domain and select **View Zone File**. The zone file is in BIND format, which most DNS providers can import as a whole. Alternatively, create its records one by one in the provider's control panel.

Besides the mail records, the zone file contains the CNAME records for the `mta-sts`, `autoconfig`, `autodiscover` and `ua-auto-config` names that were created before the restart, because the TLS certificate needs them. It does not contain the A and AAAA records of the server hostname, because those exist before the installation starts, as listed in the [system requirements](/docs/install/requirements).

Once published, each record returns the value shown in the zone file when queried through a public resolver. The server computes the zone file for every domain, whether or not it publishes the records itself. The following queries check the main records, with the DKIM selector name, such as `v1-ed25519-20260101`, taken from the zone file:

```sh
dig +short @1.1.1.1 MX example.com
dig +short @1.1.1.1 TXT example.com
dig +short @1.1.1.1 TXT _dmarc.example.com
dig +short @1.1.1.1 TXT v1-ed25519-20260101._domainkey.example.com
```

If the certificate warning of Step 5 remained because records were missing, no further action is needed: once they resolve, the next attempt of the order obtains the certificate.

If something goes wrong in this step, [Step 6: DNS records](#step-6-dns-records) under Common problems lists the usual causes and their fixes.
<!-- /include:dns-records -->

<!-- include:first-account -->
## Step 7: Create a user account

The administrator account from the wizard holds every permission and is meant for administration only. A mailbox is set up in mail and calendar clients on several devices, each of which stores its password, so it should not carry those permissions. This step therefore creates a separate user account, the mailbox that sends and receives the test message in Step 8.

In the WebUI, open <!-- breadcrumb:Account --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg> Directory › Groups, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg> Directory › Accounts<!-- /breadcrumb:Account --> and create a user account. Its name becomes the local part of the address, so the name `jane` in the domain `example.com` gives the address `jane@example.com`. Select the default domain. The form has no password field: add the password under **Authentication › Credentials** with **Add item**, which creates a password credential, and give it at least <!-- default:Authentication.minPasswordLength -->8<!-- /default --> characters, the minimum length of the default password policy. [Managing accounts](/docs/auth/accounts/manage) covers aliases, groups, quotas, suspension and the other account tasks, together with their CLI and API equivalents.

Once saved, the account appears in the account list with its email address. To confirm that it works, sign in at `https://<hostname>/account` with the full address and the password. This opens the [Account Manager](/docs/management/webui/account-manager), the part of the WebUI in which users manage their own credentials and settings.

If something goes wrong in this step, [Step 7: User account](#step-7-user-account) under Common problems lists the usual causes and their fixes.
<!-- /include:first-account -->

<!-- include:test-message -->
## Step 8: Send and receive a test message

The last step confirms that mail flows in both directions: that the server can deliver to other providers and that they accept its mail, and that other providers can reach it. Add the new account to a mail client such as Thunderbird, Apple Mail or Outlook by entering its email address and password. Because the DNS records from Step 6 are in place, the client finds the server settings itself. A client that asks for the settings needs the following values:

| Setting | Value |
|---|---|
| Incoming server | IMAP, `mail.example.com`, port 993, SSL/TLS |
| Outgoing server | SMTP, `mail.example.com`, port 465, SSL/TLS |
| User name | The full email address, `jane@example.com` |

Send a message from the account to a mailbox at another provider, then reply to it from that mailbox.

The message should arrive in the inbox at the other provider, not in the spam folder. Its headers, which most providers show with an option such as "Show original", report `pass` for SPF, DKIM and DMARC. The reply arrives in the account's inbox.

If something goes wrong in this step, [Step 8: Test message](#step-8-test-message) under Common problems lists the usual causes and their fixes.
<!-- /include:test-message -->

## Special cases

The following cases depart from the common path of this tutorial. Several of them set environment variables, which reach the container through `-e NAME=value` on the `docker run` command line, or with `environment:` or `env_file:` in Docker Compose. Docker fixes the environment of a container when it creates the container, so a change requires recreating it, not only restarting it: remove the container with `docker rm -f stalwart` and run the `docker run` command of Step 1 again with the changed variables, or run `docker compose up -d` after editing the Compose file. The configuration and the data remain in the volumes.

<!-- include:special-cases -->
### Reverse proxy

When clients reach the server through a reverse proxy, or on an HTTPS port other than 443, the URL in the browser differs from `https://<hostname>`, and the sign-in in Step 5 fails with `Client metadata documents are disabled` until the server is configured with the URL clients use. [Reverse proxy](/docs/server/reverse-proxy/) describes that configuration, which belongs before the restart in Step 4, together with the proxy itself.

Complete the setup wizard directly on port 8080, not through the proxy, because during the setup the WebUI accepts sign-in only from the address and scheme on which the request arrives. The [Reverse proxy](/docs/server/reverse-proxy/) page also explains how the clients' IP addresses reach the server, which matters because auto-ban, the blocking of addresses after repeated failed sign-ins, and rate limits depend on them.

### External directory

When an LDAP server, an SQL database or an OpenID Connect identity provider was selected as the directory in the wizard, the last screen shows no administrator account, because accounts from the directory exist in Stalwart only after their first sign-in. The administrator therefore promotes the first administrator after the restart in Step 4, with the help of the recovery administrator. This is a credential defined by the `STALWART_RECOVERY_ADMIN` environment variable, and it does not depend on the directory. Set the variable and restart, have the future administrator sign in once, and assign an administrator role to that account while signed in as the recovery administrator. Then remove the variable and restart again. [Promoting the first administrator](/docs/install/directory#promoting-the-first-administrator) gives the procedure, and [Choosing a directory](/docs/install/directory) explains the directory options.

The directory's own tools create the accounts, so Step 7 is replaced by an existing account of the directory.

### HTTPS not available yet

In normal operation, the WebUI accepts sign-in only over HTTPS on the server hostname. On port 8080, sign-in fails with `Unknown client id`, whatever the account. When HTTPS cannot work yet, for example because the hostname does not resolve or port 443 is not reachable, the WebUI is still available in [recovery mode](/docs/configuration/recovery-mode). Set `STALWART_RECOVERY_MODE=1` and `STALWART_RECOVERY_ADMIN=admin:<password>`, restart, and sign in at `http://<host>:8080/admin` with that credential.

Recovery mode runs no mail services. It serves only the WebUI and the management API, on port 8080 and without protection against password guessing, so keep the port off the internet, as described in [Protect the setup listener](/docs/install/security#protect-the-setup-listener). Once HTTPS works, remove both variables and restart.

The same procedure regains access when no administrator can sign in, for example because the external directory is unreachable or the administrator account was deleted. [Regain access](/docs/configuration/recovery-mode#regain-access) describes this use.

### Automated installation

A deployment tool can configure a new server without the wizard, in one of two ways. The wizard's fields correspond to the [Bootstrap](/docs/ref/object/bootstrap) object, and while the server runs in bootstrap mode, a tool can submit the same object through the JMAP API. Alternatively, it can write `config.json` and then apply a complete configuration as a plan with the CLI in recovery mode. [Bootstrap mode](/docs/configuration/bootstrap-mode) and [Declarative deployments](/docs/configuration/declarative-deployments) describe both methods.

### Reading the zone file with the CLI

The zone file of Step 6 is also available in the read-only [`dnsZoneFile`](/docs/ref/object/domain#dnszonefile) field of the domain, which the [CLI](/docs/management/cli/) can read. The first command lists the domains with their ids, and the second reads the field of one of them:

```bash
$ stalwart-cli query domain
$ stalwart-cli get domain <id> --fields dnsZoneFile
```
<!-- /include:special-cases -->

### Published HTTPS port other than 443

When the container's port 443 is published on another host port, for example `-p 8443:443`, clients reach the server at a URL with that port. The server must then be configured with that URL, as described in [Reverse proxy](/docs/server/reverse-proxy/), because otherwise the sign-in in Step 5 fails with `Client metadata documents are disabled`: the server accepts the WebUI only on its published host and port.

### FoundationDB

The image does not include support for FoundationDB as the data store, and no FoundationDB image is published. Build one from the `Dockerfile.fdb` file in the [Stalwart repository](https://github.com/stalwartlabs/stalwart). [FoundationDB](/docs/storage/backends/foundationdb) describes the client library it needs.

## Container details

The tutorial does not depend on the following details, but a deployment that later upgrades the image or changes its listeners must take them into account.

### Choosing a tag

The image is published on Docker Hub as `stalwartlabs/stalwart` and on the GitHub Container Registry as `ghcr.io/stalwartlabs/stalwart`, for the amd64, arm64, ARMv7 and ARMv6 architectures, on a minimal Debian base. Each tag also exists with an `-alpine` suffix for an image built on Alpine Linux. The tag decides which releases a later `docker pull` installs. Use the major version tag `v1`: it follows the newest 1.x release, so fixes and minor releases arrive with the next pull, while a future major release, which may need a different upgrade procedure, does not. Avoid `latest` for the same reason. [Upgrading a container](/docs/install/upgrade#upgrading-a-container) lists the other tags.

### Health check

The image declares a health check, through which Docker reports whether the server answers. Every 30 seconds it requests `/healthz/live`, first at the URL in `STALWART_HEALTHCHECK_URL`, which is `https://127.0.0.1:443/healthz/live` when the variable is unset, without verifying the certificate, and then at `http://127.0.0.1:8080/healthz/live`. The second URL answers while the server runs the setup wizard, when only port 8080 is open. A deployment that later removes the 8080 listener and moves HTTPS to another port must set `STALWART_HEALTHCHECK_URL` to an address that still answers, otherwise Docker reports the container as unhealthy.

<!-- include:common-problems-intro -->
## Common problems

The following problems are the ones that most often occur during the installation, grouped by the step at which they appear. [Troubleshooting installation](/docs/install/troubleshooting) lists the rarer problems by symptom.
<!-- /include:common-problems-intro -->

### Step 1: Container start

- **A port is already allocated.** Another process on the host uses the port, on port 25 usually a mail server installed with the operating system. Stop it, or publish only the ports that are free.

Rarer container problems are described in Troubleshooting installation: [a mounted host directory the server cannot write to](/docs/install/troubleshooting#docker-the-server-cannot-write-to-a-mounted-host-directory), [a container that fails to execute the binary](/docs/install/troubleshooting#docker-the-container-fails-to-execute-the-binary) and [ports 587, 143 and 110 that do not answer](/docs/install/troubleshooting#docker-ports-587-143-and-110-do-not-answer).

### Step 2: Setup wizard access

- **The password is rejected.** The server generates a new password at every start in bootstrap mode, so only the most recent block in the output is valid. To use a known password, set `STALWART_RECOVERY_ADMIN=admin:<password>` in the container environment (`-e` with `docker run`, `environment:` or `env_file:` with Compose) and recreate the container. The server then generates no temporary password. Remove the variable once the setup is complete, as described in [Securing the server](/docs/install/security#retire-the-recovery-administrator).
- **The page does not load.** Use `http://`, not `https://`. The port must be published (`-p 127.0.0.1:8080:8080`), and the address in the browser must reach the published port: `127.0.0.1` on the host itself, or the local end of the SSH tunnel.

<!-- include:common-problems -->
### Step 4: Restart

- **The server exits at start.** The last lines of the service output give the reason. A configuration file that exists but cannot be used stops the server with `Startup failed: Failed to read data store settings at <path>: <error>` or `Startup failed: Failed to parse data store settings at <path>: <error>`. The server also stops when the data directory is owned by a user other than the service account, because it cannot open the directory.
- **A port fails to bind.** The server skips that listener, starts the others, and logs a `registry.build-error` event for the listener with the reason `Failed to bind to <address>: <error>`. On port 25 the cause is usually another mail server installed with the operating system, such as Postfix or Exim, which has to be stopped and disabled. [A port fails to bind](/docs/install/troubleshooting#a-port-fails-to-bind) lists the other causes.

[Troubleshooting installation](/docs/install/troubleshooting) describes the rarer problems after the restart: the [setup wizard appearing again](/docs/install/troubleshooting#setup-wizard-appears-again) and a [data store of another Stalwart version](/docs/install/troubleshooting#server-exits-at-start).

### Step 5: WebUI sign-in

- **The certificate warning does not go away.** With automatic DNS management, the DNS update may have failed, in which case the server has not requested the certificate yet, as described under Step 6. Otherwise the certificate order is failing, and the log records each failure as an `acme.auth-error` or `acme.order-invalid` event with the reason. [Certificate not issued](/docs/install/troubleshooting#certificate-not-issued) describes the usual causes.
- **The sign-in page shows `Unknown client id` or `Client metadata documents are disabled`.** The WebUI was opened on an address the server does not accept for sign-in. In normal operation the server accepts the WebUI only over HTTPS on the server hostname. Over plain HTTP, port 8080 included, the page shows `Unknown client id`. Over HTTPS on an IP address, on the mail domain or on any other host name, it shows `Client metadata documents are disabled`: the WebUI identifies itself by the address in the browser, the server does not recognise that address as its own, and the message names a setting for third-party applications that is not the cause. Open `https://<hostname>/admin`. The restriction does not apply during the setup and in recovery mode, when the WebUI works over plain HTTP on the address it was opened on.
- **`/admin` returns `404 Not Found`.** The server downloads the WebUI from GitHub at its first start, and this download failed, usually because a firewall blocks outbound HTTPS. The log then contains a `resource.error` event. [WebUI](/docs/management/webui/#outbound-network-requirement) describes how to allow the download or host the WebUI internally.
- **HTTPS on the hostname cannot work yet**, for example because the hostname does not resolve yet. In normal operation the WebUI accepts sign-in only over HTTPS on the server hostname, but [Special cases](#special-cases) describes how to use it over plain HTTP in the meantime.

[Certificate warning in the browser](/docs/install/troubleshooting#certificate-warning-in-the-browser) describes the rarer certificate problems: a hostname outside the default domain and a test server without public DNS.

### Step 6: DNS records

- **Records are missing with automatic DNS management.** The update through the provider's API failed, most often because the credentials entered in the wizard are wrong or lack access to the zone. The provider's answer is recorded in the failed task, and [Failures](/docs/domains/dns-records#failures) describes when the server retries the update and how to run it again once the credentials of the DNS provider (<!-- breadcrumb:DnsServer --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › DNS › DNS Providers<!-- /breadcrumb:DnsServer -->) are corrected. The server requests the certificate only after the records are published, so the certificate warning of Step 5 remains until then.
- **The domain already has an SPF record**, for example from a previous mail provider, and the records are published by hand. A domain can hold only one record starting with `v=spf1`, and with two, SPF fails for all mail of the domain. Merge the entries into one record, keeping the senders that still send mail for the domain.
- **The MX record still points at another provider.** Other servers keep delivering the domain's mail there until the old MX records are removed. If existing mailboxes have to be moved first, see [Migrating from another system](/docs/install/migrate) before changing the MX records.
- **A query returns nothing or an old value.** Either the provider has not published the change yet, or a resolver still holds the previous answer until its time to live expires. To tell the two apart, query the provider's authoritative name server directly with `dig @<name server>`.
- **Mail is signed but receivers report a DKIM failure.** The keys generated by the wizard sign outgoing mail from the moment the server starts, but receivers cannot verify the signatures until the DKIM records are published. With manual DNS management the keys are also never rotated, for the reasons given in [DKIM key rotation](/docs/domains/dkim-rotation#without-automatic-dns-management), and [Automatic DNS records](/docs/domains/dns-records) describes how to let the server publish the records and rotate the keys.

### Step 7: User account

- **The password is refused.** The form shows `Password must be at least <n> characters long.` or another policy message. The password does not meet the password policy, which sets a minimum length and rejects passwords that are too easy to guess. [Passwords](/docs/auth/authentication/password) describes the policy settings.
- **The address is refused with `An item with the same key already exists.`** The address is already in use, because every address belongs to exactly one account, group or mailing list, and the administrator account already uses `admin@<domain>`.

### Step 8: Test message

- **The client cannot sign in.** IMAP answers `NO [AUTHENTICATIONFAILED] Authentication failed` and SMTP answers `535 5.7.8 Authentication credentials invalid.`. Check that the user name is the full email address. Once an address has failed to sign in more often than the limit allows, by default <!-- default:Security.authBanRate -->100 per day<!-- /default -->, the server bans the address and closes its connections without a reply, and [Auto-ban](/docs/server/auto-ban#diagnosing-and-clearing-a-ban) explains how to clear the block.
- **Sending fails with `503 5.5.1 You must authenticate first.`** The client connects to port 465 without signing in. Enable authentication for the outgoing server in the client, with the same credentials as the incoming server.
- **Sending fails with `501 5.5.4 You are not allowed to send from this address.`** The sender address set in the client is not one of the account's addresses.
- **The message stays in the queue.** Open the message under <!-- breadcrumb:QueuedMessage --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" /><path d="m21.854 2.147-10.94 10.939" /></svg> Emails › Queued<!-- /breadcrumb:QueuedMessage --> to see why it was not delivered. An error of type connection error with the message `Connection timeout` means that the server cannot reach other mail servers on port 25, which many cloud and residential providers block, so ask the provider to lift the block or send outgoing mail through a relay host as described in [Outbound routing](/docs/mta/outbound/routing). The delivery test under Management › Emails › Delivery tests traces a delivery step by step without sending anything.
- **The message is rejected or lands in the spam folder.** The receiving provider does not trust the server yet. Check that the reverse DNS of the server's address returns the hostname, as listed in the [system requirements](/docs/install/requirements), that the SPF, DKIM and DMARC records of Step 6 resolve, and which check the headers report as failed. [A message is not delivered](/docs/management/troubleshoot#a-message-is-not-delivered) covers the remaining causes.
- **The reply does not arrive.** The other provider cannot reach the server, either because the MX record is not visible yet or because inbound port 25 is blocked by a firewall or the hosting provider. A bounce message with `550 5.1.1 Mailbox does not exist.` has a different cause: the reply was sent to an address that has no account.
<!-- /include:common-problems -->

<!-- include:next-step -->
## Next step

The server now sends and receives mail. Some protections depend on how the server is deployed and are therefore not active by default, so before the server is used in production, remove the plain HTTP listener on port 8080 unless a reverse proxy connects to it, remove `STALWART_RECOVERY_ADMIN` if it was set, and review the remaining settings in [Securing the server](/docs/install/security).

When something goes wrong, [Troubleshooting installation](/docs/install/troubleshooting) lists the installation problems by symptom, and [Troubleshooting](/docs/management/troubleshoot) covers the problems of a running server, such as a rejected message or a failed sign-in. The [FAQ](/docs/faq/) answers the most frequent questions, and questions not covered by the documentation can be asked on the [community forum](https://support.stalw.art).
<!-- /include:next-step -->
