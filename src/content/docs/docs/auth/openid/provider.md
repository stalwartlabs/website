---
sidebar_position: 3
title: "OIDC Provider"
---

Stalwart includes an OpenID Connect (OIDC) provider, enabled automatically. Clients and applications can therefore authenticate users against Stalwart and obtain ID tokens directly. The provider is OIDC-compliant and supports a range of JWT signing algorithms, both symmetric and asymmetric.

## Signing Algorithms

The following algorithms are supported for signing ID tokens:

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

Symmetric algorithms (`HS256`, `HS384`, `HS512`) use the same secret key for signing and verifying. The key must be shared between the provider (Stalwart) and every verifier, which is convenient but extends the surface on which a compromised key can be observed.

Asymmetric algorithms (`ES256`, `ES384`, `PS256`, `PS384`, `PS512`, `RS256`, `RS384`, `RS512`) use a private key for signing and a matching public key for verification. The private key stays on the server; the public key is distributed to verifiers through the `.well-known/openid-configuration` metadata. This is generally preferable in production: verifiers never see the private key, so losing a verifier does not compromise the signing key.

## Configuration

Signing is controlled by two fields on the [OidcProvider](/docs/ref/object/oidc-provider) singleton (found in the WebUI under <!-- breadcrumb:OidcProvider --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" /><path d="M14 13.12c0 2.38 0 6.38-1 8.88" /><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" /><path d="M2 12a10 10 0 0 1 18-6" /><path d="M2 16h.01" /><path d="M21.8 16c.2-2 .131-5.354 0-6" /><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" /><path d="M8.65 22c.21-.66.45-1.32.57-2" /><path d="M9 6.8a6 6 0 0 1 9 5.2v2" /></svg> Authentication › OIDC Provider<!-- /breadcrumb:OidcProvider -->):

- [`signatureAlgorithm`](/docs/ref/object/oidc-provider#signaturealgorithm): the JWT signature algorithm. Default `"hs256"`. Acceptable values are `es256`, `es384`, `ps256`, `ps384`, `ps512`, `rs256`, `rs384`, `rs512`, `hs256`, `hs384`, `hs512`.
- [`signatureKey`](/docs/ref/object/oidc-provider#signaturekey): the private key used to sign JWTs, wrapped in a `SecretText` variant that can be a direct text value, an environment-variable reference, or a file reference.

If `signatureAlgorithm` is left at its default, Stalwart signs tokens with `hs256` and auto-generates a symmetric key. That works for simple deployments but is not the strongest option when multiple services verify tokens. For production it is preferable to configure an asymmetric algorithm such as `rs256` or `es256`, provide a PEM-encoded private key through `signatureKey`, and let verifiers fetch the matching public key from the discovery endpoint.

Example using an ECDSA P-256 private key stored directly:

```json
{
  "signatureAlgorithm": "es256",
  "signatureKey": {
    "@type": "Text",
    "secret": "-----BEGIN PRIVATE KEY-----\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQggybcqc86ulFFiOon\nWiYrLO4z8/kmkqvA7wGElBok9IqhRANCAAQxZK68FnQtHC0eyh8CA05xRIvxhVHn\n0ymka6XBh9aFtW4wfeoKhTkSKjHc/zjh9Rr2dr3kvmYe80fMGhW4ycGA\n-----END PRIVATE KEY-----\n"
  }
}
```

For production deployments, the same key can be sourced from an environment variable or a file by switching the `SecretText` variant to `EnvironmentVariable` or `File`, which keeps the raw PEM out of any persisted configuration object.
