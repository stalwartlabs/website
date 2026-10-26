---
sidebar_position: 3
title: "Configuring the new deployment"
description: "Create the migrated domains on the new deployment, prepare signing keys and DNS, configure split delivery, trust the proxy and advertise the public URL."
---

The new deployment has two roles during the migration. It receives the accounts as they are moved. From the cutover onwards, it is also the public mail exchanger for the migrated domains: it delivers mail for moved accounts and relays the rest to the source. This step prepares it for both roles. The new deployment receives no traffic yet, so the changes cause no downtime.

The examples use the [command-line interface](/docs/management/cli/). They expect the connection details of the new deployment in the environment, so that each `stalwart-cli` invocation picks them up:

```bash
export STALWART_URL=https://new.internal.example.org
export STALWART_USER=admin
export STALWART_PASSWORD='<administrator password>'
```

Every object changed here can also be edited in the WebUI.

The examples in this guide reach the servers at internal hostnames, and these often present a self-signed certificate or one issued by an internal certificate authority. Installing that authority on the administrative hosts lets every tool verify the certificate. Otherwise, each tool has to be told to accept it:

- `stalwart-cli` with `-k` (`--insecure`)
- Vandelay with `--allow-invalid-certs`
- The account plan scripts of the proxy repository with `--insecure`
- `curl` with `-k`

## Recreating the domains

Every domain of the source must exist on the new deployment before any of its accounts can be moved. Split delivery also depends on it, because it can recognise a domain as local only once the domain exists. A [Domain](/docs/ref/object/domain) is created by name, in the WebUI under <!-- breadcrumb:Domain --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg> Domains › Domains<!-- /breadcrumb:Domain --> or with the command-line interface:

```bash
stalwart-cli create Domain --field name=example.org
```

The setup wizard has already created the domain entered as the default domain, so only the other domains of the source are created here. Creating a domain whose name exists already is refused with `primaryKeyViolation` on the `name` property, and the existing domain is left unchanged.

Creating the domain does not divert mail to the new deployment. Mail keeps reaching the source until the cutover. After the cutover, the new deployment delivers locally only for the accounts that have been moved.

Sources on which users sign in with bare names need one more setting. The new deployment completes a bare login such as `alice` with its default domain, set in the `defaultDomainId` field of [SystemSettings](/docs/ref/object/system-settings). SystemSettings is found in the WebUI under <!-- breadcrumb:SystemSettings --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › Services, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › General<!-- /breadcrumb:SystemSettings -->. When users of the source sign in with bare names, set the default domain to the domain those users belong to, using the domain identifier described in [Enabling relaying for split delivery](#enabling-relaying-for-split-delivery).

## Preparing signing keys, certificates and DNS

From the cutover onwards, the new deployment signs and receives mail under the migrated domains' names. The following must therefore be in place before the cutover:

- **DKIM keys.** Each migrated domain needs signing keys on the new deployment, with their public keys in DNS, as described in [DKIM](/docs/mta/authentication/dkim/). There are two options. The keys from the source can be kept by importing them, or new keys can be published under new selectors next to the old ones.
- **Certificates.** Two certificates for the public hostname are needed, because the proxy passes SMTP on port 25 through without terminating TLS. The proxy presents its certificate to mail clients, and the new deployment presents its own on port 25. Both are obtained through [ACME](/docs/server/tls/acme/) or [installed manually](/docs/server/tls/certificates). ACME needs care: once the proxy answers on the public hostname, the challenges that are validated by connecting to that hostname (HTTP-01 and TLS-ALPN-01) reach the proxy, not the server that ordered the certificate. The new deployment therefore uses the [DNS-01 challenge](/docs/server/tls/acme/challenges) or a certificate installed by hand.
- **SPF.** The SPF record of each domain must authorise the new deployment, which sends mail for moved accounts. It must also keep authorising the source, for as long as the source sends mail directly.
- **MTA-STS and DANE.** The MX hostname does not change, but the server answering on port 25 does. An [MTA-STS](/docs/mta/transport-security/mta-sts) policy keeps working as long as the new deployment's certificate is valid for the MX hostname. With [DANE](/docs/mta/transport-security/dane), TLSA records that pin the source's certificate or key must be extended with the new deployment's before the cutover, or senders that validate DANE stop delivering.
- **DNS TTLs.** The cutover repoints the public hostname to the proxy. Lowering the TTL of that record a day in advance shortens the time during which some clients still reach the source directly.

## Enabling relaying for split delivery

By default, Stalwart rejects mail for a recipient in one of its domains when no account or address matches that recipient. During the migration this rejection is wrong. The new deployment is the mail exchanger for the domain while most of its accounts still live on the source, so most valid recipients have no account on it yet.

The `allowRelaying` field of the domain changes this behaviour. When it is enabled, the new deployment accepts mail for an unknown recipient in the domain and hands it to the routing rule described in the next section, which relays it to the source.

The field is set on the domain by its identifier, so the identifier is read first:

```bash
stalwart-cli query Domain --where name=example.org --fields id
stalwart-cli update Domain <domain-id> --field allowRelaying=true
```

The identifier printed by the query replaces `<domain-id>`. In the WebUI, the field is a toggle on the domain.

A catch-all address on the domain gets in the way, because it takes precedence over relaying. A message for an unknown recipient is delivered to the catch-all mailbox and is not relayed to the source, so split delivery does not work for a domain with a catch-all address. There are two ways to deal with this: create the catch-all address only after the last account has moved, or accept that mail for accounts still on the source arrives in the catch-all mailbox. [Addresses, aliases and catch-all](/docs/domains/addresses) describes catch-all addresses.

## Configuring split delivery

Split delivery needs two pieces: a relay route that points at the source, and a routing rule that chooses, for each recipient, between local delivery and that route. The new deployment ships with a `local` route for local delivery and an `mx` route for delivery to remote domains, so only the relay route has to be added.

Routes are found in the WebUI under <!-- breadcrumb:MtaRoute --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Outbound › Routes<!-- /breadcrumb:MtaRoute -->. An [MtaRoute](/docs/ref/object/mta-route) of the `Relay` variant names the source by its internal address. Because the link is internal, the route negotiates TLS with STARTTLS when the source offers it, and accepts the source's certificate without verification:

```bash
stalwart-cli create MtaRoute/Relay \
  --field name=source \
  --field host=source.internal.example.org \
  --field port=25 \
  --field protocol=smtp \
  --field implicitTls=false \
  --field allowInvalidCerts=true
```

The routing rule is the `route` [expression](/docs/configuration/expressions/) of [MtaOutboundStrategy](/docs/ref/object/mta-outbound-strategy), which is found in the WebUI under <!-- breadcrumb:MtaOutboundStrategy --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Outbound › Strategy<!-- /breadcrumb:MtaOutboundStrategy -->. The expression is evaluated for each recipient and returns the name of a route. The following value sorts recipients into three groups. A recipient that is an account or address on the new deployment is delivered locally. A recipient in a local domain that has no account there is relayed to the source. Every other recipient goes through the `mx` route:

```json
{
  "route": {
    "match": {
      "0": {"if": "is_local_address(rcpt)", "then": "'local'"},
      "1": {"if": "is_local_domain(rcpt_domain)", "then": "'source'"}
    },
    "else": "'mx'"
  }
}
```

The route names are string literals in single quotes, and they must match existing routes. The order of the two conditions is what produces the split: a recipient with an account on the new deployment matches the first condition, and only the others reach the second. As accounts are moved, mail for them therefore stops being relayed without any further change.

Before applying the new value, save the current value of the expression, so that it can be restored when the [migration is finalised](/docs/migration/guide/finalize/). The `jq` filter keeps only the `route` field of the object that `get` prints:

```bash
stalwart-cli get MtaOutboundStrategy --fields route --json | jq '{route}' > route-before.json
```

With the new value saved as `route.json`, apply the expression with:

```bash
stalwart-cli update MtaOutboundStrategy --file route.json
```

## Trusting the proxy

Every connection that reaches the new deployment through the proxy comes from the proxy's address. To preserve the real client address, the proxy announces each connection it forwards with a PROXY protocol header, and the new deployment records the client's address from it instead of the proxy's.

The new deployment honours the header only from trusted networks, which are set in the `proxyTrustedNetworks` field of SystemSettings. The value lists the address or subnet the proxy connects from:

```bash
stalwart-cli update SystemSettings --field 'proxyTrustedNetworks={"203.0.113.10/32":true}'
```

Replace `203.0.113.10/32` with the proxy's address. Restricting the set to the proxy keeps direct connections from other hosts working. This matters because the new deployment also receives ordinary SMTP connections.

Restart the new deployment after changing `proxyTrustedNetworks`, for example with `systemctl restart stalwart`. A `ReloadSettings` action is not enough: until the restart, connections forwarded by the proxy fail.

The global setting has two effects. It enables PROXY protocol handling on every listener, and it exempts the proxy's address from [automatic banning](/docs/server/auto-ban). Without the exemption, automatic banning would treat the volume of connections arriving from one address as abuse.

A listener can also carry its own trusted networks. Its `overrideProxyTrustedNetworks` field replaces the trusted networks for that listener only. An address trusted only through such an override, however, is not exempt from banning, so keep the proxy's address in the global setting.

A connection from a trusted network is expected to start with a PROXY header, and one that does not is dropped. Once the setting is in effect, tools running on the proxy host must therefore reach the new deployment through the proxy, or from another host.

## Advertising the proxy as the public URL

Clients find the JMAP, OAuth and WebUI endpoints from the URL that the server advertises. During the migration, that URL must be the proxy's, so that a client following it stays on the proxy and keeps being routed. The new deployment takes its public URL from the `STALWART_PUBLIC_URL` environment variable:

```text
STALWART_PUBLIC_URL=https://mail.example.org
```

Add the variable to the service environment. It takes effect when the server is restarted, and since the new deployment serves no clients yet, the restart has no external impact. [Environment variables](/docs/configuration/environment-variables) describes the variable.

## Relaying outbound mail for the source

Each source page offers an optional step in which the source sends its outbound mail through the new deployment. This section applies only when that step is used.

In that arrangement, the source connects to port 25 of the new deployment as an unauthenticated client and submits mail for remote domains. The new deployment does not allow this by default. With the default `allowRelaying` expression, it relays mail to remote domains only for authenticated sessions, and rejects every other attempt with `550 5.7.1 Relay not allowed.` The rejections also have a side effect: repeated rejections count towards the automatic ban of the client address, so the source's address can end up banned.

The `allowRelaying` expression of [MtaStageRcpt](/docs/ref/object/mta-stage-rcpt) allows relaying for the source's address. MtaStageRcpt is found in the WebUI under <!-- breadcrumb:MtaStageRcpt --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Session › RCPT TO Stage<!-- /breadcrumb:MtaStageRcpt -->. The following value keeps the default for every other client and adds the source, here at `203.0.113.30`:

```json
{
  "allowRelaying": {
    "match": {
      "0": {"if": "remote_ip == '203.0.113.30'", "then": "true"}
    },
    "else": "!is_empty(authenticated_as)"
  }
}
```

With the value saved as `relay.json`, apply it with `stalwart-cli update MtaStageRcpt --file relay.json`.

Mail relayed this way arrives unauthenticated. With the default `dkimSignDomain` expression, the new deployment therefore does not sign it with DKIM. The source keeps signing its own mail as before.

## Preparing for bulk import

Vandelay writes each account to the new deployment over JMAP, authenticated as one administrator, from one host. Several limits that protect the server against abusive clients apply to it:

- **Rate limit.** Authenticated HTTP requests are limited by the `rateLimitAuthenticated` field of [Http](/docs/ref/object/http), by default to <!-- default:Http.rateLimitAuthenticated -->1000 per minute<!-- /default --> for each account. An export of a large account exceeds this limit, so raise it for the duration of the migration, for example with `stalwart-cli update Http --field 'rateLimitAuthenticated={"count":100000,"period":60000}'`.
- **Automatic banning.** Failed authentication attempts and rejected recipients count towards the ban thresholds of [Security](/docs/ref/object/security) (`authBanRate` and `abuseBanRate`). A mistyped password in a migration script can therefore ban the Vandelay host. An [AllowedIp](/docs/ref/object/allowed-ip) entry for the Vandelay host exempts it: `stalwart-cli create AllowedIp --field address=203.0.113.40 --field reason="Vandelay host"`.
- **JMAP limits.** The `maxUploadSize` field of [Jmap](/docs/ref/object/jmap), by default <!-- default:Jmap.maxUploadSize -->50 MB<!-- /default -->, must exceed the largest message or file being copied, because a larger object cannot be uploaded. Two other fields bound the speed of the copy. Vandelay runs no more requests in parallel than `maxConcurrentRequests` allows, by default <!-- default:Jmap.maxConcurrentRequests -->4<!-- /default -->, and it writes objects in batches of at most `maxSetObjects`, by default <!-- default:Jmap.maxSetObjects -->500<!-- /default -->. Raising these values for the migration shortens the copy of large accounts.

These changes are reverted when the [migration is finalised](/docs/migration/guide/finalize/).

## Rollback

The new deployment serves no clients yet, so this step has no service to restore. When the migration is abandoned, the new deployment can be left idle or removed.

To undo split delivery while keeping the server, take three actions:

1. Delete the `source` route.
2. Restore the `route` expression of MtaOutboundStrategy with `stalwart-cli update MtaOutboundStrategy --file route-before.json`.
3. Disable `allowRelaying` on each domain.
