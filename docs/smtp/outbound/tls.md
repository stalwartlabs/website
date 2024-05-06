---
sidebar_position: 4
---

# TLS security

Stalwart SMTP supports various security measures for secure email transmission, including DANE (DNS-Based Authentication of Named Entities), MTA-STS (Mail Transfer Agent Strict Transport Security) and TLS Reporting. DANE allows for secure authentication of mail servers using cryptographic certificates stored in the domain name system. MTA-STS enforces the use of encrypted connections between mail servers and requires that the recipient's mail server supports encryption. TLS Reporting helps organizations monitor the encryption status of their email delivery, providing information on whether messages are encrypted or not and if encryption is being used, what type of encryption is in use. These security measures aim to increase the privacy and security of email communications and prevent unauthorized access to sensitive information.

## DANE

DNS-Based Authentication for TLS (DANE) is a security protocol that uses the Domain Name System (DNS) to secure the authenticity of a server’s certificate. It allows a client to check if the certificate presented by a server matches the certificate stored in the DNS. This helps to prevent man-in-the-middle (MITM) attacks and to provide an additional layer of security compared to traditional certificate authorities.

With DANE, domain owners can publish their own certificate information in the DNS, providing an additional layer of security and protection against certificate fraud and misissuance. By performing the validation locally, the client can have a higher degree of confidence in the authenticity of the server's certificate and can detect if any tampering has occurred. DANE is particularly useful for organizations that operate their own mail servers as it provides them with a way to securely authenticate the server even if a certificate authority (CA) has been compromised.

DANE can be enabled in Stalwart SMTP with the `queue.outbound.tls.dane` property which accepts the following values:

- `optional`: Use DANE only if TLSA records for the domain are available.
- `require`: Require DANE and do not delivery unless a valid TLSA record is available (not recommended unless used under a custom rule).
- `disable`: Never use DANE.

Example:

```toml
[queue.outbound.tls]
dane = "optional"
```

## MTA-STS

MTA-STS, or Mail Transfer Agent Strict Transport Security, is a security mechanism for email systems to protect against eavesdropping and tampering of emails during transmission. It is designed to ensure that email is sent and received over secure connections, such as TLS.

MTA-STS works by publishing a policy statement in the form of a well-known DNS TXT record, specifying the email domains that support MTA-STS and the requirements for securing the email transmission. The receiving email server will retrieve the MTA-STS policy statement and verify that the incoming connection meets the security requirements specified in the policy. If the connection does not meet the requirements, the email will not be accepted and will be rejected. MTA-STS provides an additional layer of security for email transmission, making it harder for attackers to eavesdrop on or tamper with email messages. This can help prevent sensitive information from being intercepted or altered in transit, and provide a more secure email experience for users.

MTA-STS can be enabled in Stalwart SMTP with the `queue.outbound.tls.mta-sts` property which accepts the following values:

- `optional`: Use MTA-STS only if an STS policy for the domain has been published.
- `require`: Require MTA-STS and do not delivery unless a valid STS policy is available (not recommended unless used under a custom rule).
- `disable`: Never use MTA-STS.

Example:

```toml
[queue.outbound.tls]
mta-sts = "optional"
```

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

## TLS Reporting

TLS Reporting is a mechanism for reporting on the certificate validation outcomes performed by a mail transfer agent (MTA), such as Stalwart SMTP. It allows the recipient of an email to receive reports on the validity of the certificate used to secure the transport of the email, including information such as whether the certificate was valid, expired, or revoked. The goal of TLS Reporting is to provide a way to detect and address security issues with the certificates used to secure email communication, to ensure that email communication is secure and trustworthy. The reports can also be used to identify and correct misconfigurations of the sending MTA, and to improve the overall security of email communication.

Stalwart SMTP [automatically analyzes](/docs/smtp/authentication/analysis) TLS reports received from external hosts and can also generate aggregate reports to inform other hosts about the results of TLS validation. Outgoing TLS reports are configured under the `report.tls.aggregate` key using the following options:

- `from-name`: The name that will be used in the `From` header of the TLS report email.
- `from-address`: The email address that will be used in the `From` header of the TLS report email.
- `org-name`: The name of the organization to be included in the report.
- `send`: The frequency at which the TLS reports will be sent. The options are `hourly`, `daily`, `weekly`, or `never` to disable reporting.
- `max-size`: The maximum size of the TLS report in bytes.
- `sign`: The list of [DKIM](/docs/smtp/authentication/dkim/overview) signatures to use when signing the TLS report. 

Example:

```toml
[report.tls.aggregate]
from-name = "'TLS Report'"
from-address = "'noreply-tls@example.org'"
org-name = "'The Foobar Organization'"
contact-info = "'jane@example.org'"
send = "daily"
max-size = 26214400 # 25 mb
sign = "['rsa']"
```

The report submitter address can be configured using the `report.submitter` attribute. If not specified, the `key_get('default', 'hostname')` expression is be used.

For example:

```toml
[report]
submitter = "'mx.example.org'"
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
