---
sidebar_position: 1
---

# Overview

Email filtering is a crucial part of any modern mail server system. Filtering serves various purposes including the management of incoming and outgoing messages, blocking or flagging spam, removing viruses from attachments, automating organization of messages, and implementing various user-defined rules for message handling. Effective filtering is essential not only for the organization and security of the mail system but also for user productivity and the overall quality of the email experience.

Stalwart SMTP supports various filtering mechanisms, which allow a high degree of flexibility and customization for system administrators to define their filtering rules and operations:

- [Sieve scripts](/docs/smtp/filter/sieve): These are scripts written in the Sieve language, a powerful, yet straightforward language specifically designed for mail filtering. Sieve scripts allow both [administrators](/docs/smtp/filter/sieve.md) and [users](/docs/jmap/sieve) to specify rules for how incoming mail should be handled.

- [Milter](/docs/smtp/filter/milter): Milter (short for "mail filter") is a dynamic extension for mail servers, which allows external software to inspect or modify messages as they're being processed. Milters can be used for a wide range of purposes, such as spam filtering, virus scanning, or adding footers to outgoing messages.

- [Pipes](/docs/smtp/filter/pipe): For more specialized or complex filtering needs, Stalwart SMTP allows the use of external executable files, called "pipes". These pipes can take an email message, perform some operation, and return the modified message.

- [DNS Block Lists](/docs/smtp/filter/dnsbl): In addition to the above mechanisms, Stalwart SMTP also supports the use of DNS Block Lists (DNSBLs). DNSBLs are used primarily to block or flag email from known spam sources. They provide an efficient method to prevent spam from ever reaching your mail server or user inboxes.

