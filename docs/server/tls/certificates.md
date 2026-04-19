---
sidebar_position: 2
---

# Certificates

When TLS is terminated on the server with manually provided certificates, Stalwart parses each certificate at load time and extracts its Subject Alternative Names. The extracted names drive certificate selection during the TLS handshake: the server matches the hostname from the client's Server Name Indication (SNI) extension against the stored SAN list and presents the matching certificate. SNI is what makes it possible to host several domains on a single IP address and still serve the correct certificate for each connection.

For clients that do not send an SNI value, the server falls back to a single default certificate. This default is selected globally by [`defaultCertificateId`](/docs/ref/object/system-settings#defaultcertificateid) on the [SystemSettings](/docs/ref/object/system-settings) singleton, which points at one of the configured Certificate records.

## Configuration

Certificates are stored as [Certificate](/docs/ref/object/certificate) objects (found in the WebUI under <!-- breadcrumb:Certificate --><!-- /breadcrumb:Certificate -->). Each record carries:

- [`certificate`](/docs/ref/object/certificate#certificate): the PEM-encoded certificate chain. Accepts direct text, an environment-variable reference, or a file reference.
- [`privateKey`](/docs/ref/object/certificate#privatekey): the PEM-encoded private key. A secret value; typically loaded from a file rather than stored inline.
- [`subjectAlternativeNames`](/docs/ref/object/certificate#subjectalternativenames): the SAN list parsed from the certificate. Server-set, so manual entry is not needed.
- [`notValidBefore`](/docs/ref/object/certificate#notvalidbefore) / [`notValidAfter`](/docs/ref/object/certificate#notvalidafter): the certificate's validity window. Server-set.
- [`issuer`](/docs/ref/object/certificate#issuer): the issuing certificate authority. Server-set.

For example, a certificate pasted inline with its private key read from a file on disk:

```json
{
  "certificate": {
    "@type": "Text",
    "value": "-----BEGIN CERTIFICATE-----\nMIIFCTCCAvGgAwIBAgIUCgHGQYUqtelbHGVSzCVwBL3fyEUwDQYJKoZIhvcNAQEL\n...\n0fR8+xz9kDLf8xupV+X9heyFGHSyYU2Lveaevtr2Ij3weLRgJ6LbNALoeKXk\n-----END CERTIFICATE-----\n"
  },
  "privateKey": {
    "@type": "File",
    "filePath": "/opt/stalwart-smtp/etc/private/tls.key"
  }
}
```

## Reloading certificates

When a certificate file is rotated on disk, the running server needs to be told to re-read it. This can be triggered without stopping the server from the [WebUI](/docs/management/webui/overview) or the [CLI](/docs/management/cli/overview).
