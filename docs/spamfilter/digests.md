---
sidebar_position: 9
---

# Collaborative Digests

In the evolving world of cyber threats, collaborative spam detection emerges as one of the most potent tools in the fight against unsolicited emails. By harnessing the power of distributed networks and collective intelligence, collaborative spam detection provides a dynamic and ever-updating defense mechanism against spam.

Collaborative spam detection and filtering networks, like Pyzor, Razor, and DCC, primarily use message digests or hashes. When a user identifies an email as spam, these systems generate a unique hash or digest of that email. This hash is then shared across the network. When another user receives an email, its hash is compared against the repository of spam hashes. If a match is found, the email is flagged as spam.

The underlying principle is straightforward: if one user in the network identifies an email as spam, others in the network are immediately protected from that particular spam email, thanks to the shared hash.

## Pyzor

Pyzor is a prominent example of a collaborative spam detection system. It's an open-source tool that uses collective intelligence to identify and filter out spam. When users across the network mark emails as spam, Pyzor creates and shares their hashes. Conversely, it can also recognize legitimate emails, ensuring that genuine communications are not mistakenly flagged.

### Configuration

Pyzor is enabled by default in Stalwart Mail Server and it is configured to use the public Pyzor server at `public.pyzor.org` with a lookup timeout of 5 seconds.

The following settings can be configured in the server's configuration file:

- `spam-filter.pyzor.enable`: Enables or disables Pyzor.
- `spam-filter.pyzor.host`: The Pyzor server host.
- `spam-filter.pyzor.port`: The Pyzor server port.
- `spam-filter.pyzor.timeout`: The lookup timeout for Pyzor.
- `spam-filter.pyzor.count`: The minimum times a message hash has to appear in the Pyzor blocklist database to be considered.
- `spam-filter.pyzor.wl-count`: The minimum times a message hash has to appear in the Pyzor allowlist database to be considered.
- `spam-filter.pyzor.ratio`: The ratio of the message hash count in the blocklist to the allowlist for the message to be considered spam.

Example:

```toml
[spam-filter.pyzor]
enable = true
host "public.pyzor.org"
port = "24441"
timeout = 5s
count = 5
wl-count = 10
ratio = "0.2"
```