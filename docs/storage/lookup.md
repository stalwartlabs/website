---
sidebar_position: 5
---

# Lookup store

Although the term "lookup store" might initially sound ambiguous, it essentially refers to a key-value store. Lookup stores play an important role in the server's functionality, particularly in areas that require rapid and efficient data retrieval. They are primarily utilized by the SMTP server for various functions such as:

- **Dynamic Rules**: The SMTP server leverages lookup stores to dynamically apply rules to incoming emails and perform routing decisions.
- **Sieve Scripts**: Sieve scripts, used for filtering and organizing incoming emails, have the possibility to store and retrieve data from lookup stores. 
- **Spam Filter Databases**: One of the critical uses of lookup stores is in managing spam filter databases. This includes sender reputation information, bayesian classifier models, greylist data, message reply tracking and other similar data.

The following backends can be utilized as a lookup store:

- [Redis](/docs/storage/backends/redis): A popular in-memory database.
- [Data store](/docs/storage/data): Use any of the supported data store backends as a lookup store, which is useful when you want to minimize the number of external dependencies.

### Configuration

Lookup store do not require any additional configuration, they are referenced from [rules](/docs/configuration/overview/rules/syntax) and [Sieve scripts]().



