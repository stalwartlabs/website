---
sidebar_position: 1
title: "Overview"
---

Stalwart can download and host one or more single-page applications (SPAs) directly from the server. Each hosted application is configured on the [Application](/docs/ref/object/application) object (found in the WebUI under <!-- breadcrumb:Application --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M10 4v4" /><path d="M2 8h20" /><path d="M6 4v4" /></svg> Web Applications<!-- /breadcrumb:Application -->) and is served alongside the regular HTTP endpoints, without the need for a separate web server or reverse proxy in front.

The built-in [WebUI](/docs/management/webui/) is itself an Application: a single bundle mounted at both `/admin` (the administration console) and `/account` (the user self-service portal). Operators can register additional Applications on the same server, for example third-party management dashboards or self-hosted front-ends for the JMAP, CalDAV, CardDAV, and WebDAV stacks.

## What an Application is

An Application is a static SPA bundle, distributed as a zip archive, that the server downloads and unpacks locally. Once unpacked, the server serves the application's files in response to HTTP requests whose path matches one of the configured mount paths. The bundle is identified by the [`resourceUrl`](/docs/ref/object/application#resourceurl) field, which points to the archive that will be fetched (for example the latest GitHub release of the WebUI), and by the [`description`](/docs/ref/object/application#description) field, which carries a short human-readable label used in the management interfaces.

Individual Applications can be disabled without removing them from the configuration by clearing the [`enabled`](/docs/ref/object/application#enabled) flag. A disabled Application is not downloaded and is not served, but its configuration is retained.

## Mount paths

Each Application is mounted at one or more URL path prefixes, listed on the [`urlPrefix`](/docs/ref/object/application#urlprefix) field. The server matches incoming HTTP requests against the configured prefixes and routes them to the corresponding bundle. A single Application may declare multiple prefixes, which is how the WebUI is exposed at both `/admin` and `/account` from the same deployment.

Mount paths are local to the server's HTTP namespace and must not collide with the API endpoints used by JMAP, WebDAV, or the `.well-known` URIs. A path collision between two Applications, or between an Application and a server-provided endpoint, is rejected at configuration time.

The unpacked bundle is written to a working directory on the local filesystem. By default this directory is chosen automatically (typically `/tmp`), but it can be pinned through the [`unpackDirectory`](/docs/ref/object/application#unpackdirectory) field when the default temporary location is not suitable, for example on systems where `/tmp` is mounted `noexec` or cleared aggressively between restarts.

## Relationship to listeners

Applications are served over HTTP traffic, but they do not themselves open sockets. The sockets are owned by the [NetworkListener](/docs/ref/object/network-listener) object (found in the WebUI under <!-- breadcrumb:NetworkListener --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › Listeners<!-- /breadcrumb:NetworkListener -->). Any listener configured with the [`protocol`](/docs/ref/object/network-listener#protocol) variant set to `http` will route requests whose path matches a registered mount to the corresponding Application. In a typical deployment a single HTTPS listener carries the JMAP, WebDAV, and Application traffic together; no per-Application listener is required.

When [access control](/docs/http/access-control) rules are in force, requests to Application mount paths are filtered alongside the rest of the HTTP surface. Operators restricting public exposure can therefore confine an Application (for example `/admin`) to a private listener while leaving the remaining HTTP endpoints reachable over the public one.

## Installing an Application

An Application is installed by creating an [Application](/docs/ref/object/application) record with the bundle's download URL in [`resourceUrl`](/docs/ref/object/application#resourceurl), the desired mount paths in [`urlPrefix`](/docs/ref/object/application#urlprefix), and a short [`description`](/docs/ref/object/application#description). The server then fetches the archive on the schedule described on the [Updates](/docs/applications/update) page, unpacks it into the working directory, and begins serving the files. The same workflow is exposed through the WebUI, through `stalwart-cli`, and directly over the JMAP API on the `x:Application/set` method.

## Outbound network requirement

Each Application's bundle is fetched over HTTPS from the [`resourceUrl`](/docs/ref/object/application#resourceurl) configured on its record, so outbound HTTPS connectivity from the Stalwart host to that URL is a hard requirement for the Application to be served. When the very first download of an Application fails, no previously installed bundle exists to fall back to and HTTP requests against the Application's mount paths return `404 Not Found` until the next refresh succeeds.

For deployments behind a restrictive egress firewall, the firewall must allow HTTPS from the Stalwart host to whatever hosts serve each configured `resourceUrl`. When outbound internet access is not permitted at all, the bundle can be staged on an internal HTTPS server and the [`resourceUrl`](/docs/ref/object/application#resourceurl) field updated to point at the internal location, after which the server refreshes from there instead.

The bundle URL of the built-in WebUI and the specific symptom that misconfiguring this requirement produces are documented under the [WebUI overview](/docs/management/webui/#outbound-network-requirement).

## Bundle format

An Application bundle is a `.zip` archive that must contain an `index.html` at its root. When the archive is unpacked, the server rewrites the `<base href="/">` tag in `index.html` to match the mount path the bundle is served from, so the same archive can be mounted at `/admin`, `/account`, or any other prefix without being repackaged. Assets referenced by relative URLs inside the bundle therefore resolve correctly regardless of the mount path.

No checksum or signature verification is performed on the downloaded archive. Applications are intended to be installed from trusted sources only; the transport is always HTTPS, but the contents of the bundle are not cryptographically validated against an external manifest.

:::warning

Because no bundle-level signature is checked, only install Applications whose [`resourceUrl`](/docs/ref/object/application#resourceurl) points at a source operated by a trusted publisher. A malicious bundle served from a hostile origin would be unpacked and served just like any other Application.

:::

## Multiple mount paths for a single Application

The built-in WebUI is modelled as one Application with two entries in [`urlPrefix`](/docs/ref/object/application#urlprefix), `/admin` and `/account`; the prefixes are URL-path aliases for the same bundle rather than two separate installations. Additional Applications can follow the same pattern when several aliases need to resolve to the same files.
