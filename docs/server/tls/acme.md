---
sidebar_position: 3
---

# ACME

The Automatic Certificate Management Environment (ACME) protocol has revolutionized the way Transport Layer Security (TLS) certificates are issued and managed. This protocol automates the process of obtaining, installing, and renewing TLS/SSL certificates, which are crucial for securing network communications. TLS certificates provide authentication and encryption, ensuring that data transferred between users and servers remains private and secure.

ACME's ability to automate these tasks greatly simplifies certificate management, particularly for services like mail servers that require ongoing security maintenance. The protocol interacts with Certificate Authorities (CAs) to automate the verification of domain ownership and the issuance of certificates, significantly reducing manual effort and the risk of human error.

The integration of the Automatic Certificate Management Environment (ACME) protocol in the process of deploying TLS certificates brings a multitude of benefits, particularly in enhancing security and streamlining operational efficiency. One of the primary advantages is the substantial enhancement of security protocols. ACME's automated nature ensures that TLS certificates are always current and renewed before expiration. This continuous renewal process is crucial in maintaining a secure communication channel, as expired certificates can be a significant security liability, making the system vulnerable to various cyber threats.

Moreover, ACME's automation reduces the complexity and potential errors associated with manual certificate management. In traditional setups, the process of obtaining, installing, and periodically renewing TLS certificates can be labor-intensive and prone to human error. The automated processes ACME introduces negate these risks, ensuring a smoother, more reliable operation. This automation is particularly beneficial for organizations with limited IT resources, as it allows them to maintain high security standards without requiring extensive manual intervention.

Another significant benefit is cost-effectiveness. ACME, especially when used in conjunction with Certificate Authorities like Let's Encrypt, allows for the issuance of certificates at no additional cost. This accessibility is a game-changer for many organizations, as it reduces the financial barriers associated with securing their communications. By providing a free and automated way to obtain TLS certificates, ACME democratizes access to secure internet communications, making it feasible for even small-scale operators to maintain high security standards.

## Challenge Types

ACME verifies domain ownership through different challenge types: HTTP-01, DNS-01, and TLS-ALPN-01.

- **HTTP-01 Challenge**: This method requires the server to respond to a HTTP request made to a specific URL on the domain. It's suitable for services with an active web server.
- **DNS-01 Challenge**: This approach involves creating a specific DNS record in the domain’s DNS zone. It is useful for services that have control over their DNS records.
- **TLS-ALPN-01 Challenge**: This challenge type involves presenting a special TLS certificate to prove control over a domain. It's particularly relevant for services operating over TLS, such as mail servers.

## Configuration

Stalwart Mail Server supports automatic TLS deployment and renewals using the ACME protocol, enhancing security and ease of management for mail server administrators. However, as Stalwart does not have control over DNS settings, it supports only the `TLS-ALPN-01` challenge type. This choice aligns with the nature of mail server operations, where securing and automating TLS traffic is paramount.

ACME in configured in the `acme.<name>` section of the configuration file. The following attributes are available:

- `directory`: The directory URL of the ACME provider you're using. For Let's Encrypt, the live directory URL is `https://acme-v02.api.letsencrypt.org/directory` and is used for actual certificate issuance. The staging directory URL is `https://acme-staging-v02.api.letsencrypt.org/directory` and is primarily used for testing. 
- `contact`: Specifies the contact email address, which is used for important communications regarding your ACME account and certificates. 
- `cache`: Specifies the directory where ACME-related data will be stored. 
- `port`: ACME needs to verify domain ownership, which, for the `TLS-ALPN-01` challenge, is done via port `443`. If you're using a a reverse proxy and have configured Stalwart to listen on a different port, you can specify the port to use for the challenge here.
- `renew-before`: Determines how early before expiration the certificate should be renewed. The default setting is `30d`, which means that renewal attempts will start 30 days before the certificate expires.

The following example configures Stalwart to use Let's Encrypt's live directory URL:

```toml
[acme."letsencrypt"]
directory = "https://acme-v02.api.letsencrypt.org/directory"
contact = ["postmaster@%{DEFAULT_DOMAIN}%"]
cache = "%{BASE_PATH}%/etc/acme"
port = 443
renew-before = "30d"
```

ACME can be enabled globally by setting the `server.tls.acme` parameter to the name of the ACME provider you're using, for example:

```toml
[server.tls]
acme = "letsencrypt"
```

Or on a per-listener basis by setting the `server.listener.<id>.tls.acme` parameter in the listener's configuration:

```toml
[server.listener."smtp".tls]
acme = "letsencrypt"
```

:::tip Note

- Ensure your mail server's firewall and network configurations allow inbound connections on port 443, as this is essential for the ACME `TLS-ALPN-01` challenge.
- Regularly check your contact email for any communications from the ACME provider.
- It's recommended to initially use the staging environment to ensure your configuration works correctly before switching to the live environment to avoid hitting rate limits.

:::
