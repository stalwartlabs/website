---
sidebar_position: 3
---

# Groups

The Group Management tool offers a range of commands to manage groups within the Mail Server. This tool facilitates the creation, updating, and maintenance of groups, along with adding or removing members.

General Usage:

```bash
stalwart-cli --url <URL> group <COMMAND>
```

- `--url <URL>`: The URL of the Stalwart Mail Server.
- `<COMMAND>`: The specific group management command to execute.

## Create a Group

Command:

```bash
stalwart-cli group create [OPTIONS] <NAME> [EMAIL]
```

- `<NAME>`: The name of the group.
- `[EMAIL]`: Optional group email address.

Options:

- `-d, --description <DESCRIPTION>`: Group description.
- `-m, --members <MEMBERS>`: Initial group members.

Example:

```bash
stalwart-cli group create -d "Engineering Team" -m john@example.com -m jane@example.com engineering engineering@example.com
```

## Update a Group

Command:

```bash
stalwart-cli group update [OPTIONS] <NAME> [NEW_NAME] [EMAIL]
```

- `<NAME>`: The name of the group to update.
- `[NEW_NAME]`: Optional new name for the group.
- `[EMAIL]`: Optional new email address for the group.

Options:

- `-d, --description <DESCRIPTION>`: Update group description.
- `-m, --members <MEMBERS>`: Update group members.

Example:

```bash
stalwart-cli group update -d "Updated Engineering Team Description" engineering new.engineering newengineering@example.com
```

## Add Members to a Group

Command:

```bash
stalwart-cli group add-members <NAME> <MEMBERS>...
```

- `<NAME>`: The name of the group.
- `<MEMBERS>`: The members to add to the group.

Example:

```bash
stalwart-cli group add-members engineering alice bob
```

## Remove Members from a Group

Command:

```bash
stalwart-cli group remove-members <NAME> <MEMBERS>...
```

- `<NAME>`: The name of the group.
- `<MEMBERS>`: The members to remove from the group.

Example:

```bash
stalwart-cli group remove-members engineering alice
```

## Display a Group

Command:

```bash
stalwart-cli group display <NAME>
```

- `<NAME>`: The name of the group to display.

Example:

```bash
stalwart-cli group display engineering
```

## List Groups

Command:

```bash
stalwart-cli group list [FROM] [LIMIT]
```

- `[FROM]`: The starting point for listing groups.
- `[LIMIT]`: The maximum number of groups to list.

Example:

```bash
stalwart-cli group list 0 10
```

