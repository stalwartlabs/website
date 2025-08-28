---
sidebar_position: 3
---

# Tokens

OAuth tokens are at the core of the OAuth 2.0 protocol, serving as the mechanism through which secure access to protected resources is granted. Instead of relying on user credentials such as usernames and passwords, OAuth tokens are issued to clients by the authorization server to allow access to specific resources for a limited period and scope. These tokens provide a more secure, flexible, and efficient way to manage access control across various applications and services.

OAuth defines two primary types of tokens: **access tokens** and **refresh tokens**. Each plays a distinct role in the authentication and authorization process, ensuring both secure access and a streamlined user experience.

## Access Tokens

An access token is a short-lived token issued by the authorization server (in this case, Stalwart’s built-in OAuth server) after a successful authorization request. This token is used by the client to access protected resources on behalf of the user. When a client presents an access token to the resource server, the server validates it before granting the requested access to the user's resources.

Access tokens typically have a limited lifespan, often lasting from several minutes to a few hours. This short lifespan is intentional, as it reduces the window of opportunity for malicious use in case the token is compromised. Once the token expires, the client must obtain a new access token through a refresh token or by requesting a new authorization from the user.

Access tokens are issued with a defined scope, meaning they only grant access to specific resources or actions. For instance, an access token issued for sending emails through Stalwart may not allow the client to read the user’s inbox or modify account settings. This granularity in permissioning enhances security by ensuring that clients only access what is absolutely necessary.

## Refresh Tokens

Refresh tokens complement access tokens by allowing the client to request new access tokens without requiring the user to re-authenticate. When an access token expires, the client can present a valid refresh token to the authorization server, which will issue a new access token without requiring the user’s involvement. This enables a seamless user experience, where long-lived sessions or background processes can continue without requiring repeated logins.

Unlike access tokens, refresh tokens typically have a longer lifespan and are considered more sensitive because they allow the client to obtain new access tokens. Refresh tokens should be securely stored by the client and never shared or exposed to unauthorized parties. In cases where the refresh token is compromised, the attacker could potentially gain continuous access to the user's resources by requesting new access tokens.

Refresh tokens are often issued alongside access tokens during the authorization process. When the refresh token is used to obtain a new access token, it may either be retained for future use or replaced with a new refresh token, depending on the security policies configured by the server. In scenarios where security is paramount, such as when sensitive data is involved, refresh tokens may also have an expiration period or be subject to revocation if the user’s session is terminated.

## Configuration

### Encryption

All tokens issued by Stalwart are cryptographically signed using a mechanism inspired by [PASETO security tokens](https://paseto.io/):

- An **encryption key** is derived using the [BLAKE3](https://en.wikipedia.org/wiki/BLAKE_(hash_function)#BLAKE3) cryptographic hash function combining the principal encryption key (configurable with the `oauth.key` parameter) with the device id, the expiration time, account details and an [Argon2](https://en.wikipedia.org/wiki/Argon2) hash of the account's password.
- A **nonce** is generated using a BLAKE3 hash of the user details and the expiration time of the token.
- Finally, the derived **encryption key** and **nonce** are employed to digitally sign the token using  [AES-256-GCM-SIV](https://www.rfc-editor.org/rfc/rfc8452).

During installation, a 512 bits long encryption key is automatically generated for you. If you wish to replace it, you can generate a new one using OpenSSL or alternatively in Linux systems using the
command ``LC_ALL=C tr -dc '[:alpha:]' < /dev/urandom | head -c 64``. Once you have your new key, update the ``oauth.key`` parameter, for example:

```toml
[oauth]
key = "sDRvvROsJmRUnjIfcUiDUSaAxdQpfixuLvdwlSffptaxUnSQZALenZSYUPQQByUI"
```

Or, to read the key from the environment variable `OAUTH_SECRET`:

```toml
[oauth]
key = "%{env:OAUTH_SECRET}%"
```

:::tip Be aware that

- If the encryption key is changed, all existing OAuth tokens will be **immediately revoked**.
- On distributed systems, all nodes have to use the **exact same encryption key**. Otherwise,
  tokens issued in one node will not be valid in other nodes.
- The encryption key **must be kept private**. It is recommended that it is specified using an [environment variable](/docs/configuration/macros), which will prevent the key from being stored in the configuration file in plain text.
  If using an environment variable is not possible or practical, then make sure that only the Stalwart process
  has access to the configuration file where it is stored. In Unix systems this can be done
  with the commands:
  
   ```
   sudo chown stalwart /opt/stalwart/etc/config.toml
   sudo chmod 600 /opt/stalwart/etc/config.toml
   ``` 

:::

### Expiration

System administrators can configure under the `oauth.expiry` section the expiration time of both access and refresh tokens as well as the authorization codes issued to users and devices:

- ``token``: Expiration time of an OAuth access token in seconds, defaults to 3600 seconds (1 hour).
- ``refresh-token``: Expiration time of an OAuth refresh token in seconds. Defaults to 2592000 seconds (1 month).
- ``refresh-token-renew``:  Number of remaining seconds in a refresh token before a new one is issued to the client. Defaults to 345600 seconds (4 days).
- ``user-code``: Expiration time in seconds of a user code issued by the device authentication flow. Defaults to 1800 seconds (30 minutes).
- ``auth-code-expiry``: Expiration time in seconds of an authorization code issued by the authorization code flow. Defaults to 600 seconds (10 minutes).

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

Access and refresh tokens issued by Stalwart can be revoked by both account owners and system administrators simply by changing the account's password.
