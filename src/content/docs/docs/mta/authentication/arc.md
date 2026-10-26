---
sidebar_position: 3
title: "ARC"
description: "Verifying the Authenticated Received Chain of forwarded messages: modes, algorithms, replies, and why Stalwart does not seal messages."
---

Forwarding breaks the usual authentication of a message. When a mailing list or a forwarding service passes a message on, it often modifies it, for example by adding a footer, and that change breaks the original DKIM signatures. It also sends the message from its own servers, which breaks SPF. The final receiver then sees a message that fails authentication, even though it was authentic when the intermediary received it.

The Authenticated Received Chain ([ARC](https://www.rfc-editor.org/rfc/rfc8617), RFC 8617) addresses this problem. Each intermediary records the authentication results it saw in a set of three headers, `ARC-Authentication-Results`, `ARC-Message-Signature` and `ARC-Seal`, and signs that set. A later receiver can verify the chain of these sets. If it trusts the intermediaries, it can then take the original results into account. ARC was published as an experimental specification, and it is expected to move to Historic status once its successor is published, as [Sealing](#sealing) describes.

## Verification

ARC verification is configured with [`arcVerify`](/docs/ref/object/sender-auth#arcverify) on the [SenderAuth](/docs/ref/object/sender-auth) singleton (found in the WebUI under <!-- breadcrumb:SenderAuth --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Inbound › Sender Authentication<!-- /breadcrumb:SenderAuth -->). The field is an expression that returns one of three modes. It is <!-- default:SenderAuth.arcVerify -->`disable`<!-- /default --> by default, so ARC chains are ignored until verification is enabled:

| Mode | Effect |
|---|---|
| `relaxed` | Verify the chain and record the result for the spam filter (`ARC_ALLOW`, `ARC_REJECT`, `ARC_INVALID`, `ARC_DNSFAIL`, `ARC_NA`). |
| `strict` | Also refuse a message whose chain fails: `550 5.7.29 ARC validation failed.`, or `451 4.7.29` for a temporary DNS error. A message without an ARC chain is accepted. |
| `disable` | Do not verify. |

The following object body enables verification for all messages:

```json
{
  "arcVerify": {"else": "relaxed"}
}
```

ARC signatures take their `a=` tag from DKIM, and with it their algorithms ([RFC 8617](https://www.rfc-editor.org/rfc/rfc8617), section 4.1.3). Stalwart verifies chains signed with RSA-SHA256 and with Ed25519. It also verifies chains signed with RSA-SHA1, because some intermediaries still use it. ARC verification runs at the [DATA stage](/docs/mta/inbound/data#order-of-processing), after DKIM.

## Sealing

Stalwart verifies ARC chains, but it no longer adds ARC sets to the messages it forwards, and it has no setting to do so. The role of ARC passes to [DKIM2](/docs/mta/authentication/dkim/dkim2), the successor to DKIM. In DKIM2, every system that handles a message adds its own signature and records the changes it makes. RFC 8617 is expected to move to Historic status once DKIM2 is published, and Stalwart stopped sealing ahead of that change.

Messages that Stalwart relays, for example through [mailing lists](/docs/email/management/mailing-lists), are still signed with DKIM and DKIM2 when the [signing expression](/docs/mta/authentication/dkim/sign#signing-domain) selects a domain. They carry no ARC seal of this server.
