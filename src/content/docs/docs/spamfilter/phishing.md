---
sidebar_position: 8
title: "Phishing protection"
description: "The checks the spam filter applies to links and sender addresses to detect phishing, the phishing feeds it consults, and the tags and scores they produce."
---

A phishing message imitates a trusted organisation, such as a bank or an employer, to make the recipient act against their own interest: open a link to a fraudulent site, enter credentials, or reply to the attacker. The text of such a message is often indistinguishable from a legitimate one. Detection therefore relies on what the message cannot hide, which is where its links really lead and who really sent it.

The spam filter works on both. It examines every link and sender address of a message for the techniques used to disguise them, and it checks the links against public feeds of known phishing sites. Each finding adds a tag, and the tag's score counts towards the [spam score](/docs/spamfilter/settings/scores). The scores below are those of the rule set, and can be changed like any other tag score.

## Links

A disguised link shows the reader one destination and leads to another. The filter looks for the common ways of achieving this, from link text that names a different domain to host names built from look-alike characters:

| Tag | Score | Finding |
|---|---|---|
| `PHISHED_OPENPHISH`, `PHISHED_PHISHTANK` | 7.0 | The link is listed by the OpenPhish or PhishTank feed of active phishing sites. |
| `PHISHING` | 4.0 | The visible text of an HTML link is itself a URL, in a different domain from the one the link actually points to. |
| `HOMOGRAPH_URL` | 5.0 | The host name uses characters from another script that look like Latin letters, such as a Cyrillic `а` in place of `a`, and the look-alike name exists in DNS. |
| `MIXED_CHARSET_URL` | 7.0 | The host name mixes characters from several scripts. |
| `ZERO_WIDTH_SPACE_URL` | 7.0 | The link contains invisible zero-width characters, which can make it look different from where it leads. |
| `SUSPICIOUS_URL` | 5.0 | The link contains invisible or direction-changing Unicode characters, or its host is an IP address. |
| `REDIRECTOR_URL` | 0.0 | The link uses a redirection service; the filter follows it and analyses the destination, as described in [Domain lists](/docs/spamfilter/settings/domain-lists#url-redirectors). |
| `URL_REDIRECTOR_INSECURE` | 2.0 | A redirection uses plain `http://`. The filter does not follow it. |
| `HTML_META_REFRESH_URL` | 5.0 | The HTML part redirects the reader to a URL automatically. |

Two other parts of the filter also see the links. The URL and domain [DNS blocklists](/docs/spamfilter/dnsbl) check them, and add tags such as `DBL_PHISH` (7.5) and `SURBL_HASHBL_PHISH` (6.5). The [AI classifier](/docs/spamfilter/ai/), when enabled, is given the real destination of each link.

## Phishing feeds

Phishing sites are often short-lived, and feeds of active phishing sites track the ones in use at the moment. The rule set configures two of them as [HTTP lookups](/docs/configuration/expressions/lookup/remote), which Stalwart downloads and keeps in memory:

| Lookup | Source | Refreshed |
|---|---|---|
| `stwt_openphish` | [OpenPhish](https://openphish.com), a feed compiled from automated crawling and partner reports | Every 12 hours |
| `stwt_phishtank` | [PhishTank](https://phishtank.org), a community-verified database | Every 6 hours |

The rules `STWT_PHISHED_OPEN` and `STWT_PHISHED_TANK` compare each link of the message with these lists. To stop using a feed, set `enable` to `false` either on its HTTP lookup or on the rule. [Rule set updates](/docs/spamfilter/settings/general#rule-set-updates) keep that setting, so the feed stays disabled after an update.

## Sender addresses

A phishing message also has to look as if it came from the organisation it imitates. Because the real `From` address would give the attacker away, the message often hides it behind a display name, or sends the replies elsewhere:

| Tag | Score | Finding |
|---|---|---|
| `SPOOF_DISPLAY_NAME` | 8.0 | The display name of the `From` header contains an email address in another domain than the sender's, as in `"billing@bank.example" <attacker@example.net>`. |
| `FROM_NEQ_DISPLAY_NAME` | 4.0 | The display name of the `From` header contains an email address that is not the sender's, in the same domain. |
| `SPOOF_REPLYTO` | 6.0 | The `Reply-To` header directs replies to a domain unrelated to the sender's, in a message that is not from a mailing list. |

The [authentication tags](/docs/spamfilter/settings/scores#authentication-tags) complement these checks. DMARC lets a domain owner state how receivers should treat mail that claims the domain but fails authentication. A message that claims a domain in its `From` header but fails that domain's DMARC policy therefore receives `DMARC_POLICY_REJECT` or `DMARC_POLICY_QUARANTINE`.
