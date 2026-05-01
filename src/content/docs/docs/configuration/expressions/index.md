---
sidebar_position: 1
title: "Overview"
---

Expressions are small conditional programs evaluated at runtime, controlling aspects such as whether a connection is accepted, which authentication mechanisms are offered, or how a message is routed. Several JMAP objects expose fields whose value is an expression; examples include [`saslMechanisms`](/docs/ref/object/mta-stage-auth#saslmechanisms) on [MtaStageAuth](/docs/ref/object/mta-stage-auth), [`route`](/docs/ref/object/mta-route) on [MtaRoute](/docs/ref/object/mta-route), and [`allowedEndpoints`](/docs/ref/object/http#allowedendpoints) on [Http](/docs/ref/object/http). The reference page for each object marks which of its fields are expression-typed.

Expressions evaluate context variables, call functions, and combine values using operators. A result can be a boolean, a string, a number, or an array. Stalwart compiles expressions into bytecode at configuration time and evaluates them at runtime.

## Shape of an expression

An expression is stored as a JSON object with two fields. The `match` array lists zero or more `{if, then}` pairs that are evaluated in order; the first matching condition determines the result. The `else` string is the fallback when no condition matches:

```json
{
  "match": [
    {"if": "<condition>", "then": "<value>"},
    {"if": "<condition>", "then": "<value>"}
  ],
  "else": "<default value>"
}
```

All three fields (`if`, `then`, `else`) hold string values. Numbers, booleans, and arrays are written as their string representations: `"true"`, `"false"`, `"3"`, `"[plain, login]"`. When an expression always evaluates to the same result, the `match` array is omitted and only `else` is set:

```json
{"else": "value"}
```

## Core concepts

An expression is composed of the following elements:

- [Variables](/docs/configuration/variables) carry contextual data supplied by the component evaluating the expression. For instance, `remote_ip`, `url_path`, `rcpt`, or `retry_num` may be available depending on the context.
- [Functions](/docs/configuration/expressions/functions) manipulate variables and values: string operations (`starts_with`, `contains`), regular-expression matching (`matches`), DNS lookups (`dns_query`), directory queries (`is_local_domain`), and more.
- [Values](/docs/configuration/expressions/values) can be booleans (`true`, `false`), strings (for example `'local'`, `'fallback'`), numbers (for example `25`, `1.26`), or arrays that combine the above.
- [Operators](/docs/configuration/expressions/operators) combine values using arithmetic, logical, and comparison operations.
- **Conditional logic** chains `if`/`then`/`else` clauses to select a result.

## Examples

Each example below shows a partial JSON view of the parent object; only the expression-typed field is included.

A conditional expression offering `PLAIN` and `LOGIN` mechanisms only on TLS-protected submission ports, and disabling authentication elsewhere:

```json
{
  "saslMechanisms": {
    "match": [{"if": "local_port != 25 && is_tls", "then": "[plain, login]"}],
    "else": "false"
  }
}
```

An expression that rewrites non-SMTP recipients by extracting the local part and the top-level domain using regex capture groups:

```json
{
  "rewrite": {
    "match": [
      {"if": "listener != 'smtp' && matches('^([^.]+)@([^.]+)\\.(.+)$', rcpt)", "then": "$1 + '@' + $3"}
    ],
    "else": "false"
  }
}
```

A multi-condition routing expression that returns different queue targets depending on whether the recipient is local and how many retries have elapsed:

```json
{
  "route": {
    "match": [
      {"if": "is_local_domain(rcpt_domain)", "then": "'local'"},
      {"if": "retry_num > 1", "then": "'fallback'"}
    ],
    "else": "'mx'"
  }
}
```

A DNSBL check that consults Spamhaus Zen for the remote address and returns the matched list category, combining `ip_reverse_name`, string concatenation, and `dns_query`:

```json
{
  "tag": {
    "match": [
      {"if": "contains(dns_query(ip_reverse_name(remote_ip) + '.zen.spamhaus.org', 'ipv4'), '127.0.0.2')", "then": "'SBL'"},
      {"if": "contains(dns_query(ip_reverse_name(remote_ip) + '.zen.spamhaus.org', 'ipv4'), '127.0.0.3')", "then": "'CSS'"},
      {"if": "contains(dns_query(ip_reverse_name(remote_ip) + '.zen.spamhaus.org', 'ipv4'), '127.0.0.4')", "then": "'XBL'"}
    ],
    "else": "false"
  }
}
```

A per-sender rate limit that increments an in-memory counter and returns `false` (reject) once the threshold is exceeded. The counter key incorporates the authenticated account, so accounts do not share a budget:

```json
{
  "accept": {"else": "counter_incr('', 'rcpt-' + authenticated_as, count(recipients)) <= 500"}
}
```

A longer ladder that classifies MailSpike DNSBL responses by the fourth octet of the returned IP address:

```json
{
  "tag": {
    "match": [
      {"if": "octets[0] != 127", "then": "false"},
      {"if": "octets[3] == 10", "then": "'RBL_MAILSPIKE_WORST'"},
      {"if": "octets[3] == 11", "then": "'RBL_MAILSPIKE_VERYBAD'"},
      {"if": "octets[3] == 12", "then": "'RBL_MAILSPIKE_BAD'"},
      {"if": "octets[3] >= 13 && octets[3] <= 16", "then": "'RWL_MAILSPIKE_NEUTRAL'"},
      {"if": "octets[3] == 17", "then": "'RWL_MAILSPIKE_POSSIBLE'"},
      {"if": "octets[3] == 18", "then": "'RWL_MAILSPIKE_GOOD'"},
      {"if": "octets[3] == 19", "then": "'RWL_MAILSPIKE_VERYGOOD'"},
      {"if": "octets[3] == 20", "then": "'RWL_MAILSPIKE_EXCELLENT'"}
    ],
    "else": "false"
  }
}
```

A simple fallback-only expression, with no `match` array:

```json
{
  "chunking": {"else": "remote_ip == '192.0.2.1'"}
}
```
