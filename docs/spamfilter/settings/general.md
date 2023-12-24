---
sidebar_position: 1
---

# Configuration

The general settings for the spam filter can be found in the `etc/spamfilter/scripts/config.sieve` script. In this script, each configuration parameter is defined using the Sieve scripting language's variable mechanism. To set a variable, the `let` keyword is employed, followed by the variable's name, and then its designated value.

For example:

```sieve
let "ADD_HEADER_SPAM" "true";
```

## Headers

The results of the spam filter's analysis are conveyed to end users via two headers: `X-Spam-Status` and `X-Spam-Result`. These headers offer end users transparency and insights into the workings of the spam filter.

### X-Spam-Status

The `ADD_HEADER_SPAM` setting determines whether the `X-Spam-Status` header should be added to emails processed by the filter. The `X-Spam-Status` header indicates, in a straightforward manner, whether an email is classified as spam or not, typically displaying a 'Yes' or 'No', along with the email's final score.

For example:

```sieve
let "ADD_HEADER_SPAM" "true";
```

By setting it to `true`, the header will be added to emails. If you wish to prevent this header from being added, you would set this to `false`.

### X-Spam-Result

The `ADD_HEADER_SPAM_RESULT` setting controls the addition of the `X-Spam-Result` header to emails. The `X-Spam-Result` header provides a detailed breakdown of the email's analysis, listing each tag applied by the spam filter and its associated score. This gives users a comprehensive view of why an email received its final spam score.

For example:

```sieve
let "ADD_HEADER_SPAM_RESULT" "true";
```

When set to `true`, this header will be added, offering detailed insights into the email's classification. To omit this detailed header, you would change this setting to `false`.

## Thresholds

The threshold settings offer system administrators the ability to fine-tune how aggressively the spam filter acts upon incoming messages, providing flexibility in managing potential spam and ensuring that legitimate messages are delivered appropriately.

### Spam Threshold

The `SCORE_SPAM_THRESHOLD` setting defines the score threshold for marking messages as spam when the `ADD_HEADER_SPAM` feature is enabled. If an email's cumulative score exceeds this threshold, it will be classified as spam. The default setting is that any message with a score above 5.0 will be deemed as spam and the `X-Spam-Status` header will reflect this classification.

```sieve
let "SCORE_SPAM_THRESHOLD" "5.0";
```

### Discard Threshold

The `SCORE_DISCARD_THRESHOLD` parameter determines the score threshold at which messages are discarded outright, meaning they will not be delivered to the recipient's mailbox. With the current setting at "0", it implies that this feature is essentially inactive, as it's unlikely for a message to have a score of 0 or more and be discarded based solely on the spam filter's analysis. However, if administrators wish to activate this feature, they can adjust the value to a more practical threshold.

```sieve
let "SCORE_DISCARD_THRESHOLD" "6.0";
```

### Reject Threshold

The `SCORE_REJECT_THRESHOLD` parameter sets the score threshold for outright rejecting incoming messages. When a message's score surpasses this threshold, it will be rejected, and the sending server will typically receive a notification of this rejection. As with the discard threshold, the current setting of "0" indicates that this feature is not actively rejecting any messages based on their spam score. Administrators can modify this threshold if they want the filter to start rejecting messages at a specific score.

```sieve
let "SCORE_REJECT_THRESHOLD" "12.0";
```

## Directory

The `DOMAIN_DIRECTORY` setting specifies which [directory](/docs/directory/overview) to use when looking up local domain names. The primary reason for this configuration is to optimize network resources. When the system identifies a domain as local, it can bypass certain checks like DNSBL (DNS-based Block Lists) or phishing verifications. These checks are typically more relevant for external or unfamiliar domains. By avoiding unnecessary checks on local domains, the system can process emails faster and more efficiently, reducing network overhead and enhancing performance.

Example:

```sieve
let "DOMAIN_DIRECTORY" "'default'";
```

If left unspecified, the [default directory](/docs/sieve/interpreter/trusted#default-stores) will be used.

## Spam database

The `SPAM_DB` setting specifies which [lookup store](/docs/storage/lookup) to use as the [spam filter database](/docs/spamfilter/settings/database). This database is used to store sender reputation information, bayesian classifier models, greylist data, message reply tracking and other similar data.

Example:

```sieve
let "SPAM_DB" "'redis'";
```

If left unspecified, the [default lookup store](/docs/sieve/interpreter/trusted#default-stores) will be used.
