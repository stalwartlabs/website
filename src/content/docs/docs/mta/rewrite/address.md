---
sidebar_position: 2
title: "Envelope"
description: "Rewriting the envelope sender and recipients of messages with expressions or Sieve scripts, with examples."
---

The envelope of a message consists of the sender and the recipients that the client gives in the SMTP `MAIL FROM` and `RCPT TO` commands. The envelope decides where the message is delivered and where delivery status notifications are sent. It is independent of the `From` and `To` headers that recipients see.

Stalwart can rewrite both parts of the envelope while it receives a message. Rewriting the sender can, for example, replace an internal domain with the public one. Rewriting a recipient can, for example, deliver mail sent to an old address to a new one.

## Rewriting with expressions

The simplest rewrites are written as [expressions](/docs/configuration/expressions/), rules that Stalwart evaluates for each address. Two session stages have a `rewrite` expression:

- [`rewrite`](/docs/ref/object/mta-stage-mail#rewrite) on [MtaStageMail](/docs/ref/object/mta-stage-mail) (found in the WebUI under <!-- breadcrumb:MtaStageMail --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Session › MAIL FROM Stage<!-- /breadcrumb:MtaStageMail -->) rewrites the sender, which the expression reads as `sender`.
- [`rewrite`](/docs/ref/object/mta-stage-rcpt#rewrite) on [MtaStageRcpt](/docs/ref/object/mta-stage-rcpt) (found in the WebUI under <!-- breadcrumb:MtaStageRcpt --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Session › RCPT TO Stage<!-- /breadcrumb:MtaStageRcpt -->) rewrites each recipient, which the expression reads as `rcpt`.

The expression returns the new address. When it returns `false` instead, the address is left unchanged.

Matching is usually done with the `matches` function. Its regular expression captures parts of the address, and the `then` branch refers to the captured groups as `$1`, `$2` and so on, and to the whole match as `$0` ([Expression values](/docs/configuration/expressions/values)). The following expression delivers mail for `first.last@` addresses in local domains to `first+last@`:

```json
{
  "rewrite": {
    "match": {"0": {"if": "is_local_domain(rcpt_domain) && matches('^([^.]+)\\.([^.]+)@(.+)$', rcpt)", "then": "$1 + '+' + $2 + '@' + $3"}},
    "else": "false"
  }
}
```

The backslash appears twice because the expression is written inside a JSON document. In the expression field of the WebUI, it is written once, as `\.` ([escaping backslashes](/docs/configuration/expressions/functions#escaping-backslashes)). [MAIL FROM stage](/docs/mta/inbound/mail#rewriting-the-sender) and [RCPT TO stage](/docs/mta/inbound/rcpt#rewriting-recipients) describe the rewrite of each stage in detail.

## Rewriting with Sieve

Some rewrites need more logic than an expression can hold, such as a lookup or several conditions. Such a rewrite is written as a system [Sieve script](/docs/sieve/interpreter/trusted) at the MAIL FROM or RCPT TO stage, and the stage's `script` field selects it. The script reads the envelope with the `envelope` test. To replace an address, it sets the `envelope.from` or the `envelope.to` variable.

The following script runs at the RCPT TO stage and removes the dots from the local part of a recipient. With it, mail for `e.x.a.m.p.l.e@example.org` is delivered to `example@example.org`:

```sieve
require ["variables", "envelope", "regex"];

if allof( envelope :localpart :contains "to" ".",
          envelope :regex "to" "(.+)@(.+)$") {
    set :replace "." "" "to" "${1}";
    set "envelope.to" "${to}@${2}";
}
```

<!-- sievepad { "envelopeTo": [ "e.x.a.m.p.l.e@example.org" ] } -->
<p><a href="https://sievepad.com/#w=RZBBasMwEEWvMgxeJNQI0qWz8aYXaLqLvFDViSuQJUdSbIMw9Fw9Tk9SKU5sLUZ85v0_w0QcsDqUaERHWOEpCD0KF-DLSl_BmxlI257g7-cX3ml0KijTwqjCN5wUDYQleulUHzxW5_hM6YQyuWNvTmbt6HpTjuDMcRBOiU9NnmMJHOkxYFGOWpo4NkduuFEXEFrbyw6eEFTaSqH7vF8lrQlpjE-2YDmmj6UQbmB9m-2eu4E79rKvcyk47iEuHk8hg70WkpawVO_l4SriYeZ43Ohte7Yiwc51EV8XcOYG56bEjrwXLeUTJZWs-YhJxTXgw6YeEpuYYB3rmWZU0yS6XhOzrsVmnv8B" target="_blank" rel="noopener">Try this script in Sievepad</a></p>
<!-- /sievepad -->

The script works in three steps. The `envelope :regex` test captures the local part and the domain of the recipient. `set :replace` then removes the dots from the local part. Finally, setting `envelope.to` replaces the recipient with the new address.

The same mechanism can also change the delivery status notifications that a recipient produces, by setting `envelope.notify`. [Delivery status notifications](/docs/mta/reports/dsn#suppressing-notifications) shows how to suppress them this way.
