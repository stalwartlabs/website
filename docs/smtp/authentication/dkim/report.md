---
sidebar_position: 4
---

# Reporting

DKIM authentication failure reporting is a mechanism that allows domain owners to receive notifications when email messages sent from their domain fail DKIM authentication checks at recipient mail servers. The reporting mechanism uses an email-based report format, which is sent to a designated address within the domain. This information can be used to identify misconfigurations or malicious activity that may negatively impact the domain's email reputation. The reports typically include information such as the message's sender, recipient, and the specific DKIM verification result (e.g., "failed" or "permanently failed"). By analyzing the reports, domain owners can detect issues with their DKIM implementation and take action to resolve them, improving their email deliverability and protecting their domain's reputation.

Stalwart SMTP [automatically analyzes](/docs/smtp/authentication/analysis) received DKIM failure reports from external hosts and can also generate its own DKIM reports to inform other hosts about the authentication outcomes of the signatures it has processed. Outgoing DKIM failure reports are configured under the `report.dkim` key using the following options:

- `from-name`: The name that will be used in the `From` header of the DKIM report email.
- `from-address`: The email address that will be used in the `From` header of the DKIM report email.
- `subject`: The subject name that will be used in the DKIM report email.
- `send`: The rate at which DKIM reports will be sent to a given email address. When this rate is exceeded, no further DKIM failure reports will be sent to that address.
- `sign`: The list of DKIM signatures to use when signing the DKIM report. 

Example:

```toml
[report.dkim]
from-name = "Report Subsystem"
from-address = "noreply-dkim@foobar.org"
subject = "DKIM Authentication Failure Report"
sign = ["rsa"]
send = "1/1d"
```

