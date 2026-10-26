---
title: "MtaEhloVariable"
description: "Variables available in expression contexts referencing MtaEhloVariable."
custom_edit_url: null
---



Variables available in expression contexts that reference `MtaEhloVariable`.

| Variable | Description |
|---|---|
| `listener` | Name of the listener that accepted the connection |
| `remote_ip` | IP address of the client |
| `remote_port` | Port of the client (number) |
| `local_ip` | Local IP address the client connected to |
| `local_port` | Local port the client connected to (number) |
| `protocol` | Listener protocol, smtp or lmtp |
| `is_tls` | Whether the connection uses TLS (boolean) |
| `helo_domain` | Host name given in EHLO or HELO, empty before it is sent |
| `asn` | Autonomous system number of the client, 0 when unknown |
| `country` | Country code of the client, empty when unknown |