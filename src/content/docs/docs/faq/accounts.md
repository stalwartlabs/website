---
title: "Accounts, domains and addresses"
description: "Frequently asked questions about domain names, aliases, catch-all and plus addressing, sending as another address, and creating, suspending and administering accounts."
sidebar_position: 3
---

## Domains

### Why is my internal domain name rejected?

Stalwart accepts a domain name only when it ends in a recognised suffix. That is either a suffix on the Public Suffix List, the public registry of top-level and other registrable suffixes, or one of the reserved names `test`, `localhost`, `local`, `internal`, `lan`, `home`, `corp`, `intranet`, `private` and `localdomain`. Any other name is refused with `Invalid domain name`. No setting overrides the rule. See [Accepted domain names](/docs/domains/#accepted-domain-names).

### What happens automatically when I add a domain?

That depends on three settings of the [Domain](/docs/ref/object/domain) object, each chosen when the domain is created. `dkimManagement`, `certificateManagement` and `dnsManagement` decide whether the server looks after the domain's DKIM keys, its TLS certificate and its DNS records. Each is either `Automatic` or `Manual`.

With automatic DKIM management, the server creates the signing keys and starts signing at once. Automatic certificate and DNS management depend on other configuration: they need an existing ACME provider and DNS provider, and once those are in place, the server obtains the certificate and publishes the DNS records itself. With manual management, the administrator provides the keys, the certificate or the records instead. See [Domain settings](/docs/domains/#domain-settings).

### Why can't I delete a domain ("objectIsLinked")?

A domain cannot be deleted while other objects still refer to it. These are its DKIM signatures, the accounts, groups and mailing lists in the domain, aliases in the domain held by other accounts, and the server's default domain (`defaultDomainId` in [SystemSettings](/docs/ref/object/system-settings)).

The deletion then fails with `objectIsLinked`. The error lists the objects that still refer to the domain, so the administrator knows which ones to delete or change first. Note that deleting a domain does not remove its records at the DNS provider. See [Deleting a domain](/docs/domains/#deleting-a-domain).

## Addresses and aliases

### How do I add an alias, a catch-all or plus addressing?

Each of the three is configured in a different place, because each works at a different level:

- An alias is an additional address of an account, listed in the account's `aliases`.
- A catch-all address is set per domain, in `catchAllAddress`. It receives the mail for addresses of the domain that match no account, group or mailing list.
- Plus addressing lets a user receive mail at variants such as `jane+news@example.com`. It is enabled by default and configured per domain in [`subAddressing`](/docs/ref/object/domain#subaddressing). In its `Enabled` mode, the server removes everything from the first `+` in the local part before it looks up the recipient. A `Custom` rule replaces this behaviour with an expression.

See [Addresses, aliases and catch-all](/docs/domains/addresses).

### Can two accounts share one address?

No. Every address, whether primary or alias, belongs to exactly one account, group or mailing list. To deliver one address to several users, assign it to a group, whose members share its mailbox, or to a [mailing list](/docs/email/management/mailing-lists). See [Aliases](/docs/domains/addresses#aliases).

### Can users send from a domain alias?

Yes, but with a limitation in authentication. A message sent from an alias domain is DKIM-signed with the keys of the primary domain, so its signature has `d=` set to the primary domain's name. That signature does not align with the alias domain in the `From` header, which means DMARC can pass for that mail only through SPF.

Automatic DNS management, likewise, publishes records for the primary domain only. A domain that has to send under its own name, with its own DKIM keys, therefore needs its own Domain object rather than an alias. See [Domain aliases](/docs/domains/addresses#domain-aliases).

### How do I let a user send as a group or shared address?

Add the user to the group that owns the address. The `mustMatchSender` setting of the SMTP AUTH stage, whose default is <!-- default:MtaStageAuth.mustMatchSender -->`true`<!-- /default -->, requires the envelope sender to be one of the authenticated account's addresses. The addresses of the groups the account belongs to count as its own, so group membership is enough. See [Sender verification](/docs/mta/inbound/auth#sender-verification).

### Why can users still put any address in the From header?

Because the `mustMatchSender` check looks at the envelope only. It compares the envelope sender, the address given in the SMTP `MAIL FROM` command, with the account's addresses, and it does not check the `From` header of the message.

To require a matching header as well, add a system Sieve script at the DATA stage. The example [Require the From header to match the sender of authenticated mail](/docs/sieve/examples#require-the-from-header-to-match-the-sender-of-authenticated-mail) shows one. See [Sender verification](/docs/mta/inbound/auth#sender-verification).

## Accounts and permissions

### How do I create user accounts?

There are three ways to create an account by hand: in the WebUI under Management › Directory › Accounts, with `stalwart-cli create Account/User`, or with an `x:Account/set` call to the JMAP management API.

Accounts from an external directory need no such step. Accounts of an LDAP, SQL or OpenID Connect directory are created automatically when the user first signs in, and an identity provider can create accounts ahead of time through [SCIM](/docs/auth/scim/) provisioning. See [Create a user](/docs/auth/accounts/manage#create-a-user).

### How do I add an alias or group to an existing account through the CLI or JMAP?

Send a JMAP patch, which contains only the changes to make. How a change is addressed depends on the kind of field:

- Group memberships are a set, so setting `memberGroupIds/<id>` to `true` adds a group, and setting it to `null` removes it.
- Aliases are a list, whose entries are addressed by position, such as `aliases/1`.

Sending the whole field instead replaces its contents. Sending an array where a patch is expected is rejected with `invalidPatch`. See [Add or remove an alias or a group membership](/docs/auth/accounts/manage#add-or-remove-an-alias-or-a-group-membership) and [Object encoding](/docs/configuration/object-encoding).

### Can I import existing password hashes?

Yes. When a secret is a well-formed hash in one of the supported formats, the server stores it as given, and the user keeps the existing password. The formats include Argon2, bcrypt, scrypt, PBKDF2, SHA-512 and MD5 crypt, and the braced LDAP formats such as `{SSHA}`. Any other value is treated as a clear-text password and hashed. See [Supported hash formats](/docs/auth/authentication/password#supported-hash-formats).

### How do I suspend an account without deleting it?

Withdraw its permissions. An account has no enabled flag, so suspension works through `disabledPermissions`: disable the `authenticate` permission there to stop the account from signing in, and add `emailReceive` and `emailSend` as required. Without `emailReceive`, delivery to the account fails with `This account is not authorized to receive email.`

An identity provider that provisions accounts through SCIM suspends one differently, by setting `active` to `false`. See [Suspend an account](/docs/auth/accounts/manage#suspend-an-account).

### Why do I get "You are not authorized to grant permissions"?

An account can grant only the permissions it holds itself. Creating, changing or deleting an account therefore requires the caller to hold every effective permission of the target account, and superusers are not exempt from this rule. The error names up to five of the permissions that the caller is missing. See [Granting permissions to other accounts](/docs/auth/authorization/permissions#granting-permissions-to-other-accounts).

### Can an administrator delete its own account?

Yes. Nothing prevents an administrator from deleting the account it is signed in with, so create a second administrator account first. If no account with the System Administrator role remains, the only way to manage the server again is the [recovery administrator](/docs/configuration/recovery-mode#recovery-administrator). See [Delete an account](/docs/auth/accounts/manage#delete-an-account).

### Do users have to sign in again after I change their role or permissions?

No. A change to roles, permissions, groups or tenants applies at the account's next HTTP request, and open IMAP and POP3 sessions pick it up shortly after.

A cluster without a [coordinator](/docs/cluster/coordination/) is slower to follow. There, other nodes apply the change at once only to sign-ins with a password or app password. Requests with OAuth tokens or API keys, and changes to the permissions inside a role, keep the previous permissions on those nodes until the cached entry is evicted or the node restarts.

Changes to the default role sets, such as `defaultUserRoleIds`, are the exception to all of this. They need a `ReloadSettings` action, and an `InvalidateCaches` action for accounts already in use. See [Propagation of changes](/docs/auth/authorization/roles#propagation-of-changes).
