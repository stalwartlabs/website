---
sidebar_position: 2
---

# S/MIME

S/MIME, which stands for Secure/Multipurpose Internet Mail Extensions, is a widely accepted protocol for sending digitally signed and/or encrypted messages. It is built into most modern email software and interoperates between them, which makes it one of the most popular ways to send secure emails. 

S/MIME uses the principles of public key cryptography. Each user has a pair of keys - a public key, which is made publicly available and used by anyone to encrypt the message, and a private key, which is kept secret by the user and used to decrypt any messages received. To use S/MIME, users must obtain a digital certificate from a trusted certificate authority (CA). The certificate includes the user's public key and is used to verify the identity of the user. The private key is kept securely by the user and is never shared.

Stalwart supports S/MIME and can use it to encrypt messages using either AES256-CBC or AES128-CBC symmetric encryption. The choice between AES256-CBC and AES128-CBC depends on the level of security required and the computational resources available. AES256-CBC provides a higher level of security but requires more computational resources, while AES128-CBC is less resource-intensive but still provides a strong level of security.

## Obtaining a key pair

S/MIME key pairs are typically obtained by requesting a certificate from a trusted Certificate Authority (CA). These certificates are usually distributed as a PKCS #12 file (also known as a PFX file), which includes the private key paired with the public key (the S/MIME certificate). These files are password protected to ensure the private key remains secure. 

After you have your PFX file, it should be imported into your email client. Each email client has a slightly different process for importing the S/MIME certificate, so you'll need to follow the instructions specific to your client. Once you have your S/MIME certificate installed, you can then export and share your public certificate (without the private key) with others to enable them to send you encrypted email. 

Please note that the private key from the S/MIME certificate should always remain private and secure. If anyone else gains access to your private key, they can impersonate your identity and decrypt your messages. 

## Exporting certificates

### Using a mail client

S/MIME public certificates, which are necessary for others to send you encrypted email, can be exported from most email clients. The steps vary depending on the email client used, so it's recommended for users to refer to their email client's specific instructions. Within the settings of the email client, users typically have the option to view and export their certificates. Once located, users can select their S/MIME certificate and export the certificate file. 

### Using MacOS

If the email client doesn't offer an easy way to export the certificate, Mac users have another option. They can use the Keychain Access tool, a password management system in macOS. It stores a variety of data including passwords, certificates, and keys. To export the S/MIME public certificate, users can open the Keychain Access application, locate their S/MIME certificate in the list of keys, and then export the selected certificate.

### Using OpenSSL

Alternatively, OpenSSL can also be used to export S/MIME public certificates. This requires some knowledge of command line operations. Here's a basic command that can be used:

```bash
$ openssl pkcs12 -in path_to_pfx_file -clcerts -nokeys -out public_cert.pem
```

Or, if problems are encountered while loading legacy PKCS#12 files, this command may be used instead:

```bash
$ openssl pkcs12 -legacy -in path_to_pfx_file -clcerts -nokeys -out public_cert.pem
```

This command will export the public certificate from the PFX file (`path_to_pfx_file`) into a PEM formatted file (`public_cert.pem`). Users should replace `path_to_pfx_file` and `public_cert.pem` with the actual paths and names of their files.

## Importing certificates

Stalwart supports encrypting messages using either a single certificate or multiple certificates. This is particularly useful for scenarios like key rotation, where it may be necessary to transition from an old certificate to a new one, while still maintaining the ability to decrypt messages encrypted with the old certificate.

Stalwart supports both DER and PEM formats for importing certificates. DER format is a binary form of the certificate, whereas PEM (Privacy Enhanced Mail) is a Base64 encoded version of the same certificate, typically encapsulated between "`-----BEGIN CERTIFICATE-----`" and "`-----END CERTIFICATE-----`" statements. Importing a single certificate can be done be in either DER or PEM format. However, when importing multiple certificates, the PEM format must be used. 

For example:

```txt
-----BEGIN CERTIFICATE-----
MIIDbjCCAlagAwIBAgIUZ4K0WXNSS8H0cUcZavD9EYqqTAswDQYJKoZIhvcNAQEN
BQAwLTErMCkGA1UEAxMiU2FtcGxlIExBTVBTIENlcnRpZmljYXRlIEF1dGhvcml0
eTAgFw0xOTExMjAwNjU0MThaGA8yMDUyMDkyNzA2NTQxOFowGTEXMBUGA1UEAxMO
QWxpY2UgTG92ZWxhY2UwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDD
7q35ZdG2JAzzJGNZDZ9sV7AKh0hlRfoFjTZN5m4RegQAYSyag43ouWi1xRN0avf0
UTYrwjK04qRdV7GzCACoEKq/xiNUOsjfJXzbCublN3fZMOXDshKKBqThlK75SjA9
Czxg7ejGoiY/iidk0e91neK30SCCaBTJlfR2ZDrPk73IPMeksxoTatfF9hw9dDA+
/Hi1yptN/aG0Q/s9icFrxr6y2zQXsjuQPmjMZgj10aD9cazWVgRYCgflhmA0V1uQ
l1wobYU8DAVxVn+GgabqyjGQMoythIK0Gn5+ofwxXXUM/zbU+g6+1ISdoXxRRFtq
2GzbIqkAHZZQm+BbnFrhAgMBAAGjgZcwgZQwDAYDVR0TAQH/BAIwADAeBgNVHREE
FzAVgRNhbGljZUBzbWltZS5leGFtcGxlMBMGA1UdJQQMMAoGCCsGAQUFBwMEMA8G
A1UdDwEB/wQFAwMHoAAwHQYDVR0OBBYEFKwuVFqk/VUYry7oZkQ40SXR1wB5MB8G
A1UdIwQYMBaAFLdSTXPAiD2yw3paDPOU9/eAonfbMA0GCSqGSIb3DQEBDQUAA4IB
AQB76o4Yz7yrVSFcpXqLrcGtdI4q93aKCXECCCzNQLp4yesh6brqaZHNJtwYcJ5T
qbUym9hJ70iJE4jGNN+yAZR1ltte0HFKYIBKM4EJumG++2hqbUaLz4tl06BHaQPC
v/9NiNY7q9R9c/B6s1YzHhwqkWht2a+AtgJ4BkpG+g+MmZMQV/Ao7RwLFKJ9OlMW
LBmEXFcpIJN0HpPasT0nEl/MmotSu+8RnClAi3yFfyTKb+8rD7VxuyXetqDZ6dU/
9/iqD/SZS7OQIjywtd343mACz3B1RlFxMHSA6dQAf2btGumqR0KiAp3KkYRAePoa
JqYkB7Zad06ngFl0G0FHON+7
-----END CERTIFICATE-----
```

Once the certificates have been obtained, they can be imported using the [management interface](/docs/encryption/manage).

