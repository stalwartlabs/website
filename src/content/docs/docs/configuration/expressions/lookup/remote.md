---
sidebar_position: 3
title: "Remote lists"
description: "Download lookup lists from a URL, as plain lists or CSV files, and refresh them at a fixed interval."
---

A remote lookup list is downloaded from a URL, and held in memory. It suits lists maintained outside the server, such as public lists of disposable email domains or phishing URLs, or a list exported by another internal system. The list is downloaded again at a fixed interval, so changes at the source reach the server without any configuration change.

## Downloads and refresh

A list is downloaded in the background the first time it is queried, so queries made before the first download completes find the list empty. After a successful download, the list is kept for <!-- default:HttpLookup.refreshInterval -->12 hours<!-- /default -->, as set by [`refreshInterval`](/docs/ref/object/http-lookup#refreshinterval). The next query after that starts a new download. The previous content stays in use until the download completes. Each successful download is logged as a `store.http-store-fetch` event with the number of entries.

A failed download does not empty the list, so a source that is briefly unavailable does not disable the checks that use it. The previous content is kept, the error is logged as a `store.http-store-error` event, and the download is attempted again after <!-- default:HttpLookup.retry -->1 hour<!-- /default -->, as set by [`retry`](/docs/ref/object/http-lookup#retry).

A remote list is queried with `key_exists`, or with `key_get` when it is a CSV file with a value column. Keys are compared without regard to case.

## Configuration

A remote list is defined by an [HttpLookup](/docs/ref/object/http-lookup) object, found in the WebUI under <!-- breadcrumb:HttpLookup --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="m21 21-4.34-4.34" /><circle cx="11" cy="11" r="8" /></svg> Lookups › HTTP Lists<!-- /breadcrumb:HttpLookup -->. Two fields identify the list. Its [`namespace`](/docs/ref/object/http-lookup#namespace) is the name under which the list is queried, and must be unique among all lookup lists. Its [`url`](/docs/ref/object/http-lookup#url) is the address of the file. [`enable`](/docs/ref/object/http-lookup#enable) turns the list on or off, and [`isGzipped`](/docs/ref/object/http-lookup#isgzipped) decompresses a file served compressed with gzip.

The remaining settings describe the HTTP request. A list served by a protected endpoint needs credentials, given in [`httpAuth`](/docs/ref/object/http-lookup#httpauth): `Basic` with `username` and `secret`, or `Bearer` with `bearerToken`. A public list uses `Unauthenticated`.

[`httpHeaders`](/docs/ref/object/http-lookup#httpheaders) adds headers to the request, for example an API key header. When no `User-Agent` header is given, a browser user agent is sent, because some public list providers reject other clients. [`timeout`](/docs/ref/object/http-lookup#timeout) limits the duration of each download. [`allowInvalidCerts`](/docs/ref/object/http-lookup#allowinvalidcerts) accepts an invalid TLS certificate.

## Formats

Lists are published in two common shapes: a plain file with one entry per line, and a CSV file with several columns. The [`format`](/docs/ref/object/http-lookup#format) field selects how the file is read:

- `List`: one key per line. Empty lines are ignored, and surrounding whitespace is removed.
- `Csv`: one entry per line, split into columns at [`separator`](/docs/ref/object/http-lookup#separator). [`indexKey`](/docs/ref/object/http-lookup#indexkey) is the zero-based column that holds the key, and [`indexValue`](/docs/ref/object/http-lookup#indexvalue) is the column that holds the value. Without `indexValue`, the list contains keys only. [`skipFirst`](/docs/ref/object/http-lookup#skipfirst) skips a header line.

The following object downloads a public list of disposable email domains once a day:

```json
{
  "namespace": "disposable-domains",
  "url": "https://disposable.github.io/disposable-email-domains/domains.txt",
  "format": {"@type": "List"},
  "httpAuth": {"@type": "Unauthenticated"},
  "refreshInterval": 86400000
}
```

## Limits

Three limits protect the server from oversized files. Each one decides what happens to a list that outgrows it, so a large public list may need them raised:

| Field | Default | Limits | Beyond the limit |
|---|---|---|---|
| [`maxSize`](/docs/ref/object/http-lookup#maxsize) | <!-- default:HttpLookup.maxSize -->100 MiB<!-- /default --> | The size of the download and the length of each line. | A larger file is rejected with the error `Resource is too large`, and the previous content of the list is kept. A longer line is skipped. |
| [`maxEntries`](/docs/ref/object/http-lookup#maxentries) | <!-- default:HttpLookup.maxEntries -->100000<!-- /default --> | The number of entries. | Reading stops, and the entries read up to that point are used. |
| [`maxEntrySize`](/docs/ref/object/http-lookup#maxentrysize) | <!-- default:HttpLookup.maxEntrySize -->512 bytes<!-- /default --> | The length of a key or a value. | The line, key or value is skipped, and never stored truncated. |

Compression changes what `maxSize` measures. For a file compressed with gzip, `maxSize` applies to the compressed download, so the line length cap is the only size limit on its decompressed content.
