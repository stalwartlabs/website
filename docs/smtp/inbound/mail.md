---
sidebar_position: 4
---

# MAIL stage

The `MAIL FROM` command is used to initiate an SMTP message transfer by identifying the sender of the message. After the MAIL FROM command is issued, the receiving mail server checks the validity of the sender email address and ensures that the sender is authorized to send messages on behalf of that domain. If the sender email address is deemed valid, the message transfer process continues and the next command is issued to specify the recipient email address using the SMTP `RCPT TO` command.

## Address rewriting

Rewriting expressions can be used to modify the sender address of an email. This can be useful, for instance, for obfuscating the sender address for privacy reasons, or for changing the domain in an address to match a company's branding. Sender address rewriting is configured using the `session.mail.rewrite` attribute.

For example, the following configuration will remove any subdomain from the sender address:

```toml
[session.mail]
rewrite = [ { if = "listener != 'smtp' & matches('^([^.]+)@([^.]+)\.(.+)$', rcpt)", then = "$1 + '@' + $3" },
            { else = false } ]
```

For more information, please refer to the [address rewriting](/docs/smtp/rewrite/address) documentation.

## Sieve script

The `session.mail.script` attribute specifies the name of the [Sieve script](/docs/sieve/overview) to run after a successful `MAIL FROM` command. This can be useful, for instance, for rejecting certain senders or rewriting the sender address.

Example:

```toml
[session.connect]
mail = "'return_path_filter'"

[sieve.trusted.scripts]
return_path_filter = '''
  require ["variables", "envelope", "reject"];

  if envelope :localpart :is "from" "known_spammer" {
      reject "We do not accept SPAM here.";
  }
'''
```


