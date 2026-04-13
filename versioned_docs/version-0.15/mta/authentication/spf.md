---
sidebar_position: 2
---

# SPF

SPF (Sender Policy Framework) is a simple email validation protocol designed to detect email spoofing. It is a security measure that is used to prevent unauthorized use of a domain name in email messages. SPF works by verifying that an incoming email message is coming from an IP address that is authorized by the domain owner. This is done by checking the message's source IP address against a list of authorized IP addresses that is published in the domain's SPF record in the DNS. If the source IP address of the email message is not listed in the domain's SPF record, the receiving email server can reject or flag the message as potentially fraudulent. This helps to reduce the risk of phishing and other types of email-based fraud and abuse.

SPF reduces the likelihood of email spoofing, increases the deliverability of legitimate emails, and improves the overall security of email communications. By verifying SPF records, Stalwart can identify and reject emails that come from unauthorized sources, helping to protect users from spam, phishing and other types of email fraud.

## Verification

Stalwart can verify the SPF HELO and MAIL FROM identities to ensure that the emails sent from a domain are from a legitimate source. SPF HELO identity verification is the process of checking the SPF record of the domain specified in the EHLO command to verify that the connecting server is authorized to send emails for that domain. On the other hand, MAIL FROM identity verification is the process of checking the SPF record of the domain specified in the MAIL FROM command.

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

