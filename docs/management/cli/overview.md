---
sidebar_position: 1
---

# Overview

The Stalwart Command Line Interface (CLI) allows system administrators to perform tasks such as managing the internal directory, queues, migrating information and more. 
Although the recommended way to manage and configure Stalwart Mail Server is using the [web-admin](/docs/management/webadmin/overview), the CLI tool can be useful for automating tasks or performing some operations that are not available in the web interface.

## Installation

To install the CLI tool, download the [latest release](https://github.com/stalwartlabs/mail-server/releases/latest/) of the `stalwart-cli` package for your platform and extract it to a directory of your choice.

## Usage

The Stalwart CLI expects two required arguments: 

- **Base URL of your Stalwart Mail server**: Which is specified with the ``-u`` argument or the `URL` environment variable.
- **System administrator credentials**: Which are specified with the ``-c`` argument or the `CREDENTIALS` environment variable. If none are provided, the CLI tool will prompt for them.

For example, to force a purge of all expired blobs:

```bash
$ stalwart-cli -u https://127.0.0.1:9990 -c MySecretPass database purge
```

Or, using environment variables:

```bash
$ export URL=https://127.0.0.1:9990
$ export CREDENTIALS=MySecretPass
$ stalwart-cli database purge
```

When executed without any parameters, the CLI tool prints a brief help page such as this one:

```bash
$ stalwart-cli

Stalwart Mail Server CLI

Usage: stalwart-cli [OPTIONS] --url <URL> <COMMAND>

Commands:
  account   Manage user accounts
  domain    Manage domains
  list      Manage mailing lists
  group     Manage groups
  import    Import JMAP accounts and Maildir/mbox mailboxes
  export    Export JMAP accounts
  database  Manage JMAP database
  queue     Manage SMTP message queue
  report    Manage SMTP DMARC/TLS report queue
  help      Print this message or the help of the given subcommand(s)

Options:
  -u, --url <URL>                  JMAP or SMTP server base URL
  -c, --credentials <CREDENTIALS>  Authentication credentials
  -t, --timeout <TIMEOUT>          Connection timeout in seconds
  -h, --help                       Print help
  -V, --version                    Print version
```

## Authentication

In order to be able to perform management tasks, the CLI tool requires you to be authenticated using the system administrator credentials. Authentication with your Mail server can be done either
using the **Basic** or **OAuth** mechanisms. However, for security reasons, it is always preferable to authenticate using OAuth. 

### OAuth

To use OAuth authentication, run the ``stalwart-cli`` command omitting the ``-c`` option. The CLI tool
will then ask at the prompt if you would like to authenticate using OAuth:

```bash
$ stalwart-cli -u https://jmap.example.org database purge

Enter admin credentials or press [ENTER] to use OAuth: 
```

Press __ENTER__ to start the OAuth authentication flow and obtain the authorization code:

```bash
Authenticate this request using code HY5E-UUG2 at https://jmap.example.org/authorize. Please ENTER when done.
```

On your browser, go to ``https://jmap.example.org/authorize`` and enter the provided code (in this example,
``HY5E-UUG2``) as well as the system administrator username and password.

If the login is successful, a message will be displayed on the browser. Go back to the terminal where ``stalwart-cli`` is being executed and press ``ENTER`` to execute
the command:

```bash
Success.
```

### Basic

Authenticating using the Basic mechanism is done directly from the command line with the ``-c`` argument.
The credentials have to be specified as ``account_name:password`` and, if the account name is omitted, the 
default system administrator account ``admin`` is used.
For example, to authenticate with ``postmaster@example.org`` and password ``secret_pass``:

```bash
$ stalwart-cli -u https://jmap.example.org -c postmaster@example.org:secret_pass database purge
```

:::tip Note

Avoid using the ``-c`` argument to provide the administrator credentials as these
will be recorded in the terminal's history. Instead, type the password at the prompt:

```bash
$ stalwart-cli -u https://jmap.example.org database purge

Enter admin credentials or press [ENTER] to use OAuth: ******
```

:::
