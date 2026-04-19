---
sidebar_position: 3
---

# ARC

Authenticated Received Chain (ARC) is an email-authentication protocol that establishes a chain of trust between email domains. It allows receivers to authenticate the original sender of a message even after it has been forwarded multiple times. Each hop in the delivery path appends a set of `ARC-` headers capturing its own authentication results, and downstream verifiers can evaluate the whole chain to decide whether to trust a message whose SPF or DKIM might otherwise have been invalidated by forwarding.

## Sealing

ARC sealing is the process by which a receiving mail server adds its own digital signature to the existing ARC chain. The signature allows subsequent recipient servers to verify the chain. Stalwart can seal incoming and outgoing messages using the `ED25519-SHA256`, `RSA-SHA256`, or `RSA-SHA1` algorithms. The signature used for sealing is a regular [DkimSignature](/docs/ref/object/dkim-signature) object (found in the WebUI under <!-- breadcrumb:DkimSignature --><!-- /breadcrumb:DkimSignature -->); see the [DKIM signing](/docs/mta/authentication/dkim/sign) page for how signatures are defined.

<!-- review: The previous `auth.arc.seal` setting selected a named DKIM signature to use for ARC sealing. The current [SenderAuth](/docs/ref/object/sender-auth) singleton exposes `dkimSignDomain`, `dkimStrict`, `dkimVerify`, `spfEhloVerify`, `spfFromVerify`, `arcVerify`, `dmarcVerify`, and `reverseIpVerify`, but no `arcSeal` field. Confirm which object/field now selects the ARC sealing signature (or whether ARC sealing reuses the same signature selected for DKIM signing via `dkimSignDomain`). -->

## Verification

Stalwart can verify the ARC seals and signatures of incoming messages using the same algorithms supported for sealing. ARC verification is configured on the [SenderAuth](/docs/ref/object/sender-auth) singleton (found in the WebUI under <!-- breadcrumb:SenderAuth --><!-- /breadcrumb:SenderAuth -->). The [`arcVerify`](/docs/ref/object/sender-auth#arcverify) field accepts an expression that returns one of:

- `relaxed`: verify ARC and report the results in the `Authentication-Results` header.
- `strict`: reject the message if all ARC seals fail verification; otherwise report the results.
- `disable`: do not perform ARC verification.

By default `arcVerify` resolves to `disable`, so ARC verification must be explicitly enabled. To verify ARC in relaxed mode for every incoming message:

```json
{
  "arcVerify": {"else": "relaxed"}
}
```
