---
title: "Licensing, migration and limits"
description: "Frequently asked questions about activating and extending the Enterprise license, what happens on expiry, upgrading and migrating to Stalwart, and features Stalwart does not support."
sidebar_position: 9
---

## Enterprise license

### Why doesn't my Enterprise license activate?

The license key and the server's hostname name different domains. A license key is issued for a domain, and the server accepts it only when the registered domain of its own hostname, `defaultHostname` in SystemSettings, is that domain. The hosted mail domains are not compared, so hosting the licensed domain is not enough. A mismatch is reported as `License issued to domain "<licensed domain>" does not match "<server domain>"`. See [Activation problems](/docs/server/enterprise#activation-problems).

### Do I need a license key for each server?

No. Each customer receives a single license key, and every server whose hostname has the registered domain of the license accepts it. All servers of a deployment therefore use the same key. A separate key for each server is not needed, and it does not add mailboxes. See [License keys and server hostnames](/docs/server/enterprise#license-keys-and-server-hostnames).

### How do I add mailboxes to my license?

Buy more mailbox licenses for the existing key. The licensing portal then issues an updated key with the higher mailbox count, which replaces the installed one in `licenseKey`. A second key would not help, because keys do not add up: the server holds a single key.

Install the updated key as soon as it is issued. Automatic renewal fetches a new key only in the last four days of the term, so without a manual installation the server would not pick up the updated key until then. See [License keys and server hostnames](/docs/server/enterprise#license-keys-and-server-hostnames).

### What happens when the license expires or I cancel the subscription?

The server keeps running as the Community edition on the same data. The two editions share one data format, so changing between them needs no data migration.

There is no grace period, and the Enterprise features stop at one of two moments. Features that the server checks each time they are used, such as SCIM, tenant administration and masked email, stop at the moment of expiry. The others, such as AI features, alerts and LDAP failover, stop when the configuration is next loaded, normally within an hour.

Nothing is lost in the meantime. Configuration and stored data are kept, and the features return once a valid key is installed. With an API key set, the server keeps retrying renewal after expiry and logs each failure as `Enterprise license renewal failed, retrying`. See [License expiry](/docs/server/enterprise#license-expiry).

## Upgrading and migrating

### How do I upgrade safely?

Back up the data stores and `config.json` before every minor or major upgrade, and read the release notes. The backup matters because a newer release can write data that an older release cannot read.

In containers, choose the image tag with care. The `v1` tag follows the 1.x releases, while `latest` also follows future major releases, so use `v1`. See [Upgrading](/docs/install/upgrade).

### How do I migrate from Dovecot, Exchange, Gmail or another server?

The [migration section](/docs/migration/) describes a procedure for each kind of source: Dovecot and Postfix, other IMAP servers, an [earlier Stalwart version](/docs/migration/guide/configure-source/previous-stalwart), and exports such as Google Takeout or Maildir. Hosted services such as Gmail and Microsoft 365 are covered in [Migrating from hosted services](/docs/migration/guide/hosted).

Moving an existing Stalwart server to another database backend is a different task with its own procedure, [Database migration](/docs/management/maintenance/migration). See [Choosing a procedure](/docs/migration/#choosing-a-procedure).

### Can I migrate without changing users' passwords?

Yes, when the source stores password hashes in a format Stalwart accepts. Such a hash is imported as given ([Supported hash formats](/docs/auth/authentication/password#supported-hash-formats)), so the migrated account keeps its password. Any other value is hashed as a clear-text password. Dovecot hashes need their scheme prefix adjusted first. See [Creating the account on the new deployment](/docs/migration/guide/migrate-accounts#creating-the-account-on-the-new-deployment).

## Is X supported?

### Can milters or MTA hooks inspect outgoing mail?

Only during an SMTP session. Milters and MTA hooks are external filters, and they run at the stages of inbound sessions, which include authenticated submissions and JMAP submissions. Nothing runs when the queue later delivers a message to a remote server. To inspect the mail that users send, attach the filters to the stages of the submission listener. See [Filters](/docs/mta/filter/).

### Can I change the IMAP greeting?

No. The IMAP greeting, `Stalwart IMAP4rev2 at your service.`, is fixed. See [IMAP and POP3](/docs/email/settings/imap).

### Can I warm up a new IP address?

Not with a built-in schedule, but the effect can be built by hand. Stalwart has no IP warm-up schedule. Outbound throttles keyed on the mail exchanger or the recipient domain can, however, limit the volume sent to each destination, and the administrator can raise these limits over time. See [Exceeded throttles](/docs/mta/outbound/rate-limit#exceeded-throttles).

### Does Redis Sentinel support TLS client certificates?

No. TLS client certificates are not supported for any Redis connection, and Sentinel connections are no exception. See [Redis](/docs/storage/backends/redis#sentinel-configuration).
