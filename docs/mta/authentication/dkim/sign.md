---
sidebar_position: 2
---

# Signing

Stalwart can automatically sign outgoing messages with one or more DKIM signatures. The following algorithms are supported:

- `ED25519-SHA256`: the Edwards-Curve Digital Signature Algorithm, known for strong security and efficient processing.
- `RSA-SHA256`: RSA combined with SHA-256.
- `RSA-SHA1`: supported for compatibility with legacy systems only; not recommended for new deployments.

When using RSA-based DKIM signatures, the key size should be at least 2048 bits. RSA keys smaller than 1024 bits are vulnerable to cryptographic attacks.

## Selecting signatures per message

Whether to sign a given message (and with which signature(s)) is controlled by the [`dkimSignDomain`](/docs/ref/object/sender-auth#dkimsigndomain) field on the [SenderAuth](/docs/ref/object/sender-auth) singleton (found in the WebUI under <!-- breadcrumb:SenderAuth --><!-- /breadcrumb:SenderAuth -->). The field accepts an expression that returns the domain whose DKIM signatures should be applied, or `false` to skip signing. The default policy returns the sender domain when the message is sent by an authenticated user from a local domain:

```json
{
  "dkimSignDomain": {
    "match": [{"if": "is_local_domain(sender_domain) && !is_empty(authenticated_as)", "then": "sender_domain"}],
    "else": "false"
  }
}
```

When a domain is returned, Stalwart selects every [DkimSignature](/docs/ref/object/dkim-signature) associated with that domain and signs the outgoing message with each of them. This allows, for example, an Ed25519 signature and an RSA signature to be applied simultaneously by creating two signatures against the same domain.

## Defining signatures

DKIM signatures are [DkimSignature](/docs/ref/object/dkim-signature) objects (found in the WebUI under <!-- breadcrumb:DkimSignature --><!-- /breadcrumb:DkimSignature -->). Each instance is a multi-variant object: the `Dkim1Ed25519Sha256` variant covers Ed25519 signatures and the `Dkim1RsaSha256` variant covers RSA signatures. Both variants share the same configuration fields:

- [`privateKey`](/docs/ref/object/dkim-signature#privatekey): the PEM-encoded private key used for signing. Can be supplied directly or read from an environment variable or file.
- [`domainId`](/docs/ref/object/dkim-signature#domainid): the identifier of the [Domain](/docs/ref/object/domain) this signature belongs to.
- [`selector`](/docs/ref/object/dkim-signature#selector): the selector used to locate the public key in DNS.
- [`headers`](/docs/ref/object/dkim-signature#headers): the list of headers included in the signature. Defaults to `["From", "To", "Date", "Subject", "Message-ID"]`.
- [`canonicalization`](/docs/ref/object/dkim-signature#canonicalization): the canonicalization algorithm applied to the headers and body. Defaults to `relaxed/relaxed`.
- [`expire`](/docs/ref/object/dkim-signature#expire): optional signature lifetime.
- [`thirdParty`](/docs/ref/object/dkim-signature#thirdparty): optional authorised third-party signature value.
- [`thirdPartyHash`](/docs/ref/object/dkim-signature#thirdpartyhash): optional hashing algorithm (`sha256` or `sha1`) used to verify third-party signature DNS records.
- [`auid`](/docs/ref/object/dkim-signature#auid): optional Agent User Identifier included in the signature header.
- [`report`](/docs/ref/object/dkim-signature#report): whether to request failure reports when signature verification fails on the recipient side. Default `true`.
- [`stage`](/docs/ref/object/dkim-signature#stage): the rotation stage (`active`, `pending`, `retiring`, `retired`). Active keys sign outgoing mail; pending keys are staged for DNS publication; retiring keys have been superseded but still published in DNS; retired keys have been removed from DNS and are pending deletion.
- [`nextTransitionAt`](/docs/ref/object/dkim-signature#nexttransitionat): optional date when the key transitions to the next rotation stage.

For example, a pair of RSA and Ed25519 signatures for `example.org`, each covering an extended set of headers, looks like this:

```json
[
  {
    "@type": "Dkim1RsaSha256",
    "domainId": "<Domain id>",
    "selector": "rsa-default",
    "privateKey": {"@type": "File", "filePath": "/opt/stalwart/etc/private/dkim-rsa.key"},
    "headers": ["From", "To", "Cc", "Date", "Subject", "Message-ID", "Organization", "MIME-Version", "Content-Type", "In-Reply-To", "References", "List-Id", "User-Agent", "Thread-Topic", "Thread-Index"],
    "canonicalization": "relaxed/relaxed",
    "expire": "10d",
    "report": true,
    "stage": "active"
  },
  {
    "@type": "Dkim1Ed25519Sha256",
    "domainId": "<Domain id>",
    "selector": "ed-default",
    "privateKey": {"@type": "File", "filePath": "/opt/stalwart/etc/private/dkim-ed.key"},
    "headers": ["From", "To", "Cc", "Date", "Subject", "Message-ID", "Organization", "MIME-Version", "Content-Type", "In-Reply-To", "References", "List-Id", "User-Agent", "Thread-Topic", "Thread-Index"],
    "canonicalization": "relaxed/relaxed",
    "report": false,
    "stage": "active"
  }
]
```

## Multiple domains

Although a single DKIM key may be used across multiple domains with [Authorized Third-Party Signatures](https://www.ietf.org/rfc/rfc6541.html), a separate key per domain is recommended. This gives more granular control and makes issues easier to isolate. Because [`dkimSignDomain`](/docs/ref/object/sender-auth#dkimsigndomain) returns a domain name, the correct signatures are selected automatically as long as each domain has its own signature definitions.

## Generating keys

The simplest way to generate and publish a DKIM key pair is from the [WebUI](/docs/management/webui/overview). Keys may also be generated manually using `openssl`.

### RSA

```bash
openssl genrsa -out rsa_private.key 2048
openssl rsa -in rsa_private.key -pubout -out rsa_public.key
```

These commands generate a 2048-bit RSA private key and derive the public key. The private key must be kept secure.

### Edwards-curve Digital Signature Algorithm

```bash
openssl genpkey -algorithm ed25519 -out ed_private.key
openssl pkey -in ed_private.key -pubout -out ed_public.key
```

## Publishing DKIM keys

Once the public key is available, it is published in DNS as a TXT record. The record name follows the form `selector._domainkey.yourdomain.org`.

To obtain an RSA DKIM public key in a format suitable for a DNS TXT record:

```bash
openssl rsa -in private.key -pubout -outform der 2>/dev/null | openssl base64 -A
```

For an Ed25519 DKIM public key:

```bash
openssl asn1parse -in ed_public.key -offset 12 -noout -out /dev/stdout | base64
```

The result is a base64-encoded public key that can be wrapped into a standard DKIM TXT record:

```
v=DKIM1; k=rsa; p=PUBLIC_KEY
```

For example, with domain `example.org`, selector `default`, and an RSA public key `ABCDEFG`:

```
default._domainkey.example.org. IN TXT "v=DKIM1; k=rsa; p=ABCDEFG"
```

The signature must use the matching selector and domain.
