---
sidebar_position: 3
title: "Group accounts"
description: "The Group variant of the Account object: shared mailboxes and resources, membership, roles, permissions and quotas of a group."
---

A team often needs a mailbox that several people read, such as `support@example.com`, or a calendar that the whole team shares. A group account provides this. It is a shared account: it has an address, its own mailboxes, calendars, address books and files, and a quota, just like a user account. Unlike a user account, it has no credentials and cannot sign in. Users who are members of the group reach the group's data through their own sign-in.

Groups are also a convenient target for sharing. Anything shared with the group becomes available to every member, so a resource can be shared with a whole team in one step.

A group is not a distribution list. Mail sent to the group's address is delivered to the group's own mailbox, not to each member. To distribute each message to a list of recipients, use a [mailing list](/docs/email/management/mailing-lists) instead.

A group is the `Group` variant of the [Account](/docs/ref/object/account) object (found in the WebUI under <!-- breadcrumb:Account --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg> Directory › Groups, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg> Directory › Accounts<!-- /breadcrumb:Account -->). The [reference page](/docs/ref/object/account) lists every field, and the sections below describe those that require a decision.

## Address

The group's address is formed in the same way as a user's. [`name`](/docs/ref/object/account#name-1) and [`domainId`](/docs/ref/object/account#domainid-1) form the address, from which the server sets the read-only `emailAddress`. [`aliases`](/docs/ref/object/account#aliases-1) adds further addresses, under the same rules as for [user accounts](/docs/auth/accounts/user#identity-and-address): each address belongs to exactly one account, group or mailing list. [`description`](/docs/ref/object/account#description-1) is the name shown for the group.

## Members

A group does not list its members. Membership is set on each user instead, in the user's `memberGroupIds` field. To add a user to a group, add the group's id to that user's `memberGroupIds` ([Managing accounts](/docs/auth/accounts/manage#add-or-remove-an-alias-or-a-group-membership)). Groups cannot be members of other groups.

Accounts from an LDAP, SQL or OpenID Connect directory get their memberships from the directory. When the directory names a group that does not exist yet, the server creates it.

## Roles and permissions

The roles and permissions of a group decide what the group account itself may do, for example whether it may receive mail. They are not passed on to the members, whose permissions come from their own accounts.

[`roles`](/docs/ref/object/account#roles-1) takes one of two values:

- `Default` applies the roles in the Authentication singleton's `defaultGroupRoleIds`, which by default contain the Group role.
- `Custom` applies a list of `roleIds`.

[`permissions`](/docs/ref/object/account#permissions-1) then adjusts the result, with the same `Inherit`, `Merge` and `Replace` modes as for users ([Permissions](/docs/auth/authorization/permissions)).

## Quotas and settings

[`quotas`](/docs/ref/object/account#quotas-1) limits the disk space and the objects of the group's own account, and `usedDiskQuota` reports the space in use. Messages that members store in the group's mailboxes count against the group's quota, not against their own.

[`locale`](/docs/ref/object/account#locale-1) and [`timeZone`](/docs/ref/object/account#timezone-1) record the group's language and time zone.

Two fields serve Enterprise features. [`memberTenantId`](/docs/ref/object/account#membertenantid-1) places the group in a [tenant](/docs/auth/authorization/tenants), and [`externalId`](/docs/ref/object/account#externalid-1) holds the identifier assigned by a [SCIM](/docs/auth/scim/) identity provider.

## Example

The following object creates the shared mailbox `support@example.com`, with the alias `help@example.com` and a 10 GB quota:

```json
{
  "@type": "Group",
  "name": "support",
  "domainId": "b",
  "description": "Customer support",
  "aliases": {
    "0": {"name": "help", "domainId": "b"}
  },
  "roles": {"@type": "Default"},
  "permissions": {"@type": "Inherit"},
  "quotas": {"maxDiskQuota": 10737418240}
}
```

Members then see the group's mailboxes in two ways, depending on the protocol: as shared folders in IMAP clients, and as a separate account in JMAP clients.
