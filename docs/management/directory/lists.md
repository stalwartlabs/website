---
sidebar_position: 4
---

# Mailing Lists

The Mailing List Management tool provides command-line functionality for managing mailing lists within Stalwart Mail Server. This tool allows for the creation, updating, and viewing of mailing lists, as well as managing list memberships.

General Usage:

```bash
stalwart-cli --url <URL> list <COMMAND>
```

- `--url <URL>`: The URL of the Stalwart Mail Server.
- `<COMMAND>`: The specific mailing list management command to execute.

## Create a Mailing List

Command:

```bash
stalwart-cli list create [OPTIONS] <NAME> <EMAIL>
```

- `<NAME>`: The name of the mailing list.
- `<EMAIL>`: The email address for the mailing list.

Options:

- `-d, --description <DESCRIPTION>`: Description of the mailing list.
- `-m, --members <MEMBERS>`: Initial members of the mailing list.

Example:

```bash
stalwart-cli list create -d "Project Updates" -m "john@example.com, jane@example.com" project.updates updates@project.com
```

## Update a Mailing List

Command:

```bash
stalwart-cli list update [OPTIONS] <NAME> [NEW_NAME] [EMAIL]
```

- `<NAME>`: The name of the mailing list to update.
- `[NEW_NAME]`: Optional new name for the mailing list.
- `[EMAIL]`: Optional new email address for the mailing list.

Options:

- `-d, --description <DESCRIPTION>`: Update the description of the mailing list.
- `-m, --members <MEMBERS>`: Update the members of the mailing list.

Example:

```bash
stalwart-cli list update -d "Updated Project News" project.updates new.project.updates news@newproject.com
```

## Add Members to a Mailing List

Command:

```bash
stalwart-cli list add-members <NAME> <MEMBERS>...
```

- `<NAME>`: The name of the mailing list.
- `<MEMBERS>`: The members to add to the mailing list.

Example:

```bash
stalwart-cli list add-members project.updates alice@example.com bob@example.com
```

## Remove Members from a Mailing List

Command:

```bash
stalwart-cli list remove-members <NAME> <MEMBERS>...
```

- `<NAME>`: The name of the mailing list.
- `<MEMBERS>`: The members to remove from the mailing list.

Example:

```bash
stalwart-cli list remove-members project.updates alice@example.com
```

## Display a Mailing List

Command:

```bash
stalwart-cli list display <NAME>
```

- `<NAME>`: The name of the mailing list to display.

Example:

```bash
stalwart-cli list display project.updates
```

## List Mailing Lists

Command:

```bash
stalwart-cli list list [FROM] [LIMIT]
```

- `[FROM]`: The starting point for listing mailing lists.
- `[LIMIT]`: The maximum number of mailing lists to list.

Example:

```bash
stalwart-cli list list 0 10
```

