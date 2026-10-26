---
title: "Object metadata"
description: "Key and value annotations that clients store on mailboxes, messages, calendars, contacts and files through JMAP, IMAP METADATA and WebDAV dead properties, and the limits and permissions that apply."
sidebar_position: 11
---

Clients often need to remember small pieces of information about the objects they work with: a label colour on a mailbox, a client-specific setting on a calendar, a property that a WebDAV client records on a file. Object metadata are these annotations, stored on the server together with the object.

Stalwart keeps the annotations of each object in one store, and exposes that store through three protocols:

- JMAP exposes them through the `metadata` and `privateMetadata` properties, described in the Internet-Draft [draft-ietf-jmap-metadata](https://datatracker.ietf.org/doc/draft-ietf-jmap-metadata/) (JMAP Object Metadata). The server advertises support as the `urn:ietf:params:jmap:metadata` capability.
- IMAP exposes them through the METADATA extension ([RFC 5464](https://www.rfc-editor.org/rfc/rfc5464)), which covers mailbox and server annotations, and through LIST-METADATA ([RFC 9590](https://www.rfc-editor.org/rfc/rfc9590)), which returns the annotations together with the mailbox list.
- WebDAV, CalDAV and CardDAV expose them as dead properties ([RFC 4918](https://www.rfc-editor.org/rfc/rfc4918)). A dead property is one that a client sets with `PROPPATCH` and that the server stores without interpreting it.

Metadata come in two kinds. Shared metadata are visible to everyone who can access the object. Private metadata are visible only to the user who stored them.

The limits and permissions are set on the [Metadata](/docs/ref/object/metadata) singleton (found in the WebUI under <!-- breadcrumb:Metadata --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › Metadata<!-- /breadcrumb:Metadata -->). The defaults suit most deployments.

## Objects that carry metadata

[`dataTypes`](/docs/ref/object/metadata#datatypes) lists the JMAP data types whose objects carry metadata. Out of the box, every type that supports metadata is listed: <!-- default:Metadata.dataTypes -->`AddressBook`, `Calendar`, `CalendarEvent`, `ContactCard`, `Email`, `FileNode`, `Mailbox` and `SieveScript`<!-- /default -->. Removing a type from the set removes the metadata properties from that type in JMAP. When no type is left, the JMAP capability is no longer advertised.

JMAP metadata are stored under namespaces, which keep the data of different applications apart. Applications store their own data under vendor namespaces, named in the form of a domain name such as `client.example.com`. Stalwart accepts vendor namespaces unless [`vendorNamespaces`](/docs/ref/object/metadata#vendornamespaces) is turned off. Turning it off leaves JMAP clients no namespace to write to, so the JMAP capability is then no longer advertised either.

Users can store private metadata unless [`privateMetadata`](/docs/ref/object/metadata#privatemetadata) is turned off.

## Limits

Without bounds, a client could grow the metadata of an object without limit. The size and number of entries are therefore limited per object:

| Setting | Default | Limits |
|---|---|---|
| [`maxEntrySize`](/docs/ref/object/metadata#maxentrysize) | <!-- default:Metadata.maxEntrySize -->8 KiB<!-- /default --> | Bytes in one entry: a JMAP namespace value, an IMAP annotation or a WebDAV dead property |
| [`maxSize`](/docs/ref/object/metadata#maxsize) | <!-- default:Metadata.maxSize -->64 KiB<!-- /default --> | Bytes of shared metadata on one object |
| [`maxPrivateSize`](/docs/ref/object/metadata#maxprivatesize) | <!-- default:Metadata.maxPrivateSize -->16 KiB<!-- /default --> | Bytes of private metadata one user stores on one object |
| [`maxEntries`](/docs/ref/object/metadata#maxentries) | <!-- default:Metadata.maxEntries -->128<!-- /default --> | Entries in the metadata of one object |
| [`maxDepth`](/docs/ref/object/metadata#maxdepth) | <!-- default:Metadata.maxDepth -->8<!-- /default --> | Nesting depth of a JMAP namespace value; empty means no limit |
| [`maxQueryScan`](/docs/ref/object/metadata#maxqueryscan) | <!-- default:Metadata.maxQueryScan -->50000<!-- /default --> | Annotated objects a JMAP query scans for a text condition on metadata |

A change that does not make the metadata of an object larger is always accepted. Lowering a limit therefore does not prevent clients from removing entries that exceed it.

Metadata also count towards the storage quota. Shared metadata count towards the quota of the object's owner, and private metadata towards the quota of the user who stored them.

A write that exceeds a limit is refused, and each protocol reports the refusal in its own way:

- JMAP returns `invalidProperties` on the offending property, with a description such as `Metadata size <n> exceeds the maximum of <m> bytes.` An account over quota receives `overQuota`. A query with a text condition over more than `maxQueryScan` objects is refused with `unsupportedFilter`.
- IMAP returns `[METADATA MAXSIZE <n>]` for an entry or a set of entries that is too large, and `[METADATA TOOMANY]` when the object would have too many entries. It returns `[METADATA NOPRIVATE]` when private entries are not allowed, and `[OVERQUOTA]` when the account is over quota.
- WebDAV answers the `PROPPATCH` with status `507` for the affected property, with the description `Property value is too long` or `Property storage limit exceeded`.

## IMAP

The `METADATA` and `LIST-METADATA` capabilities are advertised after authentication, and only to users who hold the `imapMetadataGet` permission.

Besides the annotations of mailboxes, IMAP defines server annotations, which describe the server as a whole. Two of them come from the Metadata object, and clients can read them but not change them:

- `/shared/comment` comes from [`imapServerComment`](/docs/ref/object/metadata#imapservercomment).
- `/shared/admin` comes from [`imapServerAdmin`](/docs/ref/object/metadata#imapserveradmin), for example `mailto:postmaster@example.org`.

Neither is set by default.

The private annotation `/private/specialuse` of a mailbox, defined in [RFC 6154](https://www.rfc-editor.org/rfc/rfc6154), reflects the mailbox's role: Sent, Drafts, Trash and so on. Setting the annotation changes the role.

## Permissions

Access to metadata is controlled by the following [permissions](/docs/auth/authorization/permissions):

| Permission | Allows |
|---|---|
| `jmapMetadataGet` | Reading metadata over JMAP; the capability is advertised only to users who hold it |
| `jmapMetadataSet` | Writing shared metadata over JMAP |
| `jmapMetadataPrivate` | Reading and writing private metadata over JMAP |
| `imapMetadataGet` | The IMAP `GETMETADATA` and `SETMETADATA` commands and `LIST` with metadata |
| `imapMetadataSet` | Setting shared annotations over IMAP |
| `imapMetadataPrivate` | Reading and setting private annotations over IMAP |
| `sysMetadataGet`, `sysMetadataUpdate` | Reading and changing the Metadata object |

`SETMETADATA` requires `imapMetadataGet` for every annotation. It also requires `imapMetadataSet` for shared annotations, or `imapMetadataPrivate` for private ones.

The permissions decide what kind of access a user may have at all. The access rights of the object apply in addition: reading metadata requires read access to the object, and writing shared metadata requires the right to modify it.
