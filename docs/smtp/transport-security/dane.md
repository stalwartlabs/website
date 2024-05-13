---
sidebar_position: 2
---

# DANE

DNS-Based Authentication for TLS (DANE) is a security protocol that uses the Domain Name System (DNS) to secure the authenticity of a server’s certificate. It allows a client to check if the certificate presented by a server matches the certificate stored in the DNS. This helps to prevent man-in-the-middle (MITM) attacks and to provide an additional layer of security compared to traditional certificate authorities.

With DANE, domain owners can publish their own certificate information in the DNS, providing an additional layer of security and protection against certificate fraud and misissuance. By performing the validation locally, the client can have a higher degree of confidence in the authenticity of the server's certificate and can detect if any tampering has occurred. DANE is particularly useful for organizations that operate their own mail servers as it provides them with a way to securely authenticate the server even if a certificate authority (CA) has been compromised.

## Configuration

DANE can be enabled in Stalwart SMTP with the `queue.outbound.tls.dane` property which accepts the following values:

- `optional`: Use DANE only if TLSA records for the domain are available.
- `require`: Require DANE and do not delivery unless a valid TLSA record is available (not recommended unless used under a custom rule).
- `disable`: Never use DANE.

Example:

```toml
[queue.outbound.tls]
dane = "optional"
```

## TLSA Records

TLSA records are DNS records that contain the certificate information for a domain. They are used by DANE to authenticate the server's certificate. A TLSA record contains the following information:

- **Usage**: Specifies how the certificate is used.
- **Selector**: Specifies which part of the certificate is used.
- **Matching Type**: Specifies how the certificate is matched.
- **Certificate Association Data**: Contains the certificate data.

Stalwart Mail server automatically generates the TLSA records for the TLS certificates it uses. To obtain the TLSA records for a domain, go to the `Management` > `Directory` > `Domains` section in the [Webadmin](/docs/management/webadmin/overview.md).
