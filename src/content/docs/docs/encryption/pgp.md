---
sidebar_position: 7
title: "OpenPGP"
description: "How Stalwart encrypts with OpenPGP keys: key structure, supported versions and algorithms, how subkeys, packet formats and ciphers are chosen, post-quantum keys, the PGP/MIME output, exporting a key and key validation errors."
---

OpenPGP ([RFC 9580](https://www.rfc-editor.org/rfc/rfc9580)) is the open standard derived from PGP for encrypting and signing data with public keys. Stalwart uses it whenever the key it encrypts for is an OpenPGP key: for [encryption at rest](/docs/encryption/at-rest) when a user registers one, and for the [encryption gateway](/docs/encryption/gateway) when a recipient's [external key](/docs/encryption/external-keys) is one. This page describes what happens at that point, for readers who need to know which keys work, which clients can read the result and why.

## Hybrid encryption

An OpenPGP message is built in two layers. For each message, the server generates a random session key and encrypts the message with it, using AES. It then encrypts the session key with the recipient's public key and places the result in a Public-Key Encrypted Session Key packet (PKESK) at the front of the message. A message for several keys carries one PKESK per key, each holding the same session key. The recipient's client finds the packet for its key, recovers the session key with the private key, and decrypts the message.

The encrypted message itself is a Symmetrically Encrypted Integrity Protected Data packet (SEIPD), which also lets the client detect any modification. It exists in two versions, described in [Packet format and ciphers](#packet-format-and-ciphers).

## Key structure

What users call an OpenPGP key is a bundle, technically a certificate. It holds:

- A primary key, which identifies the bundle by its fingerprint and signs everything else in it. It is normally a signing key and is rarely used for encryption.
- One or more subkeys, which do the actual work. Encryption is usually done with a dedicated encryption subkey.
- User IDs, typically `Name <address>`, which tie the key to email addresses.
- Self-signatures, made by the primary key over the user IDs and subkeys. They carry the key's properties: the key flags that say what each subkey may be used for, the expiry date, and the formats and algorithms the owner's software supports.

The server relies on the self-signatures for everything it decides, and ignores any part of the bundle that is not validly signed.

## Supported keys

Version 4 keys, the kind most software creates today, and version 6 keys, introduced by RFC 9580, are accepted. Version 3 keys and the version 5 keys of LibrePGP are refused.

The following encryption algorithms are supported:

| Algorithm | Key versions | Notes |
|---|---|---|
| RSA | 4 and 6 | 2048 to 8192 bits. Keys shorter than 3072 bits show the `weakRsa` warning. |
| ECDH on NIST P-256, P-384 and P-521 | 4 and 6 | |
| ECDH on Curve25519 (legacy format) | 4 | The format used by GnuPG and most existing keys. Shown as `X25519` in `keyType`. |
| X25519 and X448 | 4 and 6 | The native formats of RFC 9580. |
| ML-KEM-768 with X25519 | 4 and 6 | Post-quantum hybrid ([RFC 9980](https://www.rfc-editor.org/rfc/rfc9980)). |
| ML-KEM-1024 with X448 | 6 | Post-quantum hybrid. |

ElGamal keys and Brainpool curves are refused, as are the experimental Kyber keys of LibrePGP. The primary key must use a signing algorithm: RSA, ECDSA, EdDSA, Ed25519, Ed448 or, on version 6 keys, ML-DSA. DSA and SLH-DSA primary keys are refused.

### Usable subkeys

The server uses every encryption key in the bundle that meets all of these conditions:

- Its key flags allow encryption, either of communications or of storage. A subkey without key flags is not used.
- It has a valid binding signature from the primary key, and it has been neither revoked nor expired. A subkey expires at the earlier of its own expiry date and the primary key's.
- Its algorithm is supported.

The primary key is also used when it is an RSA key whose flags allow encryption. Every usable key receives its own PKESK, up to 16 per bundle, so the client can decrypt with whichever of the private keys it holds. Unusable subkeys are skipped silently, and an error is reported only when no usable key remains.

Self-signatures must themselves be acceptable. Signatures made with SHA-1 after 1 February 2023, any SHA-1 signature on a version 6 key, signatures without a creation time or dated in the future, expired signatures and signatures with unknown critical subpackets are not accepted, which can leave a key with `The key has no valid self-signature.`

A user or administrator can paste several bundles into one key, one after another. Each message is then encrypted for the usable keys of every bundle, and bundles that are invalid, for example because they expired, are skipped as long as one bundle remains usable. External keys are limited to a single valid bundle.

The expiry date that the server reports for a key is the latest expiry of its encryption keys, or none if any of them never expires.

## Packet format and ciphers

The two versions of the encrypted data packet differ in how they protect the message:

- SEIPD version 1 encrypts with AES in CFB mode and appends a SHA-1 checksum of the content. Every OpenPGP implementation reads it.
- SEIPD version 2 uses authenticated encryption (AEAD), with AES in OCB or GCM mode, which authenticates every chunk of the message instead of relying on a final checksum. Only implementations that follow RFC 9580 read it.

A key announces whether its owner's software reads version 2 through the Features subpacket of its self-signature; a version 6 key without that subpacket is assumed to read it. The server writes version 2 only when every key the message is encrypted for supports it. A single key without support, among all the keys of a PublicKey, makes the whole message version 1, with version 3 PKESKs, so that every recipient can read it. Typical keys created by GnuPG and Thunderbird do not announce version 2 and therefore receive version 1.

The cipher follows the keys' preferences, as RFC 9580 requires:

- For version 1, the server uses AES-256 when every key lists it among its preferred ciphers or is post-quantum, and AES-128 otherwise.
- For version 2, the server walks the cipher and AEAD mode preferences of the first key and takes the first pair that every key accepts. AES-128 with OCB, which every RFC 9580 implementation must support, is the fallback.
- For version 2 with any post-quantum key, the server uses AES-256, with OCB, or with GCM in the rare case that only GCM is accepted by every key.

There is no setting that changes these choices. No compression is applied.

## Post-quantum keys

The public-key algorithms in common use today, RSA and elliptic curves, could be broken by a sufficiently large quantum computer. No such computer exists yet, but encrypted mail that an adversary stores today could be decrypted once one does. Post-quantum algorithms resist this. RFC 9980 adds ML-KEM to OpenPGP in hybrid form: each post-quantum key combines ML-KEM with X25519 or X448, so that an attacker has to break both to read the message.

A bundle can contain a classical and a post-quantum encryption subkey side by side, so that clients without post-quantum support can still read mail. Encrypting to both would let anyone who breaks the classical key read the message, so the server chooses one or the other:

- When every bundle in the key has a post-quantum encryption key, the message is encrypted to the post-quantum keys only.
- Otherwise, each bundle that has a classical encryption key is encrypted to its classical keys only, and a bundle with only post-quantum keys is encrypted to those.

Few mail clients can decrypt post-quantum OpenPGP messages yet, as described in [Client support](#client-support). A user whose keys all have a post-quantum subkey will be unable to read new messages in such clients, even when the keys also have classical subkeys. The `postQuantum` capability shows that a key includes a post-quantum encryption key, and the `postQuantumOnly` warning that a bundle has no classical encryption key at all.

## Client support

Most OpenPGP software in use today implements the older RFC 4880 and its extensions, not all of RFC 9580. Thunderbird, GnuPG in its default configuration and mail clients built on them cannot read version 6 keys, native X25519 and X448 keys, SEIPD version 2 messages or post-quantum keys; recent GnuPG 2.5 releases read them only when the RFC 9580 features are enabled explicitly. Clients built on Sequoia, rPGP, OpenPGP.js or GopenPGP read all of them.

The server's choices follow the key, so these formats appear only when the key asks for them: a version 4 key with RSA, NIST curve or legacy Curve25519 subkeys, which is what GnuPG and Thunderbird create, receives SEIPD version 1 messages that every client reads, unless the key itself announces support for version 2. A user who registers a version 6 or post-quantum key needs a client that supports it. The server shows no warning for this, so the `keyType` field, which names the key version and algorithms, is the place to check.

## Message format

The server writes PGP/MIME messages ([RFC 3156](https://www.rfc-editor.org/rfc/rfc3156)). The original header fields stay outside, except the MIME fields that describe the body, which move into the encrypted part together with any [header protection](/docs/encryption/at-rest#header-protection). The body is replaced with the following structure:

```text
Content-Type: multipart/encrypted; protocol="application/pgp-encrypted";
	boundary="=_<boundary>"

OpenPGP/MIME message (Automatically encrypted by Stalwart)

--=_<boundary>
Content-Type: application/pgp-encrypted

Version: 1

--=_<boundary>
Content-Type: application/octet-stream; name="encrypted.asc"
Content-Disposition: inline; filename="encrypted.asc"

-----BEGIN PGP MESSAGE-----
...
-----END PGP MESSAGE-----

--=_<boundary>--
```

The encrypted part contains the original MIME body, with its attachments, as a single literal data packet. With the gateway's `baseline` header protection, version 2 messages also carry a padding packet that rounds the content to a multiple of 512 bytes.

## Export the public key

Stalwart never generates or receives private keys, so the key pair is created outside the server, by the user's mail client or by a tool such as GnuPG, and only the public key is given to the server. It is exported in ASCII-armoured form: a text block between `-----BEGIN PGP PUBLIC KEY BLOCK-----` and `-----END PGP PUBLIC KEY BLOCK-----` lines. The following GnuPG command exports the key for an address:

```bash
$ gpg --armor --export jane@example.com > jane.asc
```

In Thunderbird, the OpenPGP Key Manager under the account's End-to-End Encryption settings exports a public key to a file. The `key` field also accepts a binary key encoded in base64.

## Key validation errors

The server checks a key when it is saved, and refuses it with one of the following errors on the `key` field:

| Error | Cause |
|---|---|
| `No valid public key found.` | The text is empty, or the OpenPGP data contains no key. |
| `The ASCII armor or PEM encoding is malformed.` | The armour lines or the base64 content are damaged. |
| `The OpenPGP key data is malformed.` | The key packets are damaged, or the text is not a key at all. |
| `Secret key material is not accepted, upload the public key only.` | A private key block was pasted. |
| `Cannot mix OpenPGP keys and S/MIME certificates.` | The text contains both kinds. |
| `Unsupported OpenPGP key version, only v4 and v6 keys are supported.` | The key is a version 3 or version 5 key. |
| `The primary key algorithm is not supported.` | The primary key is not a supported signing key, for example a DSA key, or a subkey uses DSA or SLH-DSA. |
| `The encryption key algorithm is not supported.` | No encryption key uses a supported algorithm, or the algorithm is not allowed for the key version, such as an ML-DSA primary key on a version 4 key. |
| `ElGamal keys are not supported.` or `Brainpool curves are not supported.` | The only encryption keys use an excluded algorithm. |
| `RSA keys must be between 2048 and 8192 bits long.` | The RSA key is outside the accepted range. |
| `The public key is invalid.` | The key material itself is invalid, for example a point that is not on its curve. |
| `The key has no valid self-signature.` | No acceptable self-signature binds the key, as described in [Usable subkeys](#usable-subkeys). |
| `The key or certificate has been revoked.` | The primary key has been revoked. |
| `The key or certificate has expired.` | The primary key, or every encryption subkey, has expired. |
| `The key contains no key usable for encryption.` | No subkey is flagged for encryption, as with a signing-only key. |
| `The key is too large.` | The key contains more than 4096 packets. |

When a bundle has several problems, only one of them is reported. External keys add one more check: `An external public key must hold a single key or certificate.`
