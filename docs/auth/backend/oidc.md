---
sidebar_position: 5
---

# OpenID Connect

Stalwart Mail Server can be configured to authenticate users against a third-party **OpenID Connect (OIDC) provider**. This allows Stalwart to delegate user authentication to an external identity provider, integrating seamlessly with an existing identity management system. Common third-party OIDC providers include services like Google, Microsoft, or any OpenID Connect-compliant identity provider.

However, as Stalwart is primarily a **mail server** rather than a traditional web application, there are important distinctions in how it handles the OIDC authentication process. Specifically, Stalwart expects to receive **access tokens** directly via the **OAUTHBEARER SASL mechanism** and does not initiate the OIDC authentication flow itself. As a result, it relies on external means to retrieve user identity information, since it does not directly handle the **ID token** issued by the OIDC server.

:::tip Enterprise feature

This feature is available exclusively in the Enterprise Edition of Stalwart Mail Server and not included in the Community Edition.

:::

## Authentication Flow

As a mail server, Stalwart expects clients (such as email applications) to authenticate using the **OAUTHBEARER SASL mechanism**. This means the client provides an **access token**—obtained from the third-party OIDC provider—to the mail server when attempting to authenticate. Unlike a typical web-based OIDC client, Stalwart does not participate in the full OIDC authentication flow (such as redirecting users to a login page or handling authorization codes).

Since Stalwart does not initiate the OIDC flow, it does not have direct access to the [ID token](/docs/auth/openid/id-tokens), which typically contains key identity information about the user (such as the username or email). Instead, it operates with the **access token** provided by the client via OAUTHBEARER. Therefore, to retrieve the user’s identity (such as their account name and email address), Stalwart must be configured to query either the OIDC **UserInfo endpoint** or the **OAuth token introspection endpoint** provided by the OIDC server.

To map the access token received via OAUTHBEARER to the user’s identity, Stalwart Mail Server can be configured to query one of the following endpoints on the third-party OIDC provider:

- **UserInfo Endpoint:** The standard OpenID Connect endpoint that returns information about the authenticated user associated with a given access token. This endpoint typically provides key user attributes such as the user’s unique identifier (subject), email address, and other profile information. By querying this endpoint, Stalwart can retrieve the user’s identity and link it to the corresponding mail account.
- **Token Introspection Endpoint:** Alternatively, Stalwart can be configured to use the **OAuth 2.0 Token Introspection endpoint**. The introspection endpoint allows the mail server to validate an access token and retrieve metadata about it, including the user’s identity. This endpoint returns information about the token’s status (whether it is active or expired) and, if valid, includes details such as the user’s identifier and scopes.

## Limitations

When using an external OpenID Connect (OIDC) provider as an authentication backend in Stalwart Mail Server, it is important to understand certain limitations due to the nature of OIDC and its integration with the mail server. 

### Offline Access

One of the key limitations is that Stalwart only becomes aware of user accounts after they have authenticated at least once with the system. This limitation arises because OIDC does not provide a mechanism to query or validate user information offline without an active and valid token. As a result, if an email message is sent to an address that exists in the external OIDC provider but the corresponding account has never logged into Stalwart Mail Server, Stalwart will not recognize the account. In this scenario, the server will bounce the message, as it does not have the email address in its internal database. This happens even if the address is valid in the OIDC system because Stalwart cannot perform offline verifications against the OIDC provider.

To avoid this issue, it is necessary to pre-deploy accounts in Stalwart Mail Server before users log in for the first time. Administrators can manually create these accounts through the [Webadmin](/docs/management/webadmin/overview) interface or in bulk via the [REST API](/docs/api/management/overview). By pre-creating user accounts, Stalwart will recognize the email addresses and accept incoming messages, even if the users have not yet logged in. This ensures that all necessary accounts are set up to receive mail, even if they have not authenticated via OIDC.

### `OAUTHBEARER` SASL

Another limitation relates to the OAUTHBEARER SASL mechanism, which is required for mail clients to authenticate with OAuth tokens. Unfortunately, many mainstream mail clients, such as Outlook, Thunderbird, and Apple Mail, do not support this mechanism. As a result, users of these clients cannot directly authenticate using OAuth tokens. To work around this limitation, administrators need to set up [App Passwords](/docs/auth/authentication/app-password) for these users. These App Passwords allow users to access their mail accounts securely in clients that do not support OAUTHBEARER. For more details on this, refer to the [interoperability](/docs/auth/oauth/interoperability) section of the OAuth documentation.

## Configuration

Stalwart Mail Server can be configured to authenticate users against a third-party OpenID Connect (OIDC) provider by querying the provider’s endpoints to retrieve user identity information. The server supports different methods for interacting with OIDC providers, such as using the **UserInfo endpoint** or the **Token Introspection endpoint** with various authentication methods. This documentation outlines how to configure Stalwart Mail Server to work with these methods.

Before diving into the specific methods, there are common configuration settings that apply across all types of OIDC provider integrations:

- `type`: This is always set to `"oidc"`, indicating that the integration is with an OIDC provider.
- `timeout`: Defines the maximum time allowed for Stalwart to wait for a response from the OIDC provider. For example, `timeout = "1s"` specifies a timeout of 1 second.
- `endpoint.url`: This is the URL of the OIDC provider’s endpoint, which can either be the **UserInfo** or **Token Introspection** endpoint, depending on the chosen method.
- `fields.email`, `fields.username`, `fields.full-name`: These fields map the information returned by the OIDC provider to the user attributes within Stalwart. Common fields are the email (`fields.email`), username (`fields.username`), and full name (`fields.full-name`), which are typically part of the claims provided by the OIDC server.

### UserInfo Endpoint

When using the **UserInfo endpoint**, Stalwart queries this endpoint to obtain user identity information after validating the access token provided by the client. This method directly fetches the user's information (such as email and username) from the OIDC provider.

Example:

```toml
[directory."oidc-userinfo"]
type = "oidc"
timeout = "1s"
endpoint.url = "https://127.0.0.1:9090/userinfo"
endpoint.method = "userinfo"
fields.email = "email"
fields.username = "preferred_username"
fields.full-name = "name"
```

In this setup, Stalwart queries the specified `userinfo` endpoint to retrieve the user's details using the access token provided by the client during the authentication process.

### Introspection Endpoint without Authentication

When using the **Token Introspection endpoint without authentication**, Stalwart sends the access token to the introspection endpoint without requiring any authentication for the request itself. The introspection endpoint verifies the token and returns information about the token’s owner.

Example:

```toml
[directory."oidc-introspect-none"]
type = "oidc"
timeout = "1s"
endpoint.url = "https://127.0.0.1:9090/introspect-none"
endpoint.method = "introspect"
auth.method = "none"
fields.email = "email"
fields.username = "preferred_username"
fields.full-name = "name"
```

Here, no additional authentication method is required to access the token introspection endpoint, meaning that the token is sent directly to the OIDC provider for validation and user information retrieval.

### Introspection Endpoint with Basic Authentication

In cases where the **Token Introspection endpoint requires basic authentication**, Stalwart needs to provide a valid username and password when querying the introspection endpoint. This method adds a layer of security by requiring client credentials in addition to the access token.

Example:

```toml
[directory."oidc-introspect-basic"]
type = "oidc"
timeout = "1s"
endpoint.url = "https://127.0.0.1:9090/introspect-basic"
endpoint.method = "introspect"
auth.method = "basic"
auth.username = "myuser"
auth.secret = "mypass"
fields.email = "email"
fields.username = "preferred_username"
fields.full-name = "name"
```

In this configuration, Stalwart provides the `auth.username` and `auth.secret` as credentials to authenticate with the OIDC provider’s introspection endpoint.

### Introspection Endpoint with Bearer Token Authentication

Some OIDC providers require a **Bearer token** for accessing the Token Introspection endpoint. In this setup, Stalwart needs to send an additional token (provided by the admin) along with the access token for token introspection.

Example:

```toml
[directory."oidc-introspect-token"]
type = "oidc"
timeout = "1s"
endpoint.url = "https://127.0.0.1:9090/introspect-token"
endpoint.method = "introspect"
auth.method = "token"
auth.token = "token_of_gratitude"
fields.email = "email"
fields.username = "preferred_username"
fields.full-name = "name"
```

In this case, the `auth.token` is included in the request to authenticate Stalwart when querying the introspection endpoint.

### Introspection Endpoint with User-Provided Access Token

In this method, Stalwart uses the access token provided by the user during the OAUTHBEARER SASL authentication process to query the **Token Introspection endpoint**. No additional authentication method is required, as the user’s token itself is used.

Example:

```toml
[directory."oidc-introspect-user-token"]
type = "oidc"
timeout = "1s"
endpoint.url = "https://127.0.0.1:9090/introspect-user-token"
endpoint.method = "introspect"
auth.method = "user-token"
fields.email = "email"
fields.username = "preferred_username"
fields.full-name = "name"
```

In this configuration, the introspection endpoint validates the user-provided token, and Stalwart retrieves the user’s identity from the response.

