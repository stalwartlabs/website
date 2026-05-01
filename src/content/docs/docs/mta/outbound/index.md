---
sidebar_position: 1
title: "Overview"
---

Stalwart MTA provides a flexible framework for managing outbound email delivery. Messages sent to both local and external domains are processed through a [strategy-driven](/docs/mta/outbound/strategy) architecture that allows precise control over how, when, and where each message is delivered. Delivery strategies are evaluated dynamically for each recipient, adapting behaviour to the message context, such as the recipient domain, the sender's identity, message type, or assigned priority.

Through its delivery strategies, Stalwart controls every aspect of outbound delivery, including queue selection, retry policies, routing logic, connection parameters, and transport-security enforcement. These strategies work together to ensure messages are handled according to defined policies while allowing per-recipient delivery decisions, independent retry logic, and conditional routing.

Outbound delivery supports isolated virtual queues for different traffic types, secure transmission with DANE and MTA-STS, configurable STARTTLS behaviour, and the ability to relay mail through designated hosts when necessary. The system is designed to scale, manage delivery concurrency, and enforce compliance with authentication and security standards.

The following sections describe how to configure outbound delivery, beginning with the definition of strategies and virtual queues.
