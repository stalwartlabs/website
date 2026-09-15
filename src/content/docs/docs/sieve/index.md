---
sidebar_position: 1
title: "Overview"
---

Sieve is a scripting language for filtering and modifying email messages. Rather than inventing a proprietary DSL, Stalwart uses Sieve because it is an established [internet standard](https://www.rfc-editor.org/rfc/rfc5228.html) well suited to the range of filtering and transformation tasks encountered in email delivery.

A Sieve script consists of one or more rules, each combining a test and an action. The test inspects an attribute of the message, such as the sender's address or the subject line; the action specifies what to do when the test matches. This documentation focuses on how Sieve is integrated into Stalwart (interpreters, variables, [expressions](/docs/sieve/expressions), [function reference](/docs/sieve/reference), examples) rather than on Sieve syntax itself; tutorials covering the language are collected at [sieve.info](http://sieve.info).

Stalwart extends the standard Sieve language with its own [expression syntax](/docs/sieve/expressions) and a [rich set of built-in functions](/docs/sieve/reference) for DNS queries, directory lookups, SQL queries, hashing, image and MIME inspection, and more, all accessible from the `eval`, `let`, and `while` instructions.

## Testing scripts

Sieve has no statement for printing a value or writing to a log, and a script installed on the server runs unseen at delivery time, so checking a filter has traditionally meant sending test messages and looking at where they land. [Sievepad](https://sievepad.com) removes that round trip. It is a playground that runs the Stalwart Sieve interpreter in the browser, compiled to WebAssembly, so a script is compiled and executed by the same code the server uses, with no Stalwart installation involved. Scripts, test messages and settings are stored in the browser and are never uploaded.

The editor compiles the script as it is typed and underlines each error at the position reported by the compiler. Running the script against a test message lists the actions it takes, such as `fileinto`, `reject` or a vacation reply, and shows every message it modifies or generates. Envelope addresses, mailboxes, spam and virus scores, the current time and the other values a script can test are set per workspace, and a workspace can be shared as a link that carries its scripts inside the URL.

Sievepad supports the `vnd.stalwart.expressions` and `vnd.stalwart.while` extensions with the functions available to the [untrusted interpreter](/docs/sieve/interpreter/untrusted). Functions restricted to the [trusted interpreter](/docs/sieve/interpreter/trusted), which reach external systems such as DNS, HTTP, SQL, key-value stores and [LLM providers](/docs/sieve/llm), are not available, and a script that calls them fails to compile. A system script that omits `require`, which the trusted interpreter accepts while [`noCapabilityCheck`](/docs/ref/object/sieve-system-interpreter#nocapabilitycheck) is enabled, needs the same setting in Sievepad.

Examples in this documentation that run in Sievepad are followed by a "Try this script in Sievepad" link, which opens the example in Sievepad together with the test message and settings needed to exercise it.

## Supported extensions

The Sieve interpreter included in Stalwart supports the following extensions:

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
