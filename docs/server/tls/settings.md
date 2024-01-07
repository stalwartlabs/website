---
sidebar_position: 1
---

# Settings

The default settings for the server's TLS configuration can be found under the `server.tls` key and include the following options:

- `enable`: Specifies whether the listener should use TLS encryption for incoming connections. If set to `true`, the listener will require clients to connect using an encrypted connection.
- `implicit`: Specifies whether the listener should use implicit or explicit TLS encryption. If set to `false` (the default), the listener will use explicit TLS encryption, which requires clients to initiate a `STARTTLS` command before upgrading the connection to an encrypted one. If set to `true`, the listener will use implicit TLS encryption, which requires the connection to be encrypted from the start.
- `timeout`: Specifies the amount of time the listener should wait for a client to initiate the TLS handshake before timing out the connection.
- `certificate`: Specifies the name of the [certificate](/docs/server/tls/certificates) to use for the listener. The certificate must be defined in the `certificate.<name>` section of the configuration file.
- `sni`: Specifies a list of subject names and [certificates](/docs/server/tls/certificates) that the listener should use based on the subject name presented by the client during the TLS handshake. This is useful in scenarios where multiple hostnames are hosted on a single IP address. 
- `acme`: Specifies the name of the [ACME](/docs/server/tls/acme) provider to use for the listener. The ACME provider must be defined in the `acme.<name>` section of the configuration file. If an ACME provider is specified, the listener will automatically obtain and renew TLS certificates for all associated listener's hostnames. The `certificate` option is ignored if an ACME provider is specified.
- `protocols`: Specifies the list of TLS protocols that the listener should allow clients to use.
- `ciphers`: Specifies the list of ciphers that the listener should allow clients to use. If left empty, the listener will use the default ciphers defined by the TLS library.
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

The following example defines two SNI subjects (otherdomain.org and otherdomain.net) and specifies the TLS protocols and ciphers to use:

```toml
[server.tls]
enable = true
implicit = false
timeout = "1m"
certificate = "default"
#acme = "letsencrypt"
sni = [ { subject = "otherdomain.org", certificate = "otherdomain_org" },
        { subject = "otherdomain.net", certificate = "otherdomain_net" } ]
protocols = [ "TLSv1.2", "TLSv1.3" ]
ciphers = [ "TLS13_AES_256_GCM_SHA384", "TLS13_AES_128_GCM_SHA256",
            "TLS13_CHACHA20_POLY1305_SHA256", "TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384",
            "TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256", "TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256",
            "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384", "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256",
            "TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256"]
ignore-client-order = true
```

It is possible to override the default TLS settings on a per-listener basis as detailed in the following sections.

