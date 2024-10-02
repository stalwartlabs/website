---
sidebar_position: 4
---

# Interoperability

OAuth is widely used in web-based applications to provide secure, token-based authentication and authorization. In Stalwart Mail Server, OAuth can be used seamlessly to access [JMAP](/docs/jmap/overview) as well as its [Webadmin](/docs/management/webadmin/overview) or [self-service portals](/docs/management/webadmin/selfservice), as these are web-based interfaces that natively support OAuth flows. This usage aligns with the typical OAuth implementation where users authenticate through a browser, and the application interacts with the OAuth server to obtain and validate access tokens.

However, using OAuth in traditional mail clients, such as Outlook, Thunderbird, or Apple Mail, introduces additional complexities. To achieve this, the mail client needs to support the **OAUTHBEARER** Simple Authentication and Security Layer (SASL) mechanism, which allows OAuth tokens to be used for authenticating against the mail server.

## SASL and OAuth

**SASL (Simple Authentication and Security Layer)** is a framework that abstracts authentication methods, allowing various protocols (such as IMAP, SMTP, and POP3) to support different authentication mechanisms in a uniform way. When a mail client interacts with a mail server, SASL enables the client to negotiate and use the appropriate authentication method, such as plain text login, GSSAPI (Kerberos), or OAuth-based mechanisms.

With the **OAUTHBEARER** SASL mechanism, OAuth tokens can be used for authentication. Instead of sending a password, the client submits an OAuth access token to the mail server as a "bearer token." The server, in turn, validates the token with the OAuth provider (in this case, the built-in OAuth server of Stalwart Mail Server) to grant access.

This integration allows OAuth to be used within the traditional mail protocols like IMAP or SMTP, enabling a secure and passwordless authentication method. However, for this to work, the mail client must explicitly support the **OAUTHBEARER** SASL mechanism.

## Limitations

Unfortunately, most mainstream mail clients, including Outlook, Thunderbird, and Apple Mail, do not natively support the **OAUTHBEARER** SASL mechanism with third-party OAuth providers like Stalwart Mail Server. As a result, even though OAuth is a secure and modern authentication method, it cannot be directly used with these clients to authenticate with Stalwart Mail Server through standard mail protocols like IMAP or SMTP.

Since most email clients are unable to handle OAuth tokens directly via the OAUTHBEARER SASL mechanism, the only practical workaround is to use [App Passwords](/docs/directory/authentication/app-password) for these clients. An **App Password** is a specific, randomly generated password that bypasses the usual OAuth authentication flow but allows secure login. This solution is especially useful in environments where OAuth is enforced, yet compatibility with non-OAuth-compliant clients is still necessary.
