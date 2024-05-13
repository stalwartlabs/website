---
sidebar_position: 1
---

# Overview

High-availability clustering is a method used in server environments to ensure continuous operability and minimize downtime by linking multiple servers in such a way that in the event of a failure of one server, others within the cluster can take over its tasks seamlessly. This approach significantly enhances the reliability and availability of services, crucial for critical systems like email servers.

## Load balancing & High Availability

Stalwart Mail Server supports high-availability clustering without the need for coordinators or external software. It can operate effectively within a cluster comprising two or more servers, providing robust scalability and redundancy. This capability ensures that even in the event of hardware or software failures, the mail service remains uninterrupted and reliable.

When deployed in a cluster, Stalwart Mail Server allows mail clients to connect to any of the nodes in the cluster using either IMAP, SMTP or JMAP protocols. This flexibility is beneficial for users as it requires no additional configuration on their part to take advantage of the clustering features. The mail clients can simply connect to any available node, enhancing the overall user experience by offering continuous connectivity.

## Distributed SMTP Queues

A key feature of Stalwart Mail Server's clustering capability is its support for distributed SMTP queues. This allows multiple instances of Stalwart to share the same message queue, which helps in distributing the load more evenly across the cluster. If one of the SMTP nodes in the cluster experiences a crash, the distributed nature of the SMTP queues allows other nodes to resume message delivery without any loss of data or significant delay. This distributed queue system not only improves the reliability and efficiency of mail delivery but also enhances the server's ability to manage larger volumes of email traffic.

By leveraging these advanced clustering features, Stalwart Mail Server provides a resilient, scalable, and highly available email infrastructure that is straightforward to manage and ensures that email services are always operational, even under adverse conditions.