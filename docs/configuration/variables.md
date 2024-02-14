---
sidebar_position: 4
---

# Variables

Context or environment variables may be used in certain settings of the configuration file that accept [expressions](/docs/configuration/expressions/overview). The available context variables for evaluation vary depending on the setting and can include:

- `remote_ip`: The IP address of the client for inbound sessions and the remote server's IP address for outbound sessions.
- `local_ip`: The local server's IP address used in an outbound connection (available only when a source IP is specified).
- `listener`: The listener ID where the connection was initiated for inbound sessions.
- `sender`: The return path address specified in the MAIL FROM command for inbound sessions and the sender's address for outbound sessions.
- `sender_domain`: The return path domain name specified in the MAIL FROM command for inbound sessions and the sender's domain name for outbound sessions.
- `rcpt`: The recipient's address.
- `rcpt_domain`: The recipient's domain name.
- `priority`: The priority provided using the MT-PRIORITY extension.
- `authenticated_as`: The account name used to authenticate the session for inbound sessions, or an empty value if the session is unauthenticated.
- `mx`: The remote mail exchanger's hostname for outbound sessions.

