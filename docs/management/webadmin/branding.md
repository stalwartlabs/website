---
sidebar_position: 4
---

# Branding

Branding allows system administrators to customize the appearance of the **webadmin interface** by changing the logo displayed to users. This feature provides flexibility to apply custom branding for the entire system, or for specific **tenants** and **domains**, offering a more personalized and professional user experience in multi-tenant environments.

:::tip Enterprise feature

This feature is available exclusively in the [Enterprise Edition](/docs/server/enterprise) of Stalwart and not included in the Community Edition.

:::

### Logo Selection Process

The logo displayed in the webadmin interface is dynamically chosen based on the **hostname** from the HTTP request. Stalwart follows a specific order when selecting which logo to display, ensuring that the most appropriate logo is shown based on the domain or tenant in use.

- **Domain Principal Logo**: When a webadmin user accesses the interface, Stalwart checks the **hostname domain** in the HTTP request. If a [domain principal](/docs/auth/principals/domain) is defined for this domain, and it has a `picture` field containing a valid logo URL, that logo is used.
- **Tenant Principal Logo**: If the domain principal does not have a logo defined but is linked to a [tenant](/docs/auth/authorization/tenants) that has a valid logo URL set in its `picture` field, the tenant's logo is displayed instead. This allows for tenant-wide branding when specific domains do not define their own logos.
- **System-wide Default Logo**:  If neither the domain principal nor the associated tenant has a valid logo, Stalwart falls back to a system-wide default logo. This is defined by the `enterprise.logo-url` setting in the server configuration. If this setting includes a valid URL, the logo at that URL is used as the default for the system.
- **Stalwart Default Logo**: If no custom logo is set anywhere (domain, tenant, or system-wide), Stalwart will display its built-in **default logo** in the webadmin interface.

The branding feature in Stalwart allows administrators to apply custom logos, either globally or tailored to specific tenants and domains, providing a seamless and branded experience across the web administration interface. This hierarchical logo selection process ensures that the most relevant branding is always applied based on the user's domain, promoting consistency and personalization in multi-tenant setups.

## Configuration

The default logo for the system can be set in the server configuration file. To define a system-wide default logo, add the `enterprise.logo-url` setting to the configuration file:

```toml
[enterprise]
logo-url = "https://example.com/logo.png"
```
