---
sidebar_position: 1
title: "Overview"
description: "The mail access protocols Stalwart serves (JMAP, IMAP and POP3), the listeners and settings that govern each, and how shared mailboxes behave over IMAP and JMAP."
---

Once mail has been delivered, users need to read it, sort it and keep it in step across their devices. Mail clients do this through one of three access protocols: JMAP, IMAP or POP3. This section describes how Stalwart serves those protocols and the limits that apply to the mail they reach.

Two related tasks are covered elsewhere. Sending mail uses SMTP submission, which is part of the [MTA](/docs/mta/). Users manage their own Sieve filters through [ManageSieve or JMAP for Sieve](/docs/sieve/user-scripts).

All protocols operate on the same mailboxes and messages. A message filed by one client is therefore visible to every other client of the account at once, whichever protocol each one uses.

## Protocols

The three protocols differ in age, transport and abilities, and each is served and configured in its own way:

| Protocol | Specification | Listener `protocol` | Default port | Settings |
|---|---|---|---|---|
| JMAP for Mail | [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620), [RFC 8621](https://www.rfc-editor.org/rfc/rfc8621) | `http` | 443 (TLS), 8080 | [Jmap](/docs/ref/object/jmap), [Email](/docs/ref/object/email) |
| IMAP4rev2 and IMAP4rev1 | [RFC 9051](https://www.rfc-editor.org/rfc/rfc9051), [RFC 3501](https://www.rfc-editor.org/rfc/rfc3501) | `imap` | 993 (implicit TLS) | [Imap](/docs/ref/object/imap), [Email](/docs/ref/object/email) |
| POP3 | [RFC 1939](https://www.rfc-editor.org/rfc/rfc1939) | `pop3` | 995 (implicit TLS) | [Imap](/docs/ref/object/imap), [Email](/docs/ref/object/email) |

JMAP (JSON Meta Application Protocol) is the most recent of the three. It is an HTTP-based protocol in which a client sends batches of JSON method calls, and receives push notifications of changes. One JMAP session covers mail, calendars, contacts and files. JMAP is served by the HTTP listener, the same one that serves the WebUI, so no separate listener is needed.

IMAP is the established protocol for synchronising mailboxes with desktop and mobile clients. Stalwart implements IMAP4rev2 and IMAP4rev1, together with the [extensions](/docs/development/rfcs#imap4) that clients rely on.

POP3 is far simpler. It downloads messages from the inbox, and offers no folders or synchronisation of state. It is provided for devices and applications that support nothing else.

The protocol settings are held by three singletons, divided by what they govern:

- [Jmap](/docs/ref/object/jmap) holds the JMAP request and push limits, described in [JMAP](/docs/http/jmap/).
- [Imap](/docs/ref/object/imap) holds the IMAP settings and also applies to POP3, as described in [IMAP and POP3](/docs/email/settings/imap).
- [Email](/docs/ref/object/email) holds the limits that apply to messages and mailboxes whichever protocol is used, described in [Message and mailbox limits](/docs/email/settings/jmap).

## Listeners

Each protocol is served by a [NetworkListener](/docs/ref/object/network-listener), found in the WebUI under <!-- breadcrumb:NetworkListener --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › Listeners<!-- /breadcrumb:NetworkListener -->. The listener's [`protocol`](/docs/ref/object/network-listener#protocol) field selects the protocol. A new installation has listeners for HTTP on ports 443 and 8080, IMAP on 993, POP3 on 995, ManageSieve on 4190, and SMTP on 25 and 465.

The cleartext ports 143 and 110 are the exception: their listeners are not created by default. The following objects add them. Clients connecting to these ports must upgrade the connection with `STARTTLS` (IMAP) or `STLS` (POP3) before they can authenticate, unless [`allowPlainTextAuth`](/docs/ref/object/imap#allowplaintextauth) is enabled:

```json
[
  {"name": "imap", "protocol": "imap", "bind": {"[::]:143": true}},
  {"name": "pop3", "protocol": "pop3", "bind": {"[::]:110": true}}
]
```

A listener with [`implicitTls`](/docs/ref/object/network-listener#implicittls) set to `true` starts TLS as soon as the connection is opened, as on ports 993 and 995. [Listeners](/docs/server/listener) describes the other fields.

A protocol that an installation does not need can be removed. POP3, for example, is removed by deleting its listener.

## Search and metadata

Searches issued over IMAP and JMAP cover the text of attachments as well as the message body. When Stalwart indexes a message, it extracts the text of common document formats, and searches use that text. [Attachment text extraction](/docs/storage/text-extraction) lists the formats and limits.

Clients can also store annotations of their own. Annotations that IMAP clients store with the METADATA extension, and the equivalent JMAP and WebDAV properties, are described in [Object metadata](/docs/server/metadata).

## Shared mailboxes

A user can share a mailbox with other accounts, for example a team inbox, and grant each of them a set of rights, as described in [Sharing](/docs/collaboration/sharing). The two protocols express those rights differently. IMAP clients set and read the rights with the ACL extension ([RFC 4314](https://www.rfc-editor.org/rfc/rfc4314)), whose rights are single letters. JMAP clients read them in the `myRights` property of a mailbox. Both refer to the same rights stored on the mailbox, and the following table maps one to the other:

| IMAP right | Meaning | JMAP `myRights` |
|---|---|---|
| `l` | See the mailbox in the folder list. | (`mayReadItems` requires both `l` and `r`) |
| `r` | Read messages. | `mayReadItems` |
| `s`, `w` | Change the seen flag and other flags. Stalwart grants and revokes both letters together. | `maySetSeen`, `maySetKeywords` |
| `i` | Add messages, by copying, moving or appending. | `mayAddItems` |
| `t`, `e` | Mark messages as deleted and expunge them. Stalwart grants and revokes both letters together. | `mayRemoveItems` |
| `k` | Create child mailboxes. | `mayCreateChild` |
| `x` | Delete or rename the mailbox. Stalwart grants and revokes both rights together. | `mayDelete`, `mayRename` |
| `n` | Set shared metadata (annotations) on the mailbox. | `maySetMetadata` |
| `p` | Submit messages to the mailbox. | `maySubmit` |
| `a` | Change the rights of other users. | `mayShare` |

An account always has every right on its own mailboxes. The rights matter for a sharee, an account to which another account has shared a mailbox. Over IMAP, the rights of a sharee determine what a client may do in that mailbox:

- `SELECT` opens the mailbox with `[READ-WRITE]` only if the sharee may add messages, remove messages or change flags. Otherwise, and always for `EXAMINE`, the mailbox is opened with `[READ-ONLY]`. A sharee without the read right receives `NO [NOPERM] You do not have the required permissions to read this mailbox.`
- The `PERMANENTFLAGS` response lists the flags the sharee may change: all flags, all flags except `\Deleted`, only `\Deleted`, or none.
- Storing `\Deleted` requires the delete right, and storing any other flag, including `\Seen` set implicitly by fetching `BODY[]`, requires the write right. A `STORE` command fails only when none of the named flags may be changed. Otherwise the flags that may not be changed are dropped silently and the response reports the flags the message has after the command.
- A message that the owner has filed in several folders can be modified only if the sharee holds the required right on each of them.
- `CLOSE`, `EXPUNGE`, `UID EXPUNGE`, `MOVE` and `UID MOVE` remove messages from a shared mailbox only with the expunge right. `CLOSE` after `EXAMINE` never expunges.
- Deleting a shared folder that still contains messages requires the right to delete messages in addition to the right to delete the folder.

Over JMAP, `Email/set` applies the same rules to keywords, the JMAP equivalent of IMAP flags. Changing any keyword requires `maySetKeywords` on every mailbox the message is in. Otherwise, the change fails with a `forbidden` error, `You are not allowed to modify keywords.`. Adding or removing `$deleted` requires `mayRemoveItems` on those mailboxes in addition, and fails with `You are not allowed to change the $deleted keyword.` otherwise.
