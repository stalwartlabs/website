---
sidebar_position: 4
---

# Addresses

Stalwart Mail Server supports both catch-all addresses and subaddressing mechanisms within its email handling architecture. These features provide users with an enhanced level of control over email management and routing.

## Catch-all addresses

A catch-all email address is a mailbox that is designed to receive all messages sent to incorrect or non-existent email addresses within a specific domain. It acts as a sort of safety net, ensuring that no email messages are lost due to misspelling or outdated email addresses. For instance, if someone were to accidentally send a message to `jn.doe@example.org` instead of `jane.doe@example.org`, the catch-all address would receive the message. This feature can be especially useful in a business environment where missing an important email communication can lead to undesirable consequences.

Catch-all addresses can be enabled by setting the `catch-all` option to `true` in the `directory.<name>.option` section of the configuration file. For example:

```toml
[directory."sql".options]
catch-all = true
```

To designate a specific account as the catch-all address, add `@<DOMAIN_NAME>` as an associated email address for the account. 

For example, if you are using an SQL directory with the [sample directory schema](/docs/directory/types/sql#sample-directory-schema), you could designate the `postmaster` account as the catch-all address for the `example.org` domain by adding `@example.org` as an email alias for the `postmaster` account:

```sql
INSERT INTO emails (name, address, type) VALUES ('postmaster', '@example.org', 'alias')
```

## Subaddressing

Subaddressing, also known as plus addressing or detailed addressing, is a mechanism that allows the creation of dynamic, disposable email addresses under a primary email address. By adding a `+` sign and any string of text to the local part (the part before the `@`) of an email address, users can create an infinite number of unique email addresses. For example, `jane.doe+newsletters@example.org` is a subaddress of `jane.doe@example.org`. The primary benefit of this feature is that it allows users to filter and sort their incoming mail more efficiently, providing an easy way to manage subscriptions, sign-ups, and more without needing to create multiple separate email accounts.

To enable subaddressing, set the `subaddressing` option to `true` in the `directory.<name>.option` section of the configuration file. For example:

```toml
[directory."sql".options]
subaddressing = true
```
