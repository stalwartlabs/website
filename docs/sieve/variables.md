---
sidebar_position: 3
---

# Variables

Sieve scripts have access to a number of variables that can be used to obtain information about the current SMTP session, the message being processed and the environment in which the script is executed.

## Environment

The following environment variables can be accessed from within a Sieve script executed in the [trusted interpreter](/docs/sieve/interpreter/trusted):

- `env.remote_ip`: The email client's IP address.
- `env.remote_ip.reverse`: The reversed IP address label to be used in DNS lookups.
- `env.helo_domain`: The domain name used in the EHLO/LHLO command.
- `env.authenticated_as`: The account name used for authentication.
- `env.from`: The sender's email address specified in the `From` header.
- `env.spf.result`: The result of the [SPF MAIL FROM](/docs/smtp/authentication/spf) check.
- `env.spf_ehlo.result`: The result of the [SPF EHLO](/docs/smtp/authentication/spf) check.
- `env.dkim`: The result of the [DKIM](/docs/smtp/authentication/dkim/overview) check.
- `env.dkim.domains`: The domains names that have passed DKIM validation.
- `env.arc.result`: The result of the [ARC](/docs/smtp/authentication/arc) check.
- `env.dmarc.result`: The result of the [DMARC](/docs/smtp/authentication/dmarc) check.
- `env.dmarc.policy`: The DMARC policy that was applied.
- `env.iprev.result`: The result of the [reverse IP](/docs/smtp/authentication/iprev) check.
- `env.iprev.ptr`: The host name returned by the reverse IP check.
- `env.tls.version`: The TLS version used for the current session.
- `env.tls.cipher`: The TLS cipher used for the current session.
- `env.stage`: The current stage of the SMTP transaction.
- `env.now`: The current date and time in seconds since the Unix epoch.
- `env.param.body`: The body flag specified in the `MAIL FROM` command. Possible values are `7bit`, `8bitmime` and `binarymime`.
- `env.param.smtputf8`: Set to `true` if the SMTPUTF8 flag was specified in the `MAIL FROM` command.
- `env.param.requiretls`: Set to `true` if the REQUIRETLS flag was specified in the `MAIL FROM` command.

## Envelope

The envelope contents can be accessed using the [envelope test](https://www.rfc-editor.org/rfc/rfc5228.html#page-27) or through variables:

- `envelope.from`: The return path specified in the `MAIL FROM` command.
- `envelope.to`: The recipient address specified in the last `RCPT TO` command.
- `envelope.notify`: The `NOTIFY` extension parameters.
- `envelope.orcpt`: The `ORCPT` value specified with the DSN extension.
- `envelope.ret`: The `RET` value specified with the DSN extension.
- `envelope.envid`: The `ENVID` value specified with the DSN extension.
- `envelope.by_time_absolute`: The specified absolute time in the `DELIVERBY` extension.
- `envelope.by_time_relative`: The specified relative time in the `DELIVERBY` extension.
- `envelope.by_mode`: The mode specified with the `DELIVERBY` extension.
- `envelope.by_trace`: The trace settings specified with the `DELIVERBY` extension.

Please note that user scripts executed within the [untrusted interpreter](/docs/sieve/interpreter/untrusted) only have access to the `From` and `To` parts of the envelope.
