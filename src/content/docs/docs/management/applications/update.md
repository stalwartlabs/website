---
sidebar_position: 2
title: "Updates"
---

Hosted applications in Stalwart are kept current by an on-demand refresh and a cache that expires on a configurable schedule. Each [Application](/docs/ref/object/application) (found in the WebUI under <!-- breadcrumb:Application --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M10 4v4" /><path d="M2 8h20" /><path d="M6 4v4" /></svg> Web Applications<!-- /breadcrumb:Application -->) is refreshed on its own cadence, and the refresh can also be forced at any time through the [Action](/docs/ref/object/action) object (found in the WebUI under <!-- breadcrumb:Action --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" /></svg> Actions<!-- /breadcrumb:Action -->).

## Bundle expiry

A downloaded bundle is kept in the blob store and reused on every subsequent unpack, so a server that has already fetched an Application does not contact its [`resourceUrl`](/docs/ref/object/application#resourceurl) again on restart. The [`autoUpdateFrequency`](/docs/ref/object/application#autoupdatefrequency) field is a duration that sets how long that cached copy is retained. Once it elapses the maintenance task purges the bundle, and the next unpack downloads a fresh copy.

The field defaults to `90d`; the built-in WebUI record is seeded with `30d`. The setting is per-Application, so the WebUI and any additional Applications can be pinned to different retention periods. Shorter values mean more frequent downloads; longer values hold an Application on a given release until it is refreshed by hand.

The server does not poll on a timer, and it does not compare the remote bundle against the installed one. An expired cache only causes a download the next time an unpack runs, which happens when the server starts, when the Application record is edited, and when an `UpdateApps` Action is triggered. To pick up a new release at a predictable moment, trigger `UpdateApps`.

## On-demand updates

A refresh is forced by triggering the `UpdateApps` variant of the [Action](/docs/ref/object/action) object. Creating an Action record with this variant instructs the server to download and unpack every enabled Application immediately, ignoring the cached bundle and whatever remains of its retention period. This is the only way to pick up a new release without restarting the server.

The trigger is exposed through every management surface:

- From the [WebUI](/docs/management/webui/), administrators invoke the action from the management section dedicated to server actions. The interface creates the corresponding `UpdateApps` Action and reports on its outcome.
- From the [CLI](/docs/management/cli/), the same operation is issued as a standard `stalwart-cli` command against the Action object. `stalwart-cli create action/update-apps` submits the request to the server.
- Over the JMAP API, administrators with the `sysActionCreate` and `actionUpdateApps` [permissions](/docs/ref/permissions) submit an `x:Action/set` call whose `create` entry carries `{"@type": "UpdateApps"}`:

```json
{
  "using": ["urn:ietf:params:jmap:core", "urn:stalwart:jmap"],
  "methodCalls": [
    ["x:Action/set", {
      "create": {
        "new1": { "@type": "UpdateApps" }
      }
    }, "c1"]
  ]
}
```

## What happens during an update

The unpack procedure is identical whether it ran at startup, after an edit to the Application record, or from an `UpdateApps` Action. For each enabled Application the server:

1. Takes the bundle from the blob store, or downloads it from the configured [`resourceUrl`](/docs/ref/object/application#resourceurl) over HTTPS when the cache is empty. An `UpdateApps` Action always downloads.
2. Unpacks the archive into a new directory under [`unpackDirectory`](/docs/ref/object/application#unpackdirectory), rewriting the `<base href>` in `index.html` to match the mount path. The directory is created if it does not exist, so `unpackDirectory` may name a path several levels deep, but the server has to be able to write there.
3. Swaps the live mount over to the newly unpacked files so that subsequent HTTP requests for the Application's [`urlPrefix`](/docs/ref/object/application#urlprefix) entries are served from the new version, then deletes the directory the previous version was served from.

No checksum or signature verification is performed on the downloaded bundle; see the [bundle format](/docs/management/applications/#bundle-format) section for the security implications. A malformed archive, an unreachable download, or an unwritable `unpackDirectory` is logged and leaves the previously unpacked bundle mounted, so a failed update does not take an Application offline. The cached bundle is likewise only replaced once the new one has unpacked, so a failed update cannot poison the copy the next restart will use.

Disabled Applications (those with [`enabled`](/docs/ref/object/application#enabled) set to `false`) are skipped. An `UpdateApps` Action always refreshes every enabled Application in a single run; the variant has no fields to limit the operation to a single Application.
