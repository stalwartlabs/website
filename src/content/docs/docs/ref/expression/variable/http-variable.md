---
title: "HttpVariable"
description: "Variables available in expression contexts referencing HttpVariable."
custom_edit_url: null
---



Variables available in expression contexts that reference `HttpVariable`.

| Variable | Description |
|---|---|
| `listener` | Name of the listener that accepted the request |
| `remote_ip` | IP address of the client |
| `remote_port` | Port of the client (number) |
| `local_ip` | Local IP address the client connected to |
| `local_port` | Local port the client connected to (number) |
| `protocol` | https when the connection uses TLS, otherwise http |
| `is_tls` | Whether the connection uses TLS (boolean) |
| `url` | Request URI as received |
| `path` | Path of the request URI |
| `headers` | List of the request headers, each as name: value |
| `method` | HTTP method, such as GET or POST |