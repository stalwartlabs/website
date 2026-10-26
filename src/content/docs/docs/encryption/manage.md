---
sidebar_position: 4
title: "Managing encryption"
description: "Register an OpenPGP key or S/MIME certificate and enable encryption at rest for an account, in the account manager or through the API, and disable it again."
---

Encryption at rest is enabled per account, either by the account's user or by an administrator. Two things are needed. The first is a registered public key, which is an OpenPGP key or an S/MIME certificate: the server encrypts with it, and only the matching private key can decrypt. The second is the account's encryption setting, which selects that key and the cipher. Users manage both in the [account manager](/docs/management/webui/account-manager) of the WebUI, at `/account`.

The same data is available to administrators and scripts. In the API and the [CLI](/docs/management/cli/), the keys are [PublicKey](/docs/ref/object/public-key) objects, and the encryption setting is the `encryptionAtRest` field of the [AccountSettings](/docs/ref/object/account-settings) object. The account settings are found in the WebUI under <!-- breadcrumb:AccountSettings --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg> Account › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" /><circle cx="12" cy="12" r="3" /></svg> Settings<!-- /breadcrumb:AccountSettings -->. None of this takes effect unless encryption is also allowed server-wide, as described in [Server-wide settings](/docs/encryption/#server-wide-settings).

## Enable encryption

Enabling encryption takes four steps: export the public key from the mail client, register it with the server, select it in the encryption settings, and confirm with a test message that the client can read what the server encrypts.

1. Export the public key or certificate from the mail client, as described in [OpenPGP](/docs/encryption/pgp#export-the-public-key) or [S/MIME](/docs/encryption/smime#export-the-certificate). The client must hold the private key, because it alone can decrypt the stored messages.
2. Register the key with the server. In the account manager, open the public keys under <!-- breadcrumb:PublicKey --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg> Account › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M12.4 2.7a2.5 2.5 0 0 1 3.4 0l5.5 5.5a2.5 2.5 0 0 1 0 3.4l-3.7 3.7a2.5 2.5 0 0 1-3.4 0L8.7 9.8a2.5 2.5 0 0 1 0-3.4z" /><path d="m14 7 3 3" /><path d="m9.4 10.6-6.814 6.814A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814" /></svg> Public Keys<!-- /breadcrumb:PublicKey -->. Add a public key, paste the ASCII-armored OpenPGP key or the PEM certificate into it, and give it a description. This creates a PublicKey object whose `key` field holds the pasted text.
3. Select the key and a cipher in the encryption settings, and save. The setting is the [`encryptionAtRest`](/docs/ref/object/account-settings#encryptionatrest) field, and its variant selects the cipher:
   - `Aes128` or `Aes256`: AES in CBC mode, for OpenPGP keys and S/MIME certificates.
   - `Aes256Gcm` or `ChaCha20Poly1305`: authenticated ciphers, for S/MIME certificates only. Selecting one with an OpenPGP key is refused with `<algorithm> is only supported for S/MIME encryption, but the selected public key is an OpenPGP key.`
   - `Disabled`: no encryption.

   Each variant other than `Disabled` carries the id of the key in `publicKey` and two switches. With `encryptOnAppend`, messages that the user's clients store over JMAP or IMAP are also encrypted, provided the server allows it. With `allowSpamTraining`, the spam classifier learns from the plain text of the account's messages before they are encrypted, which it otherwise cannot do.
4. Send a test message to the account and open it in the mail client, which should show it as encrypted and readable. When the client cannot decrypt it, the client does not hold the private key that matches the registered public key.

The following setting encrypts the account's messages with AES-256 for a registered key:

```json
{
  "encryptionAtRest": {
    "@type": "Aes256",
    "publicKey": "<public key id>",
    "encryptOnAppend": false,
    "allowSpamTraining": false
  }
}
```

The setting refers to a single PublicKey, but a PublicKey can hold more than one key. To encrypt for several keys, for example during a change of key, put all of them into the same PublicKey, as several armored keys or several certificates one after another.

## Disable encryption

To stop encrypting new messages, set `encryptionAtRest` to `Disabled`:

```json
{
  "encryptionAtRest": {"@type": "Disabled"}
}
```

New messages are then stored in plain text, but the change does not affect messages already stored. Messages stored while encryption was enabled stay encrypted and can only be read with the private key, because disabling the setting does not decrypt them. In the other direction, enabling it again does not encrypt the messages stored in the meantime.

The private key is the only way to read the encrypted messages, and the server cannot help recover them. Deleting a PublicKey that the setting refers to does not make old messages readable either, so the private key must be kept for as long as the messages are kept.
