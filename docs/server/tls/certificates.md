---
sidebar_position: 2
---

# Certificates

When deploying TLS encryption with manually provided certificates, Stalwart automatically parses each certificate to extract all available subject names embedded within the certificate. These subject names indicate the domains and subdomains for which the certificate is valid, essentially determining the scope of its applicability for securing connections.

During the TLS handshake process (the initial phase of establishing a TLS-secured connection) the server dynamically selects the appropriate certificate to present based on the server name provided by the client via the Server Name Indication (SNI) extension. SNI is a TLS extension that allows a client to specify the host it is trying to connect to at the start of the handshake process. This capability is crucial for servers hosting multiple domains or services under a single IP address, enabling them to present the correct certificate matching the requested domain.

While Stalwart's automatic parsing and selection mechanism efficiently handles the determination and usage of certificates based on SNI, administrators also have the option to manually specify the list of subjects (i.e., domain names) for which a certificate is valid. However, this manual specification is generally unnecessary, given the server's ability to intelligently derive this information directly from the certificate itself.

In scenarios where a client does not provide an SNI server name (possibly due to older client software or specific configuration choices) Stalwart allows for the configuration of a default certificate. This default certificate is used for TLS connections in which the client does not specify a server name, ensuring that the connection remains secure even when the optimal certificate selection via SNI is not possible.

## Configuration

TLS certificates are defined in the configuration file under the `certificate.<name>` key and require the following parameters:

- `cert`: The path or content of the TLS certificate file. This can either be directly embedded in the configuration file or referenced from an external file using a [file macro](/docs/configuration/macros).
- `private-key`: The path or content of the TLS private key file. This should not be embedded directly in the configuration file, and instead be referenced from an external file using a [file macro](/docs/configuration/macros).
- `subjects`: The list of subject alternative names (SANs) for the certificate. This is an optional parameter and can be used to specify additional domain names or IP addresses for which the certificate is valid.
- `default`: If set to `true`, this certificate will be used when the client does not provide an SNI server name.

The following example defines a TLS certificate named `default` with an embedded certificate and the contents of the private key read from a file:

```toml
[certificate."default"]
cert = '''-----BEGIN CERTIFICATE-----
MIIFCTCCAvGgAwIBAgIUCgHGQYUqtelbHGVSzCVwBL3fyEUwDQYJKoZIhvcNAQEL
...
0fR8+xz9kDLf8xupV+X9heyFGHSyYU2Lveaevtr2Ij3weLRgJ6LbNALoeKXk
-----END CERTIFICATE-----
'''
private-key = "%{file:/opt/stalwart-smtp/etc/private/tls.key}%"
```

## Reloading certificates

When TLS certificates are updated, it is necessary to reload them in order for the changes to take effect. This can be done without stopping the server by using the [web-admin](/docs/management/webadmin/overview) or [command line interface](/docs/management/cli/overview).
