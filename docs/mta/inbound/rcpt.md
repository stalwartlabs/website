---
sidebar_position: 6
---

# RCPT stage

The `RCPT TO` command specifies the recipient of an email message during the SMTP message transfer. It is used in conjunction with the `MAIL FROM` command. After the command is issued, the SMTP server responds with a status code indicating whether the recipient is valid and the server is willing to accept the message. If the recipient is valid, the SMTP client proceeds with the `DATA` command.

RCPT-stage behaviour is configured on the [MtaStageRcpt](/docs/ref/object/mta-stage-rcpt) singleton (found in the WebUI under <!-- breadcrumb:MtaStageRcpt --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Session › RCPT TO Stage<!-- /breadcrumb:MtaStageRcpt -->).

## Directory

Handling of local accounts relies on a configured [directory](/docs/auth/backend/overview), which performs the following roles:

- **Identifying local domains**: messages destined for these domains are accepted for local processing and storage.
- **Validating recipients**: the directory confirms whether a recipient address corresponds to a valid local account before the server accepts the message.
- **Verifying addresses**: the SMTP `VRFY` command queries the directory to confirm that an address is valid.
- **Expanding addresses**: the SMTP `EXPN` command retrieves the actual delivery addresses when a single address is aliased to a group.

Without a directory, Stalwart cannot accept mail for local delivery, except in the case where [relay functionality](#relay) is enabled so that messages can be forwarded to another server.

The directory that validates a given recipient is detected automatically from the recipient domain: Stalwart matches the RCPT address against the configured [Domain](/docs/ref/object/domain) objects and routes the lookup to the [`directoryId`](/docs/ref/object/domain#directoryid) associated with that domain, falling back to the internal directory when no explicit directory is set. MtaStageRcpt exposes no per-stage directory override.

### Split-delivery relaying

In split-delivery setups, Stalwart sits in front of another server that hosts a subset of a domain's mailboxes. Messages for recipients that are not present in the local directory can be forwarded upstream by setting [`allowRelaying`](/docs/ref/object/domain#allowrelaying) to `true` on the matching [Domain](/docs/ref/object/domain) object. With that flag set, recipients that do not resolve to a local account are accepted and relayed rather than rejected with an unknown-recipient error.

## Relay

Relaying is the process of transferring an email from one mail server to another. When relaying is enabled, Stalwart acts as an intermediary, accepting messages from sending clients or servers and forwarding them to their ultimate destination. This is useful when Stalwart is deployed as a front-end server in a larger email infrastructure, but it must be restricted to authorised senders or networks to prevent open-relay abuse.

The [`allowRelaying`](/docs/ref/object/mta-stage-rcpt#allowrelaying) field on MtaStageRcpt accepts an expression that determines whether the SMTP server accepts messages for non-local domains. The default policy only allows relaying when the session is authenticated:

```json
{
  "allowRelaying": {
    "match": [{"if": "!is_empty(authenticated_as)", "then": "true"}],
    "else": "false"
  }
}
```

This controls relaying for entirely non-local domains. Relaying to unknown recipients within a domain that is otherwise local is governed by the domain-level [`allowRelaying`](/docs/ref/object/domain#allowrelaying) flag described above.

## Subaddressing

Subaddressing, also known as plus addressing or detailed addressing, allows the creation of dynamic, disposable email addresses under a primary email address. By adding a `+` sign and any string of text to the local part of an address (for example `jane.doe+newsletters@example.org`), messages sent to any of these variants are all delivered to the same mailbox. This makes it easier to filter and sort incoming mail, for example to separate subscriptions from personal correspondence.

Subaddressing is configured per domain on the [Domain](/docs/ref/object/domain) object (found in the WebUI under <!-- breadcrumb:Domain --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg> Domains › Domains<!-- /breadcrumb:Domain -->) through the [`subAddressing`](/docs/ref/object/domain#subaddressing) field. The field is a multi-variant value with three variants:

- `Enabled`: standard `+` subaddressing is applied. This is the default.
- `Disabled`: the `+` separator is not treated as a subaddress marker; the full local part is used for delivery.
- `Custom`: a custom rule is applied through the `customRule` expression, which receives the RCPT variables and returns the rewritten local address. For example, to strip an alias prefix so that `alias.user@example.org` delivers to `user@example.org`:

```json
{
  "subAddressing": {
    "@type": "Custom",
    "customRule": {
      "match": [{"if": "matches('^([^.]+)\\.([^.]+)@(.+)$', rcpt)", "then": "$2 + '@' + $3"}],
      "else": "rcpt"
    }
  }
}
```

## Catch-all addresses

A catch-all address receives all messages sent to non-existent addresses within a domain, preventing loss of mail due to misspellings. The catch-all recipient is configured per domain on the [Domain](/docs/ref/object/domain) object through the [`catchAllAddress`](/docs/ref/object/domain#catchalladdress) field, which holds the destination email address that receives mail for unknown local recipients.

For example, to route all unmatched recipients on `example.org` to `info@example.org`:

```json
{
  "name": "example.org",
  "catchAllAddress": "info@example.org"
}
```

When `catchAllAddress` is left unset, messages to unknown local recipients are rejected.

## Address rewriting

The [`rewrite`](/docs/ref/object/mta-stage-rcpt#rewrite) field accepts an expression that can modify the recipient address. Typical uses include correcting common misspellings, obfuscating the original recipient's address for privacy, or redirecting mail traffic from one address to another. For background on the expression-based rewrite model see the [address rewriting](/docs/mta/rewrite/address) documentation.

For example, the following configuration rewrites `first.last@example.org` to `first+last@example.org` for local domains only:

```json
{
  "rewrite": {
    "match": [{"if": "is_local_domain('', rcpt_domain) & matches('^([^.]+)\\.([^.]+)@(.+)$', rcpt)", "then": "$1 + '+' + $2 + '@' + $3"}],
    "else": "false"
  }
}
```

## Sieve script

Running Sieve at the RCPT stage opens up uses that the delivery-time Sieve runtime cannot satisfy. Recipients can be rejected based on criteria such as the recipient domain; [address rewriting](/docs/mta/rewrite/address#sieve) can correct common misspellings or redirect mail; and policies such as greylisting (temporarily rejecting mail from unknown sources and asking the sender to retry) can be implemented against the envelope before the message body is accepted.

The [`script`](/docs/ref/object/mta-stage-rcpt#script) field selects the [Sieve script](/docs/sieve/overview) to run at this stage. A common use is greylisting, implemented by storing a `remote_ip.sender.recipient` triplet in a store and rejecting the first attempt with a `422` temporary failure; the client then retries, and legitimate senders succeed while most spam sources do not.

For example, the following expression runs a `greylist` Sieve script only for unauthenticated sessions:

```json
{
  "script": {
    "match": [{"if": "is_empty(authenticated_as)", "then": "'greylist'"}],
    "else": "false"
  }
}
```

A companion `greylist` Sieve script stores the triplet in a store and rejects the first attempt:

```sieve
require ["variables", "vnd.stalwart.execute", "envelope", "reject"];

set "triplet" "${env.remote_ip}.${envelope.from}.${envelope.to}";

if not query "SELECT 1 FROM greylist WHERE addr=? LIMIT 1" ["${triplet}"] {
    query "INSERT INTO greylist (addr) VALUES (?)" ["${triplet}"];
    reject "422 4.2.2 Greylisted, please try again in a few moments.";
}
```

## Limits

Recipient-handling limits are configured via [`maxRecipients`](/docs/ref/object/mta-stage-rcpt#maxrecipients) (maximum number of recipients allowed per message, default 100), [`maxFailures`](/docs/ref/object/mta-stage-rcpt#maxfailures) (maximum number of invalid-recipient errors allowed before the session is disconnected, default 5), and [`waitOnFail`](/docs/ref/object/mta-stage-rcpt#waitonfail) (amount of time to wait after an invalid recipient is received, default 5 seconds):

```json
{
  "maxRecipients": {"else": "25"},
  "maxFailures": {"else": "5"},
  "waitOnFail": {"else": "5s"}
}
```
