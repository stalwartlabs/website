---
sidebar_position: 4
---

# E-mail addresses

Stalwart Mail Server supports email aliases, mailing lists as well as catch-all addresses and subaddressing mechanisms within its email handling architecture. These features provide users with an enhanced level of control over email management and routing.

## Email aliases

An email alias is an alternative email address that is associated with a user's primary email address. In Stalwart Mail Server, email aliases are managed through the configured directory. This means that if you want to create, modify, or remove an alias, these operations should be performed directly in the directory. 

## Mailing lists

A mailing list is a collection of email addresses used to distribute content to multiple recipients simultaneously. It is an efficient way to send newsletters, updates, or other forms of mass communication to a large group of people. Just like aliases, mailing lists are managed through the configured directory. This means that if you want to create, modify, or remove a mailing list, these operations should be performed directly in the directory. 

## Subaddressing

Subaddressing, also known as plus addressing or detailed addressing, is a mechanism that allows the creation of dynamic, disposable email addresses under a primary email address. By adding a `+` sign and any string of text to the local part (the part before the `@`) of an email address, users can create an infinite number of unique email addresses. For example, `jane.doe+newsletters@example.org` is a subaddress of `jane.doe@example.org`. The primary benefit of this feature is that it allows users to filter and sort their incoming mail more efficiently, providing an easy way to manage subscriptions, sign-ups, and more without needing to create multiple separate email accounts.

### Standard

To enable subaddressing, set the `subaddressing` option to `true` in the `directory.<name>.option` section of the configuration file. For example:

```toml
[directory."sql".options]
subaddressing = true
```

### Custom
 
In addition to the standard subaddressing that uses the `+` symbol in the local part of the email address, Stalwart SMTP also supports custom subaddressing rules. This ability provides enhanced obfuscation tactics against spammers by enabling users to create non-standard ways of handling subaddressing.

This functionality works by matching the user's email address to a specific regular expression, as defined by the `directory.<name>.options.subaddressing.map` parameter in the configuration. If the user's email matches the regular expression, the `directory.<name>.options.subaddressing.to` parameter defines how the email address should be rewritten.

To understand this better, let's take a look at the example given:

```toml
[directory."sql".options]
subaddressing = { map = "^([^.]+)\.([^.]+)@(.+)$", to = "${2}@${3}" }
```

Here, the `map` regex pattern is designed to capture three groups separated by the '.' and '@' symbols in the incoming email address. The `to` parameter then reassembles these captured groups in a new format. In this specific example, the configuration is rewriting the recipient address by removing the first part before the dot, essentially transforming 'alias.user@domain.com' to 'user@domain.com'. 

## Catch-all addresses

A catch-all email address is a mailbox that is designed to receive all messages sent to incorrect or non-existent email addresses within a specific domain. It acts as a sort of safety net, ensuring that no email messages are lost due to misspelling or outdated email addresses. For instance, if someone were to accidentally send a message to `jn.doe@example.org` instead of `jane.doe@example.org`, the catch-all address would receive the message. This feature can be especially useful in a business environment where missing an important email communication can lead to undesirable consequences.

### Standard

Catch-all addresses can be enabled by setting the `catch-all` option to `true` in the `directory.<name>.option` section of the configuration file. For example:

```toml
[directory."sql".options]
catch-all = true
```

To designate a specific account as the catch-all address, add `@<DOMAIN_NAME>` as an associated email address for the account. If you are using an SQL directory with the [sample directory schema](/docs/directory/types/sql#sample-directory-schema), you can find an example of how to create catch-all addresses in the [adding email aliases](/docs/directory/types/sql#adding-an-email-alias) section. 

### Custom

In addition to the standard catch-all functionality described above, it is also possible to define custom recipient addresses to act as a catch-all. This customization is achieved by defining a `directory.<name>.options.catch-all.map` and `directory.<name>.options.catch-all.map` parameters in the configuration, much like the [subaddressing feature](#custom). The 'map' parameter specifies a regular expression to match and capture parts of the incoming email addresses, while the 'to' parameter defines the structure of the new catch-all email address, making use of the captured groups from the 'map' regex.

Let's examine the provided example:

```toml
[directory."sql".options]
catch-all = { map = "(.+)@(.+)$", to = "info@${2}" }
```

In this configuration, the 'map' parameter is designed to capture the local part and the domain part of an incoming email address. The 'to' parameter then creates the catch-all address by replacing the local part with 'info' while retaining the original domain. For instance, if a message is sent to 'nonexistent@domain.com' and there's no such recipient, the email would be redirected to 'info@domain.com'. 

