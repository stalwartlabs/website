---
sidebar_position: 2
title: "Scores"
description: "How tag scores are defined, the families of tags the spam filter produces, where their default scores come from, and how to change a score or make a tag reject or discard a message."
---

Tag scores are where an administrator tunes the spam filter most directly. Every finding of the [spam filter](/docs/spamfilter/) is recorded as a tag, and the score of a message is the sum of the scores of its tags. Changing how much a tag counts therefore changes how strongly the filter reacts to that finding, without touching the check that produces it.

The score of each tag, or the action it triggers, is defined by a [SpamTag](/docs/ref/object/spam-tag) object, found in the WebUI under <!-- breadcrumb:SpamTag --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> Spam Filter › Scores<!-- /breadcrumb:SpamTag -->. A tag without a SpamTag object contributes nothing to the score.

## Score, reject and discard

Most tags contribute to the score, but some findings are decisive on their own. SpamTag therefore has three variants:

| Variant | Fields | Effect when the tag is added |
|---|---|---|
| `Score` | [`tag`](/docs/ref/object/spam-tag#tag), [`score`](/docs/ref/object/spam-tag#score) | Adds `score` to the message score. Positive values count towards spam, negative values towards ham. |
| `Reject` | `tag` | Refuses the message at the end of DATA with `550 5.7.1 Message rejected due to excessive spam score.`, whatever the score. |
| `Discard` | `tag` | Accepts the message with `250 2.0.0 Message queued for delivery.` and drops it, whatever the score. |

A `Reject` or `Discard` tag cuts the analysis short. Once such a tag has been added, the AI classifier is not consulted, and the rules that depend on it do not run. The decision is applied when the scores are added up. When a message receives both a `Reject` and a `Discard` tag, which of the two applies is not defined.

The `tag` field accepts a glob pattern, so one object can set the score of a whole group of tags.

The following object lowers the score of the classifier's medium-confidence ham verdict:

```json
{
  "@type": "Score",
  "tag": "PROB_HAM_MEDIUM",
  "score": -3.0
}
```

The following object discards every message sent to a [spam trap](/docs/spamfilter/spamtrap):

```json
{
  "@type": "Discard",
  "tag": "SPAM_TRAP"
}
```

## Default scores

The default scores are part of the rule set that Stalwart downloads on first start, together with the rules that produce the tags ([Rule set updates](/docs/spamfilter/settings/general#rule-set-updates)). The rule set defines about 400 scores.

Changing a score in the WebUI, or with `x:SpamTag/set`, takes effect for the next message. Local changes are also safe from updates: a later rule set update adds scores for new tags, but never replaces a score that already exists.

The current score of a tag is shown in the WebUI under the spam filter scores. For a particular message, the `ClassifySpam` [action](/docs/management/tasks-actions/actions) reports the score and the disposition of every tag the message receives.

The rule set uses the decisive variants sparingly. The only tag that it sets to reject is `BLOCKED_DOMAIN`, added when the sender's domain is in the `blocked-domains` [list](/docs/spamfilter/settings/domain-lists).

## Tag families

Tag names start with a prefix that identifies the check that produced them, so the prefix of an unfamiliar tag shows where to look for its cause. The main families are:

| Prefix | Produced by | Examples |
|---|---|---|
| `RBL_`, `RWL_`, `DBL_`, `DWL_`, `SURBL_`, `URIBL_`, `RECEIVED_` | [DNS blocklists](/docs/spamfilter/dnsbl) and allowlists, for the client IP, the IPs of the `Received` chain, domains and URLs | `RBL_SPAMHAUS_SBL`, `DBL_PHISH` (7.5), `RWL_MAILSPIKE_GOOD` |
| `DMARC_`, `SPF_`, `DKIM_`, `DKIM2_`, `ARC_` | Sender authentication; see [below](#authentication-tags) | `DMARC_POLICY_REJECT` (4.0), `SPF_ALLOW` (-0.2) |
| `PROB_` | The [statistical classifier](/docs/spamfilter/classifier/) | `PROB_SPAM_HIGH` (8.0), `PROB_HAM_HIGH` (-8.0) |
| `AI_` | The [AI classifier](/docs/spamfilter/ai/) | `AI_PHISHING_HIGH` (7.0), `AI_LEGITIMATE_HIGH` (-3.0) |
| `TRUSTED_` | [Trusted domains](/docs/spamfilter/settings/domain-lists#trusted-domains) | `TRUSTED_DOMAIN` (-7.0) |
| `FROM_`, `REPLYTO_`, `TO_`, `RCPT_`, `SUBJECT_`, `MID_`, `HELO_`, `RCVD_`, `FORGED_` | Header analyses | `FORGED_SENDER`, `RCVD_NO_TLS_LAST` |
| `MIME_`, `HTML_`, `HAS_` | MIME structure, HTML and attachment analyses ([MIME types](/docs/spamfilter/settings/mime-types)) | `MIME_BAD_EXTENSION` (2.0), `MIME_LIMIT_EXCEEDED` (8.0) |
| `FREEMAIL_`, `DISPOSABLE_` | Addresses at free and disposable mail providers | `FREEMAIL_FROM` |
| `PHISHED_`, `HOMOGRAPH_URL`, `REDIRECTOR_URL`, `URL_` | [Phishing protection](/docs/spamfilter/phishing) and URL analyses | `PHISHED_OPENPHISH` (7.0) |
| `SPAM_TRAP`, `PYZOR` | [Spam traps](/docs/spamfilter/spamtrap) (15.0) and [Pyzor](/docs/spamfilter/digests) (3.5) | |

Tags ending in `_BLOCKED` or `_BLOCKED_OPENRESOLVER` score 0. They mean that a DNS blocklist refused to answer the server's resolver, not that the sender is listed ([DNS blocklists](/docs/spamfilter/dnsbl#blocked-queries)).

## Authentication tags

The MTA checks the authenticity of every message it receives, and the authentication tags carry the results of those checks into the score. Four mechanisms are involved:

- SPF verifies that the sending IP address is authorised by the domain of the envelope sender.
- DKIM verifies the cryptographic signatures in the message.
- DMARC requires one of the two to pass for a domain aligned with the `From` header, and lets the domain owner publish a policy for messages that fail.
- ARC preserves authentication results across forwarders, which would otherwise break SPF and DKIM.

[Sender authentication](/docs/mta/authentication/) describes the checks, and the settings that make them reject messages at SMTP time. The tags are added whatever those settings are, so a failed check that does not reject a message still counts against it.

| Tags | Result | Default scores |
|---|---|---|
| `DMARC_POLICY_ALLOW` | DMARC passes. | -0.5 |
| `DMARC_POLICY_REJECT`, `DMARC_POLICY_QUARANTINE`, `DMARC_POLICY_SOFTFAIL` | DMARC fails, and the domain's policy is `reject`, `quarantine` or `none`. | 4.0, 1.5, 0.1 |
| `DMARC_NA`, `DMARC_BAD_POLICY`, `DMARC_DNSFAIL` | No DMARC record, an invalid record, or a DNS error. | 1.0, 0.5, 0.0 |
| `SPF_ALLOW`, `SPF_FAIL`, `SPF_SOFTFAIL`, `SPF_NEUTRAL`, `SPF_NA` | SPF passes, fails, soft-fails, is neutral, or the domain has no SPF record. | -0.2, 1.0, 0.0, 0.0, 0.0 |
| `DKIM_ALLOW`, `DKIM_REJECT`, `DKIM_NA` | A DKIM signature verifies; no signature verifies and the first one fails; or the message has no signature that could be evaluated. | -0.2, 1.0, 0.0 |
| `DKIM2_ALLOW`, `DKIM2_REJECT`, `DKIM2_PERMFAIL`, `DKIM2_TEMPFAIL`, `DKIM2_NA` | The [DKIM2](/docs/mta/authentication/dkim/dkim2) chain verifies, fails, is invalid, could not be verified because of a temporary DNS error, or the message has no DKIM2 signature. | -0.2, 1.0, 0.0, 0.0, 0.0 |
| `ARC_ALLOW`, `ARC_REJECT`, `ARC_INVALID`, `ARC_NA` | The ARC chain verifies, fails, is malformed, or is absent. | 0.0, 1.0, 0.5, 0.0 |
| `TRUSTED_DOMAIN` | DMARC passes and the `From` domain is in the `trusted-domains` list. | -7.0 |

One case never reaches these tags. A message whose `From` header holds addresses in several domains cannot be evaluated by DMARC. When DMARC verification is enabled, the MTA rejects it before the spam filter runs ([DMARC](/docs/mta/authentication/dmarc)).
