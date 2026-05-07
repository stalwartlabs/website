---
sidebar_position: 3
title: "SQL Database"
---

Stalwart can authenticate users and look up account metadata against an SQL database such as PostgreSQL, MySQL, or SQLite. This makes it possible to reuse an existing SQL-backed user directory, or to manage accounts in a relational schema that other applications already share.

An SQL directory is configured through the SQL variant of the [Directory](/docs/ref/object/directory) object (found in the WebUI under <!-- breadcrumb:Directory --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" /><path d="M14 13.12c0 2.38 0 6.38-1 8.88" /><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" /><path d="M2 12a10 10 0 0 1 18-6" /><path d="M2 16h.01" /><path d="M21.8 16c.2-2 .131-5.354 0-6" /><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" /><path d="M8.65 22c.21-.66.45-1.32.57-2" /><path d="M9 6.8a6 6 0 0 1 9 5.2v2" /></svg> Authentication › Directories<!-- /breadcrumb:Directory -->).

## Configuration

The main fields on the SQL variant of the Directory object are:

- [`description`](/docs/ref/object/directory#description): a human-readable description of this directory.
- [`store`](/docs/ref/object/directory#store): the backend where the account tables live. The `SqlAuthStore` variant selects between `Default` (the server's data store, when that is itself SQL), `PostgreSql`, `MySql`, and `Sqlite`. Each backend variant carries its own connection parameters (host, port, database, username, and secret) detailed on the [Directory reference page](/docs/ref/object/directory).

### Directory queries

The SQL variant runs the following queries against the configured store; all of them use positional parameters (`$1`, `$2`, ...) and sensible defaults that can be overridden per deployment:

- [`queryLogin`](/docs/ref/object/directory#querylogin): resolves account details by login value. Default `"SELECT name, secret, description, type FROM accounts WHERE name = $1"`.
- [`queryRecipient`](/docs/ref/object/directory#queryrecipient): resolves account details by recipient email address or alias. Default `"SELECT name, secret, description, type FROM accounts WHERE name = $1 AND active = true"`.
- [`queryMemberOf`](/docs/ref/object/directory#querymemberof): returns the groups an account is a member of. Default `"SELECT member_of FROM group_members WHERE name = $1"`.
- [`queryEmailAliases`](/docs/ref/object/directory#queryemailaliases): returns the email aliases of an account. Default `"SELECT address FROM emails WHERE name = $1"`.

### Column mappings

Column names in the database are mapped to account fields through the following fields on the SQL variant:

- [`columnEmail`](/docs/ref/object/directory#columnemail): column holding the account login / primary address. Default `"name"`.
- [`columnSecret`](/docs/ref/object/directory#columnsecret): column holding the password hash. Default `"secret"`. Hashes must be in a [supported format](/docs/auth/authentication/password); plain text is possible but not recommended.
- [`columnClass`](/docs/ref/object/directory#columnclass): column holding the account kind (`individual`, `person`, or `group`). Default `"type"`.
- [`columnDescription`](/docs/ref/object/directory#columndescription): column holding the account's full name or description. Default `"description"`.

There is no column mapping for a per-account disk quota: quotas are held on the [Account](/docs/ref/object/account) and [Tenant](/docs/ref/object/tenant) objects rather than read from the SQL directory (see [Quotas](/docs/auth/authorization/quotas)).

For example:

```json
{
  "@type": "Sql",
  "description": "External SQL directory",
  "store": {
    "@type": "Default"
  },
  "columnEmail": "name",
  "columnSecret": "secret",
  "columnDescription": "description",
  "columnClass": "type"
}
```

## Sample directory schema

The following schema is a reference example for an SQL-backed directory. It may need to be adapted for specific deployments; it is not intended to be used as-is.

### Table schema

#### SQLite

```sql
CREATE TABLE accounts (name TEXT PRIMARY KEY, secret TEXT, description TEXT, type TEXT NOT NULL, active BOOLEAN DEFAULT 1)
CREATE TABLE group_members (name TEXT NOT NULL, member_of TEXT NOT NULL, PRIMARY KEY (name, member_of))
CREATE TABLE emails (name TEXT NOT NULL, address TEXT NOT NULL, type TEXT, PRIMARY KEY (name, address))
```

#### PostgreSQL

```sql
CREATE TABLE accounts (name TEXT PRIMARY KEY, secret TEXT, description TEXT, type TEXT NOT NULL, active BOOLEAN DEFAULT true);
CREATE TABLE group_members (name TEXT NOT NULL, member_of TEXT NOT NULL, PRIMARY KEY (name, member_of));
CREATE TABLE emails (name TEXT NOT NULL, address TEXT NOT NULL, type TEXT, PRIMARY KEY (name, address));
```

#### MySQL

```sql
CREATE TABLE accounts (name VARCHAR(32) PRIMARY KEY, secret VARCHAR(1024), description VARCHAR(1024), type VARCHAR(32) NOT NULL, active BOOLEAN DEFAULT 1);
CREATE TABLE group_members (name VARCHAR(32) NOT NULL, member_of VARCHAR(32) NOT NULL, PRIMARY KEY (name, member_of));
CREATE TABLE emails (name VARCHAR(32) NOT NULL, address VARCHAR(128) NOT NULL, type VARCHAR(32), PRIMARY KEY (name, address));
```

### Creating user accounts

Before inserting an account, hash the password. One way is via `openssl`, for example to produce a SHA-512 crypt hash:

```bash
$ openssl passwd -6
```

Once the hashed secret is available, insert the account and its primary address:

```sql
INSERT INTO accounts (name, secret, description, type) VALUES ('<ACCOUNT_NAME>', '<HASHED_SECRET>', '<ACCOUNT_FULL_NAME>', 'individual')
INSERT INTO emails (name, address, type) VALUES ('<ACCOUNT_NAME>', '<PRIMARY_EMAIL_ADDRESS>', 'primary')
```

Replace:

- `<ACCOUNT_NAME>` with the account login name, for example `john`.
- `<HASHED_SECRET>` with the hashed password produced above.
- `<ACCOUNT_FULL_NAME>` with the account's full name, for example `John Doe`.
- `<PRIMARY_EMAIL_ADDRESS>` with the primary address, for example `john@example.org`.

### Adding an email alias

To add an alias to an existing account:

```sql
INSERT INTO emails (name, address, type) VALUES ('<ACCOUNT_NAME>', '<EMAIL_ALIAS>', 'alias')
```

For example, to add the aliases `john.doe@example.org` and `jdoe@example.org` to the account `john`:

```sql
INSERT INTO emails (name, address, type) VALUES ('john', 'john.doe@example.org', 'alias')
INSERT INTO emails (name, address, type) VALUES ('john', 'jdoe@example.org', 'alias')
```

Alternatively, the `postmaster` account can be configured as the [catch-all recipient](/docs/mta/inbound/rcpt#catch-all-addresses) for `example.org` by adding `@example.org` as an alias:

```sql
INSERT INTO emails (name, address, type) VALUES ('postmaster', '@example.org', 'alias')
```

### Creating group accounts

```sql
INSERT INTO accounts (name, description, type) VALUES ('<GROUP_NAME>', '<GROUP_DESCRIPTION>', 'group')
```

Replace `<GROUP_NAME>` with the group name and `<GROUP_DESCRIPTION>` with a human-readable description.

### Adding members to a group

```sql
INSERT INTO group_members (name, member_of) VALUES ('<ACCOUNT_NAME>', '<GROUP_NAME>')
```
