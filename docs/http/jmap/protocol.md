---
sidebar_position: 2
---

# Protocol

JMAP protocol behaviour is configured on the [Jmap](/docs/ref/object/jmap) singleton (found in the WebUI under <!-- breadcrumb:Jmap --><!-- /breadcrumb:Jmap -->). The fields below influence request handling, upload quotas, and the size of responses returned by get, set, query, and changes methods.

## Request limits

Request limits guard the JMAP server against resource exhaustion:

- [`maxConcurrentRequests`](/docs/ref/object/jmap#maxconcurrentrequests): the number of concurrent requests a single user may have in flight. Default `4`.
- [`maxRequestSize`](/docs/ref/object/jmap#maxrequestsize): the maximum size of a single request, in bytes. Default `10000000`.
- [`maxMethodCalls`](/docs/ref/object/jmap#maxmethodcalls): the maximum number of method calls that can be included in a single request. Default `16`.

## Upload limits

Upload limits restrict how often and how much data users can upload:

- [`maxUploadSize`](/docs/ref/object/jmap#maxuploadsize): the maximum size of a single uploaded file, in bytes. Default `50000000`.
- [`maxConcurrentUploads`](/docs/ref/object/jmap#maxconcurrentuploads): the number of concurrent uploads a single user may have in flight. Default `4`.
- [`uploadTtl`](/docs/ref/object/jmap#uploadttl): how long each uploaded file is kept in temporary storage before it is [deleted](/docs/storage/blob#maintenance). Default `"1h"`.
- [`maxUploadCount`](/docs/ref/object/jmap#maxuploadcount): the maximum number of files a user may upload within the quota window. Default `1000`.
- [`uploadQuota`](/docs/ref/object/jmap#uploadquota): the total aggregate size of uploaded files allowed per user within the quota window, in bytes. Default `50000000`.

## Object limits

Object limits restrict the number of objects returned or modified by a single method call:

- [`getMaxResults`](/docs/ref/object/jmap#getmaxresults): the maximum number of objects that can be fetched in a single method call. Default `500`.
- [`setMaxObjects`](/docs/ref/object/jmap#setmaxobjects): the maximum number of objects that can be modified in a single method call. Default `500`.
- [`queryMaxResults`](/docs/ref/object/jmap#querymaxresults): the maximum number of results returned by a Query method. Default `5000`.
- [`changesMaxResults`](/docs/ref/object/jmap#changesmaxresults): the maximum number of change objects returned by a Changes method. Default `5000`.
