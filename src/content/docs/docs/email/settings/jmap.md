---
sidebar_position: 2
title: "Message and mailbox limits"
description: "Limits on message size, header size, mailbox nesting, mailbox membership and flags, and the errors JMAP, IMAP and SMTP clients receive when a limit is reached."
---

A message with a huge header, or a message filed in hundreds of mailboxes, is costly for the server to parse, index and synchronise to every client. Stalwart therefore bounds the size and shape of the messages and mailboxes it stores, so that a single client or sender cannot create such objects.

The limits apply to every access protocol. A message appended over IMAP, created or imported over JMAP, or received over SMTP is checked against the same values. They are set on the [Email](/docs/ref/object/email) singleton, found in the WebUI under <!-- breadcrumb:Email --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" /></svg> Email › Defaults, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" /></svg> Email › Encryption, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" /></svg> Email › Limits, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" /></svg> Email › Storage<!-- /breadcrumb:Email -->.

## Message size

Two fields bound the size of what is stored, one for the whole message and one for each attachment:

| Field | Default | Limit |
|---|---|---|
| [`maxMessageSize`](/docs/ref/object/email#maxmessagesize) | <!-- default:Email.maxMessageSize -->75 MB<!-- /default --> | Size of a whole message stored in a mailbox. |
| [`maxAttachmentSize`](/docs/ref/object/email#maxattachmentsize) | <!-- default:Email.maxAttachmentSize -->50 MB<!-- /default --> | Size of a single attachment. |

Mail received over SMTP meets another limit first. The SMTP server applies its own message size limit before a message reaches a mailbox, and that limit is configured on the [DATA stage](/docs/mta/inbound/data).

A related limit lives elsewhere. The number of messages that a single JMAP `Email/parse` request may parse is a JMAP protocol limit, [`parseLimitEmail`](/docs/ref/object/jmap#parselimitemail) on the [Jmap](/docs/ref/object/jmap) singleton, described with the other [JMAP limits](/docs/http/jmap/protocol).

## Header section

The top-level header section has limits of its own:

| Field | Default | Limit |
|---|---|---|
| [`maxHeaderSize`](/docs/ref/object/email#maxheadersize) | <!-- default:Email.maxHeaderSize -->512 KiB<!-- /default -->, minimum 1 KiB | Size in bytes of the top-level header section. |
| [`maxHeaderCount`](/docs/ref/object/email#maxheadercount) | <!-- default:Email.maxHeaderCount -->5000<!-- /default -->, minimum 100 | Number of header fields in the top-level header section. |

Both limits apply to the header section of the message itself, not to the headers of its MIME parts. A third limit is fixed: independently of these settings, a message may not carry more than 65534 header fields across all of its parts. A message that exceeds any of the three limits is refused, in the way of the protocol that carried it:

- JMAP `Email/set` and `Email/import` return a `tooLarge` error.
- IMAP `APPEND` fails with a tagged `NO [LIMIT]` response.
- SMTP refuses the message at the end of `DATA`, on both the MX and the submission ports, with the reply listed in [Message limits](/docs/mta/inbound/data#message-limits). Messages that Stalwart generates itself are not checked.

The description of the error names the limit that was exceeded, for example `An email header cannot exceed <n> bytes.` or `An email header cannot have more than <n> fields.`

## Mailboxes and flags per message

A message can carry metadata of its own: the mailboxes it belongs to and the flags set on it. Each is bounded:

| Field | Default | Limit |
|---|---|---|
| [`maxMailboxesPerEmail`](/docs/ref/object/email#maxmailboxesperemail) | <!-- default:Email.maxMailboxesPerEmail -->100<!-- /default --> | Number of mailboxes a single message can belong to. JMAP allows a message to be in several mailboxes at once; IMAP clients see each membership as a copy. |
| [`maxFlagsPerEmail`](/docs/ref/object/email#maxflagsperemail) | <!-- default:Email.maxFlagsPerEmail -->100<!-- /default --> | Number of flags on a single message. JMAP keywords and IMAP flags are the same values, so the limit covers both. |
| [`maxFlagLength`](/docs/ref/object/email#maxflaglength) | <!-- default:Email.maxFlagLength -->128<!-- /default --> bytes, maximum 1024 | Length of a single flag or keyword name. System flags such as `\Seen` are exempt from this check. |

These limits prevent growth only. An operation that leaves a message with fewer mailboxes or flags than before is always accepted. A message that already exceeds a lowered limit can therefore still be cleaned up. An operation that would push a message over a limit fails as follows:

| Limit | JMAP `Email/set` | IMAP |
|---|---|---|
| Mailboxes per message | `tooManyMailboxes` on `mailboxIds` | `NO [LIMIT] An email cannot belong to more than <n> mailboxes.` |
| Flags per message | `tooManyKeywords` on `keywords` | `NO [LIMIT] An email cannot have more than <n> keywords.` |
| Flag length | `invalidProperties` on `keywords` | `NO [LIMIT] Keywords cannot be longer than <n> bytes.` |

## Mailbox hierarchy

Mailboxes themselves are bounded in depth and in the length of their names:

| Field | Default | Limit |
|---|---|---|
| [`maxMailboxDepth`](/docs/ref/object/email#maxmailboxdepth) | <!-- default:Email.maxMailboxDepth -->10<!-- /default --> | Nesting depth of a mailbox below the account's top level. |
| [`maxMailboxNameLength`](/docs/ref/object/email#maxmailboxnamelength) | <!-- default:Email.maxMailboxNameLength -->255<!-- /default --> | Length of a single mailbox name. |

The following object body lowers the mailbox depth and the number of mailboxes a message may belong to:

```json
{
  "maxMailboxDepth": 6,
  "maxMailboxesPerEmail": 20
}
```

## Per-account object quotas

Besides the shape of individual objects, the server bounds how many objects an account can create. The Email singleton holds the default number of objects of each type. Each default applies to accounts that have no value of their own in their `quotas` map. [Quotas](/docs/auth/authorization/quotas) describes how the per-account values override them.

| Field | Default | Objects counted |
|---|---|---|
| [`maxMessages`](/docs/ref/object/email#maxmessages) | unlimited | Messages |
| [`maxMailboxes`](/docs/ref/object/email#maxmailboxes) | <!-- default:Email.maxMailboxes -->250<!-- /default --> | Mailboxes |
| [`maxIdentities`](/docs/ref/object/email#maxidentities) | <!-- default:Email.maxIdentities -->20<!-- /default --> | JMAP sending identities |
| [`maxSubmissions`](/docs/ref/object/email#maxsubmissions) | <!-- default:Email.maxSubmissions -->500<!-- /default --> | JMAP email submissions |
| [`maxMaskedAddresses`](/docs/ref/object/email#maxmaskedaddresses) | <!-- default:Email.maxMaskedAddresses -->5<!-- /default --> | [Masked addresses](/docs/email/management/masked-email) (Enterprise edition) |
| [`maxPublicKeys`](/docs/ref/object/email#maxpublickeys) | <!-- default:Email.maxPublicKeys -->5<!-- /default --> | Public keys for [encryption at rest](/docs/encryption) |

The remaining fields of the singleton control how messages are stored. [`compressionAlgorithm`](/docs/ref/object/email#compressionalgorithm) selects the compression applied to stored message data. [`encryptAtRest`](/docs/ref/object/email#encryptatrest) and [`encryptOnAppend`](/docs/ref/object/email#encryptonappend) are described in [Encryption at rest](/docs/encryption). The default folders created for new accounts are described in [IMAP and POP3](/docs/email/settings/imap#default-folders).
