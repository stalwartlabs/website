---
sidebar_position: 1
---

# Overview

Encryption at rest is a term used to describe the process of encrypting data while it is stored, or "at rest", on persistent media such as hard drives, solid-state drives, or other forms of digital storage. The purpose of encryption at rest is to ensure that data stored on these media is not readable or accessible without the necessary decryption keys. The process usually involves taking clear-text data and converting it into cipher-text using an encryption algorithm and an encryption key. The key is a secret string of bits used by the encryption algorithm to scramble the data in a specific way. Without the key, or without a way to derive it, the scrambled data remains unintelligible and secure.

Stalwart applies a user-centric encryption strategy where each user's plain-text messages are automatically encrypted using their provided [OpenPGP](/docs/encryption/pgp) (Pretty Good Privacy) public key or [S/MIME](/docs/encryption/smime) (Secure/Multipurpose Internet Mail Extensions) certificate before the messages are written to disk. Only the intended recipient, who holds the corresponding private key, can decrypt and access the message contents. As a result, system administrators with access to the server's data cannot decrypt and read the messages. Even if unauthorized access occurs, the stored messages appear as unintelligible ciphertext without the corresponding private key. This design protects each user's messages against external compromise as well as internal threats.

## Configuration

Server-wide encryption-at-rest behaviour is configured on the [Email](/docs/ref/object/email) singleton (found in the WebUI under <!-- breadcrumb:Email --><!-- /breadcrumb:Email -->). Two fields govern the behaviour:

- [`encryptAtRest`](/docs/ref/object/email#encryptatrest): when `true` (the default), messages delivered via SMTP or LMTP are automatically encrypted before being written to disk, provided the recipient has registered an S/MIME certificate or OpenPGP public key. Setting this field to `false` disables the feature for all accounts.
- [`encryptOnAppend`](/docs/ref/object/email#encryptonappend): when `true`, messages manually appended by a client over JMAP or IMAP are also encrypted. The default is `false`, which leaves appended messages untouched so that clients retain full control over the contents they store.

For example:

```json
{
  "encryptAtRest": true,
  "encryptOnAppend": false
}
```

Per-account encryption settings, including the selection of a specific public key and the symmetric algorithm, are carried on the [AccountSettings](/docs/ref/object/account-settings) singleton (found in the WebUI under <!-- breadcrumb:AccountSettings --><!-- /breadcrumb:AccountSettings -->) through the [`encryptionAtRest`](/docs/ref/object/account-settings#encryptionatrest) field. Public keys themselves are stored as [PublicKey](/docs/ref/object/public-key) objects (found in the WebUI under <!-- breadcrumb:PublicKey --><!-- /breadcrumb:PublicKey -->); see [OpenPGP](/docs/encryption/pgp) and [S/MIME](/docs/encryption/smime) for the accepted key formats, and [Management](/docs/encryption/manage) for how end users manage their own settings.

<!-- review: The previous docs exposed a single `email.encryption.append` flag that forced encryption of appended messages for every account. The current Email singleton pairs this server-wide `encryptOnAppend` with a per-account `encryptOnAppend` inside `AccountSettings.encryptionAtRest`. Confirm whether the server-wide flag acts as an override, a default, or a hard requirement, and whether the per-account value takes precedence. -->
