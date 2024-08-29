---
sidebar_position: 7
---

# Examples

This section contains a collection of example Sieve scripts that can be used as a starting point for your own scripts.

## Greylisting

The following script implements a simple greylisting filter using an SQL database:

```toml
[session.rcpt]
script = "'greylist'"

[sieve.trusted.scripts.greylist]
contents = '''
    require ["variables", "vnd.stalwart.expressions", "envelope", "reject"];

    set "triplet" "${env.remote_ip}.${envelope.from}.${envelope.to}";

    if eval "!query("SELECT 1 FROM greylist WHERE addr = ? LIMIT 1", [triplet])" {
        eval "query("INSERT INTO greylist (addr) VALUES (?)", [triplet])";
        reject "422 4.2.2 Greylisted, please try again in a few moments.";
    }
'''
```

## Domain blocklisting

The following script implements a domain blocklisting filter during the [EHLO](/docs/smtp/inbound/ehlo) phase:

```toml
[session.ehlo]
script = "'is-blocked'"

[sieve.trusted.scripts.is-blocked]
contents = '''
    require ["variables", "extlists", "reject"];

    if string :list "${env.helo_domain}" "sql/blocked-domains" {
        reject "551 5.1.1 Your domain '${env.helo_domain}' has been blocklisted.";
    }
'''

[store."sql".query]
blocked-domains = "SELECT 1 FROM blocked_domains WHERE domain=? LIMIT 1"

```

## Message modification

The following example modifies the incoming message by replacing the content of all HTML parts with their uppercase version and adding a custom header to each part:

```toml
[session.data]
script = "'modify-message'"

[sieve.trusted.scripts.modify-message]
contents = '''
    require ["envelope", "variables", "replace", "mime", "foreverypart", "editheader", "extracttext"];

    if envelope :domain :is "to" "example.net" {
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
