---
sidebar_position: 1
---

# Overview

Stalwart Mail Server offers support for two types of database backends: SQLite and FoundationDB. The choice between these two depends primarily on the scale and distribution of your mail server setup.

SQLite is typically suited for small to medium-sized installations operating on a single node. It is a self-contained, serverless, and zero-configuration database engine, making it simple to manage. Moreover, its data can be replicated using solutions such as LiteStream, enhancing its flexibility for diverse use cases.

On the other hand, FoundationDB is recommended for larger, distributed installations involving multiple servers or when catering to millions of users. This is due to its robust scalability, fault tolerance, and support for multi-version concurrency control.

It's essential to note that the support for each of these databases is compiled directly into the Stalwart Mail Server binary. Therefore, to switch from one database backend to another, you'll need to utilize a different binary, corresponding to the desired backend.

:::tip Note

Be aware that a change in database backend after initial setup implies a requirement for data migration. This means that all user data existing on the initial database backend would need to be transferred to the new backend. This could be a complex and time-consuming process, depending on the amount and type of data involved. Hence, it is advisable to carefully consider the most suitable database backend for your needs right at the start of your setup. 

:::

