---
sidebar_position: 8
---

# ElasticSearch

Elasticsearch is a powerful, open-source, distributed search and analytics engine. It is built on Apache Lucene and is designed to handle a wide variety of data types, including textual, numerical, geospatial, structured, and unstructured data. Elasticsearch is known for its high scalability, real-time search capabilities, and ease of use. This makes it a flexible and robust solution for managing complex and large-scale data in various applications.

## Configuration

The following configuration settings are available for Elasticsearch, which are specified under the `store.<name>` section of the configuration file:

- `type`: Specifies the type of store, set to `"elasticsearch"` for Elasticsearch.
- `url`: The URL of the Elasticsearch cluster.
- `user`: The username used for authentication with the Elasticsearch cluster.
- `password`: The password for the specified user.
- `cloud-id`: An optional setting used when connecting to Elasticsearch Service on Elastic Cloud. It is a unique identifier for your Elasticsearch Service deployment.
- `tls.allow-invalid-certs`: Determines whether to allow connections with invalid TLS certificates. This is a boolean setting, and setting it to `true` can be useful in development or testing environments.

### Index Configuration

The following configuration settings are available for the index where Stalwart Mail Server stores its data, which are specified under the `store.<name>.index` section of the configuration file:

- `shards`: Specifies the number of primary shards that an index should have. Shards are the basic unit of scalability in Elasticsearch.
- `replicas`: Sets the number of replica shards (copies) that each primary shard should have. Replicas provide high availability and redundancy.

### Example

```toml
[store."elasticsearch"]
type = "elasticsearch"
url = "https://localhost:9200"
user = "elastic"
password = "myelasticpassword"
#cloud-id = "my-cloud-id"
disable = true

[store."elasticsearch".tls]
allow-invalid-certs = true

[store."elasticsearch".index]
shards = 3
replicas = 0
```
