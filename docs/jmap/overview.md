---
sidebar_position: 1
---

# Overview

JMAP (JSON Meta Application Protocol) is a modern, efficient, and stateful protocol for synchronizing mail, calendars, and contacts between a client and a server. It operates over HTTP and uses JSON as its data format. This makes it highly accessible and easy to implement across various platforms. JMAP is designed to handle large amounts of data and manage this efficiently, offering performance benefits over traditional mail protocols. It offers a consistent interface for different types of data, making it easier for developers to understand and use. The protocol also provides built-in support for push updates, ensuring that changes are immediately reflected on all connected devices.

## Listener

In order to be able to accept JMAP connections, a [listener](/docs/configuration/listener) has to be created with the `protocol` attribute set to `jmap`. The JMAP listener expects an additional attribute `url` to be set, which is the URL that JMAP clients will use to connect to the server. 

For example:

```toml
[server.listener."jmap"]
bind = ["0.0.0.0:8080"]
url = "jmap.example.org:8080"
protocol = "jmap"
```

## Authentication

User authentication is handled by the [directory](/docs/directory/overview) specified in the `jmap.directory` configuration attribute. This means that the credentials provided by a user are validated against the information stored in the designated directory. Depending on your setup, the directory could be configured to authenticate against different sources, such as SQL, LDAP, or a static in-memory directory. 

For example:

```toml
[jmap]
directory = "sql"
```