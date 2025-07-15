---
sidebar_position: 4
---

# SPF

SPF authentication failure reporting refers to the process of generating reports that inform the sending mail server about the outcome of its SPF (Sender Policy Framework) authentication check. This check is done by the recipient server to verify that the incoming email message is authorized by the domain specified in the message's envelope (i.e., the "MAIL FROM" identity). The SPF authentication failure report is typically sent back to the sending mail server when the SPF check fails, indicating that the message was not authorized to be sent from the domain specified in the MAIL FROM identity. The report includes information about the reason for the SPF authentication failure, such as the SPF record in the sending domain, the IP address of the sending server, and the header details of the message. These reports help the sending server to identify and address any issues with their SPF records, ensuring that their messages are properly authorized and reducing the likelihood of them being marked as spam or rejected by recipient servers.

Stalwart [automatically analyzes](/docs/mta/reports/analysis) received SPF failure reports from external hosts and can also generate its own SPF reports to inform other hosts about the authentication outcomes of the signatures it has processed. Outgoing SPF failure reports are configured under the `report.spf` key using the following options:

- `from-name`: The name that will be used in the `From` header of the SPF report email.
- `from-address`: The email address that will be used in the `From` header of the SPF report email. The default value is the expression `'noreply-spf@' + config_get('report.domain')`.
- `subject`: The subject name that will be used in the SPF report email.
- `send`: The rate at which SPF reports will be sent to a given email address. When this rate is exceeded, no further SPF failure reports will be sent to that address. Set to `false` to disable SPF authentication failure reporting.
- `sign`: The list of [DKIM](/docs/mta/authentication/dkim/overview) signatures to use when signing the SPF report.

Example:

```toml
[report.spf]
from-name = "'Report Subsystem'"
from-address = "'noreply-spf@example.org'"
subject = "'SPF Authentication Failure Report'"
sign = ["rsa"]
send = "1/1d"
```
