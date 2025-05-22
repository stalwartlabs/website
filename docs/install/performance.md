---
sidebar_position: 7
---

# Performance tuning

Stalwart is engineered for efficiency and can handle substantial workloads even with default settings. For **small or personal deployments**, extensive performance tuning is rarely necessary—default configurations are more than sufficient to deliver reliable performance. However, for **larger-scale or high-traffic environments**, fine-tuning specific parameters can help unlock the full potential of your server and ensure optimal responsiveness under load.

Caching plays a crucial role in improving performance by reducing latency, lowering database load, and ensuring faster response times for frequent operations. In Stalwart, caching is deeply integrated into the server’s internal architecture and is used across various components to store frequently accessed data temporarily in memory.

Stalwart maintains [dedicated caches](/docs/server/cache) for different types of metadata, including **emails, calendars, contacts, and files**. Among these, the **email metadata cache** is the most performance-critical. It is accessed constantly by IMAP clients for operations such as listing folders, checking for new messages, flag updates, and message synchronization. Having a sufficiently large email cache can dramatically boost performance by minimizing the number of read operations sent to the underlying data store.

To optimize this further, Stalwart employs **incremental caching**, a strategy that ensures only changed portions of data are re-fetched from the store when updates occur. This avoids expensive full data reloads and allows clients to stay synchronized efficiently even in large mailboxes.

To get the most out of caching, it is recommended that your server has enough available memory to cache the metadata for **all concurrently connected users**. While exact memory requirements depend on mailbox size and user activity patterns, generous cache allocation for frequently accessed mailboxes yields the most noticeable performance gains in high-traffic environments.

In addition to storage-related caches, Stalwart also implements **authentication caches**, which temporarily store access tokens, role permissions, and user session data to reduce authentication overhead. Similarly, there are **DNS caches** that store the results of DNS queries, helping to avoid repeated lookups and improving mail delivery performance. While these non-storage caches do not impact performance as dramatically as the email cache, they still contribute to overall server responsiveness and efficiency.

In high-concurrency environments, tuning cache sizes appropriately is a key part of scaling Stalwart effectively. Always monitor memory usage and adjust cache limits based on observed load to strike the right balance between performance and resource availability.


