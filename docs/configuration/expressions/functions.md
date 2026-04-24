---
sidebar_position: 3
---

# Functions

Functions perform a specific operation on zero or more arguments and produce a value that the surrounding expression can compose with operators or other functions. The general syntax is:

```
function_name(argument1, argument2, ...)
```

Arguments may be literal values, [context variables](/docs/configuration/variables), regex capture groups, or the result of another function call. Some functions are synchronous and operate purely on their inputs; others are asynchronous and reach out to a directory, an in-memory store, a SQL database, or the DNS resolver. Both kinds share the same call syntax.

A separate group of forms, documented below as [special forms](#special-forms), is recognised directly by the expression parser rather than dispatched through the function table. Regular expressions, system variables, and server metrics fall into this group and have small syntactic restrictions.

## Special forms

### `matches`

Evaluates a regular expression against a value and returns `true` on a match. The first argument must be a string literal; the regex is compiled at parse time. On a successful match, capture groups are exposed to the `then` branch as [positional variables](/docs/configuration/expressions/values#positional-variables) `$0` (full match), `$1`, `$2`, and so on.

- **Arguments**: 2 (Regex literal, Value)
- **Example**: `matches('^([^@]+)@(.+)$', rcpt)` matches any syntactically valid recipient and exposes the local part as `$1` and the domain as `$2`.

### `system`

Returns a system-level identifier. The argument must be a string literal, selected from a fixed set of names:

- `domain`: the default domain, configured by [`defaultDomainId`](/docs/ref/object/system-settings#defaultdomainid) in [SystemSettings](/docs/ref/object/system-settings).
- `hostname`: the default hostname for the deployment, configured by [`defaultHostname`](/docs/ref/object/system-settings#defaulthostname) in [SystemSettings](/docs/ref/object/system-settings).
- `node_id`: the numeric [node identifier](/docs/cluster/configuration/node-id) of the current node in a cluster deployment.
- `node_hostname`: the operating-system hostname of the current node, overridable with the [`STALWART_HOSTNAME`](/docs/configuration/environment-variables) environment variable.
- `node_role`: the role assigned to the current node through the [`STALWART_ROLE`](/docs/configuration/environment-variables) environment variable.

- **Arguments**: 1 (Name literal)
- **Example**: `system('hostname')` returns the default hostname used in SMTP greetings.

### `metric`

Returns the current value of a server metric. The argument must be the string literal name of a metric recognised by the server.

- **Arguments**: 1 (Metric name literal)
- **Example**: `metric('queue-count') > 10000` is true when the outbound queue holds more than ten thousand messages.

## Text functions

### `trim`
- **Description**: Removes whitespace from both ends of a string.
- **Arguments**: 1 (String)
- **Example**: `trim('  user@example.org  ')` returns `'user@example.org'`.

### `trim_start`
- **Description**: Removes whitespace from the beginning of a string.
- **Arguments**: 1 (String)
- **Example**: `trim_start('   Subject')` returns `'Subject'`.

### `trim_end`
- **Description**: Removes whitespace from the end of a string.
- **Arguments**: 1 (String)
- **Example**: `trim_end('Subject\r\n')` returns `'Subject'`.

### `len`
- **Description**: Returns the length, in bytes for strings or in elements for arrays.
- **Arguments**: 1 (String or Array)
- **Example**: `len(rcpt) > 254` flags a recipient that exceeds the SMTP address length limit.

### `to_lowercase`
- **Description**: Converts a string to lowercase.
- **Arguments**: 1 (String)
- **Example**: `to_lowercase(sender_domain)` normalises a domain before comparing it against a list.

### `to_uppercase`
- **Description**: Converts a string to uppercase.
- **Arguments**: 1 (String)
- **Example**: `to_uppercase(country)` returns `'US'` when `country` is `'us'`.

### `is_lowercase`
- **Description**: Returns `true` when every alphabetic character in the string is lowercase.
- **Arguments**: 1 (String)
- **Example**: `is_lowercase('example.org')` returns `true`.

### `is_uppercase`
- **Description**: Returns `true` when every alphabetic character in the string is uppercase.
- **Arguments**: 1 (String)
- **Example**: `is_uppercase('HELO')` returns `true`.

### `has_digits`
- **Description**: Returns `true` when the string contains at least one ASCII digit.
- **Arguments**: 1 (String)
- **Example**: `has_digits(authenticated_as)` detects account names containing digits.

### `count_chars`
- **Description**: Counts the number of Unicode characters in a string.
- **Arguments**: 1 (String)
- **Example**: `count_chars('héllo')` returns `5`.

### `count_spaces`
- **Description**: Counts whitespace characters in a string.
- **Arguments**: 1 (String)
- **Example**: `count_spaces('one two three')` returns `2`.

### `count_uppercase`
- **Description**: Counts alphabetic characters that are uppercase.
- **Arguments**: 1 (String)
- **Example**: `count_uppercase('User@Example.ORG')` returns `5`.

### `count_lowercase`
- **Description**: Counts alphabetic characters that are lowercase.
- **Arguments**: 1 (String)
- **Example**: `count_lowercase('User@Example.ORG')` returns `7`.

### `contains`
- **Description**: Returns `true` when the first argument contains the second. If the first argument is an array, element equality is used instead of substring search.
- **Arguments**: 2 (String or Array, Substring or Element)
- **Example**: `contains(rcpt, '+')` detects recipients that use the subaddress convention.

### `contains_ignore_case`
- **Description**: Like `contains`, but compares case-insensitively.
- **Arguments**: 2 (String or Array, Substring or Element)
- **Example**: `contains_ignore_case(sender_domain, 'example')` matches `EXAMPLE.org`.

### `eq_ignore_case`
- **Description**: Compares two strings for equality, ignoring ASCII case.
- **Arguments**: 2 (String, String)
- **Example**: `eq_ignore_case(listener, 'SMTP')` is true for both `'smtp'` and `'SMTP'`.

### `starts_with`
- **Description**: Returns `true` when the first string starts with the second.
- **Arguments**: 2 (String, Prefix)
- **Example**: `starts_with(authenticated_as, 'svc-')` matches service accounts prefixed with `svc-`.

### `ends_with`
- **Description**: Returns `true` when the first string ends with the second.
- **Arguments**: 2 (String, Suffix)
- **Example**: `ends_with(sender_domain, '.example.org')` matches every subdomain of `example.org`.

### `strip_prefix`
- **Description**: Removes the given prefix from the start of the string. Returns the empty string when the prefix is not present.
- **Arguments**: 2 (String, Prefix)
- **Example**: `strip_prefix(authenticated_as, 'svc-')` yields `'backup'` when called on `'svc-backup'`.

### `strip_suffix`
- **Description**: Removes the given suffix from the end of the string. Returns the empty string when the suffix is not present.
- **Arguments**: 2 (String, Suffix)
- **Example**: `strip_suffix(rcpt_domain, '.example.org')` yields the customer tenant name.

### `substring`
- **Description**: Extracts a substring by character position. The second argument is the zero-based start index; the third is the number of characters to take.
- **Arguments**: 3 (String, Start, Count)
- **Example**: `substring(remote_ip, 0, 3)` returns `'192'` for the IP `'192.0.2.1'`.

### `lines`
- **Description**: Splits a string into an array on newline boundaries.
- **Arguments**: 1 (String)
- **Example**: `lines(key_get('', 'blocklist'))` returns the entries of a newline-delimited blocklist stored under the key `blocklist`.

### `split`
- **Description**: Splits a string on every occurrence of a delimiter and returns the resulting array.
- **Arguments**: 2 (String, Delimiter)
- **Example**: `split('a,b,c', ',')` returns `['a', 'b', 'c']`.

### `rsplit`
- **Description**: Like `split`, but the resulting array is ordered from right to left.
- **Arguments**: 2 (String, Delimiter)
- **Example**: `rsplit('mx1.example.org', '.')` returns `['org', 'example', 'mx1']`.

### `split_once`
- **Description**: Splits a string at the first occurrence of the delimiter and returns the two resulting parts as a two-element array. Returns the empty string when the delimiter is not found.
- **Arguments**: 2 (String, Delimiter)
- **Example**: `split_once(rcpt, '@')` returns `['user', 'example.org']` for the recipient `'user@example.org'`.

### `rsplit_once`
- **Description**: Splits a string at the last occurrence of the delimiter and returns the two resulting parts as a two-element array.
- **Arguments**: 2 (String, Delimiter)
- **Example**: `rsplit_once('user+tag@example.org', '@')` returns `['user+tag', 'example.org']`.

### `split_n`
- **Description**: Splits a string at most `n` times. The final element contains any remaining input, including further delimiters.
- **Arguments**: 3 (String, Delimiter, Max Splits)
- **Example**: `split_n('a,b,c,d', ',', 2)` returns `['a', 'b', 'c,d']`.

### `split_words`
- **Description**: Splits a string on whitespace and returns only the tokens consisting entirely of alphanumeric characters.
- **Arguments**: 1 (String)
- **Example**: `split_words('Hello, world! 42')` returns `['42']`; the punctuated tokens are discarded.

### `hash`
- **Description**: Computes a hash of the input string and returns it as a lowercase hexadecimal string. Supported algorithms are `md5`, `sha1`, `sha256`, and `sha512`. Any other algorithm name produces the empty string.
- **Arguments**: 2 (String, Algorithm)
- **Example**: `hash(sender, 'sha256')` produces a stable identifier for the sender address, useful for bucketing and rate-limiting.

## Array functions

### `count`
- **Description**: Returns the number of elements in an array. For non-array values, returns `1` when the value is non-empty and `0` otherwise.
- **Arguments**: 1 (Array)
- **Example**: `count(recipients) > 100` flags messages addressed to more than a hundred recipients.

### `sort`
- **Description**: Returns a sorted copy of the input array. The second argument is `true` for ascending order and `false` for descending.
- **Arguments**: 2 (Array, Ascending)
- **Example**: `sort(['z', 'a', 'b'], true)` returns `['a', 'b', 'z']`; the same call with `false` returns `['z', 'b', 'a']`.

### `dedup`
- **Description**: Returns a copy of the array with duplicate elements removed, preserving the original order.
- **Arguments**: 1 (Array)
- **Example**: `dedup(['a', 'b', 'a'])` returns `['a', 'b']`.

### `winnow`
- **Description**: Returns a copy of the array with empty elements removed.
- **Arguments**: 1 (Array)
- **Example**: `winnow(['a', '', 'b', ''])` returns `['a', 'b']`.

### `is_intersect`
- **Description**: Returns `true` when the two arrays share at least one element. When one of the arguments is a scalar value, checks whether the value is contained in the other array.
- **Arguments**: 2 (Array, Array)
- **Example**: `is_intersect(recipients, ['abuse@example.org', 'postmaster@example.org'])` flags messages that include a role address.

## Email functions

### `is_email`
- **Description**: Returns `true` when the input string is a syntactically valid email address. The check requires exactly one unquoted `@`, at least one character in the local part, and at least one dot-separated domain label.
- **Arguments**: 1 (String)
- **Example**: `is_email(rcpt)` can be used to reject malformed addresses early in a pipeline.

### `email_part`
- **Description**: Extracts either the local part or the domain of an email address. The second argument must be the literal string `'local'` or `'domain'`; any other value returns the empty string.
- **Arguments**: 2 (Email, Part)
- **Example**: `email_part(sender, 'domain')` returns `'example.org'` when `sender` is `'alice@example.org'`.

## Directory functions

### `is_local_domain`
- **Description**: Returns `true` when the domain is registered in the server's directory. Uses the default directory.
- **Arguments**: 1 (Domain)
- **Example**: `is_local_domain(rcpt_domain)` is the usual test for a recipient that this server is authoritative for.

### `is_local_address`
- **Description**: Returns `true` when the given email address resolves to a local account or alias. Uses the default directory.
- **Arguments**: 1 (Email address)
- **Example**: `is_local_address(rcpt)` distinguishes deliverable recipients from relay recipients.

## In-memory store functions

These functions target an in-memory store identified by its ID. An empty string selects the default in-memory store configured on the server.

### `key_get`
- **Description**: Returns the value associated with a key, or the empty string when the key does not exist.
- **Arguments**: 2 (Store ID, Key)
- **Example**: `key_get('', 'greeting')` fetches the value of the `greeting` key from the default in-memory store.

### `key_exists`
- **Description**: Returns `true` when the key exists.
- **Arguments**: 2 (Store ID, Key)
- **Example**: `key_exists('blocklist', remote_ip)` is true when the IP is present in the `blocklist` in-memory store.

### `key_set`
- **Description**: Stores the given value under the given key, creating the key if necessary. Returns `true` on success.
- **Arguments**: 3 (Store ID, Key, Value)
- **Example**: `key_set('', 'last_sender_' + authenticated_as, sender)` records the most recent envelope sender per authenticated account.

### `counter_get`
- **Description**: Returns the current value of a counter, or `0` when the counter does not exist.
- **Arguments**: 2 (Store ID, Counter Name)
- **Example**: `counter_get('', 'rcpt-' + authenticated_as)` returns the number of recipients seen for this account.

### `counter_incr`
- **Description**: Increments a counter by the given amount, creating it if necessary. Returns the new counter value.
- **Arguments**: 3 (Store ID, Counter Name, Increment)
- **Example**: `counter_incr('', 'rcpt-' + authenticated_as, 1) > 1000` increments a per-account recipient counter and triggers when it exceeds a threshold.

## SQL store functions

### `sql_query`
- **Description**: Runs a SQL statement against a data store of type SQL. The third argument binds parameters to the query's `?` placeholders, in order. A `SELECT` returning exactly one row and one column returns the scalar value; a `SELECT` returning a single row with multiple columns returns that row as an array; multiple rows return an array of arrays. A non-`SELECT` statement returns the number of affected rows.
- **Arguments**: 3 (Store ID, Query, Parameters)
- **Example**: `sql_query('crm', 'SELECT quota FROM users WHERE address = ?', [rcpt])` retrieves the recipient's quota from the `crm` SQL store.

## DNS functions

### `dns_query`
- **Description**: Performs a DNS query for the given name and record type and returns the result. Supported record types are `ipv4`, `ipv6`, `ip` (IPv4 with IPv6 fallback), `mx`, `txt`, and `ptr`. For `ptr`, the first argument must parse as an IP address. Address and `mx` queries return arrays; `txt` returns a single concatenated string.
- **Arguments**: 2 (Name, Record Type)
- **Example**: `contains(dns_query(ip_reverse_name(remote_ip) + '.zen.spamhaus.org', 'ipv4'), '127.0.0.2')` tests whether `remote_ip` is listed in the Spamhaus DNSBL. `ip_reverse_name` produces the reversed form required by the DNSBL protocol, and the two strings are concatenated into the query name.

## Miscellaneous functions

### `is_empty`
- **Description**: Returns `true` when the value is an empty string or an empty array. Numeric and constant values are never considered empty.
- **Arguments**: 1 (Value)
- **Example**: `is_empty(authenticated_as)` is true for unauthenticated sessions.

### `is_number`
- **Description**: Returns `true` when the value is an integer or a float. A numeric string returns `false`; the check is on the runtime type, not the content.
- **Arguments**: 1 (Value)
- **Example**: `is_number(priority)` distinguishes set numeric priorities from unset string values.

### `is_ip_addr`
- **Description**: Returns `true` when the string parses as either an IPv4 or an IPv6 address.
- **Arguments**: 1 (String)
- **Example**: `is_ip_addr(key_get('', 'next_hop'))` validates a hop read from configuration.

### `is_ipv4_addr`
- **Description**: Returns `true` when the string parses as an IPv4 address.
- **Arguments**: 1 (String)
- **Example**: `is_ipv4_addr(remote_ip)` gates a rule that only applies to IPv4 clients.

### `is_ipv6_addr`
- **Description**: Returns `true` when the string parses as an IPv6 address.
- **Arguments**: 1 (String)
- **Example**: `is_ipv6_addr(remote_ip)` gates a rule that only applies to IPv6 clients.

### `ip_reverse_name`
- **Description**: Returns the reverse-DNS form of an IP address, suitable for composing DNSBL lookups. For IPv4 the octets are reversed; for IPv6 each nibble is reversed and separated by dots.
- **Arguments**: 1 (IP Address)
- **Example**: `ip_reverse_name(remote_ip) + '.zen.spamhaus.org'` builds the query name used with `dns_query` to consult the Spamhaus DNSBL.

### `if_then`
- **Description**: Returns the second argument when the first is truthy, otherwise the third.
- **Arguments**: 3 (Condition, When True, When False)
- **Example**: `if_then(is_tls, 'tls', 'plain') + '-' + listener` builds a channel tag such as `'tls-submission'` or `'plain-smtp'`.
