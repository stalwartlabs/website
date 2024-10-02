---
sidebar_position: 1
---

# Overview

**OAuth** (Open Authorization) is an open standard protocol designed to allow secure, token-based authentication and authorization between applications and services. Its primary objective is to provide a mechanism for third-party applications to access user resources on behalf of the user without requiring the user’s credentials, such as passwords, to be shared. Instead of sending sensitive login information, OAuth utilizes access tokens to grant limited permissions to access specific resources.

These tokens are issued by an authorization server and have a defined scope and lifespan, ensuring that third-party applications are restricted to only the access they need, without overstepping boundaries. This approach enhances both the security and flexibility of authentication, allowing for a wide range of applications to operate securely across different platforms, from web-based services to mobile and desktop clients. OAuth has become the industry standard for secure, scalable, and user-friendly authentication.

Stalwart Mail Server comes equipped with a built-in OAuth server that simplifies the authentication and authorization process for clients. This integrated OAuth server allows clients, such as email clients or third-party applications, to dynamically register with the server and obtain access tokens needed to interact with the mail services.

When clients wish to authenticate with Stalwart Mail Server, they first register with the built-in OAuth server, receiving a unique client ID and secret. This dynamic registration eliminates the need for manual intervention, making the process smooth and scalable for different types of applications. Once registered, clients can request an access token from the OAuth server by presenting the necessary credentials and fulfilling the required authorization flow. The token is then used to access resources securely, without the need for constant re-authentication or exposure of user credentials.

In addition to issuing tokens, the Stalwart OAuth server validates all access tokens before granting access to any protected resources. This ensures that only authorized clients with valid tokens can interact with the server, providing an additional layer of security. With this built-in functionality, Stalwart Mail Server ensures that authentication is both secure and seamless, reducing the complexity of managing external OAuth servers while maintaining strict security standards for its users and clients.

OAuth 2.0 is automatically enabled in Stalwart Mail Server and does not require any special configurations to function. There are however some settings that can be tweaked to control when tokens expire, how often they need to be renewed, as well as other security settings.
