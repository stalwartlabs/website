---
sidebar_position: 12
---

# FAQ

## Management
### How do I create and manage users?

Stalwart Mail Server doesn't store any account details or login credentials but rather defers this responsibility to a [directory](/docs/directory/overview) server. 
This allows you to leverage an existing [LDAP](/docs/directory/types/ldap) directory or [SQL](/docs/directory/types/sql) database to handle tasks such as authentication, validating local accounts, and retrieving account-related information.
Any changes to user accounts or groups in the directory server — such as adding or removing users, changing passwords, or modifying group memberships — are immediately reflected in the Stalwart Mail Server.
If you don't currently have a directory server, you can create an SQLite directory during installation which uses the [sample directory schema](/docs/directory/types/sql#sample-directory-schema).

### How do I add a new domain?

It is not necessary to configure new domain names in order to start receiving emails for it. Just like user accounts, your local domains are also retrieved the directory server. For [SQL](/docs/directory/types/sql) servers this is done by executing the `domains` [lookup query](/docs/directory/types/sql#lookup-queries) and in [LDAP](/docs/directory/types/ldap) servers this is done by searching for objects using `domain` [lookup query](/docs/directory/types/ldap#lookup-queries).

Sending emails from a new domain does not require any additional configuration either, but to improve deliverability it is recommended that you [create a new DKIM key](/docs/smtp/authentication/dkim/sign#generating-dkim-keys), add it to your [DNS records](/docs/smtp/authentication/dkim/sign#publishing-dkim-keys) and [enable DKIM signing](/docs/smtp/authentication/dkim/sign#multiple-domains) for the new domain.

### How can I migrate from another server?

Stalwart Mail Server includes a command line interface to facilitate [data migration](/docs/management/migrate) from a previous version of the server or from third-party servers.

### How do I backup my data?

The backup procedure depends on which database and blob storage backend you are using. Please refer to the [backup documentation](/docs/management/backup) for detailed instructions.

## Storage

### Where is my data stored?

This depends on the database and blob storage backends you are using. Settings, indexes and other metadata can be stored either in [SQLite](/docs/storage/database/sqlite) or [FoundationDB](/docs/storage/database/foundationdb) database backends. Emails and blobs can be stored either [locally using Maidir](/docs/storage/blob/local) or in [S3-compatible storage](/docs/storage/blob/s3) solutions.

### Can it handle large volumes of users and emails?

Yes. When using [FoundationDB](/docs/storage/database/foundationdb) as the backend, Stalwart Mail Server can scale to support millions of users without sacrificing performance.

## E-mail

### How is anti-spam handled?

Stalwart SMTP can easily integrate with popular anti-spam solutions such as SpamAssassin and RSPAMD using [milter](/docs/smtp/filter/milter) as well as other [filtering mechanisms](/docs/smtp/filter/overview).

### Does it support relay hosts?

Yes, [relay hosts](/docs/smtp/outbound/routing#relay-host) are supported for sending emails to external domains.

### Is greylisting supported?

Yes, greylisting can be implemented as a Sieve filter. You can find an example [here](/docs/sieve/overview#greylisting).


## Encryption

### What is encryption at rest?

Encryption at rest refers to the process of encrypting data when it is stored, or "at rest", on the disk. In Stalwart Mail Server, this feature provides the ability to automatically encrypt plain-text messages using either PGP or S/MIME before they are written to disk.

### Is encryption at rest enabled by default?

Yes, encryption at rest is enabled by default and is activated when the user uploads their S/MIME certificate or PGP public key. However, it can be disabled by setting the `jmap.encryption.enable` attribute to `false`.

### How do I enable or disable encryption at rest?

Users can enable or disable encryption at rest using a web interface that is available under "/crypto" on the same port where the JMAP server is listening. The interface asks for the login name, password, encryption method to use (S/MIME or PGP), and to select the file containing the certificates or public keys. To disable encryption, select the "Disable Encryption" option from the dropdown and then click "Update".

### What happens when encryption at rest is enabled?

Once encryption at rest is enabled, all incoming emails are automatically encrypted before they are written to disk. Not even the system administrator is able to decrypt these messages as they are encrypted with the PGP public key or S/MIME certificate provided by the user. 

### What encryption methods are supported?

Stalwart Mail Server supports two encryption methods: PGP (using either AES256 or AES128 symmetric encryption) and S/MIME (using either AES256-CBC or AES128-CBC symmetric encryption).

### What format should the S/MIME certificates or PGP keys be in when uploaded?

S/MIME certificates can be imported in DER or PEM formats. However, if importing multiple certificates, they must be in PEM format. PGP public keys can be imported in raw format or as an ASCII-armored text file containing one or multiple public keys.

### I have enabled encryption at rest. How can I test if it's working?

Once you have enabled encryption at rest, it is recommended that you send a test email to yourself. This allows you to confirm that your email client can properly decrypt the message.


## Spam & Phishing Filter

### What makes Stalwart's Spam filter different from other solutions?

Stalwart Mail Server's spam filter is built-in and doesn't require any third-party software. It's designed for speed and efficiency, keeping messages within the server during the filtering process. It also offers comprehensive filtering rules on par with popular solutions like RSpamd and SpamAssassin.

### How does the spam classifier work?

Our spam classifier uses statistical techniques, including Naive Bayes and Inverse Chi-Square. It automatically trains itself, ensuring improved accuracy over time. 

### How does Stalwart handle phishing attempts?
Stalwart offers robust phishing protection by checking against databases like OpenPhish and PhishTank, identifying homographic URL attacks, sender spoofing, and other deceptive techniques. It also detects and flags suspicious URL patterns.

### What are DNSBLs, and why are they important?

DNS Blocklists (DNSBLs) are databases that track IP addresses known for sending spam. Stalwart checks IP addresses, domains, and even hashes against several DNSBLs to filter out potential spam sources.

### How can I customize the spam filter settings?

Administrators can easily customize settings from the `etc/spamfilter/scripts/` directory. Several configuration files, such as `config.sieve`, `rbl.sieve`, and `pyzor.sieve`, allow for granular control over the spam filter's behavior.

### What is greylisting, and how does it help?

Greylisting temporarily defers emails from unknown senders. If the sender is legitimate, they'll typically resend the email after a short delay, whereas most spammers won't. This process helps in reducing spam.

### How can I set up spam traps?

You can set up decoy email addresses to catch and analyze spam. Any messages sent to these addresses are considered spam. The list of spamtrap email addresses can be configured from the `etc/spamfilter/maps/spam_trap.list`.

### I've heard about sender reputation tracking. How does that work in Stalwart?

Stalwart tracks the previous spam scores of senders based on their IP address, ASN, domain, and email address. It uses this data to adjust the spam score of incoming messages, helping in more accurate spam identification.

### Does Stalwart support collaborative spam filtering mechanisms like Pyzor?

Yes! Stalwart integrates with collaborative digest-based spam filtering tools like Pyzor to enhance its spam detection capabilities.

## General

### Does it have a web interface?

Not yet, but it is planned for a future release.



