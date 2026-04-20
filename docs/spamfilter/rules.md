---
sidebar_position: 5
---

# Rules

Stalwart supports custom spam filter rules that analyse incoming messages and assign tags dynamically. Rules use [expressions](/docs/configuration/expressions/overview) to evaluate specific parts of a message (headers, body, sender information, attachments, and so on) and to decide which tags to apply.

Stalwart ships with a set of preconfigured rules that cover common spam patterns. Administrators can also create custom rules tailored to local requirements.

## Configuration

Each rule is a [SpamRule](/docs/ref/object/spam-rule) object (found in the WebUI under <!-- breadcrumb:SpamRule --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> Spam Filter › Rules<!-- /breadcrumb:SpamRule -->). SpamRule is a multi-variant object: the variant selects which part of the message the rule evaluates (`Url`, `Domain`, `Email`, `Ip`, `Header`, `Body`, or `Any`).

Each rule instance carries:

- [`enable`](/docs/ref/object/spam-rule#enable): whether the rule is active. Disabled rules are skipped during filtering.
- [`condition`](/docs/ref/object/spam-rule#condition): an [`Expression`](/docs/ref/object/spam-rule#expression) that evaluates the rule. If the expression returns a tag, that tag is assigned to the message; if it evaluates to `false`, the rule is skipped.
- [`priority`](/docs/ref/object/spam-rule#priority): the order in which rules are evaluated. Lower values run first. Default 500.

Example reproducing the freemail/disposable provider rule, using the `Email` variant:

```json
{
  "@type": "Email",
  "name": "STWT_FREE_OR_DISP",
  "enable": true,
  "priority": 63,
  "condition": {
    "match": [
      {"if": "!contains(['env_from', 'from', 'reply_to', 'to', 'cc', 'bcc', 'dnt'], location) || is_empty(sld)", "then": "false"},
      {"if": "key_exists('freemail-providers', sld)", "then": "'FREEMAIL_' + to_uppercase(location)"},
      {"if": "key_exists('disposable-providers', sld)", "then": "'DISPOSABLE_' + to_uppercase(location)"}
    ],
    "else": "false"
  }
}
```

## Core rules

Core rules are predefined spam filter rules maintained by Stalwart Labs. They are identified by a name starting with `STWT_` and cover common spam patterns and behaviours. Core rules are updated regularly to remain effective against evolving tactics.

The latest version of the core rules is maintained in the [Spam Filter repository](https://github.com/stalwartlabs/spam-filter). Stalwart can be configured to download and apply rule [updates](/docs/spamfilter/settings/general#updates) automatically.

Core rules should not be modified directly, because any changes are overwritten on the next update. The only safe in-place modification is toggling [`enable`](/docs/ref/object/spam-rule#enable) on a core rule, which is preserved across updates. To customise behaviour beyond enabling or disabling a core rule, disable the core rule and create a custom rule with the desired values.

For example, to disable a core rule and add a custom one:

```json
{
  "@type": "Header",
  "name": "STWT_SOME_SYSTEM_RULE",
  "enable": false
}
```

```json
{
  "@type": "Header",
  "name": "MY_CUSTOM_RULE",
  "enable": true,
  "priority": 20,
  "condition": {"else": "custom expression here"}
}
```

This keeps customisations intact while still benefiting from ongoing updates to the core rules.
