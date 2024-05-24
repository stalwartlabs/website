---
sidebar_position: 2
---

# Listeners

Stalwart Mail Server offers the ability to configure multiple listeners, which are responsible for receiving incoming TCP connections. There is no limit to the number of listeners that can be created, and the behavior of each listener can be customized by the administrator. 

## Bind settings

Listeners are set up in the configuration file using the `server.listener.<id>.bind` attribute and specifying the IP addresses and ports where the listener will receive incoming connections. A listener can be bound to multiple IP v4 or v6 addresses and ports, for example:

```toml
[server.listener."smtp"]
bind = ["192.0.2.1:25", "203.0.113.9:25", "2001:db8::2"]
```

Or, to bind a listener to all interfaces:

```toml
[server.listener."smtp"]
bind = "[::]:25"
```

## Protocol

Listeners require the `protocol` attribute to be set to the protocol that the listener should use to receive incoming connections:

- `http`: HTTP protocol.
- `imap`: IMAP protocol.
- `smtp`: SMTP protocol.
- `pop3`: POP3 protocol.
- `lmtp`: LMTP protocol.
- `managesieve`: ManageSieve protocol.

For example, to start an SMTP server on port 25 and an IMAP server on port 143, you can use the following configuration:

```toml
[server.listener."smtp"]
bind = ["[::]:25"]
protocol = "smtp"

[server.listener."imap"]
bind = ["[::]:143"]
protocol = "imap"
```


## Maximum connections

Listeners can be configured to limit the number of simultaneous connections that they can handle at any given moment. This setting is controlled by the `server.max-connections` parameter in the configuration file:

```toml
[server]
max-connections = 8192
```

This value can also be overridden on a per-listener basis by setting the `max-connections` parameter in the listener's configuration, for example:

```toml
[server.listener."submissions"]
bind = ["[::]:465"]
protocol = "smtp"
tls.implicit = true
max-connections = 1024
```

## TCP socket options

The default TCP socket options for the server can be found under the `server.socket` key and include the following options:

- `reuse-addr:` Specifies whether the socket can be bound to an address that is already in use by another socket. Setting this option to `true` allows the socket to reuse the address and helps reduce the number of errors caused by trying to bind to an address that is already in use.
- `reuse-port`: Specifies whether multiple sockets can be bound to the same address and port. Setting this option to `true` allows multiple sockets to listen on the same port, which can be useful in some load balancing scenarios.
- `backlog`: Specifies the maximum number of incoming connections that can be pending in the backlog queue. When the number of incoming connections exceeds this value, new connections may be rejected.
- `ttl`: Specifies the time-to-live (TTL) value for the socket, which determines how many hops a packet can make before it is discarded.
- `send-buffer-size`: Specifies the size of the buffer used for sending data. Increasing the size of the buffer can help improve the performance of the socket, but also increases memory usage.
- `recv-buffer-size`: Specifies the size of the buffer used for receiving data. Increasing the size of the buffer can help improve the performance of the socket, but also increases memory usage.
- `linger`: Specifies the time to wait before closing a socket when there is still unsent data. Setting this option to a non-zero value can help ensure that all data is sent before the socket is closed.
- `tos`: Specifies the type of service (TOS) value for the socket, which determines the priority of the traffic sent through the socket.
- `nodelay`: Specifies whether the Nagle algorithm should be disabled for the socket. Setting this option to `true` can help improve the performance of the socket, but may also increase network traffic.

It is possible to override the default TCP socket options on a per-listener basis as detailed in the following sections.

## Overriding defaults

Both the TLS settings and TCP socket options can be customized for each listener individually by adding the desired attribute to the `server.listener.<id>` key of that specific listener. For example, to override implicit TLS for a listener:

```toml
[server.listener."submissions"]
tls.implicit = true

[server.tls]
implicit = false
```

Or, to increase the backlog for a certain listener:

```toml
[server.listener."smtp"]
socket.backlog = 2048

[server.socket]
backlog = 1024
```

## Example

The following example defines an SMTP listener on port `25`, an SMTP submissions listener on port `587` and a secure SMTP submissions listener on port `465` with implicit TLS enabled:

```toml
[server.listener."smtp"]
bind = ["[::]:25"]
protocol = "smtp"

[server.listener."submission"]
bind = ["[::]:587"]
protocol = "smtp"

[server.listener."submissions"]
bind = ["[::]:465"]
protocol = "smtp"
tls.implicit = true

[server.listener."management"]
bind = ["127.0.0.1:8080"]
protocol = "http"
```

