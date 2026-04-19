---
sidebar_position: 4
---

# Routing

Message routing determines the final destination host for a message. When a message is processed for delivery, the selected routing strategy defines whether it should be delivered locally, resolved through DNS, or sent through an intermediate relay.

Three routing variants are supported:

- **Local**: delivers the message to the local message store, typically for users hosted on the same system or domain.
- **MX**: uses DNS MX-record resolution to determine the destination server for remote delivery.
- **Relay**: forwards the message to a predefined relay host, regardless of recipient domain.

Each message recipient can be routed independently under a different strategy. This allows, for example, some messages to be delivered locally while others are relayed or sent via MX resolution based on domain, authentication status, or other delivery context.

Routing strategies are defined as [MtaRoute](/docs/ref/object/mta-route) objects (found in the WebUI under <!-- breadcrumb:MtaRoute --><!-- /breadcrumb:MtaRoute -->). MtaRoute is a multi-variant object: each instance selects one of the `Local`, `Mx`, or `Relay` variants, and the chosen variant determines which fields apply.

Once defined, routes are selected dynamically for each recipient via the route expression on [MtaOutboundStrategy](/docs/ref/object/mta-outbound-strategy); see [Strategies](/docs/mta/outbound/strategy).

## Local delivery

The `Local` variant delivers messages to the server's internal message store, where they are made available to users through JMAP, IMAP, or POP3. This route is typically used for delivering messages to domains and users hosted on the same Stalwart instance. Messages routed locally are written directly into the mailbox storage backend. The Local variant has no additional delivery parameters beyond the route name:

```json
{
  "@type": "Local",
  "name": "local"
}
```

## MX delivery

The `Mx` variant delivers messages to remote domains using DNS MX-record resolution. Stalwart queries the MX records for the recipient domain and attempts delivery to the listed hosts in priority order. Each record carries a hostname and priority value; the hosts with the lowest priority are tried first, with subsequent hosts attempted if delivery fails.

The following fields apply to the Mx variant:

- [`maxMxHosts`](/docs/ref/object/mta-route#maxmxhosts): maximum number of MX hosts tried per delivery attempt. Default 5.
- [`maxMultihomed`](/docs/ref/object/mta-route#maxmultihomed): for multi-homed MX hosts, maximum number of IP addresses to try per host. Default 2.
- [`ipLookupStrategy`](/docs/ref/object/mta-route#iplookupstrategy): IP resolution strategy. Supported values are `v4ThenV6` (default), `v6ThenV4`, `v4Only`, and `v6Only`.

Setting `maxMxHosts` to 3 means that if a domain has five MX records, only the three with the lowest priority are considered during the attempt. This limits connection time and resource usage when dealing with domains that have many fallback servers. Similarly, `maxMultihomed` capped at 2 avoids long delays when several IP addresses are unreachable.

Example MX route trying IPv4 addresses first:

```json
{
  "@type": "Mx",
  "name": "mx",
  "maxMxHosts": 3,
  "maxMultihomed": 2,
  "ipLookupStrategy": "v4ThenV6"
}
```

## Relay delivery

The `Relay` variant delivers messages through a predefined relay host instead of resolving the recipient domain via DNS. A relay host accepts mail from another server and forwards it to its final destination, acting as an intermediate stop. Relays are useful when the originating server should not perform direct delivery (for example because of firewall constraints or IP-reputation issues), or when outbound mail should pass through a scanning appliance.

The following fields apply to the Relay variant:

- [`address`](/docs/ref/object/mta-route#address): fully-qualified hostname or IP address of the remote server.
- [`port`](/docs/ref/object/mta-route#port): port on the remote server. Default 25.
- [`protocol`](/docs/ref/object/mta-route#protocol): `smtp` or `lmtp`. Default `smtp`.
- [`implicitTls`](/docs/ref/object/mta-route#implicittls): whether to establish TLS implicitly on connection, rather than negotiating it with `STARTTLS`. Default `false`.
- [`allowInvalidCerts`](/docs/ref/object/mta-route#allowinvalidcerts): whether self-signed or otherwise invalid certificates are accepted. Default `false`.
- [`authUsername`](/docs/ref/object/mta-route#authusername): optional username for SMTP authentication to the relay.
- [`authSecret`](/docs/ref/object/mta-route#authsecret): authentication secret. A multi-variant field supporting `None` (no authentication), `Value` (secret supplied directly), `EnvironmentVariable` (secret read from an environment variable), and `File` (secret read from a file).

## Examples

### Relay host

Operators can define a Relay MtaRoute for a specific host and an Mx MtaRoute for general remote delivery, and then select between them through the route expression on [MtaOutboundStrategy](/docs/ref/object/mta-outbound-strategy). A common pattern is to relay everything destined for an internal domain through a specific relay while all other mail takes the standard MX path. The corresponding MtaRoute objects:

```json
[
  {
    "@type": "Relay",
    "name": "relay",
    "address": "relay.example.org",
    "port": 25,
    "protocol": "smtp",
    "implicitTls": false,
    "allowInvalidCerts": false,
    "authSecret": {"@type": "None"}
  },
  {
    "@type": "Mx",
    "name": "mx",
    "ipLookupStrategy": "v4ThenV6"
  }
]
```

The route expression on MtaOutboundStrategy then branches on `is_local_domain('', rcpt_domain)` to pick `'relay'` versus `'mx'`.

### Failover delivery

Failover delivery forwards messages to a secondary host after the primary delivery path has failed a given number of times. Two MtaRoute objects are created (for example an Mx route and a Relay "fallback" route) and the route expression on MtaOutboundStrategy branches on `retry_num` so that after the second failure the `fallback` route is selected. Local-domain traffic can be routed through a third MtaRoute of the Local variant:

```json
[
  {"@type": "Local", "name": "local"},
  {
    "@type": "Mx",
    "name": "mx",
    "ipLookupStrategy": "v4ThenV6"
  },
  {
    "@type": "Relay",
    "name": "fallback",
    "address": "fallback.example.org",
    "port": 25,
    "protocol": "smtp",
    "authSecret": {"@type": "None"}
  }
]
```

The route expression selects `'local'` for local domains, `'fallback'` when `retry_num > 1`, and `'mx'` otherwise.

### LMTP delivery

LMTP (Local Mail Transfer Protocol) is a derivative of SMTP used for the final delivery of mail to a local recipient's mailbox. To hand messages to an LMTP server, a Relay MtaRoute is created with [`protocol`](/docs/ref/object/mta-route#protocol) set to `lmtp`, [`port`](/docs/ref/object/mta-route#port) set to 24, `implicitTls` disabled, and optionally `authUsername` and `authSecret` populated. The route expression then selects this route for local domains, using the Mx variant for remote traffic:

```json
[
  {
    "@type": "Relay",
    "name": "lmtp",
    "address": "localhost",
    "port": 24,
    "protocol": "lmtp",
    "implicitTls": false,
    "allowInvalidCerts": true,
    "authUsername": "relay_server",
    "authSecret": {"@type": "Value", "secret": "123456"}
  },
  {
    "@type": "Mx",
    "name": "mx",
    "ipLookupStrategy": "v4ThenV6"
  }
]
```
