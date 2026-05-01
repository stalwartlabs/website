---
sidebar_position: 2
title: "S/MIME"
---

S/MIME (Secure/Multipurpose Internet Mail Extensions) is a widely accepted protocol for sending digitally signed or encrypted messages. It is built into most modern mail software and interoperates between implementations, which makes it one of the most common ways to send secure email.

S/MIME relies on public-key cryptography. Each user has a pair of keys: a public key, distributed freely and used by senders to encrypt the message, and a private key, kept secret by the user and used to decrypt received messages. To use S/MIME, users must obtain a digital certificate from a trusted certificate authority (CA). The certificate carries the user's public key and identifies the user. The private key is kept securely by the user and is never shared.

Stalwart supports S/MIME and can encrypt messages using either AES-256-CBC or AES-128-CBC symmetric encryption. AES-256-CBC provides a higher security margin at the cost of more computational work per message; AES-128-CBC uses fewer resources while still providing a strong level of security.

## Obtaining a key pair

S/MIME key pairs are typically obtained by requesting a certificate from a trusted Certificate Authority (CA). Certificates are usually distributed as a PKCS #12 file (also known as a PFX file), which contains the private key paired with the public key (the S/MIME certificate). These files are password-protected so the private key remains secure.

Once the PFX file is available, it should be imported into the user's mail client. Each mail client has a slightly different import procedure, so the client-specific instructions should be followed. Once the S/MIME certificate is installed, the public certificate can be exported (without the private key) and shared with correspondents so they can send encrypted mail.

The private key from the S/MIME certificate must always remain private and secure. Any party that gains access to the private key can impersonate the account and decrypt its messages.

## Exporting certificates

### Using a mail client

S/MIME public certificates, which correspondents need to send encrypted mail, can be exported from most mail clients. The exact steps vary; refer to the client's documentation. From the client's settings, the installed certificates can usually be viewed and exported to a file.

### Using macOS

If the mail client does not offer a convenient export path, macOS users can use Keychain Access, the system's password- and credential-management tool. Keychain Access stores certificates and keys alongside passwords; the S/MIME certificate can be located in the list of keys and exported directly.

### Using OpenSSL

OpenSSL can also export the public certificate from a PFX file. This approach requires familiarity with the command line. A typical command is:

```bash
$ openssl pkcs12 -in path_to_pfx_file -clcerts -nokeys -out public_cert.pem
```

For legacy PKCS#12 files that fail to load, the `-legacy` flag is available:

```bash
$ openssl pkcs12 -legacy -in path_to_pfx_file -clcerts -nokeys -out public_cert.pem
```

This produces a PEM-formatted public certificate at `public_cert.pem`. Replace `path_to_pfx_file` and `public_cert.pem` with the actual paths and filenames.

## Importing certificates

A registered certificate is represented as a [PublicKey](/docs/ref/object/public-key) object (found in the WebUI under <!-- breadcrumb:PublicKey --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg> Account › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M12.4 2.7a2.5 2.5 0 0 1 3.4 0l5.5 5.5a2.5 2.5 0 0 1 0 3.4l-3.7 3.7a2.5 2.5 0 0 1-3.4 0L8.7 9.8a2.5 2.5 0 0 1 0-3.4z" /><path d="m14 7 3 3" /><path d="m9.4 10.6-6.814 6.814A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814" /></svg> Public Keys<!-- /breadcrumb:PublicKey -->). An account may register a single certificate or several; registering multiple certificates is useful during key rotation, allowing a switch to a new certificate while still being able to decrypt messages encrypted with the old one.

Stalwart accepts S/MIME certificates in DER and PEM formats. DER is a binary encoding; PEM is a Base64 encoding of the same data, typically wrapped between `-----BEGIN CERTIFICATE-----` and `-----END CERTIFICATE-----` lines. A single certificate can be supplied in either format; for a bundle of multiple certificates, PEM must be used.

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

The certificate data is carried in the [`key`](/docs/ref/object/public-key#key) field of the PublicKey object, alongside a required [`description`](/docs/ref/object/public-key#description) and optional [`expiresAt`](/docs/ref/object/public-key#expiresat) and [`emailAddresses`](/docs/ref/object/public-key#emailaddresses) fields. Registered certificates are then referenced from [AccountSettings](/docs/ref/object/account-settings); see the [management interface](/docs/encryption/manage) for how to select a certificate and enable encryption.
