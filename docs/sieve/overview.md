---
sidebar_position: 1
---

# Overview

Sieve is a scripting language used to filter and modify email messages. It provides a flexible and powerful way to manage email messages by automatically filtering, sorting, and transforming them based on a wide range of criteria.  Rather than relying on a proprietary DSL, Stalwart Mail Server uses Sieve as its default scripting language primarily because it is sufficiently powerful to handle most filtering tasks and is an established [internet standard](https://www.rfc-editor.org/rfc/rfc5228.html).

A typical Sieve script consists of one or more rules, each consisting of a test and an action. The test checks a specific attribute of the message, such as the sender's address or the subject line, while the action specifies what to do with the message if it matches the test. This manual does not cover how to write Sieve scripts but tutorials and examples can be found at [https://sieve.info](https://sieve.info).

The Sieve interpreter included in Stalwart Mail Server supports the following extensions:

- [RFC 5228 - Sieve: An Email Filtering Language](https://datatracker.ietf.org/doc/html/rfc5228)
- [RFC 3894 - Copying Without Side Effects](https://datatracker.ietf.org/doc/html/rfc3894)
- [RFC 5173 - Body Extension](https://datatracker.ietf.org/doc/html/rfc5173)
- [RFC 5183 - Environment Extension](https://datatracker.ietf.org/doc/html/rfc5183)
- [RFC 5229 - Variables Extension](https://datatracker.ietf.org/doc/html/rfc5229)
- [RFC 5230 - Vacation Extension](https://datatracker.ietf.org/doc/html/rfc5230)
- [RFC 5231 - Relational Extension](https://datatracker.ietf.org/doc/html/rfc5231)
- [RFC 5232 - Imap4flags Extension](https://datatracker.ietf.org/doc/html/rfc5232)
- [RFC 5233 - Subaddress Extension](https://datatracker.ietf.org/doc/html/rfc5233)
- [RFC 5235 - Spamtest and Virustest Extensions](https://datatracker.ietf.org/doc/html/rfc5235)
- [RFC 5260 - Date and Index Extensions](https://datatracker.ietf.org/doc/html/rfc5260)
- [RFC 5293 - Editheader Extension](https://datatracker.ietf.org/doc/html/rfc5293)
- [RFC 5429 - Reject and Extended Reject Extensions](https://datatracker.ietf.org/doc/html/rfc5429)
- [RFC 5435 - Extension for Notifications](https://datatracker.ietf.org/doc/html/rfc5435)
- [RFC 5463 - Ihave Extension](https://datatracker.ietf.org/doc/html/rfc5463)
- [RFC 5490 - Extensions for Checking Mailbox Status and Accessing Mailbox Metadata](https://datatracker.ietf.org/doc/html/rfc5490)
- [RFC 5703 - MIME Part Tests, Iteration, Extraction, Replacement, and Enclosure](https://datatracker.ietf.org/doc/html/rfc5703)
- [RFC 6009 - Delivery Status Notifications and Deliver-By Extensions](https://datatracker.ietf.org/doc/html/rfc6009)
- [RFC 6131 - Sieve Vacation Extension: "Seconds" Parameter](https://datatracker.ietf.org/doc/html/rfc6131)
- [RFC 6134 - Externally Stored Lists](https://datatracker.ietf.org/doc/html/rfc6134)
- [RFC 6558 - Converting Messages before Delivery](https://datatracker.ietf.org/doc/html/rfc6558)
- [RFC 6609 - Include Extension](https://datatracker.ietf.org/doc/html/rfc6609)
- [RFC 7352 - Detecting Duplicate Deliveries](https://datatracker.ietf.org/doc/html/rfc7352)
- [RFC 8579 - Delivering to Special-Use Mailboxes](https://datatracker.ietf.org/doc/html/rfc8579)
- [RFC 8580 - File Carbon Copy (FCC)](https://datatracker.ietf.org/doc/html/rfc8580)
- [RFC 9042 - Delivery by MAILBOXID](https://datatracker.ietf.org/doc/html/rfc9042)
- [REGEX-01 - Regular Expression Extension (draft-ietf-sieve-regex-01)](https://www.ietf.org/archive/id/draft-ietf-sieve-regex-01.html)
