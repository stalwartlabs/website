---
sidebar_position: 4
---

# Choosing a directory

In Stalwart, a *directory* refers to the authentication backend responsible for managing user identities and access credentials. Directories are essential for validating login attempts, retrieving account-related information, and, in some cases, managing user configuration. Stalwart supports both **internal** and **external** directory configurations, giving administrators flexibility in how authentication is handled.

When using the [internal directory](/docs/auth/backend/overview#internal-directory), all user account data—including usernames, passwords, and quotas—is stored within Stalwart’s own [data store](/docs/storage/data). In this setup, Stalwart fully manages user-related data, and administrators can perform all account management tasks directly within the system. This includes creating new accounts, updating credentials, configuring mail quotas, and managing account-level settings. The internal directory is ideal for standalone or small-scale deployments where centralized control and simplicity are important.

Alternatively, Stalwart can be configured to use an [external directory](/docs/auth/backend/overview#external-directory), which delegates authentication and user information to a third-party system. Supported external directories include **LDAP**, **OpenID Connect**, and **SQL-based authentication backends**. In this configuration, Stalwart relies on the external system for user authentication and account data. However, it does not have the ability to modify user details—such as resetting passwords or creating accounts—within the external directory. All user management must be performed directly in the external system by its respective tools or APIs.

Choosing between an internal or external directory depends on your operational model. The internal directory offers simplicity and full integration for deployments where Stalwart operates as a self-contained platform. On the other hand, using an external directory is recommended for organizations that already maintain a centralized identity infrastructure and require integration with existing systems.

Stalwart’s directory system is flexible and designed to fit a wide range of use cases—from independent setups to enterprise environments with federated authentication. Available authentication backend are:

- [Internal](/docs/auth/backend/internal): An internal directory that is automatically created and managed by Stalwart. It uses the same database backend as the data store.
- [LDAP](/docs/auth/backend/ldap): LDAP servers, including OpenLDAP and Active Directory.
- [SQL](/docs/auth/backend/sql): SQL databases, including PostgreSQL, MySQL and SQLite.
- [OpenID Connect](/docs/auth/backend/oidc.md): OpenID Connect servers, including Authentik, Keycloak, etc.

:::tip Remember that...

- When the internal directory is used, Stalwart manages all user-related data within its own system. In this setup, all account management tasks, such as creating new user accounts, updating passwords, and setting quotas, are performed directly within Stalwart.
- When an external LDAP or SQL directory is utilized, all user account management must be performed within that external system. Stalwart will rely on this external directory for authentication and user information but will not have the ability to directly modify user details from the [web-based admin](/docs/management/webadmin/overview).

:::


