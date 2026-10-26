---
next:
  link: /docs/migration/guide/troubleshooting/
  label: Troubleshooting
sidebar_position: 8
title: "Finalizing the migration"
description: "Confirm that no account remains on the source, let the new deployment answer clients directly, remove the migration settings and decommission the source."
---

When every account has been moved and validated, no account resolves to the source any longer, and the migration can be completed. Completing it takes four actions: taking the proxy out of the path, letting the new deployment answer clients directly, removing the settings that existed only for the migration, and decommissioning the source.

There is no need to hurry this step. Running the new deployment behind the proxy for a while after the last account has moved lets latent problems surface while the source is still available as a fallback.

## Confirming that the source is no longer used

Before anything is removed, confirm that nothing still depends on the source:

- The mapping file, or the mapping store, has an entry pointing to the new deployment for every account, and `GET /mappings?identifier=<account>` on the proxy's [management API](/docs/migration/proxy/management/api) reports `"routed_to_default": false` for each of them.
- The relay to the source has stopped: the new deployment's delivery log shows no more messages sent through the `source` route, because every recipient is now local.
- The source's own logs show no more client sign-ins.
- A last catch-up import and export has run for every account after the last account moved, so that mail delivered on the source to moved accounts has been copied.

## Letting the new deployment answer directly

The public hostname still resolves to the proxy. Repoint it to the new deployment, and clients connect to the new deployment directly from then on. Nothing that the new deployment tells clients changes, because it already advertises the public hostname as its URL: `STALWART_PUBLIC_URL` was set to it.

Clients connect from their own addresses, which are not in the trusted networks of the new deployment, so their connections are served as ordinary direct connections. Once clients are confirmed to reach the new deployment, and the old address's TTL has expired, stop the proxy.

## Removing the migration settings

Several settings on the new deployment existed only for the migration, and are now removed. The following list covers every change that the earlier steps made:

- **Split delivery.** Restore the [`route`](/docs/ref/object/mta-outbound-strategy#route) expression of MtaOutboundStrategy from the value saved in [Configuring split delivery](/docs/migration/guide/configure-new/#configuring-split-delivery). Then delete the `source` relay route, so that delivery no longer considers the source. The order matters: restoring the expression first ensures that no recipient is routed to a route that no longer exists:

  ```bash
  stalwart-cli update MtaOutboundStrategy --file route-before.json
  stalwart-cli query MtaRoute --where name=source --fields id
  stalwart-cli delete MtaRoute --ids <route-id>
  ```

- **Relaying for unknown recipients.** Disable `allowRelaying` on each domain, so that mail for an address that does not exist is rejected again. The field is updated by the domain's identifier:

  ```bash
  stalwart-cli query Domain --where name=example.org --fields id
  stalwart-cli update Domain <domain-id> --field allowRelaying=false
  ```

- **Catch-all addresses.** Create the catch-all addresses that were held back to keep split delivery working.
- **Bulk import settings.** Revert the rate limit, allowed IP address and JMAP limit changes made for Vandelay in [Preparing for bulk import](/docs/migration/guide/configure-new/#preparing-for-bulk-import).
- **Relaying for the source.** Remove the source's address from the relay rule, if outbound mail of the source was routed through the new deployment.
- **Trusted proxy networks.** Remove the proxy's address from `proxyTrustedNetworks` in SystemSettings, then restart the new deployment, since a reload does not apply the change. Leaving it is harmless as long as no traffic arrives from that address. A host that later took over the address, however, would be able to announce arbitrary client addresses.
- **Public URL.** Keep `STALWART_PUBLIC_URL` at the public hostname, or restore its previous value if it was set to something else for the migration.
- **DNS TTLs.** Raise the TTLs lowered for the cutover back to their usual values.

Two more items go away without a separate step. On the proxy, the mapping entries for the administrator account and for the web clients' OAuth client identifiers (`admin`, `webadmin` and the URLs of the new WebUI's client metadata documents) are no longer needed, and they disappear with the proxy. On a Dovecot and Postfix source, the master user is removed when the source is decommissioned, or immediately if the source stays in service for another purpose.

## Decommissioning the source

Shut the source down only after a period of confidence that the new deployment works on its own. Until then, the source holds a copy of every account as it stood when that account moved, which is the last fallback if a problem is discovered. Once the source is shut down, that fallback is gone, so decommissioning is the point of no return of the migration.

The Vandelay archives kept from the account moves are a copy of the same state. Delete them according to the retention rules that apply to mail data.

## Rollback

While the source is still running, the side-by-side arrangement can be restored. Start the proxy again and repoint the public hostname to it, and accounts can again be routed to either server. Moving an individual account back also requires carrying back the data that it accumulated on the new deployment, as described in the [rollback of an account](/docs/migration/guide/migrate-accounts/#rollback).

Once the source has been decommissioned, the migration is final.
