---
sidebar_position: 1
---

# Overview

Lookup lists function similarly to [in-memory stores](/docs/storage/in-memory) like Redis but with a key distinction: lookup lists are static and do not support write operations. Lookup lists are ideal for use cases where values remain unchanged during server operation.

The primary way to interact with lookup lists is through [expressions](/docs/configuration/expressions/overview) using specialized functions such as `key_get`, `counter_get`, and others. These functions allow administrators to query values from the lists and dynamically evaluate configuration settings based on predefined key-value pairs. Lookup lists introduce flexibility into the configuration process, making it easy to adapt the server's behavior to specific operational needs.

Stalwart supports both local and remote lookup lists:

- [Local lookup lists](/docs/storage/lookup/local) are defined directly within the server's configuration file, making them suitable for scenarios where all necessary key-value pairs are known in advance. These lists are static and remain entirely under the server's control, ensuring straightforward and predictable management.
- [Remote lookup lists](/docs/storage/lookup/remote), by contrast, are retrieved over HTTP, allowing the server to access key-value pairs stored externally. This is useful in dynamic environments where configurations are managed centrally or updated independently of the server's local settings. Remote lookups let the server integrate with external configuration systems.

