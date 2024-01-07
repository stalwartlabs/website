---
sidebar_position: 3
---

# Maintenance

## Database maintenance

The message store is designed to be largely self-sufficient, requiring minimal maintenance from administrators. Stalwart Mail Server runs different maintenance tasks that periodically deletes expired keys, blobs and compacts logs. This task helps manage storage space by removing data objects that are no longer needed. 
However, there might be situations when an administrator needs to initiate this process manually, perhaps to immediately free up storage space or troubleshoot storage-related issues. In these cases, Stalwart Mail Server provides a CLI command called `server database-maintenance`.

```bash
$ stalwart-cli -u https://jmap.example.org server database-maintenance
```

## TLS certificate reloading

Stalwart Mail Server supports [ACME](/docs/server/tls/acme) (Automatic Certificate Management Environment) for TLS certificate management, which allows automatic certificate issuance and renewal. However, when TLS certificate management is done manually, it is necessary to reload any new certificates in order for the changes to take effect. This can be done by running the `server reload-certificates` command:

```bash
$ stalwart-cli -u https://jmap.example.org server reload-certificates
```
