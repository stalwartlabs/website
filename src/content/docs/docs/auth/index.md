---
sidebar_position: 1
title: "Overview"
---

The Access Control section covers the mechanisms that regulate how users and applications interact with the server. It includes authentication, authorization, and directory management.

Authentication verifies the identity of users or applications attempting to access the server. The server supports a variety of authentication methods, including the internal directory and integration with external systems such as OIDC, LDAP, and SQL for more complex environments.

Authorization determines which actions an authenticated user may perform. The permissions model allows administrators to assign and manage permissions for individuals, groups, tenants, and roles, ensuring that each principal has access only to the resources and functionality required for its role.

The information used for both authentication and authorization is stored in [directories](/docs/auth/backend/). A directory holds accounts, passwords, groups, mailing lists, and other metadata needed to manage and authenticate users and resources.

Directories contain [principals](/docs/auth/principals/), a term that refers to individuals, groups, resources, and other entities represented within the server. Principals form the basis on which the server models different roles and resources.

By default, Stalwart stores directory information internally, in the [built-in directory](/docs/auth/backend/internal). It also supports external directory services such as [LDAP](/docs/auth/backend/ldap) and [SQL](/docs/auth/backend/sql) databases, which allow integration with existing identity infrastructure.
