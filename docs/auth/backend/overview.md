---
sidebar_position: 1
---

# Overview

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

External directories are represented by the [Directory](/docs/ref/object/directory) object (found in the WebUI under <!-- breadcrumb:Directory --><!-- /breadcrumb:Directory -->). The object is multi-variant, with one variant per backend kind. The variants supported are the LDAP variant, the SQL variant, and the OIDC variant.

Use of the internal directory is indicated by leaving the [`directoryId`](/docs/ref/object/authentication#directoryid) field unset on the [Authentication](/docs/ref/object/authentication) singleton (found in the WebUI under <!-- breadcrumb:Authentication --><!-- /breadcrumb:Authentication -->). To delegate authentication to an external directory, set `directoryId` to the id of the desired Directory object.

### Connection pool

The LDAP variant of the Directory object maintains its own connection pool. The pool is configured through [`poolMaxConnections`](/docs/ref/object/directory#poolmaxconnections), [`poolTimeoutCreate`](/docs/ref/object/directory#pooltimeoutcreate), [`poolTimeoutRecycle`](/docs/ref/object/directory#pooltimeoutrecycle), and [`poolTimeoutWait`](/docs/ref/object/directory#pooltimeoutwait) on the object. `poolMaxConnections` caps the number of simultaneous connections, while the three timeout fields cap how long the pool waits to create, recycle, and hand out a connection, respectively.

### Default directory

The default external directory used for authentication is selected by setting [`directoryId`](/docs/ref/object/authentication#directoryid) on the [Authentication](/docs/ref/object/authentication) singleton to the id of the relevant Directory object.
