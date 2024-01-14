---
sidebar_position: 2
---

# Certificates

TLS certificates are defined in the configuration file under the `certificate.<name>` key and require the following parameters:

- `cert`: The path or content of the TLS certificate file. This can either be directly embedded in the configuration file or referenced from an external file using the `file://` prefix.
- `private-key`: The path or content of the TLS private key file. This should not be embedded directly in the configuration file, and instead be referenced from an external file using the `file://` prefix.

The following example defines a TLS certificate named `default` with an embedded certificate and the contents of the private key read from a file:

```toml
[certificate."default"]
cert = '''-----BEGIN CERTIFICATE-----
MIIFCTCCAvGgAwIBAgIUCgHGQYUqtelbHGVSzCVwBL3fyEUwDQYJKoZIhvcNAQEL
...
0fR8+xz9kDLf8xupV+X9heyFGHSyYU2Lveaevtr2Ij3weLRgJ6LbNALoeKXk
-----END CERTIFICATE-----
'''
private-key = "file:///opt/stalwart-smtp/etc/private/tls.key"
```

## Reloading certificates

When TLS certificates are updated, it is necessary to reload them in order for the changes to take effect. This can be done without stopping the server by using the [command line interface](/docs/management/config#tls-certificates).
