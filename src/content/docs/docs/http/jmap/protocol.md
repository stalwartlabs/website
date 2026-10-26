---
sidebar_position: 2
title: "Limits"
description: "Limits on JMAP requests, uploads and method results: request size and concurrency, method calls, objects per call, query and changes results, parsing and upload quotas."
---

A JMAP request can bundle many method calls, each of which can read or write many objects, so one request can ask the server for a great deal of work. The limits of the JMAP API protect the server from requests that would use excessive memory or time. They are set on the [Jmap](/docs/ref/object/jmap) singleton (found in the WebUI under <!-- breadcrumb:Jmap --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › JMAP › Limits, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › JMAP › Push, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › JMAP › WebSocket<!-- /breadcrumb:Jmap -->), and they take effect after a [settings reload](/docs/configuration/#applying-changes).

Clients are told about the limits in advance. The values are advertised in the `urn:ietf:params:jmap:core` capability of the session resource, so well-behaved clients split their requests to stay within them. A request that exceeds a limit is refused with the error that RFC 8620 defines for it, such as `limit` with the name of the limit, or `requestTooLarge`.

## Requests

Three limits bound each request as a whole. [`maxRequestSize`](/docs/ref/object/jmap#maxrequestsize) is the largest request body accepted, in bytes, <!-- default:Jmap.maxRequestSize -->10 MB<!-- /default --> unless changed. [`maxMethodCalls`](/docs/ref/object/jmap#maxmethodcalls) is the number of method calls that one request can contain.

The third limit concerns concurrency. [`maxConcurrentRequests`](/docs/ref/object/jmap#maxconcurrentrequests) is the number of requests that one account can have in progress at the same time, <!-- default:Jmap.maxConcurrentRequests -->4<!-- /default --> unless changed, and leaving it unset removes the limit. Accounts with the `unlimitedRequests` permission are exempt from it.

## Method results

Each method call is also limited in the number of objects it reads or writes:

| Field | Limits |
|---|---|
| [`maxGetResults`](/docs/ref/object/jmap#maxgetresults) | The objects returned by one `/get` call |
| [`maxSetObjects`](/docs/ref/object/jmap#maxsetobjects) | The objects created, updated or destroyed by one `/set` call |
| [`maxQueryResults`](/docs/ref/object/jmap#maxqueryresults) | The results returned by one `/query` call |
| [`maxChangesResults`](/docs/ref/object/jmap#maxchangesresults) | The changes returned by one `/changes` call |
| [`maxSnippetResults`](/docs/ref/object/jmap#maxsnippetresults) | The search snippets returned by one `SearchSnippet/get` call |
| [`parseLimitEmail`](/docs/ref/object/jmap#parselimitemail), [`parseLimitEvent`](/docs/ref/object/jmap#parselimitevent), [`parseLimitContact`](/docs/ref/object/jmap#parselimitcontact) | The messages, iCalendar items and vCard items parsed by one `/parse` call |

## Uploads

Uploads are limited in two ways: one upload at a time, and in what an account holds. [`maxUploadSize`](/docs/ref/object/jmap#maxuploadsize) is the largest single upload, <!-- default:Jmap.maxUploadSize -->50 MB<!-- /default --> unless changed, and accounts with the `unlimitedUploads` permission are exempt from it. [`maxConcurrentUploads`](/docs/ref/object/jmap#maxconcurrentuploads) is the number of uploads that one account can have in progress at the same time, and leaving it unset removes the limit.

An uploaded file does not become part of the account at once. It stays in temporary storage until it is used, for example as a message attachment, or until [`uploadTtl`](/docs/ref/object/jmap#uploadttl) expires and it is deleted. While files wait there, [`uploadQuota`](/docs/ref/object/jmap#uploadquota) limits their total size and [`maxUploadCount`](/docs/ref/object/jmap#maxuploadcount) their number, per account.

The size of messages, mailboxes and attachments is limited separately, by the email settings described in [Message and mailbox limits](/docs/email/settings/jmap).
