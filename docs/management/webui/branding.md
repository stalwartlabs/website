---
sidebar_position: 4
---

# Branding

Branding allows administrators to customise the appearance of the WebUI by changing the logo displayed to users. Custom branding can be applied to the entire system or scoped to specific tenants and domains, which is useful for multi-tenant deployments.

:::tip Enterprise feature

This feature is available exclusively in the [Enterprise Edition](/docs/server/enterprise) of Stalwart and is not included in the Community Edition.

:::

## Logo selection order

The logo displayed by the WebUI is chosen based on the hostname of the incoming HTTP request. Stalwart consults the following sources in order and uses the first one that yields a valid logo URL:

- **Domain logo.** Stalwart looks up the hostname against the configured [Domain](/docs/ref/object/domain) objects. If a matching Domain has the [`logo`](/docs/ref/object/domain#logo) field set, that logo is used.
- **Tenant logo.** If the matching Domain has no logo but is linked to a [Tenant](/docs/ref/object/tenant) through [`memberTenantId`](/docs/ref/object/domain#membertenantid), and the Tenant has its own [`logo`](/docs/ref/object/tenant#logo) set, that logo is displayed instead. This provides tenant-wide branding for domains that do not set their own logo.
- **System-wide default.** If neither the Domain nor the Tenant sets a logo, Stalwart falls back to the system-wide default carried by the [Enterprise](/docs/ref/object/enterprise) singleton (found in the WebUI under <!-- breadcrumb:Enterprise --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></svg> Enterprise<!-- /breadcrumb:Enterprise -->) through its [`logoUrl`](/docs/ref/object/enterprise#logourl) field.
- **Built-in logo.** If no custom logo is set anywhere, the WebUI displays Stalwart's built-in default.
