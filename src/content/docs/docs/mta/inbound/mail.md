---
sidebar_position: 5
title: "MAIL stage"
---

The `MAIL FROM` command initiates an SMTP message transfer by identifying the sender of the message. After the command is issued, the receiving mail server validates the sender address and checks whether the sender is authorised to send messages on behalf of that domain. If valid, the transaction proceeds to the `RCPT TO` stage.

MAIL-stage behaviour is configured on the [MtaStageMail](/docs/ref/object/mta-stage-mail) singleton (found in the WebUI under <!-- breadcrumb:MtaStageMail --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Session › MAIL FROM Stage<!-- /breadcrumb:MtaStageMail -->).

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

The [`script`](/docs/ref/object/mta-stage-mail#script) field selects a [Sieve script](/docs/sieve/) to run after a successful `MAIL FROM` command. Typical uses include rejecting specific senders or rewriting the sender address using the `envelope` Sieve extension.

For example, setting [`script`](/docs/ref/object/mta-stage-mail#script) to the expression `"'return_path_filter'"` runs a Sieve script named `return_path_filter` which can reject messages whose return path matches a known-bad local part:

```sieve
require ["variables", "envelope", "reject"];

if envelope :localpart :is "from" "known_spammer" {
    reject "Messages from this sender are not accepted.";
}
```
