---
sidebar_position: 1
---

# Overview

Spam filtering is an essential component of any modern mail server, designed to sift through vast amounts of incoming email to identify and segregate unsolicited or potentially harmful messages. These unsolicited messages, commonly known as spam, not only clutter an individual's inbox but can also pose significant security risks. Efficient spam filtering ensures that genuine, legitimate emails reach their intended recipients, while unwanted or malicious emails are quarantined or discarded.

Stalwart includes a comprehensive Spam and Phishing filter that provides a robust defense against such unwanted emails. This filter is built into Stalwart and consists of multiple customizable rules, which allow administrators to effortlessly modify its behavior or introduce new rules to better suit their specific requirements. 

It's worth noting that Stalwart's Spam and Phishing filter offers a protection level on par with popular tools such as RSpamd and SpamAssassin. This level of protection is no coincidence; the bulk of the spam/phishing rules present in Stalwart have been ported directly from RSpamd, with a handful also derived from SpamAssassin. This synthesis of top-tier rules, combined with the customization offered by [expressions](/docs/configuration/expressions/overview), ensures that Stalwart delivers an unparalleled email filtering experience.

## Tags and Scores

Every time a message arrives, the filter thoroughly analyzes both its content and the sender. Each facet of this analysis yields a tag, reflecting the specific characteristic or outcome of that evaluation. For instance, if a message is composed solely of HTML without a corresponding text part, the filter assigns the tag `MIME_HTML_ONLY`. Similarly, when a message successfully clears DMARC checks, it is labeled with the tag `DMARC_POLICY_ALLOW`.

Each tag generated during this process carries a specific score, which can be either positive or negative. A positive score implies an increased likelihood that the message is spam, while a negative score suggests the opposite, indicating the message is ham (legitimate and not spam). The cumulative score derived from all the tags determines the message's classification. Typically, any message that accumulates a score surpassing 6 is deemed as Spam. However, this threshold is not rigid; administrators have the flexibility to adjust this value as per their preferences or organizational needs.

## Analysis Outcomes

The Spam and Phishing filter is designed with a conservative approach in mind; by default, it does not reject any incoming email messages, regardless of how high they might score in terms of potential spam characteristics. That said, system administrators have the flexibility to configure the filter to take more proactive measures. They can set it up to either discard or reject messages that cross a specified score threshold or when certain tags are detected.

For messages that navigate through without being discarded or rejected, two crucial headers are added: `X-Spam-Status` and `X-Spam-Result`. These headers provide invaluable information for end users, allowing them to establish their own filters using the Sieve scripting language (either with [ManageSieve](/docs/sieve/managesieve) or [JMAP Sieve](/docs/sieve/jmap)). On their scripts, users can use this information to filter messages based on the spam result (either 'yes' or 'no'), the spam score, or the presence of specific tags.

The `X-Spam-Status` header succinctly indicates whether the message is classified as spam. It provides a simple 'Yes' or 'No', determined by whether the message's score surpasses the predefined spam threshold, along with the final score. On the other hand, the `X-Spam-Result` header offers a detailed breakdown, listing each tag applied by the spam filter and the score associated with that tag.

Here's a practical illustration of what these headers might look like:

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

This detailed feedback empowers users and administrators alike, granting them the capability to make informed decisions about how to handle incoming emails.
