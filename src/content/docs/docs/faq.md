---
sidebar_position: 60
title: "FAQ"
---

## General

### Can Stalwart be used in production?

Stalwart is currently being utilized in various production systems globally. To date, there have been no reports of data loss or crashes attributed to Stalwart. This track record speaks to the stability and reliability of Stalwart as a production-level mail server solution.

Users who are considering Stalwart for their production environments are encouraged to join our Discord channel or Reddit. Here, they can directly engage with other users who are actively running Stalwart in their production environments. This community-driven approach provides real-world insights and experiences, offering valuable perspectives on the effectiveness and reliability of Stalwart in diverse operational scenarios.

However, it's important to note that Stalwart is currently in version 0.x. As with any software in its early stages, certain aspects are still being refined and optimized. Before reaching the milestone of version 1.0, there may be changes to Stalwart's data layout and configuration files. These changes could necessitate data migration or adjustments in setup and users should be prepared for these potential updates and the accompanying requirements.

### Is my data safe?

Stalwart is built upon well-established and proven database systems such as RocksDB, FoundationDB and PostgreSQL. The use of these trusted database systems ensures that Stalwart has a strong and reliable foundation for data storage and management. These databases are widely recognized for their stability, security, and performance, contributing significantly to the overall safety of data within Stalwart.

In addition to this, before each release, Stalwart undergoes extensive stress testing. This testing is crucial to identify and resolve any issues related to concurrency or other potential problems that could lead to data loss. The stress tests simulate various operational conditions, including high-load scenarios and concurrent access, to ensure that Stalwart can handle real-world demands without compromising data integrity or system stability.

### Where is my data stored?

This depends on storage backends you are using. Please refer to the [storage documentation](/docs/storage/) for detailed information.

### Can it handle large volumes of users and emails?

Yes. When using [FoundationDB](/docs/storage/backends/foundationdb) as the backend, Stalwart can scale to support millions of users without sacrificing performance.

### Does it have a web interface?

Yes, Stalwart includes a web interface that allows users to manage their accounts, settings, and preferences. The web interface is accessible via a web browser and provides a user-friendly way to interact with the mail server.

## Management

### How do I create and manage users?

It depends on the directory backend you are using. If you are using the [internal directory](/docs/auth/backend/internal), you can create and manage users using the [web-admin](/docs/management/webui/) interface. If you are using an external directory such as [LDAP](/docs/auth/backend/ldap) or [SQL](/docs/auth/backend/sql), you will need to use the tools provided by that directory server.

### How do I add a new domain?

It also depends on the directory backend you are using. If you are using the [internal directory](/docs/auth/backend/internal), you can create and manage domains using the [web-admin](/docs/management/webui/) interface. If you are using an external directory such as [LDAP](/docs/auth/backend/ldap) or [SQL](/docs/auth/backend/sql), it is not necessary to configure new domain names in order to start receiving emails for it. Just like user accounts, your local domains are also retrieved the directory server. For [SQL](/docs/auth/backend/sql) servers this is done by executing the `domains` [lookup query](/docs/auth/backend/sql#directory-queries) and in [LDAP](/docs/auth/backend/ldap) servers this is done by searching for objects using `domain` [lookup query](/docs/auth/backend/ldap#lookup-filters).

Sending emails from a new domain does not require any additional configuration either, but to improve deliverability it is recommended that you [create a new DKIM key](/docs/mta/authentication/dkim/sign#generating-keys), add it to your [DNS records](/docs/mta/authentication/dkim/sign#publishing-dkim-keys) and [enable DKIM signing](/docs/mta/authentication/dkim/sign#multiple-domains) for the new domain.

### How can I migrate from another server?

Stalwart includes a command line interface to facilitate [data migration](/docs/management/maintenance/migration) from a previous version of the server or from third-party servers.

### How do I backup my data?

The backup procedure depends on the storage backend in use. For external databases such as PostgreSQL, MySQL, or FoundationDB, follow the backup instructions provided by the respective database. For embedded databases such as RocksDB or SQLite, the `/var/lib/stalwart` directory can be copied to create a full backup.

## E-mail

### How is anti-spam handled?

Stalwart includes its own built-in spam filter that uses the FTRL-Proximal algorithm and feature hashing. It also supports DNS Blocklists (DNSBLs) and collaborative digest-based spam filtering tools like Pyzor. Additionally, Stalwart can easily integrate with popular anti-spam solutions such as SpamAssassin and RSPAMD using [milter](/docs/mta/filter/milter) as well as other [filtering mechanisms](/docs/mta/filter/).

### Does it support relay hosts?

Yes, [relay hosts](/docs/mta/outbound/routing#relay-host) are supported for sending emails to external domains.

### Is greylisting supported?

Yes, greylisting can be implemented as a Sieve filter. You can find an example [here](/docs/sieve/).


## Encryption

### What is encryption at rest?

Encryption at rest refers to the process of encrypting data when it is stored, or "at rest", on the disk. In Stalwart, this feature provides the ability to automatically encrypt plain-text messages using either PGP or S/MIME before they are written to disk.

### Is encryption at rest enabled by default?

Yes, encryption at rest is enabled by default and is activated when the user uploads their S/MIME certificate or PGP public key. However, it can be disabled by setting the `email.encryption.enable` attribute to `false`.

### How do I enable or disable encryption at rest?

Users can enable or disable encryption at rest using a web interface that is available under "/crypto" on the same port where the JMAP server is listening. The interface asks for the login name, password, encryption method to use (S/MIME or PGP), and to select the file containing the certificates or public keys. To disable encryption, select the "Disable Encryption" option from the dropdown and then click "Update".

### What happens when encryption at rest is enabled?

Once encryption at rest is enabled, all incoming emails are automatically encrypted before they are written to disk. Not even the system administrator is able to decrypt these messages as they are encrypted with the PGP public key or S/MIME certificate provided by the user. 

### What encryption methods are supported?

Stalwart supports two encryption methods: PGP (using either AES256 or AES128 symmetric encryption) and S/MIME (using either AES256-CBC or AES128-CBC symmetric encryption).

### What format should the S/MIME certificates or PGP keys be in when uploaded?

S/MIME certificates can be imported in DER or PEM formats. However, if importing multiple certificates, they must be in PEM format. PGP public keys can be imported in raw format or as an ASCII-armored text file containing one or multiple public keys.

### I have enabled encryption at rest. How can I test if it's working?

Once you have enabled encryption at rest, it is recommended that you send a test email to yourself. This allows you to confirm that your email client can properly decrypt the message.


## Spam & Phishing Filter

### What makes Stalwart's Spam filter different from other solutions?

Stalwart's spam filter is built-in and doesn't require any third-party software. It's designed for speed and efficiency, keeping messages within the server during the filtering process. It offers filtering rules on par with popular solutions like RSpamd and SpamAssassin.

### How does the spam classifier work?

Our spam classifier uses the FTRL-Proximal algorithm and feature hashing. It automatically trains itself, ensuring improved accuracy over time. 

### How does Stalwart handle phishing attempts?
Stalwart provides phishing protection by checking against databases like OpenPhish and PhishTank, identifying homographic URL attacks, sender spoofing, and other deceptive techniques. It also detects and flags suspicious URL patterns.

### What are DNSBLs, and why are they important?

DNS Blocklists (DNSBLs) are databases that track IP addresses known for sending spam. Stalwart checks IP addresses, domains, and even hashes against several DNSBLs to filter out potential spam sources.

### How can I customize the spam filter settings?

Administrators can easily customize settings from the [web-admin](/docs/management/webui/) or, for advanced users, the `spam-filter` Sieve script.

### What is greylisting, and how does it help?

Greylisting temporarily defers emails from unknown senders. If the sender is legitimate, they'll typically resend the email after a short delay, whereas most spammers won't. This process helps in reducing spam.

### How can I set up spam traps?

You can set up decoy email addresses to catch and analyze spam. Any messages sent to these addresses are considered spam. The list of spamtrap email addresses can be managed from the [web-admin](/docs/management/webui/).

### I've heard about sender reputation tracking. How does that work in Stalwart?

Stalwart tracks the previous spam scores of senders based on their IP address, ASN, domain, and email address. It uses this data to adjust the spam score of incoming messages, helping in more accurate spam identification.

### Does Stalwart support collaborative spam filtering mechanisms like Pyzor?

Yes! Stalwart integrates with collaborative digest-based spam filtering tools like Pyzor to enhance its spam detection capabilities.


## Setup & WebUI

### Why does `/admin` return `404 Not Found`?

The WebUI is delivered as a downloadable [Application](/docs/applications/) bundle that the server fetches from `https://github.com/stalwartlabs/webui/releases/latest/` on first start, then refreshes on a schedule. When that initial download fails (no outbound HTTPS, GitHub blocked, restrictive proxy), the bundle is never unpacked and every WebUI route returns 404. Verify the host can reach `github.com` and `objects.githubusercontent.com` on TCP/443. For air-gapped deployments, host the bundle on an internal HTTPS server and update the [`resourceUrl`](/docs/ref/object/application#resourceurl) field on the WebUI's [Application](/docs/ref/object/application) record to point at it. After one successful download, subsequent failures are non-fatal: the previously installed bundle keeps serving until the next refresh succeeds.

### Why does the root URL `/` return `404`?

There is no page mounted at the root. The WebUI lives at `/admin`, the per-user portal at `/account`, and the JMAP endpoint at `/jmap`. Configure the reverse proxy or browser bookmark to point at `/admin` directly, or add a redirect from `/`.

### Why is sign-in stuck in a loop or showing a basic-auth dialog?

Almost always one of the following:

- The browser is on `http://` while the configured hostname is announced over `https://`. Open the page over HTTPS, or use `http://<host>:8080/admin` while TLS is being put in place.
- The browser cached an earlier visit on the wrong scheme. Clear the site's history or use a private window.
- A reverse proxy is terminating HTTPS but talking HTTP upstream and the discovery URLs end up pointing at the wrong scheme or port. See [Reverse proxy › Overview](/docs/server/reverse-proxy/) for the supported patterns and the [`STALWART_PUBLIC_URL`](/docs/configuration/environment-variables#public-urls) variable.

### Can I reach the WebUI by IP address?

The OAuth flow used by the WebUI binds to the configured `defaultHostname` over HTTPS. Loading the WebUI by IP, by container name, or over plain HTTP appears to load the page but fails at the OAuth callback. Use the configured hostname over HTTPS, or sign in at `http://<host>:8080/admin` (which is exempt from the hostname check) until TLS is in place.

### Can application passwords be configured for accounts in an external directory?

Application passwords are stored against the internal directory's account record. When the principal originates in an external directory (LDAP, SQL, OIDC), the secret has to live in the external directory, not in Stalwart. For clients that do not speak SASL OAUTHBEARER (CalDAV / CardDAV in particular), either configure the external directory to accept the application password as a secondary credential, or run a hybrid setup with the internal directory covering app-password use.

### No log files appear under `/var/log/stalwart`. What's wrong?

Three causes, in descending order of frequency:

1. The directory does not exist or is not writable by the service user. On the binary install, `/var/log/stalwart` is created at install time and owned by `stalwart:stalwart`. On Docker, mount a host directory and `chown 2000:2000 <dir>` before starting the container.
2. The configured tracer points at *Console* (intentional in containers, so logs surface through the orchestrator's log driver). Inspect *Telemetry → Tracers* in the WebUI to confirm the destination.
3. The tracer's path was misconfigured. Reset by deleting the tracer and recreating it from defaults at *Telemetry → Tracers → New*.

### My reverse proxy's IP keeps getting banned. What do I do?

When the proxy does not forward the real client IP, every request appears to come from the proxy and Stalwart's automatic banning then locks the proxy out, which in turn locks every user out. Either mark the proxy's IP as a trusted network so banning is skipped for requests from that IP and configure the proxy to forward the real client IP via PROXY protocol or `X-Forwarded-For` (then enable the matching reader on the listener), or raise the auto-ban threshold for the HTTP listener. See [Proxy Protocol](/docs/server/reverse-proxy/proxy-protocol) for the recommended pattern.

### What outbound HTTPS does Stalwart need?

A fresh install reaches out to:

- `github.com` and `objects.githubusercontent.com`: for the WebUI bundle on first start and on the periodic refresh, and for the spam-filter rule list and Apple Push Notification (APN) endpoint list, both fetched from the same release storage.
- `acme-v02.api.letsencrypt.org` (or whichever ACME directory is configured): for TLS certificate issuance.
- The DNS provider's API: when *automatic DNS management* is enabled.
- The OIDC provider's well-known and userinfo endpoints: when an OIDC directory is configured.

In restricted-egress environments, allow at minimum the GitHub hosts above; otherwise the WebUI never appears, the spam classifier runs without its fetched rule lists, and APN-based push notifications stop working. See [WebUI overview](/docs/management/webui/#outbound-network-requirement) for the full list and for hosting the bundle internally.


