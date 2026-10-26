---
sidebar_position: 2
title: "Updates"
description: "How Stalwart keeps installed web applications up to date: the bundle cache, its expiry, and forcing an update with the UpdateApps action."
---

The publisher of an installed [application](/docs/management/applications/) releases new versions over time, and the server has to fetch them to serve them. An application is updated by downloading its bundle again from its `resourceUrl`.

The server does not check for new releases on a schedule. It keeps the downloaded bundle for a set time and downloads it again only when the stored copy has expired. An administrator can also force a download at any time with an action. Together, the two mechanisms let the administrator choose between picking up releases automatically and controlling exactly when a new release goes live. Both are configured per [Application](/docs/ref/object/application) object, found in the WebUI under <!-- breadcrumb:Application --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M10 4v4" /><path d="M2 8h20" /><path d="M6 4v4" /></svg> Web Applications<!-- /breadcrumb:Application -->.

## Bundle expiry

A downloaded bundle is stored in the blob store and reused each time the application is unpacked. A server that has fetched an application once therefore does not contact its [`resourceUrl`](/docs/ref/object/application#resourceurl) again at restart.

[`autoUpdateInterval`](/docs/ref/object/application#autoupdateinterval) sets how long the stored copy is kept. The default is <!-- default:Application.autoUpdateInterval -->90 days<!-- /default -->, for the WebUI as for any other application. After that time, the server removes the stored bundle, and the next unpack downloads a new copy.

Expiry does not trigger a download by itself. Nothing polls the publisher, and the stored bundle is not compared with the remote one. An expired copy causes a download only at the next unpack, which happens in three situations: when the server starts, when the Application object is changed, and when an `UpdateApps` action runs.

The interval is therefore a choice between freshness and stability. A shorter interval picks up new releases sooner, at the next restart after it expires. A longer one keeps an application on its current release until it is updated deliberately. To install a new release at a chosen moment, whatever the interval, run `UpdateApps`.

## Update applications now

The `UpdateApps` variant of the [Action](/docs/ref/object/action) object, found in the WebUI under <!-- breadcrumb:Action --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" /></svg> Actions<!-- /breadcrumb:Action -->, downloads and unpacks every enabled application immediately, whether or not its stored bundle has expired. It is the only way to install a new release without restarting the server. The action has no fields to select an application, so it always applies to all applications at once.

With the CLI, the action is created with this command:

```sh
stalwart-cli create Action/UpdateApps
```

Through the management API, the same action is an `x:Action/set` call that creates an object of type `UpdateApps`. It requires the `sysActionCreate` and `actionUpdateApps` [permissions](/docs/ref/permissions):

```json
{
  "using": ["urn:ietf:params:jmap:core", "urn:stalwart:jmap"],
  "methodCalls": [
    ["x:Action/set", {
      "create": {
        "a1": {"@type": "UpdateApps"}
      }
    }, "0"]
  ]
}
```

## Update procedure

An unpack proceeds in the same way whether it runs at startup, after a change to the Application object or for an `UpdateApps` action. Disabled applications are skipped. For each enabled application, the server performs these steps:

1. It takes the bundle from the blob store, or downloads it from `resourceUrl` when no stored copy exists. An `UpdateApps` action always downloads it.
2. It unpacks the bundle into a new directory under [`unpackDirectory`](/docs/ref/object/application#unpackdirectory), creating the directory if needed, and adjusts `index.html` for the mount path.
3. It switches the application's mount paths to the new files and deletes the directory of the previous version.

The order of these steps protects the running application. If the download fails, the archive is invalid or `unpackDirectory` cannot be written, the server logs the error and the previous version remains in service, so a failed update does not take an application offline. The stored bundle is also replaced only after the new one has been unpacked, so a failed update does not affect the copy used at the next restart.

The bundle is not verified with a checksum or signature ([Applications](/docs/management/applications/)).
