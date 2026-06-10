---
sidebar_position: 3
title: "Configuring the new deployment"
---

The new deployment plays two roles during the migration. It is the destination that migrated accounts are moved onto, and it is also the public mail exchanger that receives all inbound mail and performs split delivery. This step prepares it for both roles. None of the changes here affect existing clients, because the new deployment is not yet receiving any traffic, so the whole step is performed without downtime.

The standard installation already produced a working server with an administrator account. What follows adds the domains that are being migrated, the relay and routing rules that make split delivery work, the trust that lets it sit behind the proxy, and the public address it advertises to clients. Every change is shown with the command-line interface, which is the most direct way to script the configuration. The same changes can be made through the web interface under the administration application, where each object described below appears as a form.

The examples assume the command-line interface has been pointed at the new deployment and authenticated as an administrator, for instance by exporting `STALWART_URL`, `STALWART_USER` and `STALWART_PASSWORD`, so that the `stalwart-cli` invocations below carry the connection details implicitly.

## Recreating the domains

Every domain that exists on the source has to exist on the new one before any of its accounts can be migrated, and before split delivery can recognise it as local. A domain is created by name:

```bash
stalwart-cli create Domain --field name=example.org
```

Creating the domain on the new server does not divert any mail to it. Mail continues to reach the source until the proxy is started, and even then the new server only delivers locally for accounts that have actually been migrated.

## Enabling relaying for split delivery

By default a Stalwart server rejects mail addressed to a local domain when the recipient does not exist as a local account. During the migration this default is wrong, because the new server is the mail exchanger for the domain while most of its accounts still live on the source. Those recipients are not local accounts on the new server yet, so without a change they would be rejected outright instead of being relayed.

The `allowRelaying` property on the domain changes this. When it is enabled, the new server accepts mail for a recipient in that domain even when no local account matches, which allows the routing rules described next to forward the message to the source. The property is set by the domain's internal identifier, which is read first and then used to update the domain:

```bash
stalwart-cli query Domain --where name=example.org --fields id
stalwart-cli update Domain <domain-id> --field allowRelaying=true
```

The query prints the identifier the new server assigned to the domain, and that value replaces `<domain-id>` in the update. The same setting appears as a toggle on the domain in the web interface, where no identifier is needed.

## Configuring split delivery

Split delivery is expressed as a relay route that points at the source and a routing rule that chooses, for each recipient, whether to deliver locally or relay to that route. The new server already ships with a `local` route for local delivery and an `mx` route for ordinary outbound mail, so only the relay to the source has to be added.

The relay route names the source by its internal address. TLS is left off for implicit mode so that the connection is made in cleartext or upgraded opportunistically through STARTTLS, and invalid certificates are accepted because the link is internal:

```bash
stalwart-cli create MtaRoute/Relay \
  --field name=source \
  --field address=source.internal.example.org \
  --field port=25 \
  --field protocol=smtp \
  --field implicitTls=false \
  --field allowInvalidCerts=true
```

The routing rule is the outbound strategy's `route` expression. It is evaluated once per recipient and returns the name of the route to use. The expression below delivers locally when the recipient is a real local account on the new server, relays to the source when the recipient belongs to a local domain but is not a local account, and otherwise hands the message to ordinary MX delivery:

```bash
stalwart-cli update MtaOutboundStrategy singleton \
  --field 'route={"match":{"0":{"if":"is_local_address(rcpt)","then":"'\''local'\''"},"1":{"if":"is_local_domain(rcpt_domain)","then":"'\''source'\''"}},"else":"'\''mx'\''"}'
```

The route names returned by the expression, written as quoted literals, must match the names of existing routes. The order of the two conditions matters: a recipient that is a local account is caught by the first condition and delivered locally, and only recipients that are not local accounts reach the second condition and are relayed. This is what produces the split. As accounts are migrated and become local on the new server, mail for them stops being relayed and starts being delivered locally, with no further configuration.

## Trusting the proxy

The proxy announces every connection it forwards by prepending a PROXY protocol header, so that the new server records the real client address rather than the proxy's. For the new server to accept those headers, the network the proxy connects from has to be marked as trusted. Marking it trusted both enables PROXY protocol handling on every listener and exempts that network from the automatic connection-banning that would otherwise treat the steady stream of forwarded connections as abuse.

The trusted networks are set once, globally, listing the address or subnet the proxy connects from:

```bash
stalwart-cli update SystemSettings singleton \
  --field 'proxyTrustedNetworks={"203.0.113.10/32":true}'
```

The address `203.0.113.10/32` is a placeholder and must be replaced with the proxy's actual address, written as a single host (`/32`) or as the subnet the proxy connects from. The value is the proxy's own address rather than a client range. Restricting it to the proxy keeps direct connections from other hosts working normally, which matters because the new server still has to accept ordinary, headerless SMTP from the wider internet on port 25. A single global setting is sufficient; if a finer distinction is ever required, the same set can be overridden on an individual listener through its `overrideProxyTrustedNetworks` property.

Enabling PROXY protocol acceptance has an important consequence. Once a connection from the trusted network is expected to begin with a PROXY header, a direct connection from that same network that does not send one is dropped. In practice this means that after this setting takes effect the new server should be reached through the proxy rather than connected to directly from the proxy's own host.

## Advertising the proxy as the public address

Clients discover where to send JMAP requests, and where the OAuth endpoints live, from the URL the server advertises about itself. During the migration that URL has to be the proxy, not the new server, so that an autodiscovering client stays on the proxy and is routed correctly instead of connecting to the new server directly and bypassing the proxy entirely.

The advertised URL is taken from the `STALWART_PUBLIC_URL` environment variable of the new server's process. It is set to the public address that clients use, which is the proxy:

```
STALWART_PUBLIC_URL=https://mail.example.org
```

The variable is added to the service environment and the server is restarted for it to take effect. Because the new server is not yet serving clients, this restart has no external impact.

## Becoming familiar with the new release

The releases that followed 0.15 reorganised configuration into typed objects, replaced the administration interface and changed several protocol and storage details. Reading through the [configuration](/docs/configuration/) and [management](/docs/management/) sections, and exercising the new deployment with a test account before any real account depends on it, avoids surprises during the migration. The split-delivery behaviour configured above can be confirmed end to end once the proxy is running, which the cutover step covers.

## Rollback

Everything configured in this step lives on a server that is not yet serving clients, so there is nothing to roll back in the sense of restoring service. If the migration is abandoned at this point, the new deployment can simply be left idle or removed. Should the split-delivery configuration need to be undone while keeping the server, the relay route is deleted, the outbound strategy's `route` expression is returned to its default, and `allowRelaying` is switched off on each domain.
