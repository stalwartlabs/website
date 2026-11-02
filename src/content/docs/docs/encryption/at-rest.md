---
sidebar_position: 2
title: "Encryption at rest"
description: "Encrypt each user's stored messages with their own OpenPGP key or S/MIME certificate: what it protects, which messages are encrypted, how it affects search and spam training, and how to enable, change and disable it."
---

Encryption at rest keeps the messages stored in a user's mailbox unreadable to anyone but that user. The user gives the server a public key, and from then on Stalwart encrypts every message it stores in the account with that key. Only the matching private key, which never leaves the user's mail client, can decrypt the messages. Someone who later reads the server's storage, copies a backup or takes a disk sees encrypted messages and nothing more; the same applies to the server's administrators.

Each user decides whether to use it, because only users who read mail in a client that holds their private key can benefit. A user who reads mail in webmail, or in a client without OpenPGP or S/MIME support, cannot open encrypted messages and should leave it off.

## Process

Encryption happens at the last moment before a message is stored. A message that arrives for the account first goes through the normal delivery steps: the spam filter, Sieve scripts and calendar invitation processing all see the readable message. Only then does the server encrypt it with the account's key and store the result.

The stored message is a standard encrypted email message, in the PGP/MIME format ([RFC 3156](https://www.rfc-editor.org/rfc/rfc3156)) for an OpenPGP key and as an S/MIME `application/pkcs7-mime` message ([RFC 8551](https://www.rfc-editor.org/rfc/rfc8551)) for an S/MIME certificate. A mail client with OpenPGP or S/MIME support decrypts it like any encrypted message it receives, and needs no knowledge of Stalwart to do so. The algorithms come from the key itself, as described in [Compatibility settings](#compatibility-settings).

Encryption is not retroactive in either direction. Enabling it leaves the messages already in the account as they are, and disabling it leaves the encrypted messages encrypted. No task re-encrypts or decrypts stored mail.

## Scope of protection

The server encrypts the body of each message, including all of its attachments. The header fields stay readable, apart from the MIME fields that describe the body, such as `Content-Type`, which move into the encrypted part. `From`, `To`, `Cc`, `Subject`, `Date`, `Message-ID` and the trace fields such as `Received` and `Authentication-Results` all remain in plain text. Mail clients list, sort and thread messages from these fields, and they could not do so if every listing required decrypting every message.

The Subject in particular always stays readable at rest. Clients show it in the message list, and hiding it would leave every encrypted message without a title until opened.

Because the protection applies only from the moment of storage, it does not cover a message while it is being received. An attacker in control of the server at that moment can read the message. Encryption at rest protects stored mail against later access, not against a compromised running server.

### Header protection

Header fields outside the encryption can be changed by anyone who can modify the stored message, without the change being noticeable. Header protection ([RFC 9788](https://www.rfc-editor.org/rfc/rfc9788)) addresses this by placing a copy of the important header fields inside the encrypted part, where they cannot be altered without detection. A client that supports header protection shows the protected copy instead of the outer one.

The `headerProtection` setting of the account selects the behaviour, <!-- default:AccountSettings.EncryptionSettings.headerProtection -->`noConfidentiality`<!-- /default --> by default:

- `noConfidentiality` copies `From`, `Sender`, `Reply-To`, `To`, `Cc`, `Subject`, `Date`, `Message-ID`, `In-Reply-To`, `References`, `Comments` and `Keywords` into the encrypted part, and records the value of each in an `HP-Outer` field. The outer fields stay in place and readable.
- `none` places no copy inside, so the encrypted part holds only the body.

The `baseline` mode, which replaces the outer Subject with a placeholder, is available only for the [encryption gateway](/docs/encryption/gateway#header-protection); for encryption at rest it is refused when the setting is saved, for the reason given above. A message that is already signed never receives header protection, because changing the headers inside the signed part would invalidate the signature.

## Messages that are encrypted

The conditions for encryption depend on how a message reaches the mailbox. In every case, encryption at rest must be allowed server-wide, the account must have it enabled with a usable key, and the message must not already be encrypted.

Messages delivered over SMTP or LMTP are always encrypted. This includes messages that a Sieve script files into a folder, after any changes the script made.

Messages that a mail client stores itself, over IMAP `APPEND` or with JMAP `Email/import` and `Email/set`, are encrypted only when the account has also enabled `encryptOnAppend`. These are typically copies of sent messages, drafts and messages imported by a migration tool. Without the setting, a sent copy that the client uploads stays in plain text even though incoming mail is encrypted.

Two cases are never encrypted:

- A message that a JMAP client stores with the `$draft` keyword. JMAP clients send a message by submitting the stored draft, so the draft must remain readable to the server. A message sent this way therefore keeps a readable copy in the account. IMAP drafts carry no such exception: with `encryptOnAppend` enabled, an IMAP client's draft is encrypted like any other appended message.
- A message that is copied or moved between mailboxes or accounts, over IMAP or with JMAP `Email/copy`. The copy keeps the form of the original, encrypted or not. The same applies to an archived message that is restored: it returns in the form in which it was archived.

A message that is already encrypted is stored unchanged. The server counts as encrypted any message whose top-level part is `multipart/encrypted` with the OpenPGP protocol, `application/pgp-encrypted`, or an S/MIME enveloped message, including one recognised only by its `.p7m` file name, and any message of at most two parts whose text begins with an armoured `-----BEGIN PGP MESSAGE-----` block. The check reads only these labels, not the content: a plain-text message that a sender labels as encrypted is stored as it arrived. The [encryption gateway](/docs/encryption/gateway#messages-that-are-not-encrypted) is stricter and checks for real ciphertext. A message that is only signed is encrypted, with the signature inside the encrypted part, where the client verifies it after decryption.

The stored size of a message, and therefore the space it takes in the account's quota, is the size of the encrypted message, which is larger than the original.

## Effects on search and spam training

Encryption hides the body from the server, which affects every feature that reads it.

Full-text search covers only the readable header fields. The search index is built from the stored, encrypted message, so a search for a word in the body or an attachment of an encrypted message finds nothing, over IMAP and JMAP alike. Searches by sender, recipient or subject keep working. Clients that offer body search on encrypted mail do it locally, after decrypting.

The spam classifier learns from the text of messages, which an encrypted message no longer offers. Some events at the moment of storage create a [training sample](/docs/spamfilter/classifier/training) for the account: a message that a client uploads into the Junk folder or the Inbox, or one that the classifier marked as spam although its sender is in the user's address book or it is a trusted reply to an earlier message, when automatic learning is enabled for these cases. The account's `allowSpamTraining` setting, <!-- default:AccountSettings.EncryptionSettings.allowSpamTraining as=enabled -->disabled<!-- /default --> by default, decides whether such a sample is still created for a message that is then encrypted. When it is enabled, the server keeps a plain-text copy of the message as the sample and deletes it once the classifier has trained on it, so the plain text is stored for a while outside the encryption. When it is disabled, the message is left out of training. After storage, the choice no longer exists: marking an encrypted message as junk, or moving it to the Junk folder, never creates a sample, because the server holds only the encrypted form.

The setting does not cover [automatic learning](/docs/spamfilter/classifier/autolearn), which takes server-wide samples from incoming messages with a certain verdict, such as spam trap hits, before they are delivered to any account. Such a sample is a plain-text copy kept for the classifier's retention period, whatever the recipients' encryption settings.

## Keys

Each key that a user registers is a [PublicKey](/docs/ref/object/public-key) object of the account, found in the WebUI under <!-- breadcrumb:PublicKey --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg> Account › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M12.4 2.7a2.5 2.5 0 0 1 3.4 0l5.5 5.5a2.5 2.5 0 0 1 0 3.4l-3.7 3.7a2.5 2.5 0 0 1-3.4 0L8.7 9.8a2.5 2.5 0 0 1 0-3.4z" /><path d="m14 7 3 3" /><path d="m9.4 10.6-6.814 6.814A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814" /></svg> Public Keys<!-- /breadcrumb:PublicKey -->. Its `key` field holds an OpenPGP public key or one or more S/MIME certificates as text, and the server detects which from the content. The supported key types are described on the [OpenPGP](/docs/encryption/pgp#supported-keys) and [S/MIME](/docs/encryption/smime#supported-certificates) pages.

An account can hold up to <!-- default:Email.maxPublicKeys -->5<!-- /default --> public keys, as set by [`maxPublicKeys`](/docs/ref/object/email#maxpublickeys) and overridable per account through its quotas. Users manage the keys of their own account, and administrators those of any account.

A single PublicKey may contain several keys or certificates, one after another. Each message is then encrypted for every valid key in it, so any of the matching private keys can decrypt it. This is useful when a user reads mail on devices with different keys, and during a change of key. Keys in the set that have expired or been revoked are skipped without an error, as long as at least one usable key remains. OpenPGP keys and S/MIME certificates cannot be mixed in one PublicKey.

When it saves a key, the server checks it and rejects anything unusable, such as a private key, an expired certificate or a signing-only key. The error texts are listed on the [OpenPGP](/docs/encryption/pgp#key-validation-errors) and [S/MIME](/docs/encryption/smime#certificate-validation-errors) pages. It also fills in several read-only fields that help the user recognise the key:

- `keyType` describes the kind of key and its encryption algorithms, for example `OpenPGP v4: RSA-3072, X25519` or `S/MIME: ECDH P-384`.
- `fingerprints` lists the fingerprint of each key, which the user can compare with the one shown by their mail client.
- `expiresAt` is the date after which the key can no longer be used, and `emailAddresses` the addresses that the key names.
- `capabilities` reports whether every key in the set supports authenticated encryption (`aead`) and whether any of them is post-quantum (`postQuantum`).
- `warnings` flags conditions that need attention: `expiresSoon` when the key expires within 14 days, `weakRsa` for an RSA key shorter than 3072 bits, `addressMismatch` when none of the key's addresses belongs to the account, `postQuantumOnly` and `noKnownDecryptor` when few mail clients can decrypt messages for the key, and `unusable` when the key can no longer be used at all.

`expiresAt` and `emailAddresses` are recorded when the key is saved. The other fields are computed each time the key is read, so `expiresSoon` and `unusable` appear on their own as time passes.

## Enable encryption at rest

Encryption at rest is allowed server-wide by the [`atRestEnable`](/docs/ref/object/encryption#atrestenable) field of the [Encryption](/docs/ref/object/encryption) singleton, found in the WebUI under <!-- breadcrumb:Encryption/EncryptionStorage --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="16" r="1" /><rect x="3" y="10" width="18" height="12" rx="2" /><path d="M7 10V7a5 5 0 0 1 10 0v3" /></svg> Encryption › Encryption at Rest<!-- /breadcrumb:Encryption/EncryptionStorage -->. It is <!-- default:Encryption.atRestEnable as=enabled -->enabled<!-- /default --> by default. When the administrator disables it, no message is encrypted, whatever the accounts have configured.

With the server-wide setting enabled, encryption is turned on per account, by the user in the [account manager](/docs/management/webui/account-manager) or by an administrator. It takes four steps:

1. Export the public key from the mail client that holds the private key, as described for [OpenPGP](/docs/encryption/pgp#export-the-public-key) and [S/MIME](/docs/encryption/smime#export-the-certificate). The client must hold the matching private key, because it alone will be able to read the stored mail.
2. Register the key: create a PublicKey, paste the key into its `key` field and give it a description. Check that the `fingerprints` match the key in the mail client and that `warnings` shows nothing unexpected.
3. Select the key in the account settings and enable encryption. The setting is the [`encryptionAtRest`](/docs/ref/object/account-settings#encryptionatrest) field of the account's [AccountSettings](/docs/ref/object/account-settings), found in the WebUI under <!-- breadcrumb:AccountSettings --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg> Account › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" /><circle cx="12" cy="12" r="3" /></svg> Settings<!-- /breadcrumb:AccountSettings -->. Its `Enabled` variant names the key in `publicKey` and carries the `headerProtection`, `encryptOnAppend` and `allowSpamTraining` choices described above. Administrators find the same field, [`encryptionAtRest`](/docs/ref/object/account#encryptionatrest), on the [Account](/docs/ref/object/account) object.
4. Send a test message to the account and open it in the mail client. The client should show it as encrypted and display it normally. If it cannot decrypt the message, the client does not hold the private key that matches the registered public key.

The following setting enables encryption with a registered key, protects the headers inside the encrypted part and also encrypts the messages that the user's clients upload:

```json
{
  "encryptionAtRest": {
    "@type": "Enabled",
    "publicKey": "<public key id>",
    "headerProtection": "noConfidentiality",
    "encryptOnAppend": true,
    "allowSpamTraining": false
  }
}
```

The change applies to the next message the account receives.

## Compatibility settings

Stalwart chooses the algorithms from the key, so there is no cipher to configure: an OpenPGP key announces the formats and ciphers its owner's software supports, and the server follows it. For S/MIME, a certificate says less about its owner's mail client, so two switches on the PublicKey adjust the output for clients that need it. Both appear in the WebUI in the Compatibility section of the key.

`authenticatedEncryption` selects authenticated encryption for an S/MIME certificate: AES-256-GCM in the CMS AuthEnvelopedData format, with RSA-OAEP for RSA certificates. Authenticated encryption also detects any modification of the encrypted message, which plain AES-CBC does not. It is <!-- default:PublicKey.authenticatedEncryption as=enabled -->disabled<!-- /default --> by default because not every client can read it: Apple Mail and Thunderbird before version 154, including the ESR 140 and ESR 153 releases, cannot decrypt these messages. Enable it only when every client that holds the private key supports it; a message stored while it is enabled stays unreadable in an unsupported client even after the switch is turned off. The switch has no effect on OpenPGP keys, whose format follows the key, or on post-quantum (ML-KEM) certificates, which always use authenticated encryption.

`strictKeyWrapEncoding` concerns S/MIME certificates with an elliptic-curve key on the NIST curves (P-256, P-384 and P-521). Microsoft Outlook can decrypt such messages only when the key wrap algorithm carries a NULL parameter that the standard does not allow, so the server writes that parameter while the switch is <!-- default:PublicKey.strictKeyWrapEncoding as=enabled -->disabled<!-- /default -->, as it is by default. Clients that follow the standard strictly, such as gpgsm and KMail, then fail to decrypt. Enabling the switch selects the standard encoding of [RFC 5753](https://www.rfc-editor.org/rfc/rfc5753), at the cost of Outlook compatibility. Neither encoding helps Apple Mail, which supports only an older elliptic-curve scheme: users of Apple Mail need an RSA certificate. Certificates with RSA, X25519 or X448 keys are not affected by the switch.

OpenPGP keys need no switch, but their content matters. When every key in the PublicKey has a post-quantum encryption subkey, messages are encrypted to those subkeys only, even if the keys also have classical subkeys, and few mail clients can decrypt such messages yet; the `postQuantum` capability shows that a key has such a subkey. Version 6 keys, native X25519 and X448 subkeys and the newer authenticated packet format also need a client that implements RFC 9580, which Thunderbird and GnuPG in its default configuration do not. The [OpenPGP](/docs/encryption/pgp#client-support) page has the details.

## Change or disable encryption

A key change needs care, because messages remain decryptable only with the private key they were encrypted for. Two approaches work:

- Add the new key to the existing PublicKey, after the old one. Each message is then encrypted for both, so either private key reads it, and the old key can be removed once every client has the new one.
- Register the new key as a separate PublicKey and select it in `encryptionAtRest`. New messages are encrypted for the new key only.

Either way, messages stored before the change are still encrypted for the old key. The old private key must be kept for as long as those messages are needed.

A PublicKey that an account's encryption setting selects cannot be deleted: the server refuses with an `objectIsLinked` error that names the account settings. To delete it, first select another key or disable encryption.

To stop encrypting new messages, set `encryptionAtRest` to `Disabled`:

```json
{
  "encryptionAtRest": {"@type": "Disabled"}
}
```

New messages are then stored in plain text, and the messages stored while encryption was enabled stay encrypted. The server cannot decrypt them.

## Failure modes

When the account's key cannot be used at the moment a message arrives, the message is stored **unencrypted** rather than rejected, so that no mail is lost. This happens when the key has expired, has been revoked or no longer parses. The server records the event `encryption.encryption-skipped` with the reason, for example `Expired`, and the PublicKey shows the `unusable` warning. When the account's settings are loaded, an unusable key is also recorded, at the trace level, with `encryption.key-unusable`. Mail stays unencrypted until the user registers a new key and selects it, which is why the `expiresSoon` warning appears two weeks before a key expires.

When encryption itself fails for a message, for an internal reason rather than because of the key, the delivery to the account fails temporarily with `Transient server failure.` and the server records `store.crypto-error`. The message stays in the server's queue and is retried according to the [queue schedule](/docs/mta/outbound/schedule); if every attempt fails, the sender receives a delivery status notification.

The account settings are checked when they are saved, and the following errors can be returned for `encryptionAtRest`:

- `The selected public key does not exist.`: the id in `publicKey` is wrong or belongs to another account.
- `The selected public key cannot be used: <reason>`: the key has become unusable since it was registered, for example because it expired. The reason is one of the validation errors of the [OpenPGP](/docs/encryption/pgp#key-validation-errors) and [S/MIME](/docs/encryption/smime#certificate-validation-errors) pages.
- `Header protection with a hidden Subject is not available for encryption at rest.`: `headerProtection` was set to `baseline`.

Creating a PublicKey beyond the account's limit fails with `You have exceeded your quota of <n> public keys.`
