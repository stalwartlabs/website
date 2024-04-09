---
sidebar_position: 6
---

# Phishing Protection

Phishing is a deceptive technique employed by cybercriminals to trick individuals into revealing sensitive information, such as passwords, credit card numbers, and other personal details. Typically, these attacks use counterfeit emails, websites, or messages that appear to be from legitimate sources, luring the unsuspecting user into providing their data. As cyber threats evolve, phishing attempts have become more sophisticated, sometimes making them challenging to distinguish from genuine communications.

Stalwart Mail Server recognizes the potential risks posed by phishing and is equipped with robust built-in mechanisms to detect and thwart such malicious attempts. The server analyzes various attributes of incoming emails, including embedded URLs, domain reputation, and email content patterns commonly associated with phishing schemes. By constantly updating its knowledge base and employing advanced algorithms, Stalwart Mail Server can identify even the most subtle phishing attempts, ensuring users are protected from deceptive emails. Any suspected phishing email is flagged, allowing administrators and end-users to take appropriate precautions and prevent potential data breaches.

## URL analysis

The phishing filter also analyzes every URL in the message for a variety of deceptive patterns, ensuring maximum protection against phishing and other malicious tactics.

### Homograph attacks

An Internationalized Domain Name (IDN) homograph attack is a malicious technique wherein attackers exploit the resemblance between different characters from distinct scripts to create deceptive URLs. These URLs, at a cursory glance, appear to be legitimate and familiar domain names. However, they use characters from different scripts or languages that look similar to expected Latin characters. For instance, using the Cyrillic "а" (which looks like the Latin "a") to craft a fake domain that seems like a known brand or website.

Stalwart Mail Server's phishing filter is adept at identifying these deceptive tactics. The filter thoroughly scans both HTML and plain text parts of messages to detect any URL that might be a result of a homograph attack. Upon identifying such a URL, the filter tags the email with **HOMOGRAPH_URL**, indicating a potential deceptive link within the message. This tag carries a high spam score, emphasizing the malicious nature of the content.

Additionally, the phishing filter remains vigilant against URLs that might not be overtly malicious but still raise suspicion. For instance, if a URL combines Unicode characters from multiple scripts, it's tagged with **MIXED_CHARSET_URL**. While such a URL might not always have malicious intent, its presence is deemed suspicious, and users are alerted to exercise caution.

### Phishing databases

An important component of Stalwart Mail Server's phishing filter is its reliance on comprehensive phishing databases. These databases collate and maintain lists of URLs identified as part of phishing campaigns, ensuring that the filter has an updated reference to compare against incoming emails. Two primary databases that the phishing filter consults are:

- **OpenPhish**: A community-driven platform that gathers, verifies, and shares phishing URLs. OpenPhish's extensive list is derived from various sources, including industry partners, voluntary contributors, and automated crawlers.
- **PhishTank**: Operated by the cybersecurity company OpenDNS, PhishTank allows users to submit, verify, and share phishing URLs. It's a collaborative platform where the community actively participates in identifying and flagging phishing attempts.

To ensure optimal protection, it's crucial that the phishing filter references the most recent data. The frequency with which Stalwart Mail Server refreshes its connection to these databases can be configured by administrators. The configuration settings for this refresh rate are located in the `spam-filter` script.

### Zero Width Spaces

Zero width spaces are non-printing characters that, as the name suggests, have no width. They are often inserted within URLs to obscure them, making malicious URLs appear legitimate. For instance, an attacker could insert a zero width space in a well-known domain name, causing the URL to bypass rudimentary filters while appearing unchanged to the human eye. The phishing filter actively scans for the presence of these spaces in URLs, ensuring that such deceptive tactics are identified and flagged.

### Obscured Unicode Characters

Attackers can employ certain Unicode characters that might look benign or be easily overlooked but serve to disguise the true nature of a URL. By embedding these obscured characters in URLs, cybercriminals aim to bypass security measures while presenting a seemingly safe link to users. Stalwart Mail Server's phishing filter is equipped to detect such manipulations, adding an additional layer of scrutiny to URL examination.

### Link Verification

One common phishing tactic involves displaying a legitimate-looking URL as the clickable text in a hyperlink while directing users to a different, malicious site when they click on it. To counteract this, the phishing filter verifies every link in the HTML message parts. It ensures that the hostname in the `a href=""` attribute matches the hostname in the visible, clickable text. If a discrepancy is found, it's a strong indicator of a deceptive link, and the message is flagged accordingly.

### Shortened URLs

URL shortening services are often used to create short, easy-to-share links. However, these services can also be exploited by attackers to mask the true destination of a URL. Stalwart Mail Server's phishing filter is equipped to identify such shortened URLs and expand them to their original form. This allows the filter to analyze the full URL and determine if it's part of a phishing attempt.

## Sender analysis

Stalwart Mail Server doesn't just stop at analyzing the content and URLs of a message, it also inspects the headers of an email, which often carry telltale signs of phishing attempts. Key headers like the From, To, and Reply-To are under constant scrutiny, as they are frequent targets for manipulation by cybercriminals.

### Spoofed Sender

A spoofed sender address involves the use of a deceptive "From" name that appears to come from a legitimate or trusted domain, but the actual email address (enclosed in angle brackets) belongs to a different domain. This tactic is designed to exploit users' trust in familiar names or brands.

For example, a message might display the sender as `From: "user@my-bank.com" <user@cybercriminal.com>`. Here, while the displayed name suggests the email is from "my-bank.com", the actual sender's address is from "cybercriminal.com". Upon detecting such discrepancies between the displayed name and the actual email address, the phishing filter flags the message as suspicious, alerting users to the potential threat.

### Spoofed Reply-To

In a spoofed Reply-To attack, the "Reply-To" header is manipulated to direct replies to an email address different from the sender's address. Often, this is a tactic used to collect responses or personal information from unsuspecting users, believing they are communicating with a trusted entity.

For example, an email might be sent from a legitimate-looking address, but the "Reply-To" directs responses to a completely different domain, unassociated with the sender. Stalwart's phishing filter diligently checks the "Reply-To" header against the "From" header. If it detects a mismatch, especially if the reply-to domain has no clear relation to the sender's domain, the message is flagged, ensuring users remain cautious before responding.

