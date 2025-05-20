---
sidebar_position: 7
---

# DMARC Analysis

Ensuring the authenticity and integrity of incoming emails is paramount in modern email systems, given the prevalence of phishing and spoofing attacks. Stalwart incorporates a comprehensive mechanism to validate the authenticity of emails using four e-mail authentication standards: DMARC (Domain-based Message Authentication, Reporting, and Conformance), SPF (Sender Policy Framework), DKIM (DomainKeys Identified Mail), and ARC (Authenticated Received Chain).

For every incoming message, the server performs the following analyses:

- **DMARC Analysis**: This checks the alignment between the domain specified in the 'From' header of the email and the domain reported by SPF and DKIM checks. It ensures that the email truly originates from the domain it claims to represent.
- **SPF Analysis**: Validates that the email was sent from a server authorized by the domain owner by comparing the sending server's IP address against the list of allowed IPs specified in the domain's SPF record.
- **DKIM Analysis**: Confirms the email's integrity by verifying a digital signature added by the sending server. This ensures that the email's content has not been tampered with during transit.
- **ARC Analysis**: In scenarios where emails pass through intermediaries (like mailing lists) that might modify the message, ARC provides a validated chain of custody, ensuring that intermediary modifications are legitimate.

Based on the outcome of these analyses, Stalwart assigns appropriate tags to the email, each with its associated score. For instance, if the DKIM validation fails, the email is tagged with **DKIM_REJECT**. This indicates a potential issue with the email's authenticity or integrity. Conversely, if a message successfully passes DMARC authentication, it receives the **DMARC_POLICY_ALLOW** tag, signaling that the email has met rigorous validation standards and is likely legitimate.

For more information about DMARC, SPF, DKIM or ARC, please refer to the [Sender Authentication](/docs/category/sender-authentication) section.

