---
sidebar_position: 3
---

# Remote

Remote lookup lists retrieve key-value pairs from an external source over HTTP, allowing lookup data to be managed centrally and refreshed periodically. Two formats are supported: a simple list format where each entry occupies a single line, and CSV for more structured data.

Each list is associated with a refresh interval and a retry interval. Once the refresh interval elapses, the server automatically re-fetches the list so that values remain current without manual intervention.

## Configuration

Remote lookup lists are defined through the [HttpLookup](/docs/ref/object/http-lookup) object (found in the WebUI under <!-- breadcrumb:HttpLookup --><!-- /breadcrumb:HttpLookup -->). Each record has the following fields:

- [`url`](/docs/ref/object/http-lookup#url): HTTP endpoint from which the list is fetched (required).
- [`enable`](/docs/ref/object/http-lookup#enable): when `true`, the list is active. Default: `true`.
- [`format`](/docs/ref/object/http-lookup#format): format of the remote list (required). Two variants are supported: `List` (one entry per line) and `Csv` (comma-separated values with configurable parsing).
- [`isGzipped`](/docs/ref/object/http-lookup#isgzipped): when `true`, the payload is decompressed with gzip before parsing. Default: `false`.
- [`refresh`](/docs/ref/object/http-lookup#refresh): how often to re-fetch the list. Default: `"12h"`.
- [`retry`](/docs/ref/object/http-lookup#retry): how long to wait before retrying a failed fetch. Default: `"1h"`.
- [`timeout`](/docs/ref/object/http-lookup#timeout): maximum time allowed for the fetch operation. Default: `"30s"`.
- [`namespace`](/docs/ref/object/http-lookup#namespace): the namespace under which the list's entries are exposed to lookup functions (read-only; derived from the record identifier).

### CSV parsing options

When [`format`](/docs/ref/object/http-lookup#format) is set to the `Csv` variant, the variant carries additional fields:

- [`separator`](/docs/ref/object/http-lookup#separator): the delimiter between columns. Default: `","`.
- [`indexKey`](/docs/ref/object/http-lookup#indexkey): zero-based column index used as the lookup key. Default: `0`.
- [`indexValue`](/docs/ref/object/http-lookup#indexvalue): optional zero-based column index used as the lookup value.
- [`skipFirst`](/docs/ref/object/http-lookup#skipfirst): when `true`, the first line is treated as a header and skipped. Default: `false`.

### Resource limits

The size of the retrieved list and each of its entries is bounded by:

- [`maxSize`](/docs/ref/object/http-lookup#maxsize): maximum total size of the list in bytes. Default: `"100mb"`.
- [`maxEntries`](/docs/ref/object/http-lookup#maxentries): maximum number of entries retained. Default: `100000`.
- [`maxEntrySize`](/docs/ref/object/http-lookup#maxentrysize): maximum size of a single entry in bytes. Default: `512`.

The list is truncated if it exceeds any of these limits.
