---
sidebar_position: 7
---

# DATA stage

The `DATA` command is used to initiate the data transfer phase of the email delivery process. Once the sender of the email has successfully completed the `MAIL FROM` and `RCPT TO` commands, they can issue the `DATA` (or `BDAT` when chunking is used) command to begin transmitting the email message. Once the entire email message has been transmitted, the SMTP server will respond with a status code indicating whether the message was accepted or rejected for delivery.

## Message Filtering

Once a message has been submitted either with the `DATA` or `BDAT` command, it is possible to run [sieve scripts](/docs/sieve/overview), [milter filters](/docs/mta/filter/milter) or [MTA Hools](/docs/mta/filter/mtahooks) that accept, reject or modify the message's contents. When multiple filter types are configured, Stalwart will execute first the Milter filters, then the Sieve scripts and finally the MTA Hooks.

### Sieve

The `session.data.script` attribute in the configuration file specifies the name of the [Sieve script](/docs/sieve/overview) to be executed. For example:

```toml
[session.data]
script = "'data'"

[sieve.trusted.scripts.data]
contents = '''
    require ["envelope", "variables", "replace", "mime", "foreverypart", "editheader", "extracttext"];

    if envelope :domain :is "to" "foobar.net" {
        set "counter" "a";
        foreverypart {
            if header :mime :contenttype "content-type" "text/html" {
                extracttext :upper "text_content";
                replace "${text_content}";
            }
            set :length "part_num" "${counter}";
            addheader :last "X-Part-Number" "${part_num}";
            set "counter" "${counter}a";
        }
    }
'''
```

### Milter

Milter filters are defined under the `session.milter.<id>` section and each configured Milter filter can inspect and potentially modify the message, adding, changing, or removing headers, altering the body, or even rejecting the message outright. For details on how to configure Milter filters, see the [Milter](/docs/mta/filter/milter) section.

### MTA Hooks

MTA Hooks is a modern replacement for the milter protocol, designed to provide enhanced flexibility and ease of use for managing and processing email transactions within Mail Transfer Agents (MTAs). MTA Hooks are defined under the `session.hook.<id>` section and each configured MTA Hook can inspect and potentially modify the message, adding, changing, or removing headers, altering the body, or even rejecting the message outright. For details on how to configure MTA Hooks, see the [MTA Hooks](/docs/mta/filter/mtahooks) section.

## Spam Filtering

Whether to run the [spam filter](/docs/spamfilter/overview) on incoming messages can be controlled using the `session.data.spam-filter` attribute. This setting expects an expression that evaluates to a boolean value. If the expression evaluates to `true`, the spam filter will be executed.

```toml
[session.data]
spam-filter = "listener = 'smtp'"
```

## Message Limits

Stalwart can be configured to limit messages based on their size and total number. Additionally, it supports setting a maximum limit on the number of `Received` headers, which helps to prevent message loops. These configuration attributes can be found under the `session.data.limits` key in the configuration file and include the following:

- `message`: Limits the maximum number of messages that can be submitted per SMTP session.
- `size`: Restricts the maximum size of a message in bytes.
- `received-headers`: Limits the maximum number of `Received` headers that a message can contain.

Example:

```toml
[session.data.limits]
messages = 10
size = 104857600
received-headers = 50
```

## Headers

The following attributes under the `session.data.add-headers` key determine which headers should be added to an incoming message:

- `received`: Add a `Received` header to the message, which includes the client IP address and TLS encryption information.
- `received-spf`: Add an `SPF-Received` header to the message, containing SPF authentication details.
- `auth-results`: Add an `Authentication-Results` header to the message, which includes DMARC, DKIM, SPF, ARC, and iprev authentication results.
- `message-id`: If the message does not already contain a `Message-ID` header, add one with a unique message ID.
- `date`: If the message does not already contain a `Date` header, add one with the current date.
- `return-path`: Add a `Return-Path` header to the message, which contains the address specified in the `MAIL FROM` command.
- `delivered-to`: Add a `Delivered-To` header to the message, which contains the recipient address specified in the `RCPT TO` command. This setting expects a boolean value and does not support expressions.

Example:

```toml
[session.data.add-headers]
received = [ { if = "listener = 'smtp'", then = true }, 
             { else = false } ]
received-spf = [ { if = "listener = 'smtp'", then = true }, 
                 { else = false } ]
auth-results = [ { if = "listener = 'smtp'", then = true }, 
                 { else = false } ]
message-id = [ { if = "listener = 'smtp'", then = false }, 
               { else = true } ]
date = [ { if = "listener = 'smtp'", then = false }, 
         { else = true } ]
return-path = false
delivered-to = true
```
