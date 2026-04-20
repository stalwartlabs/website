---
sidebar_position: 1
---

# Overview

Spam filtering identifies and segregates unsolicited or potentially harmful messages before they reach an inbox. Stalwart includes a built-in spam and phishing filter whose behaviour is defined by a set of customizable rules, tags, scores, and statistical classifiers. The bulk of the spam and phishing rules shipped with Stalwart are ported directly from RSpamd, with a small number derived from SpamAssassin. Combined with [expressions](/docs/configuration/expressions/overview), this provides comparable filtering depth to those systems while keeping the configuration inside the JMAP object model.

Global behaviour is configured on the [SpamSettings](/docs/ref/object/spam-settings) singleton (found in the WebUI under <!-- breadcrumb:SpamSettings --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> Spam Filter › General<!-- /breadcrumb:SpamSettings -->), which carries the master [`enable`](/docs/ref/object/spam-settings#enable) flag and the score thresholds described below.

## Tags and scores

When a message arrives the filter analyses its content, headers, and sender attributes. Each facet of the analysis produces a tag that describes a specific characteristic or outcome. For example, a message composed entirely of HTML without a text part is tagged `MIME_HTML_ONLY`, while a message that passes DMARC is tagged `DMARC_POLICY_ALLOW`.

Each tag contributes a score, which may be positive or negative. Positive scores indicate spam-like characteristics; negative scores indicate ham-like (legitimate) characteristics. The cumulative score across all tags is compared against the thresholds on SpamSettings to determine the final classification. The default spam threshold is 5.0; administrators can adjust it via [`scoreSpam`](/docs/ref/object/spam-settings#scorespam).

Tag-to-score mappings, as well as special "discard" or "reject" actions per tag, are configured through the [SpamTag](/docs/ref/object/spam-tag) object (found in the WebUI under <!-- breadcrumb:SpamTag --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> Spam Filter › Scores<!-- /breadcrumb:SpamTag -->). See [Scores](/docs/spamfilter/settings/scores) for details.

## Analysis outcomes

By default the filter is conservative: no incoming message is rejected solely on the basis of its spam score. This can be changed by setting the [`scoreDiscard`](/docs/ref/object/spam-settings#scorediscard) or [`scoreReject`](/docs/ref/object/spam-settings#scorereject) thresholds on SpamSettings, or by attaching a `Discard` or `Reject` variant of [SpamTag](/docs/ref/object/spam-tag) to a specific tag.

For messages that are neither discarded nor rejected, Stalwart adds the `X-Spam-Status` and `X-Spam-Result` headers so that end users can build their own filters on top of the filter's output, for example using Sieve via [ManageSieve](/docs/sieve/managesieve) or [JMAP Sieve](/docs/sieve/jmap). The `X-Spam-Status` header reports `Yes` or `No` along with the final score. The `X-Spam-Result` header lists each tag that fired and its contribution.

Example headers on a message classified as spam:

```
X-Spam-Result: DMARC_POLICY_ALLOW (-0.50),
	DKIM_ALLOW (-0.20),
	SPF_ALLOW (-0.20),
	ONCE_RECEIVED (0.10),
	RCVD_NO_TLS_LAST (0.10),
	MV_CASE (0.50),
	R_MISSING_CHARSET (0.50),
	URI_COUNT_ODD (0.50),
	CT_EXTRA_SEMI (1.00),
	MID_RHS_MATCH_FROM (1.00),
	RDNS_NONE (1.00),
	R_PARTS_DIFFER (1.00),
	RBL_SPAMHAUS_CSS (2.00),
	RBL_VIRUSFREE_BOTNET (2.00),
	RBL_BARRACUDA (4.00),
	ABUSE_SURBL (5.00),
	DBL_SPAM (6.50)
X-Spam-Status: Yes, score=13.45
```

Both `X-Spam-Status` and `X-Spam-Result` are added unconditionally under their fixed names.
