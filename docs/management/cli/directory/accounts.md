---
sidebar_position: 2
---

# Accounts

The User Management tool provides a command-line interface for managing user accounts in Stalwart Mail Server. This tool facilitates various operations, including account creation, update, and deletion, as well as email and group management.

General usage:

```bash
stalwart-cli --url <URL> account <COMMAND>
```

- `--url <URL>`: Specifies the URL of Stalwart Mail Server.
- `<COMMAND>`: The specific account management command to execute.

:::tip Note

Domain names need to be [created](/docs/management/cli/directory/domains) first before e-mail addresses can be assigned to accounts.

:::


## Create an Account

Command:

```bash
stalwart-cli account create [OPTIONS] <NAME> <PASSWORD>
```

- `<NAME>`: Login name of the new account.
- `<PASSWORD>`: Password for the new account.

Options:

- `-d, --description <DESCRIPTION>`: Account description.
- `-q, --quota <QUOTA>`: Quota in bytes.
- `-i, --is-admin <IS_ADMIN>`: Whether the account is an administrator. Possible values: true, false.
- `-a, --addresses <ADDRESSES>`: E-mail addresses for the account.
- `-m, --member-of <MEMBER_OF>`: Groups the account is a member of.

Example:

```bash
stalwart-cli account create -d "John Doe" -q 1000000 -i false -a "john@example.com" -m "admins" john.doe password123
```

## Update an Account

Command:

```bash
stalwart-cli account update [OPTIONS] <NAME>
```

- `<NAME>`: Account login to be updated.

Options:

- `-n, --new-name <NEW_NAME>`: Rename account login.
- `-p, --password <PASSWORD>`: Update password.
- `-d, --description <DESCRIPTION>`: Update account description.
- `-q, --quota <QUOTA>`: Update quota in bytes.
- `-i, --is-admin <IS_ADMIN>`: Update admin status.
- `-a, --addresses <ADDRESSES>`: Update e-mail addresses.
- `-m, --member-of <MEMBER_OF>`: Update group memberships.

Example:

```bash
stalwart-cli account update -p newpassword -q 2000000 -i true john.doe
```

## Add E-mail aliases to an Account

Command:

```bash
stalwart-cli account add-email <NAME> <ADDRESSES>...
```

- `<NAME>`: Account login.
- `<ADDRESSES>`: E-mail aliases to add.

Example:

```bash
stalwart-cli account add-email john.doe john.doe@example.com doe.j@example.com
```

## Remove E-mail aliases from an Account

Command:

```bash
stalwart-cli account remove-email <NAME> <ADDRESSES>...
```

- `<NAME>`: Account login.
- `<ADDRESSES>`: E-mail aliases to remove.

Example:

```bash
stalwart-cli account remove-email john.doe john.doe@example.com
```

## Add an Account to Groups

Command:

```bash
stalwart-cli account add-to-group <NAME> <MEMBER_OF>...
```

- `<NAME>`: Account login.
- `<MEMBER_OF>`: Groups to add the account to.

Example:

```bash
stalwart-cli account add-to-group john.doe managers team-leads
```

## Remove an Account from Groups

Command:

```bash
stalwart-cli account remove-from-group <NAME> <MEMBER_OF>...
```

- `<NAME>`: Account login.
- `<MEMBER_OF>`: Groups to remove the account from.

Example:

```bash
stalwart-cli account remove-from-group john.doe team-leads
```

## Delete an Account

Command:

```bash
stalwart-cli account delete <NAME>
```

- `<NAME>`: Account name to delete.

Example:

```bash
stalwart-cli account delete john.doe
```

## Display Account details

Command:

```bash
stalwart-cli account display <NAME>
```

- `<NAME>`: Account name to display.

Example:

```bash
stalwart-cli account display john.doe
```

## List All User Accounts

Command:

```bash
stalwart-cli account list [FROM] [LIMIT]
```

- `[FROM]`: Starting point for listing accounts.
- `[LIMIT]`: Maximum number of accounts to list.

Example:

```bash
stalwart-cli account list 0 10
```

