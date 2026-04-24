---
sidebar_position: 8
---

# Reference

Stalwart extends Sieve with a set of built-in functions that can be called from [expressions](/docs/sieve/expressions) inside `eval`, `let`, and `while` instructions. The functions operate on Sieve values (strings, integers, floats, arrays) and on the message being processed: headers, MIME parts, envelope, and environment.

Some functions are available only to the [trusted interpreter](/docs/sieve/interpreter/trusted), which runs scripts installed by the administrator at an SMTP stage. The [untrusted interpreter](/docs/sieve/interpreter/untrusted) runs user-created scripts and exposes a smaller subset, excluding functions that touch external systems (DNS, HTTP, SQL, key-value stores, external programs) or that inspect parts of the message that are not relevant to per-user filtering. Each entry below notes when a function is restricted to trusted scripts.

The `vnd.stalwart.expressions` extension must be declared in a `require` statement before these functions can be used.

## Text functions

### `trim`

Removes whitespace from both ends of a string.

- **Arguments**: 1 (String or Array)
- **Example**: `let "name" "trim(header.subject)"` removes leading and trailing whitespace from the subject line.

### `trim_start`, `trim_end`

Removes whitespace from the start or the end of a string.

- **Arguments**: 1 (String or Array)
- **Example**: `let "clean" "trim_end(header.subject)"`.

### `len`

Returns the length in bytes for strings, or the number of elements for arrays.

- **Arguments**: 1 (String or Array)
- **Example**: `if eval "len(header.subject) > 200" { ... }` detects unusually long subject lines.

### `to_lowercase`, `to_uppercase`

Converts a string to lowercase or uppercase.

- **Arguments**: 1 (String or Array)
- **Example**: `let "domain" "to_lowercase(email_part(envelope.from, 'domain'))"`.

### `is_lowercase`, `is_uppercase`

Returns `true` when every alphabetic character in the string is lowercase or uppercase. Non-alphabetic characters are ignored.

- **Arguments**: 1 (String or Array)
- **Example**: `if eval "is_uppercase(header.subject)" { addflag "$screaming"; }`.

### `is_ascii`

Returns `true` when the value is a pure-ASCII string, integer, or float. For arrays, returns `true` when every string element is ASCII.

- **Arguments**: 1 (String, Number, or Array)
- **Example**: `if eval "!is_ascii(header.subject)" { ... }` fires for a subject containing non-ASCII text.

### `has_digits`

Returns `true` when the string contains at least one ASCII digit.

- **Arguments**: 1 (String or Array)
- **Example**: `if eval "has_digits(envelope.from)" { ... }`.

### `count_chars`

Counts the number of Unicode characters in a string.

- **Arguments**: 1 (String)
- **Example**: `count_chars('héllo')` returns `5`.

### `count_spaces`, `count_uppercase`, `count_lowercase`

Count whitespace, uppercase alphabetic, or lowercase alphabetic characters.

- **Arguments**: 1 (String)
- **Example**: `if eval "count_uppercase(header.subject) > 20" { addflag "$screaming"; }`.

### `contains`

Returns `true` when the first argument contains the second. For arrays, element equality is used instead of substring search.

- **Arguments**: 2 (String or Array, Substring or Element)
- **Example**: `if eval "contains(header.subject, 'INVOICE')" { ... }`.

### `contains_ignore_case`

Like `contains`, but compares case-insensitively.

- **Arguments**: 2 (String or Array, Substring or Element)

### `eq_ignore_case`

Compares two strings for equality, ignoring ASCII case.

- **Arguments**: 2 (String, String)
- **Example**: `if eval "eq_ignore_case(env.helo_domain, 'mail.example.org')" { ... }`.

### `starts_with`, `ends_with`

Returns `true` when the first string starts or ends with the second.

- **Arguments**: 2 (String, Prefix or Suffix)
- **Example**: `if eval "ends_with(email_part(envelope.from, 'domain'), '.example.org')" { ... }`.

### `strip_prefix`, `strip_suffix`

Removes the given prefix or suffix from a string. Returns the empty string when the affix is not present.

- **Arguments**: 2 (String, Affix)
- **Example**: `let "tenant" "strip_suffix(email_part(envelope.to, 'domain'), '.example.org')"`.

### `substring`

Extracts a substring by character position. The second argument is the zero-based start index; the third is the number of characters to take.

- **Arguments**: 3 (String, Start, Count)
- **Example**: `let "prefix" "substring(header.subject, 0, 10)"`.

### `lines`

Splits a string into an array on newline boundaries.

- **Arguments**: 1 (String)

### `split`, `rsplit`

Splits a string on every occurrence of a delimiter. `rsplit` returns the array ordered from right to left.

- **Arguments**: 2 (String, Delimiter)
- **Example**: `let "labels" "rsplit(email_part(envelope.to, 'domain'), '.')"` yields `['org', 'example', 'mx1']` for `mx1.example.org`.

### `split_once`, `rsplit_once`

Splits a string at the first or the last occurrence of the delimiter and returns the two parts as a two-element array. Returns the empty string when the delimiter is not found.

- **Arguments**: 2 (String, Delimiter)

### `split_n`

Splits a string at most `n` times. The final element contains any remaining input, including further occurrences of the delimiter.

- **Arguments**: 3 (String, Delimiter, Max Splits)
- **Example**: `split_n('a,b,c,d', ',', 2)` returns `['a', 'b', 'c,d']`.

### `thread_name`

Returns the thread name of the subject by stripping reply/forward prefixes (`Re:`, `Fwd:`, language variants) and normalising whitespace. Used to group related messages.

- **Arguments**: 1 (String)
- **Example**: `let "subject" "thread_name(header.subject)"`.

### `html_to_text`

Converts an HTML string to its plain-text equivalent.

- **Arguments**: 1 (String)
- **Example**: `let "body" "html_to_text(body.to_html)"`.

### `detect_language` *(trusted only)*

Returns the two-letter ISO 639-1 language code detected for a string, or `"unknown"` if no language could be determined.

- **Arguments**: 1 (String)
- **Example**: `if eval "detect_language(body.to_text) == 'ru'" { fileinto "russian"; }`.

### `levenshtein_distance` *(trusted only)*

Returns the Levenshtein edit distance between two strings.

- **Arguments**: 2 (String, String)
- **Example**: `if eval "levenshtein_distance(to_lowercase(envelope.to), 'postmaster@example.org') <= 2" { ... }` catches recipient typosquatting.

### `cosine_similarity` *(trusted only)*

Returns a float in `[0, 1]` representing the cosine similarity of two values. Arrays are compared as bags of elements; strings are compared as bags of characters.

- **Arguments**: 2 (Array or String, Array or String)

### `jaccard_similarity` *(trusted only)*

Returns a float in `[0, 1]` representing the Jaccard similarity (intersection over union) of two values. Arrays are compared as sets of elements; strings as sets of characters.

- **Arguments**: 2 (Array or String, Array or String)

## Array functions

### `count`

Returns the number of elements in an array. For non-array values, returns `1` when the value is non-empty and `0` otherwise.

- **Arguments**: 1 (Array)
- **Example**: `if eval "count(recipients) > 100" { ... }`.

### `sort`

Returns a sorted copy of the input array. The second argument is `true` for ascending order and `false` for descending.

- **Arguments**: 2 (Array, Ascending)
- **Example**: `sort(['z', 'a', 'b'], true)` returns `['a', 'b', 'z']`.

### `dedup`

Returns a copy of the array with duplicate elements removed, preserving the original order.

- **Arguments**: 1 (Array)

### `winnow`

Returns a copy of the array with empty elements removed.

- **Arguments**: 1 (Array)

### `is_intersect`

Returns `true` when the two arrays share at least one element. When one of the arguments is a scalar, checks whether the value is contained in the other array.

- **Arguments**: 2 (Array, Array)
- **Example**: `if eval "is_intersect(header.to[*], ['abuse@example.org', 'postmaster@example.org'])" { ... }`.

## Email functions

### `is_email`

Returns `true` when the input string is a syntactically valid email address.

- **Arguments**: 1 (String)

### `email_part`

Extracts either the local part or the domain of an email address. The second argument must be the literal string `'local'` or `'domain'`; any other value returns the empty string.

- **Arguments**: 2 (Email, Part)
- **Example**: `let "from_domain" "email_part(envelope.from, 'domain')"`.

### `domain_part` *(trusted only)*

Extracts a part of a domain name. The second argument selects which part to return:

- `sld`: the second-level domain as recognised by the public suffix list. For `mail.example.co.uk`, returns `example.co.uk`.
- `tld`: the top-level domain only. Returns the last dot-separated label, for example `uk`.
- `host`: the leftmost label. For `mail.example.org`, returns `mail`.

- **Arguments**: 2 (Domain, Part)
- **Example**: `let "org_domain" "domain_part(email_part(envelope.from, 'domain'), 'sld')"`.

## URL functions

### `uri_part`

Extracts a component of a URI. The second argument selects which component:

- `scheme`, `host`, `port`, `path`, `query`, `authority`, `path_query`: the corresponding URI component.
- `scheme_host`: `scheme://host`, useful for building the origin of a URL.

Returns the empty string when the argument does not parse as a URI or when the requested component is missing.

- **Arguments**: 2 (URI, Part)
- **Example**: `let "origin" "uri_part(header['list-unsubscribe'], 'scheme_host')"`.

### `puny_decode` *(trusted only)*

Decodes Punycode-encoded (`xn--`) labels in a domain name. Labels that are not Punycode-encoded pass through unchanged.

- **Arguments**: 1 (String)
- **Example**: `let "readable" "puny_decode(env.helo_domain)"`.

## Unicode-safety functions *(trusted only)*

These functions help detect abuse of Unicode to confuse recipients or evade text-matching filters.

### `has_zwsp`

Returns `true` when the string contains at least one zero-width or invisible separator (U+200B, U+200C, U+200D, U+FEFF, U+00AD).

- **Arguments**: 1 (String or Array)

### `has_obscured`

Returns `true` when the string contains a character from one of the directional-override or formatting ranges (U+200B–U+200F, U+2028–U+202F, U+205F–U+206F, U+FEFF) that can be used to hide or reorder text.

- **Arguments**: 1 (String or Array)

### `is_mixed_charset`

Returns `true` when the string mixes characters from scripts that should not normally co-occur (for example Latin and Cyrillic letters in the same word), a common indicator of a homograph attack.

- **Arguments**: 1 (String)

### `cure_text`

Returns a cleaned copy of the string with confusable, invisible, and zalgo characters removed or normalised.

- **Arguments**: 1 (String)

### `unicode_skeleton`

Returns the Unicode confusables "skeleton" of the string, as defined by UTS #39. Two strings with the same skeleton look alike to a human reader. Useful for comparing visually similar but differently encoded strings.

- **Arguments**: 1 (String)
- **Example**: `if eval "unicode_skeleton(envelope.from) == unicode_skeleton('ceo@example.org')" { ... }` flags a lookalike of the CEO address.

## Numeric and IP functions

### `is_empty`

Returns `true` when the value is an empty string or an empty array. Numeric values are never considered empty.

- **Arguments**: 1 (Value)

### `is_number`

Returns `true` when the value is an integer or a float. A numeric string returns `false`.

- **Arguments**: 1 (Value)

### `is_ip_addr`, `is_ipv4_addr`, `is_ipv6_addr`

Returns `true` when the string parses as an IP address of the corresponding family.

- **Arguments**: 1 (String)
- **Example**: `if eval "is_ipv6_addr(env.remote_ip)" { ... }`.

### `ip_reverse_name` *(trusted only)*

Returns the reverse-DNS form of an IP address, suitable for composing DNSBL lookups. For IPv4 the octets are reversed; for IPv6 each nibble is reversed and separated by dots. The same value is exposed as the environment variable `env.remote_ip.reverse`.

- **Arguments**: 1 (IP Address)

## Hashing *(trusted only)*

### `hash`

Computes a hash of the input string and returns it as a lowercase hexadecimal string. Supported algorithms are `md5`, `sha1`, `sha256`, and `sha512`. Any other algorithm name produces the empty string.

- **Arguments**: 2 (String, Algorithm)
- **Example**: `let "sender_id" "hash(envelope.from, 'sha256')"`.

## Message and MIME functions *(trusted only)*

These functions inspect the currently iterated MIME part; when called outside a `foreverypart` block, the top-level part is used.

### `is_body`

Returns `true` when the current MIME part is part of the message body (text or HTML).

- **Arguments**: none

### `is_attachment`

Returns `true` when the current MIME part is an attachment.

- **Arguments**: none

### `attachment_name`

Returns the declared filename of the current MIME part, or the empty string if none is declared.

- **Arguments**: none

### `mime_part_len`

Returns the byte length of the current MIME part.

- **Arguments**: none

### `is_encoding_problem`

Returns `true` when the current MIME part had a transfer-encoding or character-set decoding error during parsing.

- **Arguments**: none

### `is_header_utf8_valid`

Returns `true` when the named header (or every header, if the argument is not a known header name) contains only valid UTF-8. Headers that are not valid UTF-8 are often a sign of a malformed or adversarial message.

- **Arguments**: 1 (Header name)

### `received_part`

Extracts a component of the Nth `Received` header (1-based). The second argument selects which component; values accepted by the Sieve engine include `from`, `iprev`, `iprev.domain`, `iprev.ip`, `by`, `for`, `id`, `via`, `with`, `tls.version`, `tls.cipher`, `date`, `date.year`, `date.month`, `date.day`, `date.hour`, `date.minute`, `date.second`, `date.dow`, `date.ordinal`, `date.iso8601`, `date.rfc822`.

- **Arguments**: 2 (Index, Part)
- **Example**: `let "first_hop" "received_part(1, 'from')"`.

### `var_names`

Returns an array of the names of all global variables currently in scope, upper-cased.

- **Arguments**: none

## Image and file-type functions *(trusted only)*

These functions operate on the currently iterated MIME part.

### `img_metadata`

Returns a property of an image attachment. The argument selects which:

- `type`: format name, one of `jpeg`, `png`, `gif`, `webp`, `heif`, `bmp`, `tiff`, and others supported by the image decoder. Returns `"unknown"` for unrecognised formats.
- `width`, `height`: integer dimensions in pixels.
- `area`: `width * height`.
- `dimension`: `width + height`.

Returns the empty string when the part is not a recognised image.

- **Arguments**: 1 (Property)
- **Example**: `if eval "img_metadata('type') == 'gif' && img_metadata('area') < 100" { ... }` detects suspiciously tiny tracking pixels.

### `detect_file_type`

Returns the inferred MIME type of the current MIME part based on content sniffing, ignoring the declared `Content-Type`. When the argument is `"ext"`, returns a file-extension instead of a MIME type.

- **Arguments**: 1 (String, either `"mime"` or `"ext"`)
- **Example**: `if eval "detect_file_type('ext') == 'exe'" { discard; }`.

## DNS functions *(trusted only)*

### `dns_query`

Performs a DNS query for the given name and record type. Supported record types are `ipv4`, `ipv6`, `ip` (IPv4 with IPv6 fallback), `mx`, `txt`, and `ptr`. For `ptr`, the first argument must parse as an IP address.

Address and `ptr` queries return arrays of strings; `mx` returns an array of `"preference host"` strings; `txt` returns a single concatenated string. When the lookup fails, the function returns a short error code: `temp_fail`, `not_found`, `io_error`, `invalid_record`, or `unknown_error`.

- **Arguments**: 2 (Name, Record Type)
- **Example**: DNSBL lookup against Spamhaus Zen:

    ```sieve
    if eval "contains(dns_query('${env.remote_ip.reverse}.zen.spamhaus.org', 'ipv4'), '127.0.0.2')" {
        reject "550 Listed on Spamhaus SBL";
    }
    ```

### `dns_exists`

Returns `1` when a record of the given type exists for the name, `0` when it does not, and `-1` on error. Supported types are `ip`, `ipv4`, `ipv6`, `mx`, and `ptr`.

- **Arguments**: 2 (Name, Record Type)
- **Example**: `if eval "dns_exists(email_part(envelope.from, 'domain'), 'mx') != 1" { reject "Your domain has no MX record"; }`.

## Directory functions *(trusted only)*

### `is_local_domain`

Returns `true` when the domain is registered in the server's directory.

- **Arguments**: 1 (Domain)
- **Example**: `if eval "is_local_domain(email_part(envelope.to, 'domain'))" { ... }`.

## Key-value store functions *(trusted only)*

Key-value functions target an in-memory store identified by its ID; an empty string selects the default in-memory store.

### `key_get`

Returns the value associated with a key, or the empty string when the key does not exist.

- **Arguments**: 2 (Store ID, Key)

### `key_exists`

Returns `true` when the key exists. When the second argument is an array, returns `true` as soon as any of the keys is found.

- **Arguments**: 2 (Store ID, Key or Array)

### `key_set`

Stores a value under a key, creating it if necessary, and optionally sets an expiration time in seconds. Returns `true` on success. Setting an empty value stores an empty marker.

- **Arguments**: 4 (Store ID, Key, Value, Expires)
- **Example**: stop-list a repeat offender for an hour:

    ```sieve
    eval "key_set('', 'block-${env.remote_ip}', '1', 3600)";
    ```

## SQL queries *(trusted only)*

### `query`

Runs a SQL statement against a data store of type SQL. If the first argument is the empty string, the default data store is used. The third argument binds parameters to the query's `?` placeholders, in order.

A `SELECT` returning exactly one row and one column returns the scalar value; a `SELECT` returning a single row with multiple columns returns that row as an array; multiple rows return an array of arrays. A non-`SELECT` statement returns `true` on success.

- **Arguments**: 3 (Store ID, Query, Parameters)
- **Example**: greylisting triplet:

    ```sieve
    require ["variables", "vnd.stalwart.expressions", "envelope", "reject"];

    set "triplet" "${env.remote_ip}.${envelope.from}.${envelope.to}";
    if eval "!query('sql', 'SELECT 1 FROM greylist WHERE addr=? LIMIT 1', [triplet])" {
        eval "query('sql', 'INSERT INTO greylist (addr) VALUES (?)', [triplet])";
        reject "422 4.2.2 Greylisted, please try again in a few moments.";
    }
    ```

## HTTP functions *(trusted only)*

### `http_header`

Performs an HTTP GET request and returns the value of a response header, or the empty string if the header is absent or the request fails. Redirects are not followed and invalid TLS certificates are accepted, so the function is suitable only for querying well-known internal endpoints.

- **Arguments**: 4 (URL, Header Name, User-Agent, Timeout in milliseconds)
- **Example**: `let "tier" "http_header('https://internal.example.org/api/tier', 'X-Tier', 'stalwart-sieve', '2000')"`.

## Message-modification functions *(trusted only)*

### `add_header`

Queues a header addition on the message. Returns `true` when both arguments are strings. The headers are appended to the message after the script completes.

- **Arguments**: 2 (Name, Value)
- **Example**: `eval "add_header('X-Greeting', 'Hello from Stalwart')"`.

## Tokenisation *(trusted only)*

### `tokenize`

Extracts tokens from a string. The second argument selects the token class:

- `words`: alphanumeric whitespace-separated tokens.
- `uri` or `url`: URLs, including bare hostnames without a scheme (rewritten to `https://`) and email addresses.
- `uri_strict` or `url_strict`: URLs with a scheme only.
- `email`: email addresses.

Returns an array of tokens.

- **Arguments**: 2 (String, Token Class)
- **Example**: `let "urls" "tokenize(body.to_text, 'url_strict')"`.

## External programs *(trusted only)*

### `exec`

Runs an external program. The first argument is the path to the executable; the second is an array of arguments to pass. Returns `true` when the process exits successfully and `false` otherwise.

- **Arguments**: 2 (Path, Arguments)
- **Example**:

    ```sieve
    require "vnd.stalwart.expressions";

    if eval "!exec('/opt/stalwart/bin/validate.sh', [env.remote_ip, envelope.from])" {
        reject "You are not allowed to send e-mails.";
    }
    ```

## LLM prompt *(trusted and untrusted, Enterprise)*

### `llm_prompt`

Sends a prompt to an AI model and returns the response. Available in the trusted interpreter by default, and in the untrusted interpreter for accounts with the `ai-model-interact` permission. See [LLM Integration](/docs/sieve/llm) for a full description.

- **Arguments**: 3 (Model name, Prompt, Temperature)
