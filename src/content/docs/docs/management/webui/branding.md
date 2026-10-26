---
sidebar_position: 4
title: "Branding"
description: "Replace the logo shown by the WebUI, for the whole server, per tenant or per domain."
---

:::tip[Enterprise feature]
This feature is available in the [Enterprise edition](/docs/server/enterprise) of Stalwart.
:::

A server that hosts mail for an organisation, or for several, can present the WebUI under their identity instead of Stalwart's. The logo shown by the WebUI can be replaced for the whole server. In multi-tenant deployments, it can also be replaced separately for each tenant and each domain, so that each organisation sees its own logo when its users sign in.

## Logo selection

The server chooses the logo from the hostname of the request, from the most specific source to the most general. It uses the first of these sources that provides a logo:

1. The `logo` of the [Domain](/docs/ref/object/domain) that matches the hostname.
2. The `logo` of the [Tenant](/docs/ref/object/tenant) that the domain belongs to.
3. The [`logo`](/docs/ref/object/enterprise#logo) of the [Enterprise](/docs/ref/object/enterprise) singleton, which is the default for the server. It is found in the WebUI under <!-- breadcrumb:Enterprise --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></svg> Enterprise<!-- /breadcrumb:Enterprise -->.
4. Stalwart's built-in logo.

A logo set on the Enterprise singleton therefore applies everywhere, unless a tenant or a domain sets its own.

## Logo values

The `logo` fields of the three objects accept the same values:

- An https URL of the image
- An http URL, accepted only on the Enterprise singleton and on domains not owned by a tenant
- The image itself, base64-encoded or as a `data:` URI

The image may be PNG, JPEG, GIF, WebP, ICO or SVG, and at most 1 MiB in size.

A logo given as a URL is downloaded by the server, not by the browser. The download must complete within 15 seconds and follow at most 5 redirects. Logos of tenants and of tenant-owned domains are subject to a stricter rule: they must use https URLs that resolve to public IP addresses.

SVG images can contain scripts, so the server serves every logo with a restrictive content security policy. An SVG logo therefore cannot run scripts.

The following update sets the server-wide logo:

```json
{
  "logo": "https://www.example.com/assets/logo.svg"
}
```
