---
sidebar_position: 1
---

# Strategies

In Stalwart MTA, *strategies* define the behavior and policies used during the delivery of email messages, whether to local recipients or remote systems. Strategies allow administrators to define flexible, dynamic delivery logic based on runtime conditions, using [expressions](/docs/configuration/expressions/overview) that are evaluated for each recipient and message. This approach enables fine-grained control over message routing, scheduling, connection parameters, and transport security, adapting to the needs of complex mail environments.

Each message processed by the MTA is evaluated against a set of strategies to determine how it should be handled. Strategies are selected based on expressions that can inspect attributes such as sender, recipient, message headers, IP address, or other metadata. The result of this evaluation determines which strategy will be applied for a given message.

There are four distinct types of strategies in Stalwart:

- [Routing Strategy](/docs/mta/outbound/routing): The routing strategy determines the delivery target for a message. Based on the evaluated expression, a message may be routed for local delivery, delivered to a remote host using standard MX record resolution, or sent through a predefined relay host. This allows administrators to implement custom delivery logic, such as domain-based routing or policy-based relaying.

- [Scheduling Strategy](/docs/mta/outbound/schedule): The scheduling strategy governs how messages are queued and retried. It determines which virtual queue should be used, how frequently delivery attempts should be made, how messages are prioritized, and when undeliverable messages should be expired. This allows the configuration of tailored retry policies for different domains or message types.

- [Connection Strategy](/docs/mta/outbound/connection): The connection strategy defines how the MTA should establish outbound connections to remote mail servers. It includes settings such as the source IP address, connection timeouts, and the use of custom EHLO domains. This strategy enables control over the low-level connection behavior, which can be useful for multi-homed systems, policy enforcement, or failover setups.

- [TLS Strategy](/docs/mta/outbound/tls): The TLS strategy determines the transport-layer security settings to use when delivering mail. It controls whether DANE or MTA-STS should be enforced and certificate validation policies. These settings ensure secure transmission of messages and compliance with security requirements of recipient domains.

Each strategy type operates independently, but together they define a complete and customizable delivery policy for the MTA. Strategies are configured through declarative expressions, allowing highly dynamic behavior without modifying the core configuration.

## Configuration

In Stalwart MTA, delivery behavior is governed by strategy expressions configured under the `queue.strategy.route`, `queue.strategy.schedule`, `queue.strategy.connection`, and `queue.strategy.tls` settings. Each of these settings defines a specific type of delivery strategy—routing, scheduling, connection, and TLS, respectively. Strategies are expressed as dynamic expressions that are evaluated at runtime for each recipient, allowing the system to determine the appropriate handling logic based on message-specific attributes.

The values assigned to these strategy settings are expressions written in Stalwart's [expression language](/docs/configuration/expressions/overview). These expressions return the name of the strategy to be used. They are evaluated separately for each recipient in a message, allowing fine-grained and context-aware decision-making. The expressions have access to a wide set of [variables](/docs/configuration/variables#mta-variables) that provide information about the message, its origin, recipients, delivery status, and more. These variables enable administrators to create dynamic and flexible strategies tailored to a wide variety of use cases.

Expressions can use variables to match against domain names, message metadata, delivery conditions, or error states. Based on the result, a named strategy (defined elsewhere in the configuration) is selected and applied. For example, an administrator might configure `queue.strategy.route` to use a different routing strategy for internal domains, or configure `queue.strategy.schedule` to apply more aggressive retry behavior for certain high-priority messages.

## Example

The following example demonstrates how to configure the various delivery strategies in Stalwart MTA.

```toml
[queue.strategy]
route = [ { if = "is_local_domain('', rcpt_domain)", then = "'local'" }, 
          { else = "'mx'" } ]

[queue.strategy]
schedule = [ { if = "is_local_domain('*', rcpt_domain)", then = "'local'" }, 
             { if = "source == 'dsn'", then = "'dsn'" }, 
             { if = "source == 'report'", then = "'report'" }, 
             { else = "'remote'" } ]

[queue.strategy]
connection = [ { if = "retry_num > 0 && last_error == 'connection'", then = "'long-timeout'" }, 
               { else = "'default'" } ]

[queue.strategy]
tls = [ { if = "retry_num > 0 && last_error == 'tls'", then = "'invalid-tls'" }, 
        { else = "'default'" } ]
```
