---
sidebar_position: 3
title: "Functions"
description: "The functions available in expressions: text, array, email, directory, in-memory store, SQL, DNS and miscellaneous functions, and the special forms for regular expressions, system values and metrics."
---

Operators can compare and join values, but many conditions need more: testing whether a recipient domain is hosted on the server, extracting the domain of an address, or querying a DNS blocklist. Functions provide these operations. A function performs an operation on its arguments and produces a value, which the surrounding expression can combine with operators or pass to other functions.

A function is called by its name, followed by its arguments in parentheses:

```text
function_name(argument1, argument2, ...)
```

An argument can be a literal value, a [context variable](/docs/configuration/variables), a capture group of a regular expression, or the result of another function call.

Most functions operate only on their arguments. Some reach out to a directory, an in-memory store, a SQL database or the DNS resolver instead. Both kinds share the same call syntax, but the second kind can fail at runtime, as described in [Validation and evaluation](/docs/configuration/expressions/#validation-and-evaluation).

Three forms look like functions, but are handled when the expression is compiled: regular expressions, system values and server metrics. Because the compiler must read their first argument, that argument must be a string literal. They are documented first, as [special forms](#special-forms).

Each entry below gives the function's signature, what it returns, and an example.

## Special forms

### `matches`

`matches(regex, value)`

Evaluates a regular expression against a value, and returns `true` on a match. The regular expression must be a string literal, because it is compiled when the expression is parsed. On a successful match, the capture groups are available in the `then` value as the [positional variables](/docs/configuration/expressions/values#positional-variables) `$0` (the full match), `$1`, `$2` and so on.

For example, `matches('^([^@]+)@(.+)$', rcpt)` matches any syntactically valid recipient and makes the local part available as `$1` and the domain as `$2`.

#### Escaping backslashes

The number of backslashes in a pattern depends on where the expression is written.

The expression parser passes the regular expression to the regex engine unchanged, so a metacharacter is escaped with a single backslash. In `matches('^([^.]+)\.([^.]+)$', rcpt)`, the `\.` matches a literal period, while the unescaped `.` inside the character classes keeps its regex meaning. This is the form to enter in an expression field in the WebUI, which stores the text exactly as typed.

When the same expression travels inside a JSON document, such as an NDJSON bundle applied with [`stalwart-cli apply`](/docs/management/cli/apply) or a `Domain/set` call, the backslash is also subject to JSON string escaping. It is therefore written twice:

```json
{"if": "matches('^([^.]+)\\.([^.]+)$', rcpt)", "then": "$2"}
```

The JSON parser converts `\\` back to a single backslash before the expression is compiled, so both forms produce the same regular expression. The JSON examples throughout this documentation show the doubled form for that reason.

The WebUI, however, applies no unescaping. A doubled form entered there is read as an escaped backslash followed by the any-character metacharacter, and the pattern fails to match the intended addresses.

### `system`

`system(name)`

Returns a server-wide value. The name must be a string literal, and one of the following:

| Name | Value |
|---|---|
| `domain` | The default domain, configured by [`defaultDomainId`](/docs/ref/object/system-settings#defaultdomainid) in [SystemSettings](/docs/ref/object/system-settings). |
| `report_domain` | The domain that reports and delivery status notifications are sent from, configured by [`outboundReportDomain`](/docs/ref/object/report-settings#outboundreportdomain) in [ReportSettings](/docs/ref/object/report-settings). When that field is empty, it is the default domain. |
| `hostname` | The default hostname of the deployment, configured by [`defaultHostname`](/docs/ref/object/system-settings#defaulthostname) in SystemSettings. |
| `node_id` | The numeric [node identifier](/docs/cluster/configuration/node-id) of the current node in a cluster. |
| `node_hostname` | The operating system host name of the current node, which the [`STALWART_HOSTNAME`](/docs/configuration/environment-variables) environment variable overrides. |
| `node_role` | The role assigned to the current node through the [`STALWART_ROLE`](/docs/configuration/environment-variables) environment variable. |

For example, `system('hostname')` returns the default hostname used in SMTP greetings.

### `metric`

`metric(name)`

Returns the current value of a server metric. The name must be a string literal naming a metric the server recognises.

For example, `metric('queue.count') > 10000` is true when the outbound queue holds more than ten thousand messages.

## Text functions

Text functions inspect and transform strings.

### `trim`

`trim(string)`

Removes whitespace from both ends of a string. For example, `trim('  user@example.org  ')` returns `'user@example.org'`.

### `trim_start`

`trim_start(string)`

Removes whitespace from the beginning of a string. For example, `trim_start('   Subject')` returns `'Subject'`.

### `trim_end`

`trim_end(string)`

Removes whitespace from the end of a string. For example, `trim_end('Subject\r\n')` returns `'Subject'`.

### `len`

`len(string_or_array)`

Returns the length of a string in bytes, or of an array in elements. For example, `len(rcpt) > 254` flags a recipient that exceeds the SMTP address length limit.

### `to_lowercase`

`to_lowercase(string)`

Converts a string to lowercase. For example, `to_lowercase(sender_domain)` normalises a domain before it is compared with a list.

### `to_uppercase`

`to_uppercase(string)`

Converts a string to uppercase. For example, `to_uppercase(country)` returns `'US'` when `country` is `'us'`.

### `is_lowercase`

`is_lowercase(string)`

Returns `true` when every alphabetic character in the string is lowercase. For example, `is_lowercase('example.org')` returns `true`.

### `is_uppercase`

`is_uppercase(string)`

Returns `true` when every alphabetic character in the string is uppercase. For example, `is_uppercase('HELO')` returns `true`.

### `has_digits`

`has_digits(string)`

Returns `true` when the string contains at least one ASCII digit. For example, `has_digits(authenticated_as)` detects account names that contain digits.

### `count_chars`

`count_chars(string)`

Returns the number of Unicode characters in a string, which differs from `len` for text outside ASCII. For example, `count_chars('héllo')` returns `5`.

### `count_spaces`

`count_spaces(string)`

Returns the number of whitespace characters in a string. For example, `count_spaces('one two three')` returns `2`.

### `count_uppercase`

`count_uppercase(string)`

Returns the number of uppercase alphabetic characters in a string. For example, `count_uppercase('User@Example.ORG')` returns `5`.

### `count_lowercase`

`count_lowercase(string)`

Returns the number of lowercase alphabetic characters in a string. For example, `count_lowercase('User@Example.ORG')` returns `9`.

### `contains`

`contains(string_or_array, item)`

Returns `true` when the first argument contains the second. A string is searched for the substring, while an array is searched for an element equal to the item. For example, `contains(rcpt, '+')` detects recipients that use sub-addressing.

### `contains_ignore_case`

`contains_ignore_case(string_or_array, item)`

Works like `contains`, but compares without regard to case. For example, `contains_ignore_case(sender_domain, 'example')` matches `EXAMPLE.org`.

### `eq_ignore_case`

`eq_ignore_case(string, string)`

Returns `true` when two strings are equal, ignoring ASCII case. For example, `eq_ignore_case(listener, 'SMTP')` is true for both `'smtp'` and `'SMTP'`.

### `starts_with`

`starts_with(string, prefix)`

Returns `true` when the string starts with the prefix. For example, `starts_with(authenticated_as, 'svc-')` matches service accounts whose names begin with `svc-`.

### `ends_with`

`ends_with(string, suffix)`

Returns `true` when the string ends with the suffix. For example, `ends_with(sender_domain, '.example.org')` matches every subdomain of `example.org`.

### `strip_prefix`

`strip_prefix(string, prefix)`

Removes the prefix from the start of the string, and returns the empty string when the prefix is not present. For example, `strip_prefix(authenticated_as, 'svc-')` returns `'backup'` for `'svc-backup'`.

### `strip_suffix`

`strip_suffix(string, suffix)`

Removes the suffix from the end of the string, and returns the empty string when the suffix is not present. For example, `strip_suffix(rcpt_domain, '.example.org')` returns the customer tenant name from a domain such as `acme.example.org`.

### `substring`

`substring(string, start, count)`

Extracts part of a string by character position, starting at the zero-based index `start` and taking `count` characters. For example, `substring(remote_ip, 0, 3)` returns `'192'` for the address `'192.0.2.1'`.

### `lines`

`lines(string)`

Splits a string into an array at line breaks. For example, `lines(key_get('', 'blocklist'))` returns the entries of a blocklist stored, one entry per line, under the key `blocklist`.

### `split`

`split(string, delimiter)`

Splits a string at every occurrence of the delimiter and returns the parts as an array. For example, `split('a,b,c', ',')` returns `['a', 'b', 'c']`.

### `rsplit`

`rsplit(string, delimiter)`

Works like `split`, but orders the resulting array from right to left. For example, `rsplit('mx1.example.org', '.')` returns `['org', 'example', 'mx1']`.

### `split_once`

`split_once(string, delimiter)`

Splits a string at the first occurrence of the delimiter and returns the two parts as an array, or the empty string when the delimiter is not found. For example, `split_once(rcpt, '@')` returns `['user', 'example.org']` for the recipient `'user@example.org'`.

### `rsplit_once`

`rsplit_once(string, delimiter)`

Splits a string at the last occurrence of the delimiter and returns the two parts as an array, or the empty string when the delimiter is not found. For example, `rsplit_once('user+tag@example.org', '@')` returns `['user+tag', 'example.org']`.

### `split_n`

`split_n(string, delimiter, max_splits)`

Splits a string at most `max_splits` times, so the final element holds the rest of the input, including any further delimiters. For example, `split_n('a,b,c,d', ',', 2)` returns `['a', 'b', 'c,d']`.

### `split_words`

`split_words(string)`

Splits a string at whitespace and returns only the tokens made entirely of alphanumeric characters. For example, `split_words('Hello, world! 42')` returns `['42']`, because the other two tokens contain punctuation and are discarded.

### `hash`

`hash(string, algorithm)`

Computes a hash of the string and returns it as a lowercase hexadecimal string. The algorithm is `md5`, `sha1`, `sha256` or `sha512`, and any other name produces the empty string. For example, `hash(sender, 'sha256')` produces a stable identifier for the sender address, which is useful for bucketing and rate limiting.

## Array functions

Array functions work on arrays, such as the `recipients` variable or the result of a split.

### `count`

`count(array)`

Returns the number of elements in an array. A value that is not an array counts as `1` when it is not empty and `0` otherwise. For example, `count(recipients) > 100` flags messages addressed to more than a hundred recipients.

### `sort`

`sort(array, ascending)`

Returns a sorted copy of the array, in ascending order when the second argument is `true` and in descending order when it is `false`. For example, `sort(['z', 'a', 'b'], true)` returns `['a', 'b', 'z']`, and the same call with `false` returns `['z', 'b', 'a']`.

### `dedup`

`dedup(array)`

Returns a copy of the array with duplicate elements removed, keeping the original order. For example, `dedup(['a', 'b', 'a'])` returns `['a', 'b']`.

### `winnow`

`winnow(array)`

Returns a copy of the array with empty elements removed. For example, `winnow(['a', '', 'b', ''])` returns `['a', 'b']`.

### `is_intersect`

`is_intersect(array, array)`

Returns `true` when the two arrays share at least one element. When one argument is a single value, the function checks whether the other array contains it. For example, `is_intersect(recipients, ['abuse@example.org', 'postmaster@example.org'])` flags messages that include a role address.

## Email functions

Email functions check and take apart email addresses.

### `is_email`

`is_email(string)`

Returns `true` when the string is a syntactically valid email address, which requires exactly one unquoted `@`, at least one character in the local part and at least one dot-separated domain label. For example, `is_email(rcpt)` can reject malformed addresses early.

### `email_part`

`email_part(email, part)`

Extracts the local part or the domain of an email address. The part must be the literal string `'local'` or `'domain'`, and any other value returns the empty string. For example, `email_part(sender, 'domain')` returns `'example.org'` when `sender` is `'alice@example.org'`.

## Directory functions

Directory functions ask whether a domain or an address is one that the server serves. They look the argument up in the default directory.

### `is_local_domain`

`is_local_domain(domain)`

Returns `true` when the domain is registered in the directory. The argument is canonicalised before the lookup, so a name written in any case or in Unicode form is found. For example, `is_local_domain(rcpt_domain)` is true for a recipient in a domain the server hosts.

### `is_local_address`

`is_local_address(email)`

Returns `true` when the email address resolves to a local account or alias. The argument is canonicalised before the lookup, so an address matches whatever case it was written in. For example, `is_local_address(rcpt)` distinguishes deliverable recipients from relay recipients.

## In-memory store functions

In-memory store functions read and write keys, which lets an expression keep state, such as a counter, from one evaluation to the next. The first argument of these functions is a namespace. It is the name of a [lookup list](/docs/configuration/expressions/lookup/) or a [store lookup](/docs/configuration/expressions/lookup/#store-lookups), or an empty string (`''`) for the [in-memory store](/docs/storage/in-memory) configured on the server. Because lookup lists are read-only, `key_set` and `key_incr` write only to the in-memory store or to a store lookup.

### `key_get`

`key_get(namespace, key)`

Returns the value stored under a key, or the empty string when the key does not exist. For example, `key_get('', 'greeting')` returns the value of the `greeting` key from the in-memory store.

### `key_exists`

`key_exists(namespace, key)`

Returns `true` when the key exists. For example, `key_exists('blocklist', remote_ip)` is true when the address is present in the lookup list with the namespace `blocklist`.

### `key_set`

`key_set(namespace, key, value)`

Stores the value under the key, creating the key when necessary, and returns `true` on success. For example, `key_set('', 'last_sender_' + authenticated_as, sender)` records the most recent envelope sender of each authenticated account.

### `key_incr`

`key_incr(namespace, key, increment)`

Adds the increment to the integer counter stored under a key, creating the counter when it does not exist, and returns the new value. `key_get` returns the current value of a counter written this way. For example, `key_incr('', 'rcpt-' + authenticated_as, 1) > 1000` increments a per-account recipient counter and is true once it exceeds a thousand.

## SQL store functions

The SQL store function lets an expression consult an external database, for example to look up a value that another system maintains.

### `sql_query`

`sql_query(namespace, query, parameters)`

Runs a SQL statement against the database of a [store lookup](/docs/configuration/expressions/lookup/#store-lookups), named by its namespace, and binds the parameters to the placeholders of the query, in order. The query is passed to the database driver verbatim. It must therefore use the native placeholder syntax of the database: `?` for SQLite and MySQL, and `$1`, `$2` and so on for PostgreSQL.

The shape of the result depends on the statement and on what it returns:

| Statement | Result |
|---|---|
| `SELECT` returning one row with one column | The value of that column. |
| `SELECT` returning one row with several columns | The row, as an array. |
| `SELECT` returning several rows | An array of rows, each an array. |
| Any statement other than `SELECT` | The number of affected rows. |

For example, `sql_query('crm', 'SELECT quota FROM users WHERE address = ?', [rcpt])` retrieves the recipient's quota from the SQL store lookup with the namespace `crm`. On PostgreSQL, the placeholder would be `$1`.

## DNS functions

The DNS function queries DNS from within an expression, for example to check a DNS-based list.

### `dns_query`

`dns_query(name, record_type)`

Performs a DNS query for the name and record type, and returns the result. The record type is one of the following:

| Record type | Query |
|---|---|
| `ipv4` | IPv4 addresses. |
| `ipv6` | IPv6 addresses. |
| `ip` | IPv4 addresses, falling back to IPv6. |
| `mx` | Mail exchangers. |
| `txt` | Text records. |
| `ptr` | Reverse DNS names. The name must parse as an IP address. |

Address and `mx` queries return arrays, while a `txt` query returns a single concatenated string.

For example, `contains(dns_query(ip_reverse_name(remote_ip) + '.zen.spamhaus.org', 'ipv4'), '127.0.0.2')` tests whether `remote_ip` is listed in the Spamhaus DNSBL. `ip_reverse_name` produces the reversed form the DNSBL protocol requires, and the two strings are concatenated into the query name.

## Miscellaneous functions

The remaining functions test values, work with IP addresses and choose between values.

### `is_empty`

`is_empty(value)`

Returns `true` when the value is an empty string or an empty array. Numbers and constant values are never empty. For example, `is_empty(authenticated_as)` is true for unauthenticated sessions.

### `is_number`

`is_number(value)`

Returns `true` when the value is an integer or a floating-point number. The check is on the type of the value, so a string made of digits returns `false`. For example, `is_number(25)` returns `true`, and `is_number('25')` returns `false`.

### `bit_and`

`bit_and(integer, integer)`

Returns the bitwise AND of two integers, or `0` when an argument is not an integer. For example, `bit_and(6, 4)` returns `4`, and `bit_and(6, 1)` returns `0`.

### `is_ip_addr`

`is_ip_addr(string)`

Returns `true` when the string parses as an IPv4 or an IPv6 address. For example, `is_ip_addr(key_get('', 'next_hop'))` validates a hop read from the in-memory store.

### `is_ipv4_addr`

`is_ipv4_addr(string)`

Returns `true` when the string parses as an IPv4 address. For example, `is_ipv4_addr(remote_ip)` limits a rule to IPv4 clients.

### `is_ipv6_addr`

`is_ipv6_addr(string)`

Returns `true` when the string parses as an IPv6 address. For example, `is_ipv6_addr(remote_ip)` limits a rule to IPv6 clients.

### `ip_reverse_name`

`ip_reverse_name(ip)`

Returns the reverse DNS form of an IP address, which is the form DNSBL queries use. The octets of an IPv4 address are reversed, while an IPv6 address is written as its nibbles in reverse order, separated by dots. For example, `ip_reverse_name(remote_ip) + '.zen.spamhaus.org'` builds the query name that `dns_query` sends to the Spamhaus DNSBL.

### `is_ip_in_cidr`

`is_ip_in_cidr(ip, network)`

Returns `true` when the first argument is an IP address inside the network given by the second. The network is a CIDR block, such as `10.0.0.0/8` or `2001:db8::/32`, or a single IP address, in which case the function checks for an exact match. IPv4-mapped IPv6 addresses such as `::ffff:1.2.3.4` match IPv4 networks, and IPv4 addresses match the corresponding mapped IPv6 networks. Both arguments must parse cleanly, and malformed values return `false`.

For example, `is_ip_in_cidr(remote_ip, '10.0.0.0/8') || is_ip_in_cidr(remote_ip, '172.16.0.0/12') || is_ip_in_cidr(remote_ip, '192.168.0.0/16')` is true for connections from the private ranges of RFC 1918.

### `if_then`

`if_then(condition, when_true, when_false)`

Returns the second argument when the condition is true, and the third otherwise. For example, `if_then(is_tls, 'tls', 'plain') + '-' + listener` builds a channel tag such as `'tls-submission'` or `'plain-smtp'`.
