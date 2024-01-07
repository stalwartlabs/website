---
sidebar_position: 1
---

# Overview

Stalwart IMAP supports the most recent [IMAP4rev2 protocol](https://www.rfc-editor.org/rfc/rfc9051.html) as well as the preceding [IMAP4rev1](https://www.rfc-editor.org/rfc/rfc3501). It also offers numerous [IMAP4 extensions](/docs/development/rfcs#imap4-and-extensions) and a [ManageSieve](https://datatracker.ietf.org/doc/html/rfc5804) server which allows users to manipulate their Sieve scripts.

## Listener

In order to be able to accept IMAP4 connections, a [listener](/docs/server/listener) has to be created with the `protocol` attribute set to `imap`. 

For example, to create a listener that accepts plain-text IMAP4 connections on port 143 and another one that accepts implicit TLS connections on port 993:

```toml
[server.listener."imap"]
bind = ["[::]:143"]
protocol = "imap"

[server.listener."imaptls"]
bind = ["[::]:993"]
protocol = "imap"
tls.implicit = true
```

## Data backend

Both Stalwart IMAP server and JMAP server share the same data, blob and full-text store backend. This means that they use the same storage for metadata, settings, indexes, emails, and other binary data. Please refer to the [Storage settings](/docs/storage/overview) section for more information on how to configure the data backend.

