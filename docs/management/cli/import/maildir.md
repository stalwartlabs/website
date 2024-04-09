---
sidebar_position: 1
---

# From Maildir or mbox

E-mail messages and folders can be easily imported into a user account from either ``Maildir`` or ``mbox``
mailboxes. The CLI command used to import mailboxes into Stalwart JMAP is ``import messages`` and accepts the following
options:

```txt
Import messages and folders

Usage: stalwart-cli import messages [OPTIONS] --format <FORMAT> <ACCOUNT> <PATH>

Arguments:
  <ACCOUNT>
          Account name or email to import messages into

  <PATH>
          Path to the mailbox to import, or '-' for stdin (stdin only supported for mbox)

Options:
  -f, --format <FORMAT>
          Possible values:
          - mbox:           Mbox format
          - maildir:        Maildir and Maildir++ formats
          - maildir-nested: Maildir with hierarchical folders (i.e. Dovecot)

  -n, --num-concurrent <NUM_CONCURRENT>
          Number of messages to import concurrently, defaults to the number of CPUs

  -h, --help
          Print help (see a summary with '-h')
```

## Formats

The format of the mailbox to be imported is specified with the ``-f`` option. The following formats
are supported:

- ``mbox``: [Mbox](http://qmail.org/man/man5/mbox.html) file format. Messages are imported into the account's *Inbox* folder.
- ``maildir``: [Maildir](https://cr.yp.to/proto/maildir.html) and [Maildir++](https://www.courier-mta.org/imap/README.maildirquota.html) mailboxes. Subfolders reside under the main Maildir directory and use ``.`` as folder separator.
- ``maildir-nested``: Maildir mailbox with a file system layout, used mostly by [Dovecot](https://doc.dovecot.org/admin_manual/mailbox_formats/maildir/#directory-structure).

## Concurrent tasks

In order to accelerate the import process, messages are imported in parallel using multiple threads.
The default number of threads employed during import equals to the number of CPUs in the system running the CLI tool.
To specify a different number of import threads to spawn, use the ``-n`` option.

## Usage

To import a mailbox, specify the account name, path to the mailbox (or ``-`` to read the mailbox from standard input) and the mailbox format:

For example, to import a Maildir mailbox into the account ``john``:

```bash
$ stalwart-cli -u https://jmap.example.org import messages -f maildir john /home/john/Maildir
```

The CLI tool will proceed to create any missing mailboxes and spawn multiple message import threads:

```txt
[1/4] Parsing mailbox...
[2/4] Fetching existing mailboxes for account...
[3/4] Creating missing mailboxes...
[4/4] Importing messages...
[1/?] ⠂ Importing 72: Inbox/support@hello.org
[2/?] ⠂ Importing 65: Inbox/thomas@domain.com
[3/?] ⠂ Importing 66: Inbox/bill@example.org
[4/?] ⠂ Importing 67: Inbox/jane@example.org
[5/?] ⠂ Importing 68: Inbox/bill@example.org
[6/?] ⠁ Importing 61: Sent Items/thomas@domain.com
[7/?] ⠁ Importing 62: Drafts/thomas@domain.com
[8/?] ⠁ Importing 63: Drafts/thomas@domain.com         
```

If the import process is interrupted, the CLI tool supports automatically resuming the task without
duplicating messages or folders.

## Troubleshooting

When importing Maildir mailboxes with hundreds of subfolders, some systems may report a ``Too many open files`` error:

```
[1/4] Parsing mailbox...
Failed to read Maildir folder: Too many open files (os error 24)
```

To increate the maximum number of open files use the ``ulimit`` command, for example:

```bash
$ ulimit -n 65535
```

