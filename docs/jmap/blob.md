---
sidebar_position: 3
---

# Blob store

Stalwart Mail Server offers two different storage options for email messages and other types of blobs (binary large objects), like Sieve scripts which are used for mail filtering. The server can store this data either locally or on S3-compatible storage, offering flexibility to suit different operational needs.

The blob store type is configured with the `store.blob.type` attribute. The following types are supported:

- `local`: Local blob storage
- `s3`: S3-compatible storage

For example:

```toml
[store.blob]
type = "local"
```

## Local storage

When using local storage, email messages are stored in the local disk using the Maildir format. This popular storage format stores each email message as a separate file within a specific directory structure, which reduces the need for file locks and optimizes operations such as message delivery and deletion.

The path to the local blob store is configured with the `store.blob.local.path` attribute. For example:

```toml
[store.blob.local]
path = "/opt/stalwart-mail/data/blobs"
```

## S3-compatible storage

For distributed and larger-scale implementations, Stalwart Mail Server supports the use of S3-compatible storage services. S3, or Simple Storage Service, is a scalable object storage protocol used by many cloud providers. By using an S3-compatible service, Stalwart can store emails and blobs on remote servers, facilitating large-scale storage management, easy data replication, and backup, making it a viable option for businesses seeking robustness and scalability.

The S3-compatible storage service is configured under the `store.blob.s3` section. The following attributes are supported:

- `bucket`: This option is used to specify the S3 bucket where blobs (e-mail messages, Sieve scripts, etc.) will be stored.
- `region`: This specifies the geographical region where the bucket resides. This is important for performance and legal considerations, as different regions may have different latency and data sovereignty rules.
- `access-key` and `secret-key`: These two options are used for authentication with the S3 service. The `access-key` identifies the S3 account, while the `secret-key` serves as a password.
- `endpoint`: This option specifies the network address (hostname and optionally a port) of the S3 service. If you are using a well-known S3 service like Amazon S3, this setting can be left blank, and the endpoint will be derived from the `region`. For S3-compatible services, you will need to specify the endpoint explicitly.
- `security-token`: This is an optional field that is used for temporary credentials, such as those provided by AWS STS (Security Token Service). If you're using permanent AWS IAM user credentials or are interfacing with a storage service that doesn't support STS, this field should be left blank.
- `profile`: This optional setting is used when retrieving credentials from a shared credentials file. If specified, the server will use the access key ID, secret access key, and session token (if available) associated with the given profile.
- `timeout`: This option defines the maximum amount of time the server will wait for a response from the S3 service before it gives up. 

For example, to use a MinIO server for blob storage the configuration would look like this:

```toml
[store.blob.s3]
bucket = "stalwart"
region = "eu-central-1"
access-key = "minioadmin"
secret-key = "minioadmin"
endpoint = "https://myminio:9000"
#security-token = ""
#profile = ""
timeout = "30s"
```

## Blob purging

Stalwart Mail Server runs periodically an automated task for purging expired temporary blobs. Temporary blobs are binary files that users upload to the JMAP server. In some instances, these uploaded files may not be used or accessed beyond a certain period of time, known as their [Time-To-Live (TTL)](/docs/jmap/protocol#upload-limits). When a temporary blob exceeds its TTL without being accessed, Stalwart identifies it as "expired". The cleanup task runs at a configurable interval, and during each run, it identifies and deletes these expired temporary blobs, freeing up storage space and reducing clutter in the storage system.

The schedule for this task can be configured in the `jmap.purge.schedule.blobs` section using a simplified cron-like syntax:

```txt
<minute> <hour> <week-day>
```

Where:

- ``<minute>``: minute to run the job, an integer ranging from 0 to 59.
- ``<hour>``: hour to run the job, an integer ranging from 0 to 23.
- ``<week-day>``: day of the week to run the job, ranging from ``1`` (Monday) to ``7`` (Sunday) or ``*`` to run the job every day. 

All values have to be specified using the server's local time. For example, to run the job every day at 3am local time:

```toml
[jmap.purge.schedule]
blobs = '0 3 *"
```

Or, to run the job every Tuesday at 5:45am local time:

```toml
[jmap.purge.schedule]
blobs = "45 5 2"
```
