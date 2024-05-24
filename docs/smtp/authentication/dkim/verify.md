---
sidebar_position: 3
---

# Verifying

Stalwart SMTP supports verifying the DKIM signatures of incoming messages using the `ED25519-SHA256` (Edwards-Curve Digital Signature Algorithm), `RSA-SHA256` or `RSA-SHA1` algorithms. The `auth.dkim.verify` attribute indicates the DKIM verification policy:

- `relaxed`: Verify DKIM and report the results in the `Authentication-Results` header.
- `strict`: Reject the message if all DKIM signatures fail verification, otherwise report the results in the `Authentication-Results` header.
- `disable`: Do not perform DKIM verification.

Example:

```toml
[auth.dkim]
verify = "relaxed"
```

## Insecure Signatures

An insecure DKIM signature contains parameters that, although conforming to the standards, are configured in ways that could potentially be exploited by attackers. For example, the DKIM's l= parameter, which specifies the exact number of octets in the email body that the signature covers, can be particularly problematic. An attacker could manipulate this by appending additional content to the message body beyond the specified l= value. Since the signature itself remains valid for the portion of the message it covers, this could lead to scenarios where forged or tampered content is added without invalidating the DKIM signature. Such situations are especially dangerous as they can mislead both automated systems and end-users, undermining trust indicators such as Brand Indicators for Message Identification (BIMI).

By default, Stalwart Mail Server is configured to ignore these insecure signatures, thus enhancing the security of the email handling process. This setting helps prevent scenarios where emails with potentially forged content could be mistakenly trusted.

If necessary, this behavior can be altered to accept all signatures, including those deemed insecure, by modifying the configuration setting `auth.dkim.strict` to `false`.

Example:

```toml
[auth.dkim]
strict = false
```

