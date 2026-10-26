---
sidebar_position: 1
title: "Overview"
description: "How Stalwart is managed: the WebUI, the CLI and the JMAP management API, the permissions that govern management, and the tools for applications, tasks, maintenance and troubleshooting."
---

Once a Stalwart server is running, its administrators keep changing it: they add domains and accounts, adjust listeners and spam rules, run maintenance jobs and investigate problems. This section describes the tools for that work and the single interface they all share.

Stalwart keeps its whole configuration as objects in its data store, from an account to a listener. Every management operation reads or writes those objects through one interface, the JMAP management API at `/jmap/`. JMAP is an HTTP protocol that exchanges JSON, and Stalwart extends it with methods for its configuration objects. Three tools use that API:

- The [WebUI](/docs/management/webui/), the browser interface for administrators at `/admin` and for users at `/account`
- The [CLI](/docs/management/cli/), `stalwart-cli`, for terminals, scripts and declarative deployments
- Direct JMAP calls from other programs, documented with each object in the [schema reference](/docs/ref/)

Because all three send the same calls, an operation performed in one of them can be reproduced in the others. A change made by hand in the WebUI can later be scripted with the CLI, for example, or sent by an external program.

## Permissions

What a caller may change is decided by its permissions. Each configuration object is guarded by permissions of the form `sys<Object><Operation>`, one for each operation on that object. The System Administrator role grants them for the whole server. In the Enterprise edition, the Tenant Administrator role grants them for the objects of one tenant only. [Permissions](/docs/auth/authorization/permissions) describes the roles and the individual permissions.

The server also exposes HTTP endpoints under `/api/`, such as `/api/schema`, which the WebUI and the CLI read. These form a separate interface and do not replace the JMAP API: configuration changes always go through `/jmap/`.

## Contents

The section covers these tools:

- [Applications](/docs/management/applications/): the web applications served by the server, including the WebUI, and how they are updated.
- [Tasks and actions](/docs/management/tasks-actions/): operations that run immediately on request, and background jobs with retries.
- [WebUI](/docs/management/webui/): the administration interface, the Account Manager and branding.
- [CLI](/docs/management/cli/): `stalwart-cli`, its commands and declarative plans.
- [Maintenance](/docs/management/maintenance/): backup and restore, recovery of deleted items, the database console and data migration between backends.
- [Troubleshooting](/docs/management/troubleshoot): diagnosing delivery, authentication and sign-in problems.
