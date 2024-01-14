---
sidebar_position: 1
---

# Overview

Encryption at rest is a term used to describe the process of encrypting data while it's stored, or "at rest," on persistent media, such as hard drives, solid-state drives, or other forms of digital storage. The purpose of encryption at rest is to ensure that data stored on these media is not readable or accessible without the necessary decryption keys. The process of encryption at rest usually involves taking clear-text data and converting it into cipher-text using an encryption algorithm and an encryption key. The key is a secret string of bits used by the encryption algorithm to scramble the data in a specific way. Without the key, or without a way to derive the key, the scrambled data remains unintelligible and secure.

Stalwart Mail Server employs a user-centric encryption strategy where each user's plain-text messages are automatically encrypted using their provided [OpenPGP](/docs/encryption/pgp) (Pretty Good Privacy) public key or [S/MIME](/docs/encryption/smime) (Secure/Multipurpose Internet Mail Extensions) certificate before these messages are written to disk. This encryption scheme is designed in such a way that only the intended recipient, who holds the corresponding private key, can decrypt and access the contents of their messages. As a result, even the system administrators, who manage the mail server and have access to the system's data, are unable to decrypt and read the messages. Even in the event that unauthorized access occurs, the encrypted messages will appear as unintelligible text without the corresponding private key. This design not only ensures the security and privacy of each user's messages but also protects them from any potential internal threats.

## Configuration

Encryption at rest is enabled by default on Stalwart Mail Server. This means that all incoming messages via SMTP or LMTP are automatically encrypted before they are written to disk, provided the user has uploaded their S/MIME certificate or OpenPGP public key. System administrators can disable this default encryption by setting the `storage.encryption.enable` attribute to `false`.

For example:

```toml
[storage.encryption]
enable = true
```

While the server by default encrypts all incoming messages, it's important to note that it does not automatically encrypt messages that are manually appended by the user using JMAP or IMAP. This is to give the user flexibility in managing their messages. However, if you would like to have all their messages encrypted, regardless of how they are added to the mailbox, they can simply set the `storage.encryption.append` attribute to `true`. 

For example:

```toml
[storage.encryption]
append = true
```
