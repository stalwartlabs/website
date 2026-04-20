---
sidebar_position: 1
---

# Overview

JMAP (JSON Meta Application Protocol) is a modern, stateful protocol for synchronising mail, calendars, and contacts between a client and a server. It operates over HTTP and uses JSON as its data format, which makes it easy to implement across platforms. JMAP is designed to handle large volumes of data efficiently, offers a consistent interface across data types, and provides built-in push updates so that changes propagate to every connected device as soon as they occur.

## Enabling JMAP

Accepting JMAP connections requires an HTTP [listener](/docs/server/listener) defined on the [NetworkListener](/docs/ref/object/network-listener) object (found in the WebUI under <!-- breadcrumb:NetworkListener --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › Listeners<!-- /breadcrumb:NetworkListener -->) with the [`protocol`](/docs/ref/object/network-listener#protocol) set to `http`. In most installations this listener is created automatically during setup, so no further action is required.

## Accessing JMAP

Most JMAP clients discover the JMAP endpoint through the well-known resource at `/.well-known/jmap`, which returns the URL of the JMAP endpoint and other session details. The endpoint itself is served at `/jmap` and is the primary access point for client operations, including retrieving messages, managing mailboxes, and synchronising data.

## Disabling JMAP

By default, JMAP access is available as soon as an HTTP listener is configured. Some deployments may need to restrict or disable it entirely for security, compliance, or policy reasons.

The most direct way to disable JMAP access server-wide is to add an [HTTP access control rule](/docs/http/access-control) that blocks any path under `/jmap`. This denies access to every JMAP endpoint regardless of per-user settings.

For finer control, JMAP access can be restricted on a per-user, per-group, or per-tenant basis by removing the relevant [JMAP permissions](/docs/auth/authorization/permissions) from the account or entity, so that only authorised principals can use the service.
