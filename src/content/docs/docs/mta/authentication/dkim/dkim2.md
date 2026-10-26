---
title: "DKIM2"
description: "DKIM2 signatures: what they add over DKIM, the RSA, Ed25519 and post-quantum ML-DSA-44 and Ed25519 algorithms, how Stalwart signs and verifies them, their DNS records, and how DKIM2 protects against forged delivery status notifications."
sidebar_position: 4
---

[DKIM2](https://datatracker.ietf.org/doc/draft-ietf-dkim-dkim2-spec/) is a successor to DKIM. Like DKIM, it lets a domain sign a message so that receivers can verify who sent it and that it was not altered. DKIM2 goes further in three ways.

First, each DKIM2 signature covers the SMTP envelope: the `MAIL FROM` and `RCPT TO` of the hop. A receiver can therefore tell whether a message was addressed to it, or whether it was copied and replayed to recipients it was never sent to. A DKIM signature cannot show this, because it covers only the message.

Second, every system that handles the message adds its own signature. Together, the signatures form a chain of custody from the author's server to the final recipient. A system that modifies the message records the changes, so that the earlier signatures can still be verified. The chain also lets a server check that a delivery status notification really concerns a message it sent.

Third, DKIM2 ties the signature to the author. The `From` header field of a message must be what the specification calls Authentic: its domain must be the signing domain of the signature that covers it, or a subdomain of that domain. A message whose chain verifies therefore carries a signature by the domain of its author, or by a parent domain of it.

DKIM2 uses two header fields:

- `DKIM2-Signature` holds a signature. The envelope of the hop is in its `mf=` and `rt=` tags, the signing domain in `d=`, a timestamp in `t=`, optional flags in `f=`, and the selectors, algorithms and signature values in `s=`.
- `Message-Instance` records the hashes of the message at a point in its journey. For a system that changed the message, it also records how to recreate the previous version.

Stalwart signs and verifies DKIM2 alongside DKIM. The two are independent: a message can carry both kinds of signature, and receivers that do not support DKIM2 ignore the DKIM2 header fields.

## Signing keys

DKIM2 keys are [DkimSignature](/docs/ref/object/dkim-signature) objects. They are found in the WebUI under <!-- breadcrumb:DkimSignature --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg> Domains › DKIM Signatures<!-- /breadcrumb:DkimSignature -->. There are three DKIM2 variants, and each selects a signature algorithm. The algorithm determines the name in the signature and the key type in the DNS record of the public key:

| Variant | Algorithm in `s=` | Key type in DNS (`k=`) |
|---|---|---|
| `Dkim2RsaSha256` | `rsa-sha256` | `rsa` |
| `Dkim2Ed25519Sha256` | `ed25519-sha256` | `ed25519` |
| `Dkim2MlDsa44Ed25519Sha512` | `mldsa44-ed25519-sha512` | `mldsa44-ed25519-sha512` |

The variants share the fields `domainId`, `selector`, `privateKey` and `stage` with DKIM keys ([Signing](/docs/mta/authentication/dkim/sign#defining-a-key-manually)). [Choosing an algorithm](#choosing-an-algorithm) compares the three algorithms.

All active DKIM2 keys of the signing domain sign a message together. Stalwart adds a single `DKIM2-Signature`, and its `s=` tag holds one entry for each key, with the key's selector, algorithm and signature value. The specification calls this mechanism algorithmic dexterity. A verifier checks every entry whose algorithm it implements. A signature that combines a widely supported algorithm with a newer one can therefore still be verified by receivers that lack the newer one.

The specification limits what one signature may hold: at most two entries with the same algorithm, and no selector twice. A domain with three active keys of the same variant therefore gets no DKIM2 signature. The failure is logged as `dkim2.signing-failed`, with the reason `DKIM2-Signature i=<n> has more selectors than allowed`. The DKIM signatures of the domain are not affected.

Two fields are specific to DKIM2 keys. The first, [`instanceHashes`](/docs/ref/object/dkim-signature#instancehashes), selects the hash algorithms of the `Message-Instance` header fields that Stalwart adds: SHA-256, SHA-512 or both, by default <!-- default:DkimSignature.instanceHashes -->`sha256`<!-- /default -->. A message receives one `Message-Instance` for all keys, so it carries every hash algorithm configured on any active DKIM2 key of the domain. The choice is independent of the signature algorithm. Verifiers are required to implement both hash algorithms, so either choice can be verified.

The second, [`flags`](/docs/ref/object/dkim-signature#flags), adds requests to the `f=` tag of the signature. The only request available is `feedback`. It asks later handlers for feedback about how the message is handled, although the specification does not yet define what that feedback is or where it is sent. The flags of all active DKIM2 keys of the domain are combined in the signature. The `exploded` flag is not configured, because Stalwart sets it itself when it applies ([Recipients and copies](#recipients-and-copies)).

The following object defines an Ed25519 DKIM2 key whose `Message-Instance` header fields carry both hashes:

```json
{
  "@type": "Dkim2Ed25519Sha256",
  "domainId": "<Domain id>",
  "selector": "dkim2-ed-2026",
  "privateKey": {"@type": "File", "filePath": "/etc/stalwart/dkim/dkim2-ed-2026.key"},
  "instanceHashes": {"sha256": true, "sha512": true},
  "stage": "active"
}
```

### Automatic key management

[Automatic key management](/docs/mta/authentication/dkim/sign#automatic-key-management) does not create DKIM2 keys on its own. It creates them only when their types are listed in the domain's [`algorithms`](/docs/ref/object/domain#algorithms), which by default contains only <!-- default:Domain.algorithms -->`Dkim1Ed25519Sha256` and `Dkim1RsaSha256`<!-- /default -->. Adding `Dkim2Ed25519Sha256`, `Dkim2RsaSha256` or `Dkim2MlDsa44Ed25519Sha512` to the list makes Stalwart generate, publish and rotate a key of each listed type, in the same way as the DKIM keys ([DKIM key rotation](/docs/domains/dkim-rotation)). With the default selector template, the selectors read `v2-ed25519-<date>`, `v2-rsa-<date>` and `v2-mldsa44-ed25519-<date>`.

## Choosing an algorithm

The three algorithms differ in how widely verifiers implement them, in what they protect against, and in the space they take in every message. The size of the signature value shows the last difference most clearly:

| Algorithm | Signature value in each `DKIM2-Signature` |
|---|---|
| RSA-SHA256, 2048-bit key | 344 base64 characters |
| Ed25519-SHA256 | 88 base64 characters |
| MLDSA44-Ed25519-SHA512 | About 3,300 base64 characters |

Support among verifiers is still settling. RSA-SHA256 is the only algorithm that the [DKIM2 DNS specification](https://datatracker.ietf.org/doc/draft-ietf-dkim-dkim2-dns/) currently requires every verifier to implement. Ed25519 has much shorter keys and signatures. The DNS specification asks verifiers to implement it, and announces that it will become mandatory once DKIM2 is complete. The DKIM2 specification itself requires verifiers to implement all three algorithms. Until that requirement holds for every deployed verifier, an Ed25519 key together with an RSA key gives signatures that every DKIM2 verifier can check.

MLDSA44-Ed25519-SHA512 is a post-quantum composite algorithm, defined in [draft-ietf-lamps-pq-composite-sigs](https://datatracker.ietf.org/doc/draft-ietf-lamps-pq-composite-sigs/). It signs the message with two algorithms at once. The first is ML-DSA-44, the module-lattice signature scheme standardised in FIPS 204. The second is Ed25519. Both sign a SHA-512 hash of the `Message-Instance` and `DKIM2-Signature` header fields that every DKIM2 signature covers. The signature value is the ML-DSA-44 signature followed by the Ed25519 signature, and it verifies only when both parts do.

Each half protects against a different threat. ML-DSA protects against a quantum computer able to break RSA and elliptic-curve signatures. The Ed25519 half protects against a weakness yet to be found in ML-DSA. A forger therefore has to break both algorithms. The SHA-512 in the name is the hash used by the signature. It does not change the `Message-Instance` hashes, which `instanceHashes` selects.

The cost of the composite algorithm is size. Its signature value is almost forty times that of Ed25519, and it is repeated in every `DKIM2-Signature` that uses it: once for each hop that signs with it, and once in the copy for each Bcc recipient ([Recipients and copies](#recipients-and-copies)). Its public key record is about 1,830 characters long.

A verifier that does not implement an algorithm disregards the entries that use it. A signature whose only entry uses the composite algorithm therefore cannot be verified by such a receiver, and the message reaches it without a valid chain. For this reason, a composite key belongs next to an Ed25519 or RSA key of the same domain. Each signature then carries both entries. Verifiers that implement the composite algorithm check both, and the others check the classical entry. Choose the composite key when signatures must remain unforgeable against quantum attacks on RSA and Ed25519, and the larger messages and DNS record are acceptable. For other domains, Ed25519 and RSA are enough.

## Signing

DKIM2 uses the same decision as DKIM about which messages are signed and by which domain: the [`dkimSignDomain`](/docs/ref/object/mta-stage-data#dkimsigndomain) expression ([Signing domain](/docs/mta/authentication/dkim/sign#signing-domain)). Every active DKIM2 key of the selected domain signs the message, next to its DKIM keys.

### Conditions for a DKIM2 signature

DKIM2 places requirements on the signer that DKIM does not. Stalwart signs only messages whose signature would be valid. A message that fails one of the following conditions is sent with its DKIM signatures and without a new DKIM2 signature:

- The signing domain must be the domain of the envelope sender, or a parent domain of it, because a verifier checks every signature's `d=` against its `mf=`. Otherwise the reason is `DKIM2-Signature i=<n> MAIL FROM and d= do not match`.
- For a new message, and for a message whose `From` header field changed on the server, the `From` header field must hold a single address whose domain is the signing domain or a subdomain of it. Otherwise the reason is `DKIM2-Signature i=1 matching From is not authentic`. The default `dkimSignDomain` signs with the domain of the envelope sender. A user who sends with a `From` address outside that domain and its subdomains therefore gets no DKIM2 signature.
- A message that already carries DKIM2 header fields, such as one that Stalwart relays or forwards, is added to its chain only when the chain passed [verification](#verification) on arrival. When the chain is broken, its header fields are removed before the message is relayed ([Broken chains](#broken-chains)).

These refusals are logged at the `debug` level as one of the [DKIM2 events](/docs/ref/events#dkim2), `dkim2.custody-broken` or `dkim2.chain-invalid`, with the reason in their details. A refusal does not stop the delivery of the message.

A signature can also fail because of the configuration of the key. Examples are an invalid key, selector or signing domain, too many entries in one signature, or an error in the cryptographic operation. These failures need the attention of the administrator, so they are logged at the `warn` level as `dkim2.signing-failed`, with the exact error as its cause. The message is then also sent without a DKIM2 signature.

Sometimes Stalwart extends a chain for a message that was changed on the server, for example by a milter or a Sieve script. In that case, the new `Message-Instance` header field carries recipes that recreate the version Stalwart received, so the earlier signatures can still be verified.

### Broken chains

Stalwart changes the DKIM2 header fields of a message only when DKIM2 keys sign it. Without a DKIM2 key for the message, its `DKIM2-Signature` and `Message-Instance` header fields are passed on unchanged, whether the chain is valid or broken. This is how a server that does not implement DKIM2 would pass them on. It applies to relayed messages, to messages that Sieve scripts redirect, and to messages whose envelope or content was changed on the server.

When DKIM2 keys do sign the message, the specification constrains what Stalwart may send. Section 13 forbids a signer to send a message that carries DKIM2 header fields but is not Validly Signed to another system, unless the two systems have a prior arrangement. The reason is that the receiver can see that the chain is broken, and that this was already apparent to the previous hop.

Stalwart therefore removes a broken chain when DKIM2 keys sign the message and at least one recipient is on another system. A chain counts as broken in three situations:

- [Verification](#verification) gives `fail` or `permerror`.
- Verification gives a `temperror` that does not defer the message (see below).
- A change made on the server leaves the chain unable to verify.

Every `DKIM2-Signature` and `Message-Instance` header field is removed once, before the message is stored. The recipients on this server therefore also receive the message without its original DKIM2 header fields. The `dkim2` entry of the `Authentication-Results` header still records the result of verification, so the local recipients can see that the message arrived with a broken chain.

What Stalwart sends next depends on the `From` header field. When it is Authentic for the signing domain, Stalwart signs the copies it relays as a new message, with `i=1` and `m=1`, and a new chain of custody starts at Stalwart. Otherwise the copies are sent with no DKIM2 header fields at all. No setting provides for an out-of-band arrangement that would allow the broken chain to be passed on.

A message whose recipients are all local is not relayed, so it keeps its DKIM2 header fields unchanged. A broken chain is not a reason to refuse the message at SMTP, because section 13 leaves the decision to accept it to local policy.

A temporary failure needs separate treatment. When a public key lookup fails temporarily, the chain cannot be verified and has the result `temperror`, and Stalwart cannot tell whether to extend it or remove it. How it proceeds depends on the [`dkimVerify`](/docs/ref/object/sender-auth#dkimverify) mode, the same setting that decides whether DKIM failures refuse a message:

- When `dkimVerify` is `strict`, DKIM2 keys sign the message and at least one recipient is on another system, Stalwart replies `451 4.7.5 Unable to verify DKIM2 signatures, try again later.` at DATA. The sender then retries once the lookup can succeed, as section 13.2 recommends. The reply is decided before the spam filter, milters and Sieve scripts run, so a retried message never repeats their actions, such as a redirect.
- Otherwise the message is accepted, and the spam filter adds the `DKIM2_TEMPFAIL` tag. When DKIM2 keys sign the message, the chain is then treated as broken, as described above. When none do, the header fields are passed on unchanged.

### Redirected messages

A message that a Sieve script redirects is relayed like any other message with a chain. The verification result it carries depends on the kind of script. A redirect by a [system Sieve script](/docs/sieve/interpreter/trusted) at the DATA stage carries the DKIM2 verification result of the incoming message. A redirect by a [user's Sieve script](/docs/sieve/interpreter/untrusted) verifies the chain before the message is queued. When DKIM2 keys sign the redirected message, a valid chain is extended with a new hop, and a broken one is handled as described in [Broken chains](#broken-chains). Without a DKIM2 key, the redirected message keeps its DKIM2 header fields unchanged.

### Reports and notifications

Reports and delivery status notifications that Stalwart generates are new messages. The message they concern is only attached as a MIME part, so they carry no chain of their own. They are signed with `i=1` by the domain that their own `dkimSignDomain` setting selects ([Signing domain](/docs/mta/authentication/dkim/sign#signing-domain)), and only when their `From` header field is Authentic for that domain. Otherwise they are sent without DKIM2 header fields.

### Recipients and copies

Stalwart adds one signature for each group of recipients. The recipients named in the message's `To` and `Cc` headers share one signature. Each recipient not named there, a Bcc recipient, receives a copy with a signature of its own, so that its address is not disclosed to the others.

A message may also be sent on to several recipients after it already has a chain. Its new signature then carries the `exploded` flag, even when the copies differ. The flag tells receivers that several copies are expected. Receivers use it to tell a legitimate expansion from DKIM replay, an attack in which a third party resends a validly signed message to large numbers of recipients. The first signature of a message never carries the flag.

A Sieve script that produces more than one copy of a message has the same effect, whether it redirects the message several times or redirects it and also keeps it. Every redirected copy is signed with the flag, and the kept copy counts towards the copies. This applies to [system scripts](/docs/sieve/interpreter/trusted) at the DATA stage and to [users' scripts](/docs/sieve/interpreter/untrusted) alike. A single redirect without keep is not an expansion and carries no flag. Without a DKIM2 key for the message, nothing is added ([Broken chains](#broken-chains)).

## DNS records

DKIM2 public keys are published in the same place and format as DKIM keys: a TXT record at `<selector>._domainkey.<domain>` that begins with `v=DKIM1`. The version stays `DKIM1` because the DKIM2 DNS specification reuses the DKIM key record without changing it. Each DKIM2 key has its own selector, and no other kind of DNS record is needed. With automatic DNS management, the records are published together with those of the DKIM keys. Without it, they are listed in the domain's [`dnsZoneFile`](/docs/ref/object/domain#dnszonefile). The records of the three types read:

```text
v2-rsa-20260101._domainkey.example.org.              IN TXT "v=DKIM1; k=rsa; h=sha256; p=<base64 key>"
v2-ed25519-20260101._domainkey.example.org.          IN TXT "v=DKIM1; k=ed25519; h=sha256; p=<base64 key>"
v2-mldsa44-ed25519-20260101._domainkey.example.org.  IN TXT "v=DKIM1; k=mldsa44-ed25519-sha512; p=<base64 key>"
```

The `k=` tag names the key type. A verifier checks it against the algorithm of the signature entry, and a mismatch fails with `DKIM2-Signature i=<n> public key <selector> algorithm mismatch`. The `h=` tag on the RSA and Ed25519 records is retired in DKIM2, and DKIM2 verifiers ignore it.

The composite key needs more room than the others. Its `p=` value is the 1,312-byte ML-DSA-44 public key followed by the 32-byte Ed25519 public key, in base64. The record is about 1,830 characters long, so it must be published as several strings of at most 255 characters within one TXT record, as the RSA record is. The zone file in `dnsZoneFile` lists it already split.

:::caution
Not every DNS provider accepts a TXT record of this length. Before adding a composite key, check that the provider of the zone supports it, including when the records are published through [automatic DNS management](/docs/domains/dns-records).
:::

[Automatic key management](#automatic-key-management) generates composite keys. A composite key defined by hand needs its private key in the PKCS#8 form that draft-ietf-lamps-pq-composite-sigs defines for the algorithm, in PEM or bare base64, and OpenSSL is the recommended tool to create one. OpenSSL has no composite algorithm, but it does not need one. This PKCS#8 key is a fixed 19-byte header followed by the 32-byte ML-DSA-44 seed and the 32-byte Ed25519 seed, and any random seeds form a valid key. The following command writes a key in bare base64 to `composite.key`:

```sh
{ printf '3051020100300a06082b060105050706270440' | xxd -r -p; openssl rand 64; } | openssl base64 -A > composite.key
```

As for the other types, the server derives the public key from the private key and shows it in [`publicKey`](/docs/ref/object/dkim-signature#publickey), so the public key needs no command of its own.

## Verification

DKIM2 signatures are verified at the [DATA stage](/docs/mta/inbound/data#order-of-processing), after DKIM and ARC. Verification runs when the message carries DKIM2 header fields, including malformed ones, and one of the following holds: [`dkimVerify`](/docs/ref/object/sender-auth#dkimverify) is enabled, [`dmarcVerify`](/docs/ref/object/sender-auth#dmarcverify) is enabled, or DKIM2 keys sign the message. Stalwart needs the result to decide whether to extend a chain or remove it. A message that DKIM2 keys sign is therefore verified even when DKIM and DMARC verification are disabled.

Verification determines whether the message is Validly Signed in the sense of the specification. It checks the following, in order, and stops at the first failure:

1. Every `DKIM2-Signature` and `Message-Instance` header field is well formed, and both are numbered without gaps.
2. No signature is more than 14 days old or more than one day in the future.
3. The `MAIL FROM` of the session equals the `mf=` of the most recent signature, and every `RCPT TO` appears in its `rt=`, so a message replayed to recipients that the last signer did not address fails.
4. The signing domain of every signature matches its `mf=`, and each hop received the message from the previous one: its `mf=`, or its signing domain, matches a recipient of the signature before it.
5. Every signature entry whose algorithm Stalwart implements verifies with its public key. Stalwart implements all three algorithms. An entry with an algorithm it does not implement is skipped, and a signature with no other entry fails with `DKIM2-Signature i=<n> has no valid signature algorithms`.
6. The hashes of the message match the most recent `Message-Instance`, and the recipes of each instance recreate an earlier version whose hashes match the instance before it.
7. Every `From` header field, current or recreated, is Authentic.

Verification has four possible results:

- `pass`: every check succeeded.
- `fail`: a signature or hash does not match.
- `permerror`: a header field, the chain or a public key record is invalid or missing.
- `temperror`: a public key could not be fetched.

The result is recorded in the `Authentication-Results` header as a `dkim2` entry. A failure carries its reason as a comment, in the wording that the specification recommends, for example `DKIM2-Signature i=2 signature expired`. Verification is logged as `smtp.dkim2-pass` or `smtp.dkim2-fail` ([SMTP events](/docs/ref/events#smtp)). A failure also carries a nested event from the [DKIM2 events](/docs/ref/events#dkim2), such as `dkim2.timestamp-invalid` or `dkim2.custody-broken`, whose details hold the reason in the same wording as the `Authentication-Results` comment.

A passing chain contributes to DMARC. The signing domain of its first signature, that of the originator, is passed to [DMARC](/docs/mta/authentication/dmarc) together with the DKIM results, and it counts for alignment like the domain of a passing DKIM signature. A chain that fails does not by itself cause the message to be refused, because section 13 of the specification leaves acceptance to local policy. The result decides instead how the message is relayed, and in `strict` mode a `temperror` can defer it ([Broken chains](#broken-chains)). DKIM2 signatures do not count towards the passing DKIM signature that the `strict` mode of `dkimVerify` requires ([Verifying](/docs/mta/authentication/dkim/verify)).

## Delivery status notifications

A server that receives a message it cannot deliver sends a delivery status notification (DSN) to the envelope sender. Anyone can forge such notifications, and spammers use them to deliver unwanted mail disguised as bounces. DKIM2 makes forgery detectable. A DSN is itself signed, and it returns the signed message it reports, so the original sender can check that the message was one it sent.

When `dkimVerify` is enabled, as it is with its default of <!-- default:SenderAuth.dkimVerify -->`relaxed`<!-- /default -->, Stalwart applies this check. It examines every DSN signed with DKIM2 whose returned message, or returned header fields, also carry a DKIM2 signature. The DSN is refused with `550 5.7.1 DSN rejected due to DKIM2 verification failure.` in the following cases:

- The chain of the DSN does not verify.
- The chain of the returned message does not verify.
- The signing domain of the DSN is not the domain of a recipient of the returned message, or a parent domain of it.
- The last signature of the returned message was not made by the domain of the address that receives the DSN, or by a parent domain of it.

A public key lookup may fail temporarily, so that the verification cannot be completed. The outcome then follows the mode of `dkimVerify`. In `strict` mode, the DSN is refused with `451 4.7.5 Unable to verify DKIM2 DSN, try again later.`, so that the sender retries. Both this reply and the `550` are those that section 16.3 of the specification recommends. In `relaxed` mode, the DSN is accepted, and its `temperror` is logged as `smtp.dkim2-fail` like that of any other message.

Each refusal, with either reply, is logged as `smtp.dkim2-dsn-rejected` ([SMTP events](/docs/ref/events#smtp)), whose details hold the reason.

## Testing

The `TroubleshootDmarc` [action](/docs/management/tasks-actions/actions) evaluates the authentication of a message as the MTA would receive it, without delivering it. It takes a given IP address, EHLO name, envelope sender and recipients (`rcptTo`). Its result includes the DKIM2 outcome in `dkim2Result` and `dkim2Pass`, next to the SPF, DKIM, ARC and DMARC results.
