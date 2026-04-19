---
sidebar_position: 2
---

# DANE

DNS-Based Authentication for TLS (DANE) is a security protocol that uses the Domain Name System (DNS) to secure the authenticity of a server’s certificate. It allows a client to check if the certificate presented by a server matches the certificate stored in the DNS. This helps to prevent man-in-the-middle (MITM) attacks and to provide an additional layer of security compared to traditional certificate authorities.

With DANE, domain owners can publish their own certificate information in the DNS, providing an additional layer of security and protection against certificate fraud and misissuance. By performing the validation locally, the client can have a higher degree of confidence in the authenticity of the server's certificate and can detect if any tampering has occurred. DANE is particularly useful for organizations that operate their own mail servers as it provides them with a way to securely authenticate the server even if a certificate authority (CA) has been compromised.

## Configuration

DANE enforcement is configured per TLS strategy on the [MtaTlsStrategy](/docs/ref/object/mta-tls-strategy) object (found in the WebUI under <!-- breadcrumb:MtaTlsStrategy --><!-- /breadcrumb:MtaTlsStrategy -->). The [`dane`](/docs/ref/object/mta-tls-strategy#dane) field accepts one of:

- `optional`: use DANE only if TLSA records for the domain are available.
- `require`: require DANE and refuse delivery unless a valid TLSA record is available. Not recommended as a global default.
- `disable`: never use DANE.

## TLSA records

TLSA records are DNS records containing the certificate information for a domain. They are used by DANE to authenticate the server's certificate. A TLSA record contains:

- **Usage**: specifies how the certificate is used.
- **Selector**: specifies which part of the certificate is used.
- **Matching Type**: specifies how the certificate is matched.
- **Certificate Association Data**: the certificate data itself.

Stalwart automatically generates TLSA records for the TLS certificates it uses. Generated TLSA records for a domain are available in the [WebUI](/docs/management/webui/overview) under Management > Directory > Domains.
