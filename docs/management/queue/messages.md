---
sidebar_position: 1
---

# Messages

The SMTP message queue is managed using the `queue` CLI command which accepts the following arguments:

```txt
$ stalwart-cli -u https://mx.foobar.org:8080 -c secret queue 
Manage SMTP message queue

Usage: stalwart-cli --url <URL> queue <COMMAND>

Commands:
  list    Shows messages queued for delivery
  status  Displays details about a queued message
  retry   Reschedule delivery
  cancel  Cancel delivery
  help    Print this message or the help of the given subcommand(s)

Options:
  -h, --help  Print help
```

## List

The command `queue list` displays the messages awaiting to be delivered. It accepts the following filtering parameters:

```txt
$ stalwart-cli -u https://mx.foobar.org:8080 -c secret queue list --help

Shows messages queued for delivery

Usage: stalwart-cli queue list [OPTIONS]

Options:
  -s, --sender <SENDER>        Filter by sender address
  -r, --rcpt <RCPT>            Filter by recipient
  -b, --before <BEFORE>        Filter messages due for delivery before a certain datetime
  -a, --after <AFTER>          Filter messages due for delivery after a certain datetime
  -p, --page-size <PAGE_SIZE>  Number of items to show per page
  -h, --help                   Print help
```

For example:

```txt
$ stalwart-cli -u https://mx.foobar.org:8080 -c secret queue list

+-----------+--------------------------------+------------------+--------------------------------+--------+
| ID        | Delivery Due                   | Sender           | Recipients                     | Size   |
+-----------+--------------------------------+------------------+--------------------------------+--------+
| 32B91F716 | Wed, 1 Mar 2023 11:51:01 +0000 | bill4@foobar.net | delay@foobar.org (scheduled)   | 1142 B |
+-----------+--------------------------------+------------------+--------------------------------+--------+
| 22B91F716 | Wed, 1 Mar 2023 11:49:21 +0000 | bill3@foobar.net | rcpt5@example1.com (scheduled) | 1142 B |
|           |                                |                  | rcpt6@example2.com (scheduled) |        |
|           |                                |                  | rcpt7@example2.com (scheduled) |        |
|           |                                |                  | rcpt8@example3.com (scheduled) |        |
|           |                                |                  | rcpt9@example4.com (scheduled) |        |
+-----------+--------------------------------+------------------+--------------------------------+--------+
| 12B91F716 | Wed, 1 Mar 2023 11:47:41 +0000 | bill2@foobar.net | rcpt3@example1.net (scheduled) | 1142 B |
|           |                                |                  | rcpt4@example1.net (scheduled) |        |
+-----------+--------------------------------+------------------+--------------------------------+--------+
| 2B91F716  | Wed, 1 Mar 2023 11:46:01 +0000 | bill1@foobar.net | rcpt1@example1.org (scheduled) | 1141 B |
|           |                                |                  | rcpt1@example2.org (scheduled) |        |
+-----------+--------------------------------+------------------+--------------------------------+--------+
| 52B91F716 | Wed, 1 Mar 2023 12:01:01 +0000 | <>               | delay@foobar.org (tempfail)    | 1127 B |
|           |                                |                  | success@foobar.org (delivered) |        |
+-----------+--------------------------------+------------------+--------------------------------+--------+
| 42B91F716 | Wed, 1 Mar 2023 11:52:41 +0000 | bill5@foobar.net | john@foobar.org (scheduled)    | 1142 B |
+-----------+--------------------------------+------------------+--------------------------------+--------+


6 queued message(s) found.
```

## Status

The `queue status` command shows the details for a queued message. It accepts as parameters one or more message ids, for example:

```txt
$ stalwart-cli -u https://mx.foobar.org:8080 -c secret queue status 52B91F716

+--------------+---------------------------------------------------------------------------------------------------------+
| ID           | 52B91F716                                                                                               |
+--------------+---------------------------------------------------------------------------------------------------------+
| Sender       | <>                                                                                                      |
+--------------+---------------------------------------------------------------------------------------------------------+
| Created      | Wed, 1 Mar 2023 11:44:22 +0000                                                                          |
+--------------+---------------------------------------------------------------------------------------------------------+
| Size         | 1127 B                                                                                                  |
+--------------+---------------------------------------------------------------------------------------------------------+
| Env-Id       | f                                                                                                       |
+--------------+---------------------------------------------------------------------------------------------------------+
|                                                                                                             foobar.org |
+--------------+---------------------------------------------------------------------------------------------------------+
| Status       | Scheduled                                                                                               |
+--------------+---------------------------------------------------------------------------------------------------------+
| Details      |                                                                                                         |
+--------------+---------------------------------------------------------------------------------------------------------+
| Retry #      | 1                                                                                                       |
+--------------+---------------------------------------------------------------------------------------------------------+
| Delivery Due | Wed, 1 Mar 2023 12:01:01 +0000                                                                          |
+--------------+---------------------------------------------------------------------------------------------------------+
| Notify at    | Wed, 1 Mar 2023 12:17:41 +0000                                                                          |
+--------------+---------------------------------------------------------------------------------------------------------+
| Expires      | Wed, 1 Mar 2023 12:34:21 +0000                                                                          |
+--------------+---------------------------------------------------------------------------------------------------------+
| Recipients   | +--------------------+-------------------+------------------------------------------------------------+ |
|              | | Address            | Status            | Details                                                    | |
|              | +--------------------+-------------------+------------------------------------------------------------+ |
|              | | delay@foobar.org   | Temporary Failure | Code: 451, Enhanced code: 4.5.3, Message: Try again later. | |
|              | +--------------------+-------------------+------------------------------------------------------------+ |
|              | | success@foobar.org | Delivered         | Code: 250, Enhanced code: 2.1.5, Message: OK               | |
|              | +--------------------+-------------------+------------------------------------------------------------+ |
+--------------+---------------------------------------------------------------------------------------------------------+
```

## Reschedule

The `queue retry` commands retries or reschedules the delivery of one or multiple messages. It accepts the following parameters where `BEFORE`, `AFTER` and `TIME` are RFC3339 timestamps:

```txt
$ stalwart-cli -u https://mx.foobar.org:8080 -c secret queue retry --help
Reschedule delivery

Usage: stalwart-cli queue retry [OPTIONS] [IDS]...

Arguments:
  [IDS]...  

Options:
  -s, --sender <SENDER>  Apply to messages matching a sender address
  -d, --domain <DOMAIN>  Apply to a specific domain
  -b, --before <BEFORE>  Apply to messages due before a certain datetime
  -a, --after <AFTER>    Apply to messages due after a certain datetime
  -t, --time <TIME>      Schedule delivery at a specific time
  -h, --help             Print help
```

If the `-t` parameter is not provided, delivery is retried immediately.

Rescheduling can be done by providing a list of message ids:

```txt
$ stalwart-cli -u https://mx.foobar.org:8080 -c secret queue retry 52B91F716

Successfully rescheduled 1 message(s).
```

Or by using a filter that reschedules all matching messages:

```txt
$ stalwart-cli -u https://mx.foobar.org:8080 -c secret queue retry -c bill3@foobar.net -d example1.com -t "2023-11-20T05:04:00Z"

Successfully rescheduled 4 message(s).
```

## Cancel

The `queue cancel` command cancels the delivery of a message. It is also possible to partially cancel the delivery to just one or multiple recipients. The accepted options are:

```txt
$ stalwart-cli -u https://mx.foobar.org:8080 -c secret queue cancel --help
Cancel delivery

Usage: stalwart-cli queue cancel [OPTIONS] [IDS]...

Arguments:
  [IDS]...  

Options:
  -s, --sender <SENDER>  Apply to messages matching a sender address
  -r, --rcpt <RCPT>      Apply to specific recipients or domains
  -b, --before <BEFORE>  Apply to messages due before a certain datetime
  -a, --after <AFTER>    Apply to messages due after a certain datetime
  -h, --help             Print help
```

For example, to cancel the delivery on an entire message:

```txt
$ stalwart-cli -u https://mx.foobar.org:8080 -c secret queue cancel 42B91F716

Cancelled delivery of 1 message(s).
```

Or, to just cancel the delivery to a particular recipient using a filter:

```txt
$ stalwart-cli -u https://mx.foobar.org:8080 -c secret queue cancel -s bill@foobar.org -r john@foobar.org

Cancelled delivery of 5 message(s).
```
