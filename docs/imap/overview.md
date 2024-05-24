---
sidebar_position: 1
---

# Overview

Stalwart Mail Server supports a comprehensive range of email protocols to accommodate diverse organizational needs and ensure compatibility with various email clients and devices. This includes support for the latest and preceding versions of the Internet Message Access Protocol (IMAP) as well as the Post Office Protocol version 3 (POP3).

## IMAP4

Stalwart Mail Server is compatible with the most recent version, [IMAP4rev2 protocol](https://www.rfc-editor.org/rfc/rfc9051.html), as well as the widely used [IMAP4rev1](https://www.rfc-editor.org/rfc/rfc3501). These protocols allow users to access their emails from multiple clients simultaneously and manage their messages directly on the mail server, which offers flexibility and real-time synchronization of email status across devices. In addition to basic IMAP support, Stalwart Mail Server includes numerous [IMAP4 extensions](/docs/development/rfcs#imap4-and-extensions) that enhance functionality.

In order to be able to accept IMAP4 connections, a [listener](/docs/server/listener) has to be created with the `protocol` attribute set to `imap`. For example, to create a listener that accepts plain-text IMAP4 connections on port 143 and another one that accepts implicit TLS connections on port 993:

```toml
[server.listener."imap"]
bind = ["[::]:143"]
protocol = "imap"

[server.listener."imaptls"]
bind = ["[::]:993"]
protocol = "imap"
tls.implicit = true
```

## POP3

Stalwart Mail Server also supports POP3, an older email protocol designed for simple, one-way downloading of messages from the server to the email client. Once downloaded, emails are typically deleted from the server unless configured otherwise, making POP3 less flexible compared to IMAP.

While POP3 can be useful for single-device email access or specific legacy applications, it lacks the versatility and features that many users require today, such as multi-device synchronization and server-side message management. Given its limitations and the security implications of less secure legacy protocols, it is recommended to disable POP3 unless there is a specific need within the organization, such as compatibility requirements for legacy devices.

In order to be able to accept POP3 connections, a [listener](/docs/server/listener) has to be created with the `protocol` attribute set to `pop3`. For example, to create a listener that accepts plain-text POP3 connections on port 110 and another one that accepts implicit TLS connections on port 995:

```toml
[server.listener."pop3"]
bind = ["[::]:110"]
protocol = "pop3"

[server.listener."pop3s"]
bind = ["[::]:995"]
protocol = "pop3"
tls.implicit = true
```
