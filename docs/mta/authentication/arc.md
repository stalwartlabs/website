---
sidebar_position: 3
---

# ARC

Authenticated Received Chain (ARC) is a protocol for email authentication that is used to establish a chain of trust between email domains. It is designed to provide a way for email receivers to authenticate the domain of the sender of an email message, even if the message has been forwarded multiple times. The ARC protocol works by adding a new header to an email message that contains information about the authentication status of the message at each hop along its delivery path. This header is then used by email receivers to validate the authenticity of the message and determine if it is trustworthy. By using ARC, email receivers can have greater confidence in the authenticity of an email message, even if it has been forwarded multiple times or passed through multiple email servers.

## Sealing

ARC sealing is a process in which a receiving mail server adds its own digital signature to the existing ARC chain of a received email message. The signature provides a way for recipient mail servers to verify the authenticity of the message and its previous handling by other mail servers. The sealing process updates the ARC chain by adding new information about the recipient's handling of the message, such as processing results, feedback, and other information. The updated ARC chain can then be passed along with the message as it is forwarded to the next recipient.

Stalwart can be configured to automatically seal incoming and outgoing messages using the `ED25519-SHA256` (Edwards-Curve Digital Signature Algorithm), `RSA-SHA256` or `RSA-SHA1` algorithms. The signature to use for sealing is configured by the `auth.arc.seal` parameter, for example:

```toml
[auth.arc]
seal = "rsa"
```

Please refer to the [DKIM section](/docs/mta/authentication/dkim/overview) for details on how to add signatures.

## Verification

Stalwart supports verifying the ARC seals and signatures of incoming messages using the `ED25519-SHA256` (Edwards-Curve Digital Signature Algorithm), `RSA-SHA256` or `RSA-SHA1` algorithms. The `auth.arc.verify` attribute indicates the ARC verification policy:

- `relaxed`: Verify ARC and report the results in the `Authentication-Results` header.
- `strict`: Reject the message if all ARC seals fail verification, otherwise report the results in the `Authentication-Results` header.
- `disable`: Do not perform ARC verification.

Example:

```toml
[auth.arc]
verify = "relaxed"
```

