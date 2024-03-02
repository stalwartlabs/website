---
sidebar_position: 5
---

# Pipes

Stalwart SMTP supports filtering messages using external executable files, referred to as "pipes". Pipes operate by receiving the email message through standard input (`stdin`), processing or modifying it as required, and then returning the adjusted message via standard output (`stdout`). 

It's generally recommended that message filtering using pipes should be employed only when it's not feasible to use a [sieve script](/docs/sieve/overview) or a [Milter filter](/docs/smtp/filter/milter). Both sieve scripts and Milter filters are specifically designed for email filtering and manipulation tasks, and they typically offer a more straightforward and safer approach to achieving common email handling requirements. Nevertheless, the pipe feature offers a flexible backup option for scenarios where more specialized or unconventional processing is required.

## Configuration

Pipes are defined under the `session.data.pipe.<id>` key with the following attributes:

- `command`: This specifies the path to the binary program to be executed.
- `arguments`: This attribute sets the arguments to be passed to the binary program.
- `timeout`: The time to wait for the content filter to complete. If the filter takes longer than the specified time, the program is terminated and the message is delivered without modification.

For example:

```toml
[session.data.pipe."my-filter"]
command = "'/path/to/my-filter'"
arguments = "['-f', '/path/to/my/script.php']"
timeout = "10s"
```

## Example

As mentioned before, it is generally recommended to use sieve scripts or Milter filters for message filtering tasks. However, the following example demonstrates how SpamAssassin could be integrated with Stalwart SMTP using a pipe to the [spamc](https://spamassassin.apache.org/full/3.1.x/doc/spamc.html) program:

```toml
[session.data.pipe."spam-assassin"]
command = "'spamc'"
arguments = "[]"
timeout = "10s"
```
