---
sidebar_position: 1
---

# Overview

E-mail filtering is a crucial part of any modern mail server system. Filtering serves various purposes including the management of incoming and outgoing messages, blocking or flagging spam, removing viruses from attachments, automating organization of messages, and implementing various user-defined rules for message handling. Effective filtering is essential not only for the organization and security of the mail system but also for user productivity and the overall quality of the email experience.

Stalwart Mail Server supports various filtering mechanisms, which allow a high degree of flexibility and customization for system administrators to define their filtering rules and operations:

- [Spam filter](/docs/smtp/filter/spam): Stalwart Mail Server Server includes a comprehensive Spam and Phishing filter that provides a robust defense against such unwanted emails.

- [Sieve scripts](/docs/sieve/overview): These are scripts written in the Sieve language, a powerful, yet straightforward language specifically designed for mail filtering. Sieve scripts allow both [administrators](/docs/sieve/overview.md) and [users](/docs/jmap/sieve) to specify rules for how incoming mail should be handled.

- [Milter](/docs/smtp/filter/milter): Milter (short for "mail filter") is a dynamic extension for mail servers, which allows external software to inspect or modify messages as they're being processed. Milters can be used for a wide range of purposes, such as spam filtering, virus scanning, or adding footers to outgoing messages.

- [MTA Hooks](/docs/smtp/filter/mtahooks): MTA Hooks is a modern replacement for the milter protocol, designed to provide enhanced flexibility and ease of use for managing and processing email transactions within Mail Transfer Agents (MTAs). Unlike milter, which operates at a lower level and uses a custom protocol, MTA Hooks leverages the ubiquitous HTTP protocol, making it simpler to integrate and deploy.

