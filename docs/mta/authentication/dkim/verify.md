---
sidebar_position: 3
---

# Verifying

Stalwart can verify the DKIM signatures of incoming messages using the `ED25519-SHA256`, `RSA-SHA256`, or `RSA-SHA1` algorithms. Verification is configured on the [SenderAuth](/docs/ref/object/sender-auth) singleton (found in the WebUI under <!-- breadcrumb:SenderAuth --><!-- /breadcrumb:SenderAuth -->).

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
