---
sidebar_position: 2
---

# SPF

SPF (Sender Policy Framework) is a simple email validation protocol designed to detect email spoofing. It is a security measure that is used to prevent unauthorized use of a domain name in email messages. SPF works by verifying that an incoming email message is coming from an IP address that is authorized by the domain owner. This is done by checking the message's source IP address against a list of authorized IP addresses that is published in the domain's SPF record in the DNS. If the source IP address of the email message is not listed in the domain's SPF record, the receiving email server can reject or flag the message as potentially fraudulent. This helps to reduce the risk of phishing and other types of email-based fraud and abuse.

SPF reduces the likelihood of email spoofing, increases the deliverability of legitimate emails, and improves the overall security of email communications. By verifying SPF records, Stalwart SMTP can identify and reject emails that come from unauthorized sources, helping to protect users from spam, phishing and other types of email fraud.

## Verification

Stalwart SMTP can verify the SPF HELO and MAIL FROM identities to ensure that the emails sent from a domain are from a legitimate source. SPF HELO identity verification is the process of checking the SPF record of the domain specified in the EHLO command to verify that the connecting server is authorized to send emails for that domain. On the other hand, MAIL FROM identity verification is the process of checking the SPF record of the domain specified in the MAIL FROM command.

The `auth.spf.verify.ehlo` and `auth.spf.verify.mail-from` attributes indicate the SPF verification policy for the EHLO and MAIL-FROM identities respectively:

- `relaxed`: Verify SPF and report the results in the `Authentication-Results` and `Received-SPF` headers.
- `strict`: Reject the message if SPF fails verification, otherwise report the results in the `Authentication-Results` and `Received-SPF` headers.
- `disable`: Do not perform SPF verification.

Example:

```toml
[auth.spf.verify]
ehlo = [ { if = "listener = 'smtp'", then = "relaxed" },
         { else = "disable" } ]
mail-from = [ { if = "listener = 'smtp'", then = "relaxed" },
              { else = "disable" } ]
```

## Reporting

SPF authentication failure reporting refers to the process of generating reports that inform the sending mail server about the outcome of its SPF (Sender Policy Framework) authentication check. This check is done by the recipient server to verify that the incoming email message is authorized by the domain specified in the message's envelope (i.e., the "MAIL FROM" identity). The SPF authentication failure report is typically sent back to the sending mail server when the SPF check fails, indicating that the message was not authorized to be sent from the domain specified in the MAIL FROM identity. The report includes information about the reason for the SPF authentication failure, such as the SPF record in the sending domain, the IP address of the sending server, and the header details of the message. These reports help the sending server to identify and address any issues with their SPF records, ensuring that their messages are properly authorized and reducing the likelihood of them being marked as spam or rejected by recipient servers.

Stalwart SMTP [automatically analyzes](/docs/smtp/authentication/analysis) received SPF failure reports from external hosts and can also generate its own SPF reports to inform other hosts about the authentication outcomes of the signatures it has processed. Outgoing SPF failure reports are configured under the `report.spf` key using the following options:

- `from-name`: The name that will be used in the `From` header of the SPF report email.
- `from-address`: The email address that will be used in the `From` header of the SPF report email.
- `subject`: The subject name that will be used in the SPF report email.
- `send`: The rate at which SPF reports will be sent to a given email address. When this rate is exceeded, no further SPF failure reports will be sent to that address. Set to `false` to disable SPF authentication failure reporting.
- `sign`: The list of [DKIM](/docs/smtp/authentication/dkim/overview) signatures to use when signing the SPF report.

Example:

```toml
[report.spf]
from-name = "'Report Subsystem'"
from-address = "'noreply-spf@example.org'"
subject = "'SPF Authentication Failure Report'"
sign = ["rsa"]
send = "1/1d"
```
