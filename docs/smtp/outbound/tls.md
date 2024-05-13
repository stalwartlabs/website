---
sidebar_position: 4
---

# TLS

Stalwart SMTP supports various security measures for secure email transmission. The following sections provide an overview of the TLS-related configuration options available in Stalwart SMTP.

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

The `queue.outbound.tls.allow-invalid-certs` configuration option governs the behavior of Stalwart SMTP when it encounters an invalid or misconfigured TLS certificate from a remote host during outbound communication.

When this option is set to `false` (the recommended and default setting), Stalwart SMTP will reject any connections to remote hosts that present an invalid TLS certificate. This ensures that the email communications are secure and trustworthy, and prevents potential security risks associated with connecting to hosts with misconfigured or compromised certificates.

However, there are instances on the internet where hosts have TLS certificates that do not match their host names or are otherwise invalid. In such cases, administrators might find it challenging to send emails to these hosts if the `allow-invalid-certs` option is set to `false`. To address this, the option can be set to `true`, allowing Stalwart SMTP to establish connections even if the remote host's TLS certificate is invalid.

While this can be useful in scenarios where communication with a misconfigured host is essential, it is crucial to understand the security implications. Allowing invalid certificates can expose the system to man-in-the-middle attacks, where attackers can intercept and potentially alter the email communications. Therefore, it's highly recommended to leave this option set to `false` unless there's a compelling reason to change it. If you choose to enable this option, always ensure to monitor the connections and validate the reasons for any invalid certificates encountered.

Example:

```toml
[queue.outbound.tls]
allow-invalid-certs = false
```

Administrators are urged to exercise caution and thoroughly assess the risks before enabling this option.
