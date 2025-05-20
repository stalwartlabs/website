---
sidebar_position: 1
---

# Overview

This section focuses on the configuration and behavior of outgoing message delivery within Stalwart. While [inbound](/docs/mta/inbound/overview) pertain to handling SMTP connections received on ports 25 or 465, outbound refers to the outgoing connections initiated to deliver messages to their destinations. These destinations can include remote SMTP servers for messages addressed to external domains or the local message store for delivery to local users.

Outbound connections are initiated automatically by the server's [queue management system](/docs/mta/queue/overview), which processes messages awaiting delivery. Although commonly referred to as "outbound connections," it is important to note that these connections are not limited to external delivery. The same mechanism is employed for delivering messages locally, ensuring seamless communication between users on the same server.

Understanding and configuring these settings effectively ensures efficient delivery, whether the messages are destined for remote servers or remain within the local domain.
