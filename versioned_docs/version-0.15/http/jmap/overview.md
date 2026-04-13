---
sidebar_position: 1
---

# Overview

JMAP (JSON Meta Application Protocol) is a modern, efficient, and stateful protocol for synchronizing mail, calendars, and contacts between a client and a server. It operates over HTTP and uses JSON as its data format. This makes it highly accessible and easy to implement across various platforms. JMAP is designed to handle large amounts of data and manage this efficiently, offering performance benefits over traditional mail protocols. It offers a consistent interface for different types of data, making it easier for developers to understand and use. The protocol also provides built-in support for push updates, ensuring that changes are immediately reflected on all connected devices.

## Enabling JMAP

In order to be able to accept JMAP connections, a [listener](/docs/server/listener) has to be created with the `protocol` attribute set to `http`. 

For example:

```toml
[server.listener."jmap"]
bind = ["[::]:443"]
protocol = "http"
tls.implicit = true
```

Note that this step is usually not required as, in most setups, an `http` listener is created automatically during the installation process.

## Accessing JMAP

Most JMAP clients will automatically discover the JMAP endpoint using the well-known resource located at `/.well-known/jmap`. This well-known resource provides information about the JMAP endpoint, including its URL and other details.
The JMAP endpoint itself is located at `/jmap`, and it serves as the primary access point for clients to interact with the JMAP API. Clients can use this endpoint to perform various operations, such as retrieving messages, managing mailboxes, and synchronizing data.

## Disabling JMAP

By default, JMAP access is enabled in Stalwart when an HTTP listener is configured. This allows users to take advantage of the JMAP protocol without additional setup. However, some organizations may wish to limit or disable JMAP access entirely for security, compliance, or policy reasons.

The most straightforward way to disable JMAP access server-wide is by creating an [HTTP access control rule](/docs/http/access-control) that blocks incoming requests to any path under `/jmap`. This effectively prevents clients from accessing all JMAP related endpoints regardless of user account settings.

For more granular control, JMAP access can also be restricted on a per-user, per-group, or per-tenant basis. This is done by removing the relevant [JMAP permissions](/docs/auth/authorization/permissions) from the corresponding account or entity. Specifically, administrators can revoke the specific JMAP permissions, ensuring that only authorized users or organizational units are allowed to access those services.

