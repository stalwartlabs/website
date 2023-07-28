---
sidebar_position: 5
---

# WebSockets

WebSockets is a protocol described in [RFC6455](https://www.rfc-editor.org/rfc/rfc6455) that allows clients to a start two-way
communication channels with a web server. Unlike HTTP that is unidirectional and requires clients
to create a new connection for each request, a WebSocket creates a full-duplex persistent connection
with the server in which data can be exchanged in both directions.

## JMAP over WebSocket

JMAP over WebSocket is a subprotocol described in [RFC8887](https://www.rfc-editor.org/rfc/rfc8887.html) that allows the
JMAP protocol to be used over a WebSocket transport layer. 
Using JMAP over WebSocket provides higher performance than JMAP over HTTP by keeping a single persistent connection open between
JMAP clients and servers, which eliminates the performance hit of having to process and authenticate multiple HTTP requests from clients.
When using JMAP over WebSocket, clients are only authenticated once when the connection is started and their credentials remain in effect 
for the duration of the WebSocket connection.

JMAP over WebSocket is enabled by default in Stalwart JMAP and is available to JMAP clients at ``wss://your-domain.org``.

## Configuration

The WebSocket following parameters can be configured under the `jmap.web-sockets` section:

- ``timeout``: Connection timeout for WS clients, the amount of seconds before a WS connection times out. Defaults to 10 seconds.
- ``heartbeat``: Heartbeat interval, the amount of seconds between heartbeat packets sent to WS clients. Defaults to 5 seconds.
- ``throttle``: Notifications throttle, the amount of time to wait before sending a batch of notifications to a WS client. Defaults to 1000 milliseconds (1 second).

Example:

```toml
[jmap.web-sockets]
throttle = "1s"
timeout = "10m"
heartbeat = "1m"
```

## Conformed RFCs

- [RFC 6455 - The WebSocket Protocol](https://www.rfc-editor.org/rfc/rfc6455)
- [RFC 8307 - Well-Known URIs for the WebSocket Protocol](https://www.rfc-editor.org/rfc/rfc8307)
- [RFC 8441 - Bootstrapping WebSockets with HTTP/2](https://www.rfc-editor.org/rfc/rfc8441)
- [RFC 8887 - A JSON Meta Application Protocol (JMAP) Subprotocol for WebSocket](https://www.rfc-editor.org/rfc/rfc8887)
