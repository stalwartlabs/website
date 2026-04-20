---
sidebar_position: 2
---

# Updates

Hosted applications in Stalwart are kept current through a combination of scheduled background checks and on-demand triggers. Each [Application](/docs/ref/object/application) (found in the WebUI under <!-- breadcrumb:Application --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M10 4v4" /><path d="M2 8h20" /><path d="M6 4v4" /></svg> Web Applications<!-- /breadcrumb:Application -->) is refreshed on its own cadence, and the refresh can also be forced at any time through the [Action](/docs/ref/object/action) object (found in the WebUI under <!-- breadcrumb:Action --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" /></svg> Actions<!-- /breadcrumb:Action -->).

## Scheduled updates

Every Application carries an [`autoUpdateFrequency`](/docs/ref/object/application#autoupdatefrequency) field, which controls how often the server checks its [`resourceUrl`](/docs/ref/object/application#resourceurl) for a newer bundle. The field is a duration; the default value is `90d`, so an unmodified installation revisits each Application's download URL roughly once per quarter. Shorter values tighten the refresh loop at the cost of more frequent downloads; longer values pin an Application to a given release for longer stretches.

The schedule is per-Application, so the built-in WebUI and any additional Applications can follow different refresh policies. When the frequency elapses, the server fetches the bundle, compares it against the currently installed version, and applies it if a newer one is available. If the remote resource has not changed since the last successful check, the server leaves the unpacked files in place.

## On-demand updates

A refresh can also be forced outside the scheduled cadence by triggering the `UpdateApps` variant of the [Action](/docs/ref/object/action) object. Creating an Action record with this variant instructs the server to run the same update procedure immediately, for every enabled Application, without waiting for the next scheduled tick.

The trigger is exposed through every management surface:

- From the [WebUI](/docs/management/webui/overview), administrators invoke the action from the management section dedicated to server actions. The interface creates the corresponding `UpdateApps` Action and reports on its outcome.
- From the [CLI](/docs/management/cli/overview), the same operation is issued as a standard `stalwart-cli` command against the Action object. `stalwart-cli create action/update-apps` submits the request to the server.
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

The update procedure is identical whether it was triggered by the schedule or by an `UpdateApps` Action. For each enabled Application the server:

1. Downloads the bundle from the configured [`resourceUrl`](/docs/ref/object/application#resourceurl) over HTTPS.
2. Unpacks the archive into the working directory selected by [`unpackDirectory`](/docs/ref/object/application#unpackdirectory), rewriting the `<base href>` in `index.html` to match the mount path.
3. Swaps the live mount over to the newly unpacked files so that subsequent HTTP requests for the Application's [`urlPrefix`](/docs/ref/object/application#urlprefix) entries are served from the new version.

No checksum or signature verification is performed on the downloaded bundle; see the [bundle format](/docs/applications/overview#bundle-format) section for the security implications. A malformed archive or an unreachable download is logged and leaves the previously installed bundle in service, so a failed update does not take an Application offline.

Disabled Applications (those with [`enabled`](/docs/ref/object/application#enabled) set to `false`) are skipped during both scheduled and on-demand runs. An `UpdateApps` Action always refreshes every enabled Application in a single run; the variant has no fields to limit the operation to a single Application.
