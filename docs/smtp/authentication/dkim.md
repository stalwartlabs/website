---
sidebar_position: 1
---

# DKIM

DomainKeys Identified Mail (DKIM) is a widely-used email authentication method employed to verify the authenticity of an email message. It uses public key cryptography to encrypt a digital signature within the message header that can be verified by the recipient's mail server. The goal of DKIM is to prevent email spoofing and make it possible to track which domain sent an email. It works by adding a signature to the message header that is encrypted with a private key held by the sending domain's mail server, which can be decrypted with a public key that is published in the domain's DNS records. The recipient's mail server can then use this public key to validate the signature and confirm that the message was indeed sent by the domain that claims to have sent it.

By enabling DKIM in Stalwart SMTP, outgoing emails will be signed with one or multiple digital signatures that verify the authenticity of the message and helps to prevent it from being marked as spam or rejected by the recipient's email servers. This increases the deliverability of emails, helps to protect the domain's reputation, helps to build trust with the recipients and improves the overall security and privacy of email communications.

## Signing

Stalwart SMTP can be configured to automatically sign outgoing messages with one or multiple signatures using the `ED25519-SHA256` (Edwards-Curve Digital Signature Algorithm), `RSA-SHA256` or `RSA-SHA1` algorithms. The list of signatures to use is configured by the `auth.dkim.sign` parameter, for example:

```toml
[auth.dkim]
sign = [ { if = "listener", ne = "smtp", then = ["rsa", "ed25519"] }, 
         { else = [] } ]
```

### Signatures

DKIM signatures are defined under the `signature.<name>` key with the following attributes:

- `public-key`: The contents or location of the public key file used to sign messages (required only for ED25519).
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
private-key = "file:///opt/stalwart-smtp/etc/private/dkim-rsa.key"
domain = "foobar.org"
selector = "rsa_default"
headers = ["From", "To", "Date", "Subject", "Message-ID"]
algorithm = "rsa-sha256"
canonicalization = "relaxed/relaxed"
expire = "10d"
set-body-length = false
report = true

[signature."ed25519"]
public-key = "11qYAYKxCrfVS/7TyWQHOg7hcvPapiMlrwIaaPcHURo="
private-key = "file:///opt/stalwart-smtp/etc/private/dkim-ed.key"
domain = "foobar.org"
selector = "ed_default"
headers = ["From", "To", "Date", "Subject", "Message-ID"]
algorithm = "ed25519-sha256"
canonicalization = "simple/simple"
set-body-length = true
report = false
```

## Verification

Stalwart SMTP supports verifying the DKIM signatures of incoming messages using the `ED25519-SHA256` (Edwards-Curve Digital Signature Algorithm), `RSA-SHA256` or `RSA-SHA1` algorithms. The `auth.dkim.verify` attribute indicates the DKIM verification policy:

- `relaxed`: Verify DKIM and report the results in the `Authentication-Results` header.
- `strict`: Reject the message if all DKIM signatures fail verification, otherwise report the results in the `Authentication-Results` header.
- `disable`: Do not perform DKIM verification.

Example:

```toml
[auth.dkim]
verify = "relaxed"
```

## Reporting

DKIM authentication failure reporting is a mechanism that allows domain owners to receive notifications when email messages sent from their domain fail DKIM authentication checks at recipient mail servers. The reporting mechanism uses an email-based report format, which is sent to a designated address within the domain. This information can be used to identify misconfigurations or malicious activity that may negatively impact the domain's email reputation. The reports typically include information such as the message's sender, recipient, and the specific DKIM verification result (e.g., "failed" or "permanently failed"). By analyzing the reports, domain owners can detect issues with their DKIM implementation and take action to resolve them, improving their email deliverability and protecting their domain's reputation.

Stalwart SMTP [automatically analyzes](/docs/smtp/authentication/analysis) received DKIM failure reports from external hosts and can also generate its own DKIM reports to inform other hosts about the authentication outcomes of the signatures it has processed. Outgoing DKIM failure reports are configured under the `report.dkim` key using the following options:

- `from-name`: The name that will be used in the `From` header of the DKIM report email.
- `from-address`: The email address that will be used in the `From` header of the DKIM report email.
- `subject`: The subject name that will be used in the DKIM report email.
- `send`: The rate at which DKIM reports will be sent to a given email address. When this rate is exceeded, no further DKIM failure reports will be sent to that address.
- `sign`: The list of DKIM signatures to use when signing the DKIM report. 

Example:

```toml
[report.dkim]
from-name = "Report Subsystem"
from-address = "noreply-dkim@foobar.org"
subject = "DKIM Authentication Failure Report"
sign = ["rsa"]
send = "1/1d"
```
