---
sidebar_position: 6
---

# Quotas

Quotas allows to set limits on the message queue to control its size and total number of messages. Stalwart SMTP supports enforcing dynamic quotas on the message queue, which means that it can limit the total size and number of messages waiting to be delivered based on multiple variables. If a queue quota is exceeded, messages will be temporarily rejected with a 4xx SMTP code. This is useful in preventing the server from becoming overwhelmed by too many messages and ensuring that important messages are delivered promptly.

## Settings

Stalwart SMTP supports an unlimited number of queue quotas, which can be dynamically configured to limit resource usage based on multiple variables. Quotas are defined as TOML arrays under the `queue.quota[]` keys using the following attributes:

- `messages`: Specifies the maximum number of messages that will be allowed.
- `size`: Specifies the maximum queue size in bytes.
- `key`: An optional list of context variables that determine where this quota should be enforced.
- `match`: An optional rule that indicates the conditions under which this quota should be enforced.

Quotas can either define both a message limit and size limit, or just one of the two.

For example, to create a global queue quota of 100,000 messages and 10gb:

```toml
[[queue.quota]]
messages = 100000
size = 10737418240 # 10gb
```
Please note that the above example will impose a global limit on all queues, to apply a more granular quota please refer to the [quota groups](#groups) section below.

## Groups

The `queue.quota[].key` attribute enables the creation of quota groups based on a combination of context variables. Available context variables are:

- `sender`: The return path specified in the `MAIL FROM` command.
- `sender-domain`: The domain component of the return path specified in the `MAIL FROM` command.
- `rcpt`: The recipient's address specified in the `RCPT TO` command.
- `rcpt-domain`: The domain component of the recipient's address specified in the `RCPT TO` command.

For example, to limit to 10 the total number of queued messages for any recipient:

```toml
[[queue.quota]]
key = ["rcpt"]
messages = 10
```

And, to limit the queue size to 5MB for a combination of sender and recipient domain:

```toml
[[queue.quota]]
key = ["sender-domain", "rcpt-domain"]
size = 5242880 # 5mb
```

## Rules

Rules enable the imposition of quotas on the message queue only when a specific condition is met. These [rules](/docs/smtp/overview) can be configured using the `queue.quota[].match` attribute. For example, to impose a 900 messages and 7mb quota by recipient only for messages sent from the domain "foobar.org":

```toml
[[queue.quota]]
match = {if = "sender-domain", eq = "foobar.org"}
key = ["rcpt"]
messages = 900
size = 7340032 # 7mb
```
