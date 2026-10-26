---
sidebar_position: 2
title: "Provisioning models"
description: "Just-in-time provisioning compared with SCIM provisioning, and how the two interact when both are configured for the same domain."
---

When an external system owns the accounts of a domain, the server still needs a local account for each user. The external system may be an LDAP directory, an SQL database or an identity provider, but in every case the mailboxes, quotas and settings are stored on the server, and they must belong to an account there. Provisioning is the process that creates and maintains these local accounts.

Stalwart offers two provisioning models, and they differ in who initiates the transfer. With just-in-time provisioning, the server takes the initiative: it creates an account when it first needs one, from what the external directory returns. With SCIM provisioning, the identity provider takes the initiative: it sends each account to the server when the account is created upstream, and it sends every later change until the account is deleted.

This page describes both models, explains why they cannot both be authoritative for one domain, and helps choose between them. It applies to every external directory: [OpenID Connect](/docs/auth/backend/oidc), [LDAP](/docs/auth/backend/ldap) and [SQL](/docs/auth/backend/sql).

## Just-in-time provisioning

Just-in-time provisioning needs no configuration, because it is what every external directory does. The server queries the directory and receives an account record. It then creates the local account from that record, or updates it if it already exists. Two events trigger the query:

- A sign-in. When a user signs in and the directory validates the credential, the server applies the record the directory returns to the local account. The account is created if it does not exist.
- An incoming message, for LDAP and SQL directories. When a message arrives for an address of a domain the directory serves, the server asks the directory whether the address exists. A positive answer creates or updates the account before the message is accepted. As a result, an account that has never signed in can still receive mail.

An OpenID Connect directory has no equivalent of the second trigger, because the protocol offers no way to look up an address without a token of its owner. For such a domain, a sign-in is the only trigger. An account that has never signed in therefore does not exist on the server, and mail for it is rejected.

### Fields updated from the directory

Each synchronisation updates a fixed set of fields, and it does not treat them all the same way:

- The display name is overwritten whenever the directory supplies a different one.
- Aliases are only added. Aliases present in the directory are added to the account, but aliases that disappeared from the directory are kept.
- Group memberships, when the directory reports them, are replaced as a whole. Groups that do not exist yet are created.

Every other field is local, including quotas, roles and permissions. The directory has no representation for these fields, so they are set on the server and survive every synchronisation.

### Limitations

Just-in-time provisioning reacts to what the directory returns, and two limitations follow from that:

- Accounts are never removed. A deleted entry simply stops appearing in the directory's answers, so the server has nothing to observe. The mailbox remains and keeps counting against the licensed account limit until an administrator deletes the account. With an OpenID Connect directory, it also keeps receiving mail.
- Accounts are never suspended. A directory that disables an account refuses its sign-ins, but nothing in the synchronisation turns that refusal into a suspension of the local account. Mail delivery to the account therefore continues.

## SCIM provisioning

:::tip[Enterprise feature]
This feature is available in the [Enterprise edition](/docs/server/enterprise) of Stalwart.
:::

With SCIM, the identity provider watches its own directory and reports each change to the server as it happens:

- When an account is created, the provider sends the new account.
- When an attribute changes, it sends a `PATCH`.
- When the account is suspended, it sends `{"active": false}`.
- When the account is removed, it sends a `DELETE`.

Nothing is inferred from a sign-in or a delivery attempt, so the whole lifecycle of the account reaches the server. The account exists from the moment the identity does. Its mailbox is ready, and receives mail, before the new user signs in for the first time. A suspension takes effect at the identity provider's next synchronisation. Group memberships are carried explicitly, as group resources with their own identifiers.

An account has no separate enabled flag, so a suspension through SCIM works through permissions. It disables the account's `authenticate` permission, which takes precedence over the account's roles. No credential of the account is then accepted, but its data is kept and it continues to receive mail ([Attribute mapping](/docs/auth/scim/mapping#administrative-status)). Administrators suspend accounts with the same mechanism. They usually disable `emailReceive` and `emailSend` as well, so that the account also stops receiving and sending mail ([Suspend an account](/docs/auth/accounts/manage#suspend-an-account)).

SCIM authenticates nobody. It only provisions accounts, so it is always deployed together with a directory that verifies sign-ins.

## Choosing between them

The right model depends on the kind of directory that serves the domain.

For a domain of an OpenID Connect directory, SCIM is the recommended configuration. Just-in-time provisioning works there only if every account signs in before anyone sends mail to it, and it offers no deprovisioning at all. Without SCIM, an administrator creates the accounts in advance in the [WebUI](/docs/management/webui/), with the [CLI](/docs/management/cli/) or through the management API, and deletes them by the same means.

For a domain of an LDAP or SQL directory, just-in-time provisioning is usually sufficient, because recipient lookups cover the time before the first sign-in. SCIM becomes worth adding when deprovisioning matters, for example in these situations:

- A compliance requirement calls for mailboxes to be suspended or deleted when employment ends.
- The licensed account count must follow the number of employees.
- The identity provider is already the system of record.

The choice is made per domain, so one server can keep some domains on just-in-time provisioning and move others to SCIM.

## Authority when both are configured

Within one domain, the two models conflict, because both write the same accounts. If both were active, every sign-in would overwrite what SCIM last set. The display name would revert to the value of the token claim, and the group memberships would be replaced by those derived from the claims.

The server therefore assigns authority explicitly, through the [`allowScimProvisioning`](/docs/ref/object/domain#allowscimprovisioning) field of each [Domain](/docs/ref/object/domain):

- When the field is enabled, SCIM is authoritative. SCIM clients may create, update, suspend and delete the accounts of the domain. Synchronisation at sign-in only reads: it resolves the address, confirms that the account exists and writes nothing. Because it never creates an account, a user who signs in before the identity provider has provisioned them gets an authentication failure rather than a partial account.
- When the field is disabled, just-in-time provisioning works as described above, and SCIM writes to the domain are refused with `400 Bad Request` and the `scimType` `invalidValue`. The check covers every address in a request. A request whose `userName` is in an enabled domain but whose alias is in a domain that is not enabled is therefore refused as a whole.

Groups created through SCIM are placed in the domain of the provisioning account, so that domain must be enabled as well ([Configuration](/docs/auth/scim/configuration#provisioning-account)).

:::caution
Enabling `allowScimProvisioning` on a domain that already has accounts does not migrate them. The existing accounts remain, but they are no longer updated at sign-in. The identity provider treats them as its own only after it has matched them by `userName`, or after it has provisioned them itself. When introducing an identity provider to an existing domain, run its first synchronisation and confirm that it matched the existing accounts and did not create duplicates before relying on it.
:::

## Undefined attributes

Identity providers often send more attributes than a mail server stores, and occasionally they send attributes that no schema defines. The server distinguishes the two cases. It accepts and discards the attributes of the standard SCIM schemas that it does not store, and it refuses only attributes that belong to no schema it knows.

The distinction protects against silent data loss. A client that sends `title` uses the standard schema, and the attribute can safely be ignored. A client that sends `dispalyName` is misconfigured. Discarding that value would lose data at every synchronisation without notice, so the server refuses it instead.

Section 5.3 of the [SCIM interoperability profile](https://datatracker.ietf.org/doc/draft-zollner-scim-interop-profile/) requires every undefined attribute to be rejected. Where the profile and RFC 7644 disagree, Stalwart follows RFC 7644, because the profile's rule would make provisioning from Okta, Microsoft Entra ID and the Keycloak SCIM extensions impossible without changes to the clients. [Schema handling](/docs/auth/scim/endpoints#schema-handling) lists which attributes are accepted and which are refused.
