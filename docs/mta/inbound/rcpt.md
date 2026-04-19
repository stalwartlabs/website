---
sidebar_position: 6
---

# RCPT stage

The `RCPT TO` command specifies the recipient of an email message during the SMTP message transfer. It is used in conjunction with the `MAIL FROM` command. After the command is issued, the SMTP server responds with a status code indicating whether the recipient is valid and the server is willing to accept the message. If the recipient is valid, the SMTP client proceeds with the `DATA` command.

RCPT-stage behaviour is configured on the [MtaStageRcpt](/docs/ref/object/mta-stage-rcpt) singleton (found in the WebUI under <!-- breadcrumb:MtaStageRcpt --><!-- /breadcrumb:MtaStageRcpt -->).

## Directory

Handling of local accounts relies on a configured [directory](/docs/auth/backend/overview), which performs the following roles:

- **Identifying local domains**: messages destined for these domains are accepted for local processing and storage.
- **Validating recipients**: the directory confirms whether a recipient address corresponds to a valid local account before the server accepts the message.
- **Verifying addresses**: the SMTP `VRFY` command queries the directory to confirm that an address is valid.
- **Expanding addresses**: the SMTP `EXPN` command retrieves the actual delivery addresses when a single address is aliased to a group.

Without a directory, Stalwart cannot accept mail for local delivery, except in the case where [relay functionality](#relay) is enabled so that messages can be forwarded to another server.

<!-- review: The previous docs configured the directory per-stage via `session.rcpt.directory`. MtaStageRcpt in the current schema does not expose a directory selector; confirm whether directory selection is now global (via a dedicated Directory or Authentication singleton) and how to override it per RCPT stage if at all. -->

## Relay

Relaying is the process of transferring an email from one mail server to another. When relaying is enabled, Stalwart acts as an intermediary, accepting messages from sending clients or servers and forwarding them to their ultimate destination. This is useful when Stalwart is deployed as a front-end server in a larger email infrastructure, but it must be restricted to authorised senders or networks to prevent open-relay abuse.

The [`allowRelaying`](/docs/ref/object/mta-stage-rcpt#allowrelaying) field accepts an expression that determines whether the SMTP server accepts messages for non-local domains. The default policy only allows relaying when the session is authenticated:

```json
{
  "allowRelaying": {
    "match": [{"if": "!is_empty(authenticated_as)", "then": "true"}],
    "else": "false"
  }
}
```

## Subaddressing

Subaddressing, also known as plus addressing or detailed addressing, allows the creation of dynamic, disposable email addresses under a primary email address. By adding a `+` sign and any string of text to the local part of an address (for example `jane.doe+newsletters@example.org`), users can create an unlimited number of unique addresses that all deliver to the same mailbox. This makes it easier to filter and sort incoming mail, for example to separate subscriptions from personal correspondence.

<!-- review: The previous docs exposed `session.rcpt.sub-addressing` both as a boolean (enable standard `+` subaddressing) and as an expression (custom subaddressing pattern). MtaStageRcpt in the current schema does not list a subaddressing field; confirm whether subaddressing is now always enabled, is a domain-level setting, or is configured elsewhere (for example on the Directory or Domain object). Historical examples included a regex pattern such as `matches('^([^.]+)\.([^.]+)@(.+)$', rcpt)` with `then = "$2 + '@' + $3"` to strip an alias prefix. These should be reinstated once the correct field is identified. -->

## Catch-all addresses

A catch-all address receives all messages sent to non-existent addresses within a domain, preventing loss of mail due to misspellings. A catch-all is typically designated by adding `@<DOMAIN_NAME>` as an associated email address for a given account in the directory.

<!-- review: The previous docs exposed `session.rcpt.catch-all` as a boolean and as an expression for custom catch-all behaviour, for example `matches('(.+)@(.+)$', rcpt)` with `then = "'info@' + $2"` to route all unknown recipients to `info@<domain>`. MtaStageRcpt in the current schema does not list a catch-all field; confirm whether catch-all behaviour is now always inferred from the directory or is configured elsewhere (for example on the Domain object). -->

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
