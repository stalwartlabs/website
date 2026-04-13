---
sidebar_position: 3
---

# SQL Database

Stalwart supports using popular SQL database systems such as mySQL, PostgreSQL, and SQLite as a directory server. This allows you to leverage an existing SQL database to handle tasks such as authentication, validating local accounts, and retrieving account-related information.

## Configuration

The following configuration settings are available for the SQL directory, which are specified under the `directory.<name>` section of the configuration file:

- `type`: Indicates the type of directory, which has to be set to `"sql"`.
- `store`: Specifies the name of the [SQL data store](/docs/storage/data) to use as a directory. Only SQL data stores are supported.

Any of the supported SQL data stores can be used as an SQL directory. Configuration details for each SQL data store can be found in the [data stores](/docs/storage/data) section.

### Directory queries

In order to retrieve information about accounts, the following SQL directory queries need to be defined in the underlying [data store](/docs/storage/data):

- `name`: Retrieves the `type`, `description`, and `quota` fields of an account by its account `name`. Optionally this query can return the account's `email` and `secret` fields as well.
- `members`: Fetches the groups that a particular account is a member of. Groups names have to be returned as text.
- `recipients`: Retrieves the account name(s) associated with a specific primary addresses or alias address.
- `emails`: Fetches email address(es) associated with a specific account. This query has to return an ordered list containing first the account's primary email address, followed by email aliases and excluding any mailing lists addresses associated with the account. This query is optional, a single email address can be returned by the `name` query.
- `secrets`: Retrieves the account passwords associated with a specific account. This query is optional, a single password can be returned by the `name` query.

Please refer to the relevant section for each data store for more information on how to define these queries.

### Column mappings

The `directory.<name>.columns` section maps the column names in the SQL database to the names used within Stalwart:

- `class`: Maps to the 'type' column in the SQL database. Expected values are `individual` (or `person`) for user accounts and `group` for group accounts.
- `secret`: Maps to the 'secret' column in the SQL database. Passwords can be stored [hashed](//docs/auth/authentication/password) or in plain text (not recommended).
- `description`: Maps to the 'description' column in the SQL database.
- `quota`: Maps to the 'quota' column in the SQL database. Expects an integer value in bytes.
- `email`: Maps to the 'email' column in the SQL database. 

For example:

```toml
[directory."sql".columns]
name = "name"
description = "description"
secret = "secret"
email = "address"
quota = "quota"
class = "type"
email = "email"
```

## Sample directory schema

This section provides a sample SQL database schema that can be used as a directory server for Stalwart. The schema is provided as a reference and is not intended to be used as-is. You will need to modify the schema to suit your needs.

### Table schema

The following SQL statements can be used to create the tables for the sample schema:

#### SQLite

```sql
CREATE TABLE accounts (name TEXT PRIMARY KEY, secret TEXT, description TEXT, type TEXT NOT NULL, quota INTEGER DEFAULT 0, active BOOLEAN DEFAULT 1)
CREATE TABLE group_members (name TEXT NOT NULL, member_of TEXT NOT NULL, PRIMARY KEY (name, member_of))
CREATE TABLE emails (name TEXT NOT NULL, address TEXT NOT NULL, type TEXT, PRIMARY KEY (name, address))
```

#### PostgreSQL

```sql
CREATE TABLE accounts (name TEXT PRIMARY KEY, secret TEXT, description TEXT, type TEXT NOT NULL, quota INTEGER DEFAULT 0, active BOOLEAN DEFAULT true);
CREATE TABLE group_members (name TEXT NOT NULL, member_of TEXT NOT NULL, PRIMARY KEY (name, member_of));
CREATE TABLE emails (name TEXT NOT NULL, address TEXT NOT NULL, type TEXT, PRIMARY KEY (name, address));
```

#### MySQL

```sql
CREATE TABLE accounts (name VARCHAR(32) PRIMARY KEY, secret VARCHAR(1024), description VARCHAR(1024), type VARCHAR(32) NOT NULL, quota INTEGER DEFAULT 0, active BOOLEAN DEFAULT 1);
CREATE TABLE group_members (name VARCHAR(32) NOT NULL, member_of VARCHAR(32) NOT NULL, PRIMARY KEY (name, member_of));
CREATE TABLE emails (name VARCHAR(32) NOT NULL, address VARCHAR(128) NOT NULL, type VARCHAR(32), PRIMARY KEY (name, address));
```

### Creating user accounts

Before creating an account, you will first need to hash the account's password. One way to do this is using the `openssl` command. For example, to hash a password using the `SHA512` algorithm:

```bash
$ openssl passwd -6
```

Once you have the hashed secret, you may create a user account with an associated email address by running the following SQL statements:

```sql
INSERT INTO accounts (name, secret, description, type) VALUES ('<ACCOUNT_NAME>', '<HASHED_SECRET>', '<ACCOUNT_FULL_NAME>', 'individual')
INSERT INTO emails (name, address, type) VALUES ('<ACCOUNT_NAME>', '<PRIMARY_EMAIL_ADDRESS>', 'primary')
```

Make sure to replace:
 - `<ACCOUNT_NAME>` with the name of the account, for example `john`.
 - `<HASHED_SECRET>` with the hashed password you generated above.
 - `<ACCOUNT_FULL_NAME>` with the full name of the account, for example `John Doe`.
 - `<PRIMARY_EMAIL_ADDRESS>` with the primary email address for the account, for example `john@example.org`.

### Adding an email alias

To add an email alias to an account, run the following SQL statements:

```sql
INSERT INTO emails (name, address, type) VALUES ('<ACCOUNT_NAME>', '<EMAIL_ALIAS>', 'alias')
```

Make sure to replace `<ACCOUNT_NAME>` with the name of the account and `<EMAIL_ALIAS>` with the email alias you want to add. 

For example, to add the aliases `john.doe@example.org` and `jdoe@example.org` to the account `john`:

```sql
INSERT INTO emails (name, address, type) VALUES ('john', 'john.doe@example.org', 'alias')
INSERT INTO emails (name, address, type) VALUES ('john', 'jdoe@example.org', 'alias')
```

Alternatively, you could designate the `postmaster` account as the [catch-all address](/docs/mta/inbound/rcpt#catch-all-addresses) for the `example.org` domain by adding `@example.org` as an email alias for the `postmaster` account:

```sql
INSERT INTO emails (name, address, type) VALUES ('postmaster', '@example.org', 'alias')
```

### Creating group accounts

To create a group account, run the following SQL statements:

```sql
INSERT INTO accounts (name, description, type) VALUES ('<GROUP_NAME>', '<GROUP_DESCRIPTION>', 'group')
```

Make sure to replace `<GROUP_NAME>` with the name of the group and `<GROUP_DESCRIPTION>` with the description of the group.

### Adding members to a group

To add a user to a group, run the following SQL statements:

```sql
INSERT INTO group_members (name, member_of) VALUES ('<ACCOUNT_NAME>', '<GROUP_NAME>')
```

Make sure to replace `<ACCOUNT_NAME>` with the name of the account and `<GROUP_NAME>` with the name of the group.
