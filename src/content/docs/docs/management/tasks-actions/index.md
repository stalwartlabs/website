---
sidebar_position: 1
title: "Overview"
description: "Actions and tasks: management operations that run immediately on request, and background jobs that the server schedules and retries."
---

Most management work changes configuration objects: an administrator edits an object, and the server applies the new values. Some work does not fit that model, because the administrator needs the server to do something rather than store something. Examples are reloading the settings, retraining the spam classifier, recalculating a quota or deleting the data of an account.

Stalwart provides two mechanisms for this kind of work, and the difference between them is when the work runs. Both are available in the [WebUI](/docs/management/webui/), with the [CLI](/docs/management/cli/) and through the management API.

## Actions

An [action](/docs/management/tasks-actions/actions) runs immediately when it is requested and returns its result in the response. Typical actions reload the settings or the TLS certificates, pause the outbound queue, or test how the spam filter would classify a message.

Actions are not stored. Each one is created, executed and answered within a single request, which means that its result cannot be retrieved afterwards. A caller that needs the result keeps the response.

## Tasks

A [task](/docs/management/tasks-actions/tasks) is a background job that the server runs when it is due. Typical tasks send a calendar alarm, deliver a DMARC report, renew a certificate, or run a maintenance operation on an account or on the whole store.

Unlike actions, tasks are stored until they complete, so they can be listed while they wait. Stored tasks also make retries possible. A task that fails for a reason that may be temporary is retried according to the [TaskManager](/docs/ref/object/task-manager) settings until it succeeds. A task whose failure no retry can fix is marked as failed instead, and waits for an administrator.

The server creates most tasks itself, in the course of normal operation. Administrators create maintenance tasks when they need one.

## Search indexing

Search indexing uses neither mechanism. Documents are indexed from queues, one kept per account or telemetry bucket, and the state of those queues is shown separately as [index queue status](/docs/management/tasks-actions/tasks#search-index-queue).
