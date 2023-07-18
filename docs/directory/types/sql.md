---
sidebar_position: 1
---

# SQL Database

Stalwart Mail Server supports using popular SQL database systems such as mySQL, PostgreSQL, and SQLite as a directory server. This allows you to leverage an existing SQL database to handle tasks such as authentication, validating local accounts, and retrieving account-related information.

## Connection string

The connection string for the SQL database is specified under the `directory.<name>.address` key in the configuration file. This string allows allows Stalwart Mail Server to connect to your SQL database and consists of a combination of parameters including the server location, database name, and login credentials. The exact syntax can vary depending on the type of SQL database you're connecting to, but in general it looks like this:

```
<protocol>://<username>:<password>@<hostname>:<port>/<database_name>?<parameters>
```

- `<protocol>`: This is the name of the SQL database system, such as `postgresql`, `mysql`, `sqlite`, etc.
- `<username>:<password>`: These are the username and password used to authenticate with the SQL server.
- `<hostname>:<port>`: This is the network location of your SQL server. The hostname could be an IP address or a domain name, and the port is the network port that the SQL server is listening on.
- `<database_name>`: This is the name of the database you want to connect to.
- `<parameters>`: These are optional parameters for the connection. They are usually key-value pairs separated by `&`. The exact parameters available will depend on the SQL database system you're using.

For example, to connect to a PostgreSQL database named `mydatabase` on `localhost` port `5432` with the username `myuser` and password `mypassword` and using the `sslmode=disable` parameter to disable SSL for the connection:

```toml
[directory."postgres"]
type = "sql"
address = "postgresql://myuser:mypassword@localhost:5432/mydatabase?sslmode=disable"
```

Or, to use an SQLite database named `accounts.sqlite3` under the `/opt/stalwart-mail/data` directory:

```toml
[directory."sqlite"]
type = "sql"
address = "sqlite:///opt/stalwart-mail/data/accounts.sqlite3?mode=rwc"
```

## Lookup queries

The `directory.<id>.query` section contains the SQL queries used to interact with the database. The following SQL queries need to be defined in order to retrieve information about accounts:

- `name`: This query is used to retrieve the `type`, `secret`, `description`, and `quota` of an account by its account `name`.
- `members`: Fetches the groups that a particular account is a member of. Groups names have to be returned as text.
- `recipients`: Retrieves the account name(s) associated with a specific primary addresses, alias or mailing lists address.
- `emails`: This query fetches email address(es) associated with a specific account. This query has to return an ordered list containing first the account's primary email address, followed by email aliases and excluding any mailing lists addresses associated with the account.
- `verify`: Verifies and retrieves the email addresses that contain a certain string. This query is used by the SMTP `VRFY` command.
- `expand`: Fetches the email addresses that are associated with a mailing list address. This query is used by the SMTP `EXPN` command.
- `domains`: Checks if an email domain exists. To be successful, this query has to return at least one row. This query is used by the SMTP server to validate local domains during the `RCPT TO` command.

The exact nature and format of these queries will depend on your SQL database schema. For example, 

```toml
[directory."sql".query]
name = "SELECT name, type, secret, description, quota FROM accounts WHERE name = ? AND active = true"
members = "SELECT member_of FROM group_members WHERE name = ?"
recipients = "SELECT name FROM emails WHERE address = ?"
emails = "SELECT address FROM emails WHERE name = ? AND type != 'list' ORDER BY type DESC, address ASC"
verify = "SELECT address FROM emails WHERE address LIKE '%' || ? || '%' AND type = 'primary' ORDER BY address LIMIT 5"
expand = "SELECT p.address FROM emails AS p JOIN emails AS l ON p.name = l.name WHERE p.type = 'primary' AND l.address = ? AND l.type = 'list' ORDER BY p.address LIMIT 50"
domains = "SELECT 1 FROM emails WHERE address LIKE '%@' || ? LIMIT 1"
```

The `?` character in the queries denotes a parameter that will be filled in at runtime.

## Column mappings

The `directory.<name>.columns` section maps the column names in the SQL database to the names used within Stalwart Mail Server:

- `name`: Maps to the 'name' column in the SQL database. This is the login name for the account.
- `description`: Maps to the 'description' column in the SQL database.
- `secret`: Maps to the 'secret' column in the SQL database. Passwords can be stored [hashed](/docs/directory/users#passwords) or in plain text (not recommended).
- `email`: Maps to the 'address' column in the SQL database.
- `quota`: Maps to the 'quota' column in the SQL database. Expects an integer value in bytes.
- `type`: Maps to the 'type' column in the SQL database. Expected values are `individual` (or `person`) for user accounts and `group` for group accounts.

For example:

```toml
[directory."sql".columns]
name = "name"
description = "description"
secret = "secret"
email = "address"
quota = "quota"
type = "type"
```

## Custom lookup queries

Custom lookup queries can be defined under the `directory.<name>.lookup.<lookup_name>` section. These custom queries are used mainly in the SMTP server from rules or Sieve filters.

For example:

```toml
[directory."sql".lookup]
blocked_ip = "SELECT 1 FROM blocked_ip WHERE id=? LIMIT 1"
greylist = "SELECT 1 FROM greylisted_senders WHERE addr=? LIMIT 1"
```

## Sample directory schema

In case you need to create a new SQL database to use as a directory in Stalwart Mail Server, you may use the following SQL statements to create a basic directory:

```sql
CREATE TABLE accounts (name TEXT PRIMARY KEY, secret TEXT, description TEXT, type TEXT NOT NULL, quota INTEGER DEFAULT 0, active BOOLEAN DEFAULT 1)
CREATE TABLE group_members (name TEXT NOT NULL, member_of TEXT NOT NULL, PRIMARY KEY (name, member_of))
CREATE TABLE emails (name TEXT NOT NULL, address TEXT NOT NULL, type TEXT, PRIMARY KEY (name, address))
```

To create the administrator account, run the following SQL statements:

```sql
INSERT INTO accounts (name, secret, description, type) VALUES ('admin', '<HASHED_SECRET>', 'Postmaster', 'individual') 
INSERT INTO emails (name, address, type) VALUES ('admin', 'postmaster@<DOMAIN>', 'primary')
INSERT INTO group_members (name, member_of) VALUES ('admin', 'superusers')
```

To create a user account with an associated email address, run the following SQL statements:

```sql
INSERT INTO accounts (name, secret, description, type) VALUES ('<ACCOUNT_NAME>', '<HASHED_SECRET>', '<ACCOUNT_FULL_NAME>', 'individual')
INSERT INTO emails (name, address, type) VALUES ('<ACCOUNT_NAME>', '<PRIMARY_EMAIL_ADDRESS>', 'primary')
```

To add an email alias to an account, run the following SQL statements:

```sql
INSERT INTO emails (name, address, type) VALUES ('<ACCOUNT_NAME>', '<EMAIL_ALIAS>', 'alias')
```

To add a user to a mailing list, run the following SQL statements:

```sql
INSERT INTO emails (name, address, type) VALUES ('<ACCOUNT_NAME>', '<MAILING_LIST_ADDRESS>', 'list')
```

To create a group account, run the following SQL statements:

```sql
INSERT INTO accounts (name, description, type) VALUES ('<GROUP_NAME>', '<GROUP_DESCRIPTION>', 'group')
```

To add a user to a group, run the following SQL statements:

```sql
INSERT INTO group_members (name, member_of) VALUES ('<ACCOUNT_NAME>', '<GROUP_NAME>')
```

