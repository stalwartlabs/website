---
sidebar_position: 4
title: "Milter filters"
description: "Connecting external filters such as Rspamd or ClamAV over the Sendmail milter protocol: settings, stages, timeouts, failure handling, and the actions and macros Stalwart supports."
---

Many established mail filters are not written for any one MTA. Instead, they speak a common protocol that lets an MTA consult them while it receives a message. A milter (mail filter) is such an external program, and the protocol it speaks was introduced by Sendmail and is supported by most MTAs.

Many filters are available as milters. Among them are virus scanners such as ClamAV, spam filters such as Rspamd and SpamAssassin, and DKIM and DMARC tools.

A milter receives the SMTP envelope and the message. It answers with a decision, which is one of accept, reject, discard, quarantine or a temporary failure. Optionally, it also returns changes to the envelope, the headers or the body.

Each milter is an [MtaMilter](/docs/ref/object/mta-milter) object (found in the WebUI under <!-- breadcrumb:MtaMilter --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Filters › Milters<!-- /breadcrumb:MtaMilter -->). When several milters are defined, they are consulted in the order in which they were created. The changes requested by all of them are applied to the message, with one exception: only the last body replacement is kept. [Filtering](/docs/mta/filter/) describes where milters run relative to the other filters.

## Connection

A milter is reached at its [`host`](/docs/ref/object/mta-milter#host) and [`port`](/docs/ref/object/mta-milter#port). Milters usually run on the same host or network and are reached without TLS. For a milter elsewhere, [`useTls`](/docs/ref/object/mta-milter#usetls) connects over TLS instead, and [`allowInvalidCerts`](/docs/ref/object/mta-milter#allowinvalidcerts) accepts an invalid certificate from it.

Not every session needs every milter. The [`enable`](/docs/ref/object/mta-milter#enable) [expression](/docs/configuration/expressions/) decides, for each session, whether the milter is consulted at all. This lets a milter be limited to one listener, as in the example below.

The next decision is at which points of the session the milter is asked. The [`stages`](/docs/ref/object/mta-milter#stages) field lists the SMTP stages at which the milter is consulted: `connect`, `ehlo`, `mail`, `rcpt` and `data`. At each of them, Stalwart opens a connection to the milter and sends it what is known at that point:

- At `connect`, the client's address.
- At `ehlo`, its EHLO name.
- At `mail`, the sender.
- At `rcpt`, the recipients.
- At `data`, the headers and body as well.

A milter can reject the session at any of these stages, but changes to the message are applied only at `data`.

A new milter is consulted at <!-- default:MtaMilter.stages -->`data`<!-- /default --> only. That is sufficient for content filters such as virus scanners, which need the message itself. The earlier stages are useful for a different purpose: they let a milter reject a client before it transfers the message. The value `auth` is accepted in `stages`, but no milter is consulted at the AUTH stage.

The following objects consult Rspamd at every stage and ClamAV at DATA, both for mail received on the listener named `smtp`:

```json
[
  {
    "host": "127.0.0.1",
    "port": 11332,
    "stages": {"connect": true, "ehlo": true, "mail": true, "rcpt": true, "data": true},
    "enable": {"else": "listener == 'smtp'"}
  },
  {
    "host": "127.0.0.1",
    "port": 7357,
    "stages": {"data": true},
    "enable": {"else": "listener == 'smtp'"}
  }
]
```

## Timeouts and failures

While a milter is working, the SMTP client waits for its reply. Four limits therefore protect the session from a milter that is slow or misbehaving:

| Field | Limits |
|---|---|
| [`connectTimeout`](/docs/ref/object/mta-milter#connecttimeout) | Connecting to the milter. |
| [`commandTimeout`](/docs/ref/object/mta-milter#commandtimeout) | The milter's answer to each command. |
| [`dataTimeout`](/docs/ref/object/mta-milter#datatimeout) | The milter's answer after the message body. |
| [`maxResponseSize`](/docs/ref/object/mta-milter#maxresponsesize) | The size of one response frame of the milter protocol. A replaced body sent in several frames is limited per frame. |

A milter can also be unreachable, time out or fail. In that case [`tempFailOnError`](/docs/ref/object/mta-milter#tempfailonerror) decides the outcome, and it is <!-- default:MtaMilter.tempFailOnError as=enabled -->enabled<!-- /default --> for a new milter. The setting is a choice between two risks:

- When it is enabled, the command is answered with `451 4.3.5 Unable to accept message at this time.` The sender retries later, so no message passes unfiltered.
- When it is disabled, the milter is skipped and the message is accepted without it. This keeps mail flowing during a milter outage, at the cost of letting unfiltered mail through.

## Protocol options

The milter protocol exists in several versions. [`protocolVersion`](/docs/ref/object/mta-milter#protocolversion) selects version `v6` or version `v2`. A new milter uses <!-- default:MtaMilter.protocolVersion -->`v6`<!-- /default -->, and `v2` is needed only for old milters.

At the start of each connection, the MTA and the milter negotiate what the milter may do. During this option negotiation, Stalwart offers the milter two bit masks defined by the milter protocol:

- [`flagsAction`](/docs/ref/object/mta-milter#flagsaction): the `SMFIF_*` actions the milter may perform.
- [`flagsProtocol`](/docs/ref/object/mta-milter#flagsprotocol): the `SMFIP_*` protocol steps the milter may ask to skip.

When the masks are not set, Stalwart offers all supported actions (`255`) and the protocol mask `66`, with which a milter can ask to skip the `HELO` and end-of-headers steps. Set them only when a milter requires a different negotiation.

## Replies

The milter's decision determines the reply that the SMTP client receives:

| Decision | Reply |
|---|---|
| Reject | `503 5.5.3 Message rejected.` |
| Temporary failure | `451 4.3.5 Unable to accept message at this time.` |
| Discard | `250 2.0.0 Message queued for delivery.` |
| Reply code (`SMFIR_REPLYCODE`) | The reply returned by the milter. |

A discard answers the client as if the command had succeeded, but drops what the command applies to. At DATA, that is the message. At `MAIL FROM` and `RCPT TO`, it is the sender or the recipient, which is dropped as if it had been refused.

The stage also decides whether the session goes on. At the connect stage, any decision other than accept or continue closes the connection after the reply. At the later stages, the session continues.

A quarantine request does not stop delivery. It adds an `X-Quarantine` header with the milter's reason, and the message is delivered.

## Development

The following sections are intended for developers of milters. They list the responses Stalwart accepts from a milter and the macros it sends.

One detail of the body step affects milters that parse the body. At the body step, Stalwart sends the complete message, header fields included, where a milter might expect only the body that follows the end of the headers. Such a milter therefore receives the header fields twice: once at the header step and again at the start of the body.

### Supported actions

A milter answers each protocol step with a response code. Stalwart accepts the following codes, which request actions and modifications:

| Code | Name | Effect |
|---|---|---|
| SMFIR_ADDRCPT (`+`) | Add Recipient | Adds a recipient to the message. |
| SMFIR_DELRCPT (`-`) | Delete Recipient | Removes a recipient from the message. |
| SMFIR_ADDRCPT_PAR (`2`) | Add Recipient (with ESMTP args) | Adds a recipient to the message, with ESMTP arguments. |
| SMFIR_SHUTDOWN (`4`) | Shutdown | Replies `421 4.3.0 Server shutting down.`, and closes the connection only at the connect stage. |
| SMFIR_ACCEPT (`a`) | Accept | Accepts the message. |
| SMFIR_REPLBODY (`b`) | Replace Body | Replaces the body of the message. |
| SMFIR_CONTINUE (`c`) | Continue | Continues with the message. |
| SMFIR_DISCARD (`d`) | Discard | Discards the message. |
| SMFIR_CHGFROM (`e`) | Change From | Changes the envelope sender of the message. |
| SMFIR_CONN_FAIL (`f`) | Connection Failure | Closes the connection at the connect stage. At the later stages, no reply is sent and the session continues. |
| SMFIR_ADDHEADER (`h`) | Add Header | Adds a header field to the message. |
| SMFIR_INSHEADER (`i`) | Insert Header | Inserts a header field into the message. |
| SMFIR_CHGHEADER (`m`) | Change Header | Changes a header field of the message. |
| SMFIR_PROGRESS (`p`) | Progress | Reports that the milter is still working. |
| SMFIR_QUARANTINE (`q`) | Quarantine | Quarantines the message. |
| SMFIR_REJECT (`r`) | Reject | Rejects the message. |
| SMFIR_SKIP (`s`) | Skip | Skips the rest of the body and proceeds to the end of the body. |
| SMFIR_TEMPFAIL (`t`) | Temporary Failure | Returns a temporary failure. |
| SMFIR_REPLYCODE (`y`) | Reply Code | Replies with the given SMTP reply code. |

### Supported macros

Macros are named values that the MTA passes to the milter alongside each protocol step. Stalwart sends the following macros, each at the step at which its value becomes known:

| Step | Macros |
|---|---|
| Connect | `{daemon_name}`, `j`, `{client_addr}`, `{client_port}`, `{client_ptr}` |
| HELO | `{cipher}`, `{tls_version}` |
| MAIL | `{mail_addr}`, `{auth_authen}` |
| RCPT | `{rcpt_addr}` |

The `j` macro carries the server's host name. A milter consulted at the `connect` stage is the exception and receives it empty, because the host name is determined after the connect-stage filters have run.

No macros are sent at the DATA step. The queue identifier macro `i` is therefore not available.
