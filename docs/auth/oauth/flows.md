---
sidebar_position: 2
---

# Authorization Flows

OAuth 2.0 defines several authorization flows designed to accommodate different types of clients and use cases. Each flow provides a secure mechanism for obtaining an access token that grants permission to access resources on behalf of a user.

Stalwart Mail Server supports two of the most commonly used flows: the **Authorization Code flow** ([RFC6749](https://www.rfc-editor.org/rfc/rfc6749.html)) and the **Device Authorization flow** ([RFC8628](https://www.rfc-editor.org/rfc/rfc8628)), ensuring flexibility in the types of clients and devices that can securely interact with the server. These flows enable a wide range of applications, from web-based and mobile applications to smart devices, to authenticate and obtain access tokens without exposing user credentials or compromising security. By supporting these two core OAuth flows, Stalwart Mail Server ensures that both traditional and device-based clients can integrate seamlessly with the server while adhering to modern security practices.

## Authorization Code Flow

The Authorization Code flow is one of the most secure OAuth 2.0 flows and is commonly used by web applications and services. It is designed for applications that can maintain a confidential client secret, typically server-side applications that interact with a backend service. The flow ensures that user credentials are never exposed directly to the client application, adding an additional layer of security.

The Authorization Code flow involves the following steps:

1. **User Authorization:** The client redirects the user to the Stalwart Mail Server’s authorization endpoint, where the user is prompted to grant or deny access to the application. At this point, the client does not yet have access to the user's resources.
2. **Authorization Code Issuance:** If the user grants access, the Stalwart OAuth server issues a short-lived authorization code and redirects the user back to the client’s redirect URI with this code.
3. **Token Exchange:** The client sends the authorization code, along with its client ID and secret, to the Stalwart OAuth server’s token endpoint. If the authorization code is valid, the OAuth server exchanges it for an access token (and optionally a refresh token).
4. **Access to Resources:** The client can then use the access token to request the user’s resources from the mail server, while ensuring the user's credentials remain secure.

This flow is ideal for server-side applications that need to securely handle user credentials and tokens while keeping sensitive information out of the browser or client application.

## Device Authorization Flow

The Device Authorization flow, also known as the Device Code flow, is designed for devices that do not have a traditional web browser or have limited input capabilities, such as smart TVs, IoT devices, or game consoles. In these scenarios, users cannot easily enter complex credentials or interact with a standard browser, so the flow is adapted to provide a secure and user-friendly experience.

The Device Authorization flow involves the following steps:

1. **Device Request:** The client (e.g., a device or application) makes a request to the Stalwart OAuth server to initiate the Device Authorization flow. The server responds with a **device code** for the client and a **user code** for the user, along with a URL where the user can authenticate.
2. **User Authorization:** The user is instructed to visit the provided URL on a separate device, such as a smartphone or computer, and enter the user code. This step allows the user to grant or deny access to the client device without directly interacting with the device itself.
3. **Token Polling:** While the user authorizes the request, the client device repeatedly polls the Stalwart OAuth server using the device code. Once the user has completed the authorization, the server issues an access token to the device.
4. **Access to Resources:** After receiving the access token, the client device can securely access the user's resources on the mail server without requiring the user to enter credentials directly on the device.

The Device Authorization flow provides a user-friendly and secure method for authenticating devices that are difficult to use for traditional login methods, while still maintaining the security benefits of OAuth 2.0.
