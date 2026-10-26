---
title: "Setup wizard"
description: "Reference for the five screens of the setup wizard that configures a new Stalwart server: each field, its default, what it configures and the errors each screen reports."
sidebar_position: 6
---

A new server has no configuration, and the setup wizard is how it gets one. The wizard is a WebUI form that a server started in [bootstrap mode](/docs/configuration/bootstrap-mode) serves on port 8080. It asks only for the decisions that the server cannot make for itself, such as its hostname and where its data lives, and turns the answers into a working initial configuration: the data store, the first domain with its certificate and signing keys, the account directory, the log and, optionally, a DNS provider.

Each field of the wizard corresponds to a field of the [Bootstrap](/docs/ref/object/bootstrap) object, so a deployment tool can submit the same configuration through the JMAP API instead. This page lists the fields, their defaults and the pages that describe what they configure. Step 3 of the installation tutorials ([Linux, macOS and FreeBSD](/docs/install/platform/linux#step-3-complete-the-setup-wizard), [Docker](/docs/install/platform/docker#step-3-complete-the-setup-wizard), [Windows](/docs/install/platform/windows#step-3-complete-the-setup-wizard)) walks through the same screens with the values for a first installation.

## Opening the wizard

The wizard is served at `http://<host>:8080/admin` while the server runs in bootstrap mode, or on the port set by `STALWART_RECOVERY_MODE_PORT`. Sign in as `admin` with the temporary password from the server output, as described in [Temporary administrator](/docs/configuration/bootstrap-mode#temporary-administrator).

<video src="/img/setup.mp4" autoplay loop muted playsinline style="max-width: 100%; height: auto"  ></video>

## Step 1: Server identity

| Field | Default | Configures |
|---|---|---|
| Server Hostname | The machine's host name | The name used in SMTP greetings, message headers, certificate requests and the published HTTPS URLs ([Public URLs](/docs/configuration/environment-variables#public-urls)) |
| Default Email Domain | The domain of the machine's host name, or `example.org` | The first [domain](/docs/domains/) hosted by the server |
| Automatically Obtain TLS Certificate | <!-- default:Bootstrap.requestTlsCertificate as=enabled -->enabled<!-- /default --> | A Let's Encrypt [ACME provider](/docs/server/tls/acme/) and automatic certificates for the default domain ([TLS certificates](/docs/domains/tls-certificates)) |
| Generate Email Signing Keys | <!-- default:Bootstrap.generateDkimKeys as=enabled -->enabled<!-- /default --> | Automatic DKIM key management for the default domain ([DKIM key rotation](/docs/domains/dkim-rotation)) |

The wizard pre-fills both names from the machine's host name: the hostname field with the host name itself, and the domain field with its registrable domain, or `example.org` when the host name has none. In a container, the pre-filled host name is the container id. A short host name or a container id is not a valid server hostname, so on such a machine both pre-filled values must be replaced.

Both names must satisfy the rules in [Accepted domain names](/docs/domains/#accepted-domain-names), and other names are refused with `Invalid server hostname` or `Invalid default domain`. The wizard checks them only when the setup is submitted on the last screen, then returns to this step with the error and saves nothing.

The ACME challenge that the server uses depends on Step 5: DNS-01 with a DNS provider, which needs no inbound connection, and TLS-ALPN-01 with manual DNS management, for which every name in the certificate must resolve to the server and port 443 must be reachable from the internet before the restart. The names each challenge requests are listed in [Names in a certificate](/docs/server/tls/acme/configuration#names-in-a-certificate), and when one name fails validation, no certificate is issued. The server registers the ACME account while the wizard is submitted. When the registration fails, for example without outbound HTTPS, the server logs the error, the wizard still completes, and the domain is left with manual certificate management.

The DKIM keys sign outgoing mail from the first start. They are rotated on a schedule only when the domain uses automatic DNS management. With manual DNS management, the administrator publishes their records by hand.

## Step 2: Storage

| Field | Default | Configures |
|---|---|---|
| Main Data Storage | RocksDB in `/var/lib/stalwart/` (`/var/db/stalwart/` on FreeBSD) | The [data store](/docs/storage/data), the only setting written to `config.json` |
| Attachment & File Storage | *Use data store* | The [blob store](/docs/storage/blob) |
| Full-Text Search Index | *Use data store* | The [search store](/docs/storage/fts) |
| Cache & Temporary Data | *Local in-process store (single node only)* | The [in-memory store](/docs/storage/in-memory); a server that will join a cluster needs Redis here |

The data directory must exist and belong to the service account. The wizard proposes the same directories for an installation made with a prefix, so replace them with `<prefix>/data` here and `<prefix>/logs` in Step 4, the directories that the installation script created. Besides the defaults, the screen offers PostgreSQL, MySQL and SQLite for the data store, object storage for attachments and a separate search engine. [Choosing a database](/docs/install/store) explains the choice of backends.

The wizard connects to the selected data store before it accepts the form, and refuses a store that is not empty:

- `The selected data store has already been initialized.`: the store already holds the data of a Stalwart server, and the wizard writes nothing. [Setup wizard on an existing server](/docs/configuration/bootstrap-mode#setup-wizard-on-an-existing-server) describes how to recover.
- A store created by an older Stalwart version: the wizard refuses it as well.
- `Timed out probing the data store after 30 seconds.` followed by hints for each backend: the store did not answer. Check the host, port, credentials and network path to the database.

## Step 3: Account directory

The single field on this screen, **Directory Type**, selects the [directory](/docs/auth/backend/) of the server, which the wizard stores in [`Authentication.directoryId`](/docs/ref/object/authentication#directoryid). It defaults to *Use the internal directory*.

With the internal directory the wizard creates an administrator account on the last screen. With an LDAP, SQL or OpenID Connect directory it creates the [Directory](/docs/ref/object/directory) object and no administrator, so the first administrator is promoted after the restart as described in [Promoting the first administrator](/docs/install/directory#promoting-the-first-administrator).

## Step 4: Logging

The main field on this screen, **Log Destination**, configures the first [tracer](/docs/telemetry/tracing/tracers), the component that writes the server's log. It defaults to *Log file* in `/var/log/stalwart/`, with one file per day named `stalwart.log.<date>`.

The screen also shows the options of the chosen destination. **Use ANSI colors** is <!-- default:Tracer.Log.ansi as=enabled -->enabled<!-- /default --> for a log file, and adds colour escape codes to every line, which make the log harder to search with `grep` and to read with log tools; turn it off when the log is read by anything other than a terminal, such as `grep` or a log tool.

The other destinations are *Console* (standard output, for containers and for Windows under NSSM), *Systemd Journal* and *Open Telemetry* over HTTP or gRPC. Further destinations can be added after setup as [Tracer](/docs/ref/object/tracer) objects.

## Step 5: Automatic DNS management

The single field on this screen, **DNS Server Type**, defaults to *Manual DNS server management*. Selecting the provider that hosts the zone is recommended whenever it is supported: once the provider is selected and its API credentials are entered, the server publishes the domain's records itself and keeps them current, rotates the DKIM keys, and obtains its certificate with the DNS-01 challenge, which needs no inbound connection. When a provider is selected, the wizard creates a [DnsServer](/docs/ref/object/dns-server) and enables [automatic DNS management](/docs/domains/dns-records) for the default domain.

With a provider, the wizard publishes the DKIM, SPF, DMARC, SRV, MTA-STS, TLS reporting and autoconfiguration records. The MX and CAA records remain the administrator's task, and they can be added to the domain's [`publishRecords`](/docs/ref/object/domain#publishrecords) later. The first update runs when the server restarts, and the server requests the certificate once the update has succeeded. Cloudflare, Route 53, Google Cloud DNS and RFC 2136 servers are among the supported providers, and [DNS providers](/docs/server/dns/provider) lists them all with the credentials each needs. Manual DNS management suits a zone whose provider is not supported, or a zone that must stay under manual control. The administrator then copies the records from the domain's zone file, as described in [DNS records](/docs/install/dns#publishing-the-records), the DKIM keys are not rotated, and the certificate is validated with the TLS-ALPN-01 challenge described in Step 1. The choice can be changed at any time after setup, as described in [Automatic DNS records](/docs/domains/dns-records).

## Setup complete

With the internal directory, the last screen shows the address and the random 16-character password of the new administrator account, `admin@<domain>`, which the server neither shows again nor logs. The server keeps running in bootstrap mode until it is restarted, and [Completing the setup](/docs/configuration/bootstrap-mode#completing-the-setup) describes what the restart changes.
