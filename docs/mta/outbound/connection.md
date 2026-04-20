---
sidebar_position: 5
---

# Connection

A connection strategy defines how Stalwart MTA establishes SMTP connections to remote servers during message delivery. While [routing strategies](/docs/mta/outbound/routing) determine *where* messages are delivered, connection strategies control *how* those connections are made. A connection strategy specifies parameters such as the source IP address to bind to, the hostname to advertise in the `EHLO` command, and timeout values for each stage of the SMTP session. This level of control is useful in multi-homed systems, outbound IP rotation setups, or when complying with specific policy or network constraints.

Each connection strategy is defined as an [MtaConnectionStrategy](/docs/ref/object/mta-connection-strategy) object (found in the WebUI under <!-- breadcrumb:MtaConnectionStrategy --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Outbound › Connection Strategies<!-- /breadcrumb:MtaConnectionStrategy -->). Strategies are selected dynamically for each recipient via the connection expression on [MtaOutboundStrategy](/docs/ref/object/mta-outbound-strategy); see [Strategies](/docs/mta/outbound/strategy) for details.

Each connection strategy operates independently and can be tailored to specific domains, message types, or security requirements. For example, one strategy might use a dedicated IP address and hostname for high-volume transactional mail, while another uses different parameters for low-volume or internal mail.

## EHLO hostname

The [`ehloHostname`](/docs/ref/object/mta-connection-strategy#ehlohostname) field overrides the EHLO hostname used when this strategy is applied. When left empty, the system hostname is used. For example:

```json
{
  "name": "default",
  "ehloHostname": "mx.example.org"
}
```

## Source IP

The [`sourceIps`](/docs/ref/object/mta-connection-strategy#sourceips) field accepts a list of local IPv4 and IPv6 addresses to use when delivering messages to remote servers. If multiple entries are provided, Stalwart randomly selects one for each new connection. Each entry carries a required `sourceIp` and an optional `ehloHostname` that overrides the strategy-wide EHLO hostname for that source address.

Correct configuration of `sourceIps` is important for deliverability on multi-homed systems. If no source address is set and the system has several local IPs, the kernel chooses one arbitrarily, which may hurt reputation or violate policy. Per-source EHLO overrides are useful when different IPs are associated with different domains or services.

Example strategy with four source addresses, one of which overrides the EHLO hostname:

```json
{
  "name": "default",
  "ehloHostname": "mx.example.org",
  "sourceIps": [
    {"sourceIp": "192.0.2.10", "ehloHostname": "mx-192-0-2-10.example.org"},
    {"sourceIp": "192.0.2.11"},
    {"sourceIp": "2001:db8::a"},
    {"sourceIp": "2001:db8::b"}
  ]
}
```

## Timeouts

Timeouts cap how long Stalwart waits for the remote server to respond at each stage of the SMTP dialogue: [`connectTimeout`](/docs/ref/object/mta-connection-strategy#connecttimeout) (connection establishment, default 5 minutes), [`greetingTimeout`](/docs/ref/object/mta-connection-strategy#greetingtimeout) (SMTP greeting, default 5 minutes), [`ehloTimeout`](/docs/ref/object/mta-connection-strategy#ehlotimeout) (`EHLO` response, default 5 minutes), [`mailFromTimeout`](/docs/ref/object/mta-connection-strategy#mailfromtimeout) (`MAIL FROM` response, default 5 minutes), [`rcptToTimeout`](/docs/ref/object/mta-connection-strategy#rcpttotimeout) (`RCPT TO` response, default 5 minutes), and [`dataTimeout`](/docs/ref/object/mta-connection-strategy#datatimeout) (`DATA` response, default 10 minutes):

```json
{
  "connectTimeout": "3m",
  "greetingTimeout": "3m",
  "ehloTimeout": "3m",
  "mailFromTimeout": "3m",
  "rcptToTimeout": "3m",
  "dataTimeout": "10m"
}
```
