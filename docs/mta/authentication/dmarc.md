---
sidebar_position: 4
---

# DMARC

DMARC (Domain-based Message Authentication, Reporting & Conformance) is an email authentication protocol that provides a mechanism for email receivers to determine if incoming messages are legitimate and were sent from authorized sources. It allows a sender's domain to publish a policy that specifies how email receivers should handle messages that fail SPF and/or DKIM authentication checks. The DMARC policy is stored in a specially-formatted TXT record in the domain's DNS records, and email receivers can use this information to decide whether to accept, reject, or flag an incoming message based on the results of SPF and DKIM checks. DMARC also provides a reporting mechanism that enables the sender to receive feedback on how their messages are being handled by email receivers. This feedback can be used to improve the accuracy and effectiveness of SPF and DKIM configurations, as well as monitor for potential abuse of the sender's domain.

## Verification

Stalwart supports the following DMARC verification policies which are configured with the `auth.dmarc.verify` attribute:

- `relaxed`: Verify DMARC and report the results in the `Authentication-Results` header.
- `strict`: Reject the message if DMARC fails verification, otherwise report the results in the `Authentication-Results` header.
- `disable`: Do not perform DMARC verification.

Example:

```toml
[auth.dmarc]
verify = [ { if = "listener = 'smtp'", then = "relaxed" },
           { else = "disable" } ]
```

