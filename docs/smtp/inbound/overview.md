---
sidebar_position: 1
---

# Overview

In Stalwart SMTP Server, a "session" refers to a single incoming SMTP connection. Each SMTP session progresses through a series of distinct stages, each with its own distinct function and relevance. The stages of an SMTP session include the following:

- [Connect](#connect-stage): This is the initial stage, where the server and client establish a connection. 
- [EHLO](/docs/smtp/inbound/ehlo): This stage is where the client introduces itself to the server.
- [AUTH](/docs/smtp/inbound/auth): In this stage, the client provides authentication details to prove its identity to the server.
- [MAIL](/docs/smtp/inbound/mail): During the MAIL stage, the client specifies the sender of the email message.
- [RCPT](/docs/smtp/inbound/rcpt): This stage is where the client provides the recipient or recipients of the email.
- [DATA](/docs/smtp/inbound/data): The final stage, DATA, is where the client sends the actual content of the email to the server.

The configuration file of Stalwart SMTP contains dedicated sections for each of these stages. This makes it possible to apply specific settings or behaviors for each individual stage of an SMTP session.

Most of these stages support the use of [Sieve scripts](/docs/sieve/overview). Sieve is a language designed specifically for filtering email messages. By using Sieve scripts in different stages of an SMTP session, it's possible to create custom filters that can reject, alter, or reroute incoming messages based on a wide range of criteria. Sieve scripts can also modify the contents of incoming messages, such as changing headers or appending information to the body of an email. This flexibility makes Sieve an incredibly powerful tool for managing and customizing the behavior of an SMTP server.

## Limits

The limits for an SMTP session can be set under the session key with the following attributes:

- `timeout`: The time limit for inactivity before a session is terminated.
- `transfer-limit`: The maximum number of bytes that can be transmitted during a single SMTP session.
- `duration`: The maximum length of time for an SMTP session.

Example:

```toml
[session]
timeout = "5m"
transfer-limit = 262144000 # 250 MB
duration = "10m"
```

## Connect stage

Currently, the only configuration option available for the connect stage is the `session.connect.script` attribute, which specifies the name of the [Sieve script](/docs/sieve/overview) to run before the SMTP session begins. This can be useful for filtering connections based on their remote IP address, for example.

Example:

```toml
[session.connect]
script = "connect_filter"

[sieve.trusted.scripts]
connect_filter = '''
require ["variables", "reject"];

if string "${env.remote_ip}" "10.0.0.88" {
    reject "Your IP '${env.remote_ip}' is not welcomed here.";
}
'''
```
