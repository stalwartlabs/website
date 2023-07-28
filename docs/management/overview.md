---
sidebar_position: 1
---

# Overview

The Stalwart Command Line Interface (CLI) allows system administrators to perform tasks such as managing queues, migrating information and more. 
Future versions will include a web-based management interface, but for the time being the CLI is the main tool to manage a Stalwart Mail server.

## Installation

The CLI tool should be already installed on the server where Stalwart Mail server is running at `/opt/stalwart-mail/bin/stalwart-cli`. 
If you would like to install the CLI on a different computer, download the [latest release](https://github.com/stalwartlabs/mail-server/releases/latest/) of the `stalwart-cli` package.

## Usage

The default location of the Stalwart CLI is `/opt/stalwart-mail/bin/stalwart-cli` (or, inside a Docker image `/usr/local/bin/stalwart-cli``). When executed without any parameters, the CLI tool prints a brief help page such as this one:

```bash
$ stalwart-cli

Stalwart Mail Server CLI

Usage: stalwart-cli [OPTIONS] --url <URL> <COMMAND>

Commands:
  import    Import JMAP accounts and Maildir/mbox mailboxes
  export    Export JMAP accounts
  database  Manage JMAP database
  queue     Manage SMTP message queue
  report    Manage SMTP DMARC/TLS report queue
  help      Print this message or the help of the given subcommand(s)

Options:
  -u, --url <URL>                  JMAP or SMTP server base URL
  -c, --credentials <CREDENTIALS>  Authentication credentials
  -h, --help                       Print help
  -V, --version                    Print version
```

The CLI tool expects two required arguments: the base URL of your Stalwart Mail server (which is specified with the ``-u`` option) server and the system administrator credentials (which may be specified with the ``-c`` option or at the prompt).

For example, to force a purge of all expired blobs:

```bash
$ stalwart-cli -u https://127.0.0.1:9990 -c PASSWORD database purge
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
Authenticate this request using code HY5E-UUG2 at https://jmap.example.org/auth. Please ENTER when done.
```

On your browser, go to ``https://jmap.example.org/auth`` and enter the provided code (in this example,
``HY5E-UUG2``) as well as the system administrator username and password:

![OAuth Login](./img/oauth_login.png)

If the login is successful, the following message will be displayed:

![OAuth Login](./img/oauth_success.png)

Go back to the terminal where ``stalwart-cli`` is being executed and press ``ENTER`` to execute
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
$ stalwart-cli -u https://jmap.example.org -c postmaster@example.org:secret_pass account list
```

:::tip Note

Avoid using the ``-c`` argument to provide the administrator credentials as these
will be recorded in the terminal's history. Instead, type the password at the prompt:

```bash
$ stalwart-cli -u https://jmap.example.org account list

Enter admin credentials or press [ENTER] to use OAuth: ******
```

:::
