---
sidebar_position: 1
---

# Overview

Stalwart Mail Server offers two different storage options for email messages and other types of blobs (binary large objects), like Sieve scripts which are used for mail filtering. The server can store this data either locally or on S3-compatible storage, offering flexibility to suit different operational needs.

The blob store type is configured with the `store.blob.type` attribute. The following types are supported:

- `local`: Local blob storage
- `s3`: S3-compatible storage

For example:

```toml
[store.blob]
type = "local"
```
