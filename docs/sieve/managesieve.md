---
sidebar_position: 6
---

# ManageSieve

[ManageSieve](https://datatracker.ietf.org/doc/html/rfc5804) is a protocol designed for remotely managing Sieve scripts on a mail server. Sieve scripts are used to filter and sort incoming emails based on custom rules set by the user or the administrator. The ManageSieve protocol enables users to upload, download, edit, and delete their Sieve scripts from a remote location, typically through a supported email client or a dedicated web interface.
Functionality ManageSieve provides a straightforward method for managing email filters without needing direct access to the server's file system. This capability is essential for users who wish to have control over their email sorting and filtering criteria without requiring administrative assistance or technical expertise in server management.

Stalwart includes a ManageSieve server, which facilitates the remote management of Sieve scripts. This built-in feature enables users to handle their email filtering rules directly through compatible email clients or via a web interface, without the need to directly access the server’s backend.

## Listener

In order to enable ManageSieve access, a [listener](/docs/server/listener) has to be created with the `protocol` attribute set to `managesieve`.

For example:

```toml
[server.listener."sieve"]
bind = ["[::]:4190"]
protocol = "managesieve"
tls.implicit = true
```

By enabling ManageSieve, Stalwart allows users to have a dynamic and customizable approach to managing their email filters, enhancing both the functionality and accessibility of email management across the organization.
