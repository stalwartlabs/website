---
sidebar_position: 3
---

# Database Console

The **Database Console** is a command-line utility included with the Stalwart binary. It provides direct access to the internal data store, allowing administrators and developers to inspect, query, and manipulate the underlying database used by Stalwart. This tool is particularly useful for debugging, maintenance, and advanced configuration scenarios.

## Launching the Console

To start the database console, run the Stalwart binary with the `--console` parameter, along with the `--config` argument pointing to your configuration file. The configuration file defines how Stalwart connects to its data store and is required for the console to function properly.

For example:

```bash
$ /opt/stalwart/bin/stalwart --console --config /opt/stalwart/etc/config.toml
```

This command initializes the console interface and establishes a connection to the configured backend database, providing an interactive session for executing database-related operations.

It is important to note that the ability to use the database console while the main Stalwart server is running depends on the type of database backend in use:

- When the backend is **FoundationDB**, **PostgreSQL**, or **MySQL**, the console can safely operate in parallel with a running Stalwart instance. These backends are designed to handle concurrent access and transactions reliably, allowing administrators to inspect or modify data without interrupting service.
- However, if the backend is an **embedded database** such as **RocksDB** or **SQLite**, it is necessary to **stop the Stalwart server** before launching the console. These databases do not support safe concurrent access in all scenarios and may become corrupted or locked if accessed by multiple processes simultaneously.

:::tip Note

Always ensure that proper backups are in place before performing manual operations through the database console, especially when working directly with low-level data structures or making changes in a production environment.

:::

## Console Commands

Once inside the database console, a set of commands is available for directly interacting with the underlying key-value store. All keys used in these commands must be prefixed with their corresponding [subspace letter](/docs/development/database), as each subspace represents a different category of internal data in Stalwart.

Keys and values can optionally be encoded using either **Base64** (by prefixing with `base64:`) or represented using **escaped hexadecimal notation** (e.g., `\x41` for ASCII `'A'`), which is useful for working with binary or non-printable data.

### `scan <from_key> <to_key>`

The `scan` command allows you to **list all key-value pairs** in a specified range. This is typically used to inspect segments of the database associated with a particular subspace. The `<from_key>` and `<to_key>` define the start and end of the key range to be scanned. The results include all entries starting at `from_key` and continuing up to, but not including, `to_key`.

This command is helpful for exploring the contents of a subspace or verifying that a batch of entries exists within the expected key range.

### `delete <from_key> [<to_key>]`

The `delete` command is used to **remove one or more keys** from the database. If only `<from_key>` is specified, a single key is deleted. If both `<from_key>` and `<to_key>` are given, the command deletes all keys in the range starting from `from_key` up to (but not including) `to_key`.

This operation is irreversible, so it should be used with caution—especially in production environments or when operating on wide ranges.

### `get <key>`

The `get` command retrieves and displays the **value associated with a given key**. The key must be fully specified and prefixed with the appropriate subspace letter. This command is useful for examining the content of specific records, such as checking a user property, reading a stored blob, or inspecting configuration data.

If the key is not found, the console will indicate that no value exists for the given input.

### `put <key> [<value>]`

The `put` command is used to **insert or update a key-value pair** in the database. Both the key and the value must be provided, and the key should be prefixed with the correct subspace identifier.

If a value already exists for the key, it will be overwritten. This command can be used to seed data, correct values, or perform manual updates to test system behavior.

### `help`

Typing `help` displays a list of all available commands and usage hints. This is useful for quickly reviewing syntax or understanding supported operations within the console.

### `exit` / `quit`

Both `exit` and `quit` gracefully terminate the console session. Use these commands when you're finished working in console mode.

