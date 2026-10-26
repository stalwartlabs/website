---
sidebar_position: 2
title: "Internal"
description: "The internal directory: accounts, passwords and addresses managed directly on the Stalwart server."
---

The internal directory is Stalwart's own store of users. It keeps accounts, passwords, addresses and group memberships on the server itself, as [Account](/docs/ref/object/account) objects in the [data store](/docs/storage/data). It is the right choice when Stalwart is the only system that manages the mail users.

Every account feature is available with the internal directory. This includes two features that external directories do not offer: [two-factor authentication](/docs/auth/authentication/2fa), and self-service password changes in the Account Manager.

## Configuration

The internal directory needs no Directory object. It is in use whenever [`directoryId`](/docs/ref/object/authentication#directoryid) on the [Authentication](/docs/ref/object/authentication) singleton is empty, which is the case on a new installation. The singleton is found in the WebUI under <!-- breadcrumb:Authentication --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" /><path d="M14 13.12c0 2.38 0 6.38-1 8.88" /><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" /><path d="M2 12a10 10 0 0 1 18-6" /><path d="M2 16h.01" /><path d="M21.8 16c.2-2 .131-5.354 0-6" /><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" /><path d="M8.65 22c.21-.66.45-1.32.57-2" /><path d="M9 6.8a6 6 0 0 1 9 5.2v2" /></svg> Authentication › General<!-- /breadcrumb:Authentication -->.

In the Enterprise edition, each domain can also name its own directory. A domain whose own `directoryId` is empty uses the default directory as well ([Per-domain directories](/docs/auth/backend/#per-domain-directories)).

## Accounts and passwords

Accounts are created and changed in the WebUI, with the CLI or through the management API, as described in [Managing accounts](/docs/auth/accounts/manage).

The server never stores a password in clear text. It stores a hash computed with the algorithm selected in `passwordHashAlgorithm`, which is <!-- default:Authentication.passwordHashAlgorithm -->`argon2id`<!-- /default --> unless changed. Every new password is also checked against the [password policy](/docs/auth/authentication/password#password-policy) before it is accepted.

Accounts migrated from another system do not need new passwords. Their existing hashes can be imported as they are, provided they use one of the [supported formats](/docs/auth/authentication/password#supported-hash-formats).
