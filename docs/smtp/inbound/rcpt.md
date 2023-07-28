---
sidebar_position: 5
---

# RCPT stage

The `RCPT TO` command is a used to specify the recipient of an email message during the SMTP message transfer. It is used in conjunction with the `MAIL FROM` command, which specifies the sender of the email. After the `RCPT TO` command is issued, the SMTP server responds with a status code indicating whether the recipient is valid and whether it is willing to accept the email message for that recipient. If the recipient is valid and the server is willing to accept the email, the SMTP client can then proceed to send the email message using the `DATA` command.

## Directory

In order to handle mail for local accounts, it's necessary to configure a [directory](/docs/directory/overview). This directory plays a crucial role in managing mail delivery as it fulfills several tasks:

- **Identifying Local Domains**: Emails destined for these domains are processed and stored by the server.
- **Validating Recipients**: It checks whether a given recipient's address corresponds to a valid, existing local account before accepting the email for delivery.
- **Verifying Addresses**: The SMTP `VRFY` (verify) command is used to validate an email address without sending a message. If a sender uses this command, the server checks the directory to confirm whether the given address is valid.
- **Expanding Addresses**: The SMTP `EXPN` (expand) command is used to get the actual delivery addresses when a single address is aliased to a group of addresses.

Without this directory configured, Stalwart SMTP won't accept any emails, as it has no way of validating or processing them. The only exception would be if [relay functionality](#relay) is enabled, allowing Stalwart SMTP to simply pass on emails to another server for delivery. 

The directory to be used can be configured using the `session.rcpt.directory` attribute. For more information, please refer to the [directory](/docs/directory/overview) documentation.

Example:

```toml
[session.rcpt]
directory = "sql"
```

## Relay

Relaying is a fundamental operation in email delivery, it refers to the process of transferring an email from one mail server to another. In more detail, when an email is sent, it may not directly reach its final destination server. Instead, it often travels through multiple intermediate servers - these servers "relay" the email towards its final destination. This is especially true when the sender and recipient are on different networks or domains.

In the context of Stalwart SMTP, the `relay` parameter dictates whether the server is permitted to relay messages intended for non-local domains. If relaying is enabled, Stalwart SMTP acts as an intermediary, accepting messages from sending clients or servers and forwarding them to their ultimate destinations.

This functionality can be beneficial in various scenarios, such as when Stalwart SMTP is configured as a front-end server in a larger email infrastructure. However, care must be taken to properly secure relay functionality, as an open relay can be exploited for spamming purposes. Thus, it's crucial to ensure only authorized users or networks are allowed to use Stalwart SMTP for relaying messages.

The `session.rcpt.relay` setting specifies whether the SMTP server should relay messages for non-local domain names. This attribute is useful when configured as a [rule](/docs/configuration/overview/rules/syntax) that only allows relaying for authenticated users.

For example:

```toml
[session.rcpt]
relay = [ { if = "authenticated-as", ne = "", then = true }, 
          { else = false } ]
```

## Address rewriting

Recipient addresses can be rewritten using regular expressions, adding a high degree of flexibility and control to the handling of incoming messages. This can be particularly useful in several scenarios. For instance, if you need to correct common misspellings of recipient addresses, obfuscate the original recipient's address for privacy reasons, or redirect mail traffic from one address to another, regex rewriting can be a potent solution. 

Recipient address rewriting is configured using the `session.rcpt.rewrite` attribute. For example, the following configuration will replace the '.' in the recipient address with a '+' sign:

```toml
[session.rcpt]
rewrite = [ { all-of = [ { if = "rcpt-domain", in-list = "sql/domains" },
                         { if = "rcpt", matches = "^([^.]+)\.([^.]+)@(.+)$"}, 
                       ], then = "${1}+${2}@${3}" }, 
            { else = false } ]
```

For more information, please refer to the [address rewriting](/docs/smtp/rewrite/address) documentation.

## Sieve script

In order to provide more flexibility and control over the handling of incoming messages, [Sieve scripts](/docs/smtp/filter/sieve) can also be executed during the `RCPT TO` stage of the SMTP transaction. Typically, Sieve scripts are run at the delivery stage, but running them during the `RCPT TO` stage opens up more possibilities. At this stage, the sending server is indicating who the email is for. With the ability to manipulate this with Sieve scripts, administrators have an array of tools at their disposal.

For instance, scripts can be configured to reject certain recipients based on specific criteria, such as the recipient address or domain. This can be useful in managing email traffic and preventing unwanted emails. [Address rewriting](/docs/smtp/rewrite/address#sieve) is another option, allowing for automatic correction of common misspellings or redirecting emails from one address to another. Additionally, more advanced functionality like greylisting, a common method of defending against spam, can be implemented. This involves temporarily rejecting emails from unknown sources and asking the sender to try again later - a test most spam sources fail. 

The `session.rcpt.script` attribute specifies the Sieve script to execute during the RCPT TO stage. For more information, please refer to the [Sieve scripts](/docs/smtp/filter/sieve) documentation.

For example, the following script implements greylisting using an SQL database:

```toml
[session.rcpt]
script = [ { if = "authenticated-as", eq = "", then = "greylist" }, 
           { else = false } ]

[sieve.scripts]
greylist = '''
    require ["variables", "vnd.stalwart.execute", "envelope", "reject"];

    set "triplet" "${env.remote_ip}.${envelope.from}.${envelope.to}";

    if not execute :query "SELECT 1 FROM greylist WHERE addr=? LIMIT 1" ["${triplet}"] {
        execute :query "INSERT INTO greylist (addr) VALUES (?)" ["${triplet}"];
        reject "422 4.2.2 Greylisted, please try again in a few moments.";
    }
'''
```

## Limits

The following attributes under the `session.rcpt` key, control the maximum number of recipients allowed per message, as well as how to handle invalid recipients.

- `max-recipients`: Specifies the maximum number of recipients allowed per message.
- `rcpt.errors.total`: Specifies the maximum number of invalid recipients allowed before a session is disconnected.
- `rcpt.errors.wait`: Specifies the amount of time to wait when an invalid recipient is received.

Example:

```toml
[session.rcpt]
max-recipients = 25

[session.rcpt.errors]
total = 5
wait = "5s"
```

