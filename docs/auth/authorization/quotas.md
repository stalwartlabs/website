---
sidebar_position: 6
---

# Quotas

Quotas regulate resource consumption on the server, ensuring fair allocation of storage and object capacity across accounts and tenants. They define limits on the amount of data an account may hold, as well as the number of objects of a given kind it may create. Quotas can be enforced per account or, in multi-tenant deployments, per tenant.

Stalwart supports two broad categories of quota. Disk-usage quotas control the total storage consumed by an account's data, while object quotas cap the number of distinct items (messages, mailboxes, calendar events, address book entries, and similar) that an account can hold.

Per-account limits are carried on the [Account](/docs/ref/object/account) object (found in the WebUI under <!-- breadcrumb:Account --><!-- /breadcrumb:Account -->) via its [`quotas`](/docs/ref/object/account#quotas) field, which is a map from a `StorageQuota` key to a numeric limit. Per-tenant limits are carried on the [Tenant](/docs/ref/object/tenant) object (found in the WebUI under <!-- breadcrumb:Tenant --><!-- /breadcrumb:Tenant -->) via its [`quotas`](/docs/ref/object/tenant#quotas) field, which maps a `TenantStorageQuota` key to a numeric limit.

## Disk Usage Quotas

The total amount of disk space an account may consume is expressed through the `maxDiskQuota` entry in the account's [`quotas`](/docs/ref/object/account#quotas) map, in bytes. Tenants expose an equivalent entry on their [`quotas`](/docs/ref/object/tenant#quotas) map, capping total storage across the tenant's members.

Quota values are held exclusively on the Account and Tenant objects; the server does not read disk-quota attributes from external directories. Even when authentication is delegated to LDAP or SQL, quotas must be configured through the Account object (or the Tenant object for tenant-wide caps) from the WebUI or the JMAP API.

## Object Quotas

Object quotas cap the number of items of each kind that can be stored under an account or tenant. The available keys are defined by the `StorageQuota` enum on the Account object, and by the `TenantStorageQuota` enum on the Tenant object. Relevant `StorageQuota` values include [`maxEmails`](/docs/ref/object/account#storagequota), [`maxMailboxes`](/docs/ref/object/account#storagequota), [`maxCalendars`](/docs/ref/object/account#storagequota), [`maxCalendarEvents`](/docs/ref/object/account#storagequota), [`maxAddressBooks`](/docs/ref/object/account#storagequota), [`maxContactCards`](/docs/ref/object/account#storagequota), [`maxFiles`](/docs/ref/object/account#storagequota), [`maxEmailIdentities`](/docs/ref/object/account#storagequota), [`maxEmailSubmissions`](/docs/ref/object/account#storagequota), [`maxSieveScripts`](/docs/ref/object/account#storagequota), [`maxPushSubscriptions`](/docs/ref/object/account#storagequota), [`maxAppPasswords`](/docs/ref/object/account#storagequota), and [`maxApiKeys`](/docs/ref/object/account#storagequota).

A value set under an account's [`quotas`](/docs/ref/object/account#quotas) map overrides the server-wide default for that key. The defaults themselves live on the service-specific singletons rather than on the Account object: mail-related caps such as [`maxMessages`](/docs/ref/object/email#maxmessages), [`maxMailboxes`](/docs/ref/object/email#maxmailboxes), [`maxSubmissions`](/docs/ref/object/email#maxsubmissions), and [`maxIdentities`](/docs/ref/object/email#maxidentities) are defined on the [Email](/docs/ref/object/email) singleton, calendar caps such as [`maxCalendars`](/docs/ref/object/calendar#maxcalendars) and [`maxEvents`](/docs/ref/object/calendar#maxevents) on the [Calendar](/docs/ref/object/calendar) singleton, address-book caps such as [`maxAddressBooks`](/docs/ref/object/address-book#maxaddressbooks) and [`maxContacts`](/docs/ref/object/address-book#maxcontacts) on the [AddressBook](/docs/ref/object/address-book) singleton, and file-storage caps such as [`maxFiles`](/docs/ref/object/file-storage#maxfiles) on the [FileStorage](/docs/ref/object/file-storage) singleton. Consult those objects for the server-wide default applied when an account does not set its own value.

To restrict the number of calendars and address books that a single account may create, set the relevant entries on the account's [`quotas`](/docs/ref/object/account#quotas) field:

```json
{
  "quotas": {
    "maxCalendars": 300,
    "maxAddressBooks": 500
  }
}
```

Default maximum numbers of per-account app passwords and API keys are also controlled globally through [`maxAppPasswords`](/docs/ref/object/authentication#maxapppasswords) and [`maxApiKeys`](/docs/ref/object/authentication#maxapikeys) on the [Authentication](/docs/ref/object/authentication) singleton (found in the WebUI under <!-- breadcrumb:Authentication --><!-- /breadcrumb:Authentication -->).
