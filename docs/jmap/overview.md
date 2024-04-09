---
sidebar_position: 1
---

# Overview

JMAP (JSON Meta Application Protocol) is a modern, efficient, and stateful protocol for synchronizing mail, calendars, and contacts between a client and a server. It operates over HTTP and uses JSON as its data format. This makes it highly accessible and easy to implement across various platforms. JMAP is designed to handle large amounts of data and manage this efficiently, offering performance benefits over traditional mail protocols. It offers a consistent interface for different types of data, making it easier for developers to understand and use. The protocol also provides built-in support for push updates, ensuring that changes are immediately reflected on all connected devices.

## Listener

In order to be able to accept JMAP connections, a [listener](/docs/server/listener) has to be created with the `protocol` attribute set to `http`.

For example:

```toml
[server.listener."jmap"]
bind = ["[::]:8080"]
protocol = "http"
tls.implicit = true
```
