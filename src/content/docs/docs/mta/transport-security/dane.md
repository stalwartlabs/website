---
sidebar_position: 2
title: "DANE"
---

DNS-Based Authentication for TLS (DANE) is a security protocol that uses the Domain Name System (DNS) to secure the authenticity of a server’s certificate. It allows a client to check if the certificate presented by a server matches the certificate stored in the DNS. This helps to prevent man-in-the-middle (MITM) attacks and to provide an additional layer of security compared to traditional certificate authorities.

With DANE, domain owners can publish their own certificate information in the DNS, providing an additional layer of security and protection against certificate fraud and misissuance. By performing the validation locally, the client can have a higher degree of confidence in the authenticity of the server's certificate and can detect if any tampering has occurred. DANE is particularly useful for organizations that operate their own mail servers as it provides them with a way to securely authenticate the server even if a certificate authority (CA) has been compromised.

## Configuration

DANE enforcement is configured per TLS strategy on the [MtaTlsStrategy](/docs/ref/object/mta-tls-strategy) object (found in the WebUI under <!-- breadcrumb:MtaTlsStrategy --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Outbound › TLS Strategies<!-- /breadcrumb:MtaTlsStrategy -->). The [`dane`](/docs/ref/object/mta-tls-strategy#dane) field accepts one of:

- `optional`: use DANE only if TLSA records for the domain are available.
- `require`: require DANE and refuse delivery unless a valid TLSA record is available. Not recommended as a global default.
- `disable`: never use DANE.

## TLSA records

TLSA records are DNS records containing the certificate information for a domain. They are used by DANE to authenticate the server's certificate. A TLSA record contains:

- **Usage**: specifies how the certificate is used.
- **Selector**: specifies which part of the certificate is used.
- **Matching Type**: specifies how the certificate is matched.
- **Certificate Association Data**: the certificate data itself.

Stalwart automatically generates TLSA records for the TLS certificates it uses. Generated TLSA records for a domain are available in the [WebUI](/docs/management/webui/) under Management > Directory > Domains.
