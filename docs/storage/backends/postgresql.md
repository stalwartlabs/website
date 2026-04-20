---
sidebar_position: 3
---

# PostgreSQL

PostgreSQL (often called Postgres) is an open-source object-relational database system known for its architecture, reliability, data integrity, and feature set. It handles workloads ranging from single machines to heavily loaded web services with many concurrent users.

## Configuration

The PostgreSQL backend is selected by choosing the `PostgreSql` variant on the [DataStore](/docs/ref/object/data-store) object (found in the WebUI under <!-- breadcrumb:DataStore --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Data Store<!-- /breadcrumb:DataStore -->). The variant exposes the following fields:

- [`host`](/docs/ref/object/data-store#host): hostname or IP address of the PostgreSQL server (required).
- [`port`](/docs/ref/object/data-store#port): TCP port. Default: `5432`.
- [`database`](/docs/ref/object/data-store#database): name of the database. Default: `"stalwart"`.
- [`authUsername`](/docs/ref/object/data-store#authusername): username used to authenticate. Default: `"stalwart"`.
- [`authSecret`](/docs/ref/object/data-store#authsecret): password or other secret reference used to authenticate (required). The secret may be supplied inline, read from an environment variable, or loaded from a file.
- [`timeout`](/docs/ref/object/data-store#timeout): maximum time to wait when establishing a connection. Default: `"15s"`.
- [`options`](/docs/ref/object/data-store#options): additional connection options passed to the driver.

### Connection pool

Pool sizing is controlled through [`poolMaxConnections`](/docs/ref/object/data-store#poolmaxconnections) (default `10`) and [`poolRecyclingMethod`](/docs/ref/object/data-store#poolrecyclingmethod) (default `"fast"`).

### TLS

TLS is enabled through [`useTls`](/docs/ref/object/data-store#usetls). When enabled, [`allowInvalidCerts`](/docs/ref/object/data-store#allowinvalidcerts) determines whether connections with invalid certificates are accepted. The default is `false` (strict validation).

### Read replicas

In Enterprise deployments, write operations target the primary connection and read operations are distributed across one or more replicas. Replicas are configured through the [`readReplicas`](/docs/ref/object/data-store#readreplicas) field on the same DataStore object, which accepts a list of replica connection settings. Each entry defines a full set of connection parameters ([`host`](/docs/ref/object/data-store#host), [`port`](/docs/ref/object/data-store#port), [`database`](/docs/ref/object/data-store#database), [`authUsername`](/docs/ref/object/data-store#authusername), and [`authSecret`](/docs/ref/object/data-store#authsecret)). The same pattern is available on the [BlobStore](/docs/ref/object/blob-store) and [SearchStore](/docs/ref/object/search-store) objects when their `PostgreSql` variant is selected.

:::tip Enterprise feature

Read replicas are available exclusively in the [Enterprise Edition](/docs/server/enterprise) of Stalwart and are not included in the Community Edition.

:::

## Authentication directory

When PostgreSQL is used as an authentication directory, the queries that resolve account names, group members, recipients, and email addresses are configured on the [Directory](/docs/ref/object/directory) object with the SQL variant, which references this store. See the [SQL directory](/docs/auth/backend/sql) page for details.

## FTS Limitations

PostgreSQL provides a built-in full-text search engine based on `tsvector` and `tsquery`. While reliable and well integrated, it has important [limitations](https://www.postgresql.org/docs/current/textsearch-limitations.html) that are particularly relevant when indexing email content.

The most significant constraint is that the total size of a `tsvector`, including both lexemes and positional information, must not exceed **1 megabyte**. Because positional data is stored alongside indexed terms, the amount of actual text that can be indexed is substantially less than 1 MB, especially for natural-language content with many tokens and repeated words.

For email workloads, this limitation directly affects message bodies and attachments, which can easily exceed the effective size limit when indexed as full text. To keep indexing reliable and avoid exceeding PostgreSQL's hard limits, Stalwart truncates content before converting it into a `tsvector`. Message bodies are truncated to **650 KB**, and attachments are truncated to **650 KB total**, combined across all attachments in a message. In practice, only the first 650 KB of the message body is indexed, and only the first 650 KB of all attachments combined are indexed. Any content beyond these limits is not searchable.

This truncation is a deliberate and conservative choice that leaves sufficient room for lexeme positions and avoids indexing failures caused by exceeding PostgreSQL's maximum `tsvector` size. For most typical email messages, this behaviour is not noticeable and does not materially affect search quality.

However, in environments where messages frequently contain very large bodies or where full search coverage of large attachments is required, this limitation may be problematic. In such cases, administrators should consider a different [full-text search backend](/docs/storage/fts) that does not impose strict per-document size limits.

These constraints are inherent to PostgreSQL's full-text search implementation and should be taken into account when deciding whether PostgreSQL is an appropriate full-text search backend for email workloads.
