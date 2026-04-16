---
sidebar_position: 2
---

# Exploring the schema

The `describe` command introspects the schema downloaded from the server and prints, in human-readable form, what objects exist, what fields and variants each one has, what enums are defined, and which list-level filters and sort options are supported.

It is the recommended starting point when working with an unfamiliar deployment or when designing a configuration plan for [bulk apply](./apply.md).

## Listing every object

Run `describe` with no arguments to get a sorted listing of all management objects (those whose JMAP names start with `x:`):

```sh
stalwart-cli describe
```

```text
Account                 Defines a user or group account for authentication and email access.
AccountPassword         Password-based authentication credential. [singleton]
AccountSettings         Configures default account settings for locale and encryption. [singleton]
AcmeProvider            Defines an ACME provider for automatic TLS certificate management.
Action                  Defines server management actions such as reloads, troubleshooting and cache operations.
AddressBook             Configures address book and contact storage settings. [singleton]
...
Domain                  Defines an email domain and its DNS, DKIM, and TLS certificate settings.
...
SystemSettings          Server-wide configuration. [singleton]
...
```

The `[singleton]` tag identifies objects that have exactly one instance per server (configuration objects). Singletons cannot be created or destroyed (only updated). See the [Updating objects](./update.md) page for details on how singleton ids work.

## Inspecting a single object

Pass the object name (with or without the `x:` prefix, case-insensitive) to get its full description:

```sh
stalwart-cli describe domain
```

```text
Domain
  Defines an email domain and its DNS, DKIM, and TLS certificate settings.

Fields:
    aliases                set<string<string>>  mutable
        List of additional domain names that are aliases of this domain
    allowRelaying          boolean  mutable
        Whether to allow relaying for non-local recipients, useful in split delivery scenarios
    catchAllAddress        string<emailAddress>?  mutable
        Catch-all email address that receives messages addressed to unknown local recipients
    certificateManagement  object<CertificateManagement>  mutable
        Whether TLS certificates for this domain are managed manually or automatically by an ACME provider
    createdAt              datetime  server-set
        Creation date of the domain
    description            string<string>?  mutable
        Description of the domain
    ...
    name                   string<string>  mutable
        Domain name

Filters:
    text            text        Text
    name            text        Name
    memberTenantId  id<Tenant>  Tenant
```

The output has up to four sections:

* **Header**: object name, optional `[singleton]` tag, description.
* **Fields** (single-schema objects): every property the server exposes, with type, mutability (`mutable`, `immutable`, `server-set`), and a description.
* **Variants** (multi-variant objects): each `@type` discriminator value with a label, followed by that variant's fields. See the next section.
* **Filters**: what `--where` keys [`query`](./query.md) accepts for this object. The kind (`text`, `integer`, `date`, `enum`, `id<Object>`) hints at the expected value shape.
* **Sort by**: the property names accepted by JMAP `sort` (omitted when none are declared).

A `?` after a type indicates the field is nullable (`null` is an accepted value).

### Multi-variant objects

Some objects are *multi-variant*: each instance has an `@type` field that selects one of several distinct shapes. `Account` is the canonical example (variants `User` and `Group`):

```sh
stalwart-cli describe account
```

```text
Account
  Defines a user or group account for authentication and email access.

  Variants:
    User — User account
      Fields:
        aliases           list<EmailAlias>  mutable
            List of email aliases for the account
        createdAt         datetime  server-set
        ...
        name              string<string>  mutable
            Name of the account, typically an email address local part.
        domainId          id<Domain>  mutable
            Identifier for the domain this account belongs to.
        ...
    Group — Group account
      Fields:
        ...

Filters:
    text            text               Text
    name            text               Name
    domainId        id<Domain>         Domain
    memberGroupIds  id<Account/Group>  Group
    memberTenantId  id<Tenant>         Tenant
```

When [creating](./create.md) a multi-variant object, the `@type` must be supplied (either via the `Object/Variant` shorthand or as an explicit field). `Filters` are always merged across the parent object's list and any view lists that target it, and deduplicated by field name.

## Inspecting an enum

Enum names can be passed to `describe` exactly like object names. The lookup tries objects first, then enums, so the command does not need to be told which kind of name was supplied:

```sh
stalwart-cli describe AccountType
```

```text
AccountType  (enum)

  Variants:
    User   User account
    Group  Group account
```

Enums whose variants carry a `color` (for example log severity levels) are rendered with their colors in interactive terminals:

```sh
stalwart-cli describe TracingLevel
```

```text
TracingLevel  (enum)

  Variants:
    error  Error
    warn   Warning
    info   Info
    debug  Debug
    trace  Trace
```

## Tips

* The output is purely descriptive (no requests are issued for individual objects). Run it freely to learn the schema before designing an [apply plan](./apply.md).
* For very large enums (hundreds of variants), `describe` on an object that references one shows `enum (see <enumName>)` instead of inlining the values. Run `describe <enumName>` to see them.
* Field type summaries use compact notation: `string<format>`, `number<format>`, `set<scalar>`, `list<embedded>`, `map<key, value>`, `id<RefObject>`. The `?` suffix marks nullable fields.
