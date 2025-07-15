---
sidebar_position: 6
---

# TLS

Stalwart implements TLS support to ensure secure transmission of emails over the internet. TLS (Transport Layer Security) is essential for protecting data in transit, providing encryption, authentication, and integrity to prevent unauthorized access and tampering of email messages. Stalwart’s TLS configuration is built on rustls, a modern, high-performance TLS library that prioritizes safety and correctness.

A **TLS strategy** defines the transport security policies and TLS configuration to use when establishing encrypted connections to remote mail servers. While connection strategies control the basic mechanics of establishing a session, TLS strategies determine the security requirements for that session.

Each TLS strategy allows fine-grained control over several key parameters related to encryption and certificate validation. These include:

- **DANE enforcement**: Specifies whether to validate the recipient domain's TLSA DNS records, allowing for cryptographically verified STARTTLS connections using [DANE](/docs/mta/transport-security/dane).
- **MTA-STS enforcement**: Enables enforcement of [MTA-STS](/docs/mta/transport-security/mta-sts) policies, which require the recipient domain to publish a secure transport policy via HTTPS.
- **STARTTLS handling**: Determines whether STARTTLS must be required, opportunistic, or disabled entirely for a connection.
- **Certificate validation**: Controls whether invalid or self-signed certificates should be accepted, rejected, or conditionally allowed.
- **TLS timeouts**: Configures time limits for TLS negotiation and handshake completion.

TLS strategies are defined under the `queue.tls.<id>` section of the configuration, where `<id>` is the name of the TLS strategy. As with other strategies, a specific TLS strategy is selected at runtime using an expression assigned to the [TLS strategy](/docs/mta/outbound/strategy) setting.

TLS strategies help ensure that message delivery complies with the transport security expectations of both the sending and receiving parties, while allowing flexibility in how these policies are applied across different delivery contexts. For example, administrators might configure strict TLS settings for domains that support DANE or MTA-STS, while using more permissive settings for legacy systems that do not fully support modern TLS features.

## Policy Enforcement

Stalwart MTA allows administrators to enforce transport security policies on outbound SMTP connections through configurable TLS strategy settings. These settings control how the MTA handles **DANE**, **MTA-STS**, and **STARTTLS**, each of which plays a role in ensuring secure message delivery over the network.

Policy enforcement is configured in the TLS strategy using the following `queue.tls.<id>.dane`, `queue.tls.<id>.mta-sts` and `queue.tls.<id>.starttls` parameters. Each of these parameters accepts one of the following values:

* `optional`: Use the security mechanism if available, but do not require it.
* `require`: Enforce the mechanism strictly; delivery fails if it cannot be used.
* `disable`: Do not attempt to use the mechanism at all.

### DANE

[DANE](/docs/mta/transport-security/dane.md) (DNS-Based Authentication of Named Entities) allows SMTP clients to validate a recipient server’s TLS certificate using DNSSEC-protected TLSA records. If `queue.tls.<id>.dane` is set to `require`, the MTA will only deliver messages to servers that publish valid and verifiable TLSA records. If set to `optional`, it will attempt DANE validation when possible but fall back to regular STARTTLS if the records are missing or invalid.

Example:

```toml
[queue.tls.secure]
dane = "require"
```

This enforces strict DANE validation and ensures that delivery only proceeds if a secure, DNSSEC-validated path is available.

### MTA-STS

[MTA-STS](/docs/mta/transport-security/mta-sts) (Mail Transfer Agent Strict Transport Security) is a policy mechanism that allows recipient domains to publish a required TLS policy over HTTPS. When `queue.tls.<id>.mta-sts` is set to `require`, the MTA will enforce the domain’s published policy and refuse to deliver if a secure connection cannot be negotiated. Setting it to `optional` allows delivery to proceed even if the policy can't be validated.

Example:

```toml
[queue.tls.default]
mta-sts = "optional"
```

In this case, MTA-STS is used when supported but not enforced, making it suitable for general-purpose delivery to a variety of domains.

### STARTTLS

**STARTTLS** is the mechanism used to upgrade a plaintext SMTP connection to a secure TLS connection. By default, most servers advertise STARTTLS support, but enforcement is optional unless explicitly configured. If `queue.tls.<id>.starttls` is set to `require`, delivery will only proceed if the remote server supports STARTTLS and a secure TLS handshake is successful. When set to `disable`, STARTTLS will not be attempted at all, and delivery will occur over plaintext.

Example:

```toml
[queue.tls.legacy]
starttls = "disable"
```

This configuration disables STARTTLS entirely, which may be appropriate when delivering to legacy systems that do not support TLS.

## Invalid certificates

The `queue.tls.<id>.allow-invalid-certs` configuration option governs the behavior of Stalwart when it encounters an invalid or misconfigured TLS certificate from a remote host during outbound communication.

When this option is set to `false` (the recommended and default setting), Stalwart will reject any connections to remote hosts that present an invalid TLS certificate. This ensures that the email communications are secure and trustworthy, and prevents potential security risks associated with connecting to hosts with misconfigured or compromised certificates.

However, there are instances on the internet where hosts have TLS certificates that do not match their host names or are otherwise invalid. In such cases, administrators might find it challenging to send emails to these hosts if the `allow-invalid-certs` option is set to `false`. To address this, the option can be set to `true`, allowing Stalwart to establish connections even if the remote host's TLS certificate is invalid.

While this can be useful in scenarios where communication with a misconfigured host is essential, it is crucial to understand the security implications. Allowing invalid certificates can expose the system to man-in-the-middle attacks, where attackers can intercept and potentially alter the email communications. Therefore, it's highly recommended to leave this option set to `false` unless there's a compelling reason to change it. If you choose to enable this option, always ensure to monitor the connections and validate the reasons for any invalid certificates encountered.

Example:

```toml
[queue.tls.invalid-tls]
allow-invalid-certs = false
```

Administrators are urged to exercise caution and thoroughly assess the risks before enabling this option.

## Timeouts

Timeout options determine the time limit for the SMTP server to complete a specific TLS-related validation. These following timeout settings can defined in the configuration file under the `queue.tls.<id>.timeout`:

- `tls`: The maximum time to wait for the TLS handshake to complete.
- `mta-sts`: The maximum time to wait for the MTA-STS policy to be fetched and validated.

Example:

```toml
[queue.tls.default.timeout]
tls = "3m"
mta-sts = "3m"
```

## Examples

### Handling TLS Errors

Stalwart provides the ability to dynamically adjust TLS settings based on specific conditions encountered during outbound email delivery. This flexibility is particularly useful when dealing with remote hosts that may have outdated or misconfigured TLS setups. 

Stalwart uses the modern and secure [rustls](https://docs.rs/rustls/latest/rustls/) library, which prioritizes safety and the correct implementation of TLS protocols. As part of its design, `rustls` deliberately excludes support for broken, obsolete, or insecure protocols and cipher suites. This includes protocols like SSL1, SSL2, SSL3, TLS1, and TLS1.1, as well as cipher suites like RC4, DES, and Triple DES. Other insecure or dangerous mechanisms, such as EXPORT cipher suites, MAC-then-encrypt cipher suites, cipher suites without forward secrecy, and features like renegotiation, Kerberos, compression, discrete-log Diffie-Hellman, automatic protocol version downgrades, and AES-GCM with unsafe nonces, are also unsupported.

Due to these security constraints, Stalwart may encounter TLS handshake errors when trying to communicate with remote hosts that use outdated or poorly configured security settings. These errors can stem from invalid or mismatched TLS certificates, unsupported protocols, or insecure cipher suites. In some cases, remote hosts may present certificates that do not match their host name, causing Stalwart to reject the connection to maintain security.

The following example demonstrates how to dynamically adjust TLS settings. In this scenario, Stalwart is configured to allow invalid certificates after the first failed delivery attempt due to a TLS error. If the second retry still fails due to the same issue, Stalwart will disable TLS completely for the next attempt. 

```toml
[queue.strategy]
tls = [ { if = "retry_num > 0 && last_error == 'tls'", then = "'invalid-tls'" },
        { if = "retry_num > 1 && last_error == 'tls'", then = "'disable-tls'" },
        { else = "'default'" } ]

[queue.tls.invalid-tls]
allow-invalid-certs = true
starttls = "optional"

[queue.tls.disable-tls]
allow-invalid-certs = false
starttls = "disable"

[queue.tls.default]
allow-invalid-certs = false
starttls = "optional"

```

In this configuration, Stalwart allows connections to proceed with an invalid certificate after the first retry, but only if the failure was due to a TLS-related issue. This can be particularly useful when dealing with remote servers that are misconfigured or have outdated security settings, and where successful delivery is more important than strict TLS enforcement. After a second failed attempt, the configuration disables TLS entirely, allowing the message to be sent over an unencrypted connection. The default behavior for all other scenarios is to require TLS, maintaining secure communication where possible.

While this approach offers flexibility, administrators should carefully consider the security implications of relaxing TLS settings. Allowing invalid certificates or disabling TLS exposes email traffic to potential threats, such as man-in-the-middle attacks. As a result, it is important to monitor the number of retries and evaluate the risks before adjusting the TLS settings dynamically. The default configuration, which requires valid certificates and secure TLS connections, remains the safest option.

This dynamic TLS configuration can be particularly useful for environments where communication with older or poorly maintained mail servers is necessary. By gradually relaxing TLS requirements only after failed attempts, administrators can balance the need for secure email transmission with the practicalities of delivering messages in a varied and often inconsistent network environment. However, it is crucial to thoroughly assess each situation before allowing insecure connections and ensure that these adjustments are only made when absolutely necessary.

### Strict Transport Security

A TLS strategy can also be configured to enforce strict transport security policies for certain remote hosts. This is particularly useful for ensuring that messages are delivered only if the recipient domain supports authenticated and encrypted connections.

For example:

```toml
[queue.strategy]
tls = [ { if = "mx == 'highly-secure.host.org'", then = "'high-security'" },
        { else = "'default'" } ]

[queue.tls.high-security]
allow-invalid-certs = false
dane = "require"
mta-sts = "require"
starttls = "require"

[queue.tls.default]
allow-invalid-certs = false
starttls = "optional"
mta-sts = "optional"
dane = "optional"
```

This configuration enforces strict transport security, ensuring that messages are delivered only if the recipient domain supports authenticated and encrypted connections using both DANE and MTA-STS.
