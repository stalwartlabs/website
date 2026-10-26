---
sidebar_position: 5
title: "URN Namespace"
description: "The stalwart URN namespace: its syntax, resource types, equivalence rules and assignment policy for JMAP capabilities, WebDAV lock tokens and WebDAV synchronisation tokens."
---

A Uniform Resource Name (URN) is a URI that names a resource permanently, independently of where the resource is located. Protocols use URNs wherever they need an identifier that must never collide with another, such as the name of a protocol extension. The `stalwart` URN namespace provides such identifiers for resources related to the Stalwart mail and collaboration server, and its namespace identifier (NID) is `stalwart`.

Client developers encounter these URNs in three places: as a JMAP capability, as WebDAV lock tokens, and as WebDAV synchronisation tokens. This page defines their syntax and the rules for comparing and assigning them.

## Purpose

The `stalwart` namespace provides unique identifiers for:

- Custom JMAP extensions ([RFC 8620](https://www.rfc-editor.org/rfc/rfc8620))
- WebDAV lock tokens ([RFC 4918](https://www.rfc-editor.org/rfc/rfc4918))
- WebDAV synchronisation tokens ([RFC 6578](https://www.rfc-editor.org/rfc/rfc6578))

## Syntax

URNs in the `stalwart` namespace have the following structure:

```text
urn:stalwart:{resource-type}[:{specific-identifier}]
```

The URN begins with the URI scheme, `urn:`, followed by the namespace identifier, `stalwart`. The `{resource-type}` part names the category of resource. The `{specific-identifier}` part identifies the resource within its category, and it is omitted for the JMAP capability of the server itself.

### Resource Types

Version 1 of this specification defines three resource types. The format of the specific identifier depends on the type:

| Resource type | Used for | Specific identifier format | Example |
|---|---|---|---|
| `jmap` | JMAP protocol extensions | None for the server's own capability, otherwise a text string identifying the extension | `urn:stalwart:jmap` |
| `davlock` | WebDAV lock tokens | 64-bit number encoded as lowercase hexadecimal, without leading zeros | `9f3c2a71b04e5d68` |
| `davsync` | WebDAV synchronisation tokens | 64-bit change identifier encoded as lowercase hexadecimal, optionally followed by paging information separated by colons | `1a2b`, `1a2b:3:1c00` |

## Examples

The following URNs are valid in the `stalwart` namespace:

- `urn:stalwart:jmap`, the JMAP capability that gives access to the server's configuration objects
- `urn:stalwart:davlock:9f3c2a71b04e5d68`, a WebDAV lock token
- `urn:stalwart:davsync:1a2b`, a WebDAV synchronisation token

## URN Equivalence

Two URNs are equivalent when they identify the same resource, and clients need to know when to treat two spellings as one. URN equivalence within the `stalwart` namespace follows the rules defined in [RFC 8141](https://www.rfc-editor.org/rfc/rfc8141), with one addition. The hexadecimal parts of `davlock` and `davsync` identifiers are compared case-insensitively, while the resource type is compared exactly. Stalwart itself always emits lowercase identifiers.

For example, `urn:stalwart:davlock:9F3C2A71B04E5D68` and `urn:stalwart:davlock:9f3c2a71b04e5d68` are equivalent.

## Assignment

URNs in the `stalwart` namespace are assigned by Stalwart Labs LLC, and each resource type follows its own rules.

JMAP extension names are assigned according to the functionality that the extension provides. They follow a convention similar to that of the standard JMAP capabilities: a name should be concise and descriptive, and use lowercase letters and hyphens.

WebDAV lock tokens are generated on demand, when a lock is created. Each is a random 64-bit number, encoded as a hexadecimal string of up to 16 characters.

WebDAV synchronisation tokens are generated in each synchronisation response, to indicate the state the client has reached. Each is based on the 64-bit identifier of the last change to the collection, encoded as a hexadecimal string of up to 16 characters. A partial (paged) result needs to record where the client stopped, so a token returned with such a result also carries the position in the result after it. The position is given either as two further colon-separated hexadecimal fields, or as `:i` followed by a hexadecimal cursor of up to 32 characters.

## Security and Privacy Considerations

WebDAV lock tokens should be treated as private information, although they do not grant exclusive access to resources. When synchronisation tokens or lock tokens are used across networks, they should be transmitted over secure protocols, to prevent interception. JMAP extension identifiers may reveal which capabilities a server offers, which can help an attacker fingerprint an installation.

## Usage Policy

Use of the `stalwart` URN namespace within projects related to or derived from the Stalwart mail and collaboration server is permitted under the terms of the server's license.

## Version History

| Version | Date | Changes |
|---|---|---|
| 1 | 2025-03-23 | Initial definition with the `jmap`, `davlock` and `davsync` resource types. |

## Contact Information

Questions or concerns regarding the `stalwart` URN namespace can be sent to Stalwart Labs LLC:

- Email: hello@stalw.art
- Website: https://github.com/stalwartlabs/stalwart
