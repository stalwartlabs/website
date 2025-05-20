---
sidebar_position: 2
---

# Reports

Stalwart maintains a separate queue for DMARC and TLS aggregate reports until they are ready to delivered. Once a report is ready to be delivered, it is attached to an RFC5322 message and placed in the main message queue. The report queue is managed using the `report` CLI command which accepts the following arguments:

```txt
$ stalwart-cli -u https://mx.example.org:8080 -c secret report 
Manage SMTP DMARC/TLS report queue

Usage: stalwart-cli --url <URL> report <COMMAND>

Commands:
  list    Shows reports queued for delivery
  status  Displays details about a queued report
  cancel  Cancel report delivery
  help    Print this message or the help of the given subcommand(s)

Options:
  -h, --help  Print help
```

## List

The command `report list` displays the reports that are not yet due for delivery. It accepts the following filtering parameters:

```txt
$ stalwart-cli -u https://mx.example.org:8080 -c secret report list --help
Shows reports queued for delivery

Usage: stalwart-cli report list [OPTIONS]

Options:
  -d, --domain <DOMAIN>
          Filter by report domain

  -f, --format <FORMAT>
          Filter by report type

          Possible values:
          - dmarc: DMARC report
          - tls:   TLS report

  -p, --page-size <PAGE_SIZE>
          Number of items to show per page

  -h, --help
          Print help (see a summary with '-h')
```

For example:

```txt
$ stalwart-cli -u https://mx.example.org:8080 -c secret report list

+------------------------------------+-------------+-------+---------------------------------+--------------------------------+-------+
| ID                                 | Domain      | Type  | From Date                       | To Date                        | Size  |
+------------------------------------+-------------+-------+---------------------------------+--------------------------------+-------+
| d!example.net!14235512968763890743 | example.net | DMARC | Sun, 26 Feb 2023 00:00:00 +0000 | Sun, 5 Mar 2023 00:00:00 +0000 | 508 B |
+------------------------------------+-------------+-------+---------------------------------+--------------------------------+-------+
| t!example.org                      | example.org | TLS   | Wed, 1 Mar 2023 00:00:00 +0000  | Thu, 2 Mar 2023 00:00:00 +0000 | 158 B |
+------------------------------------+-------------+-------+---------------------------------+--------------------------------+-------+
| t!example.net                      | example.net | TLS   | Sun, 26 Feb 2023 00:00:00 +0000 | Sun, 5 Mar 2023 00:00:00 +0000 | 356 B |
+------------------------------------+-------------+-------+---------------------------------+--------------------------------+-------+
| d!example.org!18102729795680737869 | example.org | DMARC | Wed, 1 Mar 2023 00:00:00 +0000  | Thu, 2 Mar 2023 00:00:00 +0000 | 503 B |
+------------------------------------+-------------+-------+---------------------------------+--------------------------------+-------+


4 report(s) found.
```

## Status

The `report status` command shows the details for a pending report. It accepts as parameters one or more report ids, for example:

```txt
$ stalwart-cli -u https://mx.example.org:8080 -c secret report status 'd!example.net!14235512968763890743'

+-------------+------------------------------------+
| ID          | d!example.net!14235512968763890743 |
+-------------+------------------------------------+
| Domain Name | example.net                        |
+-------------+------------------------------------+
| Type        | DMARC                              |
+-------------+------------------------------------+
| From Date   | Sun, 26 Feb 2023 00:00:00 +0000    |
+-------------+------------------------------------+
| To Date     | Sun, 5 Mar 2023 00:00:00 +0000     |
+-------------+------------------------------------+
| Size        | 508 B                              |
+-------------+------------------------------------+
```

## Cancel

The `queue cancel` command cancels the delivery of a report. The command expects one or multiple report ids, for example:

```txt
$ stalwart-cli -u https://mx.example.org:8080 -c secret report cancel 'd!example.net!14235512968763890743'

Removed 1 report(s).
```
