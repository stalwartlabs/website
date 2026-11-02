---
sidebar_position: 1
title: "Overview"
description: "How Stalwart encrypts email with OpenPGP and S/MIME public keys: the idea behind public-key encryption, what encryption at rest and the encryption gateway each protect, and how the two standards differ."
---

Email is well protected while it travels between servers: TLS encrypts each connection, so nobody on the network can read a message in transit. The protection ends when the message arrives. Every server that handles a message, from the sender's server to the recipient's, stores it in a form that anyone with access to that server can read. That includes the administrators, anyone who obtains a disk or a backup, and an attacker who breaks into the server.

Message encryption closes this gap. Instead of protecting the connection, it protects the message itself, so that the message stays unreadable wherever it is stored and only its intended reader can open it. Stalwart offers two features built on message encryption: **encryption at rest**, which protects the mail stored on this server for its own users, and the **encryption gateway**, which protects mail that this server sends to remote recipients.

## Public-key encryption

Both features rely on public-key encryption, which works with a pair of keys that belong together. A useful picture is a padlock and its key. The **public key** is like an open padlock: its owner can hand out copies to anyone, and anyone holding one can lock a box with it. The **private key** is the only key that opens those padlocks, and its owner keeps it to themselves. To send a protected message, the sender locks it with the recipient's public key; from then on, only the recipient's private key can unlock it. Publishing the public key is safe, because it can only lock, never unlock.

In practice, the message is not locked with the public key directly, because public-key operations are slow on large amounts of data. The sender generates a random one-time key for each message, encrypts the message with it using a fast symmetric cipher such as AES, and then locks only that small one-time key with the recipient's public key. The recipient's mail client reverses the steps: it unlocks the one-time key with the private key, then decrypts the message. A message can be addressed to several keys at once by locking the same one-time key separately for each of them. The [OpenPGP](/docs/encryption/pgp) and [S/MIME](/docs/encryption/smime) pages describe these steps in detail.

## Role of the server

Stalwart only ever holds public keys. It encrypts messages, but it never decrypts them, and because signing also requires a private key, it does not sign messages with OpenPGP or S/MIME either. The private keys stay with their owners, in a mail client that supports OpenPGP or S/MIME, or in a dedicated tool.

This design has consequences that apply to both features:

- Once Stalwart has encrypted a message, Stalwart itself can no longer read it. Neither can anyone who later gains access to the server.
- The server cannot recover an encrypted message for a user who has lost the private key. Keeping the private key safe, and keeping old private keys for as long as the messages encrypted with them are needed, is the key owner's responsibility.
- Anything the server must do with the content of a message, such as spam filtering or Sieve scripts, has to happen before the message is encrypted.
- The reader needs a mail client that can decrypt the message with the private key. Webmail and mobile clients without OpenPGP or S/MIME support show an encrypted message as an attachment they cannot open.

## OpenPGP and S/MIME

Two competing standards define how an email message is encrypted with a public key. Stalwart supports both in both features, and the kind of key it is given decides which one it uses for a message.

**OpenPGP** ([RFC 9580](https://www.rfc-editor.org/rfc/rfc9580)) lets users create their own key pairs, with tools such as GnuPG or with mail clients such as Thunderbird. Nobody needs to approve a key. Users publish their public keys on key servers or on their own domain, and trust comes from where a key was found and from the people who vouch for it.

**S/MIME** ([RFC 8551](https://www.rfc-editor.org/rfc/rfc8551)) uses X.509 certificates, the same kind of certificate that TLS uses, issued for an email address by a certificate authority. The certificate authority vouches that the address belongs to the certificate's holder. S/MIME is built into Outlook, Apple Mail and most corporate environments.

Which standard to use depends on the mail clients that will decrypt the messages. A user who reads mail in Outlook needs an S/MIME certificate, and a Thunderbird user can use either. For the gateway, the choice belongs to each recipient: Stalwart encrypts with whatever kind of key the recipient has published.

## Encryption at rest and the encryption gateway

The two features protect different messages against different people, and they are independent of each other: either can be used without the other.

[Encryption at rest](/docs/encryption/at-rest) protects the mailboxes of local users. A user registers a public key with their account, and Stalwart encrypts every message delivered to that account with the key, and optionally the messages the user's own clients upload. Users enable it for their own accounts, and the administrator decides whether the server allows it.

The [encryption gateway](/docs/encryption/gateway) protects outgoing mail. When a message leaves the server for a remote recipient whose public key Stalwart knows, typically one that a local user sends, the gateway encrypts it for that recipient on the way out. The sender needs no encryption software at all, and the message stays encrypted on every server it passes through, including the recipient's mailbox. The administrator enables and configures it, and decides which [recipient keys](/docs/encryption/external-keys) it uses.

The following table compares what each layer protects:

| Threat | TLS | Encryption at rest | Encryption gateway |
|---|---|---|---|
| Someone observing the network between two servers | Protected | Not protected | Protected |
| Someone reading this server's disks or backups later | Not protected | Protected for stored mailbox messages | Not protected |
| Operators of the servers the message passes through and of the recipient's provider | Not protected | Not applicable | Protected |
| Someone in control of this server while the message is processed | Not protected | Not protected | Not protected |
| Anyone reading the sender, recipients and date | Not protected | Not protected | Not protected |

None of these protects a message while the server processes it, because the server sees each message in readable form when it arrives. The envelope and the addressing headers also stay readable in every case, since mail cannot be delivered or listed without them; the gateway can additionally hide the Subject, as described in [Header protection](/docs/encryption/gateway#header-protection).

## Section contents

The pages that follow go from the features themselves to the cryptographic details:

- [Encryption at rest](/docs/encryption/at-rest): what it protects, how users enable it and how it affects search and spam filtering
- [Encryption gateway](/docs/encryption/gateway): the outbound policy, how messages are encrypted and signed, and the bounces it produces
- [External keys](/docs/encryption/external-keys): the recipient keys the gateway uses, how they are added and refreshed, and how changes are approved
- [Key harvesting](/docs/encryption/harvesting): learning recipient keys from the signed messages they send
- [S/MIME certificate trust](/docs/encryption/smime-trust): how the server decides whether a recipient's certificate is genuine
- [OpenPGP](/docs/encryption/pgp) and [S/MIME](/docs/encryption/smime): supported keys and algorithms, the message formats Stalwart produces, and key validation errors
- [Troubleshooting](/docs/encryption/troubleshooting): diagnosing messages that are not encrypted, cannot be decrypted or bounce
