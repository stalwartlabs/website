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
