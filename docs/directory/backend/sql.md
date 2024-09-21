---
sidebar_position: 3
---

# SQL Database

Stalwart Mail Server supports using popular SQL database systems such as mySQL, PostgreSQL, and SQLite as a directory server. This allows you to leverage an existing SQL database to handle tasks such as authentication, validating local accounts, and retrieving account-related information.

## Configuration

The following configuration settings are available for the SQL directory, which are specified under the `directory.<name>` section of the configuration file:

- `type`: Indicates the type of directory, which has to be set to `"sql"`.
- `store`: Specifies the name of the [SQL data store](/docs/storage/data) to use as a directory. Only SQL data stores are supported.

Any of the supported SQL data stores can be used as an SQL directory. Configuration details for each SQL data store can be found in the [data stores](/docs/storage/data) section.

### Lookup queries

In order to retrieve information about accounts, the following SQL lookup queries need to be defined in the underlying [data store](/docs/storage/data):

- `name`: This query is used to retrieve the `type`, `secret`, `description`, and `quota` of an account by its account `name`.
- `members`: Fetches the groups that a particular account is a member of. Groups names have to be returned as text.
- `recipients`: Retrieves the account name(s) associated with a specific primary addresses, alias or mailing lists address.
- `emails`: This query fetches email address(es) associated with a specific account. This query has to return an ordered list containing first the account's primary email address, followed by email aliases and excluding any mailing lists addresses associated with the account.
- `verify`: Verifies and retrieves the email addresses that contain a certain string. This query is used by the SMTP `VRFY` command.
- `expand`: Fetches the email addresses that are associated with a mailing list address. This query is used by the SMTP `EXPN` command.
- `domains`: Checks if an email domain exists. To be successful, this query has to return at least one row. This query is used by the SMTP server to validate local domains during the `RCPT TO` command.

Please refer to the relevant section for each data store for more information on how to define these queries.

### Column mappings

The `directory.<name>.columns` section maps the column names in the SQL database to the names used within Stalwart Mail Server:

- `class`: Maps to the 'type' column in the SQL database. Expected values are `individual` (or `person`) for user accounts and `group` for group accounts.
- `secret`: Maps to the 'secret' column in the SQL database. Passwords can be stored [hashed](//docs/directory/authentication/password) or in plain text (not recommended).
- `description`: Maps to the 'description' column in the SQL database.
- `quota`: Maps to the 'quota' column in the SQL database. Expects an integer value in bytes.

For example:

```toml
[directory."sql".columns]
name = "name"
description = "description"
secret = "secret"
email = "address"
quota = "quota"
class = "type"
```

## Sample directory schema

This section provides a sample SQL database schema that can be used as a directory server for Stalwart Mail Server. The schema is provided as a reference and is not intended to be used as-is. You will need to modify the schema to suit your needs.

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

### Creating administrator accounts

Administrator accounts are created in a similar way as regular user accounts, the only difference is that they are added to the `superusers` group:

```sql
INSERT INTO accounts (name, secret, description, type) VALUES ('admin', '<HASHED_SECRET>', 'Postmaster', 'individual') 
INSERT INTO emails (name, address, type) VALUES ('admin', 'postmaster@<DOMAIN>', 'primary')
INSERT INTO group_members (name, member_of) VALUES ('admin', 'superusers')
```

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

Alternatively, you could designate the `postmaster` account as the [catch-all address](/docs/smtp/inbound/rcpt#catch-all-addresses) for the `example.org` domain by adding `@example.org` as an email alias for the `postmaster` account:

```sql
INSERT INTO emails (name, address, type) VALUES ('postmaster', '@example.org', 'alias')
```

### Adding members to a mailing list

To add a user to a mailing list, run the following SQL statements:

```sql
INSERT INTO emails (name, address, type) VALUES ('<ACCOUNT_NAME>', '<MAILING_LIST_ADDRESS>', 'list')
```

Make sure to replace `<ACCOUNT_NAME>` with the name of the account and `<MAILING_LIST_ADDRESS>` with the mailing list address you want to add.

For example, you could add the accounts `john` and `jane` to the mailing list `sales@example.org` as follows:

```sql
INSERT INTO emails (name, address, type) VALUES ('john', 'sales@example.org', 'list')
INSERT INTO emails (name, address, type) VALUES ('jane', 'sales@example.org', 'list')
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
