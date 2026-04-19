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

- **Domain logo.** Stalwart looks up the hostname against the configured [Domain](/docs/ref/object/domain) objects. If a matching Domain has the [`picture`](/docs/ref/object/domain#picture) field set, that logo is used.
- **Tenant logo.** If the matching Domain has no logo but is linked to a [Tenant](/docs/ref/object/tenant) through [`memberTenantId`](/docs/ref/object/domain#membertenantid), and the Tenant has its own [`picture`](/docs/ref/object/tenant#picture) set, that logo is displayed instead. This provides tenant-wide branding for domains that do not set their own logo.
- **System-wide default.** If neither the Domain nor the Tenant sets a logo, Stalwart falls back to the system-wide default carried by the [Enterprise](/docs/ref/object/enterprise) singleton (found in the WebUI under <!-- breadcrumb:Enterprise --><!-- /breadcrumb:Enterprise -->) through its [`logoUrl`](/docs/ref/object/enterprise#logourl) field.
- **Built-in logo.** If no custom logo is set anywhere, the WebUI displays Stalwart's built-in default.
