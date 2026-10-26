---
sidebar_position: 2
title: "Exploring the schema"
description: "Explore the objects, fields, enumerations and filters of the server schema with stalwart-cli describe."
---

The `describe` command answers the questions that come before any change: which objects a server has, what fields they carry and which values those fields accept. It is the natural starting point on an unfamiliar server, and when designing a configuration plan for [bulk apply](/docs/management/cli/apply).

The answers come from the schema. On first use, the CLI downloads from the server a description of every object, its fields and its forms, and caches it. `describe` introspects that schema and prints it in human-readable form: which objects exist, which fields and variants each one has, which enumerations are defined, and which list filters and sort options each object supports. Because the schema comes from the server itself, the output shows exactly what this deployment accepts.

## Listing every object

Without arguments, `describe` prints a sorted listing of all management objects. These are the configuration objects of the server, whose JMAP names start with `x:`, and each is shown with a one-line description:

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

The `[singleton]` tag marks a configuration object that has exactly one instance per server, such as `SystemSettings`. Because that instance always exists, a singleton cannot be created or destroyed, only updated. [Updating objects](/docs/management/cli/update) explains how its id works.

## Inspecting a single object

Passing an object name prints the full description of that object, which is what the administrator needs before creating or changing one. The name is case-insensitive and may be given with or without the `x:` prefix:

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

The output is divided into sections, and each appears only where it applies to the object:

* Header: the object name, the `[singleton]` tag when the object is one, and the description.
* Fields: for an object with a single schema, every property the server exposes, with its type, its mutability and a description. The mutability states who may set the field: `mutable` fields can be changed at any time, `immutable` ones are set when the object is created, and `server-set` ones are filled in by the server.
* Variants: for a multi-variant object, each `@type` discriminator value with its label, followed by the fields of that variant, as shown in the next section.
* Filters: the `--where` keys that [`query`](/docs/management/cli/query) accepts for the object. Each key has a kind (`text`, `integer`, `date`, `enum` or `id<Object>`), which indicates the shape of the value it expects.
* Sort by: the property names that JMAP `sort` accepts. The section is omitted when the object declares none.

A `?` after a type means that the field is nullable, so `null` is an accepted value.

### Multi-variant objects

Some objects come in several distinct shapes, called variants, and each variant has its own fields. Every instance of such a multi-variant object has an `@type` field that names its variant. `Account` is the typical example, with the variants `User` and `Group`, and its description lists the fields per variant:

```sh
stalwart-cli describe account
```

```text
Account
  Defines a user or group account for authentication and email access.

  Variants:
    User: User account
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
    Group: Group account
      Fields:
        ...

Filters:
    text            text               Text
    name            text               Name
    domainId        id<Domain>         Domain
    memberGroupIds  id<Account/Group>  Group
    memberTenantId  id<Tenant>         Tenant
```

Because the server needs to know which shape an object has, [creating](/docs/management/cli/create) a multi-variant object requires an `@type`. It is supplied either through the `Object/Variant` shorthand or as an explicit field.

The `Filters` section always combines two sources: the filters of the parent object's list and those of any view lists that target it. Duplicates are removed by field name, so each filter appears once.

## Inspecting an enum

An enumeration is a field type with a fixed set of allowed values, and its name is passed to `describe` in the same way as an object name. The lookup tries objects first and enumerations second, so the command needs no indication of which kind of name it received:

```sh
stalwart-cli describe AccountType
```

```text
AccountType  (enum)

  Variants:
    User   User account
    Group  Group account
```

When the variants of an enumeration carry a `color`, as log severity levels do, interactive terminals show them in those colours:

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

## Reading the output

The output is purely descriptive. `describe` issues no requests for individual objects and changes nothing, so it can be run freely while learning the schema before designing an [apply plan](/docs/management/cli/apply).

Field types are summarised in a compact notation: `string<format>`, `number<format>`, `set<scalar>`, `list<embedded>`, `map<key, value>` and `id<RefObject>`, with the `?` suffix marking a nullable field. An `id<RefObject>` field holds a reference to an object of the named type.

An enumeration with hundreds of variants would swamp the description of every object that uses it, so it is not inlined there. Those objects show `enum (see <enumName>)` instead, and `describe <enumName>` lists the values.
