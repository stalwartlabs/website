---
sidebar_position: 1
title: "DKIM overview"
description: "How DKIM signatures work, which messages Stalwart signs, how inbound signatures are verified, and how signing keys are generated, published and rotated."
---

A receiving server sees only the domains that a message claims to come from, and claims are easy to forge. DomainKeys Identified Mail (DKIM), defined in [RFC 6376](https://www.rfc-editor.org/rfc/rfc6376), lets a domain take responsibility for the messages sent in its name, in a way that receivers can check. The sending server signs the message body and a selected set of header fields with a private key, and it adds the signature to the message in a `DKIM-Signature` header. Receiving servers retrieve the matching public key from DNS. With that key, they confirm that the signed content has not been modified in transit.

Stalwart takes part in DKIM on both sides. It signs the messages its users send, and it verifies the signatures on the messages it receives. For domains that use automatic key management, Stalwart also generates the signing keys, publishes them in DNS and replaces them on a schedule.

## Signatures, selectors and alignment

Two tags of the `DKIM-Signature` header identify the key that produced the signature. The `d=` tag names the signing domain, and the `s=` tag names a selector. The receiving server combines the two and looks up the public key in the TXT record at `<selector>._domainkey.<domain>`. Because each key has its own selector, a domain can publish several keys at the same time, for example one per algorithm, or an old and a new key during a key change. The following header is an abbreviated example:

```text
DKIM-Signature: v=1; a=ed25519-sha256; c=relaxed/relaxed; d=example.com;
	s=v1-ed25519-20260101; h=From:To:Date:Subject:Message-ID;
	bh=<body hash>; b=<signature>
```

The signature covers a hash of the body, in the `bh=` tag, and the header fields listed in `h=`. Before hashing, both are canonicalised, as the `c=` tag states. Canonicalisation is a normalisation step: it makes the signature tolerant of the whitespace and line-folding changes that intermediate servers commonly apply. A signature that verifies establishes two things: that the domain in `d=` signed the message, and that the signed content is unchanged.

A valid signature does not by itself establish that the From address is authentic, because any domain can sign any message. Domain-based Message Authentication, Reporting and Conformance ([DMARC](/docs/mta/authentication/dmarc)), the policy mechanism that receivers apply to the From domain, makes this connection. A DKIM result counts towards DMARC only when the `d=` domain aligns with the From domain. A message signed by an unrelated domain therefore fails DMARC even though its signature verifies.

## Algorithms

Stalwart signs with Ed25519 ([RFC 8463](https://www.rfc-editor.org/rfc/rfc8463)) and with RSA, both combined with SHA-256. Ed25519 keys are short and fast to verify, but not every receiving server supports them. For this reason, automatic key management creates one key of each type by default, <!-- default:Domain.algorithms -->`Dkim1Ed25519Sha256` and `Dkim1RsaSha256`<!-- /default -->, and each outgoing message carries two signatures. A receiver that does not support Ed25519 ignores that signature and verifies the RSA signature instead. Generated RSA keys are 2048 bits long. RSA-SHA1 is not available for signing, because [RFC 8301](https://www.rfc-editor.org/rfc/rfc8301) declares it obsolete.

## Signing outgoing mail

The domain that signs a message is determined by the [`dkimSignDomain`](/docs/ref/object/mta-stage-data#dkimsigndomain) setting of [MtaStageData](/docs/ref/object/mta-stage-data) (found in the WebUI under <!-- breadcrumb:MtaStageData --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Session › DATA Stage<!-- /breadcrumb:MtaStageData -->). The setting is an [expression](/docs/configuration/expressions), a rule that Stalwart evaluates for each message using variables such as the sender's domain and the authenticated account. When the expression returns a domain name, Stalwart signs the message with every active key of that domain. When it returns `false`, the message is not signed.

The default expression signs a message only when the sender has authenticated and the sender's domain is hosted on the server. Messages relayed on behalf of other systems, and messages submitted without authentication, are therefore sent unsigned. To sign these messages as well, adjust the expression as described in [Signing](/docs/mta/authentication/dkim/sign#signing-domain). Messages that Stalwart generates itself, such as reports, delivery status notifications and messages sent by Sieve scripts, are not covered by this expression, because each kind has a `dkimSignDomain` setting of its own.

## Verifying incoming mail

Verification of inbound signatures is controlled by the [`dkimVerify`](/docs/ref/object/sender-auth#dkimverify) setting of [SenderAuth](/docs/ref/object/sender-auth) (found in the WebUI under <!-- breadcrumb:SenderAuth --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Inbound › Sender Authentication<!-- /breadcrumb:SenderAuth -->). It accepts one of three values and is <!-- default:SenderAuth.dkimVerify -->`relaxed`<!-- /default --> by default:

- `relaxed`: verify the signatures and record the result in the `Authentication-Results` header.
- `strict`: reject the message unless at least one signature verifies, which also rejects unsigned messages.
- `disable`: skip verification.

The verification result also feeds the DMARC check and the spam filter. Some signatures are ignored, however. The `l=` tag limits a signature to the first part of the body, so content appended after the signed part would not invalidate it. Signatures that use this tag are therefore ignored while `dkimStrict` is <!-- default:SenderAuth.dkimStrict as=enabled -->enabled<!-- /default -->, as it is by default. [Verifying](/docs/mta/authentication/dkim/verify) describes both settings.

## Signing keys

Each signing key is stored as a [DkimSignature](/docs/ref/object/dkim-signature) (found in the WebUI under <!-- breadcrumb:DkimSignature --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg> Domains › DKIM Signatures<!-- /breadcrumb:DkimSignature -->) that belongs to a [Domain](/docs/ref/object/domain). The [`dkimManagement`](/docs/ref/object/domain#dkimmanagement) setting of the domain decides who maintains the keys: Stalwart or the administrator.

With `Automatic` management, Stalwart creates a key for each algorithm listed in [`algorithms`](/docs/ref/object/domain#algorithms), by default <!-- default:Domain.algorithms -->`Dkim1Ed25519Sha256` and `Dkim1RsaSha256`<!-- /default -->. What happens next depends on whether the domain also uses [automatic DNS management](/docs/domains/dns-records). When it does, Stalwart publishes each public key before signing with it, and replaces the keys on a schedule, as described in [DKIM key rotation](/docs/domains/dkim-rotation). When it does not, the keys sign at once but are neither published nor rotated. Signatures then fail verification until the TXT records listed in the domain's [`dnsZoneFile`](/docs/ref/object/domain#dnszonefile) field are added to the zone by hand.

With `Manual` management, the administrator creates each DkimSignature, supplies the private key and publishes the DNS record, as described in [Signing](/docs/mta/authentication/dkim/sign). Manual management suits a key that must be shared with another sending system or kept in an external secret store.

## DKIM2

DKIM2 is a successor to DKIM. It extends the signature to the SMTP envelope and links the signatures added at each hop into a chain. A receiver can use the chain to determine which hop modified a message, and whether the message was delivered to the recipients it was originally addressed to. DKIM2 also requires the domain of the `From` header field to be the signing domain or a subdomain of it.

Stalwart signs and verifies DKIM2 alongside DKIM, with the same `dkimSignDomain` expression. DKIM2 keys are DkimSignature objects of type `Dkim2RsaSha256`, `Dkim2Ed25519Sha256` or `Dkim2MlDsa44Ed25519Sha512`, the last a post-quantum composite of ML-DSA-44 and Ed25519. Automatic key management creates DKIM2 keys only when these types are added to `algorithms`. [DKIM2](/docs/mta/authentication/dkim/dkim2) describes signing and verification, and the [specification](https://datatracker.ietf.org/doc/draft-ietf-dkim-dkim2-spec/) defines the protocol.
