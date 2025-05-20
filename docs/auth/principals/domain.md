---
sidebar_position: 4
---

# Domain

The **Domain** principal type in Stalwart represents a local domain managed by the mail server. Domain principals are crucial for defining the domains that the mail server recognizes as part of its local configuration. If a domain principal is not created for a specific domain, Stalwart will treat that domain as external and will not accept email delivery for it. This makes domain principals essential for proper routing and handling of emails within the server.

In addition to enabling local email delivery, domain principals allow administrators to configure custom [branding](/docs/management/webadmin/branding) for each domain, such as setting a logo that is displayed when accessing the web administration interface for that domain. This is especially useful in multi-tenant setups, where different organizations may want to apply their own branding to their respective domains.

A domain principal includes the following fields that define its properties:

- **name**: The **name** field stores the domain name (e.g., `example.com`) that this principal represents. This is the key identifier for the domain within the mail server, and it must be unique.
- **type**: Specifies the principal type, which for domain principals is always set to `"domain"`. This field indicates that the principal represents a domain configuration rather than a user, group, or mailing list.
- **description**:  A human-readable description of the domain. This is typically a text field that provides more context about the domain, such as the organization's full name or the purpose of the domain (e.g., "Corporate domain for Example Inc.").
- **tenant**: Indicates the [tenant](/docs/auth/authorization/tenants) to which the domain belongs. In multi-tenant environments, each tenant can have its own set of domains, ensuring that resources and configurations are isolated between different organizations or divisions.
- **picture**: A URL that points to the logo associated with this domain. When administrators or users access the [web administration interface](/docs/management/webadmin/overview) for this domain, the specified logo is displayed as part of the branding. This feature allows each domain to have a custom look and feel, making it easier to identify and manage in multi-domain environments.

