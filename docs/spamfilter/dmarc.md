---
sidebar_position: 5
---

# DMARC Analysis

Ensuring the authenticity and integrity of incoming emails is paramount in modern email systems, given the prevalence of phishing and spoofing attacks. Stalwart Mail Server incorporates a comprehensive mechanism to validate the authenticity of emails using four e-mail authentication standards: DMARC (Domain-based Message Authentication, Reporting, and Conformance), SPF (Sender Policy Framework), DKIM (DomainKeys Identified Mail), and ARC (Authenticated Received Chain).

For every incoming message, the server performs the following analyses:

- **DMARC Analysis**: This checks the alignment between the domain specified in the 'From' header of the email and the domain reported by SPF and DKIM checks. It ensures that the email truly originates from the domain it claims to represent.
- **SPF Analysis**: Validates that the email was sent from a server authorized by the domain owner by comparing the sending server's IP address against the list of allowed IPs specified in the domain's SPF record.
- **DKIM Analysis**: Confirms the email's integrity by verifying a digital signature added by the sending server. This ensures that the email's content has not been tampered with during transit.
- **ARC Analysis**: In scenarios where emails pass through intermediaries (like mailing lists) that might modify the message, ARC provides a validated chain of custody, ensuring that intermediary modifications are legitimate.

Based on the outcome of these analyses, Stalwart Mail Server assigns appropriate tags to the email, each with its associated score. For instance, if the DKIM validation fails, the email is tagged with **DKIM_REJECT**. This indicates a potential issue with the email's authenticity or integrity. Conversely, if a message successfully passes DMARC authentication, it receives the **DMARC_POLICY_ALLOW** tag, signaling that the email has met rigorous validation standards and is likely legitimate.

For more information about DMARC, SPF, DKIM or ARC, please refer to the [E-mail Authentication](/docs/category/email-authentication) section.

## Allow lists 

To further refine the email authentication process and ensure that legitimate messages from known senders are not inadvertently flagged as suspicious, Stalwart Mail Server employs allow lists specifically tailored for DMARC, SPF, and DKIM checks. These lists serve as trusted repositories of domains that are known to have implemented and consistently pass the specified authentication checks.

- **DMARC Allow List**: Defined in the `spam-dmarc` lookup store, this store contains one domain per entry. Each domain listed here is expected to consistently pass DMARC authentication checks.
- **SPF and DKIM Allow List**: Defined in the `spam-spkf` lookup store and, similar to the DMARC allow list, comprises one domain per entry. Domains present here are recognized for their consistent adherence to SPF and DKIM authentication standards.

When an incoming email undergoes SPF or DKIM validation:

- If the domain passes the authentication and is present in the **SPF/DKIM allow list**, it is awarded a **negative (ham) score**. This indicates that the email originates from a trusted domain with consistent authentication practices.
- However, if the domain fails SPF or DKIM validation but is found in the allow list, it receives a **positive (spam) score**. This scenario signifies an anomaly: a trusted domain that was expected to pass authentication checks has failed to do so, thereby raising suspicion.

The same logic applies to DMARC checks, wherein domains present in the **DMARC allow list** are expected to pass DMARC authentication consistently. Any deviation from this expectation results in score adjustments to flag potential anomalies.

