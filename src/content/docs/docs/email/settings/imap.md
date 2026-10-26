---
sidebar_position: 3
title: "IMAP and POP3"
description: "Authentication, timeouts, request and message limits, METADATA and default folders for the IMAP and POP3 servers."
---

IMAP and POP3 sessions are long-lived and driven by clients the administrator does not control, so the server needs rules for how clients authenticate, how long idle sessions last and how much work one command may cause. These rules are protocol settings, and the IMAP and POP3 servers share one set of them. They are held by the [Imap](/docs/ref/object/imap) singleton, found in the WebUI under <!-- breadcrumb:Imap --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › IMAP<!-- /breadcrumb:Imap -->.

The settings on this page apply to both protocols, unless a section names only one of them. The authentication and rate-limit settings also apply to [ManageSieve](/docs/sieve/user-scripts). Listeners, ports and TLS are configured separately, on each [NetworkListener](/docs/ref/object/network-listener), as described in the [protocol overview](/docs/email/). One detail is not configurable: the IMAP greeting, `Stalwart IMAP4rev2 at your service.`, is fixed.

## Authentication

A password sent over a cleartext connection can be read by anyone on the network path. Whether credentials may cross an unencrypted connection is therefore a setting, [`allowPlainTextAuth`](/docs/ref/object/imap#allowplaintextauth), which is <!-- default:Imap.allowPlainTextAuth as=enabled -->disabled<!-- /default --> unless it is changed. A client on a cleartext connection must therefore first upgrade it with `STARTTLS` (IMAP) or `STLS` (POP3).

Repeated failures are also bounded. A client that keeps failing to sign in is disconnected after [`maxAuthFailures`](/docs/ref/object/imap#maxauthfailures) failed attempts in one session, <!-- default:Imap.maxAuthFailures -->3<!-- /default --> by default.

Clients see the setting in the responses they receive. While `allowPlainTextAuth` is disabled, no SASL mechanism is offered on a cleartext connection. IMAP announces `LOGINDISABLED` in its capability list, and answers an `AUTHENTICATE` command with `NO [PRIVACYREQUIRED] Cannot authenticate over plain-text.` The POP3 `CAPA` response lists no SASL mechanisms, and a POP3 login is answered with `-ERR Cannot authenticate over plain-text.` POP3 has several login methods, `USER`/`PASS`, `APOP` and `AUTH`, and every one of them passes through the same checks and the same rate limit.

`allowPlainTextAuth` covers password mechanisms only. Tokens follow a stricter rule. The `OAUTHBEARER` and `XOAUTH2` mechanisms, which carry an OAuth access token or an [API key](/docs/auth/authentication/api-key) in place of a password, are advertised and accepted only on TLS connections, whatever the value of the setting. The same rule applies to SMTP and ManageSieve. [TLS on the mail protocols](/docs/auth/oauth/mail-clients#tls-on-the-mail-protocols) lists the responses a client receives on a cleartext connection. A token must also carry the `mail` scope to be accepted for these protocols.

Behind a TLS-terminating proxy, the server cannot see the TLS session itself. A connection forwarded by such a proxy counts as encrypted only when the proxy sends a [PROXY protocol](/docs/server/reverse-proxy/proxy-protocol) version 2 header with the SSL TLV.

The check is skipped in [bootstrap mode](/docs/configuration/bootstrap-mode), which runs the setup wizard on a new installation, and [recovery mode](/docs/configuration/recovery-mode), the maintenance mode for repairing a configuration. [Mail, calendar and contacts clients](/docs/auth/oauth/mail-clients) describes which clients can use OAuth.

The number of connections and requests an account may open is limited separately, as described in [Rate limiting](/docs/email/settings/ratelimit).

## Timeouts

Idle sessions hold resources on the server, so the server closes a session that stays inactive for longer than its timeout. Each timeout is a duration in milliseconds, and the one that applies depends on the state of the session:

| Field | Default | Applies to |
|---|---|---|
| [`anonymousTimeout`](/docs/ref/object/imap#anonymoustimeout) | <!-- default:Imap.anonymousTimeout -->1 minute<!-- /default --> | Sessions that have not authenticated. |
| [`authenticatedTimeout`](/docs/ref/object/imap#authenticatedtimeout) | <!-- default:Imap.authenticatedTimeout -->30 minutes<!-- /default --> | Authenticated sessions. |
| [`idleTimeout`](/docs/ref/object/imap#idletimeout) | <!-- default:Imap.idleTimeout -->30 minutes<!-- /default --> | IMAP sessions in the `IDLE` state. |

The protocol constrains how low the timeouts for authenticated sessions may go. [RFC 9051](https://www.rfc-editor.org/rfc/rfc9051#section-5.4) requires an inactivity timer of at least 30 minutes for authenticated IMAP sessions. Lowering `authenticatedTimeout` or `idleTimeout` below that value therefore disconnects clients that are behaving correctly. The timeout for unauthenticated sessions has no such constraint, and the following object body shortens it:

```json
{
  "anonymousTimeout": 30000
}
```

## Request size

An IMAP command can carry data of its own, called a literal, and a literal can be large. The largest IMAP command the server accepts, literals included, is set in bytes by [`maxRequestSize`](/docs/ref/object/imap#maxrequestsize), <!-- default:Imap.maxRequestSize -->50 MiB<!-- /default --> unless changed. Because `APPEND` carries the message as a literal, this value also caps the size of a message uploaded over IMAP.

Unauthenticated clients get far less. Before a client has authenticated, the limit is a fixed 64 KiB, and a larger literal closes the connection with `* BYE [TOOBIG] Literal exceeds the maximum size allowed before authentication.` After authentication, a literal larger than `maxRequestSize` is refused with the `TOOBIG` response code. The size limits that apply to every protocol are described in [Message and mailbox limits](/docs/email/settings/jmap).

Memory is a separate constraint. A command that needs more memory than the server can currently grant fails with `NO [UNAVAILABLE]`, and the client may retry it later. The memory budget is described in [Sizing memory](/docs/performance/memory).

## Message limits

A single IMAP command can address every message in a mailbox, which on a very large mailbox means a great deal of work. Two fields bound the number of messages that a single IMAP command processes. Both are announced to clients through the MESSAGELIMIT extension ([RFC 9738](https://www.rfc-editor.org/rfc/rfc9738)), so a client that implements it can page through a large mailbox.

| Field | Default | Commands |
|---|---|---|
| [`maxMessagesPerCommand`](/docs/ref/object/imap#maxmessagespercommand) | <!-- default:Imap.maxMessagesPerCommand -->1000000<!-- /default -->, minimum 1000 | `FETCH`, `SEARCH`, `STORE`, `MOVE` and `UID EXPUNGE`, announced as `MESSAGELIMIT`. |
| [`maxMessagesPerSave`](/docs/ref/object/imap#maxmessagespersave) | <!-- default:Imap.maxMessagesPerSave -->1000000<!-- /default -->, minimum 1000 | `COPY` and `APPEND`, announced as `SAVELIMIT`. |

The two limits behave differently when they are reached. When a command exceeds `maxMessagesPerCommand`, the messages with the highest UIDs are processed, and the tagged `OK` carries a `MESSAGELIMIT` response code naming the lowest UID that was handled. The client can then continue from there. `COPY` and `APPEND`, by contrast, are atomic, so a command over `maxMessagesPerSave` stores nothing and fails with a tagged `NO`. `EXPUNGE` and `CLOSE` are never limited. Keep `maxMessagesPerSave` at or above `maxMessagesPerCommand`.

The defaults are higher than the size of any realistic mailbox, so the limits normally have no effect. Lowering them has a cost for clients that do not implement RFC 9738: they receive partial results from `FETCH` and `SEARCH`, and see `COPY` and `APPEND` fail. Reduce the limits only when a specific workload requires it.

## UID batches

Paging through a large mailbox is easier when the client knows where each page begins. The UIDBATCHES extension ([RFC 10022](https://www.rfc-editor.org/rfc/rfc10022)) allows a client to ask the server to split the selected mailbox into batches of equal size, and to return the UID range of each batch. The client can then paginate a large mailbox without message sequence numbers. Two fields bound the requests:

| Field | Default | Limit |
|---|---|---|
| [`minUidBatchSize`](/docs/ref/object/imap#minuidbatchsize) | <!-- default:Imap.minUidBatchSize -->500<!-- /default -->, maximum 500 | Smallest batch size a client may request. Smaller requests are rejected with the `TOOFEW` response code. |
| [`maxUidBatches`](/docs/ref/object/imap#maxuidbatches) | <!-- default:Imap.maxUidBatches -->10000<!-- /default --> | Largest number of UID ranges returned by one command. Wider requests are rejected with the `TOOMANY` response code. |

The specification requires servers to support a batch size of 500, which is why `minUidBatchSize` cannot exceed that value. The minimum batch size has a second purpose. The UIDONLY extension ([RFC 9586](https://www.rfc-editor.org/rfc/rfc9586)) replaces message sequence numbers with UIDs in responses, and very small batches would let a client reconstruct the sequence numbers while UIDONLY is in effect. The minimum prevents this. At the defaults, `maxUidBatches` covers a mailbox of five million messages.

## METADATA

Some clients store settings of their own on the server, such as a mailbox colour or a comment. IMAP METADATA ([RFC 5464](https://www.rfc-editor.org/rfc/rfc5464)) provides this, by storing annotations on mailboxes and on the server. LIST-METADATA ([RFC 9590](https://www.rfc-editor.org/rfc/rfc9590)) returns annotations in `LIST` responses. Stalwart implements both.

The `METADATA` and `LIST-METADATA` capabilities are advertised after login, to accounts that hold the `imapMetadataGet` permission. Annotations are stored as object metadata. They are shared with JMAP and WebDAV, and subject to the size limits described in [Object metadata](/docs/server/metadata).

## Default folders

Clients look for certain folders by purpose rather than by name: where to put sent mail, where deleted messages go, where spam lands. These are special-use folders, and the server tells clients which folder serves which purpose. When an account is created, Stalwart creates the special-use folders listed in [`defaultFolders`](/docs/ref/object/email#defaultfolders) on the [Email](/docs/ref/object/email) singleton, found in the WebUI under <!-- breadcrumb:Email --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" /></svg> Email › Defaults, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" /></svg> Email › Encryption, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" /></svg> Email › Limits, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" /></svg> Email › Storage<!-- /breadcrumb:Email -->.

The folders are used by IMAP and JMAP clients alike. The field is a map keyed by special-use type: `inbox`, `trash`, `junk`, `drafts`, `archive`, `sent`, `shared`, `important`, `memos`, `scheduled` and `snoozed`. Each entry has the following fields:

| Field | Default | Meaning |
|---|---|---|
| `name` | required | Display name of the folder. |
| `create` | <!-- default:Email.EmailFolder.create -->`true`<!-- /default --> | Whether the folder is created for new accounts. The inbox, the trash and the junk folder are always created. |
| `subscribe` | <!-- default:Email.EmailFolder.subscribe -->`true`<!-- /default --> | Whether new accounts are subscribed to the folder. |
| `aliases` | none | Other names by which IMAP clients can refer to the folder. A mailbox name that matches an alias resolves to the special-use folder, so a client that expects, for example, `Sent Messages` uses the Sent folder. |

Five folders are created even without an entry. When the map has no entry for the inbox, the trash, the junk folder, drafts or sent mail, that folder is created as `Inbox`, `Deleted Items`, `Junk Mail`, `Drafts` or `Sent Items`. The following object body renames the Sent and Junk folders, and leaves the Junk folder unsubscribed:

```json
{
  "defaultFolders": {
    "sent": {"name": "Sent", "subscribe": true},
    "junk": {"name": "Spam", "subscribe": false},
    "shared": {"name": "Shared Folders"}
  }
}
```

The `shared` entry is different from the others. It names the virtual folder under which IMAP clients see the mailboxes that other accounts share with the user.
