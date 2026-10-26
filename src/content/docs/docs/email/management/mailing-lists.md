---
sidebar_position: 1
title: "Mailing lists"
description: "Create distribution addresses that deliver each message to a set of local and external recipients, and how Stalwart expands them."
---

Organisations often need one address that reaches several people: `team@example.org` for the members of a team, or `announce@example.org` for a company-wide distribution. A mailing list provides this. It is an address that delivers each message it receives to a fixed set of recipients.

In Stalwart, a list is a directory object of its own, the [MailingList](/docs/ref/object/mailing-list), found in the WebUI under <!-- breadcrumb:MailingList --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg> Directory › Mailing Lists<!-- /breadcrumb:MailingList -->. It has its own address, aliases and recipients, independent of any account.

A list has no mailbox, so messages sent to it are not stored anywhere except in the mailboxes of its recipients. That distinguishes it from a group. To give several users access to one shared mailbox, use a [group](/docs/auth/accounts/group) instead. [Addresses, aliases and catch-all](/docs/domains/addresses) compares the options.

## Addresses

The primary address of a list is formed from two fields: the local part in [`name`](/docs/ref/object/mailing-list#name), and the domain referenced by [`domainId`](/docs/ref/object/mailing-list#domainid). The server exposes the result, read-only, in [`emailAddress`](/docs/ref/object/mailing-list#emailaddress), and updates it when either field changes.

A list can be reached at further addresses, given in [`aliases`](/docs/ref/object/mailing-list#aliases). Each alias has its own local part, domain, optional description and an `enable` flag. Disabling an alias keeps the record but stops the address from resolving, so mail sent to it is handled as for any address that does not exist. An alias can therefore be retired temporarily without losing it.

Every address of a list must belong to a domain that exists on the server. When the list belongs to a tenant, the domain must also belong to the same tenant.

## Recipients

The recipients of a list are the email addresses in [`recipients`](/docs/ref/object/mailing-list#recipients). The list refers to no account or group identifiers, so local accounts are added by their address, in the same way as external subscribers. Any valid address is accepted.

A recipient can be the address of another mailing list, which lets lists be built from smaller ones. Nested lists are expanded recursively. Each address is delivered to once, even when it appears in several of the lists. A list that contains itself, directly or through another list, is expanded only once, so a loop does not multiply the message.

## List expansion and delivery

A list is expanded early, when the SMTP server accepts the list address at `RCPT TO`. The address is replaced by the list's recipients, and the client receives a single `250 2.1.5 OK` reply for it. Each local recipient then receives the message in its mailbox, and each external recipient is queued for delivery like any other outgoing message.

A list address that is disabled, or that does not exist, is rejected with `550 5.1.1 Mailbox does not exist.`, unless a catch-all address or a relay rule accepts it.

The message is delivered unchanged, which has three consequences:

- The envelope sender stays the original sender. Delivery status notifications for recipients that cannot be reached are therefore returned to the person who wrote to the list, not to a list owner.
- No list headers, such as `List-Id` or `List-Unsubscribe`, are added, and the subject is not modified.
- Each copy carries the list address as its original recipient (the DSN `ORCPT` parameter), so a notification identifies the list the recipient was reached through.

Posting is not restricted to members. Any sender that may send mail to the list's domain may write to the list.

External recipients are affected by sender authentication. The original sender is kept, and Stalwart does not rewrite it with the Sender Rewriting Scheme (SRS), a technique that replaces the envelope sender with an address of the forwarding server. A copy relayed to an external recipient therefore comes from a server that the sender's SPF record does not authorise. The receiving server may then fail the SPF check. When the sender's domain also publishes a DMARC policy, and the message carries no aligned DKIM signature, the receiving server may reject or quarantine the copy.

The membership of a list can also be revealed over SMTP. The `EXPN` command returns the members of a list when the [`EXPN` extension](/docs/mta/inbound/ehlo) is enabled.

## Managing lists

Lists are managed in the WebUI, with the CLI or over the JMAP API. All three use the same `x:MailingList/get`, `x:MailingList/query` and `x:MailingList/set` methods, under the `urn:stalwart:jmap` capability.

Each operation requires the corresponding permission: `sysMailingListGet`, `sysMailingListQuery`, `sysMailingListCreate`, `sysMailingListUpdate` or `sysMailingListDestroy`. The permissions can be granted separately, so a role that holds only the first two can view lists but not change them.

The following command creates a list with two recipients:

```sh
stalwart-cli create MailingList --field name=announce --field 'domainId=<Domain id>' \
  --field 'recipients={"alice@example.org":true,"bob@example.org":true}'
```

The following JMAP request creates the same list with an additional address, `news@`:

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
            "recipients": {"alice@example.org": true, "bob@example.org": true},
            "aliases": {
              "0": {"name": "news", "domainId": "<Domain id>", "enable": true}
            }
          }
        }
      },
      "c1"
    ]
  ],
  "using": ["urn:ietf:params:jmap:core", "urn:stalwart:jmap"]
}
```

Changes apply immediately. Replacing the recipient set, for example with `stalwart-cli update MailingList <id> --field 'recipients={...}'`, takes effect for the next message sent to the list. The [MailingList reference](/docs/ref/object/mailing-list#cli) lists the remaining commands.

## Tenants

:::tip[Enterprise feature]
Tenants are available in the [Enterprise edition](/docs/server/enterprise) of Stalwart.
:::

In a multi-tenant installation, each organisation manages its own lists. [`memberTenantId`](/docs/ref/object/mailing-list#membertenantid) assigns a list to a tenant, whose administrators can then manage it. The system administrator sees the lists of every tenant. A list without a tenant is outside any tenant boundary, which is the usual case for single-tenant installations.
