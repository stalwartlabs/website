---
sidebar_position: 3
title: "S/MIME"
description: "Encrypt stored messages with an S/MIME certificate: the format Stalwart stores, the supported certificates and ciphers, and how a certificate is exported and registered."
---

S/MIME ([RFC 8551](https://www.rfc-editor.org/rfc/rfc8551)) is the standard for encrypting and signing messages with X.509 certificates. The certificates are usually issued by a certificate authority, and S/MIME is built into most desktop and mobile mail clients, including Outlook and Apple Mail.

Stalwart uses S/MIME for [encryption at rest](/docs/encryption/) when the account's registered key is an S/MIME certificate. Like OpenPGP, it combines a symmetric cipher with public-key encryption. Each message is encrypted with a random content key and a symmetric cipher, and the content key is then encrypted with the public key of the certificate, so only the holder of the certificate's private key can read the message.

## Supported certificates and ciphers

Only certificates with an RSA key can be used. A certificate with an elliptic-curve key is accepted when it is registered, but the encryption of each message then fails, which the log reports as `Failed to parse public key`. Delivery to the account therefore fails with the temporary error `Transient server failure.`, and the messages stay in the queue until they expire. Check the key type of a certificate before registering it.

The cipher is selected in the account settings, and each setting produces a different message format:

| Setting | Cipher | Message format |
|---|---|---|
| `Aes128` | AES-128-CBC | CMS EnvelopedData |
| `Aes256` | AES-256-CBC | CMS EnvelopedData |
| `Aes256Gcm` | AES-256-GCM | CMS AuthEnvelopedData, content key encrypted with RSA-OAEP |
| `ChaCha20Poly1305` | ChaCha20-Poly1305 | CMS AuthEnvelopedData, content key encrypted with RSA-OAEP |

The choice is between compatibility and integrity. The CBC ciphers are understood by every S/MIME client. The authenticated ciphers also detect tampering with the stored message, but they require a client that supports AuthEnvelopedData ([RFC 5083](https://www.rfc-editor.org/rfc/rfc5083)). Confirm that every client of the account supports it before selecting one, because a client without that support cannot open the messages.

## Export the certificate

The certificate authority usually delivers the certificate as a PKCS #12 file (`.p12` or `.pfx`), protected by a password. That file contains both the certificate and the private key, and the two go to different places. Import the whole file into the mail client, which needs the private key to decrypt. Give Stalwart only the certificate in PEM format, without the private key. The following OpenSSL command extracts it:

```bash
$ openssl pkcs12 -in certificate.p12 -clcerts -nokeys -out certificate.pem
```

For PKCS #12 files created with older algorithms, add `-legacy`. Many mail clients and the macOS Keychain Access application can also export the certificate.

## Register the certificate

The certificate is stored as a [PublicKey](/docs/ref/object/public-key) of the account, in its [`key`](/docs/ref/object/public-key#key) field, with a [`description`](/docs/ref/object/public-key#description) and, optionally, an expiry date. The field is text, so the certificate must be PEM-encoded, between `-----BEGIN CERTIFICATE-----` and `-----END CERTIFICATE-----` lines. Binary DER files must be converted first, for example with `openssl x509 -inform der -in certificate.der -out certificate.pem`.

Several certificates can be pasted one after another, in which case each message is encrypted for all of them. This allows the certificate to be changed without losing access to new messages.

The server checks the text when the certificate is saved. When the text is unusable, saving fails with one of the following errors:

| Error | Cause |
|---|---|
| `Private keys cannot be used as public keys` | A private key was included. |
| `Cannot mix OpenPGP and S/MIME certificates` | The text contains both kinds. |
| `Failed to decode X509 certificate: <reason>` | The certificate is damaged. |
| `Unexpected text outside of a PEM or OpenPGP armor block` | Text other than the PEM blocks was included. |

[Managing encryption](/docs/encryption/manage) describes how the certificate is registered and encryption enabled for the account.
