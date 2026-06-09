---
sidebar_position: 4
title: "Configuring the proxy"
---

The proxy is what makes the two deployments appear as a single server to clients. It terminates every protocol on the public ports, identifies the account behind each connection, and forwards the session to whichever deployment currently holds that account. This step writes its configuration but does not start it; like the previous steps, it has no effect on existing clients and carries no downtime.

The complete, annotated configuration for this scenario is published as the [Upgrading Stalwart](/docs/migration/proxy/examples/stalwart-upgrade/) example, and a ready-to-edit copy ships in the proxy repository as `resources/config.stalwart-upgrade.toml`. Rather than repeat the file here, this page explains the decisions behind it and the operational pieces that have to be put in place around it. The general reference for every option is the proxy [configuration](/docs/migration/proxy/configuration/) section.

## The shape of the configuration

Three choices define the migration topology and are worth understanding before editing the file.

The default destination is the old deployment. Routing is driven by a mapping table that lists, for each account, which deployment holds it, and any account absent from the table resolves to this default. At the start of the migration the table is empty and every account therefore resolves to the old server, which is correct because that is where every account still lives.

The pass-through destination for raw SMTP is the new deployment. Port 25 carries no login to route on, so it is handed in its entirety to a single backend. Directing it to the new server is what allows split delivery to work, since the new server is the one configured to deliver locally or relay as appropriate. This is independent of the per-account routing that governs the interactive protocols.

Both backends are addressed with `forwarding = "proxy"` and `proxy_protocol = true`, so the proxy announces the real client to each Stalwart deployment over a PROXY protocol header, matching the trust configured on the servers. On the HTTP leg, `forwarded = true` records the client address in the `Forwarded` and `X-Forwarded-For` headers.

The HTTP routing rules and the reasoning behind each one are described in detail in the example. In summary, the few login and discovery paths that are unique to each Stalwart version are pinned to the deployment that serves them, the shared OAuth token endpoint is split by the web client it came from, and every other request is routed by the account its credentials identify.

## The mapping file

The mapping file is the live record of which accounts have been migrated. It is referenced from the configuration and starts out containing only the two entries that let the web interfaces sign in, which map each version's OAuth client to its deployment:

```
webadmin          old
stalwart-webui    new
```

No account entries are added yet. Accounts are added to this file, or set through the management API, as they are migrated, which the [migration step](/docs/migration/guide/migrate-accounts/) covers. Keeping the file under version control or a backup is worthwhile, because it is the authoritative list of what has moved.

## Certificates and the public hostname

The proxy presents a certificate to clients for the public hostname they already use, so the certificate and key for that hostname are placed where the configuration expects them. This is the same certificate the old server presents today; reusing it means clients see no change. The proxy terminates both implicit TLS and STARTTLS with it.

The public hostname itself is not repointed at the proxy yet. That repointing, whether through DNS or by moving the address, happens at the cutover, so that the switch from the old server to the proxy is a single deliberate action.

## The management endpoint

The proxy exposes a small management API, protected by a bearer token, for changing mappings, invalidating caches and disconnecting accounts. A token of at least the configured minimum length is generated and stored in the file the configuration names, and the endpoint is bound to a loopback or management-only address. The migration step uses this API to cut accounts over, so confirming the token works against the running proxy is part of the next stage.

## Rollback

The proxy has only been configured, not started, and the public hostname still resolves to the old server, so there is nothing serving clients to roll back. Abandoning the migration here means the configuration file is simply never used. The proxy is first put into the serving path in the next step, which is also where the rollback procedure for a live proxy is described.
