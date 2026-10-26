---
sidebar_position: 3
title: "Verifying"
description: "How Stalwart verifies the DKIM signatures of incoming messages, what the relaxed and strict modes do, which signatures are ignored, and where the results are used."
---

A DKIM signature tells a receiver which domains have taken responsibility for a message, but only once the receiver has verified it. Stalwart verifies the DKIM signatures of the messages it receives at the [DATA stage](/docs/mta/inbound/data#order-of-processing) and records the result. The result is used in three places: by [DMARC](/docs/mta/authentication/dmarc), by the [spam filter](/docs/spamfilter/settings/scores#authentication-tags), and in the `Authentication-Results` header of the message. Verification is configured on the [SenderAuth](/docs/ref/object/sender-auth) singleton (found in the WebUI under <!-- breadcrumb:SenderAuth --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Inbound › Sender Authentication<!-- /breadcrumb:SenderAuth -->).

## Verification modes

[`dkimVerify`](/docs/ref/object/sender-auth#dkimverify) is an expression that returns one of three modes. The default is <!-- default:SenderAuth.dkimVerify -->`relaxed`<!-- /default --> for every session, which means that signatures are verified but never cause a rejection:

| Mode | Effect |
|---|---|
| `relaxed` | Verify the signatures and record the results; never reject. Failure reports are sent to domains that request them. |
| `strict` | Verify the signatures, and refuse the message unless at least one DKIM signature verifies (DKIM2 signatures do not count): `550 5.7.20 No passing DKIM signatures found.`, or `451 4.7.20` when the failure is a temporary DNS error. It also defers messages whose DKIM2 chain cannot be verified because of a temporary DNS error, when they would be signed with DKIM2 for a recipient on another system ([DKIM2](/docs/mta/authentication/dkim/dkim2)). |
| `disable` | Do not verify, unless DMARC verification needs the results, in which case the signatures are verified without any rejection. |

`strict` also refuses messages that carry no signature at all. It therefore suits only listeners or senders that are known to sign every message, for example a link with a partner. The following expression applies it only to mail from one network:

```json
{
  "dkimVerify": {
    "match": {"0": {"if": "is_ip_in_cidr(remote_ip, '198.51.100.0/24')", "then": "strict"}},
    "else": "relaxed"
  }
}
```

To act on the sender domain's own policy for unauthenticated mail, use [DMARC](/docs/mta/authentication/dmarc) verification instead. That policy combines DKIM with SPF and alignment.

## Ignored signatures

Some signatures are treated as if they were absent, with a result of `neutral`:

- Signatures that use RSA with SHA-1 (`a=rsa-sha1`), and RSA signatures made with keys shorter than 1024 bits. [RFC 8301](https://www.rfc-editor.org/rfc/rfc8301) requires verifiers to reject both. Ed25519 ([RFC 8463](https://www.rfc-editor.org/rfc/rfc8463)) and RSA-SHA256 signatures are verified.
- Signatures that carry the `l=` tag, while [`dkimStrict`](/docs/ref/object/sender-auth#dkimstrict) is enabled.

The `l=` tag needs a word of explanation. It limits the signature to the first part of the body, so content appended after that part leaves the signature valid. An attacker can therefore add text or links to a legitimately signed message without breaking its signature. The `dkimStrict` setting guards against this, and it is <!-- default:SenderAuth.dkimStrict as=enabled -->enabled<!-- /default --> by default. It also applies to ARC message signatures that carry the tag. Disabling `dkimStrict` makes Stalwart evaluate such signatures as well.

## Results

Each signature has its own outcome: `pass`, `fail`, `neutral`, `temperror` or `permerror`. An unsigned message has the result `none`. A message has passed DKIM when at least one of its signatures passes. The domains of the passing signatures are recorded in the `Authentication-Results` header, and system Sieve scripts at DATA can read them as `env.dkim.domains` ([Variables](/docs/sieve/variables)).

When the message carries DKIM2 signatures, they are verified in the same step, as described in [DKIM2](/docs/mta/authentication/dkim/dkim2#verification).

When a signature fails and its domain asks for reports, Stalwart sends that domain a DKIM failure report ([DKIM reports](/docs/mta/reports/dkim)).
