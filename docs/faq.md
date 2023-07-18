---
sidebar_position: 10
---

# FAQ

### How do I create and manage users?

Stalwart Mail Server doesn't store any account details or login credentials but rather defers this responsibility to a [directory](/docs/directory/overview) server. 
This allows you to leverage an existing [LDAP](/docs/directory/types/ldap) directory or [SQL](/docs/directory/types/sql) database to handle tasks such as authentication, validating local accounts, and retrieving account-related information.
Any changes to user accounts or groups in the directory server — such as adding or removing users, changing passwords, or modifying group memberships — are immediately reflected in the Stalwart Mail Server.
If you don't currently have a directory server, you can create an SQLite directory during installation which uses the [sample directory schema](/docs/directory/types/sql#sample-directory-schema).

### How do I add a new domain?

It is not necessary to configure new domain names in order to start receiving emails for it. Just like user accounts, your local domains are also retrieved the directory server. For [SQL](/docs/directory/types/sql) servers this is done by executing the `domains` [lookup query](/docs/directory/types/sql#lookup-queries) and in [LDAP](/docs/directory/types/ldap) servers this is done by searching for objects using `domain` [lookup query](/docs/directory/types/ldap#lookup-queries).

Sending emails from a new domain does not require any additional configuration either, but to improve deliverability it is recommended that you [create a new DKIM key](/docs/smtp/authentication/dkim/sign#generating-dkim-keys), add it to your [DNS records](/docs/smtp/authentication/dkim/sign#publishing-dkim-keys) and [enable DKIM signing](/docs/smtp/authentication/dkim/sign#multiple-domains) for the new domain.

### Where is my data stored?

This depends on the database and blob storage backends you are using. Settings, indexes and other metadata can be stored either in [SQLite](/docs/jmap/database#sqlite) or [FoundationDB](/docs/jmap/database#foundationdb) database backends. Emails and blobs can be stored either [locally using Maidir](/docs/jmap/blob#local-storage) or in [S3-compatible storage](/docs/jmap/blob#s3-compatible-storage) solutions.

### How can I migrate from another server?

Stalwart Mail Server includes a command line interface to facilitate [data migration](/docs/management/migrate) from a previous version of the server or from third-party servers.

### Can it handle large volumes of users and emails?

Yes. When using [FoundationDB](/docs/jmap/database#foundationdb) as the backend, Stalwart Mail Server can scale to support millions of users without sacrificing performance.

### How do I backup my data?

The backup procedure depends on which database and blob storage backend you are using. Please refer to the [backup documentation](/docs/management/backup) for detailed instructions.

### How is Anti-SPAM handled?

Stalwart SMTP supports both SpamAssassin and RSPAMD. Spam filters are configured as [content filters](/docs/smtp/inbound/data#spam-filtering).

### Does it support relay hosts?

Yes, [relay hosts](/docs/smtp/outbound/routing#relay-host) are supported for sending emails to external domains.

### Is greylisting supported?

Yes, greylisting can be implemented as a Sieve filter. You can find an example [here](/docs/smtp/inbound/sieve#greylisting).

### Does it have a web interface?

Not yet, but it is planned for a future release.

