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
AccountPassword         Password-based authentication credential. (singleton)
AccountSettings         Configures default account settings for locale and encryption. (singleton)
AcmeProvider            Defines an ACME provider for automatic TLS certificate management.
Action                  Defines server management actions such as reloads, troubleshooting and cache operations.
AddressBook             Configures address book and contact storage settings. (singleton)
...
Domain                  Defines an email domain and its DNS, DKIM, and TLS certificate settings.
...
SystemSettings          Configures core server settings including hostname and network services. (singleton)
...
```

The `(singleton)` tag marks a configuration object that has exactly one instance per server, such as `SystemSettings`. Because that instance always exists, a singleton cannot be created or destroyed, only updated. [Updating objects](/docs/management/cli/update) explains how its id works.

## Inspecting a single object

Passing an object name prints the full description of that object, which is what the administrator needs before creating or changing one. The name is case-insensitive and may be given with or without the `x:` prefix:

```sh
stalwart-cli describe domain
```

```text
Domain
  Defines an email domain and its DNS, DKIM, and TLS certificate settings.

Fields
  aliases                Set of text
      List of additional domain names that are aliases of this domain
  allowRelaying          Boolean
      Whether to allow relaying for non-local recipients, useful in split delivery scenarios
  ...
  catchAllAddress        Email address (optional)
      Catch-all email address that receives messages addressed to unknown local recipients
  certificateManagement  CertificateManagement object
      Whether TLS certificates for this domain are managed manually or automatically by an ACME provider
  createdAt              Date and time (read-only)
      Creation date of the domain
  description            Text (optional)
      Description of the domain
  directoryId            Reference to Directory (optional)
      Identifier for the directory where accounts for this domain are stored, or null to use the internal directory
  ...
  name                   Text
      Domain name
  ...

Filters
  text            Text                 Text
  name            Text                 Name
  memberTenantId  Reference to Tenant  Tenant
```

The output is divided into sections, and each appears only where it applies to the object:

* Header: the object name, the `(singleton)` tag when the object is one, and the description.
* Fields: for an object with a single schema, every property the server exposes, with its type and a description. A tag after the type states who may set the field: a field without a tag can be changed at any time, a `(create-only)` field is set when the object is created and cannot be changed afterwards, and a `(read-only)` field is filled in by the server. An `(optional)` field accepts `null`.
* Variants: for a multi-variant object, each `@type` discriminator value with its label, followed by one section with the fields of each variant, as shown in the next section.
* Filters: the `--where` keys that [`query`](/docs/management/cli/query) accepts for the object, each with the kind of value it expects (such as `Text`, `Integer`, `Date`, `One of <Enum>` or `Reference to <Object>`) and its label.
* Sort by: the property names that JMAP `sort` accepts. The section is omitted when the object declares none.

### Multi-variant objects

Some objects come in several distinct shapes, called variants, and each variant has its own fields. Every instance of such a multi-variant object has an `@type` field that names its variant. `Account` is the typical example, with the variants `User`, `Group` and `Resource`, and its description lists the fields per variant:

```sh
stalwart-cli describe account
```

```text
Account
  Defines a user or group account for authentication and email access.

Variants
  User      User account
  Group     Group account
  Resource  Resource account

User fields
  aliases           List of EmailAlias objects
      List of email aliases for the account
  createdAt         Date and time (read-only)
      Creation date of the account
  ...
  domainId          Reference to Domain
      Identifier for the domain this account belongs to. This is used to determine the email address of the account, which is formed as name@domain.
  ...
  locale            One of Locale
      Preferred locale for the account
  memberGroupIds    Set of references to Account/Group
      List of groups that this account is a member of
  ...

Group fields
  ...

Resource fields
  ...

Filters
  text            Text                        Text
  name            Text                        Name
  domainId        Reference to Domain         Domain
  memberTenantId  Reference to Tenant         Tenant
  memberGroupIds  Reference to Account/Group  Group
```

Because the server needs to know which shape an object has, [creating](/docs/management/cli/create) a multi-variant object requires an `@type`. It is supplied either through the `Object/Variant` shorthand or as an explicit field.

The `Filters` section always combines two sources: the filters of the parent object's list and those of any view lists that target it. Duplicates are removed by field name, so each filter appears once.

## Inspecting an enum

An enumeration is a field type with a fixed set of allowed values, and its name is passed to `describe` in the same way as an object name. The lookup tries objects first and enumerations second, so the command needs no indication of which kind of name it received:

```sh
stalwart-cli describe AccountType
```

```text
AccountType (enum)

Values
  User      User account
  Group     Group account
  Resource  Resource account
```

When the values of an enumeration carry a `color`, as log severity levels do, interactive terminals show them in those colours:

```sh
stalwart-cli describe TracingLevel
```

```text
TracingLevel (enum)

Values
  error  Error
  warn   Warning
  info   Info
  debug  Debug
  trace  Trace
```

## Reading the output

The output is purely descriptive. `describe` issues no requests for individual objects and changes nothing, so it can be run freely while learning the schema before designing an [apply plan](/docs/management/cli/apply).

Field types are written out in words. A scalar type names its format, such as `Text`, `Email address`, `Size in bytes` or `Date and time`. `Reference to <Object>` holds the id of an object of the named type, `<Object> object` an embedded object, and `List of`, `Set of` and `Map from ... to ...` the collections.

A field whose type is an enumeration shows `One of <Enum>` rather than the values, because some enumerations have hundreds of them. `describe <Enum>` lists the values.

A name that matches neither an object nor an enumeration fails with `no object or enum named <name>`.
