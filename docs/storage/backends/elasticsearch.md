---
sidebar_position: 8
---

# ElasticSearch

Elasticsearch is an open-source, distributed search and analytics engine. It is built on Apache Lucene and handles a wide variety of data types, including textual, numerical, geospatial, structured, and unstructured data. Elasticsearch provides high scalability and real-time search, making it a flexible choice for managing large-scale data in various applications.

## Configuration

The following configuration settings are available for Elasticsearch, which are specified under the `store.<name>` section of the configuration file:

- `type`: Specifies the type of store, set to `"elasticsearch"` for Elasticsearch.
- `url`: The URL of the Elasticsearch server or cluster.
- `tls.allow-invalid-certs`: Determines whether to allow connections with invalid TLS certificates. This is a boolean setting, and setting it to `true` can be useful in development or testing environments.

### Authentication Configuration

Basic authentication can be configured using the following settings:

- `auth.username`: The username used for authentication with the Elasticsearch server or cluster.
- `auth.secret`: The password for the specified user.

Bearer token authentication can be configured using the following setting:

- `auth.token`: The bearer token used for authentication.

### Index Configuration

The following configuration settings are available for the index where Stalwart stores its data, which are specified under the `store.<name>.index` section of the configuration file:

- `shards`: Specifies the number of primary shards that an index should have. Shards are the basic unit of scalability in Elasticsearch.
- `replicas`: Sets the number of replica shards (copies) that each primary shard should have. Replicas provide high availability and redundancy.

### Example

```toml
[store."elasticsearch"]
type = "elasticsearch"
url = "https://localhost:9200"

[store."elasticsearch".auth]
username = "elastic"
secret = "myelasticpassword"

[store."elasticsearch".tls]
allow-invalid-certs = true

[store."elasticsearch".index]
shards = 3
replicas = 0
```
