---
sidebar_position: 7
title: "DMARC analysis"
---

Ensuring the authenticity and integrity of incoming messages is important given the prevalence of phishing and spoofing attacks. Stalwart validates incoming messages using four email authentication standards: DMARC (Domain-based Message Authentication, Reporting, and Conformance), SPF (Sender Policy Framework), DKIM (DomainKeys Identified Mail), and ARC (Authenticated Received Chain).

For every incoming message the server performs the following analyses:

- **DMARC analysis**: checks the alignment between the domain specified in the `From` header and the domains reported by SPF and DKIM, ensuring that the message actually originates from the domain it claims to represent.
- **SPF analysis**: validates that the message was sent from a server authorized by the domain owner, by comparing the sending server's IP address against the list of addresses published in the domain's SPF record.
- **DKIM analysis**: confirms the message's integrity by verifying a digital signature added by the sending server, ensuring that the content has not been tampered with in transit.
- **ARC analysis**: in scenarios where a message passes through intermediaries (such as mailing lists) that may modify it, ARC provides a validated chain of custody so that intermediary modifications can be distinguished from tampering.

Based on the outcome of these analyses, Stalwart assigns tags to the message, each with an associated score. For example, a DKIM verification failure produces the `DKIM_REJECT` tag, indicating a potential issue with authenticity or integrity. A message that passes DMARC authentication receives the `DMARC_POLICY_ALLOW` tag, signalling that the message has met the relevant validation standards and is likely legitimate.

For more information about DMARC, SPF, DKIM and ARC, refer to the [Sender Authentication](/docs/mta/authentication/) section.
