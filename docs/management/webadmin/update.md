---
sidebar_position: 2
---

# Updates

Upon the initial execution of Stalwart, the Webadmin interface is automatically retrieved from the GitHub repository and stored locally within the server's [blob store](/docs/storage/blob) under the `STALWART_WEBADMIN` key, packaged as a zip file. This ensures that the management interface is readily available and updated without manual intervention. With every subsequent restart of Stalwart, the server fetches the Webadmin binary from the blob store, extracting it into a temporary directory. This process guarantees that the Webadmin is always available and updated for use immediately after Stalwart starts.

Staying current with the latest Webadmin version is simple. Administrators can download and install new updates automatically by navigating to `Maintenance` > `Update Webadmin` within the Webadmin interface. This feature ensures that the management tool remains up-to-date with the latest features and security enhancements, fostering a secure and efficient administrative experience.

## Resource Location

By default the webadmin bundle is downloaded from `https://github.com/stalwartlabs/webadmin/releases/latest/download/webadmin.zip`, but this can be changed by setting the `webadmin.resource` key to a different URL or a local file (specified as `file:///path/to/webadmin.zip`).

Example:

```toml
[webadmin]
resource = "file:///path/to/webadmin.zip"
```

## Automatic Updates

Stalwart Mail Server can be configured to automatically update the Webadmin bundle on startup. This feature is disabled by default and can be enabled by setting the `webadmin.auto-update` key to `true`.

Example:

```toml
[webadmin]
auto-update = true
```

## Unpack Directory

The Webadmin bundle is extracted into a temporary directory for execution. By default, this directory is set to `/tmp`, but it can be changed by setting the `webadmin.path` key to a different path.

Example:

```toml
[webadmin]
path = "/path/to/unpack/dir"
```
