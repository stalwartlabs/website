---
sidebar_position: 4
---

# TLS

Stalwart Mail Server implements robust TLS support to ensure secure transmission of emails over the internet. TLS (Transport Layer Security) is essential for protecting data in transit, providing encryption, authentication, and integrity to prevent unauthorized access and tampering of email messages. Stalwart Mail Server’s TLS configuration is built on rustls, a modern, high-performance TLS library that prioritizes safety and correctness.

Stalwart Mail Server offers a range of configurable options for TLS, allowing administrators to fine-tune the security settings for both inbound and outbound email communication. The default configuration emphasizes security by rejecting outdated, insecure protocols and cipher suites. However, Stalwart also provides flexible mechanisms to adapt to real-world environments where some remote servers may have misconfigured or obsolete TLS setups.

This section of the manual outlines the various TLS configuration settings available in Stalwart Mail Server, including how to enforce the use of TLS, handle invalid certificates, and dynamically adjust security parameters based on specific delivery conditions. While Stalwart Mail Server is designed to adhere to strict security standards, administrators can use these options to ensure compatibility with a broad range of email systems while maintaining a secure and reliable mail flow.

## STARTTLS

The `queue.outbound.tls.starttls` parameter in the configuration file indicates whether TLS is required when transmitting messages to a remote host. This setting accepts the following values:

- `optional`: Upgrade the connection to TLS only if the `STARTTLS` command is available.
- `require`: Require remote servers to support `STARTTLS`.
- `disable`: Disable TLS (not recommended unless used under a custom rule).

Example:

```toml
[queue.outbound.tls]
starttls = "require"
```

## Invalid certificates

The `queue.outbound.tls.allow-invalid-certs` configuration option governs the behavior of Stalwart Mail Server when it encounters an invalid or misconfigured TLS certificate from a remote host during outbound communication.

When this option is set to `false` (the recommended and default setting), Stalwart Mail Server will reject any connections to remote hosts that present an invalid TLS certificate. This ensures that the email communications are secure and trustworthy, and prevents potential security risks associated with connecting to hosts with misconfigured or compromised certificates.

However, there are instances on the internet where hosts have TLS certificates that do not match their host names or are otherwise invalid. In such cases, administrators might find it challenging to send emails to these hosts if the `allow-invalid-certs` option is set to `false`. To address this, the option can be set to `true`, allowing Stalwart Mail Server to establish connections even if the remote host's TLS certificate is invalid.

While this can be useful in scenarios where communication with a misconfigured host is essential, it is crucial to understand the security implications. Allowing invalid certificates can expose the system to man-in-the-middle attacks, where attackers can intercept and potentially alter the email communications. Therefore, it's highly recommended to leave this option set to `false` unless there's a compelling reason to change it. If you choose to enable this option, always ensure to monitor the connections and validate the reasons for any invalid certificates encountered.

Example:

```toml
[queue.outbound.tls]
allow-invalid-certs = false
```

Administrators are urged to exercise caution and thoroughly assess the risks before enabling this option.

## Handling TLS Errors

Stalwart Mail Server provides the ability to dynamically adjust TLS settings based on specific conditions encountered during outbound email delivery. This flexibility is particularly useful when dealing with remote hosts that may have outdated or misconfigured TLS setups. 

Stalwart Mail Server uses the modern and secure [rustls](https://docs.rs/rustls/latest/rustls/) library, which prioritizes safety and the correct implementation of TLS protocols. As part of its design, `rustls` deliberately excludes support for broken, obsolete, or insecure protocols and cipher suites. This includes protocols like SSL1, SSL2, SSL3, TLS1, and TLS1.1, as well as cipher suites like RC4, DES, and Triple DES. Other insecure or dangerous mechanisms, such as EXPORT cipher suites, MAC-then-encrypt cipher suites, cipher suites without forward secrecy, and features like renegotiation, Kerberos, compression, discrete-log Diffie-Hellman, automatic protocol version downgrades, and AES-GCM with unsafe nonces, are also unsupported.

Due to these security constraints, Stalwart Mail Server may encounter TLS handshake errors when trying to communicate with remote hosts that use outdated or poorly configured security settings. These errors can stem from invalid or mismatched TLS certificates, unsupported protocols, or insecure cipher suites. In some cases, remote hosts may present certificates that do not match their host name, causing Stalwart to reject the connection to maintain security.

To handle such cases, Stalwart Mail Server allows administrators to configure TLS settings dynamically using [expressions](/docs/configuration/expressions/overview), adjusting them based on the number of delivery retries or the type of error encountered. This feature enables gradual relaxation of TLS requirements to ensure successful email delivery while maintaining security where possible. For example, Stalwart can be configured to allow invalid certificates after a certain number of retries, or even to disable TLS entirely after repeated failures related to TLS errors.

The following example demonstrates how to dynamically adjust TLS settings. In this scenario, Stalwart is configured to allow invalid certificates after the first failed delivery attempt due to a TLS error. If the second retry still fails due to the same issue, Stalwart will disable TLS completely for the next attempt. 

```toml
[queue.outbound.tls]
allow-invalid-certs = [ { if = "retry_num > 0 && last_error == 'tls'", then = true},
                        { else = false } ]
starttls = [ { if = "retry_num > 1 && last_error == 'tls'", then = "disable"},
             { else = "require" } ]
```

In this configuration, Stalwart allows connections to proceed with an invalid certificate after the first retry, but only if the failure was due to a TLS-related issue. This can be particularly useful when dealing with remote servers that are misconfigured or have outdated security settings, and where successful delivery is more important than strict TLS enforcement. After a second failed attempt, the configuration disables TLS entirely, allowing the message to be sent over an unencrypted connection. The default behavior for all other scenarios is to require TLS, maintaining secure communication where possible.

While this approach offers flexibility, administrators should carefully consider the security implications of relaxing TLS settings. Allowing invalid certificates or disabling TLS exposes email traffic to potential threats, such as man-in-the-middle attacks. As a result, it is important to monitor the number of retries and evaluate the risks before adjusting the TLS settings dynamically. The default configuration, which requires valid certificates and secure TLS connections, remains the safest option.

This dynamic TLS configuration can be particularly useful for environments where communication with older or poorly maintained mail servers is necessary. By gradually relaxing TLS requirements only after failed attempts, administrators can balance the need for secure email transmission with the practicalities of delivering messages in a varied and often inconsistent network environment. However, it is crucial to thoroughly assess each situation before allowing insecure connections and ensure that these adjustments are only made when absolutely necessary.
