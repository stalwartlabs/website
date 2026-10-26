---
sidebar_position: 2
title: "Signing"
description: "How Stalwart chooses the domain and keys that sign an outgoing message, which messages are signed by default, alias domains, and how to define, generate and publish DKIM keys manually."
---

Stalwart signs outgoing messages with DKIM so that receiving servers can verify two things: that the signing domain sent the message, and that the message was not modified in transit. Signing happens in two decisions. First, a signing domain is chosen for each message. Then the keys of that domain sign it. [DKIM overview](/docs/mta/authentication/dkim/) introduces signatures, selectors and alignment.

## Signing domain

The signing domain is chosen by [`dkimSignDomain`](/docs/ref/object/mta-stage-data#dkimsigndomain), an expression of the [DATA stage](/docs/mta/inbound/data#dkim-signing) on the [MtaStageData](/docs/ref/object/mta-stage-data) singleton (found in the WebUI under <!-- breadcrumb:MtaStageData --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Session › DATA Stage<!-- /breadcrumb:MtaStageData -->). The expression returns the name of a domain, whose keys then sign the message, or `false` for no signature. The default expression is:

```json
{
  "dkimSignDomain": {
    "match": {
      "0": {"if": "is_local_domain(sender_domain) && !is_empty(authenticated_as)", "then": "sender_domain"}
    },
    "else": "false"
  }
}
```

This expression has two conditions. A message is signed only when the client authenticated, and only when the domain of the envelope sender is hosted on the server. With the default expression, the following messages are therefore sent unsigned:

- Messages relayed for an application server or another system that delivers to Stalwart without authenticating, even when their sender is in a local domain
- Messages whose envelope sender is in a domain that is not hosted on the server

A trusted application server that relays without authentication is a common case. To sign its messages, add a branch for its address:

```json
{
  "dkimSignDomain": {
    "match": {
      "0": {"if": "is_local_domain(sender_domain) && (!is_empty(authenticated_as) || remote_ip == '192.0.2.10')", "then": "sender_domain"}
    },
    "else": "false"
  }
}
```

The expression returns a single domain. The message is then signed with every DkimSignature of that domain whose stage is `active`, both DKIM and [DKIM2](/docs/mta/authentication/dkim/dkim2) keys. The two kinds combine differently. A domain with an Ed25519 key and an RSA key adds two DKIM signatures to each message, one per key. Its DKIM2 keys, in contrast, share a single DKIM2 signature with one entry per key.

Messages that Stalwart generates itself do not use this expression, because each kind has its own signing settings:

- Delivery status notifications: [DsnReportSettings](/docs/ref/object/dsn-report-settings).
- DMARC, TLS, SPF and DKIM reports: their report settings.
- Messages sent by system Sieve scripts: [SieveSystemInterpreter](/docs/sieve/interpreter/trusted#settings).
- Vacation replies and other messages sent by user scripts: [SieveUserInterpreter](/docs/sieve/interpreter/untrusted#vacation-replies-and-generated-messages).

Each of these has a `dkimSignDomain` expression of its own. These messages carry no DKIM2 chain, so their DKIM2 signature starts one. That signature is added only when their `From` header field is Authentic for the signing domain ([Reports and notifications](/docs/mta/authentication/dkim/dkim2#reports-and-notifications)).

### Alias domains

A message from an address in an alias domain is signed with the keys of the domain it is an alias of, and that domain appears in the `d=` tag. The signature therefore does not align with the `From` domain for [DMARC](/docs/mta/authentication/dmarc). When the mail of a domain must pass DMARC with DKIM alignment, that domain has to be a separate Domain object with its own keys ([Domain aliases](/docs/domains/addresses#domain-aliases)).

## Signing keys

Each key is a [DkimSignature](/docs/ref/object/dkim-signature) (found in the WebUI under <!-- breadcrumb:DkimSignature --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg> Domains › DKIM Signatures<!-- /breadcrumb:DkimSignature -->) that belongs to a [Domain](/docs/ref/object/domain). The variant of the object selects the kind of signature and the algorithm:

| Variant | Signature | Algorithm |
|---|---|---|
| `Dkim1Ed25519Sha256` | DKIM | Ed25519 with SHA-256 ([RFC 8463](https://www.rfc-editor.org/rfc/rfc8463)) |
| `Dkim1RsaSha256` | DKIM | RSA with SHA-256 ([RFC 6376](https://www.rfc-editor.org/rfc/rfc6376)) |
| `Dkim2Ed25519Sha256` | DKIM2 | Ed25519 with SHA-256 |
| `Dkim2RsaSha256` | DKIM2 | RSA with SHA-256 |
| `Dkim2MlDsa44Ed25519Sha512` | DKIM2 | ML-DSA-44 and Ed25519 composite with SHA-512 (post-quantum) |

RSA-SHA1 is not available for signing, because [RFC 8301](https://www.rfc-editor.org/rfc/rfc8301) prohibits it. Use RSA keys of at least 2048 bits. Receivers ignore RSA signatures made with keys shorter than 1024 bits, as RFC 8301 requires. Signing with both Ed25519 and RSA lets receivers that do not support Ed25519 verify the RSA signature. The DKIM2 variants, their fields and the choice between their algorithms are described in [DKIM2](/docs/mta/authentication/dkim/dkim2).

### Automatic key management

Most domains do not need keys defined by hand. With [`dkimManagement`](/docs/ref/object/domain#dkimmanagement) set to `Automatic` on the Domain, Stalwart creates the keys. When the domain also uses [automatic DNS management](/docs/domains/dns-records), Stalwart publishes and rotates them as well. [DKIM key rotation](/docs/domains/dkim-rotation) describes the settings and the stages of a key. Without automatic DNS management, the keys sign mail at once but are not published or rotated. Receivers then cannot verify the signatures until the TXT records listed in the domain's [`dnsZoneFile`](/docs/ref/object/domain#dnszonefile) are added to the zone by hand.

### Defining a key manually

A key is created by hand in two cases: when `dkimManagement` is set to `Manual`, and when a key must be shared with another sending system. The fields of the DKIM variants are:

| Field | Purpose |
|---|---|
| [`domainId`](/docs/ref/object/dkim-signature#domainid) | Required. The domain the key belongs to. |
| [`selector`](/docs/ref/object/dkim-signature#selector) | Required. The selector, which names the DNS record of the public key, `<selector>._domainkey.<domain>`. |
| [`privateKey`](/docs/ref/object/dkim-signature#privatekey) | Required. The private key, given directly, from an environment variable or from a file. RSA keys must be in PEM (PKCS#1 or PKCS#8), and Ed25519 keys may be in PEM or bare base64 PKCS#8, as may the composite keys of DKIM2 ([DNS records](/docs/mta/authentication/dkim/dkim2#dns-records)). |
| [`stage`](/docs/ref/object/dkim-signature#stage) | Only `active` keys sign. `pending`, `retiring` and `retired` are rotation stages. |
| [`headers`](/docs/ref/object/dkim-signature#headers) | The header fields covered by the signature, by default <!-- default:DkimSignature.headers -->`Date`, `From`, `Message-ID`, `Subject` and `To`<!-- /default -->. |
| [`canonicalization`](/docs/ref/object/dkim-signature#canonicalization) | How headers and body are normalised before hashing. |
| [`expire`](/docs/ref/object/dkim-signature#expire) | Validity of each signature, in milliseconds, written to the `x=` tag. Without it, signatures do not expire. |
| [`report`](/docs/ref/object/dkim-signature#report) | Ask receivers for failure reports, with the `r=y` tag ([RFC 6651](https://www.rfc-editor.org/rfc/rfc6651)). |
| [`auid`](/docs/ref/object/dkim-signature#auid) | The agent or user identifier, the `i=` tag. |
| [`thirdParty`](/docs/ref/object/dkim-signature#thirdparty), [`thirdPartyHash`](/docs/ref/object/dkim-signature#thirdpartyhash) | The authorised third-party signature of [RFC 6541](https://www.rfc-editor.org/rfc/rfc6541). |

The public key is not supplied. The server derives it from the private key and shows it in [`publicKey`](/docs/ref/object/dkim-signature#publickey). The following object defines an RSA key read from a file, covering additional header fields:

```json
{
  "@type": "Dkim1RsaSha256",
  "domainId": "<Domain id>",
  "selector": "rsa-2026",
  "privateKey": {"@type": "File", "filePath": "/etc/stalwart/dkim/rsa-2026.key"},
  "headers": {
    "From": true, "To": true, "Cc": true, "Date": true, "Subject": true,
    "Message-ID": true, "MIME-Version": true, "Content-Type": true,
    "In-Reply-To": true, "References": true, "List-Id": true
  },
  "stage": "active"
}
```

### Generating keys with OpenSSL

The following commands generate an RSA key of 2048 bits and an Ed25519 key, in PEM:

```bash
openssl genrsa -out rsa.key 2048
openssl genpkey -algorithm ed25519 -out ed25519.key
```

Receivers find the public key in a TXT record at `<selector>._domainkey.<domain>`, where the value of the `p=` tag is the base64 public key. For the RSA key, the following command produces that value:

```bash
openssl rsa -in rsa.key -pubout -outform der 2>/dev/null | openssl base64 -A
```

An Ed25519 key is published as the raw 32-byte key, which the following command extracts:

```bash
openssl pkey -in ed25519.key -pubout -outform der | tail -c 32 | openssl base64 -A
```

The records then read as follows, with `k=ed25519` for Ed25519 keys:

```text
rsa-2026._domainkey.example.org.     IN TXT "v=DKIM1; k=rsa; p=<base64 key>"
ed-2026._domainkey.example.org.      IN TXT "v=DKIM1; k=ed25519; p=<base64 key>"
```

The record of a 2048-bit RSA key is longer than 255 characters, so it must be split into several strings within one TXT record. The domain's `dnsZoneFile` also lists the record of each key, ready to copy.
