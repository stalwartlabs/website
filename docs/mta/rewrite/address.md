---
sidebar_position: 2
---

# Envelope

Address rewriting alters the email addresses in the envelope of a message as it passes through the mail server. The envelope, distinct from the message content, carries the routing information (sender or return path, and recipients).

Address rewriting can be used to change outgoing mail addresses to match a specific domain for branding, or to adjust incoming addresses to redirect specific messages to a different inbox. Rewriting rules use regular expressions for pattern-based matching and transformation, and [Sieve scripts](/docs/sieve/overview) for cases requiring finer control.

Stalwart supports address rewriting on both the sender and recipient parts of the envelope.

## Expressions

Address rewriting uses [expressions](/docs/configuration/expressions/overview) and regular expressions. When a regex matches the email address, the captured components can be rearranged or modified to form a new address.

Capture groups are numbered sequentially from 0 (the whole match). The `${pos}` syntax refers to a capture group by its position number. For example, the expression `matches('^([^.]+)\.([^.]+)@(.+)$', rcpt)` matches addresses of the form `alias.name@domain`, and a rewrite expression such as `$1 + '+' + $2 + '@' + $3` transforms them into `alias+name@domain`. When the expression does not match, the `else` branch returns `false` and no rewriting takes place.

Sender addresses are rewritten by the [`rewrite`](/docs/ref/object/mta-stage-mail#rewrite) field on the [MtaStageMail](/docs/ref/object/mta-stage-mail) singleton (found in the WebUI under <!-- breadcrumb:MtaStageMail --><!-- /breadcrumb:MtaStageMail -->). Recipient addresses are rewritten by the [`rewrite`](/docs/ref/object/mta-stage-rcpt#rewrite) field on the [MtaStageRcpt](/docs/ref/object/mta-stage-rcpt) singleton (found in the WebUI under <!-- breadcrumb:MtaStageRcpt --><!-- /breadcrumb:MtaStageRcpt -->).

## Sieve

When address rewriting cannot be expressed with regular expressions alone, a [Sieve script](/docs/sieve/overview) can be used. Sieve is a scripting language designed for mail filtering. Stalwart supports the `envelope` Sieve extension, which provides access to details of the message envelope such as sender and recipient addresses, as well as other envelope information such as Delivery Status Notifications (DSN).

To modify parts of the envelope within a Sieve script, the `set` command defines and modifies variables. Assigning a new value to `envelope.to` or `envelope.from` replaces the corresponding envelope address.

System-level Sieve scripts are defined as [SieveSystemScript](/docs/ref/object/sieve-system-script) objects. The script name is referenced from the [`script`](/docs/ref/object/mta-stage-mail#script) field on MtaStageMail or the [`script`](/docs/ref/object/mta-stage-rcpt#script) field on MtaStageRcpt. See the [Sieve scripts](/docs/sieve/overview), [MAIL FROM](/docs/mta/inbound/mail) stage, and [RCPT TO](/docs/mta/inbound/rcpt) stage sections for details.

## Examples

### Ignore dots

Gmail disregards periods in the local part of an email address, so `example@gmail.com` receives mail also sent to `ex.ample@gmail.com` or `e.x.a.m.p.l.e@gmail.com`. The same behaviour can be implemented in Stalwart with a Sieve script:

```sieve
require ["variables", "envelope", "regex"];

if allof( envelope :localpart :contains "to" ".",
          envelope :regex "to" "(.+)@(.+)$") {
    set :replace "." "" "to" "${1}";
    set "envelope.to" "${to}@${2}";
}
```

How the script works:

- The `require` clause declares the Sieve extensions used: `variables` for variable handling, `envelope` for envelope access, and `regex` for pattern matching.
- The `if allof(...)` conditional checks that the local part of the recipient contains a period and that the address splits into local and domain parts.
- `set :replace "." "" "to" "${1}"` strips the periods from the local part and stores the result in the variable `to`.
- `set "envelope.to" "${to}@${2}"` reconstructs the recipient address and updates the envelope.

The script is referenced from the [`script`](/docs/ref/object/mta-stage-rcpt#script) field on MtaStageRcpt.

### Silent bounces

Certain SMTP parameters control delivery-time behaviour:

- `NOTIFY`: when the sender should be notified about delivery status. Values include `NEVER`, `SUCCESS`, `FAILURE`, and `DELAY`.
- `ENVID`: unique identifier associated with the message, useful for tracking.
- `ORCPT`: original recipient address when different from the envelope recipient, useful after forwarding or rewriting.

To disable DSNs for messages sent to any mailer-daemon address:

```sieve
require ["variables", "envelope"];

if envelope :matches "to" "mailer-daemon@*" {
    set "envelope.notify" "NEVER";
}
```

How the script works:

- The `require` clause declares the `variables` and `envelope` extensions.
- The `if envelope :matches "to" "mailer-daemon@*"` check matches recipient addresses of the form `mailer-daemon@<domain>`.
- `set "envelope.notify" "NEVER"` clears the notification setting so no DSN is sent.

The script is referenced from the [`script`](/docs/ref/object/mta-stage-rcpt#script) field on MtaStageRcpt.
