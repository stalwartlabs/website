---
sidebar_position: 2
title: "Management"
---

Stalwart exposes encryption-at-rest settings through the [self-service portal](/docs/management/webui/account-manager), which allows end users to register their own keys and toggle encryption for their accounts without involving a system administrator. The same settings are reachable over the JMAP API (through the [AccountSettings](/docs/ref/object/account-settings) and [PublicKey](/docs/ref/object/public-key) objects) and through the [CLI](/docs/management/cli/).

Each account may register one or more [PublicKey](/docs/ref/object/public-key) objects holding an OpenPGP public key or an S/MIME certificate. Encryption at rest is then activated by referencing one of these keys from the [`encryptionAtRest`](/docs/ref/object/account-settings#encryptionatrest) field on the [AccountSettings](/docs/ref/object/account-settings) singleton.

## Enabling encryption

End users enable encryption from the self-service portal by performing two steps:

1. Register at least one public key as a [PublicKey](/docs/ref/object/public-key) object. Upload the OpenPGP public key or S/MIME certificate and fill in [`description`](/docs/ref/object/public-key#description); optional fields include [`expiresAt`](/docs/ref/object/public-key#expiresat) and [`emailAddresses`](/docs/ref/object/public-key#emailaddresses). The key material goes into [`key`](/docs/ref/object/public-key#key).
2. Update the [AccountSettings](/docs/ref/object/account-settings) singleton and set the [`encryptionAtRest`](/docs/ref/object/account-settings#encryptionatrest) field to the chosen algorithm variant, referencing the registered key by id.

The [`encryptionAtRest`](/docs/ref/object/account-settings#encryptionatrest) field accepts three variants: `Disabled`, `Aes128`, and `Aes256`. The `Aes128` and `Aes256` variants carry a [`publicKey`](/docs/ref/object/account-settings#encryptionsettings) identifier, an [`encryptOnAppend`](/docs/ref/object/account-settings#encryptionsettings) boolean controlling whether messages appended over JMAP or IMAP are also encrypted, and an [`allowSpamTraining`](/docs/ref/object/account-settings#encryptionsettings) boolean controlling whether the spam classifier is trained on the plaintext before encryption.

For example, enabling AES-256 encryption with a registered key:

```json
{
  "encryptionAtRest": {
    "@type": "Aes256",
    "publicKey": "id1",
    "encryptOnAppend": false,
    "allowSpamTraining": false
  }
}
```

After registering a key and selecting an algorithm, send a test message to the account. The message should arrive encrypted, and the mail client must hold the corresponding private key to decrypt it. If decryption fails, verify that the client is configured with the matching private key for the OpenPGP public key, or the S/MIME certificate private key, that was uploaded to the server.

## Disabling encryption

To disable encryption at rest for an account, update the [AccountSettings](/docs/ref/object/account-settings) singleton and set [`encryptionAtRest`](/docs/ref/object/account-settings#encryptionatrest) to the `Disabled` variant:

```json
{
  "encryptionAtRest": {
    "@type": "Disabled"
  }
}
```

New messages are then stored in plain text. Messages encrypted while the feature was enabled remain encrypted on disk; disabling the setting does not decrypt existing content. Re-enabling encryption at a later point applies only to messages received afterwards and does not retroactively encrypt previously delivered messages.
