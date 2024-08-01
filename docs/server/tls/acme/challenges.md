---
sidebar_position: 2
---

# Challenge Types

The ACME protocol supports several types of challenges to prove control over a domain name. Each challenge type verifies that the ACME client (in this case, Stalwart Mail Server) controls the domain it claims to represent. The choice of challenge depends on the user’s environment and the specific security requirements:

- **HTTP-01 Challenge**: This method requires the server to respond to a HTTP request made to a specific URL on the domain. It's suitable for services with an active web server.
- **DNS-01 Challenge**: This approach involves creating a specific DNS record in the domain’s DNS zone. It is useful for services that have control over their DNS records.
- **TLS-ALPN-01 Challenge**: This challenge type involves presenting a special TLS certificate to prove control over a domain. It's particularly relevant for services operating over TLS, such as mail servers.

## HTTP-01

The HTTP-01 challenge is designed to prove control over a domain by making an HTTP request to it.

Process:

- **Token Creation**: The ACME server generates a token and sends it to Stalwart Mail Server.
- **File Creation**: Stalwart Mail Server creates a file containing the token and a key authorization derived from the token and the server’s ACME account key.
- **File Placement**: This file is at `http://<YOUR_DOMAIN>/.well-known/acme-challenge/<TOKEN>`, which is accessible via the web on port 80.
- **Verification**: The ACME server accesses the URL. If the server retrieves the correct response, the domain validation is considered successful.

Considerations:

- The domain must resolve publicly to the server where the challenge response is hosted.
- Port 80 must be open to inbound connections.
- This challenge does not validate any request for domain depth (e.g., subdomains).

## DNS-01

The DNS-01 challenge validates domain ownership by requiring the user to create a DNS record.

Process:

- **Token Creation**: The ACME server provides a token to Stalwart Mail Server.
- **Record Creation**: Stalwart Mail Server uses the token to create a TXT record for the domain in the format `_acme-challenge.<YOUR_DOMAIN>`.
- **Record Placement**: The TXT record's value is set to a key authorization digest, which is a SHA-256 digest of the token combined with the server's ACME account key.
- **Verification**: The ACME server queries the DNS records for the TXT entry. If the TXT record matches the expected digest, the domain is considered validated.

Considerations:

- The DNS changes must propagate fully before verification can succeed, which can take time.
- Useful for scenarios where direct web traffic control is not feasible.
- Supports wildcard certificate issuance as it validates the domain at a higher level.

## TLS-ALPN-01

The TLS-ALPN-01 challenge uses the TLS Application-Layer Protocol Negotiation extension and a specific ACME validation protocol to prove domain control.

Process:

- **Token Creation**: The ACME server sends a token to Stalwart Mail Server.
- **Certificate Generation**: Stalwart Mail Server generates a self-signed certificate that includes the token and a specific ACME OID in the Subject Alternative Name (SAN) extension.
- **TLS Configuration**: Stalwart configures itself to respond to HTTPS (port 443) requests using the ACME-specific TLS-ALPN protocol ID.
- **Verification**: The ACME server connects to the domain via TLS-ALPN. If the server presents the correct certificate, the domain is validated.

Considerations:

- Requires configuration at the TLS layer, which can be complex.
- Port 443 must be open to inbound connections.
- Particularly useful for environments where HTTP traffic is restricted or where DNS changes are infeasible.

## Choosing the Right Challenge

When setting up Stalwart Mail Server to use the Automated Certificate Management Environment (ACME) protocol for SSL/TLS certificate management, selecting the appropriate challenge type is crucial. This short guide will help you decide between HTTP-01, DNS-01, and TLS-ALPN-01 challenges based on your server configuration and specific requirements.

#### HTTP-01
This is the most straightforward method if your server has port 80 open and accessible from the internet. The HTTP-01 challenge proves control over your domain by responding to HTTP requests from the ACME server.
  
- **Advantages**: Simple setup; does not require DNS record management.
- **Disadvantages**: Does not support wildcard certificates and requires port 80 to be open, which might not be preferable for all configurations.

#### TLS-ALPN-01

If your server has port 443 open and reachable, the TLS-ALPN-01 challenge is recommended. This challenge verifies domain control by using TLS with the ACME-specific Application Layer Protocol Negotiation (ALPN) protocol.

- **Advantages**: Works well in environments where HTTP traffic is restricted; suitable for securing communications on the standard HTTPS port.
- **Disadvantages**: Does not support wildcard certificates and does not work behind certain types of reverse proxies or firewalls; use `DNS-01` if `HTTP-01` if this is your case.

#### DNS-01

The DNS-01 challenge should be used if you need to issue wildcard certificates, as it is the only challenge type that supports them. This method involves creating a TXT record in your DNS configuration.

- **Advantages**: Supports wildcard certificates; does not require any specific ports to be open.
- **Disadvantages**: Requires DNS management capabilities and may take longer due to DNS propagation times.

