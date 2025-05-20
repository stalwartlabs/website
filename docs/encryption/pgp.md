---
sidebar_position: 3
---

# OpenPGP

OpenPGP is a non-proprietary protocol for encrypting and decrypting data, including emails, using public key cryptography. It's based on the original PGP (Pretty Good Privacy) software, but as an open standard, it is implemented by many different programs and systems. OpenPGP ensures the privacy and integrity of your messages. When a user sends an email, the content is encrypted using a symmetric encryption algorithm, such as AES256 or AES128, which convert the plaintext email into encrypted text, or ciphertext. The symmetric key, also known as the session key, used to perform this encryption is then itself encrypted using the recipient's public key. Only the recipient, with their private key, can decrypt the session key and subsequently the actual email content.

Stalwart supports OpenPGP encryption using either the **AES256** or **AES128** symmetric encryption standards. AES, which stands for Advanced Encryption Standard, is a widely-used specification for electronic data encryption. AES256 offers a more robust level of security due to its longer key length, but requires more computational resources compared to AES128.

Additionally, it's worth noting that Stalwart uses the PGP/MIME format for storing encrypted messages. PGP/MIME is an improvement over the older PGP/Inline format, as it allows for the encryption of the entire email, including attachments, rather than just the body text. This results in better security and compatibility with modern email clients.

## Obtaining a key pair

In order to utilize the OpenPGP encryption capabilities of Stalwart, users must first generate their own OpenPGP key pairs. This task is typically performed by the user's email client or via an external encryption tool that supports the OpenPGP standard. 
An OpenPGP key pair consists of a private key, which must be kept secret, and a public key, which can be freely shared. Both keys are essential to the OpenPGP encryption and decryption process. The private key is used to decrypt messages that have been encrypted using its corresponding public key.

After generating an OpenPGP key pair, the user can then export their public key. This exported public key is what is used by Stalwart when it encrypts messages destined for that user. It's important to note that the user's private key should never be uploaded to the server or shared with anyone else. It should be stored securely and used only by the intended recipient to decrypt incoming messages.

:::tip Note

The process of generating an OpenPGP key pair and exporting the public key can vary depending on the specific email client or external tool being used. Users should consult the relevant documentation or help resources for their specific software to ensure the correct steps are followed.

:::

## Importing public keys

Stalwart supports the encryption of email messages using either a single public key or multiple public keys. OpenPGP public keys can be imported in two different formats, raw or ASCII-armored. While it is possible to import keys in their raw format, it's more common (and often more convenient) to import them as ASCII-armored text files. 

An ASCII-armored file is human-readable and consists of one or multiple Base64-encoded keys enclosed between "`-----BEGIN PGP PUBLIC KEY BLOCK-----`" and "`-----END PGP PUBLIC KEY BLOCK-----`" lines. For example:

```txt
-----BEGIN PGP PUBLIC KEY BLOCK-----

xjMEZMYfNhYJKwYBBAHaRw8BAQdAYyTN1HzqapLw8xwkCGwa0OjsgT/JqhcB/+Dy
Ga1fsBrNG0pvaG4gRG9lIDxqb2huQGV4YW1wbGUub3JnPsKJBBMWCAAxFiEEg836
pwbXpuQ/THMtpJwd4oBfIrUFAmTGHzYCGwMECwkIBwUVCAkKCwUWAgMBAAAKCRCk
nB3igF8itYhyAQD2jEdeYa3gyQ47X9YWZTK1wEJkN8W9//V1fYl2XQwqlQEA0qBv
Ai6nUh99oDw+/zQ8DFIKdeb5Ti4tu/X58PdpiQ7OOARkxh82EgorBgEEAZdVAQUB
AQdAvXz2FbFN0DovQF/ACnZyczTsSIQp0mvmF1PE+aijbC8DAQgHwngEGBYIACAW
IQSDzfqnBtem5D9Mcy2knB3igF8itQUCZMYfNgIbDAAKCRCknB3igF8itRnoAQC3
GzPmgx7TnB+SexPuJV/DoKSMJ0/X+hbEFcZkulxaDQEAh+xiJCvf+ZNAKw6kFhsL
UuZhEDktxnY6Ehz3aB7FawA=
=KGrr
-----END PGP PUBLIC KEY BLOCK-----
```

Once the certificates have been obtained, they can be imported using the [management interface](/docs/encryption/manage).
