---
sidebar_position: 3
---

# Delivery Notifications

Delivery Status Notifications (DSN) allows senders of an email message to be notified of its delivery status. It works by sending a message back to the sender, notifying them of the delivery status of the email message they sent. The delivery status information includes whether the message was delivered successfully, whether it was delivered to the recipient's mailbox or to a different location, whether it was delayed, or whether there was a permanent delivery failure. 

## Configuration

Delivery Status Notifications are configured under the `report.dsn` key and support the following attributes:

- `from-name`: The name that will be used in the `From` header of the DSN email.
- `from-address`: The email address that will be used in the `From` header of the DSN email. The default value is the expression `'MAILER-DAEMON@' + config_get('report.domain')`.
- `sign`: The list of [DKIM](/docs/mta/authentication/dkim/overview) signatures to use when signing the DSN.

Example:

```toml
[report.dsn]
from-name = "'Mail Delivery Subsystem'"
from-address = "'MAILER-DAEMON@example.org'"
sign = "['rsa']"
```

## Report Domain

The default domain to use in DSNs as well as DMARC and TLS reports is configured under the `report.domain` key in the configuration file.

For example:

```toml
[report]
domain = "example.org"
```
