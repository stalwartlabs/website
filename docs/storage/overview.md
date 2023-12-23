---
sidebar_position: 1
---

# Overview

This section covers the configuration and management of the storage system. Stalwart offers maximum flexibility by supporting four distinct types of storage, each catering to different aspects of server operation. These are the data store, blob store, full-text search store, and lookup store. Each store can be configured to use a different backend, allowing you to choose the most suitable option for your needs. 

## Data store

The Data store is the core storage unit where email metadata, folders, and various settings are stored. Essentially, it contains all the data except for large binary objects (blobs). The following backends can be utilized as a data store:

- **RocksDB**: A high performance embedded database for key-value data.
- **FoundationDB**: A distributed database designed to handle large volumes of data across clusters of machines.
- **PostgreSQL**: A powerful, open-source object-relational database system.
- **MySQL**: An open-source relational database management system.
- **SQLite**: A C library that provides a lightweight disk-based database.

## Blob store

For storing emails, sieve scripts, and other large binary objects, we use what we refer to as the [blob store](/docs/storage/blob/overview). Stalwart can utilize the following backends for blob storage:

- **S3-compatible storage**: Ideal for distributed storage systems, which could be Amazon S3, Google Cloud Storage (GCS), MinIO, or any other S3-compatible service.
- **File System**: Direct storage in the server’s file system, available only for single node installations.
- Additionally, **RocksDB, FoundationDB, PostgreSQL, MySQL, or SQLite** can also be used for blob storage.

## Full-text search store

This store is dedicated to indexing for full-text search, enhancing the speed and efficiency of text-based queries. The following backends can be utilized as a Full-Text Search store:

- **ElasticSearch**: A distributed, RESTful search and analytics engine.
- Additionally, **RocksDB, FoundationDB, PostgreSQL, MySQL, or SQLite** can also be used for full-text searches.

## Lookup store

The Lookup store is a key-value storage used primarily by the SMTP server and anti-spam components. It stores sender reputation information, bayesian classifier models, greylist data, and tracks message replies. The following backends can be utilized as a Lookup store:

- **Redis**: An in-memory data store.
- Additionally, **RocksDB, FoundationDB, PostgreSQL, MySQL, or SQLite** can also be utilized as a lookup store.

