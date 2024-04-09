---
sidebar_position: 4
---

# DNS Blocklists

In the realm of email security and spam filtering, two powerful tools stand out for their efficacy in combating unsolicited messages: DNSBL (DNS-based Block List) and DNSWL (DNS-based Allowlist). DNSBLs and DNSWLs are maintained by various organizations and are updated in real-time to reflect the latest information about spam and malicious activity on the Internet. These tools utilize DNS (Domain Name System) queries to quickly and efficiently determine the reputation of sending IP addresses or domain names, aiding in the decision-making process of whether to accept, reject, or further scrutinize an incoming email.

- **DNSBL (DNS-based Block List)**: This is a list of IP addresses or domain names published through the Internet Domain Name System. The primary purpose of a DNSBL is to catalog IP addresses or domain names known to be sources of spam, malicious activities, or other undesirable content. When an email server receives an incoming email, it queries the DNSBL to check if the sender is on the blacklist. If a match is found, the email can be flagged, rejected, or subjected to further checks based on the server's configuration.
- **DNSWL (DNS-based Allowlist)**: Operating in contrast to DNSBL, a DNSWL is a list of trusted IP addresses or domain names. These are typically IP addresses, ranges or domain names known to send legitimate emails. By querying a DNSWL, email servers can quickly identify and prioritize emails from trusted senders, reducing false positives and ensuring that genuine messages reach their intended recipients without unnecessary delays.

For organizations and administrators aiming to tailor their spam filtering to specific needs or threats, Stalwart Mail Server offers the flexibility to customize the DNSBLs and DNSWLs used for checking from the `spam-filter` script.

## IP Address Checks

Ensuring the integrity and security of incoming emails often starts with verifying the reputation of the originating IP addresses. Stalwart Mail Server employs a rigorous checking mechanism, scrutinizing not only the IP addresses of remote hosts but also every IP address found in the 'Received' headers of an email. This comprehensive approach enhances the accuracy of spam detection and minimizes the chances of legitimate emails being misclassified.

The system checks these IP addresses against a curated list of popular DNSBLs:

- **Spamhaus ZEN**: A widely respected list that aggregates several Spamhaus IP blocklists into a single comprehensive dataset.
- **Mailspike**: Targets both spam sources and potential threats, providing a holistic assessment of IP reputation.
- **Senderscore**: Maintained by Return Path, it evaluates the reputation of an IP based on various metrics, including complaints, unknown users, and rejected messages.
- **Spam Eating Monkey**: Focuses on catching new and emerging threats by listing recent spam sources.
- **Virus Free**: Specializes in listing IPs known to distribute malware, viruses, and other malicious content.
- **NiX**: A broad-based list that targets various categories of email threats.
- **Spamcop**: Utilizes user reports and a variety of other inputs to dynamically generate its list of spam-sourcing IPs.
- **Barracuda**: A multifaceted list that covers both spam and other email-based threats.
- **Blocklist.de**: Aggregates data from various networks and services to list IPs that have been involved in attacks, unauthorized access attempts, and other malicious activities.

In addition to these DNSBLs, the system also verifies IP addresses of remote hosts against the trusted **DNSWL at DNSWL.org**. This allowlist is a repository of IP addresses known to be sources of legitimate emails. By cross-referencing against this list, the system can swiftly identify and prioritize emails from trusted senders, further refining the email filtering process.

## Domain Checks

While IP addresses serve as a significant identifier for email filtering, domain names are equally vital. They provide a clearer view of the email's origin, making them an integral component in the fight against spam and malicious emails. Stalwart Mail Server implements a comprehensive domain-checking mechanism to ensure the legitimacy and safety of incoming messages.

The system extracts domain names from various parts of the email, including:

- The **From** address used in the SMTP envelope.
- The **From** header, representing the email's purported sender.
- The **Reply-To** header, where replies to the email are directed.
- Email addresses and URLs embedded within the **message body**, providing additional context about the email's content and intent.

Once extracted, these domain names undergo rigorous checks against a series of prominent DNSBLs:

- **Spamhaus DBL**: A domain-based list that identifies domains linked to spam and other malicious activities.
- **SURBL**: A unique list that focuses on domains appearing in unsolicited messages, particularly those used in phishing attacks, malware distribution, or other nefarious purposes.
- **URIBL**: Dedicated to identifying domains appearing in spam emails, with an emphasis on those used in the message's content or body.
- **SpamEatingMonkey URIBL**: A specialized list focusing on recent threats, ensuring that even newly-emerged malicious domains are identified.
- **SpamEatingMonkey FRESH15**: Offers real-time insights by listing domains that have been registered in the last 15 minutes.

In addition to these checks against DNSBLs, any domains used to sign messages and pass DKIM validation (a method ensuring the email's integrity and sender authenticity) are cross-referenced with the trusted DNSWL at `dnswl.org`. This step helps in rapidly identifying and prioritizing genuine communications from recognized senders.

## Hash Checks

Beyond the conventional domain and IP checks, the system employs a more granular and unique approach to email filtering using hash checks. This method involves creating digital 'fingerprints' or hashes of specific components within the email and validating them against known blocklists. By leveraging hash checks, the system can identify threats even if the malicious sender slightly modifies their tactics or domain names, ensuring a thorough and dynamic defense against evolving email-based threats.

**Email Address Hashing and Validation**: For each incoming email, the system calculates the hashes of email addresses contained within. These hashed addresses are then validated against the **Email Blocklist (EBL) at MSBL.org**. The EBL is a comprehensive repository of hashed email addresses known to be associated with spam or other malicious activities. If a hash match is found, it indicates that the email address has previously been involved in suspicious activities, and the system can take appropriate action.

**URL Hashing and Validation**: URLs embedded within emails can often be conduits for phishing attempts, malware downloads, or other malicious endeavors. To mitigate such risks, the system hashes these URLs and cross-references them with **SURBL.org**. SURBL is a specialized service that maintains a blocklist of hashed URLs linked to spam and other online threats. A hash match here signifies the presence of a potentially harmful URL within the email.

Incorporating hash checks into the filtering process adds an extra layer of security. This method is particularly effective against adversaries who frequently change their domain names or email addresses to evade detection, ensuring that users are consistently protected from a wide range of threats.