---
sidebar_position: 8
title: "S/MIME"
description: "How Stalwart encrypts with S/MIME certificates: supported certificate keys and checks, EnvelopedData and AuthEnvelopedData, RSA, ECDH and ML-KEM key delivery, client compatibility, the output format, exporting a certificate and validation errors."
---

S/MIME ([RFC 8551](https://www.rfc-editor.org/rfc/rfc8551)) is the standard for encrypting and signing email with X.509 certificates. A certificate authority issues each certificate for an email address, and S/MIME support is built into most desktop and mobile mail clients, including Outlook, Apple Mail and Thunderbird. Stalwart uses S/MIME whenever the key it encrypts for is a certificate: for [encryption at rest](/docs/encryption/at-rest) when a user registers one, and for the [encryption gateway](/docs/encryption/gateway) when a recipient's [external key](/docs/encryption/external-keys) is one.

## Cryptographic Message Syntax

An S/MIME encrypted message is a Cryptographic Message Syntax (CMS, [RFC 5652](https://www.rfc-editor.org/rfc/rfc5652)) structure. Like OpenPGP, it works in two layers. The server generates a random content-encryption key for each message, encrypts the message with it using AES, and then delivers the content-encryption key to each recipient in a RecipientInfo, protected with the public key of the recipient's certificate. The client finds the RecipientInfo for its certificate, by the issuer and serial number that identify it, recovers the content-encryption key with its private key and decrypts the message.

How the content-encryption key is protected depends on the kind of key in the certificate:

- With an RSA key, the server encrypts the content-encryption key directly with the public key (key transport).
- With an elliptic-curve key, the server creates a one-time key pair, combines its private half with the recipient's public key to derive a shared secret, and uses that secret to wrap the content-encryption key (key agreement).
- With an ML-KEM key, the post-quantum key encapsulation mechanism produces a shared secret together with a ciphertext that only the recipient's private key can open, and that secret wraps the content-encryption key.

## Supported certificates

The following certificate keys are accepted:

| Key | Notes |
|---|---|
| RSA | 2048 to 8192 bits. Keys shorter than 3072 bits show the `weakRsa` warning. Certificates whose key is marked for RSA-OAEP are accepted, with SHA-1, SHA-256, SHA-384 or SHA-512. |
| Elliptic curve on P-256, P-384 and P-521 | |
| X25519 and X448 | Shown with the `noKnownDecryptor` warning, because no common mail client decrypts them. |
| ML-KEM-512, ML-KEM-768 and ML-KEM-1024 | Post-quantum ([RFC 9936](https://www.rfc-editor.org/rfc/rfc9936)). No common mail client decrypts them yet, and no warning says so. |

Brainpool curves and certificates with signing-only keys such as Ed25519 are refused.

A certificate must also be suitable for encryption when it is saved:

- It must be within its validity period.
- When it has a key usage extension, the extension must allow the operation the key performs: key encipherment for RSA and ML-KEM keys (or data encipherment for RSA-OAEP keys), and key agreement for elliptic-curve, X25519 and X448 keys. A certificate without the extension passes.
- When it has an extended key usage extension, the extension must include email protection or any usage. A certificate without the extension passes.

Many users have two certificates, one for signing and one for encryption; it is the encryption certificate that must be registered. The server does not check the certificate chain when a key is saved, so certificates from private authorities and self-signed certificates work for encryption at rest. The [S/MIME certificate trust](/docs/encryption/smime-trust) page describes the chain checks that the gateway applies to certificates it learns on its own.

Several certificates can be pasted one after another; the server reads the first 64 and ignores the rest. Each message is then encrypted for every valid end-entity certificate among them, and CA certificates in the text are ignored, so a certificate pasted together with its chain works; only a text that contains nothing but CA certificates is encrypted for those. Certificates that fail the checks above are skipped as long as one valid certificate remains, but a certificate that cannot be decoded, or a private key anywhere in the text, rejects the whole text. External keys are limited to a single valid end-entity certificate.

## Content encryption

CMS offers two structures for the encrypted content:

- EnvelopedData encrypts the message with AES-256 in CBC mode. Every S/MIME client can read it, but CBC does not detect modification of the ciphertext.
- AuthEnvelopedData ([RFC 5083](https://www.rfc-editor.org/rfc/rfc5083)) encrypts with AES-256 in GCM mode, an authenticated mode that detects any modification. RFC 8551 recommends it, but Apple Mail and Thunderbird before version 154 cannot read it.

The server uses EnvelopedData by default, because every client reads it. It uses AuthEnvelopedData in the following cases:

- Every certificate the message is encrypted for has an ML-KEM key. Post-quantum S/MIME always uses authenticated encryption.
- The key has `authenticatedEncryption` enabled, on a [PublicKey](/docs/encryption/at-rest#compatibility-settings) or an external key.
- For the gateway only, the recipient has announced support for both RSA-OAEP and AES-256-GCM in a signed message that the server [harvested](/docs/encryption/harvesting).

A set of certificates that mixes ML-KEM with other keys, without `authenticatedEncryption`, uses EnvelopedData with AES-256-CBC for all of them.

## Key delivery

The RecipientInfo for each certificate depends on its key and on the content encryption chosen.

For RSA certificates, the content-encryption key is encrypted with PKCS #1 v1.5 padding together with EnvelopedData, and with RSA-OAEP using SHA-256 together with AuthEnvelopedData. A certificate whose key is marked for RSA-OAEP always receives OAEP, with the hash the certificate specifies.

For elliptic-curve certificates on the NIST curves, the server uses the standard ephemeral-static Diffie-Hellman scheme of [RFC 5753](https://www.rfc-editor.org/rfc/rfc5753), with the X9.63 key derivation function using SHA-256, SHA-384 or SHA-512 for P-256, P-384 and P-521 respectively, and wraps the content-encryption key with AES-256 key wrap. Two encodings exist for the key wrap algorithm:

- The NULL encoding, the default, adds a NULL parameter to the key wrap algorithm identifier, which the standard does not allow, and a random user keying material value. Microsoft Outlook decrypts only this form.
- The strict encoding of RFC 5753 omits the parameter. Clients that follow the standard to the letter, such as gpgsm and KMail, decrypt only this form.

Because the two forms derive different keys, no message can satisfy both. Encryption at rest uses the NULL encoding unless the PublicKey has `strictKeyWrapEncoding` enabled, and the gateway always uses it. RSA certificates are not affected, nor are X25519 and X448 certificates, which use HKDF with SHA-256 ([RFC 8418](https://www.rfc-editor.org/rfc/rfc8418)) and have only one encoding.

For ML-KEM certificates, the server writes a KEMRecipientInfo ([RFC 9629](https://www.rfc-editor.org/rfc/rfc9629)): the ML-KEM ciphertext, HKDF with SHA-256 to derive the wrapping key, and AES key wrap, with 128-bit keys for ML-KEM-512 and 256-bit keys otherwise.

## Client support

S/MIME clients differ in which of these structures they decrypt, and the server cannot detect which client a recipient uses. The following table summarises the support of common clients for the formats Stalwart writes:

| Client | AES-256-GCM | RSA-OAEP | Elliptic-curve keys | X25519, X448, ML-KEM |
|---|---|---|---|---|
| Thunderbird 154 and later | Yes | Yes | Yes | No |
| Thunderbird ESR 140 and ESR 153 | No | Yes | Yes | No |
| Microsoft Outlook | Unknown | Unknown | NULL encoding only | No |
| Apple Mail | No | No | No | No |
| gpgsm and KMail | Yes | No | Strict encoding only | No |

Every client reads the default output for an RSA certificate: EnvelopedData with AES-256-CBC and PKCS #1 v1.5. This is the safe choice when the recipient's client is unknown, and the reason authenticated encryption is off unless a key asks for it. Certificates whose key is marked for RSA-OAEP always receive OAEP, which Apple Mail, gpgsm and KMail cannot read.

## Message format

The server writes an `application/pkcs7-mime` message. The original header fields stay outside, except the MIME fields that describe the body, which move into the encrypted part together with any [header protection](/docs/encryption/at-rest#header-protection). The body is replaced with the base64-encoded CMS structure:

```text
Content-Type: application/pkcs7-mime; smime-type=enveloped-data;
	name="smime.p7m"
Content-Disposition: attachment; filename="smime.p7m"
Content-Transfer-Encoding: base64

<base64-encoded CMS EnvelopedData>
```

With AuthEnvelopedData, the `smime-type` is `authEnveloped-data`.

## Export the certificate

A certificate authority usually delivers a certificate as a PKCS #12 file (`.p12` or `.pfx`), protected by a password. That file holds both the certificate and the private key, and the two belong in different places: the whole file goes into the mail client, which needs the private key to decrypt, while Stalwart receives only the certificate. The following OpenSSL command extracts the certificate in PEM form, between `-----BEGIN CERTIFICATE-----` and `-----END CERTIFICATE-----` lines:

```bash
$ openssl pkcs12 -in certificate.p12 -clcerts -nokeys -out certificate.pem
```

PKCS #12 files created with older algorithms need the `-legacy` option. Most mail clients, and the Keychain Access application on macOS, can also export a certificate on its own. A DER-encoded certificate can be pasted as base64, or converted with `openssl x509 -inform der -in certificate.der -out certificate.pem`.

## Certificate validation errors

The server checks a certificate when it is saved, and refuses it with one of the following errors on the `key` field:

| Error | Cause |
|---|---|
| `No valid public key found.` | The text is empty. |
| `The key contains no key usable for encryption.` | The text contains no certificate, for example only a bare public key in PEM form. |
| `The ASCII armor or PEM encoding is malformed.` | The PEM lines or the base64 content are damaged. |
| `The X.509 certificate is malformed.` | The certificate cannot be decoded. |
| `Secret key material is not accepted, upload the public key only.` | A private key or a PKCS #12 file was included. |
| `Cannot mix OpenPGP keys and S/MIME certificates.` | The text contains both kinds. |
| `The certificate is not valid yet.` or `The key or certificate has expired.` | The certificate is outside its validity period. |
| `The encryption key algorithm is not supported.` | The key type is not supported, or the key usage extension lacks the bit the key needs without being a signing certificate. |
| `Brainpool curves are not supported.` | The certificate uses a Brainpool curve. |
| `RSA keys must be between 2048 and 8192 bits long.` | The RSA key is outside the accepted range. |
| `The public key is invalid.` | The key material itself is invalid, for example a point that is not on its curve. |
| `Signature-only certificate cannot be used for encryption.` | The key usage extension allows only signing. |
| `Encipher-only certificates cannot be used for encryption.` | An elliptic-curve, X25519 or X448 certificate is restricted to the encipher-only form of key agreement. |
| `The certificate is not valid for email protection (extended key usage).` | The extended key usage extension excludes email protection. |

When the text holds several certificates and none is valid, the error of the first one is reported. External keys add one more check: `An external public key must hold a single key or certificate.`
