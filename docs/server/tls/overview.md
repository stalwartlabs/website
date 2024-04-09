---
sidebar_position: 1
---

# Overview

Transport Layer Security (TLS) is a widely adopted protocol designed to facilitate secure communications over a computer network. It provides encryption for data in transit, ensuring that any information transmitted between a mail server and its clients remains confidential and tamper-proof. TLS is fundamental to securing email transmissions, protecting against eavesdropping and man-in-the-middle attacks.

Stalwart Mail Server supports TLS encryption to safeguard email communications, offering flexibility in certificate management to meet various operational needs. Administrators have the option to configure TLS using manually provided certificates, suitable for organizations with specific certificate providers or policies. This traditional method involves obtaining a TLS certificate from a trusted Certificate Authority (CA) and configuring Stalwart to use this certificate for encrypting connections.

Additionally, Stalwart facilitates the automatic procurement of TLS certificates through the Automated Certificate Management Environment (ACME) protocol. This feature enables seamless integration with ACME-compliant providers, such as Let's Encrypt, which offer free and automated certificate issuance and renewal. This automation significantly simplifies the process of enabling and maintaining TLS encryption, making it more accessible and manageable, especially for small to medium-sized organizations.

## Settings

The default settings for the server's TLS configuration can be found under the `server.tls` key and include the following options:

- `enable`: Specifies whether the TLS encryption is available for the listener.
- `implicit`: Specifies whether the listener should use implicit or explicit TLS encryption. If set to `false` (the default), the listener will use explicit TLS encryption, which requires clients to initiate a `STARTTLS` command before upgrading the connection to an encrypted one. If set to `true`, the listener will use implicit TLS encryption, which requires the connection to be encrypted from the start.
- `timeout`: Specifies the amount of time the listener should wait for a client to initiate the TLS handshake before timing out the connection.
- `disable-protocols`: Specifies the list of TLS protocols that should be disabled for the listener. If left empty, the listener will allow both TLS 1.2 and TLS 1.3 protocols.
- `disable-ciphers`: Specifies the list of ciphers that the listener should not offer to clients. If left empty, the listener will use all available ciphers defined by the TLS library.
- `ignore-client-order`: Specifies whether the listener should ignore the order of ciphers presented by the client and use the order specified in the ciphers option. If set to `false`, the listener will use the order presented by the client.

## Supported TLS versions

The following TLS versions are supported:

* `TLSv1.3`
* `TLSv1.2`

TLS 1.1 is not supported due to its inherent security vulnerabilities and its subsequent deprecation by major standards bodies and browsers. By focusing on more modern and secure protocols, Stalwart ensures robust encryption and the utmost security for its users' communications.

## Supported cipher suites

The following TLS 1.3 cipher suites are supported:

* `TLS13_AES_256_GCM_SHA384`
* `TLS13_AES_128_GCM_SHA256`
* `TLS13_CHACHA20_POLY1305_SHA256`

As well as the following TLS 1.2 cipher suites:

* `TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384`
* `TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256`
* `TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256`
* `TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384`
* `TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256`
* `TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256`

## Supported exchange groups

The following exchange groups are supported:

* `X25519`
* `SECP256R1`
* `SECP384R1`

## Example

The following example enables TLS, disables implicit TLS as well as TLSv1.2 and some ciphersuites:

```toml
[server.tls]
enable = true
implicit = false
timeout = "1m"
disable-protocols = [ "TLSv1.2" ]
disable-ciphers = [ "TLS13_AES_256_GCM_SHA384", "TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256"]
ignore-client-order = true
```

It is possible to override the default TLS settings on a per-listener basis as detailed in the following sections.

