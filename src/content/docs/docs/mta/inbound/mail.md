---
sidebar_position: 5
title: "MAIL FROM stage"
description: "The MAIL FROM stage of an SMTP session: accepting or refusing the envelope sender, rewriting it, and running a Sieve script on it."
---

With the `MAIL FROM` command, the client opens a mail transaction and gives the envelope sender of the message. The envelope sender is the return path: the address to which delivery status notifications about the message are sent. It is the first point at which the server learns who claims to be sending, so this stage is where senders are accepted, refused or rewritten.

The stage is configured on the [MtaStageMail](/docs/ref/object/mta-stage-mail) singleton (found in the WebUI under <!-- breadcrumb:MtaStageMail --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Session › MAIL FROM Stage<!-- /breadcrumb:MtaStageMail -->). Its expressions can use the [MAIL FROM variables](/docs/ref/expression/variable/mta-mail-from-variable), which add `sender`, `sender_domain` and `authenticated_as` to the connection variables.

Several checks that are configured elsewhere also run at `MAIL FROM`:

- The requirement to authenticate, and the [sender verification](/docs/mta/inbound/auth#sender-verification) of authenticated users
- [SPF](/docs/mta/authentication/spf) verification of the sender's domain
- [Reverse DNS](/docs/mta/authentication/iprev) verification of the client
- The [throttles](/docs/mta/inbound/rate-limit) keyed on the sender

## Allowed senders

The first decision of the stage is whether to accept the sender at all. [`isSenderAllowed`](/docs/ref/object/mta-stage-mail#issenderallowed) makes it. When the expression returns `false`, `MAIL FROM` is refused with `550 5.7.1 Sender address not allowed.` The default accepts every authenticated client. It also accepts an unauthenticated sender, unless the sender's domain is in the `spam-block` [lookup list](/docs/configuration/expressions/lookup/):

```json
{
  "isSenderAllowed": {"else": "!is_empty(authenticated_as) || !key_exists('spam-block', sender_domain)"}
}
```

With the default expression, blocking a domain therefore requires no change to the setting. The domain is added as a [MemoryLookupKey](/docs/ref/object/memory-lookup-key) with the namespace `spam-block`.

## Rewriting the sender

The envelope sender can be replaced with another address, for example to remove an internal subdomain. [`rewrite`](/docs/ref/object/mta-stage-mail#rewrite) does this. When the expression returns an address, that address is used as the sender for the rest of the transaction. An empty string makes the sender the null sender `<>`. Any other result, such as `false`, leaves the sender unchanged. Each rewrite is logged as `smtp.mail-from-rewritten`.

The order of the rewrite matters, because it decides which address each check sees. The rewrite is applied after `isSenderAllowed`, the Sieve script, milters and hooks, so these see the original sender. It is applied before the sender verification of authenticated users, which sees the rewritten one. [Address rewriting](/docs/mta/rewrite/address) describes the rewriting functions and capture groups.

The following expression removes the subdomain from the sender's domain on every listener except the one named `smtp`, so that `jane@mail.example.org` becomes `jane@example.org`:

```json
{
  "rewrite": {
    "match": {"0": {"if": "listener != 'smtp' && matches('^([^@]+)@[^.]+\\.(.+\\..+)$', sender)", "then": "$1 + '@' + $2"}},
    "else": "false"
  }
}
```

The backslashes in the regular expression are doubled because the expression is written inside a JSON document. In an expression field of the WebUI, each is written once, as `\.` ([escaping backslashes](/docs/configuration/expressions/functions#escaping-backslashes)).

## Sieve script

The sender can also be inspected by a system [Sieve script](/docs/sieve/interpreter/trusted). [`script`](/docs/ref/object/mta-stage-mail#script) selects the script to run for each `MAIL FROM`. The script runs after `isSenderAllowed` and before the rewrite, the sender verification of authenticated users, the throttles and SPF. Like the milters and MTA hooks at this stage, it therefore sees the sender as the client gave it, as `envelope.from`, and it can refuse it. The following script refuses a sender by its local part:

```sieve
require ["envelope", "reject"];

if envelope :localpart :is "from" "known_spammer" {
    reject "550 5.7.1 Messages from this sender are not accepted.";
}
```

<!-- sievepad { "envelopeFrom": "known_spammer@example.net" } -->
<p><a href="https://sievepad.com/#w=VY_BSgQxDIZfJeQ8DO5hEOpFLwuCg-Aet4uUTnattmltu7PCMOBz-Tg-iRnWFcwpf_7k58uEI6pVg2wCocJNNf5kcoUh2qKgv7t_gPXTYw-lmgPB9-cXbByNBMVmlyo2eG4Kqu10CQnG8eLEY7aLzvR-dJlgq5F4JB8TaWxAi_FKtmrc3WjW7PZwsUH5aI1PC4lyRVb3OQaN0rxxPPFzSSYEyjKZNIPUOUr8rruCrr1uV9BTKQJdYLmF-iI5hXigDEZgOFYw1lKqNLQahWDWjPOuwfB7Jy-JKlSr44Oo6Y9-LYHy1z-UW_owIXlqmSrO8w8" target="_blank" rel="noopener">Try this script in Sievepad</a></p>
<!-- /sievepad -->

A rejection refuses only the `MAIL FROM` command, not the session. The client may therefore start a new transaction with another sender.
