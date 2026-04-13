---
sidebar_position: 1
---

# Overview

A Message Transfer Agent (MTA) is a core component of email infrastructure responsible for transferring email messages from one server to another using the Simple Mail Transfer Protocol (SMTP). MTAs handle message routing, queuing, delivery attempts, and message handoff between different servers, playing a crucial role in ensuring reliable and standards-compliant email communication.

SMTP is the protocol used for the transmission of electronic mail across IP networks. It operates by establishing a connection between servers to transfer messages, handling aspects such as message envelopes, routing paths, and error handling. Modern MTAs also incorporate security, authentication, and policy enforcement mechanisms to comply with current standards and combat abuse.

Stalwart's MTA is a high-performance, standards-compliant SMTP server designed to serve both inbound and outbound email flows. It includes native support for email authentication standards such as DMARC, DKIM, SPF, and ARC, ensuring message integrity and domain validation. To secure message transport, Stalwart implements DANE, MTA-STS, and SMTP TLS reporting, enabling secure and verifiable transmission over TLS.

Beyond authentication and transport security, Stalwart offers comprehensive mechanisms for managing incoming traffic. These include inbound connection throttling, advanced filtering capabilities using configurable rules, support for Sieve scripting, MTA-level hooks, and milter integration.

For outbound delivery, Stalwart features a distributed virtual queue architecture with support for delayed and priority delivery, delivery quotas, routing rules, and sender- or domain-specific throttling. It also provides mechanisms for envelope rewriting and message modification, allowing administrators to adapt message content and routing to meet deployment-specific requirements.

This documentation provides a detailed guide to configuring and operating the Stalwart MTA, including its features, integration options, and deployment considerations.

## Configuration

In Stalwart, the SMTP service is enabled by creating one or more listeners. A listener essentially acts as a point of entry for SMTP or LMTP connections, listening on a specific port for any incoming connections. Administrators can set up multiple listeners, each potentially serving different roles or catering to different types of connections. Stalwart imposes no limit on the number of listeners that can be created, providing administrators with the flexibility to manage incoming connections as they see fit.

The behavior of each listener can be customized by the administrator. This includes defining which types of connections are accepted, the specific actions to take upon receiving a connection, and the rules and scripts to be applied during the handling of the session. In conventional SMTP server configurations, certain ports are predetermined for specific types of SMTP connections: port 25 is typically used for unencrypted SMTP, port 587 for SMTP submissions, and port 465 for TLS encrypted SMTP submissions. Stalwart, however, does not impose these specific associations. Instead, it leaves the decision entirely to the administrator, allowing each listener's function to be defined as per specific requirements.

For more information on how to configure listeners, see the main [listeners](/docs/server/listener) section.

### SMTP port

Unencrypted SMTP connections are received on port 25 by default. This is the standard port for SMTP, and is used by mail servers to send email to each other. To enable unencrypted SMTP connections, create a listener with the following configuration:

```toml
[server.listener."smtp"]
bind = "[::]:25"
protocol = "smtp"
```

To change the default SMTP greeting that is sent to connecting clients, set your custom greeting in the `server.listener.<id>.greeting` attribute. For example:

```toml
[server.listener."smtp"]
bind = "[::]:25"
protocol = "smtp"
greeting = "Welcome to Stalwart!"
```

### Submissions port (TLS)

SMTP submissions with implicit TLS are received on port 465 by default. This is the standard port for SMTP submissions with native implicit TLS, and is used by mail clients to send email to mail servers. To enable SMTP submissions with native implicit TLS, create a listener with the following configuration:

```toml
[server.listener."submissions"]
bind = ["[::]:465"]
protocol = "smtp"
tls.implicit = true
```

### Submissions port

SMTP submissions without implicit TLS are received on port 587 by default. This is the standard port for SMTP submissions on a clear-text connection (which can then be upgraded to TLS using the `STARTTLS` command), and is used by mail clients to send email to mail servers. To enable SMTP submissions, create a listener with the following configuration:

```toml
[server.listener."submission"]
bind = ["[::]:587"]
protocol = "smtp"
```

### LMTP port

LMTP is a protocol that is used to deliver email to a mail server. It is similar to SMTP, but is designed to be used by mail servers to deliver email to each other. LMTP is received on port 24 by default. To enable LMTP connections, create a listener with the following configuration:

```toml
[server.listener."lmtp"]
bind = ["[::]:24"]
protocol = "lmtp"
```

There is no need to enable LMTP if you are only using Stalwart to receive email from other mail servers. LMTP is only necessary if you are not using Stalwart as your primary mail server.
