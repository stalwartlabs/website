---
sidebar_position: 6
---

# Quotas

Quotas regulate resource consumption on the server, ensuring fair allocation of storage and object capacity across accounts and tenants. They define limits on the amount of data an account may hold, as well as the number of objects of a given kind it may create. Quotas can be enforced per account or, in multi-tenant deployments, per tenant.

Stalwart supports two broad categories of quota. Disk-usage quotas control the total storage consumed by an account's data, while object quotas cap the number of distinct items (messages, mailboxes, calendar events, address book entries, and similar) that an account can hold.

Per-account limits are carried on the [Account](/docs/ref/object/account) object (found in the WebUI under <!-- breadcrumb:Account --><!-- /breadcrumb:Account -->) via its [`quotas`](/docs/ref/object/account#quotas) field, which is a map from a `StorageQuota` key to a numeric limit. Per-tenant limits are carried on the [Tenant](/docs/ref/object/tenant) object (found in the WebUI under <!-- breadcrumb:Tenant --><!-- /breadcrumb:Tenant -->) via its [`quotas`](/docs/ref/object/tenant#quotas) field, which maps a `TenantStorageQuota` key to a numeric limit.

## Disk Usage Quotas

The total amount of disk space an account may consume is expressed through the `maxDiskQuota` entry in the account's [`quotas`](/docs/ref/object/account#quotas) map, in bytes. Tenants expose an equivalent entry on their [`quotas`](/docs/ref/object/tenant#quotas) map, capping total storage across the tenant's members.

When an external directory is used for authentication, the same disk-quota value can be surfaced from the directory. For LDAP directories this is controlled by the `attrQuota` attribute configured on the [Directory](/docs/ref/object/directory) object (found in the WebUI under <!-- breadcrumb:Directory --><!-- /breadcrumb:Directory -->); the attribute returns an integer number of bytes.

<!-- review: The previous LDAP reference documented an `attributes.quota` mapping. The LDAP variant of the Directory object lists attrClass, attrDescription, attrEmail, attrEmailAlias, attrMemberOf, attrSecret, and attrSecretChanged, but no attribute for the user's disk quota. Confirm whether the quota attribute has been removed, renamed, or moved. -->

Administrators can override per-account or per-tenant disk quota values from the WebUI or the JMAP API without changing the underlying directory entry.

## Object Quotas

Object quotas cap the number of items of each kind that can be stored under an account or tenant. The available keys are defined by the `StorageQuota` enum on the Account object, and by the `TenantStorageQuota` enum on the Tenant object. Relevant `StorageQuota` values include [`maxEmails`](/docs/ref/object/account#storagequota), [`maxMailboxes`](/docs/ref/object/account#storagequota), [`maxCalendars`](/docs/ref/object/account#storagequota), [`maxCalendarEvents`](/docs/ref/object/account#storagequota), [`maxAddressBooks`](/docs/ref/object/account#storagequota), [`maxContactCards`](/docs/ref/object/account#storagequota), [`maxFiles`](/docs/ref/object/account#storagequota), [`maxEmailIdentities`](/docs/ref/object/account#storagequota), [`maxEmailSubmissions`](/docs/ref/object/account#storagequota), [`maxSieveScripts`](/docs/ref/object/account#storagequota), [`maxPushSubscriptions`](/docs/ref/object/account#storagequota), [`maxAppPasswords`](/docs/ref/object/account#storagequota), and [`maxApiKeys`](/docs/ref/object/account#storagequota).

<!-- review: The previous docs listed default values for `object-quota.<name>` keys (mailbox 250, calendar 250, address-book 250, identity 20, email-submission 500, sieve-script 100, push-subscription 15, others unlimited). These are no longer documented on the Account reference page, which lists StorageQuota values without defaults. Confirm the current default for each object-quota kind so they can be stated here. -->

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
