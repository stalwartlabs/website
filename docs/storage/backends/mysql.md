---
sidebar_position: 4
---

# MySQL / MariaDB

MySQL is a widely used open-source relational database management system, known for its reliability, simplicity, and broad platform compatibility. It handles large volumes of data efficiently and is a popular choice for web applications and online transaction processing. MariaDB is a drop-in compatible fork of MySQL and is supported through the same variant.

## Configuration

The MySQL backend is selected by choosing the `MySql` variant on the [DataStore](/docs/ref/object/data-store) object (found in the WebUI under <!-- breadcrumb:DataStore --><!-- /breadcrumb:DataStore -->). The variant exposes the following fields:

- [`host`](/docs/ref/object/data-store#host): hostname or IP address of the MySQL server (required).
- [`port`](/docs/ref/object/data-store#port): TCP port. Default: `3306`.
- [`database`](/docs/ref/object/data-store#database): name of the database. Default: `"stalwart"`.
- [`authUsername`](/docs/ref/object/data-store#authusername): username used to authenticate. Default: `"stalwart"`.
- [`authSecret`](/docs/ref/object/data-store#authsecret): password or other secret reference used to authenticate (required).
- [`timeout`](/docs/ref/object/data-store#timeout): maximum time to wait when establishing a connection. Default: `"15s"`.
- [`maxAllowedPacket`](/docs/ref/object/data-store#maxallowedpacket): maximum size of a single network packet sent to or received from the server, in bytes.

### Connection pool

Pool sizing is controlled through [`poolMaxConnections`](/docs/ref/object/data-store#poolmaxconnections) (default `10`) and [`poolMinConnections`](/docs/ref/object/data-store#poolminconnections) (default `5`). The minimum ensures a baseline of ready connections at all times.

### TLS

TLS is enabled through [`useTls`](/docs/ref/object/data-store#usetls). When enabled, [`allowInvalidCerts`](/docs/ref/object/data-store#allowinvalidcerts) determines whether connections with invalid certificates are accepted, which is typically only useful in development or testing.

### Read replicas

For Enterprise deployments, [`readReplicas`](/docs/ref/object/data-store#readreplicas) accepts a list of replica connection settings. See the [SQL read replicas](/docs/storage/backends/composite/sql-replica) page for details.

<!-- review: The previous configuration defined directory queries (`name`, `members`, `recipients`, `emails`) under `store.<name>.query` when MySQL was used as an authentication directory. Locate the equivalent configuration surface in the new model (likely on the Directory object with a SQL variant) and link to it here. -->

## FTS Limitations

MySQL's built-in full-text search is a lightweight feature designed primarily for simple keyword matching. While sufficient for basic search use cases, it has several inherent limitations that are important to understand when using it as a full-text search backend for email.

One significant limitation is that MySQL full-text search does not support **multiple languages within the same indexed column**. A full-text index is tied to a single parser and language configuration, which means messages containing mixed languages cannot be tokenised or ranked correctly. In mail environments where users regularly exchange messages in different languages, this can lead to inconsistent or incomplete search results.

MySQL full-text search also does **not support stemming**. Words are indexed and matched in their exact forms, so different grammatical variants of the same word (singular versus plural, different verb tenses) are treated as unrelated terms. As a result, searches are less tolerant of natural-language variation and may miss relevant messages unless the exact word forms present in the message are used.

Another important constraint is that **words shorter than three characters are not indexed** by default. Common short words, abbreviations, and identifiers (many of which appear in email content) are therefore not searchable at all. This is particularly noticeable when searching for short names, acronyms, or codes.

Taken together, these limitations can significantly affect search quality and recall. If accurate, language-aware search behaviour is a priority for the deployment, a different [full-text search backend](/docs/storage/fts) that provides better linguistic support and indexing is strongly recommended.
