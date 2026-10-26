---
title: "SpamIpVariable"
description: "Variables available in expression contexts referencing SpamIpVariable."
custom_edit_url: null
---



Variables available in expression contexts that reference `SpamIpVariable`.

| Variable | Description |
|---|---|
| `ip` | IP address being checked; in DNSBL tag expressions, the address returned by the DNSBL |
| `value` | Same as ip |
| `ip_reverse` | Address in reversed form, as used for DNSBL queries, such as 1.0.0.127 for 127.0.0.1 (IPv6 as reversed nibbles) |
| `octets` | List of the address bytes (4 for IPv4, 16 for IPv6) |
| `is_v4` | Whether the address is IPv4 (boolean) |
| `is_v6` | Whether the address is IPv6 (boolean) |
| `remote_ip` | IP address of the client |
| `remote_ip.ptr` | First PTR name of the client IP in lowercase, empty when there is none |
| `helo_domain` | Host name given in EHLO, or unknown when none was sent |
| `authenticated_as` | Name of the authenticated account, empty when not authenticated |
| `asn` | Autonomous system number of the client, 0 when unknown |
| `country` | Country code of the client, empty when unknown |
| `is_tls` | Whether the message arrived over TLS (boolean) |
| `env_from` | Envelope sender in lowercase, empty for the null sender |
| `env_from.local` | Local part of the envelope sender |
| `env_from.domain` | Domain of the envelope sender |
| `env_to` | List of the original RCPT TO addresses in lowercase |
| `from` | Address in the From header in lowercase, empty when missing |
| `from.name` | Display name in the From header in lowercase |
| `from.local` | Local part of the From address |
| `from.domain` | Domain of the From address |
| `reply_to` | Address in the Reply-To header, empty when missing |
| `reply_to.name` | Display name in the Reply-To header |
| `reply_to.local` | Local part of the Reply-To address |
| `reply_to.domain` | Domain of the Reply-To address |
| `to` | List of addresses in the To header in lowercase |
| `to.name` | List of the display names in the To header (recipients without one are left out) |
| `to.local` | List of the local parts of the To addresses |
| `to.domain` | List of the domains of the To addresses |
| `cc` | List of addresses in the Cc header in lowercase |
| `cc.name` | List of the display names in the Cc header (recipients without one are left out) |
| `cc.local` | List of the local parts of the Cc addresses |
| `cc.domain` | List of the domains of the Cc addresses |
| `bcc` | List of addresses in the Bcc header in lowercase |
| `bcc.name` | List of the display names in the Bcc header (recipients without one are left out) |
| `bcc.local` | List of the local parts of the Bcc addresses |
| `bcc.domain` | List of the domains of the Bcc addresses |
| `body` | Text of the first body part, or the visible text of the HTML body when there is no plain text part |
| `body.text` | Same as body |
| `body.html` | Visible text of the first HTML body part (not the markup), empty when that part is plain text |
| `body.words` | List of the words and numbers in the first HTML body part, case preserved |
| `body.raw` | Whole raw message, headers included |
| `subject` | Subject in lowercase, trimmed |
| `subject.thread` | Subject in lowercase with reply and forward prefixes removed |
| `subject.words` | List of the words and numbers in the subject, case preserved |
| `location` | Where the checked element was found, such as env_from, from, subject, body_text or attachment |
| `spam_probability` | Spam probability from the classifier, from 0 to 1, or -1 when there is none (always -1 in DNSBL expressions) |