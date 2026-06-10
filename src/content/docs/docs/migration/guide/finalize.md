---
sidebar_position: 8
title: "Finalizing the migration"
---

When every account has been migrated and validated, the source is empty and the proxy no longer has any account to route to it. The migration is completed by taking the proxy out of the path, letting the new deployment answer clients directly, and decommissioning the source. This step is deliberately unhurried: there is value in running the new deployment behind the proxy for a period after the last account has moved, so that any latent problem surfaces while the source is still available as a fallback.

## Confirming the source is empty

Before anything is removed, the mapping table is reviewed to confirm that no account still resolves to the source and that the default destination is the only thing pointing there. The proxy's statistics and the mail logs of the new server confirm that inbound mail is now being delivered locally rather than relayed: once the last account has moved, the relay to the source should fall silent. A quiet relay and a mapping table in which every migrated account points to the new deployment together indicate that the source holds nothing that is still in use.

## Letting the new deployment answer directly

The public hostname, which currently resolves to the proxy, is repointed to the new deployment. From that moment clients connect to the new server directly. The source is no longer in the serving path. The new server already advertises the public hostname as its own address, set during its configuration, so no change to what it tells clients is needed; the address now simply resolves to it.

The new server continues to accept these direct connections without difficulty. The trusted-network setting that enables the PROXY protocol applies only to connections from the proxy's address, and clients connect from their own addresses, so their connections are treated as ordinary direct connections. Once the new server is answering on the public hostname and clients have been confirmed to reach it, the proxy is stopped.

## Removing the migration configuration from the new server

With the proxy gone and the source about to be decommissioned, the configuration that existed only to support the migration is removed from the new server. The relay route to the source is deleted, the outbound strategy's `route` expression is returned to its default so that delivery no longer considers the source, and relaying for unknown recipients is switched off on each domain so that mail for an address that does not exist is once again rejected rather than accepted for a relay that no longer has a destination:

```bash
stalwart-cli update Domain example.org --field allowRelaying=false
```

The trusted-network setting that allowed the proxy to forward connections can also be cleared, since the proxy no longer exists, though leaving it in place is harmless because no traffic arrives from that address any longer.

## Decommissioning the source

The source is shut down only after a period of confidence that the new deployment is operating correctly on its own. Until it is shut down it remains a complete, if increasingly stale, copy of every account as it stood at the moment each was migrated, which is the last line of defence should a problem be discovered. Once it is shut down that fallback is gone, so the decision to decommission it is the point of no return for the migration and is taken deliberately rather than as a routine cleanup.

## Rollback

Rollback at this stage depends on whether the source is still running. While it is, returning to the side-by-side arrangement is possible: the proxy is started again, the public hostname is repointed to it, and the system is back to the state in which accounts can be routed to either server. Reversing an individual account additionally requires carrying back any data it accumulated on the new server, exactly as described in the account migration step.

Once the source has been decommissioned, the migration is final. There is no longer a server to roll back to, so the confidence period before decommissioning is the last opportunity to reverse the change. For this reason the source is kept available, even if idle, until the new deployment has been trusted in production long enough to be sure of it.
