---
sidebar_position: 1
title: "Overview"
description: "How the Stalwart spam filter scores a message, what it does at each score, the headers it adds, what works without configuration, and how to investigate a verdict."
---

A mail server that accepts mail from the internet receives spam alongside legitimate mail, and has to tell the two apart before the mail reaches its users. Stalwart does this with a built-in spam filter. For each message received over SMTP, the filter decides whether it is legitimate mail (ham), spam, or a message to refuse.

The filter runs inside the SMTP server at the end of the DATA stage, before the message is queued. The sending server is therefore still connected when the verdict is reached, which means that a message can be rejected outright instead of being accepted and dropped later.

No single test identifies spam reliably, so the filter combines several kinds of evidence. It looks at the authentication results of the message (SPF, DKIM, DMARC and ARC), at DNS blocklists, at the structure and content of the headers and body, and at the links the message contains. It also consults a statistical classifier trained on the users' own mail and, optionally, a collaborative digest service and an AI model. Most of the rules are derived from those of Rspamd, with a few from SpamAssassin. They are written as [expressions](/docs/configuration/expressions/), so administrators can read and change them.

Global behaviour is configured on the [SpamSettings](/docs/ref/object/spam-settings) singleton, found in the WebUI under <!-- breadcrumb:SpamSettings --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> Spam Filter › General<!-- /breadcrumb:SpamSettings -->. Its [`enable`](/docs/ref/object/spam-settings#enable) field turns the filter on or off for the whole server. [General settings](/docs/spamfilter/settings/general) describes the thresholds and limits.

## Tags and scores

The filter expresses everything it finds as tags. Each check that finds something adds a tag to the message, a name that describes the finding. A message composed only of HTML is tagged `MIME_HTML_ONLY`, for example. A message whose sender passes DMARC is tagged `DMARC_POLICY_ALLOW`, and a sender listed on the Spamhaus blocklist produces `RBL_SPAMHAUS_SBL`.

Each tag has a score. The score is positive for spam-like findings and negative for ham-like ones, and the score of the message is the sum of the scores of its tags. Findings that point in opposite directions therefore offset each other.

Tag scores are [SpamTag](/docs/ref/object/spam-tag) objects. A tag can also be set to reject or discard the message outright, whatever its score. [Scores](/docs/spamfilter/settings/scores) lists the tag families.

## Scoring order

The filter runs its steps in a fixed order, because later steps build on the tags added by earlier ones:

1. The built-in analyses examine the client IP address, the authentication results, the EHLO name, the headers, the `Received` chain, the `Message-ID` and `Date` headers, the subject, the sender and reply-to addresses, the recipients, the domains and URLs in the message, its MIME structure and its HTML. In the course of this work, they query the [DNS blocklists](/docs/spamfilter/dnsbl), resolve [URL redirectors](/docs/spamfilter/settings/domain-lists) and check the [spam trap](/docs/spamfilter/spamtrap) addresses. A message whose MIME structure exceeds the parser's part count or nesting limit is tagged `MIME_LIMIT_EXCEEDED`.
2. [Pyzor](/docs/spamfilter/digests), when enabled, looks up a digest of the message text.
3. The [statistical classifier](/docs/spamfilter/classifier/), once trained, estimates the probability that the message is spam and adds one of the `PROB_*` tags.
4. The [rules](/docs/spamfilter/rules) that do not depend on the AI classifier run, in order of priority.
5. The [AI classifier](/docs/spamfilter/ai/), when enabled, classifies the messages whose score so far is inconclusive, and adds `AI_*` tags.
6. The rules that test `AI_*` tags run.
7. The scores of all tags are added up and compared with the thresholds.

A tag set to reject or discard shortens this sequence. Once such a tag has been added, the AI classifier and the rules that run after it are skipped. The other steps still run, and the decision is applied when the scores are added up.

## Outcomes

The final score decides what happens to the message. It is compared with three thresholds on SpamSettings. The reject threshold is checked first, then the discard threshold, and each of these two is inactive when it is `0` or below:

| Score | Field | Default | Outcome |
|---|---|---|---|
| At or above the reject threshold | [`scoreReject`](/docs/ref/object/spam-settings#scorereject) | <!-- default:SpamSettings.scoreReject -->0<!-- /default --> | Refused at the end of DATA with `550 5.7.1 Message rejected due to excessive spam score.` The sender receives the rejection. |
| At or above the discard threshold | [`scoreDiscard`](/docs/ref/object/spam-settings#scorediscard) | <!-- default:SpamSettings.scoreDiscard -->0<!-- /default --> | Accepted with `250 2.0.0 Message queued for delivery.` and then dropped. Neither the sender nor the recipient is informed. |
| At or above the spam threshold | [`scoreSpam`](/docs/ref/object/spam-settings#scorespam) | <!-- default:SpamSettings.scoreSpam -->5<!-- /default --> | Accepted and delivered to the recipient's Junk folder. |
| Below the spam threshold | | | Delivered to the inbox. |

The three outcomes differ in who learns about the verdict. A rejection tells the sender, a discard tells nobody, and delivery to Junk leaves the decision visible to the recipient. With the defaults, both the reject and the discard thresholds are inactive. No message is refused or discarded because of its score, and all spam is delivered to the Junk folder, where users can review it.

The Junk decision is made at delivery, separately for each local recipient, so two recipients of the same message can see different results. The recipient's own [Sieve script](/docs/sieve/interpreter/untrusted) runs first, and a script that files the message decides where it goes. Trusted senders are a second exception: a message from a sender in the recipient's address book, or a reply in a conversation the recipient has taken part in, is delivered to the inbox although its score is above the spam threshold, as described in [Trusted senders](/docs/spamfilter/trusted). Neither exception applies to a message that the reject or discard threshold has already refused.

## Headers

A message that the filter accepts carries the result of the analysis in its headers. These headers are the first place to look when a verdict needs explaining:

| Header | Added | Content |
|---|---|---|
| `X-Spam-Result` | At DATA, when the filter ran | Every tag with its score, in ascending order of score. |
| `X-Spam-Score` | At DATA, when the filter ran | `spam` or `ham`, the final score and, when the classifier ran, its average confidence. |
| `X-Spam-AI` | At DATA, when the AI classifier ran and [`addHeader`](/docs/ref/object/spam-ai#addheader) is enabled | The AI verdict, described in [AI classifier](/docs/spamfilter/ai/). |
| `X-Spam-Status` | At delivery to a local mailbox | `Yes` or `No` for this recipient, with a reason when a trusted-sender rule changed the verdict. It carries no score. |

The following headers are an abbreviated example of a message classified as spam:

```text
X-Spam-Result: DMARC_POLICY_ALLOW (-0.50),
	DKIM_ALLOW (-0.20),
	SPF_ALLOW (-0.20),
	RDNS_NONE (2.00),
	RBL_SPAMHAUS_CSS (2.00),
	RBL_BARRACUDA (4.00),
	DBL_SPAM (4.50)
X-Spam-Score: spam, score=11.60
X-Spam-Status: Yes
```

[General settings](/docs/spamfilter/settings/general#headers) gives the exact format of each header and the messages that do not receive them.

## Filtered sessions

Not every message needs filtering. Mail from other servers is the main source of spam, while mail submitted by the server's own authenticated users is usually trusted. Two settings decide which messages the filter sees. The filter runs for a message when SpamSettings `enable` is `true` and the [`enableSpamFilter`](/docs/ref/object/mta-stage-data#enablespamfilter) expression of the [DATA stage](/docs/mta/inbound/data) returns `true`.

The default expression, <!-- default:MtaStageData.enableSpamFilter -->`is_empty(authenticated_as)`<!-- /default -->, filters every message from an unauthenticated session, which is mail received from other servers, and skips mail submitted by authenticated users. To filter submissions as well, or to skip filtering for a trusted relay, change the expression.

## Default behaviour

The filter works from its first start without configuration. On that start, Stalwart downloads the current rule set from the Stalwart spam filter repository. The rule set contains the rules, the tag scores, the DNS blocklists, the phishing feeds, and the lists of trusted domains and URL redirectors. With it, the built-in analyses, the rules, the DNS blocklists, the phishing lists and the trusted-sender rules work at once.

The other parts need an administrator's action, or time. The statistical classifier tags messages only after it has been trained on at least <!-- default:SpamClassifier.minSpamSamples -->100<!-- /default --> spam and <!-- default:SpamClassifier.minHamSamples -->100<!-- /default --> ham samples, which users provide by moving messages into and out of the Junk folder ([Training](/docs/spamfilter/classifier/training)). [Pyzor](/docs/spamfilter/digests) is <!-- default:SpamPyzor.enable as=enabled -->disabled<!-- /default --> by default. The [AI classifier](/docs/spamfilter/ai/) needs an AI model and an Enterprise license, and [greylisting](/docs/spamfilter/greylist) stays off until its duration is set.

The DNS blocklists work at once but depend on the DNS resolver for their results. List operators often refuse queries from public resolvers, which shows as `*_BLOCKED` tags ([DNS blocklists](/docs/spamfilter/dnsbl#blocked-queries)).

## Investigating a verdict

When good mail is classified as spam, or spam reaches the inbox, the tags explain why. An investigation follows these steps:

1. Read `X-Spam-Result` in the message headers and note the tags with the largest scores. `X-Spam-Score` gives the total.
2. Run the message through the filter again with the `ClassifySpam` [action](/docs/management/tasks-actions/actions). The action takes the raw message, the client IP address, the EHLO name and the envelope sender, and optionally the recipients. It returns the score, the verdict and every tag with its score, without delivering anything. When the AI classifier is enabled, it also returns the AI gate decision, the facts sent to the model and its verdict.
3. Check the tags against their cause. Tags ending in `_BLOCKED` mean that a blocklist refused the DNS resolver, not that the sender is listed. A strongly negative or positive `PROB_*` tag comes from the classifier, which learns from all users of the server ([Training](/docs/spamfilter/classifier/training)).
4. Correct the verdict at its source. Depending on the cause, change a tag's score ([Scores](/docs/spamfilter/settings/scores)), add the sender's domain to the [trusted domains](/docs/spamfilter/settings/domain-lists#trusted-domains), or disable a rule ([Rules](/docs/spamfilter/rules)). When the classifier is the cause, have users move misclassified messages into or out of the Junk folder, so that it learns from them.
