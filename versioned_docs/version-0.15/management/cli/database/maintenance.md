---
sidebar_position: 3
---

# Maintenance

The message store is designed to be largely self-sufficient, requiring minimal maintenance from administrators. Stalwart runs different maintenance tasks that periodically deletes expired keys, blobs and compacts logs. This task helps manage storage space by removing data objects that are no longer needed. 
However, there might be situations when an administrator needs to initiate this process manually, perhaps to immediately free up storage space or troubleshoot storage-related issues. In these cases, Stalwart provides a CLI command called `server database-maintenance`.

```bash
$ stalwart-cli -u https://jmap.example.org server database-maintenance
```
