---
sidebar_position: 3
---

# WebSockets

WebSockets is a protocol described in [RFC6455](https://www.rfc-editor.org/rfc/rfc6455) that allows clients to a start two-way communication channels with a web server. Unlike HTTP that is unidirectional and requires clients to create a new connection for each request, a WebSocket creates a full-duplex persistent connection with the server in which data can be exchanged in both directions.

## JMAP over WebSocket

JMAP over WebSocket is a subprotocol described in [RFC8887](https://www.rfc-editor.org/rfc/rfc8887.html) that allows the JMAP protocol to be used over a WebSocket transport layer. 
Using JMAP over WebSocket provides higher performance than JMAP over HTTP by keeping a single persistent connection open between JMAP clients and servers, which eliminates the performance hit of having to process and authenticate multiple HTTP requests from clients.
When using JMAP over WebSocket, clients are only authenticated once when the connection is started and their credentials remain in effect  for the duration of the WebSocket connection.

JMAP over WebSocket is enabled by default in Stalwart and is available to JMAP clients at `wss://your-domain.example`.

## Ticket-Based Authentication

Browser-based JMAP clients face a limitation when connecting to WebSockets: browsers do not allow setting custom HTTP headers (like `Authorization`) on WebSocket connections. To solve this, Stalwart supports ticket-based authentication for WebSocket connections.

### How It Works

1. **Obtain a ticket**: The client makes an authenticated `POST` request to `/jmap/ws/ticket` with a valid access token in the `Authorization` header.
2. **Receive the ticket**: The server returns a short-lived ticket in the response: `{"value": "<ticket>"}`
3. **Connect with the ticket**: The client connects to the WebSocket endpoint with the ticket as a query parameter: `wss://your-domain.example/jmap/ws?ticket=<ticket>`

### Example

```javascript
// Step 1: Get a ticket using the access token
const response = await fetch('https://mail.example.com/jmap/ws/ticket', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <access_token>'
  }
});
const { value: ticket } = await response.json();

// Step 2: Connect to WebSocket using the ticket
const ws = new WebSocket(`wss://mail.example.com/jmap/ws?ticket=${ticket}`);
```

### Security

- Tickets are short-lived (default: 60 seconds) to minimize the window for misuse
- Tickets use the same encryption as OAuth access tokens
- Each ticket is bound to the authenticated user's account
- Rate limiting is applied to both ticket issuance and WebSocket connections

The ticket expiry can be configured with the `oauth.expiry.ws-ticket` setting (see [OAuth Tokens](/docs/auth/oauth/tokens#expiration)).

### Capability Advertisement

The JMAP session response includes information about ticket authentication support:

```json
{
  "capabilities": {
    "urn:ietf:params:jmap:websocket": {
      "url": "wss://mail.example.com/jmap/ws",
      "supportsPush": true,
      "supportsTicketAuth": true,
      "ticketUrl": "https://mail.example.com/jmap/ws/ticket"
    }
  }
}
```

## Configuration

The WebSocket following parameters can be configured under the `jmap.web-socket` section:

- ``timeout``: Connection timeout for WS clients, the amount of seconds before a WS connection times out. Defaults to 10 seconds.
- ``heartbeat``: Heartbeat interval, the amount of seconds between heartbeat packets sent to WS clients. Defaults to 5 seconds.
- ``throttle``: Notifications throttle, the amount of time to wait before sending a batch of notifications to a WS client. Defaults to 1000 milliseconds (1 second).

Example:

```toml
[jmap.web-socket]
throttle = "1s"
timeout = "10m"
heartbeat = "1m"
```

## Conformed RFCs

- [RFC 6455 - The WebSocket Protocol](https://www.rfc-editor.org/rfc/rfc6455)
- [RFC 8307 - Well-Known URIs for the WebSocket Protocol](https://www.rfc-editor.org/rfc/rfc8307)
- [RFC 8441 - Bootstrapping WebSockets with HTTP/2](https://www.rfc-editor.org/rfc/rfc8441)
- [RFC 8887 - A JSON Meta Application Protocol (JMAP) Subprotocol for WebSocket](https://www.rfc-editor.org/rfc/rfc8887)
