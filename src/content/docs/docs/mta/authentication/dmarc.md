---
sidebar_position: 4
title: "DMARC"
---

DMARC (Domain-based Message Authentication, Reporting & Conformance) is an email-authentication protocol that allows receivers to determine whether incoming messages are legitimate and were sent from authorised sources. A sending domain publishes a DMARC policy as a DNS TXT record, specifying how receivers should treat messages that fail SPF or DKIM authentication. DMARC also provides a reporting mechanism that lets the sender receive feedback on how their messages are handled, which can be used to detect abuse of the domain.

## Verification

DMARC verification is configured on the [SenderAuth](/docs/ref/object/sender-auth) singleton (found in the WebUI under <!-- breadcrumb:SenderAuth --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Inbound › Sender Authentication<!-- /breadcrumb:SenderAuth -->). The [`dmarcVerify`](/docs/ref/object/sender-auth#dmarcverify) field accepts an expression that returns one of:

- `relaxed`: verify DMARC and report the results in the `Authentication-Results` header.
- `strict`: reject the message if DMARC fails verification; otherwise report the results.
- `disable`: do not perform DMARC verification.

The default policy applies `relaxed` when `local_port == 25` and `disable` otherwise, so verification runs only on the cleartext inbound SMTP port. The equivalent configuration is:

```json
{
  "dmarcVerify": {
    "match": [{"if": "listener == 'smtp'", "then": "relaxed"}],
    "else": "disable"
  }
}
```
