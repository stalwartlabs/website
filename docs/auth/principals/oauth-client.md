---
sidebar_position: 6
---

# OAuth Client

The **OAuth Client** principal represents the OAuth clients that are authorized to request access tokens on behalf of users using the **OAuth 2.0** protocol. These clients can be used by external applications to gain secure, delegated access to resources by obtaining an OAuth token from the mail server. OAuth clients can either be manually added by an administrator or dynamically registered using the **OAuth Dynamic Client Registration protocol**.

OAuth clients are essential for enabling third-party applications, such as email clients or external services, to integrate with the mail server in a secure and standardized way. By using OAuth 2.0, users can grant applications limited access to their accounts without having to share their login credentials.

An **OAuth Client** principal stores the following fields that define its properties and configure how it interacts with the OAuth 2.0 protocol:

- **name**: The **OAuth client ID**, which serves as a unique identifier for the OAuth client. This ID is used during the OAuth flow when the client requests access tokens on behalf of users.
- **type**: Specifies the principal type, which for OAuth clients is always set to `"oauthClient"`. This helps the system distinguish OAuth clients from other types of principals such as individuals, groups, or API keys.
- **description**: A human-readable **client name or description**, providing details about the OAuth client. This could be the name of the application or service that the OAuth client represents, helping administrators manage and identify the clients more easily.
- **emails**: A list of **contact addresses** associated with the OAuth client. These email addresses are typically used for administrative purposes, such as contacting the owner of the client in case of issues or updates related to the client’s registration.
- **urls**: The **list of redirect URLs** that the OAuth client is allowed to use during the OAuth flow. After a user authorizes the client, the authorization server will redirect the user to one of these URLs, passing along the authorization code or token. This ensures that only trusted URLs are used for the OAuth flow.
- **picture**:  A **logo or image** associated with the OAuth client. This image may be displayed to users when they are prompted to authorize the OAuth client, providing a visual cue that helps identify the client.

