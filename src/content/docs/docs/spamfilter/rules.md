---
sidebar_position: 5
title: "Rules"
description: "Spam filter rules: how they are written as expressions, which parts of a message each rule type examines, the order in which rules run, the variables available to them, and how to test and customise them."
---

Rules are the part of the spam filter that administrators extend most often. A rule looks for one pattern in one part of a message. When it finds the pattern, it adds a tag, and the tag's score then counts towards the [spam score](/docs/spamfilter/settings/scores) of the message. Rules therefore let an administrator react to spam that the built-in analyses miss, or to patterns that are specific to the mail of one organisation.

The rule set that Stalwart downloads on first start provides about 70 rules, whose names start with `STWT_`. Administrators add their own rules next to them. Each rule is a [SpamRule](/docs/ref/object/spam-rule) object, found in the WebUI under <!-- breadcrumb:SpamRule --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> Spam Filter › Rules<!-- /breadcrumb:SpamRule -->.

## Writing a rule

The heart of a rule is its [`condition`](/docs/ref/object/spam-rule#condition), an [expression](/docs/configuration/expressions/) that returns the name of the tag to add, or `false` to add none. Because the condition returns the tag name instead of a simple yes or no, one rule can add different tags depending on what it finds.

Besides `condition`, a rule has a [`name`](/docs/ref/object/spam-rule#name), an optional `description` and an [`enable`](/docs/ref/object/spam-rule#enable) flag. Its [`priority`](/docs/ref/object/spam-rule#priority) decides when it runs, as described under [Evaluation order](#evaluation-order).

### Variants

The variant of a rule selects the part of the message it examines. Some variants cover several items, such as every URL of the message. A rule of such a variant is evaluated once for each item, and its condition sees variables that describe the current item:

| Variant | Evaluated | Item variables |
|---|---|---|
| `Url` | For each URL in the message | [`SpamUrlVariable`](/docs/ref/expression/variable/spam-url-variable): `url`, `host`, `sld`, `scheme`, `path`, `query`, `port`, ... |
| `Domain` | For each domain in the message | [`SpamGenericVariable`](/docs/ref/expression/variable/spam-generic-variable): `value` |
| `Email` | For each email address in the headers and the envelope | [`SpamEmailVariable`](/docs/ref/expression/variable/spam-email-variable): `email`, `name`, `local`, `domain`, `sld` |
| `Ip` | For each IP address: the client, the `Received` chain and the body | [`SpamIpVariable`](/docs/ref/expression/variable/spam-ip-variable): `ip`, `ip_reverse`, `octets`, `is_v4`, `is_v6` |
| `Header` | For each header field | [`SpamHeaderVariable`](/docs/ref/expression/variable/spam-header-variable): `name`, `name_lower`, `value`, `value_lower`, `attributes`, `raw` |
| `Body` | For each text part | `SpamGenericVariable`: `value` |
| `Any` | Once per message | `SpamGenericVariable` |

### Variables

Every variant also sees the variables that describe the message as a whole. Among them are `remote_ip`, `helo_domain`, `authenticated_as`, `asn`, `country`, `env_from`, `from`, `reply_to`, `to`, `subject` and `body.text`. The variable `spam_probability` holds the probability estimated by the [classifier](/docs/spamfilter/classifier/), from `0` to `1`, or `-1` when the classifier did not run. The [variable reference](/docs/ref/expression/variable/spam-default-variable) lists them all.

The same address or domain can mean different things depending on where it appears, so two variables describe the current item further. `location` names the part of the message the item comes from. Its values are `env_from`, `env_to`, `from`, `reply_to`, `to`, `cc`, `bcc`, `subject`, `message_id`, `received`, `ehlo`, `tcp` (the connecting client), `dkim_pass` (a domain with a passing DKIM signature), `dnt` (the `Disposition-Notification-To` header), `body_text`, `body_html` and `attachment`. `sld` is the registrable domain of a host or address, the part that an organisation registers: `example.co.uk` for `mail.example.co.uk`.

A condition can also build on the work of earlier checks. Writing a tag name preceded by `$`, for example `$DMARC_POLICY_ALLOW`, tests whether an earlier rule or check has added that tag.

### Example

The following rule uses the `Email` variant to tag messages whose sender or reply-to address belongs to a free or disposable mail provider:

```json
{
  "@type": "Email",
  "name": "LOCAL_FREE_OR_DISP",
  "enable": true,
  "priority": 600,
  "condition": {
    "match": {
      "0": {"if": "!contains(['env_from', 'from', 'reply_to'], location) || is_empty(sld)", "then": "false"},
      "1": {"if": "key_exists('stwt_free_domains', domain)", "then": "'FREEMAIL_' + to_uppercase(location)"},
      "2": {"if": "key_exists('stwt_disposable_domains', domain)", "then": "'DISPOSABLE_' + to_uppercase(location)"}
    },
    "else": "false"
  }
}
```

The rule runs for every address in the message, so its first branch narrows it down: it returns `false` for addresses outside the three headers of interest. The other two branches test the domain against the [provider lists](/docs/spamfilter/settings/domain-lists#free-and-disposable-mail-providers), and build the tag name from the location, producing for example `FREEMAIL_FROM`.

Adding a tag is not enough to change the verdict. A tag only affects the score when a [SpamTag](/docs/ref/object/spam-tag) gives it one.

## Evaluation order

Rules run variant by variant, in the order `Url`, `Domain`, `Email`, `Ip`, `Header`, `Body` and `Any`. Within each variant, they run in ascending order of `priority`, so lower values run first. A rule created without a priority gets a priority of <!-- default:SpamRule.priority -->500<!-- /default -->.

The order matters because a condition can test the tags added by earlier rules. A rule that depends on the tag of another rule must therefore run after it, either in a later variant, or in the same variant with a higher priority value.

### Stages around the AI classifier

The rules are split into two stages around the [AI classifier](/docs/spamfilter/ai/), so that rules can react to its verdict. A rule whose condition refers to a tag starting with `AI_`, or to a tag added by such a rule, runs after the AI classifier. Every other rule runs before it.

The split has a limit: rules that build tag names at run time, for example by concatenating strings, are not recognised as depending on the AI classifier, and run before it. Rules of the second stage do not run at all when a reject or discard tag has already decided the message.

The variables `spam_score` and `spam_threshold` are available only in the [`condition`](/docs/ref/object/spam-ai#condition) of the AI classifier. A rule that uses them is reported as a configuration error and is not loaded.

## Testing a rule

A new rule is best checked against a real message before it affects delivery. The `ClassifySpam` [action](/docs/management/tasks-actions/actions) serves this purpose: it runs the spam filter on a message without delivering it.

The action takes the raw message in `message`, together with the client IP address (`remoteIp`), the EHLO name (`ehloDomain`), the envelope sender (`mailFrom`, with optional `mailFromParameters`) and the recipients (`rcptTo`). It returns the score, the verdict, and every tag with its score and disposition. After saving a rule, run the action on a message that the rule should match, and check whether the tag appears.

When the AI classifier is enabled, the action also returns `aiGate`, `aiFacts` and `aiVerdict`, described in [Enabling the AI classifier](/docs/spamfilter/ai/enable).

## Customising the rules of the rule set

The rules named `STWT_*` belong to the rule set, and every [rule set update](/docs/spamfilter/settings/general#rule-set-updates) replaces them with the new version. The update keeps only their `enable` setting, so a change made to their condition or priority is lost at the next update.

To change the behaviour of such a rule, disable it and create a local rule with a different name. Updates never touch local rules. The following command disables a rule of the rule set, identified by its id:

```sh
stalwart-cli update SpamRule <id> --field enable=false
```

The following object then creates the replacement:

```json
{
  "@type": "Header",
  "name": "LOCAL_BULK_MAILER",
  "enable": true,
  "priority": 20,
  "condition": {"else": "if_then(name_lower == 'x-mailer' && contains(value_lower, 'massmailer'), 'LOCAL_BULK_MAILER', false)"}
}
```

Often the rule itself is fine and only its weight is wrong. To change how much a rule's tag counts, change the tag's score instead, which updates preserve.
