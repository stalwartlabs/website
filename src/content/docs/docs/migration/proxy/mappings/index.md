---
sidebar_position: 1
title: "Overview"
---

A mapping associates an account identifier with the destination that currently holds that account's data. Mappings are the heart of the proxy's routing: when a client authenticates, the proxy derives an identifier from the credentials, looks it up in the mapping store, and sends the session to whichever destination the lookup returns. Accounts without an explicit mapping fall through to the default destination, which makes incremental migration straightforward. At the start every account resolves to the default (the old system), and each account is given an explicit mapping to the new destination as its mailbox is moved.

The mapping store is selected with the `source` key under `[mapping]`, and may be a flat [file](/docs/migration/proxy/mappings/file), a [Redis](/docs/migration/proxy/mappings/redis) database, or a [SQL](/docs/migration/proxy/mappings/sql) database. This page describes the behavior common to all three: how identifiers are normalized, how results are cached, and how the default destination and master users are handled. The source-specific pages cover the configuration of each store.

## The mapping table

Configuration of the store lives under `[mapping]`, and the chosen source's own section provides its connection details:

```toml
[mapping]
source = "file"
normalize = "lowercase"
negative_ttl = "30s"
positive_ttl = "10m"

[mapping.file]
path = "/etc/proxy/mappings.tsv"
```

The general keys under `[mapping]` are:

| Key | Default | Description |
| --- | --- | --- |
| `source` | required | `file`, `redis` or `sql`. |
| `normalize` | `none` | Identifier normalization applied before lookup: `none` or `lowercase`. |
| `positive_ttl` | `600s` | How long a resolved mapping is cached. |
| `negative_ttl` | `30s` | How long the absence of a mapping (a fall-through to default) is cached. |
| `cache_max_entries` | `1000000` | Maximum number of cached entries. |
| `lookup_timeout` | `5s` | Time limit for a single store lookup. |

The destination named by `routing.default_destination` is where any account without an explicit mapping is sent, and is configured under `[routing]` rather than `[mapping]`:

```toml
[routing]
default_destination = "legacy"
```

## Identifier normalization

E-mail addresses and login names are frequently presented with inconsistent casing by different clients. Setting `normalize = "lowercase"` lowercases every identifier before it is looked up and before it is stored, so that `Alice@Example.com` and `alice@example.com` resolve to the same entry. With the default of `none`, identifiers are matched exactly as presented. Lowercase normalization is recommended for e-mail-addressed accounts; the normalization choice must be consistent with how identifiers are written into the store.

## Caching

Lookups are served from an in-memory cache so that the backing store is consulted only on the first connection for an account and then at most once per cache lifetime thereafter. This keeps the store off the hot path for established users and is what makes the proxy efficient as a cache-locality router. Three kinds of result are cached with different lifetimes:

- A **resolved** mapping is held for `positive_ttl`. This is the steady-state case for an account that has an explicit destination.
- A **fall-through** to the default destination is held for `negative_ttl`, which is shorter by default so that newly added mappings take effect quickly. When an account is migrated and given an explicit mapping, existing clients pick up the change within this window.
- A **transient** result, produced when the store cannot be reached or the lookup times out, is held for only a few seconds. The connection is routed to the default destination so that service is not interrupted, and the short lifetime ensures the store is retried promptly once it recovers.

The `cache_max_entries` cap bounds memory use; once reached, the cache evicts entries according to its usage policy. The cache can be inspected and invalidated through the [management API](/docs/migration/proxy/management/api), which is the mechanism for forcing an account to be re-resolved immediately rather than waiting for its entry to expire.

If a lookup returns a destination that is not declared in the configuration, the proxy logs a warning and routes the connection to the default destination rather than to the unknown name, so that a stale or mistyped store entry cannot send traffic to a non-existent backend.

## Master users

Legacy systems often allow an administrator to log in to another user's mailbox by appending a separator and the administrator's own credentials to the login name, a convention known as a master user. The proxy understands this so that the routing identifier is derived from the mailbox being accessed rather than from the combined login string. The `master_user_separators` key under `[routing]` lists the separators to recognize; the default is a single `%`.

```toml
[routing]
default_destination = "legacy"
master_user_separators = ["%", "*"]
```

When a login name such as `alice@example.com%admin` is presented, the proxy splits on the first occurrence of any configured separator and uses the left-hand portion, `alice@example.com`, as the routing identifier, so the session is routed to the mailbox owner's destination. The full login string, including the master-user suffix, is still forwarded to the backend unchanged for authentication.
