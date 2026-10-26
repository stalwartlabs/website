---
title: "MtaRcptToVariable"
description: "Variables available in expression contexts referencing MtaRcptToVariable."
custom_edit_url: null
---



Variables available in expression contexts that reference `MtaRcptToVariable`.

| Variable | Description |
|---|---|
| `sender` | MAIL FROM address in lowercase, empty for the null sender |
| `sender_domain` | Domain of the MAIL FROM address, empty for the null sender |
| `recipients` | List of the RCPT TO addresses accepted so far |
| `rcpt` | Most recent RCPT TO address in lowercase |
| `rcpt_domain` | Domain of the most recent RCPT TO address |
| `authenticated_as` | Name of the authenticated account, empty when the session is not authenticated |
| `listener` | Name of the listener that accepted the connection |
| `remote_ip` | IP address of the client |
| `remote_port` | Port of the client (number) |
| `local_ip` | Local IP address the client connected to |
| `local_port` | Local port the client connected to (number) |
| `protocol` | Listener protocol, smtp or lmtp |
| `is_tls` | Whether the connection uses TLS (boolean) |
| `priority` | MT-PRIORITY value (number, from -9 to 9, 0 when not set) |
| `helo_domain` | Host name given in EHLO or HELO, empty before it is sent |
| `asn` | Autonomous system number of the client, 0 when unknown |
| `country` | Country code of the client, empty when unknown |