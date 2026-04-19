---
sidebar_position: 2
---

# Protocol

WebDAV behaviour is tuned through the [WebDav](/docs/ref/object/web-dav) singleton (found in the WebUI under <!-- breadcrumb:WebDav --><!-- /breadcrumb:WebDav -->). Two fields in particular control resource usage under heavy client activity: the maximum incoming request size and the maximum number of results returned in a single response.

- [`requestMaxSize`](/docs/ref/object/web-dav#requestmaxsize): the maximum XML size of a WebDAV request that the server will accept. Default `"25mb"`. This limit matters most for file uploads, calendar imports, and contact synchronisation, which tend to carry large payloads. Administrators can raise it to support larger transfers or lower it to reduce resource consumption.
- [`maxResults`](/docs/ref/object/web-dav#maxresults): the maximum number of items (calendar events, contact entries, and similar) that the server will include in a single WebDAV response. Default `2000`. Adjust this value to balance response size against network and memory efficiency during bulk sync operations.

Example:

```json
{
  "requestMaxSize": "25mb",
  "maxResults": 2000
}
```
