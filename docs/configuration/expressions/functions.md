---
sidebar_position: 3
---

# Functions

Functions are integral components of expressions in Stalwart Mail Server. They perform specific operations on one or more operands (parameters) and are used to construct dynamic and powerful expressions for evaluating conditions and generating dynamic values. Functions can vary in the number of parameters they require, from zero to multiple, and each has a distinct purpose in processing and decision-making logic.

A function in an expression typically follows this syntax:

```
function_name(parameter1, parameter2, ...)
```

Where function_name is the name of the function being called, and `parameter1`, `parameter2`, etc., are the inputs to the function. Functions can perform a variety of operations, from simple string comparisons to more complex data manipulations.

## Supported Functions

The following functions are available for use in expressions in Stalwart Mail Server:

### Directory Functions

#### `is_local_domain`
- **Description**: Determines if a given domain name is recognized as a local domain within a specified directory or the default directory if none is specified.
- **Arguments**: 2 (Directory ID, Domain Name)
- **Example**: `is_local_domain("", "example.org")` would check if `example.org` is a local domain using the default directory and return `true` if it is.

#### `is_local_address`
- **Description**: Checks if a specific email address is associated with a local user in a specified directory or the default directory if none is specified.
- **Arguments**: 2 (Directory ID, Email Address)
- **Example**: `is_local_address("", "user@example.org")` would verify if `user@example.org` is a local address using the default directory and return `true` if it is.

### In-Memory Store Functions

#### `sql_query`
- **Description**: Executes an SQL query against a specified in-memory store and returns the result.
- **Arguments**: 3 (In-Memory Store ID, Query, Arguments)
- **Example**: `sql_query("", "SELECT disk_usage FROM quotas WHERE user = ? AND domain = ?", [authenticated_as, rcpt_domain])` would retrieve the value of the `disk_usage` column from the SQL database.

#### `key_get`
- **Description**: Retrieves the value associated with a given key from a specified in-memory store or the default in-memory store if none is specified.
- **Arguments**: 2 (In-Memory Store ID, Key Name)
- **Example**: `key_get("", "config_param")` would retrieve the value of `config_param` from the default in-memory store.

#### `key_exists`
- **Description**: Checks if a given key exists within a specified in-memory store or the default in-memory store if none is specified.
- **Arguments**: 2 (In-Memory Store ID, Key Name)
- **Example**: `key_exists("", "config_param")` would check for the existence of `config_param` in the default in-memory store and return `true` if it exists.

#### `key_set`
- **Description**: Sets the value of a specified key in a in-memory store, creating the key if it does not exist.
- **Arguments**: 3 (In-Memory Store ID, Key Name, Value)
- **Example**: `key_set("", "config_param", "new_value")` would set the value of `config_param` to `new_value` in the default in-memory store.

#### `counter_get`
- **Description**: Retrieves the current value of a counter from a specified in-memory store or the default in-memory store if none is specified.
- **Arguments**: 2 (In-Memory Store ID, Counter Name)
- **Example**: `counter_get("", "email_count")` would retrieve the current value of the `email_count` counter from the default in-memory store.

#### `counter_incr`
- **Description**: Increments the value of a specified counter in a in-memory store by a specified amount, creating the counter if it does not exist.
- **Arguments**: 3 (In-Memory Store ID, Counter Name, Increment Value)
- **Example**: `counter_incr("", "email_count", 1)` would increment the value of the `email_count` counter by 1 in the default in-memory store.

### DNS Functions

#### `dns_query`
- **Description**: Performs a DNS query for the specified record name and type, returning the content of the DNS record if found. This function can query for various DNS record types, such as 'A' (address record) or 'MX' (mail exchange record).
- **Arguments**: 2 (Record Name, Record Type)
- **Example**: `dns_query("example.org", "mx")` would perform an MX record lookup for `example.org` and return the record's contents.

These functions expand the capabilities of Stalwart Mail Server, allowing for dynamic interactions with local directories, key-value stores, and DNS records. By utilizing these functions, administrators can implement sophisticated logic for email routing, filtering, and verification based on domain, address validity, configuration parameters, and DNS lookup results.

### Text Functions

#### `trim`
- **Description**: Removes whitespace from both ends of a string.
- **Arguments**: 1 (String)
- **Example**: `trim(" hello ")` would return `"hello"`.

#### `trim_end`
- **Description**: Removes whitespace from the end of a string.
- **Arguments**: 1 (String)
- **Example**: `trim_end("hello ")` would return `"hello"`.

#### `trim_start`
- **Description**: Removes whitespace from the start of a string.
- **Arguments**: 1 (String)
- **Example**: `trim_start(" hello")` would return `"hello"`.

#### `len`
- **Description**: Returns the length of a string.
- **Arguments**: 1 (String)
- **Example**: `len("hello")` would return `5`.

#### `to_lowercase`
- **Description**: Converts a string to lowercase.
- **Arguments**: 1 (String)
- **Example**: `to_lowercase("HELLO")` would return `"hello"`.

#### `to_uppercase`
- **Description**: Converts a string to uppercase.
- **Arguments**: 1 (String)
- **Example**: `to_uppercase("hello")` would return `"HELLO"`.

#### `is_uppercase`
- **Description**: Checks if a string is entirely in uppercase.
- **Arguments**: 1 (String)
- **Example**: `is_uppercase("HELLO")` would return `true`.

#### `is_lowercase`
- **Description**: Checks if a string is entirely in lowercase.
- **Arguments**: 1 (String)
- **Example**: `is_lowercase("hello")` would return `true`.

#### `has_digits`
- **Description**: Determines if a string contains any numeric digits.
- **Arguments**: 1 (String)
- **Example**: `has_digits("hello2")` would return `true`.

#### `count_spaces`
- **Description**: Counts the number of spaces in a string.
- **Arguments**: 1 (String)
- **Example**: `count_spaces("hello world")` would return `1`.

#### `count_uppercase`
- **Description**: Counts the number of uppercase letters in a string.
- **Arguments**: 1 (String)
- **Example**: `count_uppercase("Hello World")` would return `2`.

#### `count_lowercase`
- **Description**: Counts the number of lowercase letters in a string.
- **Arguments**: 1 (String)
- **Example**: `count_lowercase("Hello World")` would return `8`.

#### `count_chars`
- **Description**: Counts the number of characters in a string.
- **Arguments**: 1 (String)
- **Example**: `count_chars("hi there")` would return `7`.

#### `contains`
- **Description**: Checks if a string contains a specified substring.
- **Arguments**: 2 (String, Substring)
- **Example**: `contains("Hello World", "World")` would return `true`.

#### `contains_ignore_case`
- **Description**: Checks if a string contains a specified substring, ignoring case.
- **Arguments**: 2 (String, Substring)
- **Example**: `contains_ignore_case("Hello World", "world")` would return `true`.

#### `eq_ignore_case`
- **Description**: Checks if two strings are equal, ignoring case differences.
- **Arguments**: 2 (String1, String2)
- **Example**: `eq_ignore_case("hello", "HELLO")` would return `true`.

#### `starts_with`
- **Description**: Checks if a string starts with a specified substring.
- **Arguments**: 2 (String, Substring)
- **Example**: `starts_with("Hello World", "Hello")` would return `true`.

#### `ends_with`
- **Description**: Checks if a string ends with a specified substring.
- **Arguments**: 2 (String, Substring)
- **Example**: `ends_with("Hello World", "World")` would return `true`.

### Array Functions

#### `count`
- **Description**: Returns the number of elements in an array.
- **Arguments**: 1 (Array)
- **Example**: `count(["email1@example.com", "email2@example.com"])` would return `2`.

#### `sort`
- **Description**: Sorts an array according to the specified order (ascending or descending).
- **Arguments**: 2 (Array, IsAscendent (Bool))
- **Example**: `sort(["z", "a", "b"], true)` would return `["a", "b", "z"]`.

#### `dedup`
- **Description**: Removes duplicate elements from an array.
- **Arguments**: 1 (Array)
- **Example**: `dedup(["a", "b", "a"])` would return `["a", "b"]`.

#### `winnow`
- **Description**: Filters empty elements in an array.
- **Arguments**: 1 (Array)
- **Example**: `winnow(["a", "", "b", ""])` would return `["a", "b"]`.

#### `is_intersect`
- **Description**: Checks if two arrays have any elements in common.
- **Arguments**: 2 (Array1, Array2)
- **Example**: `is_intersect(["a", "b"], ["b", "c"])` would return `true`.

### Email Functions

#### `is_email`
- **Description**: Determines if the given string is a valid email address.
- **Arguments**: 1 (String)
- **Example**: `is_email("user@example.com")` would return `true`.

#### `email_part`
- **Description**: Extracts a specified part of an email address (e.g., local part, domain).
- **Arguments**: 2 (Email, Part)
- **Example**: `email_part("user@example.com", "domain")` would return `"example.com"`.

### Miscellaneous Functions

#### `is_empty`
- **Description**: Checks if the given value is empty.
- **Arguments**: 1 (Value)
- **Example**: `is_empty("")` would return `true`.

#### `is_number`
- **Description**: Determines if the given string represents a number.
- **Arguments**: 1 (String)
- **Example**: `is_number("123")` would return `true`.

#### `is_ip_addr`
- **Description**: Checks if the given string is a valid IP address (IPv4 or IPv6).
- **Arguments**: 1 (String)
- **Example**: `is_ip_addr("192.0.2.1")` would return `true`.

#### `is_ipv4_addr`
- **Description**: Determines if the given string is a valid IPv4 address.
- **Arguments**: 1 (String)
- **Example**: `is_ipv4_addr("192.0.2.1")` would return `true`.

#### `is_ipv6_addr`
- **Description**: Checks if the given string is a valid IPv6 address.
- **Arguments**: 1 (String)
- **Example**: `is_ipv6_addr("2001:db8::")` would return `true`.

#### `ip_reverse_name`
- **Description**: Generates the reverse DNS notation for an IP address.
- **Arguments**: 1 (IP Address)
- **Example**: `ip_reverse_name("192.0.2.1")` would return `"1.2.0.192"`.

