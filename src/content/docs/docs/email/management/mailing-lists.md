---
sidebar_position: 1
title: "Mailing lists"
---

A mailing list distributes messages delivered to a single address to a set of recipients. Stalwart treats mailing lists as first-class directory objects rather than as aliases with multiple targets, so each list has its own identity, description, and set of alternate addresses independent of any user account.

Mailing lists are defined by the [MailingList](/docs/ref/object/mailing-list) object (found in the WebUI under <!-- breadcrumb:MailingList --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg> Directory › Mailing Lists<!-- /breadcrumb:MailingList -->). Each instance represents one distribution address; the object stores the primary local part, the domain it attaches to, an optional description, the set of recipients, and any alternate addresses that should resolve to the same list.

## Addressing

The primary address of a list is built from the [`name`](/docs/ref/object/mailing-list#name) local part and the [`domainId`](/docs/ref/object/mailing-list#domainid) reference, joined as `name@domain`. The server exposes the resulting address read-only through [`emailAddress`](/docs/ref/object/mailing-list#emailaddress), so the address updates automatically whenever the local part or the associated domain changes.

Additional addresses that should deliver to the same list are declared through [`aliases`](/docs/ref/object/mailing-list#aliases). Each entry is an `EmailAlias` nested object with its own local part, target domain, optional description, and `enabled` flag. Disabling an alias leaves the record in place but stops the address from resolving, which is useful for temporarily parking an old name before removing it.

Both the primary address and every alias must reference a domain that already exists in the directory. When the list belongs to a tenant, its domain must belong to the same tenant.

## Recipients

The set of destinations for a list is stored in [`recipients`](/docs/ref/object/mailing-list#recipients) as a flat list of email addresses. There is no separate membership object and no reference to Account or Group identifiers: local accounts are added to a list by their email address, just like external subscribers. Any valid email address is accepted, so a list can mix internal accounts, nested lists, and external subscribers without extra configuration.

## Tenancy

In multi-tenant deployments, a list is scoped to a tenant through [`memberTenantId`](/docs/ref/object/mailing-list#membertenantid). Administrators for that tenant can create and manage the list; the global administrator sees lists from every tenant. Leaving the field unset keeps the list outside any tenant boundary, which is the usual case for single-tenant installations.

## Managing lists

Lists can be created, updated, and removed through three interfaces that share the same underlying JMAP methods:

- **WebUI.** The Directory section of the WebUI offers a dedicated Mailing Lists view where operators fill in the local part, pick a domain, add aliases, and type or paste recipient addresses. The form is backed by the `x:MailingList/set` method and surfaces validation errors returned by the server.
- **CLI.** `stalwart-cli` exposes equivalent subcommands, which is convenient for bulk import or for scripting membership changes. For example, `stalwart-cli create mailing-list --field name=announce --field 'domainId=<Domain id>' --field 'recipients=["alice@example.org","bob@example.org"]'` creates a list in one call, and `stalwart-cli update mailing-list <id> --field 'recipients=[...]'` replaces the recipient set. The full command reference lives on the [MailingList object page](/docs/ref/object/mailing-list#cli).
- **JMAP API.** Integrations and external provisioning systems can call `x:MailingList/get`, `x:MailingList/query`, and `x:MailingList/set` directly. The methods are standard RFC 8620 shapes advertised under the `urn:stalwart:jmap` capability; each operation requires the matching `sysMailingList*` permission on the calling principal.

A typical JMAP request creating a list looks like:

```json
{
  "methodCalls": [
    [
      "x:MailingList/set",
      {
        "create": {
          "new1": {
            "name": "announce",
            "domainId": "<Domain id>",
            "description": "Company-wide announcements",
            "recipients": ["alice@example.org", "bob@example.org"],
            "aliases": [
              {"name": "news", "domainId": "<Domain id>", "enabled": true}
            ]
          }
        }
      },
      "c1"
    ]
  ],
  "using": ["urn:ietf:params:jmap:core", "urn:stalwart:jmap"]
}
```

Updates and deletions follow the same `x:MailingList/set` pattern with `update` or `destroy` arguments, and existing lists can be enumerated with `x:MailingList/query` filtered by free text or by tenant.

## Permissions

The `sysMailingListGet`, `sysMailingListQuery`, `sysMailingListCreate`, `sysMailingListUpdate`, and `sysMailingListDestroy` permissions gate each operation independently. Granting read-only visibility to a support role, for example, is done by assigning only `sysMailingListGet` and `sysMailingListQuery`. The same permissions apply regardless of whether the operation is issued from the WebUI, the CLI, or a direct JMAP client, since each surface delegates to the same method handlers.
