---
sidebar_position: 5
---

# MAIL stage

The `MAIL FROM` command initiates an SMTP message transfer by identifying the sender of the message. After the command is issued, the receiving mail server validates the sender address and checks whether the sender is authorised to send messages on behalf of that domain. If valid, the transaction proceeds to the `RCPT TO` stage.

MAIL-stage behaviour is configured on the [MtaStageMail](/docs/ref/object/mta-stage-mail) singleton (found in the WebUI under <!-- breadcrumb:MtaStageMail --><!-- /breadcrumb:MtaStageMail -->).

## Address rewriting

The [`rewrite`](/docs/ref/object/mta-stage-mail#rewrite) field accepts an expression that can modify the sender address. This is useful for obfuscating the sender for privacy, or for changing the domain to match organisational branding. For background on the expression-based rewrite model see the [address rewriting](/docs/mta/rewrite/address) documentation.

For example, the following configuration removes any subdomain from the sender address on non-SMTP listeners:

```json
{
  "rewrite": {
    "match": [{"if": "listener != 'smtp' & matches('^([^.]+)@([^.]+)\\.(.+)$', rcpt)", "then": "$1 + '@' + $3"}],
    "else": "false"
  }
}
```

## Allowed senders

The [`isSenderAllowed`](/docs/ref/object/mta-stage-mail#issenderallowed) field accepts an expression that determines whether the sender is accepted. If the expression evaluates to `false`, the sender is rejected. The default policy allows the sender when authenticated or when the sender domain is not present in the `spam-block` list.

For example, to block domains present in the `spam-block` list:

```json
{
  "isSenderAllowed": {"else": "!key_exists('spam-block', sender_domain)"}
}
```

## Sieve script

The [`script`](/docs/ref/object/mta-stage-mail#script) field selects a [Sieve script](/docs/sieve/overview) to run after a successful `MAIL FROM` command. Typical uses include rejecting specific senders or rewriting the sender address using the `envelope` Sieve extension.

For example, setting [`script`](/docs/ref/object/mta-stage-mail#script) to the expression `"'return_path_filter'"` runs a Sieve script named `return_path_filter` which can reject messages whose return path matches a known-bad local part:

```sieve
require ["variables", "envelope", "reject"];

if envelope :localpart :is "from" "known_spammer" {
    reject "Messages from this sender are not accepted.";
}
```
