---
sidebar_position: 6
---

# Quotas

Quotas in **Stalwart** provide a mechanism for regulating resource consumption within the system, ensuring fair allocation of storage and object capacity across users and tenants. They define explicit limits on the amount of space or number of items that an account can hold, preventing misuse and maintaining optimal system performance. Quotas are an integral part of the directory and account management architecture, capable of being enforced at various levels, including per-account or per-tenant.

The quota system in Stalwart encompasses several types, most notably disk usage quotas and object quotas. **Disk usage quotas** control the total amount of disk space consumed by a user’s stored data, while **object quotas** constrain the number of distinct items—such as messages, mailboxes, calendar events, or address book entries—that can be created or stored. Together, these mechanisms offer administrators fine-grained control over resource utilization and service scaling.

## Disk Usage Quotas

Stalwart supports disk usage quotas that define the maximum amount of disk space an account or tenant may consume. These quotas can be applied globally or configured individually per account or [tenant](/docs/auth/authorization/tenants#quotas).

Disk usage quotas are typically defined in the directory from which users are authenticated, ensuring that quota policies are integrated into existing account management systems. This allows organizations to maintain consistency across authentication sources, such as LDAP or SQL directories, while enforcing storage limits seamlessly.

Administrators may also override these quota settings dynamically using the **WebAdmin interface** or the **REST API**, allowing on-demand adjustments without requiring changes to the underlying directory configuration. This capability is particularly useful in environments where user storage requirements vary or where temporary quota increases are needed for administrative or operational reasons.

## Object Quotas

Object quotas govern the total number of data objects that can be stored within an account. These objects encompass all logical entities managed by Stalwart, including emails, mailboxes, calendars, events, address books, contacts, and files. By enforcing object quotas, administrators can prevent excessive object creation, which could otherwise degrade system performance or lead to storage inefficiencies.

The default limits for each object type are defined through configuration settings following the convention `object-quota.<name>`, where `<name>` corresponds to the object category:


| **Object Quota Name**           |      **Default Value** |
| -------------------------------- | ---------------------: |
| `email`                          | Unlimited |
| `mailbox`                        |                    250 |
| `calendar`                       |                    250 |
| `calendar-event`                 | Unlimited |
| `address-book`                   |                    250 |
| `contact-card`                   | Unlimited |
| `file-node`                      | Unlimited |
| `identity`                       |                     20 |
| `email-submission`               |                    500 |
| `sieve-script`                   |                    100 |
| `push-subscription`              |                     15 |

Example:

```toml
[object-quota]
calendar = 300
address-book = 500
```

While these defaults establish baseline constraints across the system, they can be overridden on a per-user basis through either the **WebAdmin interface** or the **REST API**, providing administrators with granular control over individual user capacities. This design ensures a consistent yet flexible quota management model that aligns with the operational policies of diverse deployments.

:::tip Note

Object quotas are not being enforced yet for the `email`, `mailbox` and `file-node` types. This functionality is planned for version `0.15.0`.

:::
