---
sidebar_position: 8
title: "Phishing protection"
---

Phishing is a deceptive technique used by attackers to trick recipients into revealing sensitive information, such as passwords or credit card numbers. Typical phishing attacks use counterfeit emails, websites, or messages that appear to come from a legitimate source. Over time, phishing attempts have become more sophisticated and harder to distinguish from genuine communications.

Stalwart includes built-in mechanisms that analyse attributes of incoming messages, including embedded URLs, domain reputation, and content patterns commonly associated with phishing. Combined with an up-to-date knowledge base, this allows Stalwart to identify subtle phishing attempts and flag them so that administrators and end users can take appropriate precautions.

## URL analysis

The phishing filter analyses every URL in the message for a range of deceptive patterns.

### Homograph attacks

An Internationalized Domain Name (IDN) homograph attack exploits the resemblance between characters from distinct scripts to create deceptive URLs. These URLs appear to be legitimate but use characters from different scripts that look similar to the expected Latin characters. For example, an attacker may substitute the Cyrillic "а" for the Latin "a" to craft a fake domain that resembles a known brand.

Stalwart's phishing filter scans both HTML and plain text parts of a message to detect URLs that look like the result of a homograph attack. When such a URL is identified, the message is tagged with `HOMOGRAPH_URL`, which carries a high spam score.

The filter also flags URLs that combine Unicode characters from multiple scripts even when no specific homograph is detected. Such URLs are tagged with `MIXED_CHARSET_URL`. These are not necessarily malicious, but their presence is suspicious enough to warrant a warning.

### Phishing databases

Stalwart's phishing filter can consult external phishing databases that maintain lists of URLs identified as part of active phishing campaigns. The two primary databases used are:

- **OpenPhish**: a community-driven platform that gathers, verifies, and shares phishing URLs from industry partners, voluntary contributors, and automated crawlers.
- **PhishTank**: operated by OpenDNS, a collaborative platform where users submit, verify, and share phishing URLs.

Both lists are configured as [HTTP lookup lists](/docs/storage/lookup/remote). The refresh interval controls how often Stalwart downloads the latest version of each list.

### Zero-width spaces

Zero-width spaces are non-printing Unicode characters. Attackers sometimes insert them inside URLs to obscure the real target while leaving the URL visually unchanged to the reader. The phishing filter scans for zero-width spaces inside URLs and flags any it finds.

### Obscured Unicode characters

Attackers can also embed certain Unicode characters inside URLs to disguise the true target while presenting a seemingly safe link to the user. Stalwart's phishing filter identifies these manipulations as part of its URL examination.

### Link verification

A common phishing tactic is to display a legitimate-looking URL in the visible text of a hyperlink while pointing the `href` attribute at a different, malicious site. The phishing filter compares the hostname in the `a href` attribute of each hyperlink against the hostname in the visible, clickable text. If the two differ, the link is treated as deceptive and the message is flagged.

### Shortened URLs

URL shortening services are convenient but can also be used to mask the true destination of a link. Stalwart's phishing filter recognises URLs served by known shorteners and expands them to their original form, so that the full target can be analysed for phishing indicators.

## Sender analysis

The phishing filter also inspects message headers, which frequently carry telltale signs of phishing attempts. The `From`, `To`, and `Reply-To` headers in particular are common targets for manipulation.

### Spoofed sender

A spoofed sender address involves a display name that resembles a trusted domain, while the actual email address (in angle brackets) belongs to a completely different domain. The aim is to exploit the recipient's trust in a familiar name.

For example, a message might display the sender as `From: "user@my-bank.test" <user@cybercriminal.test>`. The display name suggests a message from `my-bank.test`, while the actual sender is `cybercriminal.test`. Stalwart's phishing filter flags such discrepancies between the display name and the address.

### Spoofed Reply-To

In a spoofed Reply-To attack, the `Reply-To` header directs replies to an email address that belongs to a different party from the apparent sender. This is often used to collect responses under the guise of a trusted organisation.

For example, a message might be sent from a legitimate-looking address, while the `Reply-To` header directs replies to a different, unrelated domain. The phishing filter compares the `Reply-To` header against the `From` header and flags mismatches, particularly when the reply-to domain has no clear relationship to the sender's domain.
