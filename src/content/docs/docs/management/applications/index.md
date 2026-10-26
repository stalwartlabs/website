---
sidebar_position: 1
title: "Overview"
description: "Web applications served by Stalwart: how bundles are installed and mounted, the unpack directory, the bundle format, and the OAuth client document that makes an application a first-party client."
---

A mail server often needs web interfaces next to it: an administration console, a webmail client, a dashboard. Serving them usually means running and securing a separate web server. Stalwart can take that role itself. It downloads single-page web applications and serves them from its own HTTP listeners, without a separate web server.

The [WebUI](/docs/management/webui/) is delivered this way, and other applications, such as a webmail client or a management dashboard, can be installed alongside it. An installed application is also trusted by the built-in OAuth server as a first-party client. It therefore signs users in without a consent screen and receives full access to their accounts.

Each application is an [Application](/docs/ref/object/application) object, found in the WebUI under <!-- breadcrumb:Application --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M10 4v4" /><path d="M2 8h20" /><path d="M6 4v4" /></svg> Web Applications<!-- /breadcrumb:Application -->. The default installation contains one, for the WebUI, mounted at `/admin` and `/account`.

## Applications

An application is a static bundle: a zip archive that holds the files of a single-page application. The server downloads the archive from [`resourceUrl`](/docs/ref/object/application#resourceurl), which is a required field, unpacks it locally and serves it. Every request whose path starts with one of the application's mount paths is answered from the bundle.

Two further fields describe the application in the management interfaces. [`description`](/docs/ref/object/application#description) is the name shown there. [`enable`](/docs/ref/object/application#enable) decides whether the application is in use: clearing it keeps the configuration but stops the application from being downloaded or served.

To install an application, create an Application object with these fields, in the WebUI, with `stalwart-cli` or through `x:Application/set`. The server then downloads the archive, unpacks it and starts serving it. [Updates](/docs/management/applications/update) describes how the bundle is refreshed later. The following object installs a webmail client at `/webmail`:

```json
{
  "description": "Webmail",
  "resourceUrl": "https://downloads.example.com/webmail/latest.zip",
  "urlPrefix": {"/webmail": true},
  "unpackDirectory": "/var/lib/stalwart/apps"
}
```

The bundle is downloaded over HTTPS, but its contents are not verified with a checksum or signature.

:::caution
Install applications only from trusted publishers. Because nothing is verified, a bundle from a hostile source is unpacked and served like any other, on the server's own hosts.
:::

## Mount paths

A mount path is the URL prefix under which an application is served. [`urlPrefix`](/docs/ref/object/application#urlprefix) lists these paths, and every request whose path starts with one of them is answered from the bundle. One application can have several prefixes, which all serve the same files. The WebUI uses this to appear in two places: `/admin` for the administration interface and `/account` for the Account Manager.

Each prefix must be a single path segment, such as `/admin` or `/webmail`, made of letters, digits, `-`, `.`, `_` or `~`. Leading and trailing slashes are removed. Saving an Application refuses several kinds of prefix:

- A prefix with several segments, such as `/stalwart/admin`
- An empty prefix, and `/`
- A prefix with percent-encoded characters or spaces

The refusal reads "URL prefixes must be a single non-empty path segment such as "/admin", made of letters, digits, '-', '.', '_' or '~'".

The server's own endpoints also live under top-level paths, so their prefixes are reserved. These prefixes are refused without regard to case, with "This URL prefix is reserved for a built-in server endpoint": `jmap`, `dav`, `.well-known`, `auth`, `scim`, `api`, `mail`, `calendar`, `autodiscover`, `robots.txt`, `healthz`, `metrics`, `logo`, `form`, `login` and `device`. An existing Application that uses one of them must be given another prefix before it can be saved again.

Requests for top-level paths that belong neither to an application nor to a server endpoint are treated as suspicious. They count as scanning attempts for the [automatic ban](/docs/server/auto-ban) of the client's address.

## Unpack directory

The server does not serve the archive directly. It unpacks the bundle into a working directory on the local file system, set by [`unpackDirectory`](/docs/ref/object/application#unpackdirectory). When the field is empty, the server uses the system temporary directory, which on Linux is `/tmp`.

That default causes intermittent failures on hosts that clean `/tmp` periodically. `systemd-tmpfiles-clean` deletes files by access time. Most files of a single-page application are loaded only by particular screens, so those files are deleted after some time, while the entry page and the sign-in page remain. The WebUI then works until a user opens a screen that has not been served for a while, and the browser reports that it could not fetch a dynamically imported module. A restart unpacks the bundle again and hides the problem until the next cleanup. Wherever `/tmp` is cleaned, set `unpackDirectory` to a persistent path, such as `/var/lib/stalwart/webui`.

The server creates the directory and any missing parents as the user it runs as, which is `stalwart` on a package installation. A directory under `/var/lib` owned by `root` therefore fails until its ownership is corrected.

The server manages the contents of the directory itself, which means that a bundle extracted into `unpackDirectory` by hand is never served. To install a bundle without outbound access to its publisher, copy the `.zip` to the server instead and set `resourceUrl` to a `file://` URL with its absolute path, such as `file:///var/lib/stalwart/webui.zip`. The file must be readable by the user the server runs as and, in a cluster, present on every node.

## Outbound network access

The server downloads the bundle from `resourceUrl` when the application is first unpacked, so it needs outbound HTTPS access to that URL. If the first download fails, there is no bundle to serve, and requests to the application's mount paths return `404 Not Found` until a later download succeeds. Once a bundle has been unpacked, failed refreshes leave it in service.

Behind a restrictive egress firewall, there are two ways to proceed. Either allow HTTPS from the server to the host of each `resourceUrl`, or copy the bundles to the server and refer to them with `file://` URLs, as described above.

## Listeners and access control

Applications need no listener of their own. They are served by every [NetworkListener](/docs/ref/object/network-listener) with the `http` protocol, found in the WebUI under <!-- breadcrumb:NetworkListener --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › Listeners<!-- /breadcrumb:NetworkListener -->.

[HTTP access control](/docs/http/access-control) rules apply to the mount paths as to any other path. An application such as `/admin` can therefore be restricted to an internal listener while the other HTTP services remain public.

## Bundle format

A bundle is a `.zip` archive with two files at its root: an `index.html` and a manifest named `stalwart-app.json`. The manifest identifies the application to the server. It is a JSON object of at most 4 KiB with the application's `id` and `version`, and optionally `minServerVersion`, the oldest Stalwart version the bundle works with:

```json
{
  "id": "webui",
  "version": "2.0.0",
  "minServerVersion": "1.0.0"
}
```

The server checks the manifest before it unpacks a bundle. It rejects the bundle, and logs a `resource.error` event, in these cases:

- The manifest is missing (`Application bundle does not contain a manifest`), too large or not valid.
- `minServerVersion` is newer than the running server (`Incompatible application bundle: <id> version <version> requires Stalwart <version> or later, running <version>`).
- The bundle is a WebUI bundle (`id` `webui`) whose major version is not 2.

When the bundle is unpacked, the server adjusts `index.html` to the mount path. It rewrites the `<base href="/">` tag to the prefix, so the same archive can be served at any prefix, and assets referenced by relative URLs resolve correctly.

The server also fills the placeholder `<meta name="oauth-client-id" content="">` in `index.html` with the Application's [`oauthClientId`](/docs/ref/object/application#oauthclientid). This decides which OAuth client id the application uses. An application that finds a value there uses it as its static OAuth client id. Otherwise, it uses the URL of its client document, described below.

Set `oauthClientId` only when the application signs in through an external OpenID Connect provider that does not support Client ID Metadata Documents ([Client id of the WebUI](/docs/auth/backend/oidc#client-id-of-the-webui)). The application then uses the static id for every sign-in, including sign-ins through Stalwart's own authorization server. That server answers "Unknown client id" for the static id unless a first-party [OAuthClient](/docs/auth/oauth/clients) with that id exists.

### OAuth client document

An OAuth client normally has to be registered with the authorization server before it can sign users in. A Client ID Metadata Document avoids that step: the client's id is a URL, and the document at that URL describes the client. Stalwart applications use this mechanism, and the bundle supplies the document.

A bundle can contain an `oauth-client.json` file at its root. The file is a template of the application's OAuth client metadata, in the format of a [Client ID Metadata Document](/docs/auth/oauth/client-metadata-documents) but with relative URIs. The server serves it, completed for the requesting host, at `/<prefix>/oauth-client.json`, and the URL of that document is the application's OAuth client id. The template contains these members:

- `redirect_uris` (required): 1 to 16 relative paths, for example `oauth/callback`.
- `post_logout_redirect_uris` (optional): relative paths to which the end-session endpoint `/auth/logout` may return the user after sign-out.
- `client_name` (optional): at most 256 bytes without control or bidirectional override characters, shown in the header of the sign-in page.
- `client_uri` and `logo_uri` (optional): each a relative path or an https URL. A relative `logo_uri` must exist in the bundle and is shown on the sign-in page.
- `scope`, `software_id` and `software_version` (optional)

The template is validated strictly. Relative paths must not contain `.` or `..` segments, not even in percent-encoded form, and absolute URIs are refused in the redirect lists. The template must not contain `client_id`, `client_secret`, `jwks` or `jwks_uri`, and the completed document must not exceed 5 KB. An invalid template makes the whole bundle fail to unpack.

When serving the document, the server completes the template:

- It sets `client_id` to the document's own URL.
- It turns the redirect URIs into absolute URIs on the requesting host and mount path.
- It sets `token_endpoint_auth_method` to `none`, `grant_types` to the authorization code and refresh token grants, and `response_types` to `code`.

The document is served without authentication, with permissive CORS headers and without caching. External identity providers that support Client ID Metadata Documents fetch it from there.

The WebUI's template contains, among other members:

```json
{
  "client_name": "Stalwart Web Interface",
  "client_uri": "https://stalw.art",
  "logo_uri": "logo.svg",
  "redirect_uris": ["oauth/callback"],
  "post_logout_redirect_uris": ["login"]
}
```

Served at `/admin` on `mail.example.com`, this template yields the client id `https://mail.example.com/admin/oauth-client.json`, the redirect URI `https://mail.example.com/admin/oauth/callback` and the post-logout URI `https://mail.example.com/admin/login`. A post-logout URI presented by the application must match exactly, without a trailing slash, query, change of case or explicit default port.

### First-party sign-in

The built-in OAuth server recognises `https://<host>/<prefix>/oauth-client.json` as the client id of the installed application. It reads the template from the bundle, so it never fetches the document over the network and keeps no OAuthClient for it.

Such an application is a first-party client, and it is treated with more trust than other clients. The sign-in page shows its name and logo in the header and no consent screen, and its tokens carry the full permissions of the account ([OAuth clients](/docs/auth/oauth/clients#first-party-clients)).

This trust is limited to known hostnames. The document is served, and the application recognised, only on trusted hosts:

- The host of the server's public https URL, port included
- The hostnames of the configured JMAP, CalDAV, CardDAV and WebDAV services

Hosts are matched exactly. On any other host, the document returns `404` and the application is not a first-party client. To use another hostname, either add it as a service hostname, or register an OAuthClient with `firstParty` enabled and explicit redirect URIs.

Bootstrap and recovery mode relax this rule. There, any origin is accepted, including `http://`, IP addresses and ports, provided it is the origin on which the sign-in request arrived.
