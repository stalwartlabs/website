---
sidebar_position: 1
title: "Overview"
---

Stalwart performs two kinds of server management operation beyond the regular request path: [Actions](/docs/management/tasks-actions/actions), which run immediately on demand, and [Tasks](/docs/management/tasks-actions/tasks), which run in the background according to a schedule. Both are invoked through the same JMAP API exposed by the [WebUI](/docs/management/webui/), the [CLI](/docs/management/cli/), and direct HTTP calls, and each is recorded so its outcome can be inspected afterwards.

## Actions

An [Action](/docs/management/tasks-actions/actions) is a management operation triggered on demand and executed immediately. Reloading settings or TLS certificates, invalidating caches, pausing and resuming the outbound queue, running a DMARC troubleshooting probe, and classifying a message through the spam filter are all Actions. Each invocation is stored as an [Action](/docs/ref/object/action) object so that any result it produces, such as a spam score or a troubleshooting report, can be retrieved later.

## Tasks

A [Task](/docs/management/tasks-actions/tasks) is a background job scheduled for execution at a point in time. Search indexing, calendar alarm dispatch, outbound DMARC and TLS reports, account destruction, store and spam filter maintenance, ACME renewal, DKIM key rotation, and DNS record updates are all Tasks. Each scheduled job is stored as a [Task](/docs/ref/object/task) object whose status records whether it is pending, awaiting retry, or has failed permanently, and the [TaskManager](/docs/ref/object/task-manager) singleton governs how failed tasks are retried.

## How they differ

Actions and Tasks both represent server operations driven through the management API, but they differ in when and how they run:

- **Timing**: an Action runs immediately in response to an administrator request; a Task runs in the background at its scheduled [`due`](/docs/ref/object/task#due) time, whether deferred once or repeated on a recurring basis.
- **Execution model**: an Action completes synchronously and returns its result on the same request; a Task is queued and processed asynchronously by the task manager.
- **Failure handling**: an Action either succeeds or fails on the spot; a Task carries a retry budget and is retried according to the [TaskManager](/docs/ref/object/task-manager) strategy until it succeeds or is marked as permanently failed.
- **Typical use**: Actions cover interactive operations such as reloading configuration or probing message handling; Tasks cover recurring or deferred maintenance such as indexing, reporting, and certificate renewal.
