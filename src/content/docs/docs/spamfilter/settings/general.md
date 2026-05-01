---
sidebar_position: 1
title: "Overview"
---

The spam filter is enabled by default in Stalwart. The global on/off switch is the [`enable`](/docs/ref/object/spam-settings#enable) field on the [SpamSettings](/docs/ref/object/spam-settings) singleton (found in the WebUI under <!-- breadcrumb:SpamSettings --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> Spam Filter › General<!-- /breadcrumb:SpamSettings -->). For per-session control, use [`enableSpamFilter`](/docs/ref/object/mta-stage-data#enablespamfilter) on [MtaStageData](/docs/ref/object/mta-stage-data), which accepts an expression and is evaluated at the [SMTP DATA](/docs/mta/inbound/data#spam-filtering) stage.

## Headers

The spam filter reports its analysis through two headers added to each delivered message: `X-Spam-Status` and `X-Spam-Result`.

### X-Spam-Status

The `X-Spam-Status` header states whether the message was classified as spam, as a simple `Yes` or `No`, along with the final score. End users can build Sieve filters on top of this header to sort or quarantine suspected spam themselves.

### X-Spam-Result

The `X-Spam-Result` header lists every tag applied by the filter and its associated score, making the filter's decision auditable and easy to debug.

Both headers are added unconditionally under their fixed names.

## Thresholds

The threshold settings on [SpamSettings](/docs/ref/object/spam-settings) determine how aggressively the spam filter acts on incoming messages.

### Spam threshold

[`scoreSpam`](/docs/ref/object/spam-settings#scorespam) sets the score at or above which a message is classified as spam. The default is `5`, so any message whose cumulative score exceeds 5 is marked as spam in the `X-Spam-Status` header.

### Discard threshold

[`scoreDiscard`](/docs/ref/object/spam-settings#scorediscard) sets the score at or above which a message is discarded outright (dropped silently without delivery). The default value is `0`, which effectively leaves the feature inactive in most practical scoring setups. Raising this value activates the behaviour.

### Reject threshold

[`scoreReject`](/docs/ref/object/spam-settings#scorereject) sets the score at or above which a message is rejected at SMTP time, causing the sending server to receive a delivery failure. The default value is `0`; raising it activates the behaviour.

## Address book integration

Stalwart's spam filter integrates with the recipient's [address book](/docs/collaboration/contact) to reduce false positives. When a message comes from a sender present in the recipient's address book, it is treated as legitimate (ham) regardless of the score that would otherwise be assigned.

The feature is controlled by [`trustContacts`](/docs/ref/object/spam-settings#trustcontacts) on SpamSettings, which defaults to `true`. With this setting active, trusted contacts will not have their messages misclassified because of wording, formatting, or other typical spam indicators.

## Updates

On first startup, Stalwart downloads the default spam filter rules from the GitHub repository and stores them locally, so the filter is immediately ready for use. Administrators can then update the rule set on demand from `Maintenance` > `Update SPAM rules` in the [WebUI](/docs/management/webui/).

### Resource location

The URL from which spam filter rules are downloaded is set through [`spamFilterRulesUrl`](/docs/ref/object/spam-settings#spamfilterrulesurl) on SpamSettings. The default is `"https://github.com/stalwartlabs/spam-filter/releases/latest/download/spam-filter-rules.json.gz"`. A local `file://` URL can be used to serve rules from disk.

### Scheduled updates

Rule refreshes are triggered by a [Task](/docs/ref/object/task) (found in the WebUI under <!-- breadcrumb:Task --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M13 5h8" /><path d="M13 12h8" /><path d="M13 19h8" /><path d="m3 17 2 2 4-4" /><path d="m3 7 2 2 4-4" /></svg> Tasks › Scheduled, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M13 5h8" /><path d="M13 12h8" /><path d="M13 19h8" /><path d="m3 17 2 2 4-4" /><path d="m3 7 2 2 4-4" /></svg> Tasks › Failed<!-- /breadcrumb:Task -->) of variant `SpamFilterMaintenance` with its operation set to `updateRules`. The task can be scheduled on demand by the administrator to re-download the rule set from [`spamFilterRulesUrl`](/docs/ref/object/spam-settings#spamfilterrulesurl). There is no built-in automatic schedule at present.
