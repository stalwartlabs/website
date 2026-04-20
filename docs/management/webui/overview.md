---
sidebar_position: 1
---

# Overview

The WebUI is the browser-based front end for managing a Stalwart server and for giving end users control over their own account. It is delivered as a single-page application packaged as an [Application](/docs/ref/object/application) (found in the WebUI under <!-- breadcrumb:Application --><!-- /breadcrumb:Application -->) and mounted at two URL prefixes on any HTTP listener the server exposes:

- `/admin`, the administrator console used to configure the server, manage directories and policy, and investigate the running system.
- `/account`, the Account Manager used by end users to manage their own credentials and settings.

Both surfaces are served by the same Application bundle; the prefix determines which entry point the browser lands on and which views are available after sign-in. Installation, download location, update cadence, unpack directory, and on-demand refreshes are not configured on the WebUI itself: the WebUI is a hosted application like any other, and those topics are covered under [Applications](/docs/applications/overview).

## Administrator console

The `/admin` mount is the administration surface. After signing in with an account that holds the required permissions, operators configure and operate the server from a single interface. The console covers the configuration objects that make up the running system and the operational views that report on its behaviour.

Configuration screens are organised around the same object model exposed over the JMAP API and the [CLI](/docs/management/cli/overview): every configurable object edited in the WebUI corresponds to a singleton or collection on the server, and every form submission is translated into a `set` call on that object. The breadcrumb notations used throughout the rest of the documentation (for example, <!-- breadcrumb:Account --><!-- /breadcrumb:Account -->) name the exact location under which an object is edited.

The console groups the available views into the following broad areas:

- **Directory management.** Accounts, groups, roles, permissions, tenants, and domains, together with the authentication backends that resolve them. Operators create and edit principals, assign roles, and manage credentials from these screens.
- **Server configuration.** Listeners, TLS, storage backends, transport pipelines, filtering rules, and the general server objects. The breadcrumbs on each reference page point to the corresponding location in the tree.
- **Operational tooling.** Live sessions, queued messages, retry logic, scheduled tasks, and manually triggered [Actions](/docs/ref/object/action). This is where administrators start, stop, or reload subsystems without leaving the browser.
- **Reports.** DMARC, TLS, and ARF reports delivered to the server are browsable from the console, alongside [telemetry](/docs/telemetry/overview) dashboards covering metrics, traces, and event history.
- **Backup and recovery.** Archived items recovery, snapshots, and the maintenance workflows that read from the [data retention](/docs/ref/object/data-retention) schedule.

A global search at the top of the console locates settings by name; the search index is derived from the same object schema that drives the configuration screens, so results point directly at the field being looked for.

## Account Manager

The `/account` mount is the [Account Manager](/docs/management/webui/account-manager). End users sign in with their mailbox credentials and manage their own password, [application passwords](/docs/auth/authentication/app-password), [two-factor authentication](/docs/auth/authentication/2fa), email aliases, and, under the Enterprise Edition, [masked email addresses](/docs/email/management/masked-email). The Account Manager intentionally exposes a small subset of the object model: users see only the objects that belong to their own account and only the fields they are permitted to edit.

When an account without administrator permissions signs in at `/admin`, the console redirects to the Account Manager rather than rejecting the request outright.

## Access and routing

The WebUI is served over HTTP and so depends on a [NetworkListener](/docs/ref/object/network-listener) (found in the WebUI under <!-- breadcrumb:NetworkListener --><!-- /breadcrumb:NetworkListener -->) whose [`protocol`](/docs/ref/object/network-listener#protocol) is set to `http`. Because the `/admin` and `/account` prefixes are matched against the same HTTP surface that carries JMAP, WebDAV, and the `.well-known` endpoints, operators can restrict exposure of the administrator console to a private listener while keeping the rest of the HTTP traffic on a public one. The mechanics of scoping mount paths to specific listeners are covered under [HTTP access control](/docs/http/access-control).

Authentication at both mounts uses the server's standard [authentication stack](/docs/auth/authentication/overview), so operators can protect access with [two-factor authentication](/docs/auth/authentication/2fa) and app-scoped credentials just like any other client.

## Relationship to the CLI and the JMAP API

Every action taken in the WebUI is backed by a JMAP method call on a documented object. The same calls are available through `stalwart-cli` (see the [CLI reference](/docs/management/cli/overview)) and directly over the [JMAP API](/docs/http/jmap/overview), so automated provisioning and interactive administration share the same surface. Administrators who prefer a terminal workflow, or who need to script bulk operations, can reach for the CLI without losing parity with what the WebUI offers.
