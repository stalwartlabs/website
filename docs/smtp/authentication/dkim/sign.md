---
sidebar_position: 2
---

# Signing

Stalwart Mail Server can be configured to automatically sign outgoing messages with one or multiple signatures using any of the following algorithms:

- `ED25519-SHA256`: This algorithm uses the Edwards-Curve Digital Signature Algorithm, which is known for its strong security and efficiency in processing.
- `RSA-SHA256`: Provides robust security by combining RSA encryption with the SHA-256 hashing algorithm, making it suitable for modern security demands.
- `RSA-SHA1`: Although supported, it is less secure than RSA-SHA256 and is generally not recommended for use. RSA-SHA1 can still be used for legacy systems that require compatibility.

When using RSA-based DKIM signatures, it is recommended that the key length be no less than 1024 bits. However, for enhanced security, keys larger than 1024 bits are advised. RSA keys of smaller lengths are more susceptible to cryptographic attacks, thereby compromising the security integrity of the email verification process.

The list of signatures to use is configured by the `auth.dkim.sign` parameter. For example, to sign each message with both RSA and ED25519 signatures:

```toml
[auth.dkim]
sign = [ { if = "listener != 'smtp'", then = "['rsa', 'ed25519']" }, 
         { else = false } ]
```

## Signatures

DKIM signatures are defined under the `signature.<name>` key with the following attributes:

- `private-key`: The contents or location of the private key file used to sign messages.
- `domain`: The domain associated with the DKIM signature.
- `selector`: The selector used to identify the DKIM public key.
- `headers`: A list of headers to be signed.
- `algorithm`: The encryption algorithm used for the DKIM signature. Supported algorithms include `ed25519-sha256`, `rsa-sha-256` and `rsa-sha-1`.
- `canonicalization`: The method used to canonicalize the signed headers and body of the message. Expects two `simple` or `relaxed` values separated by a `/`.
- `expire`: The amount of time the DKIM signature is valid for (optional).
- `third-party`: Authorized third-party signature value (optional).
- `third-party-algo`: The hashing algorithm used to verify third-party signature DNS records (optional). Supported algorithms include `sha256` and `sha1`.
- `auid`: The agent user identifier (optional).
- `set-body-length`: Whether to include the body length in the DKIM signature (optional).
- `report`: Whether to request reports when the signature verification fails (optional).

Example:

```toml
[signature."rsa"]
private-key = "%{file:/opt/stalwart-smtp/etc/private/dkim-rsa.key}%"
domain = "example.org"
selector = "rsa_default"
headers = ["From", "To", "Date", "Subject", "Message-ID"]
algorithm = "rsa-sha256"
canonicalization = "relaxed/relaxed"
expire = "10d"
set-body-length = false
report = true

[signature."ed25519"]
private-key = "%{file:/opt/stalwart-smtp/etc/private/dkim-ed.key}"
domain = "example.org"
selector = "ed_default"
headers = ["From", "To", "Date", "Subject", "Message-ID"]
algorithm = "ed25519-sha256"
canonicalization = "simple/simple"
set-body-length = true
report = false
```

## Multiple Domains

Although a single DKIM key may be used to sign multiple domains using [Authorized Third-Party Signatures](https://www.ietf.org/rfc/rfc6541.html), it is recommended to use a separate key for each domain. This allows for more granular control over the DKIM signing process and makes it easier to identify the source of any issues that may arise.

To select which signature to use depending on the sender's domain, you can use a [configuration expression](/docs/configuration/expressions/overview) that evaluates the `sender_domain` variable and selects the appropriate signature. Then, to select the appropriate signature a [dynamic value](/docs/configuration/expressions/values) may be used. For example:

```toml
[auth.dkim]
sign = [ { if = "is_local_domain('', sender_domain)", then = "'rsa_' + sender_domain" }, 
         { else = false } ]
```

Alternatively, you may also configure expressions that select the correct signature without using dynamic values as follows:

```toml
[auth.dkim]
sign = [ { if = "sender_domain = 'example.org'", then = "'rsa_foo'" }, 
         { if = "sender_domain = 'example.org'", then = "'rsa_example'" }, 
         { else = false } ]
```

## Generating keys

The simplest way to generate and publish a DKIM key pair is using the [web-admin](/docs/management/webadmin/overview). However, you can also generate the keys manually using the `openssl` command.

### RSA

You can generate a new RSA DKIM key pair using the `openssl` command:

```bash
$ openssl genrsa -out rsa_private.key 2048
$ openssl rsa -in rsa_private.key -pubout -out rsa_public.key
```

These commands will generate a 2048-bit RSA private key and output it to a file named `rsa_private.key`. The public key will be output to a file named `rsa_public.key`.
Make sure to keep your private key safe and secure.

### Edwards-curve Digital Signature Algorithm

Similarly, you can generate a new ED25519 DKIM key pair using the `openssl` command:

```bash
openssl genpkey -algorithm ed25519 -out ed_private.key
openssl pkey -in ed_private.key -pubout -out ed_public.key
```

These commands will generate a ED25519 private key and output it to a file named `ed_private.key`. The public key will be output to a file named `ed_public.key`.
Make sure to keep your private key safe and secure.

## Publishing DKIM keys

Once you have the public key, you can publish it in your DNS records as a TXT record. The name of this record should be in the form `selector._domainkey.yourdomain.org`, where selector is a string that you choose, and `yourdomain.org` is your domain.

In order to obtain the RSA DKIM public key in a format suitable to be published in a DNS TXT record execute:

```bash
$ openssl rsa -in private.key -pubout -outform der 2>/dev/null | openssl base64 -A
```

Or, for the ED25519 DKIM public key:

```bash
$ openssl asn1parse -in ed_public.key -offset 12 -noout -out /dev/stdout | base64
```

This will output the public key encoded in `base64`. The next step is to add a TXT record to your DNS zone file with the following format. For example, to publish an RSA key:

```txt
v=DKIM1; k=rsa; p=PUBLIC_KEY
```

For example, if your domain is `example.org`, your selector is `default` and your RSA public key is `ABCDEFG` (your actual key will be much longer than this), the DNS TXT record would look like this:

```txt
default._domainkey.example.org. IN TXT "v=DKIM1; k=rsa; p=ABCDEFG"
```

Make sure your signature has been configured with the correct selector and domain as described [above](#signatures).

