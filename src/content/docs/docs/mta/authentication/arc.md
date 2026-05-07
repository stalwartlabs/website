---
sidebar_position: 3
title: "ARC"
---

Authenticated Received Chain (ARC) is an email-authentication protocol that establishes a chain of trust between email domains. It allows receivers to authenticate the original sender of a message even after it has been forwarded multiple times. Each hop in the delivery path appends a set of `ARC-` headers capturing its own authentication results, and downstream verifiers can evaluate the whole chain to decide whether to trust a message whose SPF or DKIM might otherwise have been invalidated by forwarding.

## Sealing

ARC sealing is the process by which a receiving mail server adds its own digital signature to the existing ARC chain, allowing subsequent recipient servers to verify the chain. Following the consensus reached in the DMARC IETF Working Group to wind down the ARC experiment, Stalwart does not seal messages. Only [verification](#verification) of existing ARC chains remains supported, for compatibility with systems that still produce ARC sets.

## Verification

Stalwart can verify the ARC seals and signatures of incoming messages using the `ED25519-SHA256`, `RSA-SHA256`, and `RSA-SHA1` algorithms. ARC verification is configured on the [SenderAuth](/docs/ref/object/sender-auth) singleton (found in the WebUI under <!-- breadcrumb:SenderAuth --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Inbound › Sender Authentication<!-- /breadcrumb:SenderAuth -->). The [`arcVerify`](/docs/ref/object/sender-auth#arcverify) field accepts an expression that returns one of:

- `relaxed`: verify ARC and report the results in the `Authentication-Results` header.
- `strict`: reject the message if all ARC seals fail verification; otherwise report the results.
- `disable`: do not perform ARC verification.

By default `arcVerify` resolves to `disable`, so ARC verification must be explicitly enabled. To verify ARC in relaxed mode for every incoming message:

```json
{
  "arcVerify": {"else": "relaxed"}
}
```
