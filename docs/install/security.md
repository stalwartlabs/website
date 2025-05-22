---
sidebar_position: 6
---

# Securing your server

Stalwart is secure by design. From the moment it's deployed, it applies safe, [security-conscious defaults](/docs/configuration/overview#safe-defaults) that follow best practices for modern mail server operation. Out of the box, it includes built-in defense mechanisms to [protect against common threats](/docs/server/auto-ban). For example, Stalwart can automatically detect and block IP addresses that attempt brute-force password attacks, guess account names, scan for vulnerabilities, or launch SYN flood attacks. These protections operate continuously to reduce the risk of abuse and compromise.

While Stalwart provides a strong security foundation, server administrators still play a critical role in maintaining a secure environment. This section offers additional recommendations and best practices to further harden your server, minimize attack surfaces, and ensure safe operation in a variety of deployment scenarios—from small personal setups to large, internet-facing infrastructure.

## Disable unused ports

To simplify initial setup, Stalwart enables network listeners for all supported services by default, including IMAP, HTTP, SMTP, POP3, and ManageSieve. While this ensures that the server is immediately functional in most environments, it is strongly recommended that administrators **disable any services and their associated ports that are not actively in use**. Doing so improves security, reduces the server’s attack surface, and minimizes resource usage.

Unused ports represent potential entry points for attackers. Even if the underlying service is secure, each open port can still be subject to brute-force attempts, protocol-specific exploits, or resource exhaustion attacks. Therefore, as a best practice, only enable the ports and services you actually require.

Administrators can disable unused ports in one of two ways:

- **Remove the corresponding [listener](/docs/server/listener) from the Stalwart configuration**—this ensures that the service no longer binds to the port.
- **Block incoming traffic at the network or host firewall level**, which prevents external access even if the listener is active internally.

Stalwart uses a variety of ports to support email delivery, access, and administrative tasks. Knowing what each port does will help you decide which ones to keep open and which can be safely closed.

The essential ports are:

- **Port 25 (SMTP)**: Used for receiving email from other mail servers. This port must remain open for your domain to receive external email traffic reliably.
- **Port 465 (SMTPS)**: Handles email submission with implicit TLS encryption. Recommended for securely sending outgoing mail from user clients. It is best to keep this port open and use it in preference to port 587.
- **Port 993 (IMAPS)**: IMAP over implicit TLS. Required for secure email access via IMAP clients. Keep this port open to allow encrypted mail retrieval.
- **Port 443 (HTTPS)**: A critical port used for multiple secure web-based services, including [web administration](/docs/management/webadmin/overview), [JMAP](/docs/http/jmap/overview), [REST API](/docs/api/management/overview), [OAuth](/docs/auth/oauth/overview), TLS certificate provisioning ([ACME challenges](/docs/server/tls/acme/challenges#tls-alpn-01)), [autoconfig](/docs/server/autoconfig), and [MTA-STS](/docs/mta/transport-security/mta-sts#policy-publishing). This port must remain open in nearly all deployments.


The non-essential ports are:

- **Port 587 (SMTP Submission)**: Handles email submission using STARTTLS. If all your clients are configured to use port 465 with implicit TLS, port 587 can be disabled for simplicity and security.
- **Port 143 (IMAP4)**: The standard IMAP port without encryption. This port should generally be disabled in favor of the encrypted IMAPS port (993).
- **Port 4190 (ManageSieve)**: Used to manage Sieve scripts remotely. Only keep this port open if your users actively use Sieve for email filtering rules.
- **Port 110 (POP3)** and **Port 995 (POP3S)**: These are used for retrieving email via POP3. Unless you have a legacy requirement or specific use case, POP3 is largely obsolete in favor of IMAP and can usually be disabled.
- **Port 8080 (HTTP)**: Provided mainly for initial setup. It is strongly recommended to disable this port after setup is complete to prevent unauthenticated, unencrypted access.

By carefully reviewing and disabling any unused network ports, you can significantly strengthen your server’s security posture. Whether you're running a small private mail server or a production system, this step is essential for reducing exposure to potential attacks. Use either Stalwart’s configuration system or your server’s firewall to enforce these changes consistently.

## Enforce HTTP Access Control

Stalwart’s HTTP listener plays a central role in enabling many of the server's modern capabilities. It is used to provide access to a range of services, including JMAP, WebDAV, management APIs, ACME certificate issuance, autoconfig/autodiscover protocols, `.well-known` resources, metrics endpoints, and OAuth-based authentication.

While this broad functionality is powerful, it also means that the HTTP listener exposes multiple endpoints by default. In scenarios where you want to allow access to only a subset of these features—such as enabling JMAP but disabling WebDAV or public metrics access—you will need to define [HTTP Access Control rules](/docs/http/access-control).

HTTP Access Control rules are logical expressions evaluated for every incoming HTTP request. These rules determine whether access to a particular URL should be granted, based on criteria such as the request path, method, source IP, authentication status, or other conditions. This provides fine-grained control over which HTTP endpoints are accessible and under what circumstances.

To tighten security and reduce unnecessary exposure, it is highly recommended to review the [list of HTTP paths used by Stalwart](/docs/http/overview) and explicitly disable access to any endpoints that are not needed in your deployment. This is especially important for internet-facing servers, where unused or misconfigured services could be targeted.

You can implement access restrictions by creating appropriate [HTTP Access Control rules](/docs/http/access-control) in your configuration. These rules allow you to enforce access policies tailored to your use case, ensuring that only the necessary HTTP-based services are available.

Taking the time to configure HTTP Access Control not only improves your server’s security but also enhances its performance and predictability by eliminating unwanted or unused endpoints.

## Understand administrator roles

When Stalwart is launched for the first time, it automatically creates a [fall-back administrator account](/docs/auth/authorization/administrator#fallback-administrator). This account is designed to facilitate the **initial configuration** of the server and to act as an **emergency access mechanism** in case the external directory service becomes unavailable or misconfigured. The fall-back admin has **full, unrestricted access** to all server functionalities, making it a powerful but sensitive account.

While this account is essential during setup, it is [strongly recommended to disable the fall-back administrator](/docs/auth/authorization/administrator#best-practices) once the server is fully configured. Keeping it active unnecessarily increases the risk of unauthorized access or privilege escalation. The account should only be re-enabled when absolutely needed, such as during a critical recovery scenario.

For day-to-day operations, it is best practice to define **multiple administrator accounts with specific, limited [permissions](/docs/auth/authorization/permissions)**. For instance, one admin might be responsible only for managing user accounts, another for modifying server configurations, and another for overseeing the SMTP queue. Although dividing responsibilities in this way might seem inconvenient, it significantly reduces the potential impact of compromised credentials or accidental misconfiguration by limiting access to only the necessary functions.

In addition to role separation, it is vital to enforce a key security rule: **administrator accounts should never be used to access IMAP, JMAP, or WebDAV services**. These services are intended for regular user access and should be isolated from administrative functions to prevent misuse or exposure of elevated credentials through client software.

By defining clear administrative roles and restricting unnecessary privileges, you enhance both the **security and maintainability** of your mail server environment.
