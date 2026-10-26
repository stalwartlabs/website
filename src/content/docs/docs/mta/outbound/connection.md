---
sidebar_position: 5
title: "Connection"
description: "Connection strategies for outbound delivery: the local IP addresses and EHLO names Stalwart uses towards remote servers, and the timeouts of each step of the SMTP dialogue."
---

When Stalwart delivers a message to another server, the way it opens the connection shapes how that server judges the mail. Receiving servers judge a sender largely by its IP address, and by whether the address, its PTR record and the name the sender gives in `EHLO` agree. On a server with several addresses, the choice of address and name therefore directly affects deliverability. The connection also needs limits on how long to wait for a slow remote server.

A connection strategy holds these choices. It decides from which local IP address Stalwart connects, which name it gives in its `EHLO` command, and how long it waits at each step of the SMTP dialogue. Each strategy is an [MtaConnectionStrategy](/docs/ref/object/mta-connection-strategy) object (found in the WebUI under <!-- breadcrumb:MtaConnectionStrategy --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Outbound › Connection Strategies<!-- /breadcrumb:MtaConnectionStrategy -->). The `connection` expression of the [outbound strategy](/docs/mta/outbound/strategy) selects one for each delivery. A new installation has one strategy, named `default`.

## Local IP addresses

[`localIps`](/docs/ref/object/mta-connection-strategy#localips) lists the local addresses from which deliveries are sent. Each entry has a `localIp` and, optionally, an `ehloHostname` to use with that address.

The list may mix IPv4 and IPv6 addresses. For each connection, Stalwart considers only the addresses of the same family as the remote server's address, and picks one of them at random. When the list has no address of that family, the connection uses the address that the operating system chooses.

Each local address needs consistent DNS. The PTR record of the address should resolve to the EHLO name used with it, and that name should resolve back to the address. This check is called forward-confirmed reverse DNS, and many receiving servers reject or penalise mail from addresses that fail it. The following strategy sends from two IPv4 addresses, each with its own name, and from one IPv6 address:

```json
{
  "name": "default",
  "ehloHostname": "mx.example.org",
  "localIps": {
    "0": {"localIp": "192.0.2.10", "ehloHostname": "mx1.example.org"},
    "1": {"localIp": "192.0.2.11", "ehloHostname": "mx2.example.org"},
    "2": {"localIp": "2001:db8::10"}
  }
}
```

The moment at which the address is chosen decides which expressions can see it. The address is chosen before the outbound [throttles](/docs/mta/outbound/rate-limit) are evaluated for the connection, so the throttles see it as `local_ip`, and a throttle keyed on `localIp` limits each address separately. The `tls` expression, on the other hand, is evaluated once for each remote host before any address is chosen, so `local_ip` is not available to it.

## EHLO name

The name in the `EHLO` command comes from the first of the following that is set:

1. The `ehloHostname` of the chosen local address
2. The [`ehloHostname`](/docs/ref/object/mta-connection-strategy#ehlohostname) of the strategy
3. The server's host name

Because the strategy can carry a name of its own, a strategy for a separate kind of traffic can present its own identity. Bulk notifications sent from their own address, for example, can present a name of their own.

## Timeouts

A remote server that stops answering would hold a delivery open indefinitely, so each step of the delivery has a timeout. Each timeout limits how long Stalwart waits for the remote server at one step, in milliseconds. When a timeout expires, the attempt fails with a temporary error, and the recipient is retried according to its [schedule](/docs/mta/outbound/schedule).

| Field | Default | Step |
|---|---|---|
| [`connectTimeout`](/docs/ref/object/mta-connection-strategy#connecttimeout) | <!-- default:MtaConnectionStrategy.connectTimeout -->5 minutes<!-- /default --> | Opening the TCP connection. |
| [`greetingTimeout`](/docs/ref/object/mta-connection-strategy#greetingtimeout) | <!-- default:MtaConnectionStrategy.greetingTimeout -->5 minutes<!-- /default --> | Waiting for the server's greeting. |
| [`ehloTimeout`](/docs/ref/object/mta-connection-strategy#ehlotimeout) | <!-- default:MtaConnectionStrategy.ehloTimeout -->5 minutes<!-- /default --> | Reply to `EHLO`. |
| [`mailFromTimeout`](/docs/ref/object/mta-connection-strategy#mailfromtimeout) | <!-- default:MtaConnectionStrategy.mailFromTimeout -->5 minutes<!-- /default --> | Reply to `MAIL FROM`. |
| [`rcptToTimeout`](/docs/ref/object/mta-connection-strategy#rcpttotimeout) | <!-- default:MtaConnectionStrategy.rcptToTimeout -->5 minutes<!-- /default --> | Reply to `RCPT TO`. |
| [`dataTimeout`](/docs/ref/object/mta-connection-strategy#datatimeout) | <!-- default:MtaConnectionStrategy.dataTimeout -->10 minutes<!-- /default --> | Reply after the message data. |

The defaults for the greeting, `MAIL FROM`, `RCPT TO` and the data are the timeouts that [RFC 5321](https://www.rfc-editor.org/rfc/rfc5321#section-4.5.3.2) recommends. The RFC sets no timeout for opening the connection or for the reply to `EHLO`.

Changing the timeouts is a trade-off. Shorter timeouts release delivery threads sooner when remote servers are slow or unreachable. They also risk abandoning deliveries to servers that are slow but working, such as servers that delay their greeting deliberately. The following object body shortens the connection and greeting timeouts to two minutes:

```json
{
  "connectTimeout": 120000,
  "greetingTimeout": 120000
}
```

[Tuning mail throughput](/docs/performance/mail-throughput) describes how timeouts and delivery threads interact.
