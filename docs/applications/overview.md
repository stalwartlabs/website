---
sidebar_position: 1
---

# Overview

Stalwart can download and host one or more single-page applications (SPAs) directly from the server. Each hosted application is configured on the [Application](/docs/ref/object/application) object (found in the WebUI under <!-- breadcrumb:Application --><!-- /breadcrumb:Application -->) and is served alongside the regular HTTP endpoints, without the need for a separate web server or reverse proxy in front.

The built-in [WebUI](/docs/management/webui/overview) is itself an Application: it ships as two hosted bundles mounted at `/admin` (the administration console) and `/account` (the user self-service portal). Operators can register additional Applications on the same server, for example third-party management dashboards or self-hosted front-ends for the JMAP, CalDAV, CardDAV, and WebDAV stacks.

## What an Application is

An Application is a static SPA bundle, distributed as a zip archive, that the server downloads, verifies, and unpacks locally. Once unpacked, the server serves the application's files in response to HTTP requests whose path matches one of the configured mount paths. The bundle is identified by the [`resourceUrl`](/docs/ref/object/application#resourceurl) field, which points to the archive that will be fetched (for example the latest GitHub release of the WebUI), and by the [`description`](/docs/ref/object/application#description) field, which carries a short human-readable label used in the management interfaces.

Individual Applications can be disabled without removing them from the configuration by clearing the [`enabled`](/docs/ref/object/application#enabled) flag. A disabled Application is not downloaded and is not served, but its configuration is retained.

## Mount paths

Each Application is mounted at one or more URL path prefixes, listed on the [`urlPrefix`](/docs/ref/object/application#urlprefix) field. The server matches incoming HTTP requests against the configured prefixes and routes them to the corresponding bundle. A single Application may declare multiple prefixes, which is how the WebUI is exposed at both `/admin` and `/account` from the same deployment.

Mount paths are local to the server's HTTP namespace and must not collide with the API endpoints used by JMAP, WebDAV, or the `.well-known` URIs. A path collision between two Applications, or between an Application and a server-provided endpoint, is rejected at configuration time.

The unpacked bundle is written to a working directory on the local filesystem. By default this directory is chosen automatically (typically `/tmp`), but it can be pinned through the [`unpackDirectory`](/docs/ref/object/application#unpackdirectory) field when the default temporary location is not suitable, for example on systems where `/tmp` is mounted `noexec` or cleared aggressively between restarts.

## Relationship to listeners

Applications are served over HTTP traffic, but they do not themselves open sockets. The sockets are owned by the [NetworkListener](/docs/ref/object/network-listener) object (found in the WebUI under <!-- breadcrumb:NetworkListener --><!-- /breadcrumb:NetworkListener -->). Any listener configured with the [`protocol`](/docs/ref/object/network-listener#protocol) variant set to `http` will route requests whose path matches a registered mount to the corresponding Application. In a typical deployment a single HTTPS listener carries the JMAP, WebDAV, and Application traffic together; no per-Application listener is required.

When [access control](/docs/http/access-control) rules are in force, requests to Application mount paths are filtered alongside the rest of the HTTP surface. Operators restricting public exposure can therefore confine an Application (for example `/admin`) to a private listener while leaving the remaining HTTP endpoints reachable over the public one.

## Installing an Application

An Application is installed by creating an [Application](/docs/ref/object/application) record with the bundle's download URL in [`resourceUrl`](/docs/ref/object/application#resourceurl), the desired mount paths in [`urlPrefix`](/docs/ref/object/application#urlprefix), and a short [`description`](/docs/ref/object/application#description). The server then fetches the archive on the schedule described on the [Updates](/docs/applications/update) page, verifies it, unpacks it into the working directory, and begins serving the files. The same workflow is exposed through the WebUI, through `stalwart-cli`, and directly over the JMAP API on the `x:Application/set` method.

<!-- review: Confirm the bundle format (zip) and the verification step performed during download. The Application schema does not expose a checksum or signature field; if verification is based on the transport (HTTPS of `resourceUrl`) rather than on a bundle-level signature, clarify here. -->

<!-- review: Verify that the two WebUI bundles are modelled as a single Application with two `urlPrefix` entries (`/admin`, `/account`) rather than as two separate Application records. The user-facing description assumes the former. -->
