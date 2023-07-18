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

