---
sidebar_position: 5
---

# Rules

Stalwart supports custom spam filter rules to be defined, allowing administrators to analyze email messages and assign tags dynamically. These rules rely on [expressions](/docs/configuration/expressions/overview) to evaluate different sections of an email, such as the headers, body, sender information, or attachments, and determine whether specific tags should be applied to identify potential spam.

By default, Stalwart includes a comprehensive set of preconfigured rules designed to address common spam patterns and behaviors. However, the flexibility of the system allows administrators to create their own rules tailored to the specific needs and requirements of their organization. This customization ensures that the spam filter can adapt to unique environments, providing enhanced accuracy and protection against unwanted emails.

## Configuration

Spam filter rules in Stalwart are defined under the `spam-filter.rule.<id>` section, where `<id>` is a unique identifier for each rule. These rules allow administrators to evaluate specific parts of an email and dynamically assign tags based on customizable expressions.

The following settings are available for each rule:

- `enable`:  This setting determines whether the rule is active. When set to `true`, the rule is enabled and will be applied during spam filtering. If set to `false`, the rule is ignored.
- `condition`: Defines an expression that evaluates whether the rule should apply. If the expression returns a tag, the tag is assigned to the message. If the expression evaluates to `false`, the rule is skipped for that message.
- `scope`: Specifies the part of the message to analyze.
- `priority`: Determines the order in which rules are evaluated. Rules with lower priority values are processed first. This allows administrators to control the sequence of rule application.

Supported scopes include:

- `url`: Evaluates URLs within the message.
- `domain`: Evaluates domains present in the message.
- `email`: Evaluates email addresses in the message.
- `ip`: Evaluates IP addresses associated with the message.
- `header`: Evaluates the message headers.
- `body`: Evaluates the content of the message body.
- `any`: Evaluates all parts of the message.

Example:

```toml
[spam-filter.rule.STWT_FREE_OR_DISP]
enable = true
scope = "email"
priority = 63
condition = [ { if = "!contains(['env_from', 'from', 'reply_to', 'to', 'cc', 'bcc', 'dnt'], location) || is_empty(sld)", then = "false" },
			  { if = "key_exists('freemail-providers', sld)", then = "'FREEMAIL_' + to_uppercase(location)" },
			  { if = "key_exists('disposable-providers', sld)", then = "'DISPOSABLE_' + to_uppercase(location)" },
			  { else = false } ]
```

## Core rules

Core rules are predefined spam filter rules maintained by Stalwart Labs. These rules are identified by an ID starting with `STWT_` and are designed to address common spam patterns and behaviors. Core rules are regularly updated to ensure they remain effective against evolving spam tactics.

The latest version of core rules is maintained in the [Spam Filter repository](https://github.com/stalwartlabs/spam-filter). Stalwart can be configured to automatically download and apply the latest [updates](/docs/spamfilter/settings/general#updates), ensuring the spam filter stays up-to-date without manual intervention.

Administrators should avoid modifying `STWT_` core rules directly, as any changes will be overwritten during the next update. The only exception is the `enable` setting, which allows administrators to control whether a core rule is active. This setting is preserved across updates. If a core rule needs to be altered beyond enabling or disabling it, the recommended approach is to disable the rule and create a custom rule with the desired changes. By doing so, administrators can ensure their customizations are retained while still benefiting from future updates to the core rules.

Example:

```toml
[spam-filter.rule.STWT_SOME_SYSTEM_RULE]
enable = false

[spam-filter.rule.MY_CUSTOM_RULE]
enable = true
condition = "custom expression here"
scope = "header"
priority = 20
```

By following this approach, administrators can customize the behavior of the spam filter while maintaining compatibility with automatic rule updates. This ensures that the core remains both flexible and current with the latest anti-spam strategies.
