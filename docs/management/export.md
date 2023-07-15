---
sidebar_position: 6
---

# Export

The command-line interface (CLI) tool supports exporting JMAP accounts, which allows system administrator to perform comprehensive backups or transfer user data to other mail servers. The exported data is stored in JSON files, which are structured according to the JMAP schema. This standardized format ensures compatibility and interoperability across different systems and platforms that support the JMAP protocol. An exported JMAP account is not limited to only the emails of the user, but it also includes mailboxes, Sieve scripts, identities, and vacation responses. This means that all critical account information, settings, and data are encapsulated within the export. 

The CLI command used to export an account is ``export account`` and accepts the following
options:

```txt
Export a JMAP account

Usage: stalwart-cli export account [OPTIONS] <ACCOUNT> <PATH>

Arguments:
  <ACCOUNT>  Account name or email to import messages into
  <PATH>     Path to export the account to

Options:
  -n, --num-concurrent <NUM_CONCURRENT>
          Number of concurrent blob downloads to perform, defaults to the number of CPUs
  -h, --help
          Print help
```

## Usage

To export a JMAP account, specify the account name and the path to the directory where the account data will be stored:

```bash
$ stalwart-cli -u https://jmap.example.org export account john ~/export/john
```

