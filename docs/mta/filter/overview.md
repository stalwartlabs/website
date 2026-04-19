---
sidebar_position: 1
---

# Overview

Email filtering is an essential part of any modern mail server. Filtering covers the management of incoming and outgoing messages, blocking or flagging spam, removing viruses from attachments, automating the organisation of messages, and implementing user-defined rules for message handling. Effective filtering protects the security of the mail system and supports user productivity.

Stalwart supports several filtering mechanisms, which can be combined:

- [Spam filter](/docs/mta/filter/spam): a built-in spam and phishing filter.
- [Sieve scripts](/docs/sieve/overview): scripts written in the Sieve language, a standard scripting language for mail filtering. Sieve scripts let administrators and users specify rules for handling incoming mail.
- [Milter](/docs/mta/filter/milter): a dynamic extension for mail servers that allows external software to inspect or modify messages as they are being processed. Milters support spam filtering, virus scanning, and similar workflows.
- [MTA Hooks](/docs/mta/filter/mtahooks): an HTTP-based alternative to milter for managing and processing email transactions.
