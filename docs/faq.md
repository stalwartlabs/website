---
sidebar_position: 18
---

# FAQ

## General

### Can Stalwart be used in production?

Stalwart Mail Server is currently being utilized in various production systems globally. To date, there have been no reports of data loss or crashes attributed to Stalwart Mail Server. This track record speaks to the stability and reliability of Stalwart as a production-level mail server solution.

Users who are considering Stalwart for their production environments are encouraged to join our Discord channel or Reddit. Here, they can directly engage with other users who are actively running Stalwart in their production environments. This community-driven approach provides real-world insights and experiences, offering valuable perspectives on the effectiveness and reliability of Stalwart in diverse operational scenarios.

However, it's important to note that Stalwart is currently in version 0.x. As with any software in its early stages, certain aspects are still being refined and optimized. Before reaching the milestone of version 1.0, there may be changes to Stalwart's data layout and configuration files. These changes could necessitate data migration or adjustments in setup and users should be prepared for these potential updates and the accompanying requirements.

### Is my data safe?

Stalwart Mail Server is built upon well-established and proven database systems such as RocksDB, FoundationDB and PostgreSQL. The use of these trusted database systems ensures that Stalwart Mail Server has a strong and reliable foundation for data storage and management. These databases are widely recognized for their stability, security, and performance, contributing significantly to the overall safety of data within Stalwart.

In addition to this, before each release, Stalwart Mail Server undergoes extensive stress testing. This testing is crucial to identify and resolve any issues related to concurrency or other potential problems that could lead to data loss. The stress tests simulate various operational conditions, including high-load scenarios and concurrent access, to ensure that Stalwart can handle real-world demands without compromising data integrity or system stability.

### Where is my data stored?

This depends on storage backends you are using. Please refer to the [storage documentation](/docs/storage/overview) for detailed information.

### Can it handle large volumes of users and emails?

Yes. When using [FoundationDB](/docs/storage/backends/foundationdb) as the backend, Stalwart Mail Server can scale to support millions of users without sacrificing performance.

### Does it have a web interface?

Yes, Stalwart Mail Server includes a web interface that allows users to manage their accounts, settings, and preferences. The web interface is accessible via a web browser and provides a user-friendly way to interact with the mail server.

## Management

### How do I create and manage users?

It depends on the directory backend you are using. If you are using the [internal directory](/docs/auth/backend/internal), you can create and manage users using the [web-admin](/docs/management/webadmin/overview) interface. If you are using an external directory such as [LDAP](/docs/auth/backend/ldap) or [SQL](/docs/auth/backend/sql), you will need to use the tools provided by that directory server.

### How do I add a new domain?

It also depends on the directory backend you are using. If you are using the [internal directory](/docs/auth/backend/internal), you can create and manage domains using the [web-admin](/docs/management/webadmin/overview) interface. If you are using an external directory such as [LDAP](/docs/auth/backend/ldap) or [SQL](/docs/auth/backend/sql), it is not necessary to configure new domain names in order to start receiving emails for it. Just like user accounts, your local domains are also retrieved the directory server. For [SQL](/docs/auth/backend/sql) servers this is done by executing the `domains` [lookup query](/docs/auth/backend/sql#lookup-queries) and in [LDAP](/docs/auth/backend/ldap) servers this is done by searching for objects using `domain` [lookup query](/docs/auth/backend/ldap#lookup-queries).

Sending emails from a new domain does not require any additional configuration either, but to improve deliverability it is recommended that you [create a new DKIM key](/docs/smtp/authentication/dkim/sign#generating-dkim-keys), add it to your [DNS records](/docs/smtp/authentication/dkim/sign#publishing-dkim-keys) and [enable DKIM signing](/docs/smtp/authentication/dkim/sign#multiple-domains) for the new domain.

### How can I migrate from another server?

Stalwart Mail Server includes a command line interface to facilitate [data migration](/docs/management/cli/database/migrate) from a previous version of the server or from third-party servers.

### How do I backup my data?

The backup procedure depends on which database and blob storage backend you are using. Please refer to the [backup documentation](/docs/management/cli/database/backup) for detailed instructions.

## E-mail

### How is anti-spam handled?

Stalwart includes its own built-in spam filter that uses statistical techniques like Naive Bayes. It also supports DNS Blocklists (DNSBLs) and collaborative digest-based spam filtering tools like Pyzor. Additionally, Stalwart can easily integrate with popular anti-spam solutions such as SpamAssassin and RSPAMD using [milter](/docs/smtp/filter/milter) as well as other [filtering mechanisms](/docs/smtp/filter/overview).

### Does it support relay hosts?

Yes, [relay hosts](/docs/smtp/outbound/routing#relay-host) are supported for sending emails to external domains.

### Is greylisting supported?

Yes, greylisting can be implemented as a Sieve filter. You can find an example [here](/docs/sieve/overview#greylisting).


## Encryption

### What is encryption at rest?

Encryption at rest refers to the process of encrypting data when it is stored, or "at rest", on the disk. In Stalwart Mail Server, this feature provides the ability to automatically encrypt plain-text messages using either PGP or S/MIME before they are written to disk.

### Is encryption at rest enabled by default?

Yes, encryption at rest is enabled by default and is activated when the user uploads their S/MIME certificate or PGP public key. However, it can be disabled by setting the `storage.encryption.enable` attribute to `false`.

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

Administrators can easily customize settings from the [web-admin](/docs/management/webadmin/overview) or, for advanced users, the `spam-filter` Sieve script.

### What is greylisting, and how does it help?

Greylisting temporarily defers emails from unknown senders. If the sender is legitimate, they'll typically resend the email after a short delay, whereas most spammers won't. This process helps in reducing spam.

### How can I set up spam traps?

You can set up decoy email addresses to catch and analyze spam. Any messages sent to these addresses are considered spam. The list of spamtrap email addresses can be managed from the [web-admin](/docs/management/webadmin/overview).

### I've heard about sender reputation tracking. How does that work in Stalwart?

Stalwart tracks the previous spam scores of senders based on their IP address, ASN, domain, and email address. It uses this data to adjust the spam score of incoming messages, helping in more accurate spam identification.

### Does Stalwart support collaborative spam filtering mechanisms like Pyzor?

Yes! Stalwart integrates with collaborative digest-based spam filtering tools like Pyzor to enhance its spam detection capabilities.


