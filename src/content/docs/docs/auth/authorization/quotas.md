---
sidebar_position: 6
title: "Quotas"
description: "Disk and object quotas for accounts and tenants: where they are set, the server-wide defaults, what clients see when a quota is reached, and how usage is recalculated."
---

On a shared server, one account must not be able to consume the resources of all the others. Quotas set that limit. They cap how much an account may store and how many objects of each kind it may hold, so that a single account cannot exhaust the server's storage or degrade it with an unbounded number of mailboxes or events.

Stalwart has two kinds of quota. A disk quota caps the bytes an account uses for messages, files and other data. An object quota caps the number of items of one kind, such as messages, mailboxes, calendars or app passwords. In the Enterprise edition, [tenants](/docs/auth/authorization/tenants) have quotas of their own as well, which cap the combined usage of all their members.

## Account quotas

The limits of an account are set in the `quotas` field of its [Account](/docs/ref/object/account) object (found in the WebUI under <!-- breadcrumb:Account --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg> Directory › Groups, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg> Directory › Accounts<!-- /breadcrumb:Account -->). The field is a map from a quota type to a number. `maxDiskQuota` is given in bytes, and every other type is a count. The following value limits an account to 10 GB, 300 calendars and 500 address books:

```json
{
  "quotas": {
    "maxDiskQuota": 10737418240,
    "maxCalendars": 300,
    "maxAddressBooks": 500
  }
}
```

The two kinds of quota behave differently when the account does not set them. An account has no disk quota at all unless `maxDiskQuota` is set. An object quota, on the other hand, always has a limit: a type that the account does not set falls back to a server-wide default. Each default is defined on the singleton of the service that owns the objects:

| Objects | Default set on |
|---|---|
| Messages, mailboxes, identities, submissions, masked addresses, public keys | [Email](/docs/ref/object/email) (`maxMessages`, `maxMailboxes`, `maxIdentities`, `maxSubmissions`, `maxMaskedAddresses`, `maxPublicKeys`) |
| Calendars, events, participant identities, event notifications | [Calendar](/docs/ref/object/calendar) (`maxCalendars`, `maxEvents`, `maxParticipantIdentities`, `maxEventNotifications`) |
| Address books and contacts | [AddressBook](/docs/ref/object/address-book) (`maxAddressBooks`, `maxContacts`) |
| Files and folders | [FileStorage](/docs/ref/object/file-storage) (`maxFiles`, `maxFolders`) |
| App passwords and API keys | [Authentication](/docs/ref/object/authentication) (`maxAppPasswords`, `maxApiKeys`) |

The [`StorageQuota`](/docs/ref/object/account#storagequota) enumeration lists every quota type an account accepts. The read-only `usedDiskQuota` field reports the space the account currently uses.

Quotas are always configured on the server. External directories such as LDAP and SQL do not supply them, even when they supply the account itself.

A group account has its own quotas. The messages that members store in the group's mailboxes count against the group, not against the members who stored them.

## Exceeded quotas

When an operation would exceed a quota, the server refuses it. Each protocol reports the refusal in its own way, so the message a user sees depends on the protocol:

- IMAP answers `APPEND` with `NO [OVERQUOTA] Quota exceeded.` and `COPY` or `MOVE` with `NO [OVERQUOTA] Mailbox quota exceeded`. Creating a mailbox beyond the mailbox count fails with `NO [OVERQUOTA] There are too many mailboxes, please delete some before adding a new one.`.
- JMAP reports the error `overQuota` on the object that could not be created, with a description such as `You have exceeded your account quota.`
- ManageSieve answers with `NO (QUOTA/MAXSIZE) "Quota exceeded."`.

Incoming mail is treated differently. SMTP accepts mail for an account over its quota and attempts the delivery later. The message stays in the queue with the temporary error `451 4.3.0 Mailbox over quota.` and is retried according to the [delivery schedule](/docs/mta/outbound/schedule). Delivery succeeds once space is freed. If the message expires first, the sender receives a delivery failure notice.

A tenant's disk quota produces its own messages. When the tenant's disk quota is exhausted, IMAP reports `NO [OVERQUOTA] Organization disk quota exceeded.` and the queue reports `Organization over quota.`.

## Recalculating usage

The server updates the disk usage of an account as data is added and removed. The stored figure can still become wrong, for example after a restore. In that case it can be recomputed with a [task](/docs/management/tasks-actions/tasks), and the task type depends on the scope:

- An `AccountMaintenance` task of type `recalculateQuota` recomputes one account.
- A `StoreMaintenance` task of type `resetUserQuotas` resets the counters of all accounts.
- In the Enterprise edition, a `TenantMaintenance` task of type `recalculateQuota` recomputes a tenant.
