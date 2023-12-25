---
sidebar_position: 5
---

# Local Domains

The Domain Name Management tool allows administrators to manage domain names within Stalwart Mail Server using a command-line interface. This tool provides functionalities to create and delete domain names, as well as list all the domains configured in the server.

General Usage:

```bash
stalwart-cli --url <URL> domain <COMMAND>
```

- `--url <URL>`: The URL of Stalwart Mail Server.
- `<COMMAND>`: The specific domain name management command to execute.

## Create a Domain

Command:

```bash
stalwart-cli domain create <NAME>
```

- `<NAME>`: The domain name to create.

Example:

```bash
stalwart-cli domain create example.com
```
This command creates a new domain named "example.com" in Stalwart Mail Server.

## Delete a Domain

Command:

```bash
stalwart-cli domain delete <NAME>
```

- `<NAME>`: The domain name to delete.

Example:

```bash
stalwart-cli domain delete example.com
```
This command deletes the domain named "example.com" from Stalwart Mail Server.

## List Domains

Command:

```bash
stalwart-cli domain list [FROM] [LIMIT]
```

- `[FROM]`: The starting point for listing domains.
- `[LIMIT]`: The maximum number of domains to list.

Example:

```bash
stalwart-cli domain list 0 10
```

This command lists the first 10 domains configured in Stalwart Mail Server.

