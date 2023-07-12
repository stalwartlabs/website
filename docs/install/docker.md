---
sidebar_position: 3
---

# Docker


Help me write an introduction in markdown format to Stalwart Mail Server, a mail server written in Rust that includes JMAP, IMAP4rev2 and SMTP servers.  It should have the following sections but feel free to add more:

- Introduction: Explain what Stalwart Mail Server is, that is has support for latest internet messaging standards, it is fast, secure and written in Rust.
- Choosing a Version: It helps users to choose which version to install. Explain that there are 4 versions available: (1) An All-in-one mail server that is a single binary and includes JMAP, IMAP and SMTP server. (2) a JMAP server only, (3) an IMAP server only and (4) an SMTP server only.
- Choosing a database backend: Unless the SMTP server only version is installed, a database backend needs to be chosen. This database is where indexes and metadata are stored, but no email messages are stored here (more about that later). Users can choose to use a SQLite or a FoundationDB backend. The SQLite backend is for small to medium sized installations and, although it is designed for single node setups, data can be made redundant using Litestream or a similar solution. The FoundationDB backend is aimed at distributed multi-server installations and can support millions of users.
- Choosing a blob storage backend: Unless the SMTP server only version is installed, a blob storage backend needs to be selected. The blob storage is where e-mail messages and other blobs such as Sieve scripts are stored. Users can choose between local storage using Maildir or store blobs on an S3-compatible server such as Amazon S3, Google Cloud or MinIO.
- Choosing a directory server: Stalwart requires a database or directory server where user accounts and passwords for the local domains are stored. The directory server is used by the Stalwart for authentication, validating local accounts and obtaining other information such as account names or disk quotas. Stalwart support SQL databases (mySQL, PostgreSQL or SQLite) or LDAP.
