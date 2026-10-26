---
title: "MtaMailFromVariable"
description: "Variables available in expression contexts referencing MtaMailFromVariable."
custom_edit_url: null
---



Variables available in expression contexts that reference `MtaMailFromVariable`.

| Variable | Description |
|---|---|
| `listener` | Name of the listener that accepted the connection |
| `remote_ip` | IP address of the client |
| `remote_port` | Port of the client (number) |
| `local_ip` | Local IP address the client connected to |
| `local_port` | Local port the client connected to (number) |
| `protocol` | Listener protocol, smtp or lmtp |
| `is_tls` | Whether the connection uses TLS (boolean) |
| `sender` | MAIL FROM address in lowercase, empty for the null sender |
| `sender_domain` | Domain of the MAIL FROM address, empty for the null sender |
| `authenticated_as` | Name of the authenticated account, empty when the session is not authenticated |
| `asn` | Autonomous system number of the client, 0 when unknown |
| `country` | Country code of the client, empty when unknown |