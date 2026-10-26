---
sidebar_position: 3
title: "SQL Database"
description: "Use tables in a PostgreSQL, MySQL, MariaDB or SQLite database as the directory for Stalwart accounts: queries, column mapping, password verification and a sample schema."
---

Some systems already keep their mail users in a relational database, for example a hosting control panel or an application that manages mailboxes. An SQL directory lets Stalwart take its accounts from those tables, so that the database remains the place where users are added and removed. PostgreSQL, MySQL, MariaDB and SQLite are supported.

The server does not need a particular schema. It runs configurable queries instead, and each query answers one question:

- Which account a user signs in as
- Whether a recipient address exists
- Which groups an account belongs to
- Which aliases an account has

To connect a database, create a [Directory](/docs/ref/object/directory) object of type `Sql` (in the WebUI under <!-- breadcrumb:Directory --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" /><path d="M14 13.12c0 2.38 0 6.38-1 8.88" /><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" /><path d="M2 12a10 10 0 0 1 18-6" /><path d="M2 16h.01" /><path d="M21.8 16c.2-2 .131-5.354 0-6" /><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" /><path d="M8.65 22c.21-.66.45-1.32.57-2" /><path d="M9 6.8a6 6 0 0 1 9 5.2v2" /></svg> Authentication › Directories<!-- /breadcrumb:Directory -->). Then set its id as `directoryId` on the Authentication singleton or, in the Enterprise edition, on the domains the directory serves.

## Account provisioning

The server does not copy accounts from the database in advance. It creates a local account the first time it needs one. That happens in two situations: when the user signs in, and when a message arrives for an address that [`queryRecipient`](/docs/ref/object/directory#queryrecipient) returns.

Every later lookup updates the local account from the database. The description, aliases and group memberships are refreshed, but aliases are only added, never removed.

SCIM changes this behaviour. In a domain opened to [SCIM provisioning](/docs/auth/scim/provisioning#authority-when-both-are-configured), the directory neither creates nor updates accounts, and a sign-in by an account that SCIM has not provisioned fails.

Nothing is ever removed automatically. A row deleted from the database stops matching the queries, so its address no longer receives mail. The local account and its mailbox remain, however, and keep counting against the licensed account limit until an administrator deletes them. For the identity provider to delete and suspend accounts explicitly, enable [SCIM provisioning](/docs/auth/scim/) for the domain. [Provisioning models](/docs/auth/scim/provisioning) describes how the two interact.

## Database connection

The first decision is which database holds the accounts, which [`store`](/docs/ref/object/directory#store) selects. `Default` uses the server's own data store, provided that it is an SQL database. `PostgreSql`, `MySql` and `Sqlite` connect to a separate database with their own connection settings. Those settings, including the connection timeouts and the pool size, are the same as for the corresponding data store backends. They are described on the [storage backend pages](/docs/storage/backends/) and in the [Directory reference](/docs/ref/object/directory).

The queries run with the privileges of the configured database user. That user needs only read access to the tables involved. Every query is logged at the `trace` level, which helps when a query does not return what was expected.

## Queries

The directory runs up to four queries. Each one binds exactly one value, which the server supplies:

| Query | Purpose | Bound value |
|---|---|---|
| [`queryLogin`](/docs/ref/object/directory#querylogin) | Find the account a user signs in as | The name the user signs in with |
| [`queryRecipient`](/docs/ref/object/directory#queryrecipient) | Decide whether a recipient address exists | The recipient address |
| [`queryMemberOf`](/docs/ref/object/directory#querymemberof) | List the groups of an account (optional) | The login name, or the account's address for recipient lookups |
| [`queryEmailAliases`](/docs/ref/object/directory#queryemailaliases) | List the aliases of an account (optional) | The login name, or the account's address for recipient lookups |

The placeholder for the bound value depends on the database. PostgreSQL and SQLite refer to it as `$1`, which may appear several times in one query. MySQL and MariaDB use `?`, and each `?` consumes one value. A query for these databases must therefore contain exactly one `?`. The default queries are written with `$1`, so they do not work on MySQL or MariaDB as they are. The [sample schema](#sample-schema) below gives the queries for each database.

The queries return different shapes. `queryLogin` and `queryRecipient` return one row, with the columns named by the column mappings. When either returns several rows, only the first is used. `queryMemberOf` and `queryEmailAliases` return one address per row: a group address for the first, an alias for the second. Values that are not valid email addresses are ignored, so group names and aliases must be stored as full addresses.

A recipient query that matches only the primary address column accepts no mail for aliases. The [default `queryRecipient`](/docs/ref/object/directory#queryrecipient) is such a query. To deliver mail for alias addresses, the query must also match them, as the sample below does.

## Column mapping

The rows returned by `queryLogin` and `queryRecipient` must say which column holds which piece of information. The column mappings name those columns, and their defaults match the [sample schema](#sample-schema):

| Field | Column contents | Default |
|---|---|---|
| [`columnEmail`](/docs/ref/object/directory#columnemail) | The primary address of the account | <!-- default:Directory.columnEmail -->`name`<!-- /default --> |
| [`columnSecret`](/docs/ref/object/directory#columnsecret) | The password hash | <!-- default:Directory.columnSecret -->`secret`<!-- /default --> |
| [`columnDescription`](/docs/ref/object/directory#columndescription) | The display name | <!-- default:Directory.columnDescription -->`description`<!-- /default --> |
| [`columnClass`](/docs/ref/object/directory#columnclass) | The account type | <!-- default:Directory.columnClass -->`type`<!-- /default --> |

The value of `columnClass` distinguishes only groups. A row whose value is `group`, without regard to case, describes a group account. Any other value describes a user account.

The `columnEmail` value must be a full address. When it is missing or not an address, the login name serves as the address at sign-in, but recipient lookups then find no aliases or groups.

Quotas, roles and permissions are not read from the database. They are set on the server's account ([Quotas](/docs/auth/authorization/quotas)).

## Password verification

The database does not authenticate the user; the server does. It runs `queryLogin` with the name the user signs in with, takes the first row and verifies the supplied password against the value of `columnSecret` itself. The column must therefore hold a hash in one of the [supported formats](/docs/auth/authentication/password#supported-hash-formats), such as the SHA-512 crypt hash produced by `openssl passwd -6`. After a successful check, `queryMemberOf` and `queryEmailAliases` run for the account.

An empty password is always refused. Other sign-in failures are recorded as `auth.failed` events, and the reason in the event identifies the cause:

- `SQL login query did not return an account` means that `queryLogin` returned no row.
- `Account does not have a secret` means that the row has an empty secret.
- `Invalid credentials` means that the password does not match the hash.

The directory verifies only passwords. Accounts of an SQL directory can still use [app passwords](/docs/auth/authentication/app-password), [API keys](/docs/auth/authentication/api-key) and OAuth tokens of the built-in [authorization server](/docs/auth/oauth/), because the server verifies all of these itself. They cannot use [two-factor authentication](/docs/auth/authentication/2fa), however. Only the password is checked, and a TOTP URL stored on such an account is ignored.

## Sample schema

The following tables hold accounts, group memberships and aliases. Account and group names are stored as full addresses, as the queries require:

```sql
CREATE TABLE accounts (name TEXT PRIMARY KEY, secret TEXT, description TEXT, type TEXT NOT NULL, active BOOLEAN DEFAULT true);
CREATE TABLE group_members (name TEXT NOT NULL, member_of TEXT NOT NULL, PRIMARY KEY (name, member_of));
CREATE TABLE emails (name TEXT NOT NULL, address TEXT NOT NULL, PRIMARY KEY (name, address));
```

On MySQL and MariaDB, use `VARCHAR(255)` for the name and address columns and `BOOLEAN DEFAULT 1` for `active`.

The following rows create a user `john@example.org` with the alias `john.doe@example.org`, and a group `sales@example.org` of which John is a member:

```sql
INSERT INTO accounts (name, secret, description, type) VALUES ('john@example.org', '<hash>', 'John Doe', 'individual');
INSERT INTO accounts (name, description, type) VALUES ('sales@example.org', 'Sales', 'group');
INSERT INTO group_members (name, member_of) VALUES ('john@example.org', 'sales@example.org');
INSERT INTO emails (name, address) VALUES ('john@example.org', 'john.doe@example.org');
```

For PostgreSQL and SQLite, the directory uses these queries with the default column mapping:

```json
{
  "@type": "Sql",
  "description": "Accounts database",
  "store": {"@type": "Default"},
  "queryLogin": "SELECT name, secret, description, type FROM accounts WHERE name = $1 AND active = true",
  "queryRecipient": "SELECT a.name, a.description, a.type FROM accounts a WHERE a.active = true AND (a.name = $1 OR a.name IN (SELECT e.name FROM emails e WHERE e.address = $1))",
  "queryMemberOf": "SELECT member_of FROM group_members WHERE name = $1",
  "queryEmailAliases": "SELECT address FROM emails WHERE name = $1"
}
```

The login query is the default `queryLogin`. The recipient query extends the default `queryRecipient` so that it also matches aliases. Both select only rows whose `active` column is true. An account whose row is set to inactive can therefore no longer sign in, and its sign-in attempts fail with `SQL login query did not return an account`.

MySQL and MariaDB need a different recipient query. It uses the address twice but may bind it only once, so it selects the bound value into a derived table and refers to it from there:

```json
{
  "queryLogin": "SELECT name, secret, description, type FROM accounts WHERE name = ? AND active = true",
  "queryRecipient": "SELECT a.name, a.description, a.type FROM accounts a JOIN (SELECT ? AS address) p WHERE a.active = true AND (a.name = p.address OR a.name IN (SELECT e.name FROM emails e WHERE e.address = p.address))",
  "queryMemberOf": "SELECT member_of FROM group_members WHERE name = ?",
  "queryEmailAliases": "SELECT address FROM emails WHERE name = ?"
}
```

With these queries, John signs in as `john@example.org`, and mail to both of his addresses is delivered to his mailbox. Mail to `sales@example.org` is delivered to the group's mailbox, which John can open as a member. A catch-all address for a domain is not part of the database: it is configured on the [domain](/docs/domains/addresses).
