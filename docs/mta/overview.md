---
sidebar_position: 1
---

# Overview

A Message Transfer Agent (MTA) is a core component of email infrastructure responsible for transferring email messages from one server to another using the Simple Mail Transfer Protocol (SMTP). MTAs handle message routing, queuing, delivery attempts, and message handoff between different servers.

SMTP is the protocol used for the transmission of electronic mail across IP networks. It operates by establishing a connection between servers to transfer messages, handling aspects such as message envelopes, routing paths, and error handling. Modern MTAs also incorporate security, authentication, and policy enforcement mechanisms.

Stalwart's MTA is a standards-compliant SMTP server designed to serve both inbound and outbound email flows. It includes native support for email authentication standards such as DMARC, DKIM, SPF, and ARC. To secure message transport, Stalwart implements DANE, MTA-STS, and SMTP TLS reporting, allowing verifiable transmission over TLS.

Beyond authentication and transport security, Stalwart provides mechanisms for managing incoming traffic: inbound connection throttling, configurable filtering rules, support for Sieve scripting, MTA-level hooks, and milter integration.

For outbound delivery, Stalwart uses a distributed virtual queue architecture with support for delayed and priority delivery, delivery quotas, routing rules, and sender- or domain-specific throttling. Envelope rewriting and message modification are also supported, so operators can adapt message content and routing to deployment-specific requirements.

This documentation provides a detailed guide to configuring and operating the Stalwart MTA.

## Configuration

The SMTP service is enabled by creating one or more listeners on the [NetworkListener](/docs/ref/object/network-listener) object (found in the WebUI under <!-- breadcrumb:NetworkListener --><!-- /breadcrumb:NetworkListener -->). A listener is an entry point for SMTP or LMTP connections on a specific address and port. Multiple listeners may be created, each serving a different role or catering to different types of connections. There is no built-in limit on the number of listeners.

Conventional SMTP configurations associate certain ports with specific types of connections: port 25 for cleartext SMTP between servers, port 587 for SMTP submission, and port 465 for SMTP submission with implicit TLS. Stalwart does not enforce these associations; each listener's role is defined by its configuration. See the main [listeners](/docs/server/listener) section for the complete listener configuration.

A listener is created by setting its [`bind`](/docs/ref/object/network-listener#bind) addresses and selecting the appropriate [`protocol`](/docs/ref/object/network-listener#protocol) variant. The relevant protocol variants for MTA use are `smtp` and `lmtp`. Implicit TLS is enabled by setting the [`tlsImplicit`](/docs/ref/object/network-listener#tlsimplicit) field to `true` on the listener. The SMTP banner shown to connecting clients is not configured on the listener itself; it is defined on the [MtaStageConnect](/docs/ref/object/mta-stage-connect) singleton via the [`smtpGreeting`](/docs/ref/object/mta-stage-connect#smtpgreeting) expression, which can branch on the listener identifier to serve different banners per listener.

### SMTP port

Cleartext SMTP connections between servers are typically received on port 25. A listener configured with [`bind`](/docs/ref/object/network-listener#bind) set to `[::]:25` and the SMTP [`protocol`](/docs/ref/object/network-listener#protocol) variant enables this role.

### Submissions port (TLS)

SMTP submissions with implicit TLS are typically received on port 465. A listener configured with [`bind`](/docs/ref/object/network-listener#bind) set to `[::]:465`, the SMTP protocol variant, and [`tlsImplicit`](/docs/ref/object/network-listener#tlsimplicit) set to `true` serves this role.

### Submissions port

SMTP submissions without implicit TLS, upgradable via `STARTTLS`, are typically received on port 587. A listener configured with [`bind`](/docs/ref/object/network-listener#bind) set to `[::]:587` and the SMTP [`protocol`](/docs/ref/object/network-listener#protocol) variant enables this role.

### LMTP port

LMTP is a protocol used to deliver email to a mail server. It is similar to SMTP but designed for local handoff rather than transport between organisations. LMTP is typically received on port 24. A listener configured with [`bind`](/docs/ref/object/network-listener#bind) set to `[::]:24` and the LMTP [`protocol`](/docs/ref/object/network-listener#protocol) variant enables this role. LMTP is only required when Stalwart is not acting as the final mail store.
