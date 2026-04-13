---
sidebar_position: 3
---

# Remote

Remote lookup lists enable the retrieval of key-value pairs from external sources over HTTP, providing a flexible solution for configurations that need centralized management or periodic updates. These lists support two formats: a simple list format, where each entry is defined on a separate line, and CSV, offering more structured data handling capabilities.

To ensure the data remains current, remote lookup lists can be configured with an expiration time. Once expired, the server automatically re-fetches the list at a configurable interval, maintaining up-to-date values without manual intervention. This feature makes remote lookup lists ideal for dynamic environments where configuration settings are shared or frequently updated.

## Configuration

Remote lookup lists are defined under the `http-lookup.<id>` section of the configuration file, where `<id>` is a unique identifier for each list. The configuration allows control over how these lists are fetched and managed. Below are the key settings available for configuring remote lookup lists:

- `enable`: Determines whether the remote lookup list is active. Set to `true` to enable the list.
- `url`: Specifies the HTTP endpoint from which the list will be retrieved.
- `format`: Defines the format of the remote list. Supported values are:
  - `list`: A simple format with one entry per line.
  - `csv`: Comma-separated values for structured data.
- `retry`: Defines the interval for retrying the fetch operation if the initial attempt fails (e.g., `1h` for 1 hour).
- `refresh`: Specifies how often the server should re-fetch the list to ensure it remains up-to-date (e.g., `12h` for 12 hours).
- `timeout`: Sets the maximum time allowed for the server to wait for a response during the fetch operation (e.g., `30s` for 30 seconds).

When the `format` is set to `csv`, the following options may be configured:
  - `separator`: Specifies the delimiter used in the CSV file.
  - `index.key`: Indicates the column index (starting from 0) to use as the key.
  - `index.value`: Indicates the column index (starting from 0) to use as the value, this is optional.
  - `skip-first`: Skips the first line of the file if it contains headers (`true` or `false`).
  - `gzipped`: Indicates whether the file is compressed using Gzip (`true` or `false`).

Resource constraints for the remote list are configured under `limits`:
  - `limits.size`: Maximum size of the list in bytes.
  - `limits.entries`: Maximum number of entries allowed in the list.
  - `limits.entry-size`: Maximum size of a single entry in bytes.

Example:

```toml
[http-lookup.openphish]
enable = true
url = "https://openphish.com/feed.txt"
format = "list"
retry = "1h"
refresh = "12h"
timeout = "30s"

[http-lookup.openphish.limits]
size = 104857600
entries = 100000
entry-size = 512

[http-lookup.phishtank]
enable = true
url = "http://data.phishtank.com/data/online-valid.csv.gz"
format = "csv"
separator = ","
index.key = 1
skip-first = true
gzipped = true
retry = "1h"
refresh = "6h"
timeout = "30s"

[http-lookup.phishtank.limits]
size = 104857600
entries = 100000
entry-size = 512
```