---
sidebar_position: 2
---

# SPF

SPF (Sender Policy Framework) is an email-validation protocol designed to detect email spoofing. It prevents unauthorised use of a domain name in email messages by verifying that an incoming message comes from an IP address authorised by the domain owner. The authorised IPs are published in the domain's SPF record in DNS; if the source IP of a message is not listed, the receiving server can reject or flag the message as potentially fraudulent.

SPF reduces the likelihood of email spoofing, supports deliverability of legitimate mail, and improves overall email security.

## Verification

Stalwart verifies both the SPF `HELO` and `MAIL FROM` identities. HELO identity verification checks the SPF record of the domain named in the `EHLO` command to confirm that the connecting server is authorised to send mail for that domain. MAIL FROM identity verification checks the SPF record of the domain named in the `MAIL FROM` command.

SPF verification is configured on the [SenderAuth](/docs/ref/object/sender-auth) singleton (found in the WebUI under <!-- breadcrumb:SenderAuth --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Inbound › Sender Authentication<!-- /breadcrumb:SenderAuth -->) via two fields: [`spfEhloVerify`](/docs/ref/object/sender-auth#spfehloverify) (SPF verification policy for the EHLO identity) and [`spfFromVerify`](/docs/ref/object/sender-auth#spffromverify) (SPF verification policy for the MAIL FROM identity).

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
