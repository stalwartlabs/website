---
sidebar_position: 2
title: "Protocol"
---

WebDAV behaviour is tuned through the [WebDav](/docs/ref/object/web-dav) singleton (found in the WebUI under <!-- breadcrumb:WebDav --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › WebDAV<!-- /breadcrumb:WebDav -->). Two fields in particular control resource usage under heavy client activity: the maximum incoming request size and the maximum number of results returned in a single response.

- [`requestMaxSize`](/docs/ref/object/web-dav#requestmaxsize): the maximum XML size of a WebDAV request that the server will accept. Default `"25mb"`. This limit matters most for file uploads, calendar imports, and contact synchronisation, which tend to carry large payloads. Administrators can raise it to support larger transfers or lower it to reduce resource consumption.
- [`maxResults`](/docs/ref/object/web-dav#maxresults): the maximum number of items (calendar events, contact entries, and similar) that the server will include in a single WebDAV response. Default `2000`. Adjust this value to balance response size against network and memory efficiency during bulk sync operations.

Example:

```json
{
  "requestMaxSize": "25mb",
  "maxResults": 2000
}
```
