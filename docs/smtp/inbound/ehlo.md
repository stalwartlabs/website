---
sidebar_position: 3
---

# EHLO stage

The `EHLO` (Extended Hello) is sent by an email client to the server to initiate an SMTP session and negotiate the features and extensions that will be used during the session. The `EHLO` command provides a way for the email client to identify itself, and for the server to advertise the capabilities and extensions it supports, such as authentication mechanisms, message size limits, and others. The response to the `EHLO` command provides information to the client about the server's capabilities, which the client can then use to determine the best way to send the email.

## Settings

The `session.ehlo` key in the configuration file controls the behavior of the `EHLO` (and `HELO`, `LHLO`) command. The following attributes are available under this key:

- `require`: Specifies whether the remote client must send an `EHLO` command before starting an SMTP transaction. It is recommended to set this value to `true` to allow Stalwart SMTP to verify the [SPF](/docs/smtp/authentication/spf) EHLO identity of the client.
- `reject-non-fqdn`: Determines whether to reject `EHLO` commands that do not include a fully-qualified domain name as a parameter. To reduce the amount of spam, it is recommended to enable this option for the standard SMTP port 25, but disable it for authenticated sessions on the SMTP submissions port.
- `script`: The name of the [Sieve script](/docs/smtp/filter/sieve) to run after a successful `EHLO` command.

Example:

```toml
[session.ehlo]
require = true
reject-non-fqdn = [ { if = "listener", eq = "smtp", then = true},
                    { else = false } ]
script = "ehlo"

[sieve.scripts]
ehlo = '''
    require ["variables", "extlists", "reject"];

    if string :list "${env.helo_domain}" "list/blocked-domains" {
        reject "551 5.1.1 Your domain '${env.helo_domain}' has been blocklisted.";
    }
'''

[list]
blocked-domains = ["mail.spammer.com", "mail.spammer.net"]
```

## SMTP Extensions

Stalwart SMTP supports [various SMTP extensions](/docs/development/rfcs#smtp-and-extensions) which can be enabled through the following attributes under the `session.extensions` key:

- `pipelining`: This attribute enables SMTP pipelining (RFC 2920), which enables multiple commands to be sent in a single request to speed up communication between the client and server.
- `chunking`: This attribute enables chunking (RFC 1830), an extension that allows large messages to be transferred in chunks which may reduce the load on the network and server.
- `requiretls`: This attribute enables require TLS (RFC 8689), an extension that allows clients to require TLS encryption for the SMTP session.
- `no-soliciting`: This attribute specifies the text to include in the `NOSOLICITING` (RFC 3865) message, which indicates that the server does not accept unsolicited commercial email (UCE or spam).
- `dsn`: This attribute enables delivery status notifications (RFC 3461), which allows the sender to request a delivery status notification (DSN) from the recipient's mail server.
- `future-release`: This attribute specifies the maximum time that a message can be held for delivery using the `FUTURERELEASE` (RFC 4865) extension. To disable this extension, specify `false`.
- `deliver-by`: This attribute specifies the maximum delivery time for a message using the `DELIVERBY` (RFC 2852) extension, which allows the sender to request a specific delivery time for a message. To disable this extension, specify `false`.
- `mt-priority`: This attribute specifies the priority assignment policy to advertise on the `MT-PRIORITY` (RFC 6710) extension, which allows the sender to specify a priority for a message. Available policies are `mixer`, `stanag4406` and `nsep`, or `false` to disable this extension.
- `vrfy`: This attribute specifies whether to enable the `VRFY` command, which allows the sender to verify the existence of a mailbox. It is recommended to disable this command to prevent spammers from harvesting email addresses.
- `expn`: This attribute specifies whether to enable the `EXPN` command, which allows the sender to request the membership of a mailing list. It is recommended to disable this command to prevent spammers from harvesting email addresses.

Stalwart SMTP additionally supports the `SIZE`, `ENHANCEDSTATUSCODES`, `8BITMIME`, and `SMTPUTF8` extensions, which are not configurable. However, the `AUTH` extension can be configured from its respective sections within the configuration file.

Example:

```toml
[session.extensions]
pipelining = true
chunking = true
requiretls = true
no-soliciting = ""
dsn = [ { if = "authenticated-as", ne = "", then = true},
        { else = false } ]
future-release = [ { if = "authenticated-as", ne = "", then = "7d"},
                   { else = false } ]
deliver-by = [ { if = "authenticated-as", ne = "", then = "15d"},
               { else = false } ]
mt-priority = [ { if = "authenticated-as", ne = "", then = "mixer"},
                { else = false } ]
vrfy = [ { if = "authenticated-as", ne = "", then = true},
                { else = false } ]
expn = [ { if = "authenticated-as", ne = "", then = true},
                { else = false } ]                
```
