---
sidebar_position: 1
---

# Overview

In the realm of email communication, ensuring that messages are transmitted securely over the internet is paramount to protect against interception and tampering. Two critical technologies that enhance the security of email transport are DNS-based Authentication of Named Entities (DANE) and Mail Transfer Agent Strict Transport Security (MTA-STS).

[DANE](/docs/mta/transport-security/dane.md) is a security protocol designed to allow the specification of cryptographic certificates in the DNS system, providing a way to authenticate the TLS certificates presented by SMTP servers. It uses DNSSEC to secure the data and ensure that the information has not been tampered with. DANE helps to prevent man-in-the-middle attacks by strictly defining which certificates are legitimate for given domains, rather than relying solely on third-party certificate authorities.

[MTA-STS](/docs/mta/transport-security/mta-sts.md), on the other hand, is a standard that enables mail service providers to declare their ability to receive Transport Layer Security (TLS) secured connections and to specify whether sending SMTP servers should refuse to deliver to MX hosts that do not offer TLS with a trusted certificate. It helps to mitigate the risk of downgrade attacks and active surveillance threats by enforcing the use of secure connections between email servers.

Together, DANE and MTA-STS fortify the transport layer, providing robust defenses against common threats to email security, ensuring that emails are not only sent from verified sources but also securely transmitted across networks.
