---
sidebar_position: 5
title: "MTA hooks"
description: "Filtering SMTP sessions with an HTTP service: hook settings, the JSON request Stalwart sends at each stage, the response it expects, the supported modifications, and failure handling."
---

An MTA hook lets an administrator write a mail filter as an ordinary web service. Stalwart consults the service during an SMTP session, in the same way as it consults a [milter](/docs/mta/filter/milter). The difference lies in the protocol: a hook exchanges JSON over HTTP in place of the binary milter protocol.

At each configured stage of the session, Stalwart sends the service a `POST` request. The request describes the session and the envelope and, at DATA, the message. The service answers with a decision and, optionally, with changes to the message.

Because the protocol is plain HTTP, a hook can be written in any language that can serve HTTP. Its traffic can also be inspected with ordinary HTTP tools.

## Settings

Each hook is an [MtaHook](/docs/ref/object/mta-hook) object (found in the WebUI under <!-- breadcrumb:MtaHook --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Filters › MTA Hooks<!-- /breadcrumb:MtaHook -->). The first group of settings describes how Stalwart reaches the service:

- Requests go to the endpoint in [`url`](/docs/ref/object/mta-hook#url).
- [`httpAuth`](/docs/ref/object/mta-hook#httpauth) sets how they are authenticated: `Unauthenticated`, `Basic` with a user name and secret, or `Bearer` with a token. Secrets can be given directly, from an environment variable or from a file.
- [`httpHeaders`](/docs/ref/object/mta-hook#httpheaders) adds headers to each request.
- [`allowInvalidCerts`](/docs/ref/object/mta-hook#allowinvalidcerts) accepts an invalid TLS certificate from the endpoint.

The next decision is when the hook is consulted. The [`stages`](/docs/ref/object/mta-hook#stages) field lists the SMTP stages at which the hook is consulted: `connect`, `ehlo`, `mail`, `rcpt` and `data`. A new hook is consulted at <!-- default:MtaHook.stages -->`data`<!-- /default --> only. Changes to the message are applied only at `data`, so at the other stages a hook can only accept or reject. The value `auth` is accepted in `stages`, but no hook is consulted at the AUTH stage.

Not every session needs every hook. The [`enable`](/docs/ref/object/mta-hook#enable) [expression](/docs/configuration/expressions/) decides, for each session, whether the hook is consulted at all.

Two limits protect the session from a slow or oversized answer. [`timeout`](/docs/ref/object/mta-hook#timeout) limits the time Stalwart waits for a response. [`maxResponseSize`](/docs/ref/object/mta-hook#maxresponsesize) limits the size of the response, which has to accommodate a replaced body.

The following hook is consulted at every stage, with Basic authentication and an additional header:

```json
{
  "url": "https://filter.example.org/mta-hook",
  "stages": {"connect": true, "ehlo": true, "mail": true, "rcpt": true, "data": true},
  "httpHeaders": {"X-Filter-Instance": "mx1"},
  "timeout": 10000,
  "httpAuth": {
    "@type": "Basic",
    "username": "stalwart",
    "secret": {"@type": "EnvironmentVariable", "variableName": "MTA_HOOK_SECRET"}
  }
}
```

When several hooks are defined, they are consulted in the order in which they were created, since there is no priority setting. Each receives the same request, built from the message as received. A hook therefore does not see the changes requested by the hooks before it. A hook that answers `reject` or `discard` ends the sequence. At DATA, hooks run after the milters ([Filtering](/docs/mta/filter/)).

The endpoint may also be unreachable, time out or answer with an error. In that case [`tempFailOnError`](/docs/ref/object/mta-hook#tempfailonerror) decides the outcome, and it is <!-- default:MtaHook.tempFailOnError as=enabled -->enabled<!-- /default --> for a new hook:

- When it is enabled, the command is answered with `451 4.3.5 Unable to accept message at this time.`, so the sender retries later.
- When it is disabled, the hook is skipped.

Errors are logged as `mta-hook.error`.

## Request

The request body is a JSON object with up to three members: `context`, `envelope` and `message`. Which of them are present depends on the stage. The following request was sent at the DATA stage, where all three are present:

```json
{
  "context": {
    "stage": "data",
    "client": {
      "ip": "192.0.2.1",
      "port": 34567,
      "ptr": "mail.example.com",
      "helo": "mail.example.com",
      "activeConnections": 1
    },
    "sasl": {"login": "john"},
    "tls": {"version": "TLSv1.3", "cipher": "TLS13_AES_256_GCM_SHA384"},
    "server": {"name": "Stalwart v1.0.0", "port": 587, "ip": "192.0.2.2"},
    "queue": {"id": "1d6f4a2b3c"},
    "protocol": {"version": 1}
  },
  "envelope": {
    "from": {"address": "john@example.com"},
    "to": [{"address": "bill@example.org"}, {"address": "jane@example.org"}]
  },
  "message": {
    "headers": [
      ["From", " John Doe <john@example.com>\r\n"],
      ["To", " Bill <bill@example.org>, Jane <jane@example.org>\r\n"],
      ["Subject", " Hello\r\n"]
    ],
    "contents": "Hello, world.\r\n",
    "size": 158
  }
}
```

**context** describes the session:

- `stage`: the current stage, `connect`, `ehlo`, `mail`, `rcpt` or `data`.
- `client`: the client's `ip` and `port`, the host name of its address (`ptr`, `null` when it has none), the name it gave in `EHLO` (`helo`, `null` before `EHLO`), and `activeConnections`, which is always `1`.
- `sasl`: present only when the client has authenticated, with the account in `login`.
- `tls`: present on encrypted connections, with the TLS `version` and `cipher`.
- `server`: the server's `name`, and the local `port` and `ip` of the connection.
- `queue`: at DATA, the `id` the message will have in the queue.
- `protocol`: the version of the request format, currently `1`.

**envelope** is present from the MAIL FROM stage. It holds the sender's `address` in `from` and the recipients in `to`, in lower case. At the MAIL FROM stage, `to` is still `[]`. At the RCPT TO stage, the last entry of `to` is the recipient of the current command, as the client gave it. The hook sees that address before the `rewrite` expression applies and before Stalwart has checked that the address exists.

**message** is present at the DATA stage. It holds the following:

- `headers`: the header fields, as pairs of name and raw value, including the leading space and the line ending.
- `contents`: the body.
- `size`: the size of the message in bytes.

The message is given as the client sent it, without the `Received`, `Authentication-Results` and spam filter headers that Stalwart adds.

## Response

The service answers with a JSON object that states its decision. The following response rejects the message with a reply of its own:

```json
{
  "action": "reject",
  "response": {
    "status": 550,
    "enhanced_status": "5.7.1",
    "message": "Message refused by policy."
  }
}
```

`action` holds the decision, which is one of the following:

| Action | Effect |
|---|---|
| `accept` | Continue with the next hook or the next step, applying the modifications. |
| `reject` | Refuse the command or the message. Without a `response`, the reply is `503 5.5.3 Message rejected.` |
| `discard` | Answer `250 2.0.0 Message queued for delivery.` and drop the message at DATA; at `MAIL FROM` and `RCPT TO` the sender or recipient is discarded, and at the connect stage the connection is closed. |
| `quarantine` | Add an `X-Quarantine: true` header to the message and continue. Stalwart does not hold the message, but a Sieve script or a mail client rule can act on the header. |

The optional `response` object sets the reply that the SMTP client receives. It holds the three-digit code in `status`, the enhanced status code in `enhanced_status` (written with `_`, not in camel case) and the text in `message`. It is used only when both `status` and `message` are present.

A `disconnect` member in `response` is accepted but has no effect. The connection is already handled by the stage: a `reject` or `discard` at the connect stage always closes the connection after the reply, and at the later stages the session continues.

### Modifications

At the DATA stage, a hook can also change the message. The response then includes a `modifications` array, which is applied when the action is `accept` or `quarantine`. Each entry has a `type` and the fields of that type:

| Type | Fields | Effect |
|---|---|---|
| `changeFrom` | `value`, `parameters` | Replace the envelope sender. |
| `addRecipient` | `value`, `parameters` | Add an envelope recipient. |
| `deleteRecipient` | `value` | Remove an envelope recipient. |
| `replaceContents` | `value` | Replace the body. |
| `addHeader` | `name`, `value` | Add a header field. |
| `insertHeader` | `index`, `name`, `value` | Insert a header field at a position. |
| `changeHeader` | `index`, `name`, `value` | Replace the value of the `index`-th field named `name`. |
| `deleteHeader` | `index`, `name` | Remove the `index`-th field named `name`. |

`parameters` is an optional object of SMTP parameters whose values are strings or `null`, for example `{"NOTIFY": "FAILURE"}`. The following response accepts the message, adds a recipient and a header, and changes the subject:

```json
{
  "action": "accept",
  "modifications": [
    {"type": "addRecipient", "value": "archive@example.org"},
    {"type": "addHeader", "name": "X-Filtered-By", "value": "Policy filter 1.1"},
    {"type": "changeHeader", "index": 1, "name": "Subject", "value": "[External] Hello"}
  ]
}
```

Hook modifications interact with those of the milters, which run earlier. A non-empty list of modifications from a hook replaces any body changes requested by the milters.
