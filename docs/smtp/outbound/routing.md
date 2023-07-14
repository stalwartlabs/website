---
sidebar_position: 2
---

# Routing

Stalwart SMTP allows to define how messages should be delivered to their final destination through routing rules. Rules are configured under the `queue.outbound.next-hop` parameter, which can either point to a [remote host](#remote-hosts) defined in the configuration file or contain the value `false` which indicates that the message delivery should be done through DNS resolution. Routing rules are useful for tasks such as forwarding messages for local domains to a message store over LMTP.

## Remote Hosts

Remote hosts enable the definition of external SMTP and LMTP servers for the purpose of relaying messages. These servers are specified in the configuration file using the `remote.<id>` keys, where `<id>` is the internal identifier for the host.

### Host Settings

For each remote host, the following parameters can be specified as sub-keys of `remote.<id>`:

- `address`: The fully-qualified domain name of the remote server, for example "mail.domain.org".
- `port`: The port on the remote server that should be used for the connection.
- `protocol`: The communication protocol to use, with valid options being `lmtp` or `smtp`.
- `concurrency`: The maximum number of open connections to the remote host that can be established at any given time (default is `10`).
- `timeout`: The time limit for establishing a connection to the remote host (default is `60s`).

### TLS Options

The configuration of TLS for remote servers is managed through the following parameters, which are located under the `remote.<id>.tls` key in the configuration file:

- `implicit`: Specifies whether TLS should be implicitly established upon connecting to the remote host, or if it should be negotiated on a clear-text connection using the `STARTTLS` command (defaults to `true`).
- `allow-invalid-certs`: A flag indicating whether self-signed and invalid certificates should be accepted (defaults to `false`).

### Authentication

Authentication can be configured using the following parameters located under the `remote.<id>.auth` key in the configuration file:

- `username`: The username to be used for authentication.
- `secret`: The password to be used for authentication.

## Example

```toml
[queue.outbound]
next-hop = [ { if = "rcpt-domain", in-list = "sql/domains", then = "lmtp" }, 
             { else = false } ]

[remote."lmtp"]
address = "localhost"
port = 24
protocol = "lmtp"
concurrency = 10
timeout = "1m"

[remote."lmtp".tls]
implicit = false
allow-invalid-certs = true

[remote."lmtp".auth]
username = "relay_server"
secret = "123456"
```

