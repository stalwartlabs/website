---
sidebar_position: 3
---

# Configuration

Stalwart supports automatic TLS deployment and renewals using the ACME protocol, enhancing security and ease of management for mail server administrators. ACME in configured in the `acme.<name>` section of the configuration file. The following attributes are available:

- `directory`: The directory URL of the ACME provider you're using. For Let's Encrypt, the live directory URL is `https://acme-v02.api.letsencrypt.org/directory` and is used for actual certificate issuance. The staging directory URL is `https://acme-staging-v02.api.letsencrypt.org/directory` and is primarily used for testing. 
- `challenge`: The [challenge type](/docs/server/tls/acme/challenges) to use for validation. Supported values are `http-01`, `dns-01`, and `tls-alpn-01` (default).
- `contact`: Specifies the contact email address, which is used for important communications regarding your ACME account and certificates. 
- `cache`: Specifies the directory where ACME-related data will be stored. 
- `renew-before`: Determines how early before expiration the certificate should be renewed. The default setting is `30d`, which means that renewal attempts will start 30 days before the certificate expires.
- `domains`: A list of subject names for which the certificate should be issued. Wildcard domains are specified using the `*` character, for example, `*.example.org`.
- `eab.kid`: External Account Binding (EAB) key identifier
- `eab.hmac-key`: External Account Binding (EAB) HMAC key
- `default`: If set to `true`, certificate obtained by this ACME provided will be used when the client does not provide an SNI server name.

:::tip Note

- Regularly check your contact email for any communications from the ACME provider.
- It's recommended to initially use the staging environment to ensure your configuration works correctly before switching to the live environment to avoid hitting rate limits.

:::

## DNS-01 configuration

When using the DNS-01 challenge, the following additional attributes are available in the `acme.<name>` section:

- `provider`: Specifies the DNS provider to use for DNS record management.
- `polling-interval`: Specifies the interval at which the DNS records are checked for propagation. The default value is `15s`.
- `propagation-timeout`: Specifies the maximum time to wait for DNS records to propagate. The default value is `1m`.
- `ttl`: Specifies the TTL (Time to Live) value for the DNS records. The default value is `5m`.
- `origin`: Optional setting specifying the DNS zone origin where the DNS records will be created. This is typically the domain name for which the certificate is being issued. If not specified, the domain name is automatically extracted from the specified subject names.

### RFC2136 (TSIG)

The RFC2136 with TSIG authentication provider is selected by setting `acme.<name>.provider` to `rfc2136-tsig`. The following additional attributes are available in the `acme.<name>` section:

- `host`: Specifies the DNS server hostname.
- `port`: Specifies the DNS server port. The default value is `53`.
- `protocol`: Specifies the DNS server protocol. Supported values are `udp` and `tcp`. The default value is `udp`.
- `tsig-algorithm`: Specifies the TSIG algorithm to use for authentication. Supported values are `hmac-md5`, `gss`, `hmac-sha1`, `hmac-sha224`, `hmac-sha256`, `hmac-sha256-128`, `hmac-sha384`, `hmac-sha384-192`, `hmac-sha512`, and `hmac-sha512-256`.
- `key`: Specifies the TSIG key name.
- `secret`: Specifies the TSIG key secret.

### Cloudflare

The Cloudflare provider is selected by setting `acme.<name>.provider` to `cloudflare`. The following additional attributes are available in the `acme.<name>` section:

- `secret`: Specifies the Cloudflare API token.
- `email`: Optional setting to authenticate using the `X-Auth-Email` header. If specified the `secret` attribute is used as the `X-Auth-Key` header value.
- `timeout`: Specifies the timeout for API requests. The default value is `30s`.

## Example

The following example configures Stalwart to use Let's Encrypt's live directory URL using the `tls-alpn-01` challenge type.
```toml
[acme."letsencrypt"]
directory = "https://acme-v02.api.letsencrypt.org/directory"
challenge = "tls-alpn-01"
contact = ["postmaster@%{DEFAULT_DOMAIN}%"]
domains = ["mail.example.org", "imap.example.org", "mx.example.org"]
cache = "%{BASE_PATH}%/etc/acme"
renew-before = "30d"
```
