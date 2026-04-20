---
sidebar_position: 6
---

# ManageSieve

[ManageSieve](https://datatracker.ietf.org/doc/html/rfc5804) is a protocol for remotely managing Sieve scripts on a mail server. Sieve scripts filter and sort incoming email based on rules defined by the user or the administrator. ManageSieve provides a standard way to upload, download, edit, and delete those scripts from a remote client, typically a supported email client or a web interface.

Stalwart includes a ManageSieve server, so Sieve scripts can be managed over the network without direct access to the server's file system.

## Listener

To enable ManageSieve access, create a [network listener](/docs/server/listener) with its protocol set to `manageSieve`. Listeners are configured through the [NetworkListener](/docs/ref/object/network-listener) object (found in the WebUI under <!-- breadcrumb:NetworkListener --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › Listeners<!-- /breadcrumb:NetworkListener -->). The relevant fields are [`bind`](/docs/ref/object/network-listener#bind), [`protocol`](/docs/ref/object/network-listener#protocol), and [`tlsImplicit`](/docs/ref/object/network-listener#tlsimplicit).

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
