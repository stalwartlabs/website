## Step 8: Send and receive a test message

The last step confirms that mail flows in both directions: that the server can deliver to other providers and that they accept its mail, and that other providers can reach it. Add the new account to a mail client such as Thunderbird, Apple Mail or Outlook by entering its email address and password. Because the DNS records from Step 6 are in place, the client finds the server settings itself. A client that asks for the settings needs the following values:

| Setting | Value |
|---|---|
| Incoming server | IMAP, `mail.example.com`, port 993, SSL/TLS |
| Outgoing server | SMTP, `mail.example.com`, port 465, SSL/TLS |
| User name | The full email address, `jane@example.com` |

Send a message from the account to a mailbox at another provider, then reply to it from that mailbox.

The message should arrive in the inbox at the other provider, not in the spam folder. Its headers, which most providers show with an option such as "Show original", report `pass` for SPF, DKIM and DMARC. The reply arrives in the account's inbox.

If something goes wrong in this step, [Step 8: Test message](#step-8-test-message) under Common problems lists the usual causes and their fixes.
