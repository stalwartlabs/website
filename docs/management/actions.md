---
sidebar_position: 4
---

# Actions

An Action is a server management operation triggered on demand. Unlike a scheduled [Task](/docs/management/tasks), an Action runs immediately in response to an administrator request: reloading configuration, flushing caches, pausing the outbound queue, running a troubleshooting probe, or classifying a message through the spam filter. Each invocation is represented as an [Action](/docs/ref/object/action) object (found in the WebUI under <!-- breadcrumb:Action --><!-- /breadcrumb:Action -->) of one of the variants described below.

Actions can be created from the [WebUI](/docs/management/webui/overview), through the [CLI](/docs/management/cli/overview) using `stalwart-cli create action/<variant-name>`, or over the JMAP API through the `x:Action/set` method on the [Action](/docs/ref/object/action) object. The server records each Action so that results, such as the spam classification score or a DMARC troubleshooting report, can be retrieved afterwards with `x:Action/get` or `stalwart-cli get action <id>`.

## Variants

Variants that require input fields, such as a message body or a remote IP, carry those fields alongside the variant identifier; the full schema for each is on the reference page.

### Reload settings

The `ReloadSettings` variant rereads the server settings from the data store without restarting the process. No input fields are required.

### Reload TLS certificates

The `ReloadTlsCertificates` variant reloads TLS certificates from disk or from the configured ACME store so that renewals take effect without a restart. No input fields are required.

### Reload lookup stores

The `ReloadLookupStores` variant refreshes the lookup stores backing access lists, blocklists, and similar in-memory datasets. No input fields are required.

### Reload blocked IPs

The `ReloadBlockedIps` variant reloads the blocked IP list applied by the inbound filters. No input fields are required.

### Update applications

The `UpdateApps` variant installs pending updates for the hosted web [Applications](/docs/ref/object/application), such as the WebUI bundle. No input fields are required. Spam-filter rule updates are handled separately through the asynchronous `SpamFilterMaintenance` variant of [Task](/docs/ref/object/task).

### Troubleshoot DMARC

The `TroubleshootDmarc` variant runs the same SPF, DKIM, ARC, and DMARC checks that the server applies to an incoming message. The caller supplies the [`remoteIp`](/docs/ref/object/action#remoteip), the [`ehloDomain`](/docs/ref/object/action#ehlodomain), the [`mailFrom`](/docs/ref/object/action#mailfrom) address, the [`spfEhloDomain`](/docs/ref/object/action#spfehlodomain) and [`spfMailFromDomain`](/docs/ref/object/action#spfmailfromdomain) used for the SPF checks, and an optional [`message`](/docs/ref/object/action#message) body. The server populates the per-check results (SPF, reverse DNS, DKIM, ARC, DMARC), the overall DKIM and DMARC pass flags, the applied [`dmarcPolicy`](/docs/ref/object/action#dmarcpolicy), and the [`elapsed`](/docs/ref/object/action#elapsed) time.

### Classify spam

The `ClassifySpam` variant submits a raw message to the spam filter and returns the resulting score, tags, and overall classification. The caller supplies the raw [`message`](/docs/ref/object/action#message) together with the envelope context: [`remoteIp`](/docs/ref/object/action#remoteip), [`ehloDomain`](/docs/ref/object/action#ehlodomain), optional [`authenticatedAs`](/docs/ref/object/action#authenticatedas) identity, [`isTls`](/docs/ref/object/action#istls) flag, [`envFrom`](/docs/ref/object/action#envfrom) address with optional [`envFromParameters`](/docs/ref/object/action#envfromparameters), and the list of [`envRcptTo`](/docs/ref/object/action#envrcptto) recipients. The server populates the numeric [`score`](/docs/ref/object/action#score), the map of contributing [`tags`](/docs/ref/object/action#tags), and the final [`result`](/docs/ref/object/action#result): spam, ham, reject, or discard.

### Invalidate caches

The `InvalidateCaches` variant clears all in-memory caches. No input fields are required.

### Invalidate negative caches

The `InvalidateNegativeCaches` variant clears only negative cache entries, such as failed DNS lookups or missing-record results, leaving positive cache entries in place. No input fields are required.

### Pause the outbound queue

The `PauseMtaQueue` variant pauses outbound MTA queue processing. Messages continue to accumulate but delivery attempts stop until resumed. No input fields are required.

### Resume the outbound queue

The `ResumeMtaQueue` variant resumes outbound MTA queue processing after a pause. No input fields are required.

## Permissions

Creating, reading, querying, and destroying Actions are gated by the `sysActionCreate`, `sysActionGet`, `sysActionQuery`, and `sysActionDestroy` permissions respectively. Administrators granted these permissions can invoke any variant; finer-grained restrictions are expressed through the standard permission model.
