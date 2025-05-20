---
sidebar_position: 2
---

# Migrate

When transitioning from an older version of Stalwart or switching the database backend (such as moving from RocksDB to FoundationDB), data migration becomes a necessary step. This ensures that user account information, emails, and settings are accurately transferred and preserved in the new environment.

To conduct the data migration, administrators need to follow a two-step process using the Stalwart CLI tools. The first step involves exporting the user account data from the current system using the [export account](/docs/management/cli/export) command. This command produces a JSON file containing all the user data, including emails, mailboxes, sieve scripts, identities, and vacation responses. For example:

```bash
$ stalwart-cli -u https://jmap.example.org export account john ~/export/john
```

The second step involves importing the previously exported data into the new or upgraded server using the [import account](/docs/management/cli/import/jmap) command. This command reads the data from the JSON file and populates the new database accordingly. For example:

```bash
$ stalwart-cli -u https://jmap.example.org import account john ~/export/john
```

By following this process, administrators can ensure a smooth transition when upgrading Stalwart or when changing the database backend, minimizing disruption for end users.
