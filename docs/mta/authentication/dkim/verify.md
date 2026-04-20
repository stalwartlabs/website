---
sidebar_position: 3
---

# Verifying

Stalwart can verify the DKIM signatures of incoming messages using the `ED25519-SHA256`, `RSA-SHA256`, or `RSA-SHA1` algorithms. Verification is configured on the [SenderAuth](/docs/ref/object/sender-auth) singleton (found in the WebUI under <!-- breadcrumb:SenderAuth --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Inbound › Sender Authentication<!-- /breadcrumb:SenderAuth -->).

The [`dkimVerify`](/docs/ref/object/sender-auth#dkimverify) field accepts an expression that returns one of:

- `relaxed`: verify DKIM and report the results in the `Authentication-Results` header.
- `strict`: reject the message if all DKIM signatures fail verification; otherwise report the results.
- `disable`: do not perform DKIM verification.

The default is `relaxed`:

```json
{
  "dkimVerify": {"else": "relaxed"}
}
```

## Insecure signatures

An insecure DKIM signature is one whose parameters, although conforming to the standards, can be exploited. A common example is the DKIM `l=` parameter, which specifies the exact number of octets in the message body covered by the signature. An attacker can append content beyond the covered length, and the original signature remains valid for the covered portion. Such signatures can mislead automated systems and end-users, undermining trust indicators such as Brand Indicators for Message Identification (BIMI).

Stalwart ignores insecure signatures by default. To accept all signatures, including those deemed insecure, set [`dkimStrict`](/docs/ref/object/sender-auth#dkimstrict) to `false`:

```json
{
  "dkimStrict": false
}
```
