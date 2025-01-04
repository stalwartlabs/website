---
sidebar_position: 6
---

# DNS Blocklists

In the realm of email security and spam filtering, two powerful tools stand out for their efficacy in combating unsolicited messages: DNSBL (DNS-based Block List) and DNSWL (DNS-based Allowlist). DNSBLs and DNSWLs are maintained by various organizations and are updated in real-time to reflect the latest information about spam and malicious activity on the Internet. These tools utilize DNS (Domain Name System) queries to quickly and efficiently determine the reputation of sending IP addresses or domain names, aiding in the decision-making process of whether to accept, reject, or further scrutinize an incoming email.

**DNSBL (DNS-based Block List)** provide a list of IP addresses or domain names published through the Internet Domain Name System. The primary purpose of a DNSBL is to catalog IP addresses or domain names known to be sources of spam, malicious activities, or other undesirable content. When an email server receives an incoming email, it queries the DNSBL to check if the sender is on the blacklist. If a match is found, the email can be flagged, rejected, or subjected to further checks based on the server's configuration.

Operating in contrast to DNSBL, a **DNSWL (DNS-based Allowlist)** is a list of trusted IP addresses or domain names. These are typically IP addresses, ranges or domain names known to send legitimate emails. By querying a DNSWL, email servers can quickly identify and prioritize emails from trusted senders, reducing false positives and ensuring that genuine messages reach their intended recipients without unnecessary delays.

The following DNSBL checks are done by Stalwart Mail Server:

- **IP Address**: Ensuring the integrity and security of incoming emails often starts with verifying the reputation of the originating IP addresses. Stalwart Mail Server employs a rigorous checking mechanism, scrutinizing not only the IP addresses of remote hosts but also every IP address found in the 'Received' headers of an email. This comprehensive approach enhances the accuracy of spam detection and minimizes the chances of legitimate emails being misclassified.
- **Domain**: While IP addresses serve as a significant identifier for email filtering, domain names are equally vital. They provide a clearer view of the email's origin, making them an integral component in the fight against spam and malicious emails. Stalwart Mail Server implements a comprehensive domain-checking mechanism to ensure the legitimacy and safety of incoming messages.
- **URL**: The system also performs URL checks against DNSBLs to identify malicious links embedded within emails. By cross-referencing URLs against known blocklists, the server can detect and prevent users from accessing potentially harmful websites or content. This proactive approach to URL filtering helps safeguard users against phishing attempts, malware distribution, and other cyber threats.
- **Hashes**: Beyond the conventional domain and IP checks, the system employs a more granular and unique approach to email filtering using hash checks. This method involves creating digital 'fingerprints' or hashes of specific components within the email and validating them against known blocklists. By leveraging hash checks, the system can identify threats even if the malicious sender slightly modifies their tactics or domain names, ensuring a thorough and dynamic defense against evolving email-based threats.

## DNSBL Checks

Stalwart Mail Server allows administrators to configure custom DNSBL checks for the spam filter. These DNSBL checks use [expressions](/docs/configuration/expressions/overview) to evaluate specific aspects of incoming messages and assign tags based on the results. By integrating DNSBL checks, administrators can enhance the spam filter’s capabilities and tailor its behavior to meet specific security and operational requirements.

Each DNSBL server check is defined under the `spam-filter.dnsbl.server.<id>` section of the configuration, where `<id>` is a unique identifier for the server. The following settings are used to configure DNSBL servers in the spam filter:

- `enable`:  This setting determines whether the DNSBL server is enabled. When set to `true`, the server will be active for DNSBL checks.
- `scope`   Specifies the part of the message to which the DNSBL server should apply. 
- `zone` : Defines an expression that evaluates to the DNSBL zone to query. If the expression evaluates to `false`, the DNSBL server is skipped for that message. This allows dynamic decision-making on when and how DNSBL queries are performed.
- `tag` : Specifies an expression that evaluates to the tag to apply to the message based on the DNS query result. If the expression evaluates to `false`, no tag is applied. This setting enables precise tagging based on the returned DNS results, allowing for flexible spam filter actions.

Supported scopes include:

- `url`: Applies to URLs in the message.
- `domain`: Applies to domains found in the message.
- `email`: Applies to email addresses in the message.
- `ip`: Applies to IP addresses associated with the message.
- `header`: Applies to message headers.
- `body`: Applies to the message body.
- `any`: Applies to any part of the message.

Example:

```toml
[spam-filter.dnsbl.server.STWT_RBL_MAILSPIKE_IP]
enable = true
zone = [ { if = "location == 'tcp'", then = "ip_reverse + '.rep.mailspike.net'" },
		{ else = false } ]
tag = [ { if = "octets[0] != 127", then = "false" },
        { if = "octets[3] == 10", then = "'RBL_MAILSPIKE_WORST'" },
        { if = "octets[3] == 11", then = "'RBL_MAILSPIKE_VERYBAD'" },
        { if = "octets[3] == 12", then = "'RBL_MAILSPIKE_BAD'" },
        { if = "octets[3] >= 13 && octets[3] <= 16", then = "'RWL_MAILSPIKE_NEUTRAL'" },
        { if = "octets[3] == 17", then = "'RWL_MAILSPIKE_POSSIBLE'" },
        { if = "octets[3] == 18", then = "'RWL_MAILSPIKE_GOOD'" },
        { if = "octets[3] == 19", then = "'RWL_MAILSPIKE_VERYGOOD'" },
        { if = "octets[3] == 20", then = "'RWL_MAILSPIKE_EXCELLENT'" },
		{ else = false } ]
scope = "ip"
```

## Limits

The maximum number of DNSBL queries that can be made for a single email is determined by the following settings:

- `spam-filter.dnsbl.max-check.ip`: The maximum number of IP address queries allowed per email.
- `spam-filter.dnsbl.max-check.domain`: The maximum number of domain queries allowed per email.
- `spam-filter.dnsbl.max-check.email`: The maximum number of email queries allowed per email.
- `spam-filter.dnsbl.max-check.url`: The maximum number of URL queries allowed per email.

Example:

```toml
[spam-filter.dnsbl.max-check]
ip = 50
domain = 50
email = 50
url = 50

```