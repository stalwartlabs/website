---
sidebar_position: 1
title: "Overview"
description: "How Stalwart decides what an authenticated account may do: permissions, roles, tenants, quotas and the sharing of individual resources."
---

Authentication establishes which account a request belongs to. Authorization is the next decision: whether that account may perform the request. A server shared by many people needs this second step, because an ordinary user should read their own mail but not create domains, and a help-desk operator should reset passwords but not read other users' mailboxes.

Stalwart makes this decision with permissions. A permission is a named right that guards one kind of action. Every action that can be restricted has one, from fetching a message over IMAP to creating a domain through the management API. An account may perform an action only when its effective permissions include the corresponding permission.

The effective permissions are not stored on the account as a single list. The server computes them from four sources:

- The [roles](/docs/auth/authorization/roles) assigned to the account, each a named set of permissions
- The permissions set directly on the account, which can add to or replace those of the roles
- In the Enterprise edition, the [tenant](/docs/auth/authorization/tenants) the account belongs to, which caps what its members may hold
- The permissions disabled at any of these levels, which are always removed

[Permissions](/docs/auth/authorization/permissions) describes this computation and the rules for granting permissions to other accounts. [Administrators](/docs/auth/authorization/administrator) describes how administrative access is assigned.

A single request can carry fewer permissions than its account holds. When the request comes from an OAuth application, its token carries only the part of the permissions that matches the [scopes](/docs/auth/oauth/scopes) the user granted. An [app password or API key](/docs/auth/authentication/) can narrow the permissions further, so a credential handed to one application never gives more access than that application needs.

## Permissions, sharing and quotas

Permissions decide which kinds of actions an account may take. They do not decide which individual resources of other accounts it may reach. Access to another account's mailbox, calendar, address book or folder is decided separately, by the access control lists that the owner sets when sharing the resource ([Sharing](/docs/collaboration/sharing)).

Permissions also say nothing about how much an account may store. That limit is set by [quotas](/docs/auth/authorization/quotas), which cap the disk space and the number of objects of each kind.
