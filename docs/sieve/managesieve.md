---
sidebar_position: 6
---

# ManageSieve

[ManageSieve](https://datatracker.ietf.org/doc/html/rfc5804) is a protocol for remotely managing Sieve scripts on a mail server. Sieve scripts filter and sort incoming email based on rules defined by the user or the administrator. ManageSieve provides a standard way to upload, download, edit, and delete those scripts from a remote client, typically a supported email client or a web interface.

Stalwart includes a ManageSieve server, so Sieve scripts can be managed over the network without direct access to the server's file system.

## Listener

To enable ManageSieve access, create a [network listener](/docs/server/listener) with its protocol set to `manageSieve`. Listeners are configured through the [NetworkListener](/docs/ref/object/network-listener) object (found in the WebUI under <!-- breadcrumb:NetworkListener --><!-- /breadcrumb:NetworkListener -->). The relevant fields are [`bind`](/docs/ref/object/network-listener#bind), [`protocol`](/docs/ref/object/network-listener#protocol), and [`tlsImplicit`](/docs/ref/object/network-listener#tlsimplicit).

For example, a listener named `sieve` that binds to port 4190 on all interfaces with implicit TLS:

```json
{
  "name": "sieve",
  "bind": ["[::]:4190"],
  "protocol": "manageSieve",
  "tlsImplicit": true
}
```

Once the listener is active, users can manage their Sieve scripts through any compatible ManageSieve client or through the WebUI.
