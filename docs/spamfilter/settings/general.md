---
sidebar_position: 1
---

# Overview

The spam filter is enabled by default in Stalwart, providing a robust defense against unwanted emails. However, administrators can disable it globally by setting the `spam-filter.enable` setting to `false`. Alternatively, it can be disabled dynamically using an [expression](/docs/configuration/expressions/overview) at the [SMTP DATA](/docs/smtp/inbound/data#spam-filtering) stage. Additionally, spam filtering can be disabled for specific users by removing the `spam-filter-classify` [permission](/docs/auth/authorization/permissions) from their user account or the [tenant](/docs/auth/authorization/tenants) they belong to.

## Headers

The results of the spam filter's analysis are conveyed to end users via two headers: `X-Spam-Status` and `X-Spam-Result`. These headers offer end users transparency and insights into the workings of the spam filter.

### X-Spam-Status

The `spam-filter.header.status.enable` and `spam-filter.header.status.name` settings determine whether the `X-Spam-Status` header should be added to emails processed by the filter as well as the name of the header.  The `X-Spam-Status` header indicates, in a straightforward manner, whether an email is classified as spam or not, typically displaying a 'Yes' or 'No', along with the email's final score.

For example:

```toml
[spam-filter.header.status]
enable = true
name = "X-Spam-Status"
```

By setting `spam-filter.header.status.enable` to `true`, the header will be added to emails. If you wish to prevent this header from being added, you would set this to `false`.

### X-Spam-Result

The `spam-filter.header.result.enable` and `spam-filter.header.result.name` settings controls the addition of the `X-Spam-Result` header to emails as well as the name of the header. The `X-Spam-Result` header provides a detailed breakdown of the email's analysis, listing each tag applied by the spam filter and its associated score. This gives users a comprehensive view of why an email received its final spam score.

For example:

```toml
[spam-filter.header.result]
enable = true
name = "X-Spam-Result"
```

When `spam-filter.header.result.enable` is set to `true`, this header will be added, offering detailed insights into the email's classification. To omit this detailed header, you would change this setting to `false`.

## Thresholds

The threshold settings offer system administrators the ability to fine-tune how aggressively the spam filter acts upon incoming messages, providing flexibility in managing potential spam and ensuring that legitimate messages are delivered appropriately.

### Spam Threshold

The `spam-filter.score.spam` setting defines the score threshold for marking messages as spam. If an email's cumulative score exceeds this threshold, it will be classified as spam. The default setting is that any message with a score above 5.0 will be deemed as spam and the `X-Spam-Status` header will reflect this classification.

```toml
[spam-filter.score]
spam = "5.0"
```

### Discard Threshold

The `spam-filter.score.discard` parameter determines the score threshold at which messages are discarded outright, meaning they will not be delivered to the recipient's mailbox. With the current setting at "0", it implies that this feature is essentially inactive, as it's unlikely for a message to have a score of 0 or more and be discarded based solely on the spam filter's analysis. However, if administrators wish to activate this feature, they can adjust the value to a more practical threshold.

```toml
[spam-filter.score]
discard = "0.0"
```

### Reject Threshold

The `spam-filter.score.reject` parameter sets the score threshold for outright rejecting incoming messages. When a message's score surpasses this threshold, it will be rejected, and the sending server will typically receive a notification of this rejection. As with the discard threshold, the current setting of "0" indicates that this feature is not actively rejecting any messages based on their spam score. Administrators can modify this threshold if they want the filter to start rejecting messages at a specific score.

```toml
[spam-filter.score]
reject = "0.0"
```

## Updates

Upon the initial execution of Stalwart, the Spam filter rules are automatically retrieved from the GitHub repository and stored locally as part of the configuration file. This ensures that the Spam filter is readily available and updated without manual intervention. 

Staying current with the latest Spam filter rules is simple. Administrators can download and update new rule updates automatically by navigating to `Maintenance` > `Update SPAM rules` within the [Webadmin](/docs/management/webadmin/overview) interface. This feature ensures that the Spam filter remains up-to-date with the latest rules and security enhancements.

### Resource Location

By default the default spam filter rules are downloaded from `https://github.com/stalwartlabs/spam-filter/releases/latest/download/spam-filter.toml`, but this can be changed by setting the `spam-filter.resource` key to a different URL or a local file (specified as `file:///path/to/spam-filter.toml`).

Example:

```toml
[spam-filter]
resource = "file:///path/to/spam-filter.toml"
```

### Automatic Updates

Stalwart can be configured to automatically update the spam-filter rules on startup. This feature is disabled by default and can be enabled by setting the `spam-filter.auto-update` key to `true`.

Example:

```toml
[spam-filter]
auto-update = true
```
