---
sidebar_position: 7
---

# DATA stage

The `DATA` command is used to initiate the data transfer phase of the email delivery process. Once the sender of the email has successfully completed the `MAIL FROM` and `RCPT TO` commands, they can issue the `DATA` (or `BDAT` when chunking is used) command to begin transmitting the email message. Once the entire email message has been transmitted, the SMTP server will respond with a status code indicating whether the message was accepted or rejected for delivery.

## Filtering

Once a message has been submitted either with the `DATA` or `BDAT` command, it is possible to run [sieve scripts](/docs/sieve/overview), [milter filters](/docs/smtp/filter/milter) or [pipes](/docs/smtp/filter/pipe) that accept, reject or modify the message's contents. When multiple filter types are configured, Stalwart SMTP will execute first the Milter filters, then the Sieve scripts and finally the Pipes.

### Sieve

The `session.data.script` attribute in the configuration file specifies the name of the [Sieve script](/docs/sieve/overview) to be executed. For example:

```toml
[session.data]
script = "'data'"

[sieve.trusted.scripts]
data = '''
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

Milter filters are defined under the `session.data.milter.<id>` section and each configured Milter filter can inspect and potentially modify the message, adding, changing, or removing headers, altering the body, or even rejecting the message outright. For details on how to configure Milter filters, see the [Milter](/docs/smtp/filter/milter) section.

### Pipes

Stalwart SMTP supports filtering messages using external executable files, referred to as "pipes". Pipes operate by receiving the email message through standard input (`stdin`), processing or modifying it as required, and then returning the adjusted message via standard output (`stdout`). For details on how to configure pipes, see the [Pipes](/docs/smtp/filter/pipe) section.

## Message Limits

Stalwart SMTP server can be configured to limit messages based on their size and total number. Additionally, it supports setting a maximum limit on the number of `Received` headers, which helps to prevent message loops. These configuration attributes can be found under the `session.data.limits` key in the configuration file and include the following:

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
```
