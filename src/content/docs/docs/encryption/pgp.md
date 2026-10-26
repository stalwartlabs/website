---
sidebar_position: 2
title: "OpenPGP"
description: "Encrypt stored messages with an OpenPGP public key: the format Stalwart stores, the ciphers available, and how a public key is exported and registered."
---

OpenPGP ([RFC 9580](https://www.rfc-editor.org/rfc/rfc9580)) is the open standard, derived from PGP, for encrypting messages with public keys. Public-key encryption is slow for large amounts of data, so OpenPGP combines it with a symmetric cipher. A message is encrypted with a random session key and a symmetric cipher, and the session key is then encrypted with the recipient's public key. Only the holder of the matching private key can recover the session key, and therefore only that holder can read the message.

Stalwart uses OpenPGP for [encryption at rest](/docs/encryption/) when the account's registered key is an OpenPGP key. It stores the messages in the PGP/MIME format ([RFC 3156](https://www.rfc-editor.org/rfc/rfc3156)), which encrypts the whole message body, including attachments. Mail clients with OpenPGP support, such as Thunderbird, decrypt the message when it is opened.

The cipher used with the session key is AES-128 or AES-256, as selected in the account settings. The authenticated ciphers offered for S/MIME cannot be selected with an OpenPGP key.

## Export the public key

Stalwart never generates or receives the private key, so the key pair is created outside the server, by the user's mail client or by an OpenPGP tool such as GnuPG. Only the public key is given to the server. It is exported in ASCII-armored form: a text block between `-----BEGIN PGP PUBLIC KEY BLOCK-----` and `-----END PGP PUBLIC KEY BLOCK-----` lines. The following GnuPG command exports it:

```bash
$ gpg --armor --export jane@example.com > jane.asc
```

Only ASCII-armored keys are accepted, so a binary key file must be converted first, for example with `gpg --enarmor`.

The block may contain several public keys, in which case each message is encrypted for all of them. This matters during a key change: with both the old and the new key in the block, the user can read new messages with either key.

## Register the key

The key is stored as a [PublicKey](/docs/ref/object/public-key) of the account, in its [`key`](/docs/ref/object/public-key#key) field, with a [`description`](/docs/ref/object/public-key#description) and, optionally, an expiry date. The server detects the type of key from the armor, so the same field holds OpenPGP keys and S/MIME certificates.

The server checks the text when the key is saved. When the text is unusable, saving fails with one of the following errors:

| Error | Cause |
|---|---|
| `Private keys cannot be used as public keys` | A private key block was pasted. |
| `Cannot mix OpenPGP and S/MIME certificates` | The text contains both an OpenPGP key and an S/MIME certificate. |
| `Failed to decode OpenPGP public key: <reason>` or `Could not find any suitable keys in OpenPGP public key` | The block is damaged, or contains no key that can encrypt. |
| `Unexpected text outside of a PEM or OpenPGP armor block` | Text other than the armored block was included. |

[Managing encryption](/docs/encryption/manage) describes how the key is registered and encryption enabled for the account.
