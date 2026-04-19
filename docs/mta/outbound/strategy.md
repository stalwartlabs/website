---
sidebar_position: 1
---

# Strategies

Delivery strategies define the behaviour and policies used when Stalwart MTA delivers email messages, whether to local recipients or remote systems. Strategies allow dynamic delivery logic driven by runtime conditions: [expressions](/docs/configuration/expressions/overview) are evaluated for each recipient and message, so routing, scheduling, connection parameters, and transport security can all adapt to the context of each delivery.

Each message processed by the MTA is evaluated against four strategy expressions to determine how it should be handled. The expressions inspect attributes such as sender, recipient, message headers, IP address, or other metadata, and return the name of a named strategy (defined by the appropriate reference object) that should be applied.

There are four types of strategies:

- [Routing strategy](/docs/mta/outbound/routing): determines the delivery target. A recipient may be routed for local delivery, to a remote host via MX resolution, or through a predefined relay host.
- [Scheduling strategy](/docs/mta/outbound/schedule): governs how messages are queued and retried. It determines which virtual queue should be used, how frequently delivery attempts are made, how messages are prioritised, and when undeliverable messages expire.
- [Connection strategy](/docs/mta/outbound/connection): defines how outbound connections to remote mail servers are established, including source IP address, connection timeouts, and custom EHLO domains.
- [TLS strategy](/docs/mta/outbound/tls): determines the transport-layer security settings applied to the connection, including DANE, MTA-STS, STARTTLS, and certificate-validation policy.

Each strategy type is evaluated independently, but together they define a complete delivery policy.

## Configuration

Delivery behaviour is governed by four fields on the [MtaOutboundStrategy](/docs/ref/object/mta-outbound-strategy) singleton (found in the WebUI under <!-- breadcrumb:MtaOutboundStrategy --><!-- /breadcrumb:MtaOutboundStrategy -->):

- [`route`](/docs/ref/object/mta-outbound-strategy#route): expression selecting the route name, resolved to an [MtaRoute](/docs/ref/object/mta-route) object.
- [`schedule`](/docs/ref/object/mta-outbound-strategy#schedule): expression selecting the scheduling strategy name, resolved to an [MtaDeliverySchedule](/docs/ref/object/mta-delivery-schedule) object.
- [`connection`](/docs/ref/object/mta-outbound-strategy#connection): expression selecting the connection strategy name, resolved to an [MtaConnectionStrategy](/docs/ref/object/mta-connection-strategy) object.
- [`tls`](/docs/ref/object/mta-outbound-strategy#tls): expression selecting the TLS strategy name, resolved to an [MtaTlsStrategy](/docs/ref/object/mta-tls-strategy) object.

Each expression is evaluated for every recipient in a message. They have access to a wide set of [variables](/docs/configuration/variables#mta-variables) describing the message, its origin, recipients, delivery status, and more, so expressions can match against domain names, message metadata, delivery conditions, or error states. A named strategy object with the returned name must exist; if it does not, delivery fails.

## Example

A typical configuration sets each expression to pick a different strategy name based on context: `route` returns `'local'` when the recipient domain is local (`is_local_domain('', rcpt_domain)`) and `'mx'` otherwise; `schedule` returns `'local'` for local recipients, `'dsn'` for delivery-status notifications, `'report'` for aggregate reports, and `'remote'` otherwise; `connection` returns `'long-timeout'` when a previous attempt failed with a connection error and `'default'` otherwise; and `tls` returns `'invalid-tls'` when a previous attempt failed due to a TLS error and `'default'` otherwise. Corresponding [MtaRoute](/docs/ref/object/mta-route), [MtaDeliverySchedule](/docs/ref/object/mta-delivery-schedule), [MtaConnectionStrategy](/docs/ref/object/mta-connection-strategy), and [MtaTlsStrategy](/docs/ref/object/mta-tls-strategy) objects must be defined with the names referenced by the expressions.

```json
{
  "route": {
    "match": [{"if": "is_local_domain('', rcpt_domain)", "then": "'local'"}],
    "else": "'mx'"
  },
  "schedule": {
    "match": [
      {"if": "is_local_domain('*', rcpt_domain)", "then": "'local'"},
      {"if": "source == 'dsn'", "then": "'dsn'"},
      {"if": "source == 'report'", "then": "'report'"}
    ],
    "else": "'remote'"
  },
  "connection": {
    "match": [{"if": "retry_num > 0 && last_error == 'connection'", "then": "'long-timeout'"}],
    "else": "'default'"
  },
  "tls": {
    "match": [{"if": "retry_num > 0 && last_error == 'tls'", "then": "'invalid-tls'"}],
    "else": "'default'"
  }
}
```
