---
sidebar_position: 2
---

# Trusted Interpreter

The trusted interpreter is specifically for scripts invoked by the SMTP server. These scripts are primarily trusted scripts created by the system administrator.
Stalwart SMTP compiles all defined Sieve scripts when it starts and executes them on demand using the Sieve runtime.

## Configuration

The trusted interpreter is configured with the following parameters which are available under the `sieve.trusted` key:

- `from-name`: Defines the default name to use for the from field in email notifications sent from a Sieve script.
- `from-addr`: Defines the default email address to use for the from field in email notifications sent from a Sieve script.
- `return-path`: Defines the default return path to use in email notifications sent from a Sieve script.
- `sign`: Lists the [DKIM](/docs/smtp/authentication/dkim/overview) signatures to add to email notifications sent from a Sieve script.
- `hostname`: Sets the local hostname to use when generating a `Message-Id` header. If no value is set, the `server.hostname` value is used instead.
- `no-capability-check`: If set to `true`, language extensions can be used without being explicitly declared using the `require` statement.
- `limits.redirects`: Specifies the maximum number of `redirect` commands that a Sieve script can execute.
- `limits.out-messages`: Specifies the maximum number of outgoing email messages that a Sieve script is allowed to send.
- `limits.received-headers`: Specifies the maximum number of `Received` headers that a message can contain.
- `limits.cpu`: Specifies the maximum number of instructions that a Sieve script can execute.
- `limits.nested-includes`: Specifies the maximum number of nested includes that a script can perform.
- `limits.duplicate-expiry`: Specifies the default expiration time for the expiry Sieve test.
- `limits.variable-size`: Specifies the maximum size of a variable in bytes.

Example:

```toml
[sieve]
from-name = "Automated Message"
from-addr = "no-reply@foobar.org"
return-path = ""
hostname = "mx.foobar.org"
sign = ["rsa"]

[sieve.limits]
redirects = 3
out-messages = 5
received-headers = 50
cpu = 10000
nested-includes = 5
duplicate-expiry = "7d"
```

## Scripts

Sieve scripts are specified under the `sieve.trusted.scripts.<name>` key and can be invoked directly from any of the stages of an SMTP transaction or imported from other scripts using the `include` command. In the configuration file, Sieve scripts can be either embedded as text or loaded from external files using a `file://` URL, for example:

```toml
[sieve.trusted.scripts]
script_one = '''
    require ["variables", "extlists", "reject"];

    if string :list "${env.helo_domain}" "list/blocked-domains" {
        reject "551 5.1.1 Your domain '${env.helo_domain}' has been blocklisted.";
    }
'''
script_two = "file:///opt/stalwart-smtp/etc/sieve/my-script.sieve"
```
