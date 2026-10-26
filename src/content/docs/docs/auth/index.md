---
sidebar_position: 1
title: "Overview"
description: "Access control in Stalwart: accounts, authentication, authorization, the OAuth server, directories and SCIM provisioning."
---

Every request that reaches Stalwart, whether a mail client fetching messages, a calendar application saving an event or a script changing the configuration, acts on behalf of an account. Before the server carries out the request, it answers three questions. The first is which account the request belongs to. The second is how the client proves that it may act for that account. The third is what that account is allowed to do. Access control is the part of the server that answers these questions, and this section describes each of them.

The answers start with the account. Accounts are stored on the server, because the mailboxes, calendars and settings they own live there. An account is either created on the server by an administrator or provisioned from an external identity system, such as an LDAP directory or a corporate identity provider.

A client then proves which account it acts for by presenting a credential. Stalwart accepts several kinds: passwords, app passwords for individual applications, API keys for scripts and services, and OAuth tokens, which let an application act for a user without ever holding the user's password.

Once the account is known, its roles and permissions decide which actions the request may perform. A permission authorizes one kind of action, and a role groups permissions so that the same level of access can be given to many accounts at once.

## Section contents

The section is organised by these questions, followed by the systems that supply accounts from outside the server:

- [Accounts](/docs/auth/accounts/) describes the user and group accounts that own mail and data, with their addresses, credentials and group memberships, and gives the procedures to create, suspend and delete them.
- [Authentication](/docs/auth/authentication/) describes the credentials the server accepts on each protocol: passwords and their policy, two-factor authentication, app passwords and API keys.
- [Authorization](/docs/auth/authorization/) describes permissions, roles, administrators, tenants and quotas.
- [OAuth and OpenID Connect](/docs/auth/oauth/) describes the built-in authorization server, from which mail applications, the WebUI and third-party applications obtain their tokens, and the OpenID Connect provider built on it.
- [Directories](/docs/auth/backend/) describes where accounts and passwords come from: the internal directory, or an LDAP, SQL or OpenID Connect directory.
- [SCIM](/docs/auth/scim/) describes how an identity provider provisions accounts and groups on the server (Enterprise).

## Accounts owned by an external system

When accounts are managed in an external system, the server still needs a local copy of each one, so that it has somewhere to store the account's mail and settings. These local accounts arrive in one of two ways. Either the server creates each account itself when the directory first returns it, or the identity provider pushes every account to the server through SCIM. [Provisioning models](/docs/auth/scim/provisioning) explains the difference between the two, which applies to LDAP, SQL and OpenID Connect directories alike.

## Self-service

Users do not need an administrator for the credentials of their own account. In the [Account Manager](/docs/management/webui/account-manager), they change their password, set up two-factor authentication, create app passwords and API keys, and review the applications connected to their account.
