---
sidebar_position: 2
title: "Provisioning models"
description: "Just-in-time provisioning compared with SCIM provisioning, and how the two interact when both are configured for the same domain."
---

When accounts are owned by an external system, Stalwart has to learn about them somehow. Two mechanisms are available, and they differ in who initiates the transfer. **Just-in-time provisioning** is a pull: Stalwart discovers an account at the moment it needs one and materialises a local record from whatever the external directory returned. **SCIM provisioning** is a push: the identity provider sends the account to Stalwart as soon as it exists upstream, and keeps sending changes for as long as the account lives.

This page describes both, explains why they cannot both be authoritative for the same domain, and gives the criteria for choosing between them. It applies to every external directory backend: [OpenID Connect](/docs/auth/backend/oidc), [LDAP](/docs/auth/backend/ldap), and [SQL](/docs/auth/backend/sql).

## Just-in-time provisioning

Just-in-time provisioning requires no configuration; it is what an external directory does by default. Stalwart queries the directory, receives an account record, and reconciles a local account against it. Two events trigger the query.

**Authentication** triggers it. When a user signs in and the external directory validates the credential, the returned record is synchronised into a local account. If no local account exists, one is created.

**Recipient resolution** triggers it too. When a message arrives for an address in a domain served by an LDAP or SQL directory, Stalwart asks the directory whether the address is a valid recipient, and a positive answer synchronises the account before the message is accepted. This second trigger is what makes just-in-time provisioning workable for LDAP and SQL: an account that has never signed in can still receive mail, because the directory can be queried for the address on demand.

OpenID Connect has no equivalent. The protocol offers no offline directory lookup, so there is no way to ask the provider whether an address is valid without an access token belonging to its owner. For an OIDC-backed domain, authentication is the only trigger, and the practical consequence is that an account which has never signed in does not exist as far as inbound mail is concerned.

### Fields reconciled on synchronisation

On each synchronisation Stalwart reconciles a defined set of fields, and the reconciliation is not symmetrical. The display name is overwritten whenever the directory supplies one that differs from the stored value. Email aliases are merged additively: aliases present in the directory are added, but aliases that have disappeared from the directory are left in place. Group membership, when the directory reports it, is replaced outright, and any group named in the record that does not yet exist locally is created.

Everything else on the account, including quotas, roles, and permissions, is local. The external directory has no representation for those fields, so they are set in Stalwart and survive every synchronisation.

### Limitations

Two limitations follow directly from the design and cannot be configured away.

Accounts are never removed. Synchronisation reacts to what the directory returns; it has no way to observe a deletion, because a deleted account simply stops appearing in query results. A mailbox therefore outlives the identity it belongs to, keeps accepting mail, and continues to count against licensed mailbox limits until an administrator removes it by hand.

Accounts are never suspended either. Some directories express a disabled account by refusing to authenticate it, which prevents sign-in but does not stop mail delivery to the mailbox. Nothing in the synchronisation path translates an upstream suspension into a local one.

## SCIM provisioning

SCIM inverts the direction. The identity provider watches its own directory and sends Stalwart the account when it is created, a `PATCH` when an attribute changes, `{"active": false}` when the account is suspended, and a `DELETE` when it is removed. Nothing is inferred from a login or a delivery attempt, so the full lifecycle including its end is represented.

The account exists from the moment the identity does. In practice this means the mailbox is ready during onboarding, before the new hire has signed in for the first time, and inbound mail addressed to them is accepted from the start. At the other end of the lifecycle, a suspension takes effect within the identity provider's synchronisation cycle.

SCIM also carries group membership explicitly, as a resource with its own identifier and its own lifecycle.

What SCIM does not do is authenticate anybody. It provisions accounts and nothing more, which is why it is deployed alongside an authentication mechanism.

## Choosing between them

For an **OIDC-backed domain**, SCIM is the recommended configuration. Just-in-time provisioning is workable only where every account signs in before anybody sends mail to it, which is rarely true in practice, and it offers no deprovisioning at all. Where SCIM is not available, accounts must be pre-created through the [WebUI](/docs/management/webui/), the JMAP API, or the [CLI](/docs/management/cli/), and removed by the same means.

For an **LDAP-backed or SQL-backed domain**, just-in-time provisioning is usually sufficient, because recipient resolution covers the pre-login gap. SCIM is worth adding when deprovisioning matters: when a compliance requirement calls for mailboxes to be suspended or deleted on termination, when licensed mailbox counts must reflect current headcount, or when the identity provider is already the system of record and its SCIM client is a smaller integration than a directory schema mapping.

The two models are not mutually exclusive across a server. The choice is made per domain, so a deployment can leave legacy domains on just-in-time provisioning while moving newer ones to SCIM.

## Authority when both are configured

Within a single domain the two models conflict, and the conflict is not benign. Both write the same account objects, so with both active every login would overwrite whatever SCIM had most recently set: the display name would revert to the value in the token claim, and group membership would be replaced wholesale by the claim-derived set, silently and on every sign-in.

Stalwart resolves this by making authority explicit; it does not attempt to merge the two. The [`allowScimProvisioning`](/docs/ref/object/domain#allowscimprovisioning) field on each [Domain](/docs/ref/object/domain) names which mechanism owns the accounts in that domain.

When the field is **enabled**, SCIM is authoritative. SCIM clients may create, update, suspend, and delete accounts in the domain. Just-in-time synchronisation degrades to a read: it resolves the address, confirms the account exists, and writes nothing. Creation through just-in-time provisioning is refused outright, so a user who authenticates before the identity provider has provisioned them receives a clean authentication failure, not a partially formed account that shadows the one SCIM is about to create.

When the field is **disabled**, which is the default, just-in-time provisioning behaves exactly as described above and SCIM writes to the domain are refused with `400 Bad Request` and a `scimType` of `invalidValue`. This applies to every address a request touches, so a request whose `userName` is in a SCIM-enabled domain but whose alias is in a domain that is not enabled is rejected in full.

Group accounts are created in the domain of the authenticated SCIM service principal, which must therefore itself be a SCIM-enabled domain. [Configuration](/docs/auth/scim/configuration) covers how that account is set up.

:::caution

Enabling `allowScimProvisioning` on a domain that already holds accounts does not migrate them. Existing accounts remain, but they stop being updated by just-in-time synchronisation, and the identity provider will not recognise them as its own until it has matched them by `userName` or has provisioned them itself. Where an identity provider is being introduced to an existing domain, run its initial synchronisation cycle and confirm that it matched the existing accounts and did not duplicate them, before relying on it.

:::

## Why undefined attributes are accepted

Stalwart accepts and discards the attributes it does not implement, and refuses only those belonging to no schema it recognises. The distinction is deliberate: a client sending `title` is exercising the standard schema and can be safely ignored, whereas a client sending `dispalyName` is misconfigured, and silently dropping the value would lose data on every synchronisation cycle without anyone noticing.

The [SCIM interoperability profile](https://datatracker.ietf.org/doc/draft-zollner-scim-interop-profile/) section 5.3 takes the opposite position and requires every undefined attribute to be rejected. Stalwart follows RFC 7644 where the two disagree, because the profile's rule makes provisioning from Okta, Entra ID and the Keycloak community extensions impossible without patching the client. [Schema handling](/docs/auth/scim/endpoints#schema-handling) states which attributes fall on each side of the line.
