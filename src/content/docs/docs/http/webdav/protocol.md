---
sidebar_position: 2
title: "Limits"
description: "Limits on WebDAV, CalDAV and CardDAV requests: request size, results per response and the size of live properties."
---

A single WebDAV request can carry a large file, or ask for thousands of resources in one response. The limits of the DAV services protect the server from requests that would use excessive memory. They are set on the [WebDav](/docs/ref/object/web-dav) singleton (found in the WebUI under <!-- breadcrumb:WebDav --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › WebDAV<!-- /breadcrumb:WebDav -->), and they take effect after a [settings reload](/docs/configuration/#applying-changes).

[`maxRequestSize`](/docs/ref/object/web-dav#maxrequestsize) is the largest request body accepted, <!-- default:WebDav.maxRequestSize -->25 MiB<!-- /default --> unless changed. It applies alike to uploaded files, to imported calendar and address book entries and to XML requests. Accounts with the `unlimitedUploads` permission are exempt.

[`maxResults`](/docs/ref/object/web-dav#maxresults) is the largest number of resources returned in one `PROPFIND` or `REPORT` response. The limit does not hide anything from clients, which receive the rest in further requests.

[`maxLivePropertySize`](/docs/ref/object/web-dav#maxlivepropertysize) is the largest value that a client can set for a property the server interprets, such as a collection's display name.

Two other kinds of data are limited elsewhere. The size of dead properties, which the server stores without interpreting them, is limited by the [object metadata](/docs/server/metadata#limits) settings. The size of the calendar events and contacts themselves is limited by the calendar and address book settings, described in [Calendars](/docs/collaboration/calendar) and [Contacts](/docs/collaboration/contact).
