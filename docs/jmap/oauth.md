---
sidebar_position: 6
---

# OAuth

OAuth, or Open Authorization, is a standard protocol that provides a method for clients to access server resources on behalf of a user. It acts as an intermediary on behalf of the end-user, providing the service with an access token that authorizes specific account information to be shared. This allows users to grant third-party applications access to their information on other services without sharing their credentials. For security reasons, it is strongly recommended to always use OAuth to
authenticate your users and, if possible, disable the ``Basic`` authentication scheme altogether.

OAuth 2.0 is automatically enabled in Stalwart JMAP and does not require any special configurations to function. There are however some settings that can be tweaked to control when tokens expire, how often they need to be renewed, as well as other security settings.

## Authorization Flows

In order to facilitate and encourage OAuth adoption by system administrators, Stalwart JMAP includes support for both 
the __OAuth 2.0 Authorization Code Flow__ ([RFC6749](https://www.rfc-editor.org/rfc/rfc6749.html)) and 
__OAuth 2.0 Device Authorization Flow__ ([RFC8628](https://www.rfc-editor.org/rfc/rfc8628)).
Deciding which authorization flow to use is up to the client accessing the JMAP account.

### Authorization Code

The Authorization Code Flow is one of the most commonly used OAuth 2.0 flows, ideal for server-side applications where the source code is not publicly exposed. It begins with the client directing the user to the authorization server. The user authenticates with the server and gives consent for the client to access their protected resources. The server then redirects the user back to the client with an authorization code. The client exchanges this code with the server for an access token and, optionally, a refresh token. These tokens are then used by the client to access the user's protected resources.

### Device Authorization

The Device Authorization Flow, also known as the Device Flow, is an OAuth 2.0 extension that enables devices with no browser or limited input capability, such as smart TVs, consoles, and printers, to obtain user authorization. In this flow, the client instructs the user to perform the authorization request on a secondary device, like a smartphone. The client polls the authorization server until the user completes the authorization request, at which point the server issues tokens to the client. This flow ensures a smooth user experience for devices that cannot conveniently use other OAuth flows.

## OAuth Tokens

Once a user is successfully authenticated using OAuth, Stalwart JMAP will issue the client two unique codes known 
as the *access* and *refresh* tokens. An *access token* grants the client access to a JMAP account for a relatively short 
period of time (usually one hour) and then expires. Once it expires, the *refresh token* has to be used to obtain
a new *access token* in order to regain access to the account. This process is repeated until either the 
refresh token expires or it is revoked by the JMAP account owner or system administrator.

The size of the OAuth token cache is configurable using the `oauth.cache.size` parameter. For example:

```toml
[oauth.cache]
size = 128
```

### Encryption

All tokens issued by Stalwart JMAP are cryptographically signed using a mechanism inspired by 
[PASETO security tokens](https://paseto.io/):

- An **encryption key** is derived using the [BLAKE3](https://en.wikipedia.org/wiki/BLAKE_(hash_function)#BLAKE3)
  cryptographic hash function combining the principal encryption key (configurable with the `oauth.key`
  parameter) with the device id, the expiration time, account details and an [Argon2](https://en.wikipedia.org/wiki/Argon2)
  hash of the JMAP account's password.
- A **nonce** is generated using a BLAKE3 hash of the user details and the expiration time of the token.
- Finally, the derived **encryption key** and **nonce** are employed to digitally sign the token using 
  [AES-256-GCM-SIV](https://www.rfc-editor.org/rfc/rfc8452).

During installation, a 512 bits long encryption key is automatically generated for you. If you wish
to replace it, you can generate a new one using OpenSSL or alternatively in Linux systems using the
command ``LC_ALL=C tr -dc '[:alpha:]' < /dev/urandom | head -c 64``. Once you have your new key, update the ``oauth.key``
parameter, for example:

```toml
[oauth]
key = "sDRvvROsJmRUnjIfcUiDUSaAxdQpfixuLvdwlSffptaxUnSQZALenZSYUPQQByUI"
```

:::tip Be aware that

- If the encryption key is changed, all existing OAuth tokens will be **immediately revoked**.
- On distributed systems, all nodes have to use the **exact same encryption key**. Otherwise,
  tokens issued in one node will not be valid in other nodes.
- The encryption key **must be kept private**, make sure that only the Stalwart JMAP process
  has access to the configuration file where it is stored. In Unix systems this can be done
  with the commands:
  
   ```
   sudo chown stalwart-mail /opt/stalwart-mail/etc/config.toml
   sudo chmod 600 /opt/stalwart-mail/etc/config.toml
   ``` 

:::

### Expiration

System administrators can configure under the `oauth.expiry` section the expiration time of both access and refresh tokens as well as the authorization codes issued to users and devices:

- ``token``: Expiration time of an OAuth access token in seconds, defaults to 3600 seconds (1 hour).
- ``refresh-token``: Expiration time of an OAuth refresh token in seconds. Defaults to 2592000 seconds (1 month).
- ``refresh-token-renew``:  Number of remaining seconds in a refresh token before a new one is issued to the client. Defaults to 345600 seconds (4 days).
- ``user-code``: Expiration time in seconds of a user code issued by the device authentication flow. Defaults to 1800 seconds (30 minutes).
- ``auth-code-expiry``: Expiration time in seconds of an authorization code issued by the authorization code flow. Defaults to 600 seconds (10 minutes).
- ``max-attempts``: Number of failed login attempts before an authorization code is invalidated. Defaults to 3 failed attempts.

Example:

```
[oauth.expiry]
user-code = "30m"
auth-code = "10m"
token = "1h"
refresh-token = "30d"
refresh-token-renew = "4d"
```

The `oauth.auth.max-attempts` parameter can be used to prevent brute-force attacks against the authorization code flow. If the user fails to authenticate after the configured number of attempts, the authorization code is invalidated and the user has to start the flow again.

Example:

```toml
[oauth.auth]
max-attempts = 3
```

### Revocation

Access and refresh tokens issued by Stalwart JMAP can be revoked by both account owners
and system administrators simply by changing the account's password.
In the near future it will also be possible to revoke individual tokens issued to a
specific OAuth client id.

## OAuth Endpoints

OAuth clients conforming to [RFC8414](https://www.rfc-editor.org/rfc/rfc8414.html) can obtain
all available OAuth endpoints by requesting the authorization server metadata which is published
at ``/.well-known/oauth-authorization-server``. Clients that do not support RFC8414 need to be manually
configured to use the appropriate endpoint:

- ``/auth/token``: Token endpoint, used by all flows to obtain and refresh access tokens.
- ``/auth/device``: Device authorization endpoint, used by the device flow.

Once the OAuth client obtains the authorization code, users are then authenticated on any
of these two endpoints:

- ``/auth/code``: Used by the authorization code flow to authenticate accounts.
- ``/auth``: Used by the device authorization flow to authenticate accounts.

## Conformed RFCs

- [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html)
- [RFC 6750 - The OAuth 2.0 Authorization Framework: Bearer Token Usage](https://datatracker.ietf.org/doc/html/rfc6750)
- [RFC 8414 - OAuth 2.0 Authorization Server Metadata](https://www.rfc-editor.org/rfc/rfc8414.html)
- [RFC 8628 - OAuth 2.0 Device Authorization Grant](https://www.rfc-editor.org/rfc/rfc8628)

