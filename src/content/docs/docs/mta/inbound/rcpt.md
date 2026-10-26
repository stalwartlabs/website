---
sidebar_position: 6
title: "RCPT TO stage"
description: "The RCPT TO stage of an SMTP session: how recipients are resolved, relaying, sub-addressing, catch-all addresses, recipient rewriting, Sieve scripts and recipient limits."
---

With the `RCPT TO` command, the client names one recipient of the message. It repeats the command for each further recipient, and the server decides about each one separately. A recipient can be accepted in two ways. As a local address, it is delivered to a mailbox on this server. As a remote address, it is relayed to another server. A recipient that is neither is refused. This stage therefore decides which mail the server takes responsibility for, and in particular whether it can be used to send mail to other domains.

The stage is configured on the [MtaStageRcpt](/docs/ref/object/mta-stage-rcpt) singleton (found in the WebUI under <!-- breadcrumb:MtaStageRcpt --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Session › RCPT TO Stage<!-- /breadcrumb:MtaStageRcpt -->). How each domain handles its addresses is configured separately, on its [Domain](/docs/ref/object/domain) object (found in the WebUI under <!-- breadcrumb:Domain --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg> Domains › Domains<!-- /breadcrumb:Domain -->). The expressions of MtaStageRcpt can use the [RCPT TO variables](/docs/ref/expression/variable/mta-rcpt-to-variable), which add `rcpt`, `rcpt_domain`, `recipients`, `priority` and `helo_domain` to the MAIL FROM variables.

## Resolving a recipient

For a recipient in a domain hosted on the server, Stalwart must find out which mailbox, if any, the address belongs to. It tries the following steps in order, and the first step that matches decides:

1. With [sub-addressing](#sub-addressing), the part of the local part after `+` is removed.
2. A [masked address](/docs/email/management/masked-email) of an account, when it is enabled and not expired (Enterprise edition).
3. For a domain whose accounts are kept in an LDAP or SQL directory, the directory is asked whether the address exists. OpenID Connect directories cannot be queried for recipients, so in such a domain only accounts that already exist on the server are accepted ([OpenID Connect directory](/docs/auth/backend/oidc)).
4. The address of an account or group, or one of their aliases, is accepted and delivered to that mailbox. In a domain served by an LDAP or SQL directory, only the directory decides for accounts. The address of a [mailing list](/docs/email/management/mailing-lists) is replaced by the list's recipients.
5. The domain's [catch-all address](#catch-all-addresses), when set, receives the message.
6. When the domain allows [relaying of unknown recipients](#split-delivery), the recipient is accepted for relaying.

When no step matches, the recipient is refused with `550 5.1.1 Mailbox does not exist.` [Addresses, aliases and catch-all](/docs/domains/addresses) explains how these addresses are defined.

Recipients found in an LDAP or SQL directory are remembered in the directory recipient cache, so that the directory is not queried for every message. The size of the cache is set by [`directoryRecipients`](/docs/ref/object/cache#directoryrecipients) on the [Cache](/docs/ref/object/cache) singleton. Each entry is kept for [`directoryRecipientsTtl`](/docs/ref/object/cache#directoryrecipientsttl), <!-- default:Cache.directoryRecipientsTtl -->10 minutes<!-- /default --> by default.

The cache has a visible consequence. An account removed from the directory is still accepted at `RCPT TO` for up to that time, while a new account is found at once. When the directory cannot be reached, the recipient is deferred with `451 4.4.3 Unable to verify address at this time.`

:::tip[Enterprise feature]
Serving a domain's accounts from an external directory, with the domain's [`directoryId`](/docs/ref/object/domain#directoryid), is available in the [Enterprise edition](/docs/server/enterprise) of Stalwart.
:::

## Relaying

Relaying means accepting a recipient in a domain that is not hosted on the server, and delivering the message to that domain's mail servers. Users need it to send mail to other domains. [`allowRelaying`](/docs/ref/object/mta-stage-rcpt#allowrelaying) decides whether the session may relay. The default allows relaying only for authenticated sessions:

```json
{
  "allowRelaying": {"else": "!is_empty(authenticated_as)"}
}
```

A remote recipient that the session may not relay to is refused with `550 5.7.1 Relay not allowed.` Allowing unauthenticated relaying turns the server into an open relay, which spammers use to send mail through it. Some systems, such as an application server, need to send mail without authenticating. For them, allow relaying only from their address, for example with `!is_empty(authenticated_as) || remote_ip == '192.0.2.10'`.

### Split delivery

In split delivery, the mailboxes of one domain are spread over two servers: Stalwart hosts some of them and another server hosts the rest. Stalwart then has to accept addresses of the domain that it does not know, and pass them on. Setting [`allowRelaying`](/docs/ref/object/domain#allowrelaying) to `true` on the Domain object does this: Stalwart accepts recipients of that domain that do not exist locally, and relays them. The [outbound routing](/docs/mta/outbound/routing) then sends them to the other server.

The two settings named `allowRelaying` answer different questions. The one on the Domain object concerns unknown recipients in a local domain. The expression of MtaStageRcpt concerns recipients in other domains.

## Sub-addressing

Sub-addressing, also called plus addressing, lets users receive mail at variants of their address. A message to `jane.doe+newsletters@example.org`, for example, is delivered to `jane.doe@example.org`. Users can hand out a different variant to each correspondent, and then sort or filter their mail by it.

The [`subAddressing`](/docs/ref/object/domain#subaddressing) field of the Domain object decides how a domain treats such addresses. It has three variants:

- `Enabled`: the part of the local part from the first `+` is removed.
- `Disabled`: the local part is used as given, so `jane.doe+newsletters` must exist as an address of its own.
- `Custom`: the [`customRule`](/docs/ref/object/domain#customrule) expression computes the local part to deliver to, from the original local part in `rcpt`.

The `Custom` variant allows other conventions than `+`. The following rule delivers `alias.user@example.org` to `user@example.org`:

```json
{
  "subAddressing": {
    "@type": "Custom",
    "customRule": {
      "match": {"0": {"if": "matches('^([^.]+)\\.([^.]+)$', rcpt)", "then": "$2"}},
      "else": "rcpt"
    }
  }
}
```

The backslash is doubled because the rule is written in a JSON document. In the expression field of the WebUI, it is written once, as `\.` ([escaping backslashes](/docs/configuration/expressions/functions#escaping-backslashes)).

When the recipient is accepted, it is rewritten to the address that receives the message, and the original address is kept as the original recipient of the message. The envelope recipient therefore no longer carries the sub-address. A user's Sieve script that sorts by sub-address tests the `To` header instead ([Sieve examples](/docs/sieve/examples#file-by-sub-address)).

## Catch-all addresses

A catch-all address receives mail for addresses of a domain that do not exist. Without one, unknown recipients are refused. A domain that names one in [`catchAllAddress`](/docs/ref/object/domain#catchalladdress) accepts every recipient address, and delivers the mail for unknown recipients to it. This has effects on spam volume and on senders, which [Catch-all address](/docs/domains/addresses#catch-all-address) describes.

## Rewriting recipients

A recipient address can also be replaced before it is resolved, for example to map one address convention to another. [`rewrite`](/docs/ref/object/mta-stage-rcpt#rewrite) does this. When the expression returns an address, that address is used. Any other result, such as `false`, leaves the recipient unchanged.

The rewrite is applied after the Sieve script, milters and MTA hooks of this stage, so these see the address as the client gave it. The following expression delivers `first.last@` addresses of local domains to `first+last@`:

```json
{
  "rewrite": {
    "match": {"0": {"if": "is_local_domain(rcpt_domain) && matches('^([^.]+)\\.([^.]+)@(.+)$', rcpt)", "then": "$1 + '+' + $2 + '@' + $3"}},
    "else": "false"
  }
}
```

[Address rewriting](/docs/mta/rewrite/address) describes rewriting in general.

## Sieve script

[`script`](/docs/ref/object/mta-stage-rcpt#script) selects a system [Sieve script](/docs/sieve/interpreter/trusted) to run for each recipient. The script runs before the recipient is rewritten and resolved. As a consequence, it also runs for recipients that are later refused as unknown. The script sees the recipient being added as `envelope.to`. It can refuse that recipient without affecting the other recipients of the message. The following script refuses recipients whose local part starts with `noreply`:

```sieve
require ["envelope", "reject"];

if envelope :localpart :matches "to" "noreply*" {
    reject "550 5.1.1 This address does not accept mail.";
}
```

<!-- sievepad { "envelopeTo": [ "noreply-billing@example.org" ] } -->
<p><a href="https://sievepad.com/#w=PY9BTsQwDEWvYnmJSkUX3YQNEgcAzXQ36SKkphOUJiHxFFBViXNxHE6Cq1HJJvl6P_b_C86omgqDmQgVHtn4D5MZhmiLgsPjcwfdExQ2I8Hv9w8cHc0ExWaXGCu8Pgqq07KPmIwLG4mXbDed6f3iMsFJI4WZfEyksQIt4I0sa-zvddDBvcKOQflojU9bDjUZtmcq4ueoUa4QMyX_dSNi0QHkXAcJats7aOumbqA7uwJmGDKVIl3kf4gMxlpKDJLQ1xpl7aoDrn2Fk9ik4dZDVCFmF0ZRy3_kLgrbd9--OO_F8UCfZkqe6phH7Nf1Dw" target="_blank" rel="noopener">Try this script in Sievepad</a></p>
<!-- /sievepad -->

The following expression runs the script, installed under the name `rcpt-filter`, for unauthenticated sessions only:

```json
{
  "script": {
    "match": {"0": {"if": "is_empty(authenticated_as)", "then": "'rcpt-filter'"}},
    "else": "false"
  }
}
```

On other servers, greylisting is often implemented in a script at this stage. Stalwart has it built in ([Greylisting](/docs/spamfilter/greylist)), so no script is needed for it.

## Limits

Three limits apply to recipients:

| Field | Default | Limit |
|---|---|---|
| [`maxRecipients`](/docs/ref/object/mta-stage-rcpt#maxrecipients) | <!-- default:MtaStageRcpt.maxRecipients -->`100`<!-- /default --> | Recipients per message. Further recipients are refused with `455 4.5.3 Too many recipients.`, and the client may send the message to them in a new transaction. |
| [`maxFailures`](/docs/ref/object/mta-stage-rcpt#maxfailures) | <!-- default:MtaStageRcpt.maxFailures -->`5`<!-- /default --> | Refused recipients per session. When reached, the session is closed with `451 4.3.0 Too many errors, disconnecting.` |
| [`waitOnFail`](/docs/ref/object/mta-stage-rcpt#waitonfail) | <!-- default:MtaStageRcpt.waitOnFail as=duration -->5 seconds<!-- /default --> | Delay before answering a refused recipient. |

The delay and the failure limit work together against clients that try addresses to find out which ones exist: each wrong guess costs time, and too many wrong guesses end the session. Like the other settings, the limits are expressions. The following object body lowers the recipient limit for unauthenticated sessions:

```json
{
  "maxRecipients": {
    "match": {"0": {"if": "is_empty(authenticated_as)", "then": "25"}},
    "else": "100"
  }
}
```
