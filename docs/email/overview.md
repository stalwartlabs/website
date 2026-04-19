---
sidebar_position: 1
---

# Overview

Stalwart supports a range of email protocols to accommodate different organisational needs and to ensure compatibility with various email clients and devices. Supported protocols are JMAP, the latest and preceding versions of the Internet Message Access Protocol (IMAP), and the Post Office Protocol version 3 (POP3).

Protocol-level parameters (limits, timeouts, rate limits, default folders, encryption, compression) are set on dedicated singletons: [Jmap](/docs/ref/object/jmap) (found in the WebUI under <!-- breadcrumb:Jmap --><!-- /breadcrumb:Jmap -->), [Imap](/docs/ref/object/imap) (found in the WebUI under <!-- breadcrumb:Imap --><!-- /breadcrumb:Imap -->), and [Email](/docs/ref/object/email) (found in the WebUI under <!-- breadcrumb:Email --><!-- /breadcrumb:Email -->). Transport-level settings (bind addresses, ports, TLS) live on individual [NetworkListener](/docs/ref/object/network-listener) objects (found in the WebUI under <!-- breadcrumb:NetworkListener --><!-- /breadcrumb:NetworkListener -->).

## JMAP for Mail

JMAP (JSON Meta Application Protocol) is a modern, stateful protocol for synchronising mail, calendars, and contacts between a client and a server. It operates over HTTP and uses JSON as its data format. JMAP is designed to handle large amounts of data efficiently, offers a consistent interface for different data types, and provides built-in support for push updates so that changes are reflected on all connected devices.

To accept JMAP connections, a NetworkListener must be created with [`protocol`](/docs/ref/object/network-listener#protocol) set to `"http"`. For example, an implicit-TLS listener on port 8080:

```json
{
  "name": "jmap",
  "protocol": "http",
  "bind": ["[::]:8080"],
  "tlsImplicit": true
}
```

## IMAP4

Stalwart is compatible with the most recent version, [IMAP4rev2 protocol](https://www.rfc-editor.org/rfc/rfc9051.html), as well as the widely used [IMAP4rev1](https://www.rfc-editor.org/rfc/rfc3501). These protocols allow users to access their emails from multiple clients simultaneously and manage their messages directly on the mail server, giving flexibility and real-time synchronisation of email state across devices. In addition to basic IMAP support, Stalwart includes a number of [IMAP4 extensions](/docs/development/rfcs#imap4-and-extensions).

To accept IMAP4 connections, a NetworkListener must be created with [`protocol`](/docs/ref/object/network-listener#protocol) set to `"imap"`. For example, a plain-text listener on port 143 and an implicit-TLS listener on port 993:

```json
[
  {"name": "imap", "protocol": "imap", "bind": ["[::]:143"]},
  {"name": "imaptls", "protocol": "imap", "bind": ["[::]:993"], "tlsImplicit": true}
]
```

## POP3

Stalwart also supports POP3, an older email protocol designed for simple, one-way downloading of messages from the server to the email client. Once downloaded, emails are typically deleted from the server unless configured otherwise, making POP3 less flexible than IMAP.

While POP3 can be useful for single-device email access or specific legacy applications, it lacks features that many deployments require today, such as multi-device synchronisation and server-side message management. Given its limitations and the security implications of less secure legacy protocols, POP3 should be disabled unless there is a specific need, such as compatibility requirements for legacy devices.

To accept POP3 connections, a NetworkListener must be created with [`protocol`](/docs/ref/object/network-listener#protocol) set to `"pop3"`. For example, a plain-text listener on port 110 and an implicit-TLS listener on port 995:

```json
[
  {"name": "pop3", "protocol": "pop3", "bind": ["[::]:110"]},
  {"name": "pop3s", "protocol": "pop3", "bind": ["[::]:995"], "tlsImplicit": true}
]
```
