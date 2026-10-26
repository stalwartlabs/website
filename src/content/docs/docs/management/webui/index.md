---
sidebar_position: 1
title: "Overview"
description: "The Stalwart WebUI: the administration interface at /admin and the Account Manager at /account, which URL to open, how sign-in works and what the WebUI needs to load."
---

The WebUI is the browser interface of a Stalwart server. Administrators use it to configure the server and inspect its operation, and users use it to manage their own accounts.

The WebUI is a web application served by the server itself. It is installed as an [Application](/docs/management/applications/), found in the WebUI under <!-- breadcrumb:Application --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M10 4v4" /><path d="M2 8h20" /><path d="M6 4v4" /></svg> Web Applications<!-- /breadcrumb:Application -->, and mounted at two paths:

- `/admin`, the administration interface, for configuring the server, managing accounts and domains, and inspecting its operation
- `/account`, the [Account Manager](/docs/management/webui/account-manager), in which users manage their own credentials and settings

Both paths serve the same bundle. After sign-in, each opens the first area the account may use, so an administrator lands in the administration screens and a user in the Account Manager. The WebUI is available in English only.

Because the WebUI is an ordinary Application, its installation, download location, update interval and unpack directory are settings of the Application object. [Applications](/docs/management/applications/) and [Updates](/docs/management/applications/update) describe them.

## URLs

The WebUI and the services it relies on are reached at these URLs:

| URL | Purpose |
|---|---|
| `https://<host>/admin` | Administration interface |
| `https://<host>/account` | Account Manager for users |
| `https://<host>/login` | The OAuth authorization page; it is opened by applications during sign-in and is not a page to bookmark |
| `https://<host>/jmap` | The JMAP API, used by the WebUI, the CLI and JMAP clients |

The first start is an exception. Before any administrator exists, the server runs in [bootstrap mode](/docs/configuration/bootstrap-mode) and serves the WebUI over plain HTTP on port 8080, reachable by IP address. This lets the setup wizard be completed before TLS certificates exist.

## Administration interface

The `/admin` interface is a front end to the server's configuration objects. Every form corresponds to an object, and saving the form sends a `set` call for that object through the management API. Anything done in a form can therefore also be done with the CLI or the API.

This documentation gives the location of each object in the WebUI, for example <!-- breadcrumb:Account --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg> Directory › Groups, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg> Directory › Accounts<!-- /breadcrumb:Account --> for accounts. The interface has two main areas:

- Management: the dashboard; accounts, groups, mailing lists, tenants, roles and OAuth clients; domains and DKIM signatures; the outbound queue, delivery history and delivery tests; received and sent DMARC, TLS and ARF reports; live tracing and logs; tasks and the index queue; cluster nodes; and [actions](/docs/management/tasks-actions/actions), such as reloading the settings or updating the applications.
- Settings: listeners, TLS, storage, authentication and directories, the MTA, the spam filter and the other server objects.

A search field at the top of the interface finds settings by name. An account that signs in at `/admin` without administrative permissions is sent to the Account Manager.

## Sign-in

The WebUI signs in through the server's built-in [OAuth server](/docs/auth/oauth/), like any other OAuth application: the user authenticates on the server's sign-in page, and the WebUI receives a token for the account.

As an installed application that ships an `oauth-client.json` document, the WebUI is a first-party client. The sign-in page shows its name and logo and asks for no consent, and the WebUI receives the full permissions of the account. Its client id is the static `oauthClientId` of the Application when one is set, and otherwise the URL of its client document, `https://<host>/<prefix>/oauth-client.json`. Set `oauthClientId` only for an external identity provider that does not support Client ID Metadata Documents ([Applications](/docs/management/applications/#bundle-format)).

The WebUI is recognised as a first-party client only on the server's trusted hosts: the host of its public https URL and the hostnames of the configured JMAP, CalDAV, CardDAV and WebDAV services. Opened on another hostname, sign-in fails. To use that hostname, either add it as a service hostname, or register an [OAuthClient](/docs/auth/oauth/clients) with `firstParty` enabled for it. In bootstrap and recovery mode, the WebUI works on any address on which it is opened.

Two cases change the sign-in page. When the user's domain is served by an [OpenID Connect directory](/docs/auth/backend/oidc), the WebUI signs in at the external identity provider instead ([Signing in to the WebUI](/docs/auth/backend/oidc#signing-in-to-the-webui)). Users with [two-factor authentication](/docs/auth/authentication/2fa) enter their code on the sign-in page.

## Access and listeners

The WebUI needs no listener of its own. It is served by every [NetworkListener](/docs/ref/object/network-listener) with the `http` protocol, found in the WebUI under <!-- breadcrumb:NetworkListener --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › Listeners<!-- /breadcrumb:NetworkListener -->, alongside JMAP, WebDAV and the `.well-known` endpoints.

Because every HTTP listener serves the WebUI, the administration interface is reachable wherever JMAP is. To expose it only internally, restrict `/admin` with [HTTP access control](/docs/http/access-control) and leave the other paths public.

## Loading failures

The WebUI depends on a bundle that the server downloads and unpacks, so it can fail while the rest of the server works. The two common failures have different causes.

### Outbound network requirement

The WebUI bundle is not part of the server binary. On the first start, the server downloads it from `https://github.com/stalwartlabs/webui/releases/download/v2/webui.zip`, the [`resourceUrl`](/docs/ref/object/application#resourceurl) of the default Application. The server stores the bundle and reuses it until [`autoUpdateInterval`](/docs/ref/object/application#autoupdateinterval) expires or an `UpdateApps` action forces a download.

The server therefore needs outbound HTTPS access to GitHub's release downloads. These are served from `github.com` and from the GitHub hosts that deliver release assets.

If the first download fails, there is no bundle to serve. Both `/admin` and `/account` then return `404 Not Found`, while the rest of the server works normally. This is a common symptom on new installations behind a restrictive firewall. There are two fixes:

- Allow the outbound access.
- Download the bundle separately, copy it to the server and set `resourceUrl` to its `file://` URL, for example `file:///var/lib/stalwart/webui.zip` ([Outbound network access](/docs/management/applications/#outbound-network-access)).

After one successful download, failed refreshes leave the WebUI in service.

### Missing files after sign-in

A WebUI that shows its sign-in page but reports, after sign-in, that it could not fetch or import a module has a different cause. The files in the [unpack directory](/docs/management/applications/#unpack-directory) have been deleted by a cleanup of `/tmp`, and the linked section describes the fix.
