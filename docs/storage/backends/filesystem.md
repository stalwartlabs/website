---
sidebar_position: 7
---

# Filesystem

For single-node installations, Stalwart supports storing emails and blobs on the local filesystem. This is done using a hashed directory structure, which is designed to prevent filesystem slowdowns when storing large numbers of files in a single directory.

## Configuration

The following configuration settings are available for the filesystem blob store, which are specified under the `store.<name>` section of the configuration file:

- `type`: Specifies the type of storage, set to `"fs"` for filesystem storage.
- `path`: This option specifies the path to the directory where blobs (e-mail messages, Sieve scripts, etc.) will be stored.
- `depth`: This option specifies the number of subdirectories to create. The default value is `2`, which means that the directory structure will be two levels deep. 

### Example

```toml
[store."filesystem"]
type = "fs"
path = "/var/lib/data/blobs"
depth = 2
```

