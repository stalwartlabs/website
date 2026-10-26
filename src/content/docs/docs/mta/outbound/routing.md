---
sidebar_position: 4
title: "Routing"
description: "Routes decide where a recipient's message is delivered: to a local mailbox, to the domain's MX hosts, or through a relay over SMTP or LMTP; with their settings, examples and the TLS policies that apply to relays."
---

Every queued message has to be delivered somewhere, and the destination is not always the obvious one. Mail for the server's own domains goes into local mailboxes. Mail for other domains normally goes to the servers that those domains publish in DNS. Some deployments, however, must send their mail through a provider's smart host, a scanning appliance or a separate message store. Routes are the settings that express these choices.

A route decides where the message for a recipient is delivered. For each recipient, the [`route`](/docs/mta/outbound/strategy) expression of the outbound strategy returns the name of a route, and the route names the destination. There are three kinds of destination, and each is a variant of the [MtaRoute](/docs/ref/object/mta-route) object (found in the WebUI under <!-- breadcrumb:MtaRoute --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Outbound › Routes<!-- /breadcrumb:MtaRoute -->):

- `Local`: the local message store
- `Mx`: the mail servers listed in the MX records of the recipient's domain
- `Relay`: a fixed relay host

## Local delivery

The `Local` variant stores the message in the recipient's mailbox on this server. This is the point at which the user's Sieve script runs, and at which the spam verdict decides between the inbox and the Junk folder. The variant has no settings besides its name. A new installation has a local route named `local`, and the default route expression selects it for the domains hosted on the server.

## MX delivery

The `Mx` variant delivers mail the way the internet expects. It looks up the MX records of the recipient's domain and delivers to the hosts they list, lowest preference value first. When one host cannot be reached, it tries the next. A domain without MX records is delivered to the address of the domain itself, as RFC 5321 requires.

Three settings limit how much of a domain's mail infrastructure one delivery attempt explores:

- [`maxMxHosts`](/docs/ref/object/mta-route#maxmxhosts) is the number of MX hosts tried in one delivery attempt.
- [`maxMultihomed`](/docs/ref/object/mta-route#maxmultihomed) is the number of IP addresses tried for each MX host that has several.
- [`ipLookupStrategy`](/docs/ref/object/mta-route#iplookupstrategy) decides which address families are used and in which order: `v4ThenV6`, `v6ThenV4`, `v4Only` or `v6Only`.

The `mx` route of a new installation sets `maxMxHosts` to `2`. The limit keeps a delivery attempt short for domains with many MX hosts, or with addresses that do not answer. It also has a consequence for backup hosts. Every attempt uses the hosts with the lowest preference values, shuffling hosts of equal preference, so with a limit of 2 a domain's third and later MX hosts are never tried. The limit should therefore be raised for domains whose backup MX hosts must receive mail.

The address family matters for deliverability. `v4Only` is the right choice when the server has no IPv6 connectivity, and also when its IPv6 address has no PTR record, because many receivers require one. The following route tries three MX hosts, over IPv4 only:

```json
{
  "@type": "Mx",
  "name": "mx",
  "maxMxHosts": 3,
  "maxMultihomed": 2,
  "ipLookupStrategy": "v4Only"
}
```

## Relay delivery

The `Relay` variant delivers to one fixed host, whatever the recipient's domain. Typical relays are the smart host of an internet provider, a scanning appliance and an outbound gateway. Over LMTP, a relay can also be a separate message store. The route's settings describe how to reach the relay and how to authenticate to it:

| Field | Default | Purpose |
|---|---|---|
| [`host`](/docs/ref/object/mta-route#host) | required | Host name or IP address of the relay. |
| [`port`](/docs/ref/object/mta-route#port) | <!-- default:MtaRoute.port -->25<!-- /default --> | Port of the relay. |
| [`protocol`](/docs/ref/object/mta-route#protocol) | <!-- default:MtaRoute.protocol -->`smtp`<!-- /default --> | `smtp` or `lmtp`. |
| [`implicitTls`](/docs/ref/object/mta-route#implicittls) | <!-- default:MtaRoute.implicitTls as=enabled -->disabled<!-- /default --> | Start TLS on connection, as on port 465, instead of upgrading with `STARTTLS`. |
| [`allowInvalidCerts`](/docs/ref/object/mta-route#allowinvalidcerts) | <!-- default:MtaRoute.allowInvalidCerts as=enabled -->disabled<!-- /default --> | Accept a certificate that does not validate, such as a self-signed one. |
| [`authUsername`](/docs/ref/object/mta-route#authusername) | none | User name for SMTP authentication at the relay. |
| [`authSecret`](/docs/ref/object/mta-route#authsecret) | no password | Password: `None`, `Value` (given directly), `EnvironmentVariable` or `File`. |

Authentication needs both halves of the credentials. Stalwart authenticates to the relay only when both `authUsername` and a secret are set. The following route submits mail to a provider's smart host on port 587 with `STARTTLS`, and reads the password from an environment variable:

```json
{
  "@type": "Relay",
  "name": "smarthost",
  "host": "smtp.provider.example",
  "port": 587,
  "protocol": "smtp",
  "implicitTls": false,
  "authUsername": "relay@example.org",
  "authSecret": {"@type": "EnvironmentVariable", "variableName": "SMARTHOST_PASSWORD"}
}
```

Defining the route does not yet send any mail through it, because the `route` expression must also select it. [Strategies](/docs/mta/outbound/strategy#recipes) shows how to select the route for all remote mail, for some senders or only after failed attempts.

A relay route can also hand local mail to another message store. The following route delivers over LMTP to a message store on the same host:

```json
{
  "@type": "Relay",
  "name": "lmtp",
  "host": "127.0.0.1",
  "port": 24,
  "protocol": "lmtp"
}
```

The route expression then returns `'lmtp'` for local domains, in place of `'local'`.

### TLS on relay hops

The [TLS strategy](/docs/mta/outbound/tls) applies to relay hops in the same way as to MX delivery. `STARTTLS` is used when the relay offers it, and with `startTls` set to `require`, a relay that does not offer it fails the delivery.

DANE and MTA-STS are different, because they publish the TLS policy of a recipient domain for that domain's MX hosts. A relay is not one of the domain's MX hosts, so these policies do not apply to it:

- No MTA-STS policy is fetched for relay hops.
- With `dane` set to `optional`, no TLSA lookup is made for a relay. With `dane` set to `require`, a relay can never be reached, because it has no DANE records for the domain. A relay route must therefore not be combined with a TLS strategy that requires DANE.
- Over LMTP, neither DANE nor MTA-STS applies.

Certificate validation of the relay needs particular attention. The certificate is not validated when `allowInvalidCerts` is set, either on the route or on the TLS strategy in use. With the default `tls` expression, a relay delivery that failed with a TLS error is retried under the `invalid-tls` strategy, which does not validate. To keep validating the relay's certificate, select a strategy without `allowInvalidCerts` for it, for example with a branch on `rcpt_domain` or `retry_num` that does not return `'invalid-tls'`.
