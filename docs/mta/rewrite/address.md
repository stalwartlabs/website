---
sidebar_position: 2
---

# Envelope

Address rewriting is a process where the email addresses in the envelope of a message are altered as it moves through the mail server. This envelope, separate from the message content itself, contains essential routing information, including the sender (return-path) and recipient addresses.

Address rewriting can be used for several purposes. For instance, you might want to change outgoing mail addresses to match a specific domain for branding purposes or adjust incoming mail addresses to redirect certain emails to a different inbox.

Address rewriting rules can be defined using regular expressions, providing a powerful and flexible tool for matching and transforming addresses based on patterns. And, for instances where even greater control is needed, is is also possible to manage address rewriting from within [Sieve scripts](/docs/sieve/overview).

Stalwart supports comprehensive address rewriting, allowing changes to both sender and recipient parts of the envelope. This flexibility allows complex manipulations of email traffic to suit a variety of needs. 

## Expressions

Address rewriting in Stalwart is based on the use of [expressions](/docs/configuration/expressions/overview) and regular expressions (regex), a powerful tool for pattern matching in strings. If the regular expression matches the email address, the components of the address that are captured by the regex can be rearranged or modified to form a new address.

The capture groups in the regex, which are delineated by parentheses, are numbered sequentially from 0. The 0th group always refers to the entire address that is matched by the regex, while subsequent numbers correspond to the respective groups in the order they appear.

The replacement syntax `${pos}` is used in the configuration to refer to the numbered capture groups. The variable `pos` here is the position number of the captured group, and `${pos}` would be replaced by the corresponding part of the matched address.

In the given example:

```toml
[session.rcpt]
rewrite = [ { if = "is_local_domain('%{DEFAULT_DIRECTORY}%', rcpt_domain) & matches('^([^.]+)\.([^.]+)@(.+)$', rcpt)", then = "$1 + '+' + $2 + '@' + $3" },
            { else = false } ]
```

The configuration is set to rewrite recipient addresses (`if = "rcpt"`). If an address matches the regular expression in the `matches` attribute, it's then rewritten according to the pattern in the `then` attribute, which uses the `${pos}` syntax to refer to the captured groups. If an address does not match the regular expression, as indicated by `{ else = false }`, no rewriting occurs.

In the configuration file, address rewriting expressions are defined in the `session.mail.rewrite` and `session.rcpt.rewrite` sections. The `session.mail.rewrite` section is used to rewrite the sender address, while the `session.rcpt.rewrite` section is used to rewrite the recipient address.

## Sieve

In situations where the task of address rewriting cannot be accomplished using regular expressions alone, Stalwart offers the flexibility to use [Sieve scripts](/docs/sieve/overview). Sieve is a powerful scripting language designed specifically for mail filtering. It is easy to write and understand, making it a versatile tool for mail server administrators. Stalwart supports the `envelope` Sieve extension, which provides access to details of the message envelope such as sender and recipient addresses, as well as other envelope information such as Delivery Status Notifications (DSN).

In order to modify parts of the envelope within a Sieve script, the `set` command is used. The `set` command allows you to define and modify variables within your script, which can then be applied to elements of the envelope. This opens up an extensive range of possibilities for address rewriting, providing the power to construct elaborate rules for customizing how your mail server processes and directs incoming and outgoing messages.

Rewriting rules defined in Sieve scripts are configured in the `sieve.trusted.scripts` section of the configuration file. The `sieve.trusted.scripts` section is a table of key-value pairs, where the key is the name of the script and the value is the script itself. The name of the script is used to refer to it in the `session.mail.script` and `session.rcpt.script` sections. For more details please refer to the [Sieve scripts](/docs/sieve/overview), [MAIL FROM](/docs/mta/inbound/mail) stage and [RCPT TO](/docs/mta/inbound/rcpt) stage sections of the documentation.

## Examples

### Ignore dots

Gmail has a specific functionality where it disregards any periods '.' in the local part (before the '@') of an email address. This means that if you have an email address like 'example@gmail.com', you will still receive emails sent to 'ex.ample@gmail.com' or 'e.x.a.m.p.l.e@gmail.com'. This is a handy feature that provides flexibility to the users and ensures that the email is delivered even if someone mistakenly adds dots to the email address.

In Stalwart, you can accomplish the same effect using Sieve scripts. 

```toml
[session.rcpt]
script = "'remove-dots'"

[sieve.trusted.scripts.remove-dots]
contents = '''require ["variables", "envelope", "regex"];

if allof( envelope :localpart :contains "to" ".",
          envelope :regex "to" "(.+)@(.+)$") {
    set :replace "." "" "to" "${1}";
    set "envelope.to" "${to}@${2}";
}'''

```

Here is a breakdown of how the script works:

- The script starts with `require ["variables", "envelope", "regex"];` which indicates the Sieve extensions that will be used in this script. In this case, we use the 'variables' extension for setting and modifying variables, 'envelope' for accessing envelope information, and 'regex' for using regular expressions.

- The `if allof(...)` conditional checks two conditions:
    1. If the local part of the recipient ('to') contains any periods.
    2. If the 'to' address can be broken down into a local part and a domain part using regular expression.

    If both conditions are met, the script continues with the `set` commands inside the `if` block.

- `set :replace "." "" "to" "${1}";` This command removes any periods from the local part of the address by replacing them with nothing (""), and stores the result in a variable called "to".
- `set "envelope.to" "${to}@${2}";` This command constructs the new recipient address by joining the modified local part (without periods) with the original domain, and sets the envelope 'to' address to this new value.

This effectively mimics Gmail's period-ignoring functionality, ensuring that emails reach their intended recipient even if additional periods are inserted in the address.


### Silent bounces

There might be situations where it is necessary to modify additional parts of the SMTP envelope. For instance, certain SMTP parameters such as:

- `NOTIFY`: Determines when the sender should be notified about the status of the delivery of the email. It can have values like "NEVER", "SUCCESS", "FAILURE", or "DELAY".
- `ENVID`: Used for associating a unique identifier with a message, which is helpful for tracking purposes.
- `ORCPT`: Used to provide the original recipient address when it's different from the address in the envelope. This is useful in cases of address rewriting or forwarding.

Now, let's consider an example where you might want to disable Delivery Status Notifications (DSN) for a specific recipient (like a mailer-daemon address). The following script can be used for this purpose:

```toml
[session.rcpt]
script = "'silent-bounce'"

[sieve.trusted.scripts.silent-bounce]
contents = '''require ["variables", "envelope"];

if envelope :matches "to" "mailer-daemon@*" {
    set "envelope.notify" "NEVER";
}'''
```

Here is a breakdown of how the script works:

- The script itself begins by requiring the "variables" and "envelope" extensions.
- The conditional `if envelope :matches "to" "mailer-daemon@*"` checks if the recipient address matches the pattern "mailer-daemon@*". If it does, the script proceeds to execute the `set` command within the `if` block.
- The line `set "envelope.notify" "NEVER";` sets the envelope's NOTIFY parameter to "NEVER", thereby disabling DSNs for emails sent to any "mailer-daemon" address. This would ensure that no DSNs are sent for emails directed to these addresses, thereby suppressing unnecessary notifications.
