---
sidebar_position: 3
---

# Untrusted Interpreter

The untrusted interpreter is used to execute Sieve scripts that are created by end-users. Stalwart Mail Server includes support for [JMAP for Sieve Scripts](https://www.ietf.org/archive/id/draft-ietf-jmap-sieve-12.html) as well as [ManageSieve](https://datatracker.ietf.org/doc/html/rfc5804), which allows users to upload and manage their Sieve scripts.

## Limits

Sieve scripts are safely executed in a controlled sandbox that ensures that scripts do not exceed or abuse their allocated system resources. Different type of limits can be enforced on Sieve scripts to prevent users from abusing the system resources. The following parameters can be configured under the `sieve.untrusted.limits` section:

- ``max-scripts``: Maximum number of Sieve scripts that a user can have. Defaults to ``256``.
- ``script-size``: Maximum size of a Sieve script in bytes. Defaults to ``1048576`` (1MB).
- ``string-length``: Maximum size of a constant string. Defaults to ``4096``.
- ``nested-blocks``: Maximum number of nested ``if`` / ``elsif`` / ``else`` blocks. Defaults to ``15``.
- ``nested-tests``: Maximum number of nested tests. Defaults to ``15``.
- ``nested-foreverypart``: Maximum number of nested ``foreverypart`` loops. Defaults to ``3``.
- ``match-variables``: Maximum number of ``matches`` and ``regex`` variables that can be captured. Defaults to ``30``.
- ``local-variables``: Maximum number of local variables that can be in scope at any given time. Defaults to ``128``.
- ``header-size``: Maximum length of an RFC822 header value. Defaults to ``1024``.
- ``includes``: Maximum number of ``include`` instructions per script. Defaults to ``3``.
- ``nested-includes``: Maximum number of nested ``include``. Defaults to ``3``.
- ``cpu``: Maximum number of instructions that a script can execute (including instructions from ``include`` scripts). Defaults to ``5000``.
- ``variable-name-length``: Maximum length of a variable name. Defaults to ``32``.
- ``variable-size``: Maximum length of a variable, after this limit variable contents are truncated. Defaults to ``4096``.
- ``redirects``: Maximum number of message redirections per execution. Defaults to ``1``.
- ``received-headers``: Maximum number of ``Received`` headers before a message is considered to be in a loop. Defaults to ``10``.
- ``outgoing-messages``: Maximum number of outgoing e-mail messages that can be sent from a script including vacation responses, notifications and redirects. Defaults to ``3``.

Example:
    
```toml
[sieve.untrusted.limits]
name-length = 512
max-scripts = 256
script-size = 102400
string-length = 4096
variable-name-length = 32
variable-size = 4096
nested-blocks = 15
nested-tests = 15
nested-foreverypart = 3
match-variables = 30
local-variables = 128
header-size = 1024
includes = 3
nested-includes = 3
cpu = 5000
redirects = 1
received-headers = 10
outgoing-messages = 3
```

## Extensions

Stalwart JMAP includes support for [all existing Sieve extensions](https://www.iana.org/assignments/sieve-extensions/sieve-extensions.xhtml) which are enabled
by default. However, system administrators might want to disable certain extensions such as *enotify* which allow users to send outgoing emails from
a script, or extensions that allow modifying the contents of a message such as *editheader*, *replace* or *enclose*.

Disabling Sieve extensions can be done by setting the ``sieve.untrusted.disable-capabilities`` with the capabilities to disable, for example:

```toml
[sieve.untrusted]
disable-capabilities = ["editheader", "replace", "enclose", "enotify"]
```

## Notification URIs

The list of allowed notification URIs can be configured under the ``sieve.untrusted.notification-uris`` section. For example:

```toml
[sieve.untrusted]
notification-uris = ["mailto"]
```

## Protected Headers

Protected headers allows system administrators to configure under ``sieve.untrusted.protected-headers`` a list of headers that cannot be deleted or added using the ``editheader`` extension. For example:

```toml
[sieve.untrusted]
protected-headers = ["Original-Subject", "Original-From", "Received", "Auto-Submitted"]
```

## Vacation defaults

Defaults for the vacation extension can be configured under the ``sieve.untrusted.vacation`` section:

- ``default-subject``: Default subject of vacation responses. Defaults to ``Automated reply``.
- ``subject-prefix``: Default subject prefix of vacation responses. Defaults to ``Auto: ``.

For example:

```toml
[sieve.untrusted.vacation]
default-subject = "Automated reply"
subject-prefix = "Auto: "
```

## Expiration defaults

The default expiration time for IDs stored by the ``vacation`` and ``duplicate`` extensions can be configured under the ``sieve.untrusted.default-expiry`` section. For example:

```toml
[sieve.untrusted.default-expiry]
vacation = "30d"
duplicate = "7d"
```
