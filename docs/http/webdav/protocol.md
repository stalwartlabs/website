---
sidebar_position: 2
---

# Protocol

Stalwart allows administrators to fine-tune WebDAV behavior through a set of configurable protocol settings. These options help control resource usage and response behavior, ensuring that the server remains efficient and secure under various workloads and client activity patterns.

Two key settings govern the size of incoming requests and the number of results returned in a single response:

- `dav.request.max-size`: This setting defines the maximum allowed size for a single WebDAV request. It is particularly relevant when handling file uploads, calendar imports, or contact synchronization involving large payloads. By default, this limit is set to **25 MB**. Administrators can adjust this value to better align with organizational policies or client requirements, either increasing it to support larger transfers or lowering it to prevent excessive resource consumption.

- `dav.response.max-results`: This setting controls the maximum number of items (such as calendar events or contact entries) that the server will include in a single WebDAV response. This is useful for preventing performance degradation during large sync operations, especially with clients that request bulk data. The default value is **2000 results per response**. If needed, this can be tuned to balance response size with network and memory efficiency.

These settings can be configured via the server’s configuration file or management interface, offering administrators precise control over how WebDAV requests and responses are handled.

Example:

```toml
[dav.request]
max-size = 26214400

[dav.response]
max-results = 2000
```