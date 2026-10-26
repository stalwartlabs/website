---
sidebar_position: 1
title: "Overview"
description: "Why opportunistic TLS between mail servers can be defeated, and how DANE, MTA-STS and TLS reporting let domains require authenticated encryption; a comparison and the settings for each."
---

Mail servers encrypt the connections between them with `STARTTLS`, but they normally do so opportunistically. A sending server uses TLS when the receiving server offers it, and it accepts any certificate the receiving server presents. When TLS is not offered at all, the sender falls back to an unencrypted connection.

This arrangement protects against passive eavesdropping, but not against an active attacker. An attacker on the network path can remove the `STARTTLS` offer from the receiving server's reply, or present a false certificate, and then read or alter the mail. The sender has no way to notice, because it never expected TLS or a particular certificate in the first place.

Transport security mechanisms close this gap by telling senders in advance what to expect. Two mechanisms let a domain publish that its mail servers support TLS, and how senders must authenticate those servers. A sender that knows the policy then refuses to deliver when the protection is missing. The two mechanisms differ in where the policy is published and in what it relies on:

| | DANE | MTA-STS |
|---|---|---|
| Specification | [RFC 7672](https://www.rfc-editor.org/rfc/rfc7672) | [RFC 8461](https://www.rfc-editor.org/rfc/rfc8461) |
| Published as | TLSA records for each MX host | A policy file served over HTTPS, announced by a TXT record |
| Trust anchor | DNSSEC, so the certificate may be self-signed | Public certificate authorities |
| Requires DNSSEC | Yes, for the MX records, the zone of the MX hosts and the sender's resolver | No |
| Protects the first connection | Yes | No: the policy is learnt on the first fetch and cached |
| When the check fails | The host is not delivered to | The host is not delivered to, when the policy is in `enforce` mode |

A domain can publish both. In that case, RFC 8461 requires that a passing MTA-STS check never overrides a failing DANE check.

A third standard, SMTP TLS Reporting ([RFC 8460](https://www.rfc-editor.org/rfc/rfc8460)), complements the other two. It lets a domain receive daily reports from senders about the TLS connections they made, or failed to make, to the domain's servers. With these reports, a broken certificate or policy is noticed.

Stalwart takes part in these mechanisms in both roles: as a sender that applies the policies of recipient domains, and as the host of domains that publish their own. The following pages cover each task:

| Task | Page |
|---|---|
| Apply the DANE and MTA-STS policies of recipient domains when delivering | [TLS strategies](/docs/mta/outbound/tls), [DANE](/docs/mta/transport-security/dane), [MTA-STS](/docs/mta/transport-security/mta-sts) |
| Publish TLSA records for the domains hosted on the server | [DANE](/docs/mta/transport-security/dane#publishing-tlsa-records) |
| Publish an MTA-STS policy for the domains hosted on the server | [Publishing an MTA-STS policy](/docs/domains/mta-sts) |
| Send and receive TLS reports | [TLS reports](/docs/mta/reports/tls) |
