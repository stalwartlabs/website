---
sidebar_position: 4.5
title: "Free/busy and availability"
description: "How Stalwart answers free/busy queries over JMAP and CalDAV, which calendars and events count, and the limits that apply."
---

Scheduling a meeting requires knowing when every attendee is free, but users rarely want colleagues to read the details of their calendars. Free/busy information solves this. It tells another user when someone is busy, without revealing what the events are, so that a meeting can be placed at a time when every attendee is free. Stalwart answers free/busy queries over JMAP and over CalDAV.

This page explains which calendars and events contribute to the answer, who may ask, and the limits that apply. An administrator needs this when users ask why a colleague appears free during a meeting, or why two clients show different free/busy for the same person.

## Availability queries

Clients ask for free/busy time in three ways. JMAP clients call `Principal/getAvailability`, part of the `urn:ietf:params:jmap:principals:availability` capability defined by [JMAP for Calendars](https://datatracker.ietf.org/doc/draft-ietf-jmap-calendars/). The response lists the busy periods for the requested time range.

CalDAV scheduling clients send a free/busy request, an iTIP `VFREEBUSY` request ([RFC 6638](https://www.rfc-editor.org/rfc/rfc6638) section 5), to their scheduling outbox, usually while the user composes an invitation. The request follows the rules of [calendar scheduling](/docs/collaboration/scheduling), and it can ask about several attendees at once.

CalDAV clients can also run a `free-busy-query` REPORT ([RFC 4791](https://www.rfc-editor.org/rfc/rfc4791) section 7.10) on a single calendar collection. This requires the `davCalFreeBusyQuery` [permission](/docs/auth/authorization/permissions).

The JMAP method and the scheduling request apply the same rules, described in the next two sections. `Principal/getAvailability` requires the `jmapPrincipalGetAvailability` permission, and `Principal/get` reports `mayGetAvailability` as `true` for the principals the requester may query. The `free-busy-query` REPORT works differently, as described in [Free/busy over CalDAV](#freebusy-over-caldav).

Free/busy is not a directory query. Neither the JMAP method nor the scheduling request depends on [`allowDirectoryQueries`](/docs/ref/object/sharing#allowdirectoryqueries), which is described in [Sharing](/docs/collaboration/sharing#sharing-individual-resources). With directory queries disabled, users cannot search for other accounts, but they can still query the availability of an account whose identifier or address they know.

## Calendars that count

A calendar contributes to a user's availability only when two conditions hold. The first is that the requester may read free/busy information on it. Members of the account that owns the calendar always may. Other users need the right to read free/busy, or the right to read items, on that calendar, granted by [sharing](/docs/collaboration/sharing). The second condition is that the owner is subscribed to the calendar. A calendar the owner has unsubscribed from never counts.

Among those calendars, each user also decides which ones count towards their availability. The decision is made through the `includeInAvailability` property of the calendar in JMAP:

| Value | Effect |
|---|---|
| `all` | Every event in the calendar counts. |
| `attending` | Only events the user attends count. |
| `none` | The calendar does not count. |

When the user has not set a value, the value applied depends on how the user reaches the calendar. It is `all` for a calendar that belongs to the user's own account, or to a group account the user is a member of. It is `none` for a calendar that is only shared with the user. An explicit value always takes precedence. `Calendar/get` reports the same default, so clients show the value the server applies. A user who wants a calendar shared with them to count sets it to `all` or `attending`.

## Events that count

Not every event on a counted calendar makes the user busy. Cancelled events are ignored. Events marked secret (iCalendar `CLASS:CONFIDENTIAL`) are ignored too, with one exception: CalDAV free/busy requests by members of the owning account count them. Overlapping busy periods are merged into one.

A busy period normally carries no details. It carries event details, such as the title, only when the requester may read the events of that calendar, and never for private events. [Event privacy](/docs/collaboration/calendar#event-privacy) describes how event privacy is applied.

## Free/busy over CalDAV

A free/busy request sent to the scheduling outbox applies the rules above, including `includeInAvailability` and the `attending` value. For each attendee, the requester needs the right to read items, or the right to read free/busy, on at least one of that attendee's calendars. The response gives a status for each attendee, so the other attendees are still answered when one of them fails:

| Status | Cause |
|---|---|
| `3.8;No authority` | The requester may not read any of the attendee's calendars. |
| `3.10;Request entity too large` | The attendee has too many busy periods in the requested range. |

The CalDAV property `schedule-calendar-transp` reflects the same setting. A calendar is reported as `transparent` when the owner's `includeInAvailability` excludes it, and as `opaque` otherwise. The property is read-only and cannot be changed with `PROPPATCH`, so `includeInAvailability` has to be changed through JMAP instead.

The `free-busy-query` REPORT behaves differently, because it is defined by RFC 4791, which has no availability settings. It runs on the single calendar collection named in the request, and it ignores `includeInAvailability`, subscriptions and the `attending` value. A requester who does not own the calendar needs both the right to read items and the right to read free/busy. Secret, transparent and cancelled events are skipped, and a tentative event is reported as `BUSY-TENTATIVE` only when it is public. As a result, a client that uses `free-busy-query` can show different free/busy time for the same user than JMAP clients and scheduling requests do.

## Limits

Two settings on the [Calendar](/docs/ref/object/calendar) object limit availability queries. The first bounds the size of a query: [`maxAvailabilityDuration`](/docs/ref/object/calendar#maxavailabilityduration) is the longest time range one query may cover, <!-- default:Calendar.maxAvailabilityDuration -->365 days<!-- /default --> by default. A longer range fails with the JMAP error `tooLarge`.

The second bounds the rate of queries: [`availabilityRateLimit`](/docs/ref/object/calendar#availabilityratelimit) limits how often one account may query availability, <!-- default:Calendar.availabilityRateLimit -->100 per minute<!-- /default --> by default. Over the limit, the query fails with the JMAP error `rateLimit`. Accounts with the `unlimitedRequests` permission are exempt.

Tenants are kept apart as well. Users in another [tenant](/docs/auth/authorization/tenants) are reported as not found, unless the requester holds the `sysAccountQuery` permission.

## Scheduling behaviour that affects availability

[Scheduling](/docs/collaboration/scheduling) describes how invitation links are built, which iTIP methods are processed and how group attendees are handled. Two of those rules often come up together with free/busy questions. The first is that iTIP `COUNTER` and `DECLINECOUNTER` are not supported, so an attendee cannot propose a new time through the server. The second is that an attendee of type group (`CUTYPE=GROUP`) is not expanded into its members, so the members' availability is not consulted.
