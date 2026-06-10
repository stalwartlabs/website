---
sidebar_position: 9
title: "Migrating from another system"
---

Moving to Stalwart from an existing mail server does not require choosing between a disruptive all-at-once cutover and weeks of manual exporting and importing. Stalwart includes a [migration proxy](/docs/migration/proxy) and a [one-shot migration tool](/docs/migration/import-export) that work together to move accounts onto Stalwart gradually and with **zero downtime**, so that users keep sending and receiving mail throughout the transition.

The migration proxy sits in front of both the existing server and the new Stalwart deployment and routes each connection to whichever one currently holds that account, based on the credentials the client already presents. Because the routing decision is made from the login itself, users keep the same hostname, ports and passwords, and nothing on their devices needs to be reconfigured. The migration tool copies an account's data, its mail, calendars, contacts, filters and stored files, from the existing server into Stalwart, one account at a time. Each account is moved by copying its data and then switching it over, and the switch remains reversible until the migration is finalized and the old server is retired.

This approach works whether the migration is from a legacy or self-hosted mail server or from an older version of Stalwart. The [migration overview](/docs/migration/) explains how the proxy and the migration tool fit together, and leads into a complete step-by-step procedure.
