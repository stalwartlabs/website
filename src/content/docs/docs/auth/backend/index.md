---
sidebar_position: 1
title: "Overview"
---

Directories are the central repository for user account information. They hold the accounts, passwords, email addresses, and settings used to authenticate users and validate message recipients. Their primary functions are:

- **Authentication**: verifying account credentials so that only authorised users can access their mailboxes.
- **Email and domain validation**: confirming that a recipient address exists on the server.
- **Account information**: storing account metadata such as the account name, disk quota, and group memberships.

## Directory types

Stalwart can either use its own internal directory or delegate authentication and account lookup to an external directory service. The choice depends on the environment and on any existing identity infrastructure.

### Internal directory

The internal directory stores account information inside Stalwart itself. It is intended for deployments where Stalwart is the primary system managing email users and no external identity system is in place. All account management tasks (creating accounts, updating passwords, setting quotas) are carried out directly on the server.

### External directory

Stalwart can also be configured against an external directory such as LDAP or an SQL database. This mode is useful when user accounts are already managed by another system and those accounts should be reused by the mail server. Account changes are made in the external directory; Stalwart queries the directory to authenticate users and to resolve email addresses. The external directory must be kept consistent to avoid stale or inconsistent state.

## Configuration

External directories are represented by the [Directory](/docs/ref/object/directory) object (found in the WebUI under <!-- breadcrumb:Directory --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" /><path d="M14 13.12c0 2.38 0 6.38-1 8.88" /><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" /><path d="M2 12a10 10 0 0 1 18-6" /><path d="M2 16h.01" /><path d="M21.8 16c.2-2 .131-5.354 0-6" /><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" /><path d="M8.65 22c.21-.66.45-1.32.57-2" /><path d="M9 6.8a6 6 0 0 1 9 5.2v2" /></svg> Authentication › Directories<!-- /breadcrumb:Directory -->). The object is multi-variant, with one variant per backend kind. The variants supported are the LDAP variant, the SQL variant, and the OIDC variant.

Use of the internal directory is indicated by leaving the [`directoryId`](/docs/ref/object/authentication#directoryid) field unset on the [Authentication](/docs/ref/object/authentication) singleton (found in the WebUI under <!-- breadcrumb:Authentication --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" /><path d="M14 13.12c0 2.38 0 6.38-1 8.88" /><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" /><path d="M2 12a10 10 0 0 1 18-6" /><path d="M2 16h.01" /><path d="M21.8 16c.2-2 .131-5.354 0-6" /><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" /><path d="M8.65 22c.21-.66.45-1.32.57-2" /><path d="M9 6.8a6 6 0 0 1 9 5.2v2" /></svg> Authentication › General<!-- /breadcrumb:Authentication -->). To delegate authentication to an external directory, set `directoryId` to the id of the desired Directory object.

### Connection pool

The LDAP variant of the Directory object maintains its own connection pool. The pool is configured through [`poolMaxConnections`](/docs/ref/object/directory#poolmaxconnections), [`poolTimeoutCreate`](/docs/ref/object/directory#pooltimeoutcreate), [`poolTimeoutRecycle`](/docs/ref/object/directory#pooltimeoutrecycle), and [`poolTimeoutWait`](/docs/ref/object/directory#pooltimeoutwait) on the object. `poolMaxConnections` caps the number of simultaneous connections, while the three timeout fields cap how long the pool waits to create, recycle, and hand out a connection, respectively.

### Default directory

The default external directory used for authentication is selected by setting [`directoryId`](/docs/ref/object/authentication#directoryid) on the [Authentication](/docs/ref/object/authentication) singleton to the id of the relevant Directory object.
