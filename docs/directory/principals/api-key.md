---
sidebar_position: 5
---

# API Key

The **API Key** principal type is used to grant external applications access to the management REST API or to register OAuth clients using the OAuth Dynamic Client Registration protocol. API keys allow secure, programmatic interaction with the management interface of the mail server, enabling external tools and applications to automate administrative tasks or integrate with the system's management features. However, it’s important to note that API keys **cannot be used with JMAP, IMAP, POP3**, or other mail server services for authentication or accessing user mailboxes.

An **API Key** principal holds several fields that define its properties and permissions within the Stalwart Mail Server. Below are the key fields for this principal type:

- **name**: The **name** field represents the unique **API key ID**. This is the identifier used to reference the API key within the system and by external applications accessing the API.
- **type**: Specifies the principal type, which for API keys is always set to `"apiKey"`. This distinguishes it from other principal types such as individuals, groups, or domains.
- **description**: A human-readable description of the API key, typically used to indicate the key's purpose or the application it's associated with. This helps administrators manage and identify API keys more easily.
- **secrets**:  The **secrets** field stores one or more **API key secrets**, which are used to authenticate API requests. These secrets are sensitive and are required to access the management API or register OAuth clients securely.
- **tenant**: Indicates the **tenant** to which the API key belongs. In multi-tenant environments, this field ensures that API keys are isolated to their respective tenants and cannot be used to access resources outside their assigned tenant.
- **roles**: The **roles** field lists the roles assigned to the API key. Roles define the scope of permissions the API key has, making it easier to manage access by bundling permissions together.
- **enabledPermissions**: This field defines the set of permissions that the API key is explicitly granted. These permissions determine what actions the API key can perform when interacting with the management API, such as creating users, managing domains, or updating configurations.
- **disabledPermissions**: The **disabledPermissions** field specifies any permissions that are explicitly denied to the API key. Even if a role assigned to the API key grants certain permissions, they will be restricted if they appear in this field, providing a way to fine-tune access control.

