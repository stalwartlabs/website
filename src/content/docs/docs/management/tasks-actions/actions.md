---
sidebar_position: 3
title: "Actions"
description: "On-demand management operations: reloading settings and certificates, updating applications, troubleshooting DMARC, classifying a message, clearing caches and pausing the queue."
---

An action asks the server to do something immediately: reload its settings, pick up a renewed certificate, pause the outbound queue, or test how a message would be authenticated or classified. Actions suit operations whose result the administrator wants at once, as opposed to the background jobs described in [Tasks](/docs/management/tasks-actions/tasks).

Each request creates an [Action](/docs/ref/object/action) object of one of the variants listed below. The object is found in the WebUI under <!-- breadcrumb:Action --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" /></svg> Actions<!-- /breadcrumb:Action -->. The server runs the action, returns any results in the response and keeps nothing. Actions are create-only, so the result is available only in the response to the `x:Action/set` call that created the action, and cannot be read later.

With the CLI, an action is created with `stalwart-cli create Action/<Variant>`. The following command reloads the settings:

```sh
stalwart-cli create Action/ReloadSettings
```

Through the management API, an action is an `x:Action/set` call with one `create` entry, whose `@type` names the variant and whose other fields are the input of the action. The following request runs the DMARC troubleshooting checks for a message from `192.0.2.25`:

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "using": ["urn:ietf:params:jmap:core", "urn:stalwart:jmap"],
    "methodCalls": [
      ["x:Action/set", {
        "create": {
          "a1": {
            "@type": "TroubleshootDmarc",
            "remoteIp": "192.0.2.25",
            "ehloDomain": "mx.example.net",
            "mailFrom": "alerts@example.net",
            "spfEhloDomain": "mx.example.net",
            "spfMailFromDomain": "example.net"
          }
        }
      }, "0"]
    ]
  }'
```

The response lists the action under `created`. The server fills in the result fields, which in this case hold the SPF, reverse DNS, DKIM, ARC and DMARC results:

```json
{
  "methodResponses": [
    ["x:Action/set", {
      "created": {
        "a1": {
          "id": "<id>",
          "spfEhloResult": {"@type": "Pass"},
          "spfMailFromResult": {"@type": "Pass"},
          "dmarcPass": true,
          "elapsed": 412
        }
      }
    }, "0"]
  ]
}
```

The response above is abbreviated. The [Action reference](/docs/ref/object/action) lists every result field of every variant.

## Variants

Each variant performs one operation, summarised in the table below. In a cluster, the variants that reload or clear state need a [coordinator](/docs/cluster/coordination/) to reach the other nodes. Without one, they apply only to the node that received the request.

| Variant | Effect |
|---|---|
| `ReloadSettings` | Reads the server settings from the data store again and applies them without a restart ([Reload settings](#reload-settings)). |
| `ReloadTlsCertificates` | Reloads the [Certificate](/docs/ref/object/certificate) objects, reading again the values stored in files, so that new or renewed certificates are used without a restart. |
| `ReloadLookupStores` | Reloads the lookup stores used by access lists, block lists and similar data sets. |
| `ReloadBlockedIps` | Reloads the list of blocked IP addresses. |
| `UpdateApps` | Downloads and unpacks every enabled [application](/docs/management/applications/update), including the WebUI. |
| `TroubleshootDmarc` | Runs the SPF, reverse DNS, DKIM, DKIM2, ARC and DMARC checks that the server applies to an incoming message, and returns their results. |
| `ClassifySpam` | Runs a message through the spam filter and returns its score, tags and result. |
| `InvalidateCaches` | Clears every in-memory cache, including the cached permissions of accounts. |
| `InvalidateNegativeCaches` | Clears only the cached negative results, such as failed DNS lookups. |
| `PauseMtaQueue` | Stops delivery attempts from the outbound queue; messages continue to be queued. |
| `ResumeMtaQueue` | Resumes delivery from the outbound queue. |

### Reload settings

Some settings are compiled into the running server, such as MTA rules, directories and authentication settings. A change to them takes effect only after `ReloadSettings`, which reads the settings from the data store again and applies them without a restart. The reload runs on every node when a [coordinator](/docs/cluster/coordination/) is configured, and on the node that receives the request otherwise.

Listener definitions are an exception. The reload validates them, but they take effect only after a restart ([Applying changes](/docs/configuration/#applying-changes)).

A reload that finds an error changes nothing and returns the errors, so the running configuration stays as it was. A successful reload returns the warnings it produced, such as license problems, in the result's [`warnings`](/docs/ref/object/action#warnings) field.

### Troubleshoot DMARC

`TroubleshootDmarc` answers the question of why a sender's mail passes or fails authentication. It replays, for a described message, the checks that the server would apply on receipt.

The caller describes the connection and the envelope of the message:

- `remoteIp`, `ehloDomain` and `mailFrom`, and optionally `rcptTo`
- The domains used for the SPF checks, `spfEhloDomain` and `spfMailFromDomain`
- Optionally the raw `message`

The message itself matters because the DKIM, ARC and DMARC checks work on its content: without it, they have no message to work on. The server returns the result of each check, the overall `dkimPass`, `dkim2Pass` and `dmarcPass` flags, the applicable `dmarcPolicy` and the `elapsed` time in milliseconds. The same checks are available in the WebUI's troubleshooting tools ([Troubleshooting](/docs/management/troubleshoot)).

### Classify spam

`ClassifySpam` shows how the spam filter would judge a message, without delivering it. The verdict depends on how the message arrived as well as on its content, so the caller supplies both: the raw `message`, and the context in which it would have been received. That context consists of `remoteIp`, `ehloDomain`, `mailFrom` with optional `mailFromParameters`, the `rcptTo` recipients, `isTls` and, for an authenticated submission, `authenticatedAs`.

The server returns the `score`, the `tags` that contributed to it and the `result`: `spam`, `ham`, `reject` or `discard`. When the [AI spam classifier](/docs/spamfilter/ai/) is enabled (Enterprise), the response also contains three fields about it: `aiGate`, which states whether the classifier was consulted or why it was skipped, the `aiFacts` sent to it, and its `aiVerdict`.

## Permissions

Creating an action requires two permissions: `sysActionCreate`, and the permission of its variant, `action<Variant>`, for example `actionReloadSettings` or `actionClassifySpam`. The default System Administrator role holds all of them.

The per-variant permissions allow finer delegation. A custom role can allow individual actions by granting `sysActionCreate` and the permissions of the chosen variants only, so an operator could be allowed to classify messages without being able to pause the queue. Because actions are not stored, there are no permissions to read, list or delete them.
