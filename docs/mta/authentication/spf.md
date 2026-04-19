---
sidebar_position: 2
---

# SPF

SPF (Sender Policy Framework) is an email-validation protocol designed to detect email spoofing. It prevents unauthorised use of a domain name in email messages by verifying that an incoming message comes from an IP address authorised by the domain owner. The authorised IPs are published in the domain's SPF record in DNS; if the source IP of a message is not listed, the receiving server can reject or flag the message as potentially fraudulent.

SPF reduces the likelihood of email spoofing, supports deliverability of legitimate mail, and improves overall email security.

## Verification

Stalwart verifies both the SPF `HELO` and `MAIL FROM` identities. HELO identity verification checks the SPF record of the domain named in the `EHLO` command to confirm that the connecting server is authorised to send mail for that domain. MAIL FROM identity verification checks the SPF record of the domain named in the `MAIL FROM` command.

SPF verification is configured on the [SenderAuth](/docs/ref/object/sender-auth) singleton (found in the WebUI under <!-- breadcrumb:SenderAuth --><!-- /breadcrumb:SenderAuth -->) via two fields: [`spfEhloVerify`](/docs/ref/object/sender-auth#spfehloverify) (SPF verification policy for the EHLO identity) and [`spfFromVerify`](/docs/ref/object/sender-auth#spffromverify) (SPF verification policy for the MAIL FROM identity).

Each expression returns one of:

- `relaxed`: verify SPF and report the results in the `Authentication-Results` and `Received-SPF` headers.
- `strict`: reject the message if SPF fails verification; otherwise report the results.
- `disable`: do not perform SPF verification.

The default policy for both fields applies `relaxed` when `local_port == 25` and `disable` otherwise, which is equivalent to the following configuration:

```json
{
  "spfEhloVerify": {
    "match": [{"if": "listener == 'smtp'", "then": "relaxed"}],
    "else": "disable"
  },
  "spfFromVerify": {
    "match": [{"if": "listener == 'smtp'", "then": "relaxed"}],
    "else": "disable"
  }
}
```
