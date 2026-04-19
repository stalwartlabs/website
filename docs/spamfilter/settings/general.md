---
sidebar_position: 1
---

# Overview

The spam filter is enabled by default in Stalwart. The global on/off switch is the [`enable`](/docs/ref/object/spam-settings#enable) field on the [SpamSettings](/docs/ref/object/spam-settings) singleton (found in the WebUI under <!-- breadcrumb:SpamSettings --><!-- /breadcrumb:SpamSettings -->). For per-session control, use [`enableSpamFilter`](/docs/ref/object/mta-stage-data#enablespamfilter) on [MtaStageData](/docs/ref/object/mta-stage-data), which accepts an expression and is evaluated at the [SMTP DATA](/docs/mta/inbound/data#spam-filtering) stage.

## Headers

The spam filter reports its analysis through two headers added to each delivered message: `X-Spam-Status` and `X-Spam-Result`.

### X-Spam-Status

The `X-Spam-Status` header states whether the message was classified as spam, as a simple `Yes` or `No`, along with the final score. End users can build Sieve filters on top of this header to sort or quarantine suspected spam themselves.

### X-Spam-Result

The `X-Spam-Result` header lists every tag applied by the filter and its associated score, making the filter's decision auditable and easy to debug.

<!-- review: The previous docs documented four fields controlling these headers (`spam-filter.header.status.enable`, `spam-filter.header.status.name`, `spam-filter.header.result.enable`, `spam-filter.header.result.name`) for turning each header on or off and renaming it. No equivalent fields appear on SpamSettings or any other object in the current schema. Confirm whether both headers are now unconditionally added under their default names, or whether the controls live on an object that has not been surfaced here. -->

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

On first startup, Stalwart downloads the default spam filter rules from the GitHub repository and stores them locally, so the filter is immediately ready for use. Administrators can then update the rule set on demand from `Maintenance` > `Update SPAM rules` in the [WebUI](/docs/management/webui/overview).

### Resource location

The URL from which spam filter rules are downloaded is set through [`spamFilterRulesUrl`](/docs/ref/object/spam-settings#spamfilterrulesurl) on SpamSettings. The default is `"https://github.com/stalwartlabs/spam-filter/releases/latest/download/spam-filter-rules.json.gz"`. A local `file://` URL can be used to serve rules from disk.

### Automatic updates

<!-- review: The previous docs exposed a `spam-filter.auto-update` boolean that, when `true`, caused the spam filter rules to be re-downloaded automatically on startup. No equivalent field appears on SpamSettings. Confirm whether automatic updates are now unconditional, have moved to a separate object (for example a task schedule), or have been removed entirely. -->
