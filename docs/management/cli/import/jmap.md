---
sidebar_position: 2
---

# From JMAP

The command-line interface (CLI) allows system administrators to easily import entire JMAP accounts. Importing a JMAP account is not limited to just emails, it also includes folders, identities, Sieve scripts, and vacation responses. This useful when migrating from previous versions of Stalwart Mail Server or moving accounts from third-party JMAP servers. To facilitate this process, the CLI tool offers also an [export command](/docs/management/cli/export) which extracts all the account data from the original server.

Once the export account command has been executed and the account data secured, the `import account` command can be used on the destination server. The imported account data is then populated into the respective user's account, ensuring a seamless transition between servers or versions. 

The CLI command used to import mailboxes into Stalwart JMAP is ``import account`` and accepts the following options:

```txt
Import a JMAP account

Usage: stalwart-cli import account [OPTIONS] <ACCOUNT> <PATH>

Arguments:
  <ACCOUNT>  Account name or email to import messages into
  <PATH>     Path to the exported account directory

Options:
  -n, --num-concurrent <NUM_CONCURRENT>
          Number of concurrent requests, defaults to the number of CPUs
  -h, --help
          Print help
```

## Usage

To import a JMAP account, specify the account name and the path to the account directory that was previously exported with the `export account` command:

```bash
$ stalwart-cli -u https://jmap.example.org import account john ~/export/john
```
