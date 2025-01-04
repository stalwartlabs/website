---
sidebar_position: 5
---

# Variables

Context or environment variables may be used in certain settings of the configuration file that accept [expressions](/docs/configuration/expressions/overview). The available context variables for evaluation vary depending on the setting and can include:

- `remote_ip`: The IP address of the client for inbound sessions and the remote server's IP address for outbound sessions.
- `remote_port`: The remote clients's port number for an inbound session.
- `local_ip`: The local server's IP address used in an outbound connection (available only when a source IP is specified).
- `local_port`: The local server's port number for an inbound connection.
- `listener`: The listener ID where the connection was initiated for inbound sessions.
- `is_tls`: A boolean value indicating whether the session is encrypted using TLS.
- `asn`: The Autonomous System Number of the remote IP address.
- `country`: The country code of the remote IP address.
- `protocol`: The protocol used for the session (`smtp`, `imap`, `http`, etc.).
- `sender`: The return path address specified in the MAIL FROM command for inbound sessions and the sender's address for outbound sessions.
- `sender_domain`: The return path domain name specified in the MAIL FROM command for inbound sessions and the sender's domain name for outbound sessions.
- `rcpt`: The recipient's address.
- `rcpt_domain`: The recipient's domain name.
- `recipients`: An array of recipient addresses.
- `priority`: The priority provided using the MT-PRIORITY extension.
- `authenticated_as`: The account name used to authenticate the session for inbound sessions, or an empty value if the session is unauthenticated.

## Queue Variables

The following additional variables are available for use in queue expressions:

- `mx`: The remote mail exchanger's hostname for outbound sessions.
- `retry_num`: The number of times the message has been retried.
- `notify_num`: The number of times the sender of the message has been notified.
- `last_error`: The last error message type encountered during delivery attempts.
- `last_status`: The last status code returned by the remote server during delivery attempts.

## HTTP Variables

The following additional variables are available for use in HTTP expressions:

- `url`: The URL of the HTTP request.
- `url_path`: The path component of the URL.
- `headers`: An array of HTTP headers in the format `Header-Name: Header-Value`.
- `method`: The HTTP method used in the request (`GET`, `POST`, etc.).
