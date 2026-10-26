---
sidebar_position: 1
title: "General settings"
description: "Enabling the spam filter, the spam, discard and reject thresholds, the headers the filter adds, the text size limits, and updating the rule set."
---

The general settings decide what the spam filter does with its verdicts: which scores lead to the Junk folder, to a rejection or to a discard, which headers record the result, how much of a message is analysed, and where the rule set comes from. They are fields of the [SpamSettings](/docs/ref/object/spam-settings) singleton, found in the WebUI under <!-- breadcrumb:SpamSettings --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> Spam Filter › General<!-- /breadcrumb:SpamSettings -->.

[`enable`](/docs/ref/object/spam-settings#enable) turns the filter on or off for the whole server, and is <!-- default:SpamSettings.enable as=enabled -->enabled<!-- /default --> by default. A second setting decides whether the filter runs for a particular SMTP session: the [`enableSpamFilter`](/docs/ref/object/mta-stage-data#enablespamfilter) expression of the [DATA stage](/docs/mta/inbound/data), which by default filters unauthenticated sessions only.

## Thresholds

The final score of a message is compared with three thresholds, each of which leads to a different outcome. Each comparison is "at or above": a message whose score equals the threshold meets it.

| Field | Default | Effect |
|---|---|---|
| [`scoreSpam`](/docs/ref/object/spam-settings#scorespam) | <!-- default:SpamSettings.scoreSpam -->5<!-- /default --> | The message is classified as spam and delivered to the Junk folder. |
| [`scoreDiscard`](/docs/ref/object/spam-settings#scorediscard) | <!-- default:SpamSettings.scoreDiscard -->0<!-- /default --> | The message is accepted and dropped without notice. `0` or below disables the threshold. |
| [`scoreReject`](/docs/ref/object/spam-settings#scorereject) | <!-- default:SpamSettings.scoreReject -->0<!-- /default --> | The message is refused with `550 5.7.1 Message rejected due to excessive spam score.` `0` or below disables the threshold. |

When both the reject and the discard thresholds are set, the reject threshold is checked first.

The choice between the two outcomes comes down to who learns about the verdict. A reject threshold makes the sending server responsible for informing its user, so a legitimate sender whose message was refused finds out. That makes rejection preferable to discarding for messages that may be legitimate. Discarding is suited only to scores at which no legitimate message is expected, because nobody learns that the message was lost.

Both thresholds should be well above `scoreSpam`. Messages near the spam threshold then reach the Junk folder, where users can find them, instead of being refused or lost. The following object body rejects messages scoring 15 or more:

```json
{
  "scoreSpam": 5,
  "scoreReject": 15
}
```

The thresholds have a second use. Sieve scripts can read the verdict through the `spamtest` extension, which reports it as a probability, and the thresholds set that scale. A score at the spam threshold corresponds to 50%. A score at the lowest active threshold above it corresponds to 100%, or twice the spam threshold when no such threshold is set.

## Headers

The filter records its result in headers of the messages it accepts. The headers serve two readers: administrators investigating a verdict, and Sieve scripts that act on it.

`X-Spam-Result` lists every tag that matched, with its score with two decimals, in ascending order of score, one tag per folded line:

```text
X-Spam-Result: PROB_HAM_HIGH (-8.00),
	TRUSTED_DOMAIN (-7.00),
	SPF_ALLOW (-0.20)
```

`X-Spam-Score` gives the verdict and the final score, and, when the [classifier](/docs/spamfilter/classifier/) produced a probability, the average probability across the recipients as `avg_confidence`:

```text
X-Spam-Score: ham, score=-15.20, avg_confidence=0.08
```

Both headers are added to the message as it is queued. They are therefore visible to user Sieve scripts at delivery, and present in copies relayed to other servers. [System Sieve scripts](/docs/sieve/interpreter/trusted) at the DATA stage do not see them, and read the score from `env.spam.score` instead. When the [AI classifier](/docs/spamfilter/ai/) runs, its verdict is added between the two headers, in an `X-Spam-AI` header.

`X-Spam-Status` is added later, when the message is stored in a local mailbox. Because the Junk decision is made separately for each recipient, this header records the decision for that recipient:

| Value | Meaning |
|---|---|
| `Yes` | The message was classified as spam for this recipient and filed in the Junk folder. |
| `No` | The message was not classified as spam, the spam filter did not run, or the recipient's Sieve script filed the message into a folder of its choice. |
| `No, reason=card-exists` | The message was classified as spam, but the sender is in the recipient's address book. |
| `No, reason=trusted-reply` | The message was classified as spam, but it belongs to a conversation in which the recipient has sent a message. |

The two `reason` values come from the [trusted sender](/docs/spamfilter/trusted) rules. `X-Spam-Status` carries no score.

The timing of the header matters for Sieve. It is added after the recipient's Sieve script has run, so a user script cannot test it. Such a script tests `X-Spam-Score` instead, or uses the `spamtest` extension.

Not every message receives every header. `X-Spam-Result` and `X-Spam-Score` are not added to a message that is rejected or discarded, or when the filter did not run for the session, such as for authenticated senders by default. `X-Spam-Status` is added at every delivery to a local mailbox while the filter is enabled on the server, with `No` when the filter did not run for the message. It is never added to messages relayed to other servers.

The filter does not remove `X-Spam-*` headers that a message already carries when it arrives.

## Text size limits

The text analyses, the classifier and the AI classifier read the text of the message, and their cost grows with its length. To bound the cost of very large messages, only the following amounts of text are analysed, and the rest is ignored:

| Field | Default | Limit |
|---|---|---|
| [`maxBodyText`](/docs/ref/object/spam-settings#maxbodytext) | <!-- default:SpamSettings.maxBodyText as=size -->256 KiB<!-- /default --> | Text read from each body part. |
| [`maxAttachmentText`](/docs/ref/object/spam-settings#maxattachmenttext) | <!-- default:SpamSettings.maxAttachmentText as=size -->64 KiB<!-- /default --> | Text read from each other text part, such as a text attachment. |
| [`maxMessageText`](/docs/ref/object/spam-settings#maxmessagetext) | <!-- default:SpamSettings.maxMessageText as=size -->1 MiB<!-- /default --> | Text read from the message in total. |

All three have a minimum of 1024 bytes. The limits are a trade-off between thoroughness and speed. Raising them lets the filter see more of long messages, at the cost of processing time per message. [Tuning mail throughput](/docs/performance/mail-throughput) describes the effect on capacity.

## Rule set updates

Spam changes over time, and the filter's knowledge has to change with it. The rules, tag scores, DNS blocklists, lookup lists and phishing feeds that the filter uses are therefore distributed separately from the server, as a rule set maintained in the [Stalwart spam filter repository](https://github.com/stalwartlabs/spam-filter).

The location of the rule set is [`spamFilterRulesUrl`](/docs/ref/object/spam-settings#spamfilterrulesurl), which by default points to the latest release of that repository. For servers without internet access, a `file://` URL loads it from the local file system instead.

The rule set is downloaded automatically when the server starts and no [rules](/docs/spamfilter/rules) exist yet, which normally means on first start. Later updates are not scheduled automatically, so the administrator decides when the filter changes. An update is run by creating a [task](/docs/management/tasks-actions/tasks) of type `SpamFilterMaintenance` with `maintenanceType` set to `updateRules`. The following object creates such a task:

```json
{
  "@type": "SpamFilterMaintenance",
  "maintenanceType": "updateRules",
  "status": {"@type": "Pending", "due": "2026-11-01T02:00:00Z"}
}
```

An update treats the objects of the rule set in different ways, so that local decisions survive it:

- Objects that are new in the rule set are added.
- Existing objects of the same name are replaced with the new version, but keep their `enable` setting, so a disabled rule stays disabled.
- Tag scores that already exist are never replaced, so scores changed by the administrator survive updates.
- Objects that were removed from the rule set are not deleted.

The result is logged in the `spam.rules-updated` event, with the number of objects added, updated, unchanged and failed for each type.
