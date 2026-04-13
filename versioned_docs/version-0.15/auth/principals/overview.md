---
sidebar_position: 1
---

# Overview

Principals are the entities that represent individuals, groups, resources, or other organizational elements within Stalwart. They play a key role in managing access, permissions, and interactions with the mail system. Principals in Stalwart follow the [JMAP Sharing](https://datatracker.ietf.org/doc/draft-ietf-jmap-sharing/09/) specification (as outlined in the RFC), which provides a standardized way to define and share resources among users. Each principal type represents a different category of entity and serves a distinct function within the system.

## Types

Stalwart supports a variety of principal types, which include both types defined in the JMAP Sharing RFC and additional types that are internal to Stalwart's architecture:

- [Individual](/docs/auth/principals/individual): Represents a single person who can send, receive, and manage email within the system.
- [Group](/docs/auth/principals/group): Represents a collection of individuals or other principals. This allows for easier management of permissions and access rights for multiple users at once.
- [List](/docs/auth/principals/list): Represents a mailing list, allowing communication to multiple recipients through a single address.
- [Domain](/docs/auth/principals/domain): Represents an entire domain within the mail system, enabling the management of domain-wide settings or resources.
- [Tenant](/docs/auth/authorization/tenants): Represents an organizational or logical division within the system, allowing multi-tenant setups.
- [Role](/docs/auth/authorization/roles): Represents a specific role that users or groups can assume, often used to define permissions or responsibilities.
- [API Key](/docs/auth/principals/api-key): Represents an API key that can be used to authenticate requests to the mail server.
- [OAuth Client](/docs/auth/principals/oauth-client): Represents an OAuth client that can be used to authenticate users or applications.
- **Resource**: Represents physical or digital resources, such as projectors, meeting rooms, or shared file storage.
- **Location**: Represents a physical location, such as an office or a conference room.
- **Other**: Represents any other type of principal that does not fall into the predefined categories.

## JMAP Sharing

According to the [JMAP Sharing specification](https://datatracker.ietf.org/doc/draft-ietf-jmap-sharing/09/), only certain principal types are defined. These include:

- **Individual**: A single person.
- **Group**: A group of other principals.
- **Resource**: A physical or digital resource (e.g., a projector).
- **Location**: A physical location (e.g., a conference room).
- **Other**: An undefined principal type that doesn't fall into any of the above categories.

While Stalwart includes additional principal types for its internal functionality (such as **list**, **domain**, **tenant**, and **role**), when principals are accessed using the JMAP Sharing protocol, any internal types that do not directly match a JMAP-defined type are mapped to the **other** principal type. This ensures compatibility with the JMAP Sharing specification while still allowing for the extended functionality provided by Stalwart.

In the following sections, we will explore each principal type in more detail, explaining their roles and how they can be configured within the Stalwart environment.
