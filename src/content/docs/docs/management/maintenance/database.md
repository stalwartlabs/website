---
sidebar_position: 1
title: "Database Console"
description: "The low-level console of the Stalwart binary for reading and changing keys in the data store: starting it, its commands and an example session."
---

The management API shows the data store as decoded objects, and in nearly every case that is the right view. Occasionally a problem lies below that level, in the raw keys and values that the server writes, and diagnosing or repairing it needs direct access to them. The database console provides that access.

The console is an interactive tool built into the Stalwart binary that reads and writes the keys of the data store directly. It is meant for two purposes: diagnosing problems that the management API cannot show, and repairs under guidance, for example from support or the developers.

The console operates below every consistency check of the server. The server cannot stop a wrong `put` or `delete`, which means that such a command can corrupt data. Back up the store before changing anything ([Backup and restore](/docs/management/maintenance/backup)).

## Starting the console

Run the binary with two options: `--config` (or `-c`), naming the server's configuration file, and `--console` (or `-o`) as the last argument:

```bash
$ /opt/stalwart/bin/stalwart --config /opt/stalwart/etc/config.json --console
```

The position of `--console` matters, because every option takes the following argument as its value. Placed before `--config`, it fails with `Missing value for argument 'console', try '--help'.`

The configuration must be given with `--config`, for two reasons. When the `CONFIG_PATH` environment variable is set, the binary ignores its command-line options and starts the server instead. Without a configuration path, the binary prints `Missing '--config' argument for import/export.` and exits.

The console opens the data store named in the configuration. Whether the server may keep running depends on the backend. With PostgreSQL, MySQL or FoundationDB, the console can run while the server is running. With RocksDB or SQLite, stop the server first, because these databases cannot be opened safely by two processes.

## Keys

The data store is divided into subspaces. Each subspace holds one kind of data and is identified by a letter, which is the first byte of every key in it ([Data store layout](/docs/development/database)). Every key given to the console therefore starts with its subspace letter.

The console checks keys before it acts on them. A key whose first byte is not a subspace letter is refused with `Invalid key: [<bytes>]`. The commands that work on a range refuse two keys of different subspaces with `Keys must be in the same subspace.` A refused command changes nothing, and the console waits for the next command.

Keys and values can contain binary data, which the console accepts in two forms:

- `\xNN` escapes, where `\x41` is `A`
- Base64 after the prefix `base64:`

A `base64:` argument that cannot be decoded is refused with `Invalid base64 value: <error>`. The console prints keys and values in the escaped form.

## Commands

The console accepts these commands:

| Command | Effect |
|---|---|
| `scan <from_key> <to_key>` | Lists the keys from `from_key` up to, but not including, `to_key`, each as `<key> : <value>` |
| `get <key>` | Prints the value of one key, or `Key not found.` |
| `put <key> [<value>]` | Writes a key, replacing any existing value; without a value, an empty value is written |
| `delete <key>` | Deletes one key |
| `delete <from_key> <to_key>` | Counts the keys in the range and, after the confirmation `y`, deletes them |
| `help` | Lists the commands |
| `exit`, `quit` | Ends the session |

A range deletion asks for confirmation before it removes anything: `Are you sure you want to delete <N> keys? (y/N):`. It deletes nothing unless the answer is `y`. A deletion cannot be undone.

## Example session

The following session checks whether a background task is stuck. It lists the tasks waiting in the task queue, which is subspace `f`, and then leaves the console. The output shows each queued task as one key and value, abbreviated here:

```text
$ /opt/stalwart/bin/stalwart --config /opt/stalwart/etc/config.json --console
Stalwart Server v1.0.0 Data Store CLI

Enter commands (type 'help' for available commands).
> scan f f\xff
Scanning from [102] to [102, 255]
f<key> : <value>
f<key> : <value>
> exit
Exiting...
```

The same tasks are visible, decoded, in the WebUI and through the management API ([Tasks](/docs/management/tasks-actions/tasks)). The console is needed only when they are not.
