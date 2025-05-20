---
sidebar_position: 1
---

# Overview

Queues are essentially a holding area for outbound messages in an SMTP server. When a message arrives, it is placed in the queue until it can be delivered to its final destination. Stalwart supports an unlimited number of virtual queues, which means that a system administrator can create and configure multiple queues with different settings and behaviors. This allows for a high degree of flexibility and customization in managing incoming messages. For example, different queues can be created for different types of messages, such as messages from high-priority senders or messages with specific content, and these queues can be processed differently, such as by assigning more resources or prioritizing delivery.

Queues in Stalwart are distributed and fault-tolerant, meaning that they can be distributed across multiple servers and are designed to continue operating even if one or more servers fail.

