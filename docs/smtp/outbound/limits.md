---
sidebar_position: 5
---

# Limits

Transport limits allow administrators to define constraints and thresholds for email transport and SMTP transactions. These settings provide control over how the server handles message delivery and communication with remote hosts, ensuring efficient use of resources and compliance with organizational policies.

One key aspect of these configurations is the ability to set transport limits, such as the maximum number of hosts the server should attempt to deliver messages to for a single domain. This limit ensures that the delivery process remains efficient and avoids excessive retries or resource usage when multiple hosts are available for the same domain.

Additionally, administrators can configure timeouts for each stage of the SMTP transaction. These timeout settings define how long the server will wait for a response during various phases of the SMTP communication, such as establishing a connection, negotiating the protocol, and transmitting the message. Properly tuned timeouts help optimize server performance and prevent delays caused by unresponsive or slow remote hosts.

## Transport

The following transport limits can be configured under the `queue.outbound.limits` key:

- `mx`: The maximum number of MX hosts to try on each delivery attempt.
- `multihomed`: For multi-homed remote servers, it is the maximum number of IP addresses to try on each delivery attempt.

Example:

```toml
[queue.outbound.limits]
mx = 7
multihomed = 2
```

## Timeouts

Timeout options determine the time limit for the SMTP server to complete a specific step in the SMTP transaction process. These following timeout settings can defined in the configuration file under the `queue.outbound.timeouts`:

- `connect`: The maximum time to wait for the connection to be established.
- `greeting`: The maximum time to wait for the SMTP server's greeting message.
- `tls`: The maximum time to wait for the TLS negotiation process.
- `ehlo`: The maximum time to wait for the `EHLO` command.
- `mail-from`: The maximum time to wait for the `MAIL FROM` command.
- `rcpt-to`: The maximum time to wait for the `RCPT TO` command.
- `data`: The maximum time to wait for the `DATA` command.
- `mta-sts`: The maximum time to wait for a MTA-STS policy lookup.

Example:

```toml
[queue.outbound.timeouts]
connect = "3m"
greeting = "3m"
tls = "2m"
ehlo = "3m"
mail-from = "3m"
rcpt-to = "3m"
data = "10m"
mta-sts = "2m"
```
