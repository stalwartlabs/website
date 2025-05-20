---
sidebar_position: 4
---

# TLS Reporting

TLS Reporting is a mechanism for reporting on the certificate validation outcomes performed by a mail transfer agent (MTA), such as Stalwart. It allows the recipient of an email to receive reports on the validity of the certificate used to secure the transport of the email, including information such as whether the certificate was valid, expired, or revoked. The goal of TLS Reporting is to provide a way to detect and address security issues with the certificates used to secure email communication, to ensure that email communication is secure and trustworthy. The reports can also be used to identify and correct misconfigurations of the sending MTA, and to improve the overall security of email communication.

## Configuration

Stalwart [automatically analyzes](/docs/smtp/authentication/analysis) TLS reports received from external hosts and can also generate aggregate reports to inform other hosts about the results of TLS validation. Outgoing TLS reports are configured under the `report.tls.aggregate` key using the following options:

- `from-name`: The name that will be used in the `From` header of the TLS report email.
- `from-address`: The email address that will be used in the `From` header of the TLS report email. The default value is the expression `'noreply-tls@' + config_get('report.domain')`.
- `org-name`: The name of the organization to be included in the report.
- `send`: The frequency at which the TLS reports will be sent. The options are `hourly`, `daily`, `weekly`, or `never` to disable reporting.
- `max-size`: The maximum size of the TLS report in bytes.
- `sign`: The list of [DKIM](/docs/smtp/authentication/dkim/overview) signatures to use when signing the TLS report. 

Example:

```toml
[report.tls.aggregate]
from-name = "'TLS Report'"
from-address = "'noreply-tls@example.org'"
org-name = "'The Foobar Organization'"
contact-info = "'jane@example.org'"
send = "daily"
max-size = 26214400 # 25 mb
sign = "['rsa']"
```

The report submitter address can be configured using the `report.submitter` attribute. If not specified, the `config_get('server.hostname')` expression is be used.

For example:

```toml
[report]
submitter = "'mx.example.org'"
```
