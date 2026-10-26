---
sidebar_position: 1
title: "Overview"
description: "How Stalwart uses Sieve: system scripts run by the SMTP server, user scripts run at delivery, what each can do and see, the supported extensions, and how to test scripts."
---

Mail filtering is needed at two levels. Administrators need to accept, reject or change messages as the server receives them, according to rules that apply to everyone. Users need to sort their own mail into folders, forward it or answer it while they are away. Stalwart serves both needs with one language, Sieve.

Sieve ([RFC 5228](https://www.rfc-editor.org/rfc/rfc5228)) is a language for filtering email. A Sieve script is a sequence of tests and actions. A test inspects the message or its envelope, for example the sender's address or a header. An action decides what happens to the message, for example filing it into a folder, rejecting it or sending an automatic reply. The language has no loops over arbitrary data and no access to the file system, which means that scripts can be accepted from users and run on the server safely.

Stalwart runs Sieve scripts in two places. Administrators write system scripts, which the SMTP server runs while it receives a message, to accept, reject or modify the message before it is queued. Users write their own scripts, which run when a message is delivered to their mailbox, to sort it into folders, forward it or answer it. The two kinds of script run in separate interpreters with different capabilities, described below.

This section of the documentation covers how Sieve is integrated into Stalwart. Tutorials on the language itself are collected at [sieve.info](http://sieve.info).

Standard Sieve can test and act, but it cannot compute or look things up. Stalwart therefore extends the language with an [expression syntax](/docs/sieve/expressions) and a [library of functions](/docs/sieve/reference), available through the `eval` test and the `let` and `while` instructions.

## Two interpreters

System scripts and user scripts are written by people with different levels of trust, so they run in separate interpreters. System scripts run in the trusted interpreter, and user scripts in the untrusted interpreter. Both compile scripts with the same engine and support the same language, but they differ in what a script may do:

| | Trusted interpreter | Untrusted interpreter |
|---|---|---|
| Scripts | System scripts, [SieveSystemScript](/docs/ref/object/sieve-system-script) | Scripts uploaded by each user over [ManageSieve or JMAP](/docs/sieve/user-scripts), and global scripts published by the administrator as [SieveUserScript](/docs/ref/object/sieve-user-script) |
| Written by | Administrators | Users |
| Runs | During the SMTP session, at the stage whose `script` setting selects it | At delivery to the user's mailbox |
| Delivery actions | Not available: `fileinto`, `fcc`, `mailbox`, `mailboxid`, `mboxmetadata`, `servermetadata` | Available |
| Automatic replies | Not available: `vacation` and `vacation-seconds`, and neither is `duplicate` | Available |
| Message rejection and modification | `reject`, `discard`, `editheader`, `replace`, `enclose` and the other extensions | Available unless disabled with the untrusted interpreter's `disableCapabilities` setting |
| Expressions (`vnd.stalwart.expressions`) | All functions, including DNS, SQL, HTTP and AI model calls | A subset without external access, plus AI model calls for accounts with the `interactAi` permission ([Function reference](/docs/sieve/reference)) |
| Loops (`vnd.stalwart.while`) | Available | Not available |
| `require` declarations | Optional while the trusted interpreter's `noCapabilityCheck` setting is enabled | Required |
| Settings | [Trusted interpreter](/docs/sieve/interpreter/trusted) | [Untrusted interpreter](/docs/sieve/interpreter/untrusted) |

A system script that uses an extension the trusted interpreter does not provide, such as `fileinto`, fails at run time, and the failure is logged. It fails at its `require` statement or, when it omits `require`, at the action.

The division of labour is therefore clear. Filing messages into folders is the job of a user script, and deciding whether a message is accepted at all is the job of a system script.

## Execution points

System scripts are attached to the stages of the SMTP session: [connect](/docs/mta/inbound/connect), [EHLO](/docs/mta/inbound/ehlo), [MAIL FROM](/docs/mta/inbound/mail), [RCPT TO](/docs/mta/inbound/rcpt) and [DATA](/docs/mta/inbound/data). Each stage object has a `script` setting, an [expression](/docs/configuration/expressions/) that returns the name of the system script to run for the current session, or `false` to run none.

The stages apply to every SMTP session, including authenticated submissions. Messages submitted over JMAP pass through the MAIL FROM, RCPT TO and DATA stages in the same way, so a system script also sees mail that users send from a JMAP client.

User scripts run later, when a message is delivered to a local mailbox. They run once per recipient, after the message has passed the SMTP stages and the [spam filter](/docs/spamfilter/). Only the script the user has marked as active runs. It can include other scripts of the same user, as well as the global scripts. [User scripts](/docs/sieve/user-scripts) describes how users upload and activate their scripts.

Because the stages come at different points of the transaction, a script sees more of the message the later it runs. At connect time there is nothing but a client address, while at delivery the full message and the spam verdict are known:

| Where | Envelope | Message | Spam filter results |
|---|---|---|---|
| Connect, EHLO | none | none | none |
| MAIL FROM | `from` | none | none |
| RCPT TO | `from`; `to` and `orcpt` of the recipient being added | none | none |
| DATA (system script) | `from`; `to` and `orcpt` of all recipients | The message as the client sent it, with the changes made by milters and MTA hooks; not the trace and spam filter headers that Stalwart adds | `env.spam.score`, `env.spam.is_spam` |
| Delivery (user script) | `from`, `to`, `orcpt` | The message as queued, including `X-Spam-Result` and `X-Spam-Score` | The `spamtest` extension |

One header arrives too late for any script. The `X-Spam-Status` header is added when a message is stored, after the user script has run, so a user script cannot test it. It relies on `X-Spam-Score` or the `spamtest` extension instead. [Variables](/docs/sieve/variables) lists the environment variables of each stage, and [Spam filter](/docs/spamfilter/) describes the headers.

## Supported extensions

The base Sieve language is small, and most of its abilities come from extensions that a script declares with `require`. Both interpreters implement the following specifications. Every extension is available to user scripts unless the administrator disables it with [`disableCapabilities`](/docs/ref/object/sieve-user-interpreter#disablecapabilities). System scripts lack the extensions listed in the table above.

- [RFC 5228](https://www.rfc-editor.org/rfc/rfc5228): Sieve, including `fileinto`, `reject`, `envelope` and `encoded-character`
- [RFC 3894](https://www.rfc-editor.org/rfc/rfc3894): copying without side effects (`copy`)
- [RFC 5173](https://www.rfc-editor.org/rfc/rfc5173): body test (`body`)
- [RFC 5183](https://www.rfc-editor.org/rfc/rfc5183): environment (`environment`)
- [RFC 5229](https://www.rfc-editor.org/rfc/rfc5229): variables (`variables`)
- [RFC 5230](https://www.rfc-editor.org/rfc/rfc5230): vacation (`vacation`)
- [RFC 5231](https://www.rfc-editor.org/rfc/rfc5231): relational tests (`relational`)
- [RFC 5232](https://www.rfc-editor.org/rfc/rfc5232): IMAP flags (`imap4flags`)
- [RFC 5233](https://www.rfc-editor.org/rfc/rfc5233): subaddress (`subaddress`)
- [RFC 5235](https://www.rfc-editor.org/rfc/rfc5235): spam and virus tests (`spamtest`, `spamtestplus`, `virustest`)
- [RFC 5260](https://www.rfc-editor.org/rfc/rfc5260): date and index (`date`, `index`)
- [RFC 5293](https://www.rfc-editor.org/rfc/rfc5293): editing headers (`editheader`)
- [RFC 5429](https://www.rfc-editor.org/rfc/rfc5429): reject and extended reject (`reject`, `ereject`)
- [RFC 5435](https://www.rfc-editor.org/rfc/rfc5435): notifications (`enotify`)
- [RFC 5463](https://www.rfc-editor.org/rfc/rfc5463): testing for extensions (`ihave`)
- [RFC 5490](https://www.rfc-editor.org/rfc/rfc5490): mailbox status and metadata (`mailbox`, `mboxmetadata`, `servermetadata`)
- [RFC 5703](https://www.rfc-editor.org/rfc/rfc5703): MIME parts, iteration, replacement and enclosure (`mime`, `foreverypart`, `extracttext`, `replace`, `enclose`)
- [RFC 6009](https://www.rfc-editor.org/rfc/rfc6009): delivery status notifications and deliver-by (`envelope-dsn`, `envelope-deliverby`, `redirect-dsn`, `redirect-deliverby`)
- [RFC 6131](https://www.rfc-editor.org/rfc/rfc6131): vacation seconds parameter (`vacation-seconds`)
- [RFC 6134](https://www.rfc-editor.org/rfc/rfc6134): externally stored lists (`extlists`)
- [RFC 6558](https://www.rfc-editor.org/rfc/rfc6558): converting messages (`convert`)
- [RFC 6609](https://www.rfc-editor.org/rfc/rfc6609): include (`include`)
- [RFC 7352](https://www.rfc-editor.org/rfc/rfc7352): detecting duplicate deliveries (`duplicate`)
- [RFC 8579](https://www.rfc-editor.org/rfc/rfc8579): delivering to special-use mailboxes (`special-use`)
- [RFC 8580](https://www.rfc-editor.org/rfc/rfc8580): file carbon copy (`fcc`)
- [RFC 9042](https://www.rfc-editor.org/rfc/rfc9042): delivery by mailbox identifier (`mailboxid`)
- [draft-ietf-sieve-regex](https://datatracker.ietf.org/doc/draft-ietf-sieve-regex/): regular expressions (`regex`)

Two extensions are specific to Stalwart. `vnd.stalwart.expressions` adds [expressions](/docs/sieve/expressions) and the [function library](/docs/sieve/reference). `vnd.stalwart.while` adds `while` loops to system scripts.

Clients do not need to guess which extensions they may use. The capability list a ManageSieve or JMAP client receives names the extensions that are enabled for user scripts.

## Behaviour of existing scripts

The Sieve engine of this release differs from earlier releases in some details, and these can change the result of an existing script:

- A variable set inside a block, for example inside an `if`, keeps its value after the block ends, as RFC 5229 section 4 scopes variables to the whole script.
- `body :content "message/rfc822"` tests the decoded attached message, also when the attachment uses base64 or quoted-printable transfer encoding.
- `replace` inside `foreverypart` no longer shifts the identifiers of the parts that follow the replaced part.
- `replace` and `convert` on a single-part message keep every header field of the message except the `Content-*` fields, including `Message-ID`.
- `replace` without `:mime` and `convert` encode text that contains 8-bit characters or lines longer than 998 octets with quoted-printable or base64.
- `convert` from `text/plain` to `text/html` escapes `&` and `>`.
- Headers added with `addheader` are parsed like the message's own headers by the `address` and `date` tests.

The compiled form of scripts is handled automatically. Stored scripts are compiled again when an upgrade requires it, so no script needs to be uploaded again.

## Testing scripts

Sieve scripts are hard to debug on a live server. The language has no statement for printing a value or writing to a log, and a script installed on the server runs unseen at delivery time. Checking a filter on the server therefore means sending test messages and looking at where they land.

[Sievepad](https://sievepad.com) offers a faster loop. It is a playground that runs the Stalwart Sieve interpreter in the browser, compiled to WebAssembly. A script is therefore compiled and executed by the same code the server uses, with no Stalwart installation involved. Scripts, test messages and settings are stored in the browser and are never uploaded.

The editor compiles the script as it is typed, and underlines each error at the position reported by the compiler. Running the script against a test message lists the actions it takes, such as `fileinto`, `reject` or a vacation reply, and shows every message it modifies or generates.

A script's behaviour depends on its surroundings as much as on the message. Envelope addresses, mailboxes, spam and virus scores, the current time and the other values a script can test are therefore set per workspace. A workspace can be shared as a link that carries its scripts inside the URL.

Sievepad runs in a browser, without access to the server's systems, which limits what it can execute. It supports the `vnd.stalwart.expressions` and `vnd.stalwart.while` extensions with the functions available to the [untrusted interpreter](/docs/sieve/interpreter/untrusted). Functions restricted to the [trusted interpreter](/docs/sieve/interpreter/trusted), which reach external systems such as DNS, HTTP, SQL and key-value stores, are not available, and neither are [AI model calls](/docs/sieve/llm). A script that calls them fails to compile.

System scripts need one adjustment. A system script that omits `require`, which the trusted interpreter accepts while [`noCapabilityCheck`](/docs/ref/object/sieve-system-interpreter#nocapabilitycheck) is enabled, needs the same setting in Sievepad.

Examples in this documentation that run in Sievepad are followed by a "Try this script in Sievepad" link, which opens the example in Sievepad together with the test message and settings needed to exercise it.
