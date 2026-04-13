---
sidebar_position: 8
---

# Sharing

Stalwart includes support for **resource sharing**, allowing users and groups to collaborate efficiently through shared access to calendars, address books, and file storage. Whether for team scheduling, centralized contact management, or document collaboration, sharing is a core feature designed to support both individual and organizational workflows.

Stalwart supports **group calendars**, **shared address books**, and **shared file folders**, which can be accessed and managed by multiple users with appropriate permissions. In addition to group-based resources, users can also share their **personal calendars, contact lists, and files** with others on the system.

Sharing is implemented using the **JMAP Sharing extension** for JMAP clients, as well as the **WebDAV ACL (Access Control List) extension**, which is supported by many CalDAV and CardDAV clients. This allows users to manage who can read, write, or administer their resources directly from a compatible client interface, without requiring server-side configuration changes. Permissions can be granted at various levels—ranging from full access to read-only viewing—providing flexibility for different collaboration scenarios.

With built-in sharing capabilities and standards-based access controls, Stalwart makes it easy to enable collaborative features across calendars, contacts, and files while maintaining clear control over access and visibility.

## Group Resources

Stalwart makes it easy to enable **shared calendars, address books, and file folders** for teams or departments by using **group-based resources**. These resources are automatically available to all members of a group and provide a convenient way to collaborate without requiring manual sharing configurations.

To enable group resources, administrators simply need to **create the appropriate groups** within the system and **add users to those groups**. Once added, users will automatically gain access to the group’s shared resources. The next time they log in through a supported CalDAV, CardDAV, or WebDAV client, they will see the **group calendars, address books, or file folders** listed alongside their personal resources.

Group resources behave just like individual resources but are accessible to all group members. Permissions are managed centrally, and updates made by one user are immediately visible to others in the group. This simplifies coordination and promotes shared ownership of data within teams.

There is no special configuration required to enable group resource visibility—membership alone is sufficient to grant access, making group-based collaboration both straightforward and scalable.


## Sharing Resources

In addition to group-based collaboration, Stalwart allows **individual users to share their own calendars, address books, and file folders** with other users on the system. This enables flexible, ad-hoc collaboration without requiring administrative involvement, and is ideal for scenarios like sharing a personal calendar with a colleague or granting a teammate access to a specific file directory.

To share a resource, users must use a JMAP client with **JMAP Sharing** support or a **CalDAV, CardDAV, WebDAV client** (depending on whether they are sharing a calendar, address book, or file folder) that supports the **WebDAV ACL (Access Control List) extension**. Both JMAP Sharing and WebDAV ACL allow users to assign fine-grained permissions (such as read-only or full access) to other users or groups, directly from within the client interface.

An important consideration when sharing resources is how users discover others in the system. In "groupware" terminology, a **principal** is any entity that can be granted access to a resource—typically a user, group, or system-defined role. By default, for **privacy and security reasons**, Stalwart **does not allow users to list all available principals** on the system. This means that while users can share resources with others they know, they won't be able to browse or search the full list of users or groups unless explicitly permitted to do so.

To control directory visibility, administrators can enable the `sharing.allow-directory-query` setting. When enabled, this allows authenticated users to perform principal lookups via JMAP Sharing and WebDAV ACL, making it possible to discover and share resources with other users on the system. However, this option should only be turned on in controlled environments—either when all users belong to the same organization or when they are isolated into clearly defined [tenants](/docs/auth/authorization/tenants). Enabling directory queries in mixed or unsegregated environments may expose sensitive user information.

Example:

```toml
[sharing]
allow-directory-query = true
```

For a more granular approach, administrators can also use permissions to control who can browse user directories, view group membership, or discover available principals across the system. For details on the specific permissions involved, refer to the [Permissions documentation](/docs/auth/authorization/permissions).


## Sharing Limits

To help prevent over-sharing and keep access lists at a manageable size, administrators can define limits on how many individual users a single item can be shared using the `sharing.max-shares-per-item` setting. For example, changing this setting to `50` would limit each shared calendar, contact list, or file to fifty recipients. Adjust this value according to the scale and collaboration needs of your deployment.

Example:

```toml
[sharing]
max-shares-per-item = 50
```

## Share History Retention

JMAP Sharing records when items are shared under a data type called `ShareNotification`. Each notification captures who shared what with whom, the previous and new ACLs, and other contextual details. The `sharing.max-history` setting determines how long these records are retained before they are automatically deleted.

For instance, setting `sharing.max-history` to `"30d"` keeps share notifications for thirty days, after which they are purged. This allows you to balance audit requirements with database size and performance considerations.

Example:

```toml
[sharing]
max-history = "30d"
```

## WebDAV Assisted Discovery

Stalwart organizes user and group resources using a clear and hierarchical path structure. Each **principal**—a user, group, or other addressable entity in the WebDAV system—has its own namespace under which resources are stored. For example, the calendars for a user named John are located under `/dav/cal/john`, while the address book for a group named Sales is under `/dav/card/sales`. Within each principal's path, multiple **collections** can be created, such as `/dav/cal/john/work` and `/dav/cal/john/personal`, allowing users to manage different calendars or contact lists independently.

To support standards-based client discovery, Stalwart lists all of a user’s accessible calendar and address book collections in the **`calendar-home-set`** and **`addressbook-home-set`** properties of the user's principal. These properties indicate to the client which paths should be queried to retrieve the resources available to the authenticated user, including both personal and shared collections.

However, many CalDAV and CardDAV clients assume a simplified model where **all resources are located under a single path**, such as `/dav/cal/john` for all of John's calendars, whether personal or shared. While convenient for the client, this design creates a fundamental limitation: it prevents support for **shared or group resources**, since the client sees only one path and assumes the user’s scope is confined to it.

To assist clients that rely on this simplified discovery model, Stalwart offers an optional feature called **WebDAV Assisted Discovery**. When the `dav.collection.assisted-discovery` setting is enabled, Stalwart modifies its behavior for `PROPFIND` requests sent to the `/dav/cal` and `/dav/card` paths. Specifically, when a client sends a **Depth: 1** `PROPFIND` request to these paths, Stalwart treats the request as if it were made with **Depth: 2**. This means the server will include in its response **all personal and shared collections** available to the authenticated user, even if those collections belong to different principals or groups.

This assisted discovery mechanism can make it easier for some clients to locate shared resources that they would otherwise miss. However, it comes with a significant caveat: **not all clients expect this behavior**, and enabling it may cause issues or inconsistencies in clients that strictly follow the WebDAV specification. For this reason, the setting is **disabled by default**, and it is recommended to keep it that way unless required for specific interoperability cases.

Instead of relying on assisted discovery, users encountering problems with resource visibility should be encouraged to **report these limitations to the developers** of the affected clients. Proper support for WebDAV ACL and discovery properties like `calendar-home-set` and `addressbook-home-set` ensures a more robust, scalable, and standards-compliant experience in the long term.
