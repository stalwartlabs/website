---
sidebar_position: 9
---

# Quotas

Quotas set limits on the message queue to control its size and total number of messages. Stalwart supports dynamic quotas, which can limit the total size and number of messages waiting to be delivered based on multiple variables. When a queue quota is exceeded, messages are temporarily rejected with a 4xx SMTP code, protecting the server from becoming overwhelmed while ensuring important messages continue to be delivered.

## Settings

Each queue quota is defined as an [MtaQueueQuota](/docs/ref/object/mta-queue-quota) object (found in the WebUI under <!-- breadcrumb:MtaQueueQuota --><!-- /breadcrumb:MtaQueueQuota -->). The relevant fields are:

- [`enable`](/docs/ref/object/mta-queue-quota#enable): whether the quota is active. Default `true`.
- [`messages`](/docs/ref/object/mta-queue-quota#messages): optional maximum number of messages that the queue will accept.
- [`size`](/docs/ref/object/mta-queue-quota#size): optional maximum total size of messages in the queue.
- [`key`](/docs/ref/object/mta-queue-quota#key): list of context variables that determine the grouping of this quota (see [Groups](#groups) below).
- [`match`](/docs/ref/object/mta-queue-quota#match): expression evaluated to decide whether the quota applies to a given message.

A quota may define only a message limit, only a size limit, or both. An MtaQueueQuota with an empty `key` list and a `match` expression that always returns true imposes a global limit.

A global quota of 100,000 messages / 10 GB:

```json
{
  "enable": true,
  "key": [],
  "match": {"else": "true"},
  "messages": 100000,
  "size": 10737418240
}
```

## Groups {#groups}

The [`key`](/docs/ref/object/mta-queue-quota#key) field creates quota groups based on a combination of context variables. Available values are:

- `sender`: the return path specified in the `MAIL FROM` command.
- `senderDomain`: the domain component of the return path.
- `rcpt`: the recipient address specified in the `RCPT TO` command.
- `rcptDomain`: the domain component of the recipient address.

For example, to limit to 10 the total number of queued messages for any single recipient:

```json
{
  "enable": true,
  "key": ["rcpt"],
  "match": {"else": "true"},
  "messages": 10
}
```

And, to limit the queue size to 5 MB per combination of sender domain and recipient domain:

```json
{
  "enable": true,
  "key": ["senderDomain", "rcptDomain"],
  "match": {"else": "true"},
  "size": 5242880
}
```

## Conditional quotas

The [`match`](/docs/ref/object/mta-queue-quota#match) expression can restrict a quota to specific conditions. For example, applying a 900-message / 7 MB quota by recipient only to messages sent from `example.org`:

```json
{
  "enable": true,
  "key": ["rcpt"],
  "match": {"else": "sender_domain == 'example.org'"},
  "messages": 900,
  "size": 7340032
}
```
