---
sidebar_position: 5
title: "Key harvesting"
description: "Learn the public keys of remote correspondents from the signed messages and Autocrypt headers they send: which messages qualify, the harvestKeys expression, S/MIME certificates and capabilities, Autocrypt keys and their trust."
---

People who encrypt their mail usually also sign it, and a signed message often carries the sender's public key. An S/MIME signature includes the sender's certificate, and many OpenPGP clients add an Autocrypt header with the sender's key to every message they send. Mail clients use this to learn the keys of their correspondents without any setup: once a contact has written to them, they can reply encrypted. Key harvesting does the same for the whole server. When signed mail arrives from a remote sender, Stalwart stores the sender's key as an [external key](/docs/encryption/external-keys), and the [encryption gateway](/docs/encryption/gateway) can then encrypt every local user's mail to that sender.

Harvesting requires the gateway to be enabled, and it is controlled by the [`harvestKeys`](/docs/ref/object/encryption#harvestkeys) expression of the [Encryption](/docs/ref/object/encryption) singleton, found in the WebUI under <!-- breadcrumb:Encryption/EncryptionDiscovery --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="16" r="1" /><rect x="3" y="10" width="18" height="12" rx="2" /><path d="M7 10V7a5 5 0 0 1 10 0v3" /></svg> Encryption › Key Discovery<!-- /breadcrumb:Encryption/EncryptionDiscovery -->.

## Qualifying messages

A key learned from mail is only as trustworthy as the evidence that the mail really came from the address, so the server harvests only from messages that pass several checks:

- The message arrived over SMTP from another server, and its sender passed [DMARC](/docs/mta/authentication/dmarc). A sender domain that publishes no DMARC policy never passes, and neither does any sender while DMARC verification is disabled. Messages from authenticated local users, and messages added over IMAP or JMAP, are never harvested.
- At least one recipient is a local account that receives the message and did not classify it as spam.
- The message has exactly one address in `From`, and the key must be bound to that address. It is not a report (`multipart/report`).
- The message carries an `Autocrypt` header, or it is signed with S/MIME.
- The `harvestKeys` expression allows the sender.

`harvestKeys` is evaluated with two variables, `sender`, the `From` address in lower case, and `sender_domain`, its domain. The default, <!-- default:Encryption.harvestKeys -->`!is_local_domain(sender_domain)`<!-- /default -->, harvests from every remote sender and leaves out local ones, whose keys the server has no use for. Setting it to `false` turns harvesting off. The following expression harvests only from two partner domains:

```json
{
  "harvestKeys": {
    "else": "sender_domain == 'partner.example.com' || sender_domain == 'supplier.example.org'"
  }
}
```

Harvesting runs in the background after delivery and never delays it. Up to 8 messages are processed at once; when all of these slots are busy, a message is skipped, and its key will be found in the sender's next message. A key that the server already knows, and has seen within the last day, is not processed again.

## S/MIME signatures

An S/MIME signed message, whether `multipart/signed` or an opaque `application/pkcs7-mime` signed message, contains the signer's certificate and often the certificate the signer wants to be encrypted with. The server first verifies the signature; a message whose signature fails, or that is signed with SHA-1, yields nothing. It then picks the certificate to store: the one the sender names as their preferred encryption certificate, through the `SMIMEEncryptionKeyPreference` attribute or the equivalent Microsoft attribute, when it is bound to the `From` address, and otherwise the signing certificate, when it is. A certificate is bound to the address when its subject alternative name or its subject `emailAddress` is that address. The certificate must also be usable for encryption, as described on the [S/MIME](/docs/encryption/smime#supported-certificates) page.

The certificate is stored with the intermediate certificates that came with the message, and its chain is checked against the [trusted roots](/docs/encryption/smime-trust). A certificate that chains to a trusted root receives `verified` trust; one that does not, such as a self-signed certificate, receives `unverified` trust and is not used under the default [minimum trust](/docs/encryption/gateway#minimum-trust). The record's source is `HarvestedSmime`, and its revocation status is checked daily from then on.

A signed S/MIME message also lists the encryption algorithms the sender's client supports, in its `SMIMECapabilities` attribute. The server records them in the key's `smimeCiphers` and `smimeOaep` fields, together with the signing time in `smimeSignedAt`, and newer messages replace older information. A message without a signing time, or with one more than a day in the future, does not update them. When the sender's client announces both RSA-OAEP and AES-256-GCM, the gateway uses authenticated encryption for that recipient automatically, which it otherwise does only when an administrator enables `authenticatedEncryption` on the record.

## Autocrypt

[Autocrypt](https://autocrypt.org/) is a convention among OpenPGP clients: each outgoing message carries an `Autocrypt` header with the sender's address and public key, so that the recipient's client can encrypt the reply. The server reads the header from the top level of the message and accepts it when its `addr` attribute is the `From` address and its `keydata` holds exactly one OpenPGP key with a valid self-signature, a key usable for encryption and a user ID for that address. A message with several matching headers yields nothing. The `prefer-encrypt` attribute, which tells clients whether the sender wants encrypted replies, does not affect the gateway, whose [outbound policy](/docs/encryption/gateway#outbound-policy) alone decides.

An Autocrypt header proves little by itself: anyone who can send mail that passes DMARC for the address could add one. When the message is also signed with PGP/MIME and the Autocrypt key verifies the signature, the key is stored with the source `HarvestedPgp` and `harvested` trust. Otherwise it is stored with the source `Autocrypt` and `unverified` trust, and the default minimum trust excludes it. An OpenPGP signature carries no key of its own, so a PGP/MIME signed message without an Autocrypt header yields nothing.

## Effect on existing records

A harvested key for an address that has no record creates one. For an address that already has a record, the outcome follows the [key change](/docs/encryption/external-keys#key-changes) rules: the key may replace the current one, wait for approval or be ignored. `Manual` and `Automatic` records are never replaced or queued by a harvested key, but when the same key arrives again, the server updates the record's `lastSeen` date, its S/MIME capabilities and, on a record that is not pinned and not `Automatic`, a copy of the key with a later expiry.

A harvested key is stored once and used for every local sender who writes to that address. The conditions above make sure that the sender's own domain vouches for the message that delivered the key.

Each harvested key is recorded with the event `encryption.key-harvested`, and a key that waits for approval with `encryption.key-change`.
