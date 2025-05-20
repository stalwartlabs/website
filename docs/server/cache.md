---
sidebar_position: 10
---

# Caching

Caching is a technique used to store frequently accessed data in memory, enabling faster retrieval and reducing the load on underlying systems. In Stalwart, caching is utilized for various critical operations, including storing IMAP account data, security access tokens, and DNS query results. By caching this information, the server enhances performance, reduces latency, and minimizes resource usage.

Stalwart employs an efficient caching algorithm with an advanced eviction policy. The eviction mechanism is a modified version of the Clock-PRO algorithm, which closely resembles the later-published S3-FIFO algorithm. This algorithm is designed to be “scan-resistant,” meaning it avoids cache eviction caused by temporary spikes in access patterns. It provides high cache hit rates, outperforming traditional Least Recently Used (LRU) eviction policies and delivering results comparable to other state-of-the-art algorithms, such as W-TinyLFU. This advanced approach ensures that cached data remains highly relevant, contributing to the server's overall efficiency.

## Memory Usage

The memory usage of the cache is an important consideration, especially in systems with varying hardware configurations and user loads. For systems with ample memory and a high number of users, it is recommended to increase the default cache sizes. Larger cache sizes allow the server to store more data in memory, resulting in fewer evictions and higher hit rates, which improves performance in busy environments.

Conversely, systems with limited memory may need to reduce the default cache sizes to avoid excessive memory consumption. Smaller cache sizes help conserve system resources but may slightly reduce cache efficiency. Administrators should monitor the server’s memory usage and adjust cache sizes to strike a balance between performance and resource availability.

## Configuration

Stalwart provides a variety of cache options that can be configured to optimize performance and memory usage. Each cache is configured under the `cache.NAME.size parameter`, where `NAME` is the name of the cache as defined in the system. The size is specified in bytes and controls the maximum memory allocated for each cache.

### Access Token Cache

The Access Token Cache is used to store security access tokens required for authentication purposes. Caching access tokens reduces the need for frequent revalidation, ensuring faster and more efficient authentication processes. It is configured under the `cache.access-token.size` setting and has a default size of 10 MB.

```toml
[cache]
access-token.size = 10485760
```

### HTTP Authentication Cache

The HTTP Authentication Cache stores temporary data related to HTTP-based authentication. By caching this data, the system speeds up repeated authentication attempts, reducing the overhead for frequent HTTP requests. It is configured under the `cache.http-auth.size` setting and has a default size of 1 MB.

```toml
[cache]
http-auth.size = 1048576
```

### Permissions Cache

The Permissions Cache is used to store role and permission mappings for user accounts. This cache allows the system to quickly verify access rights without repeatedly querying the database. It is configured under the `cache.permission.size` setting and has a default size of 5 MB.

```toml
[cache]
permission.size = 5242880
```

### Account Cache

The Account Cache stores IMAP account data, including account identifiers, general settings, and mailbox information. By caching account data, the system ensures fast and efficient interactions with the IMAP server. It is configured under the `cache.account.size` setting and has a default size of 10 MB.

```toml
[cache]
account.size = 10485760
```

### Mailbox Cache

The Mailbox Cache stores mailbox metadata, such as mailbox states, next states, and message identifiers. This cache improves the performance of mailbox-related operations, such as folder list retrieval and synchronization. It is configured under the `cache.mailbox.size` setting and has a default size of 10 MB.

```toml
[cache]
mailbox.size = 10485760
```

### Thread Cache

The Thread Cache stores email threading information, including references to related messages. This cache enhances the speed of operations involving threading, such as displaying conversation views. It is configured under the `cache.thread.size` setting and has a default size of 10 MB.

```toml
[cache]
thread.size = 10485760
```

### Bayesian Filter Cache

The Bayesian Filter Cache stores token data and associated weights for the spam filter’s Bayesian classifier. Caching this data allows the spam filter to make quick and accurate decisions without frequently accessing the database. It is configured under the `cache.bayes.size` setting and has a default size of 10 MB.

```toml
[cache]
bayes.size = 10485760
```

### TXT DNS Cache

The TXT DNS Cache stores the results of DNS TXT record lookups, which are commonly used for SPF, DKIM, and DMARC verifications. By caching these results, the server reduces the latency of DNS queries. It is configured under the `cache.dns.txt.size` setting and has a default size of 5 MB.

```toml
[cache]
dns.txt.size = 5242880
```

### MX DNS Cache

The MX DNS Cache stores the results of DNS MX record lookups, which are essential for email routing and delivery. Caching these results improves the speed of email processing. It is configured under the `cache.dns.mx.size` setting and has a default size of 5 MB.

```toml
[cache]
dns.mx.size = 5242880
```

### PTR DNS Cache

The PTR DNS Cache stores the results of reverse DNS (PTR) record lookups, which resolve IP addresses to hostnames. This cache enhances the efficiency of reverse DNS queries. It is configured under the `cache.dns.ptr.size` setting and has a default size of 1 MB.

```toml
[cache]
dns.ptr.size = 1048576
```

### IPv4 DNS Cache

The IPv4 DNS Cache stores the results of IPv4 address queries. Caching these results reduces the frequency of DNS lookups, improving overall performance. It is configured under the `cache.dns.ipv4.size` setting and has a default size of 5 MB.

```toml
[cache]
dns.ipv4.size = 5242880
```

### IPv6 DNS Cache

The IPv6 DNS Cache stores the results of IPv6 address queries. Like the IPv4 DNS Cache, it reduces the need for repeated DNS lookups and improves efficiency. It is configured under the `cache.dns.ipv6.size` setting and has a default size of 5 MB.

```toml
[cache]
dns.ipv6.size = 5242880
```

### TLSA DNS Cache

The TLSA DNS Cache stores the results of TLSA record lookups, which are used for DANE authentication. By caching these records, the server ensures faster processing of secure email communication. It is configured under the `cache.dns.tlsa.size` setting and has a default size of 1 MB.

```toml
[cache]
dns.tlsa.size = 1048576
```

### MTA-STS Cache

The MTA-STS Cache stores Mail Transfer Agent Strict Transport Security (MTA-STS) policies, which are used to enforce secure email delivery. This cache reduces the need for frequent policy retrievals. It is configured under the `cache.dns.mta-sts.size` setting and has a default size of 1 MB.

```toml
[cache]
dns.mta-sts.size = 1048576
```

### RBL DNS Cache

The RBL DNS Cache stores the results of Real-Time Blocklist (RBL) queries, which are used to identify and block potentially malicious IP addresses. This cache minimizes the latency of RBL lookups. It is configured under the `cache.dns.rbl.size` setting and has a default size of 5 MB.

```toml
[cache]
dns.rbl.size = 5242880
```
