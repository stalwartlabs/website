---
sidebar_position: 4
---

# Dynamic Registration

The OAuth Dynamic Client Registration Protocol ([RFC7591](https://www.rfc-editor.org/rfc/rfc7591.html)) is an extension of the OAuth 2.0 framework that allows clients to register with an OAuth server dynamically, without the need for manual intervention by an administrator. In a typical OAuth setup, clients are pre-registered with the authorization server, meaning an administrator manually assigns a client ID and secret before the client can interact with the server. However, in environments where many different applications or devices need to connect, such as in cloud-based services or Internet of Things (IoT) environments, manually registering clients can become inefficient and burdensome.

Dynamic Client Registration solves this problem by allowing clients to self-register with the authorization server. Through this protocol, clients can send a registration request that includes information about the client, such as its name, redirect URIs, and the type of application it is. Upon successful registration, the authorization server generates a unique client ID and optional client secret that the client can then use to authenticate and request tokens.

This approach offers several advantages, including scalability, flexibility, and reduced administrative overhead. It enables developers to deploy applications that can securely interact with the OAuth server without needing pre-registration, making it especially useful in modern, scalable applications or services.

The dynamic client registration process involves a few simple steps that allow a client to register and obtain the necessary credentials to interact with the OAuth server. Here's how it works:

1. **Registration Request:** The client sends an HTTP POST request to the OAuth server’s client registration endpoint. This request includes details such as the client’s name, redirect URIs, and the types of OAuth flows the client will use. The client may also specify other optional metadata like logo, application type, and supported scopes.
2. **Client Registration:** The OAuth server processes the request and registers the client if the request is valid. The server generates a unique client ID and, if applicable, a client secret that the client will use in future authentication requests. These credentials are returned to the client in the server’s response.
3. **Client Use of Credentials:** After registration, the client can use the provided client ID and secret to request access and refresh tokens from the OAuth server by initiating the appropriate OAuth flows. The dynamically registered client now functions like any other OAuth client, with its own credentials and permissions.

The dynamic registration process simplifies the onboarding of new clients, especially in environments with many devices or applications that need to interact with the server, as it eliminates the need for manual registration.

Stalwart Mail Server fully supports the OAuth Dynamic Client Registration Protocol, allowing clients to register dynamically with its built-in OAuth server. This capability is crucial for environments where a large number of clients need to authenticate, such as in email applications, third-party services, or custom applications that integrate with the mail server.

## Enabling Registration

By default, Stalwart Mail Server does not require clients to be formally registered in order to obtain OAuth tokens. This means that any client ID can be used to request access tokens without prior registration. However, in scenarios where it is essential to manage which clients are allowed to authenticate with the server, dynamic client registration must be enabled. This feature allows administrators to keep track of registered clients, regulate their access, and maintain a secure environment.

To activate dynamic client registration in Stalwart Mail Server, a configuration change is required. Specifically, setting `oauth.client-registration.require` to `true` will require all clients to formally register with the OAuth server before they can interact with it.

Example:

```toml
[oauth.client-registration]
require = true
```

After enabling this setting, the OAuth server will mandate that all clients register and obtain valid credentials before they can request tokens. This adds a layer of security by ensuring that only authorized clients can access protected resources.

## Client Authentication

Before a client can register with the OAuth server, it must authenticate itself. The recommended approach for client authentication during registration is to create an [API Key](/docs/directory/principals/api-key) for the OAuth client. This API Key should be assigned specific [permissions](/docs/directory/authorization/permissions) that allow the client to authenticate and register itself. Specifically, the API Key should be configured with the following permissions: `authenticate` and `oauth-client-registration`. These permissions ensure that the client can both authenticate with the OAuth server and perform the necessary registration steps securely.

## Anonymous Registrations

While it is possible to enable anonymous client registrations, this is not recommended due to the potential for abuse. To allow anonymous registrations, administrators must set the configuration parameter `oauth.client-registration.anonymous` to `true` in the server configuration file. When this setting is enabled, clients can register themselves without prior authentication, which may pose security risks, especially in environments where unrestricted access could lead to abuse.

Example:

```toml
[oauth.client-registration]
anonymous = true
```

However, it is strongly advised that this setting remains disabled (which is the default) to prevent unauthorized or untrusted clients from registering and potentially gaining access to sensitive resources.

## Managing Clients

Once dynamic client registration is enabled and a client registers successfully, Stalwart Mail Server stores the client’s information in its directory as an [OAuth Client principal](/docs/directory/principals/oauth-client). This stored information includes the client ID, redirect URIs, and other metadata related to the client's access to the OAuth system. The server maintains a detailed record of all registered clients, enabling administrators to manage client credentials, access permissions, and general configurations.

Administrators can modify or remove these registered clients using either the [Webadmin](/docs/management/webadmin/overview) or [REST API](/docs/api/management/overview).
