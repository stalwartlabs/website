---
sidebar_position: 3
---

# MTA-STS

MTA-STS, or Mail Transfer Agent Strict Transport Security, is a security mechanism for email systems to protect against eavesdropping and tampering of emails during transmission. It is designed to ensure that email is sent and received over secure connections, such as TLS.

MTA-STS works by publishing a policy statement in the form of a well-known DNS TXT record, specifying the email domains that support MTA-STS and the requirements for securing the email transmission. The receiving email server will retrieve the MTA-STS policy statement and verify that the incoming connection meets the security requirements specified in the policy. If the connection does not meet the requirements, the email will not be accepted and will be rejected. MTA-STS provides an additional layer of security for email transmission, making it harder for attackers to eavesdrop on or tamper with email messages. This can help prevent sensitive information from being intercepted or altered in transit, and provide a more secure email experience for users.

## Outbound Configuration

Whether to use MTA-STS on outbound connections can be configured with the `queue.outbound.tls.mta-sts` property which accepts the following values:

- `optional`: Use MTA-STS only if an STS policy for the domain has been published.
- `require`: Require MTA-STS and do not delivery unless a valid STS policy is available (not recommended unless used under a custom rule).
- `disable`: Never use MTA-STS.

Example:

```toml
[queue.outbound.tls]
mta-sts = "optional"
```

## Policy Publishing

An MTA-STS policy is a way for domain owners to declare that their email servers support TLS, specifying that messages should only be sent over a secure connection. The policy aims to improve email transport security by reducing the risk of man-in-the-middle attacks and ensuring that transport layer encryption is properly used.

The MTA-STS policy is published at a specific HTTPS URL, under the `/.well-known/mta-sts.txt` path of the domain hosting the SMTP service. The contents of this file, known as the MTA-STS policy file, typically include:

- **version**: Specifies the version of the MTA-STS standard. Currently, this is `STSv1`.
- **mode**: Defines the operational mode of the policy (`none`, `testing`, or `enforce`). `enforce` mode requires sending servers to only connect over secure connections, while `testing` mode allows domain owners to monitor policy failures without affecting mail delivery.
- **mx**: Lists the mail servers that are permitted to receive emails for the domain. Only these listed servers are considered valid recipients.
- **max_age**: Indicates the length of time, in seconds, that the sender should cache and apply the domain's MTA-STS policy.

Stalwart Mail Server can automate the publication of MTA-STS policy files for all hosted domains. This feature ensures that all domains managed by the server maintain an up-to-date policy, enhancing email security across multiple domains without requiring manual policy updates. The following configuration options are available for MTA-STS policy publishing:

- `session.mta-sts.mode`: The operational mode of the MTA-STS policy (`none`, `testing`, or `enforce`).
- `session.mta-sts.max-age`: The maximum age of the MTA-STS policy in seconds.
- `session.mta-sts.mx`: Override the list of mail servers that are permitted to receive emails for the domain. If not specified, the hostnames included in all TLS certificates for the domain will be used.

:::tip Note

To automatically publish MTA-STS policies, it is essential to have port 443 (the standard port for HTTPS traffic) open. This port allows the Stalwart Mail Server to serve the MTA-STS policy files via HTTPS, complying with the protocol's requirements and ensuring that the policies are accessible to other mail servers performing policy checks.

:::

Example:

```toml
[session.mta-sts]
mode = "testing"
max-age = "7d"
mx = ["mx1.example.com", "mx2.example.com"]
```

Stalwart Mail server can automatically generate the MTA-STS DNS records for your domains. To obtain them, go to the `Management` > `Directory` > `Domains` section in the [Webadmin](/docs/management/webadmin/overview.md).
