---
sidebar_position: 7
title: "DATA stage"
---

The `DATA` command initiates the data transfer phase of message delivery. Once the sender has successfully completed the `MAIL FROM` and `RCPT TO` commands, the `DATA` (or `BDAT` when chunking is used) command begins transmission of the message. After the message has been transmitted, the server responds with a status code indicating whether it was accepted or rejected.

DATA-stage behaviour is configured on the [MtaStageData](/docs/ref/object/mta-stage-data) singleton (found in the WebUI under <!-- breadcrumb:MtaStageData --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Session › DATA Stage<!-- /breadcrumb:MtaStageData -->).

## Message filtering

Once a message has been submitted with `DATA` or `BDAT`, it is possible to run [Sieve scripts](/docs/sieve/), [Milter filters](/docs/mta/filter/milter), or [MTA Hooks](/docs/mta/filter/mtahooks) that accept, reject, or modify the message. When multiple filter types are configured, Stalwart executes Milter filters first, then Sieve scripts, and finally MTA Hooks.

### Sieve

The [`script`](/docs/ref/object/mta-stage-data#script) field selects the [Sieve script](/docs/sieve/) to run for the DATA stage. Sieve can rewrite the message, add or remove headers, process each MIME part, and apply conditional actions using the full set of supported [Sieve extensions](/docs/development/rfcs#sieve).

For example, setting [`script`](/docs/ref/object/mta-stage-data#script) to the expression `"'data'"` runs a Sieve script named `data` which can iterate over MIME parts and rewrite their contents:

```sieve
require ["envelope", "variables", "replace", "mime", "foreverypart", "editheader", "extracttext"];

if envelope :domain :is "to" "foobar.net" {
    set "counter" "a";
    foreverypart {
        if header :mime :contenttype "content-type" "text/html" {
            extracttext :upper "text_content";
            replace "${text_content}";
        }
        set :length "part_num" "${counter}";
        addheader :last "X-Part-Number" "${part_num}";
        set "counter" "${counter}a";
    }
}
```

### Milter

Milter filters are defined as [MtaMilter](/docs/ref/object/mta-milter) objects. Each configured filter can inspect and potentially modify the message, adding, changing, or removing headers, altering the body, or rejecting the message outright. For details see the [Milter](/docs/mta/filter/milter) section.

### MTA Hooks

MTA Hooks provide an HTTP-based alternative to milter. They are defined as [MtaHook](/docs/ref/object/mta-hook) objects and can inspect or modify messages through a JSON protocol. For details see the [MTA Hooks](/docs/mta/filter/mtahooks) section.

## Spam filtering

Whether to run the [spam filter](/docs/spamfilter/) on incoming messages is controlled by [`enableSpamFilter`](/docs/ref/object/mta-stage-data#enablespamfilter), an expression that returns a boolean. The default policy enables the filter for unauthenticated sessions (`is_empty(authenticated_as)`). To restrict filtering to a specific listener only:

```json
{
  "enableSpamFilter": {"else": "listener == 'smtp'"}
}
```

## Message limits

Message limits prevent abusive use of a single session and protect against message loops. Relevant fields are [`maxMessages`](/docs/ref/object/mta-stage-data#maxmessages) (maximum number of messages per SMTP session, default 10), [`maxMessageSize`](/docs/ref/object/mta-stage-data#maxmessagesize) (maximum size of a single message in bytes, default 104857600, 100 MB), and [`maxReceivedHeaders`](/docs/ref/object/mta-stage-data#maxreceivedheaders) (maximum number of `Received` headers allowed in a message, which helps prevent message loops, default 50):

```json
{
  "maxMessages": {"else": "10"},
  "maxMessageSize": {"else": "104857600"},
  "maxReceivedHeaders": {"else": "50"}
}
```

## Headers

Headers automatically added to accepted messages are controlled by the following fields, each an expression returning a boolean unless noted:

- [`addReceivedHeader`](/docs/ref/object/mta-stage-data#addreceivedheader): add a `Received` header containing the client IP address and TLS information.
- [`addReceivedSpfHeader`](/docs/ref/object/mta-stage-data#addreceivedspfheader): add a `Received-SPF` header with SPF results.
- [`addAuthResultsHeader`](/docs/ref/object/mta-stage-data#addauthresultsheader): add an `Authentication-Results` header with DMARC, DKIM, SPF, ARC, and iprev results.
- [`addMessageIdHeader`](/docs/ref/object/mta-stage-data#addmessageidheader): add a `Message-ID` header when the message lacks one.
- [`addDateHeader`](/docs/ref/object/mta-stage-data#adddateheader): add a `Date` header when the message lacks one.
- [`addReturnPathHeader`](/docs/ref/object/mta-stage-data#addreturnpathheader): add a `Return-Path` header containing the address specified in `MAIL FROM`.
- [`addDeliveredToHeader`](/docs/ref/object/mta-stage-data#adddeliveredtoheader): add a `Delivered-To` header containing the recipient address. This field is a plain boolean; default `true`.

The default policy for every expression-valued header is to add it only when `local_port == 25`. The following example adds `Received`, `Received-SPF`, and `Authentication-Results` on the SMTP listener; lets submission listeners generate `Message-ID` and `Date` when absent; always adds `Delivered-To`; and never adds `Return-Path`:

```json
{
  "addReceivedHeader": {
    "match": [{"if": "listener == 'smtp'", "then": "true"}],
    "else": "false"
  },
  "addReceivedSpfHeader": {
    "match": [{"if": "listener == 'smtp'", "then": "true"}],
    "else": "false"
  },
  "addAuthResultsHeader": {
    "match": [{"if": "listener == 'smtp'", "then": "true"}],
    "else": "false"
  },
  "addMessageIdHeader": {
    "match": [{"if": "listener == 'smtp'", "then": "false"}],
    "else": "true"
  },
  "addDateHeader": {
    "match": [{"if": "listener == 'smtp'", "then": "false"}],
    "else": "true"
  },
  "addReturnPathHeader": {"else": "false"},
  "addDeliveredToHeader": true
}
```
