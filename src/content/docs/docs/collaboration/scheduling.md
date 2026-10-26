---
sidebar_position: 4
title: "Scheduling"
---

Arranging a meeting involves more than one calendar. The organiser sends invitations, each attendee answers, and every later change or cancellation has to reach everyone involved. Calendar scheduling automates this exchange. It carries invitations, replies, updates and cancellations between the organiser of an event and its attendees, and keeps each participant's copy of the event, and their participation status, up to date.

Stalwart offers scheduling to two kinds of client. For JMAP for Calendars clients, scheduling operations such as sending invitations, processing responses and managing event updates are part of the protocol. For CalDAV, scheduling comes from the Scheduling Extensions to CalDAV ([RFC 6638](https://www.rfc-editor.org/rfc/rfc6638)), which clients must implement. These extensions make scheduling a server operation: storing an event with attendee information triggers the scheduling logic on the server, which delivers invitations, processes replies and updates calendars.

Both rest on two protocols from the iCalendar family. The iCalendar Transport-Independent Interoperability Protocol (iTIP, [RFC 5546](https://www.rfc-editor.org/rfc/rfc5546)) defines how scheduling messages are structured and processed in the iCalendar format. It does so through a set of methods, such as `REQUEST`, `REPLY` and `CANCEL`, exchanged between organisers and attendees. iTIP does not say how the messages travel. The iCalendar Message-Based Interoperability Protocol (iMIP, [RFC 6047](https://www.rfc-editor.org/rfc/rfc6047)) fills that gap by carrying iTIP messages over email, which makes scheduling possible between systems that do not implement CalDAV.

Stalwart uses iMIP whenever a recipient cannot be reached through CalDAV, as with an external attendee. It then delivers the scheduling message as an email with an attached `.ics` file.

## Enabling scheduling

Scheduling is configured on the [CalendarScheduling](/docs/ref/object/calendar-scheduling) singleton, found in the WebUI under <!-- breadcrumb:CalendarScheduling --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /></svg> Calendar & Contacts › Scheduling<!-- /breadcrumb:CalendarScheduling -->. It is <!-- default:CalendarScheduling.enable as=enabled -->enabled<!-- /default --> by default, so that invitations, participant management and automated scheduling work with CalDAV clients that implement RFC 6638, and with email-based iMIP.

Disabling [`enable`](/docs/ref/object/calendar-scheduling#enable) turns scheduling off for the whole server. Stalwart then neither processes scheduling requests nor generates scheduling messages, on both the iTIP and the iMIP paths. Events that include attendee information are still stored, as ordinary calendar entries, but no invitations, updates or replies are sent or processed.

Scheduling can also be enabled or disabled for individual accounts, through [permissions](/docs/auth/authorization/permissions).

## Automatic event addition

[RFC 6638](https://www.rfc-editor.org/rfc/rfc6638) expects a CalDAV server to add incoming invitations to the recipient's calendar automatically. Anyone can send an invitation by email, however, so automatic addition also lets strangers place events on a user's calendar. Stalwart therefore restricts it, in two stages.

The first stage decides whether an incoming iMIP message is processed at all, and it requires the sender to be authenticated. Either the message passed [DMARC](/docs/mta/authentication/dmarc), in which case the `From` header identifies the sender, or it was submitted by an authenticated local user, in which case the envelope sender does. Messages classified as spam are not processed.

The second stage decides whether an invitation from an authenticated sender is added to the calendar. This depends on [`autoAddInvitations`](/docs/ref/object/calendar-scheduling#autoaddinvitations), which is <!-- default:CalendarScheduling.autoAddInvitations as=enabled -->disabled<!-- /default --> by default. While it is disabled, an invitation is added automatically only when the sender is a local account, or is listed in the recipient's [address book](/docs/collaboration/contact). Other invitations are not added automatically. When it is enabled, every invitation from an authenticated sender is added, whether or not the recipient knows the sender, which conforms strictly to RFC 6638.

In both cases, the sender authentication and spam checks apply, and the recipient needs the `calendarSchedulingReceive` permission.

## Scheduling limits

To prevent misuse of scheduling and to protect server stability, the CalendarScheduling singleton limits the size and scope of scheduling operations.

### iTIP message size

[`maxItipSize`](/docs/ref/object/calendar-scheduling#maxitipsize) is the largest iCalendar object in an incoming iTIP message that the server accepts and processes, <!-- default:CalendarScheduling.maxItipSize -->512 KiB<!-- /default --> by default. It guards against excessively large or malformed invitations that could exhaust memory or processing capacity. A larger message is still delivered as email, but its scheduling part is not processed, and the server logs a `calendar.itip-message-error` event with the detail `iMIP message too large`.

### Outbound recipient limit

[`maxRecipients`](/docs/ref/object/calendar-scheduling#maxrecipients) limits the number of recipients that a single outbound iTIP message may include, <!-- default:CalendarScheduling.maxRecipients -->100<!-- /default --> by default. Requests that exceed it are rejected before delivery. The limit prevents the calendar system from being used to send mass invitations to a large number of users in a single operation.

Outbound iMIP messages are also email, so every [MTA-level throttling policy](/docs/mta/outbound/rate-limit) applies to them as well. They are subject to the same rate limits, message size limits and delivery policies as any other email traffic.

## Sender checks on scheduling messages

Scheduling messages can be forged like any other email. Stalwart therefore applies a scheduling message only when its sender is entitled to make that change, according to three rules.

Only the organiser of an event can update it, add instances to it or cancel it. An attendee can only reply with their own participation status, so an update, an addition or a cancellation sent by an attendee for an event organised by someone else is ignored.

An invitation that claims to come from an organiser, but is not sent by that organiser, is not added to the recipient's calendar.

A scheduling message submitted by an authenticated user is bound to the envelope sender of the submission. An authenticated user therefore cannot send replies or invitations in the name of another participant.

## Supported methods

iTIP defines a set of methods for the messages exchanged between organiser and attendees. Which inbound methods Stalwart processes depends on the role of the local recipient:

| Recipient role | Methods processed |
|---|---|
| Local organiser | `REPLY`, and `REFRESH` from an attendee, which is answered by sending the current invitation again |
| Local attendee | `REQUEST`, `ADD` and `CANCEL`, and `REPLY` only from a delegate of a local attendee |

Two methods are not supported: `COUNTER` and `DECLINECOUNTER`, which let an attendee propose a different time and the organiser reject the proposal. The server never sends them. Inbound messages with these methods, or with any other method not listed above, are delivered as email but not processed, and the server logs a `calendar.itip-message-error` event with the detail `Unsupported method: <METHOD>`.

An attendee of type group (`CUTYPE=GROUP`) is invited as a single attendee, and it is not expanded into the members of the group. [Free/busy and availability](/docs/collaboration/availability) describes the availability that clients look up while scheduling a meeting, and the differences between CalDAV and JMAP clients.

## Inbox auto-expunge

The CalDAV Scheduling Extensions give each account a Scheduling Inbox, a special collection that stores incoming iTIP messages such as invitations, replies, cancellations and updates. Calendar clients process these messages to synchronise meeting-related actions, and the inbox also serves as a log of scheduling activity.

Not all CalDAV clients reliably delete messages from the Scheduling Inbox after processing them, so the inbox can accumulate outdated or redundant messages. These consume storage, and they may cause clients to keep synchronising stale data. For that reason, messages older than [`expungeSchedulingInboxAfter`](/docs/ref/object/data-retention#expungeschedulinginboxafter) on the [DataRetention](/docs/ref/object/data-retention) singleton, <!-- default:DataRetention.expungeSchedulingInboxAfter -->30 days<!-- /default --> by default, are removed during the routine auto-expunge run. Leaving the field unset keeps messages in the inbox until the client or the account holder removes them.

The DataRetention singleton is found in the WebUI under <!-- breadcrumb:DataRetention --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Data Retention › Archiving, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Data Retention › Data Cleanup, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Data Retention › Auto-Expunge, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></svg> Storage › Data Retention › Telemetry<!-- /breadcrumb:DataRetention -->.

## HTTP RSVP

HTTP RSVP lets participants answer an invitation through a web link, without a CalDAV-capable client. It serves external participants, and users whose clients do not support calendaring or scheduling protocols. Each iMIP invitation email then carries a unique RSVP URL for its attendee. Following it leads to a web page on which the attendee accepts, declines or tentatively accepts the invitation.

### Endpoint

Stalwart serves the RSVP page at the path `/calendar/rsvp` of its HTTP listeners. The page is self-contained, and it never records a response by itself. Link scanners and mail gateways that follow links in messages therefore cannot answer on the attendee's behalf.

The page reads the signed token from the `i` query parameter, and calls `POST /api/calendar/rsvp` to do the actual work. That endpoint takes a JSON body and is called twice. The first call carries only the token, and retrieves the invitation details. The second call adds a participation status, and records the response. It looks like this:

```json
{ "token": "<signed token>", "partstat": "accepted", "comment": "Bringing dessert" }
```

`partstat` accepts `accepted`, `declined` or `tentative`, and the optional `comment` is a short note for the organiser. The response is one of `invitation` (the event details), `recorded` (the stored participation status), or `error` together with a localised `message`.

A recorded response is applied directly to the organiser's calendar, and a reply is placed in the organiser's Scheduling Inbox without an intermediate email.

### Enabling

HTTP RSVP is <!-- default:CalendarScheduling.httpRsvpEnable as=enabled -->enabled<!-- /default --> by default, and it is controlled by [`httpRsvpEnable`](/docs/ref/object/calendar-scheduling#httprsvpenable) on the CalendarScheduling singleton. When it is disabled, outgoing iMIP messages no longer include RSVP links, and neither the page nor `POST /api/calendar/rsvp` serves requests.

### Link URL

Each invitation contains links of the form `<base>?i=<token>&m=<partstat>`. The `<token>` identifies the attendee and the event, and `m` preselects the answer. The base is chosen as follows:

- The value of [`httpRsvpUrl`](/docs/ref/object/calendar-scheduling#httprsvpurl) when it is set, with any trailing `/` removed.
- Otherwise `https://<hostname>/calendar/rsvp`, where `<hostname>` is [`defaultHostname`](/docs/ref/object/system-settings#defaulthostname) on the [SystemSettings](/docs/ref/object/system-settings) object.

The base is never derived from anything else: not from `STALWART_PUBLIC_URL`, the listener the invitation was submitted through, the `Host` header of a request or the recipient's domain. Set `httpRsvpUrl` when attendees must reach the page through a different hostname or through a reverse proxy.

The URL replaces the whole base, so it must point to a location that forwards to `/calendar/rsvp` on Stalwart. The page sends its requests to `api/calendar/rsvp` relative to the same prefix, so the proxy must forward that path to `/api/calendar/rsvp` as well. For `https://calendar.example.org/rsvp`, for example, the page calls `https://calendar.example.org/api/calendar/rsvp`.

A change to `defaultHostname` or `httpRsvpUrl` applies to the links in invitations sent after a settings reload. Links that were already sent keep their URL.

### Expiration

[`httpRsvpLinkExpiry`](/docs/ref/object/calendar-scheduling#httprsvplinkexpiry) is how long an RSVP link remains valid after it is issued, <!-- default:CalendarScheduling.httpRsvpLinkExpiry -->90 days<!-- /default --> by default. Once it has expired, the link no longer accepts a response.

The following configuration enables HTTP RSVP behind a proxy at `calendar.example.org`, and sets the link lifetime to seven days:

```json
{
  "httpRsvpEnable": true,
  "httpRsvpUrl": "https://calendar.example.org/rsvp",
  "httpRsvpLinkExpiry": 604800000
}
```

## Branding and templating

:::tip[Enterprise feature]
This feature is available in the [Enterprise edition](/docs/server/enterprise) of Stalwart.
:::

Outbound invitations and the RSVP page can be given custom templates and logos, so that they match the organisation's branding. Stalwart ships with a built-in default for both the scheduling email and the RSVP web page, and both are replaced on the CalendarScheduling singleton.

### iMIP email template

The iMIP template renders outbound scheduling messages, such as invitations, updates and cancellations. Each message contains an HTML MIME part rendered from the template, with the event details, the sender information and, when HTTP RSVP is enabled, the RSVP link. A custom template is supplied through [`emailTemplate`](/docs/ref/object/calendar-scheduling#emailtemplate).

### HTTP RSVP web page

The RSVP page is a static HTML document, served as it is, without template variables. A replacement page supplied through [`httpRsvpTemplate`](/docs/ref/object/calendar-scheduling#httprsvptemplate) is returned verbatim in place of the built-in one.

A custom page is therefore responsible for the whole flow. It reads the `i` query parameter, calls `POST /api/calendar/rsvp` with the token to load the invitation, renders it, and posts the chosen participation status back. The endpoint returns localised labels alongside the event data, so a custom page does not need to ship its own translations.

### Logo

Both default templates include a logo. It is the system-wide branding logo, unless it is overridden for a tenant or a domain, so that different business units or hosted domains display their own branding. [Branding](/docs/management/webui/branding) describes the overrides.
