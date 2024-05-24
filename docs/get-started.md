---
sidebar_position: 1
---

# Getting started

**Stalwart Mail Server** is an open-source mail server solution with SMTP, JMAP, IMAP4, and POP3 support and a wide range of modern features. It is written in Rust and aims to be secure, fast, robust and scalable.

## Choosing a storage backend

When installing Stalwart Mail server you will be asked to specify a backend for each one of the four store types:

- [Data store](/docs/storage/data): Where email metadata, folders, and various settings are stored. Essentially, it contains all the data except for large binary objects (blobs).
- [Blob store](/docs/storage/blob): Used for storing large binary objects such as emails, sieve scripts, and other files.
- [Full-text search store](/docs/storage/fts): Dedicated to indexing for full-text search, enhancing the speed and efficiency of text-based queries
- [Lookup store](/docs/storage/lookup): A key-value storage used primarily by the SMTP server and anti-spam components. It stores sender reputation information, bayesian classifier models, greylist data, message reply tracking and other similar data.

The following table summarizes the supported backends available for each store type:

|                 | Data store         | Blob store         | Full-text store    | Lookup store       |
|-----------------|--------------------|--------------------|--------------------|--------------------|
| RocksDB         | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| FoundationDB    | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| PostgreSQL      | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| MySQL / MariaDB | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| SQLite          | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| S3/MinIO        |                    | :white_check_mark: |                    |                    |
| Filesystem      |                    | :white_check_mark: |                    |                    |
| ElasticSearch   |                    |                    | :white_check_mark: |                    |
| Redis           |                    |                    |                    | :white_check_mark: |
| In-memory       |                    |                    |                    | :white_check_mark: |

:::tip Note

Be aware that changing the database backend at a later time will require migrating your data.

:::

## Choosing an authentication backend

A database or directory server is required for authentication, validating local accounts, and obtaining account-related information such as names, group membership or disk quotas. Available options are:

- **Internal**: An internal directory that is automatically created and managed by Stalwart Mail server. It uses the same database backend as the data store.
- **LDAP**: LDAP servers, including OpenLDAP and Active Directory.
- **SQL**: SQL databases, including PostgreSQL, MySQL and SQLite.

:::tip Note

- When the internal directory is used, Stalwart Mail Server manages all user-related data within its own system. In this setup, all account management tasks, such as creating new user accounts, updating passwords, and setting quotas, are performed directly within Stalwart Mail Server.
- When an external LDAP or SQL directory is utilized, all user account management must be performed within that external system. Stalwart Mail Server will rely on this external directory for authentication and user information but will not have the ability to directly modify user details.

:::

## Choosing network ports

Stalwart Mail Server utilizes various network ports to handle different types of email and administrative traffic. Understanding the function of each port can help in optimizing your server's security and performance. Below is a detailed guide on what each port is used for and recommendations on whether to keep it open or closed.

The essential ports are:

- **Port 25 (SMTP)**: Used for receiving incoming emails from other mail servers. It is essential to keep this port open to ensure your mail server can receive emails from the internet.
- **Port 465 (SMTPS)**: SMTP submission with implicit TLS. This port is used for sending outgoing emails securely. It is recommended to keep this port open to allow secure email submission from email clients.
- **Port 993 (IMAPS)**: IMAP4 with implicit TLS. This port is used by IMAP clients to fetch emails securely. Keeping this port open is necessary for providing secure email access to your users.
- **Port 443 (HTTPS)**: A crucial port used for secure [web administration](/docs/management/webadmin/overview) access, [JMAP](/docs/jmap/overview), [REST API](/docs/management/api/overview) access, [OAuth](/docs/auth/oauth) authentication, [ACME TLS-ALPN-01](/docs/server/tls/acme/challenges#tls-alpn-01) challenges, [autoconfig](/docs/server/autoconfig), and [MTA-STS policy](/docs/smtp/transport-security/mta-sts#policy-publishing) retrieval. This port must remain open as it supports multiple critical functionalities.

The non-essential ports are:

- **Port 587 (SMTP Submission)**: This port is used for email submission without implicit TLS (uses STARTTLS). It can be disabled if all mail clients support using port 465 with implicit TLS, which provides enhanced security.
- **Port 143 (IMAP4)**: Standard IMAP4 port without TLS. It is recommended to disable this port and use port 993 instead to ensure all IMAP traffic is encrypted.
- **Port 4190 (ManageSieve)**: Used for managing Sieve scripts remotely. If your users utilize Sieve scripts for email filtering, this port should remain open.
- **Port 110 (POP3)** and **Port 995 (POP3S)**: These ports are used for accessing emails via POP3 (port 110) and POP3 with implicit TLS (port 995). Both should be disabled unless there is a specific use case that requires POP3 access, as IMAP provides more functionality and security.
- **Port 8080 (HTTP)**: Primarily used for initial server setup. It is advisable to keep this port open during the setup phase and disable it afterward to prevent unsecured access to your server.

Disabling unused or non-essential ports helps to reduce potential vulnerabilities and streamline server operations. To disable any of these non-essential ports simply remove the associated [listener](/docs/server/listener) from the configuration file or use the web interface.

## Understanding DNS records

When setting up a mail server, it is essential to configure the necessary DNS records to ensure proper email delivery, security, and client configuration. When a new domain is added, Stalwart Mail Server automatically generates the required DNS records for the domain, which can be copied and pasted into your domain's DNS settings. Below is a brief explanation of each record type and its purpose:

This record directs email traffic to the correct mail server:

```
MX	example.org.	10 mail.example.org.
```

These records are vital for the [DomainKeys Identified Mail (DKIM)](/docs/smtp/authentication/dkim/overview) setup, which helps prevent email spoofing:

```
TXT	202404e._domainkey.example.org.	v=DKIM1; k=ed25519; h=sha256; p=N/BkJD6xbEiMb39v7JW6AwdPHO5gKB3fcCnod4zQ31U=
TXT	202404r._domainkey.example.org.	v=DKIM1; k=rsa; h=sha256; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqlddLN3BjInvBqI1KpdouG7feBsEt5t233jWQJW7FaY7sR/MfWNxuzTObLoZ3l76DFq3xPjVhmy/YYiOAnMOtq9hUFqgBVTSwUNHYPz1YUEcrI5+Ban7P7LV8kggvTAaWhAI3iSXJIFaUq78K8YYr/zrGyBlg5HCPpd+DMRAB8j1ID8bcWFaVebwAOrartXOO/f8Bn9jrRrLhjP3c8UlmkJLXkSncXPp69R9VpevrKJtpBjaFxKtx7DXGie821MHuWJ7pWMdU1Uf3z8UBKF9bnrCZ5v0SdiaFkPXR1Iiq/gR6bMwdlWvST9V6ePnqZqX+Iv4FA28byOot73/CIINFwIDAQAB
```

These records are used by the [Sender Policy Framework (SPF)](/docs/smtp/authentication/spf) to determine which mail servers are authorized to send emails on behalf of your domain:

```
TXT	mail.example.org.	v=spf1 a ra=postmaster -all
TXT	example.org.	v=spf1 mx ra=postmaster -all
```

This record specifies the [Domain-based Message Authentication, Reporting, and Conformance (DMARC)](/docs/smtp/authentication/dmarc) security policy for email delivery and reporting:

```
TXT	_dmarc.example.org.	v=DMARC1; p=reject; rua=mailto:postmaster@example.org; ruf=mailto:postmaster@example.org
```

These records specify the [Mail Transfer Agent Strict Transport Security (MTA-STS)](/docs/smtp/transport-security/mta-sts) policy for secure email transmission:

```
CNAME	mta-sts.example.org.	mail.example.org.
TXT	_mta-sts.example.org.	v=STSv1; id=16561011793845132961
```

This record helps with [reporting](/docs/smtp/transport-security/tls-reporting) issues related to the transport layer security of SMTP:

```
TXT	_smtp._tls.example.org.	v=TLSRPTv1; rua=mailto:postmaster@example.org
```

These records help mail clients such as Outlook or Thunderbird locate email services:

```
SRV	_imap._tcp.example.org.	0 1 110 mail.example.org.
SRV	_imaps._tcp.example.org.	0 1 993 mail.example.org.
SRV	_submissions._tcp.example.org.	0 1 465 mail.example.org.
SRV	_submission._tcp.example.org.	0 1 567 mail.example.org.
```

These records facilitate [automatic configuration](/docs/server/autoconfig) of mail clients:

```
CNAME	autoconfig.example.org.	mail.example.org.
CNAME	autodiscover.example.org.	mail.example.org.
```

TLSA records are used for [DNS-based Authentication of Named Entities (DANE)](/docs/smtp/transport-security/dane) and are optional but recommended if you aim to enhance the security of TLS connections. These records link TLS certificates specifically to DNS, enhancing trust and preventing interception:

```
TLSA	_25._tcp.mail.example.org.	3 0 1 064dbc632f1ba7d0a2a3faeadeedfebd6f90f850dfb852c97ee9df9b6e5c5e7c
TLSA	_25._tcp.mail.example.org.	3 0 2 76a5a695170c8423c125f9896942aae44f712c087bd16c013cbca92f307bb908e3d4fbb83e547c6c8a9ae9635a43039fa43371d299fca2fb2554897ac3328be8
TLSA	_25._tcp.mail.example.org.	3 1 1 cc7be9958be15e9cab2f7b082ea38e263e0b81767e46384c54dd9b94ea85d0a2
TLSA	_25._tcp.mail.example.org.	3 1 2 1b4c1d5512c806e615665740e72c6a3f9f76462212a5ec84730d63c4e82ef84b7c5628414aa76ddd207c20f4dba0f2a96ec8b59fc04d973f443bec0ac7a15947
TLSA	_25._tcp.mail.example.org.	2 0 1 67add1166b020ae61b8f5fc96813c04c2aa589960796865572a3c7e737613dfd
TLSA	_25._tcp.mail.example.org.	2 0 2 96c5793b2b57d8df5891c94015720960e0da4c2cf8ce1fc5707a0b46e5db8ce3761fb5fdb430f619d1579f13e80fbdd973ef6a024129ed039aa193273158fcad
TLSA	_25._tcp.mail.example.org.	2 1 1 8d02536c887482bc34ff54e41d2ba659bf85b341a0a20afadb5813dcfbcf286d
TLSA	_25._tcp.mail.example.org.	2 1 2 0f644c9a1dcb8c04be6b385a60dbe4fdf7e2b81e335c9ad8c7cd0abe2ff9e7e5bbfbb68b38dd0216f17808f48bdf6af8c6347659c1f41a9858032c31f436d12c
```

If key rotation is not required for your setup, adding a single TLSA record starting with `3` (which signifies the certificate used matches the TLSA record) can be sufficient. However, for environments where keys are rotated frequently, multiple TLSA records provide flexibility and ensure continuous operation during key updates.

