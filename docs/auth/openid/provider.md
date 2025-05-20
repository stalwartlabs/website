---
sidebar_position: 3
---

# OIDC Provider

Stalwart comes with the **OpenID Connect (OIDC) provider** feature automatically enabled. This means that clients and applications can authenticate users and obtain ID tokens through the server, which acts as the identity provider. The OIDC provider in Stalwart is compliant with OpenID Connect standards and supports a range of cryptographic signing algorithms to ensure the integrity and security of issued ID tokens.

The OIDC provider uses JSON Web Tokens (JWT) to issue ID tokens, and these tokens are signed using various algorithms that fall into two categories: **symmetric** and **asymmetric** signing algorithms.

## Signing Algorithms

Stalwart supports the following signing algorithms for ID tokens:

- **ES256**: ECDSA using P-256 and SHA-256 (asymmetric)
- **ES384**: ECDSA using P-384 and SHA-384 (asymmetric)
- **PS256**: RSASSA-PSS using SHA-256 and MGF1 (asymmetric)
- **PS384**: RSASSA-PSS using SHA-384 and MGF1 (asymmetric)
- **PS512**: RSASSA-PSS using SHA-512 and MGF1 (asymmetric)
- **RS256**: RSA using SHA-256 (asymmetric)
- **RS384**: RSA using SHA-384 (asymmetric)
- **RS512**: RSA using SHA-512 (asymmetric)
- **HS256**: HMAC using SHA-256 (symmetric)
- **HS384**: HMAC using SHA-384 (symmetric)
- **HS512**: HMAC using SHA-512 (symmetric)

**Symmetric Algorithms** (such as HS256, HS384, HS512) use the same secret key for both signing and verifying the JWT. The key is shared between the OIDC provider (Stalwart) and the client. Symmetric algorithms, such as the HMAC (HS*) family, are easier to set up because they require only a single secret key. However, they are less secure for use in distributed systems because both parties (issuer and verifier) must share the same secret key, which can lead to potential security risks if the key is compromised.

**Asymmetric Algorithms** (such as ES256, ES384, PS256, PS384, PS512, RS256, RS384, RS512) use a pair of cryptographic keys, a private key for signing the token and a public key for verifying the token. The private key is kept secure on the server, while the public key is distributed to clients or anyone needing to verify the token's authenticity. Asymmetric algorithms, such as the RSA (RS*) or ECDSA (ES*) families, are generally recommended for OIDC token signing because they offer better security. The client or verifier does not need access to the private key, only the public key, which minimizes the risk of key compromise.

## Configuration

If no specific signing algorithm is provided in the configuration, Stalwart defaults to using **HS256** (HMAC with SHA-256), a symmetric signing algorithm. In this case, Stalwart automatically generates a random symmetric key for signing ID tokens. While this setup works for environments where simplicity is preferred, relying on symmetric keys is not the most secure option in distributed or production environments, especially when multiple clients need to verify tokens. Symmetric keys require sharing the same key between the server and clients, increasing the risk of key compromise.

For enhanced security, it is strongly recommended that users configure **asymmetric signing algorithms**, such as **RS256** (RSA with SHA-256) or **ES256** (ECDSA with SHA-256), in the Stalwart’s configuration. Using asymmetric algorithms ensures that only the server has access to the private signing key, while the public verification key can be distributed to clients. To configure an asymmetric key, administrators need to generate a key pair (private and public keys) and configure Stalwart to use the private key for signing ID tokens. The corresponding public key can be shared with clients through the `.well-known/oauth-authorization-server` metadata endpoint, allowing them to verify the authenticity and integrity of the ID tokens issued by the server.

The following settings available under the `outh.oidc` section of the configuration file allow you to configure the OIDC provider's signing algorithm and key:

- `signature-key`: The private key used for signing ID tokens. This key should be kept secure and not shared with unauthorized parties. The key should be in PEM format and can be generated using tools like OpenSSL.
- `signature-algorithm`: The signing algorithm used to sign ID tokens. This should match the algorithm used by the private key.

Example:

```toml
[oauth.oidc]
signature-key = '''-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQggybcqc86ulFFiOon
WiYrLO4z8/kmkqvA7wGElBok9IqhRANCAAQxZK68FnQtHC0eyh8CA05xRIvxhVHn
0ymka6XBh9aFtW4wfeoKhTkSKjHc/zjh9Rr2dr3kvmYe80fMGhW4ycGA
-----END PRIVATE KEY-----
'''
signature-algorithm = "ES256"
```