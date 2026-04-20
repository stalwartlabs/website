---
sidebar_position: 1
---

# Overview

Transport Layer Security (TLS) encrypts data in transit between Stalwart and its peers, keeping mail and management traffic confidential and tamper-evident. TLS is the usual answer to eavesdropping and machine-in-the-middle attacks against mail transport.

Stalwart supports two ways of obtaining certificates. Manually provided certificates fit organisations with their own certificate authority or strict procurement policies: the certificate and private key are imported into the server and used directly. For operators who prefer automation, Stalwart also implements the ACME protocol and can integrate with ACME-compliant providers such as Let's Encrypt to issue and renew certificates without manual intervention.

## Settings

TLS is configured per listener: each [NetworkListener](/docs/ref/object/network-listener) (found in the WebUI under <!-- breadcrumb:NetworkListener --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › Listeners<!-- /breadcrumb:NetworkListener -->) carries its own TLS fields, and the relevant ones are:

- [`useTls`](/docs/ref/object/network-listener#usetls): whether TLS is available on this listener. Default `true`.
- [`tlsImplicit`](/docs/ref/object/network-listener#tlsimplicit): whether the listener uses implicit TLS (encrypted from the first byte) rather than explicit TLS (upgrade via `STARTTLS`). Default `false`.
- [`tlsTimeout`](/docs/ref/object/network-listener#tlstimeout): how long to wait for the client to complete the TLS handshake. Default `"1m"`.
- [`tlsDisableProtocols`](/docs/ref/object/network-listener#tlsdisableprotocols): TLS versions to refuse on this listener. When empty, both TLS 1.2 and TLS 1.3 are offered.
- [`tlsDisableCipherSuites`](/docs/ref/object/network-listener#tlsdisableciphersuites): cipher suites to refuse. When empty, the full set built into the TLS library is offered.
- [`tlsIgnoreClientOrder`](/docs/ref/object/network-listener#tlsignoreclientorder): whether the server uses its own cipher order. When `false`, the client's preferred order is honoured. Default `true`.

The default certificate used when a client connects without sending an SNI value is selected globally through [`defaultCertificateId`](/docs/ref/object/system-settings#defaultcertificateid) on the [SystemSettings](/docs/ref/object/system-settings) singleton.

## Supported TLS versions

The following TLS versions are supported:

- `TLSv1.3`
- `TLSv1.2`

TLS 1.1 is not supported; it has known security weaknesses and has been deprecated by the major standards bodies and browser vendors.

## Supported cipher suites

The following TLS 1.3 cipher suites are supported:

- `tls13-aes-256-gcm-sha384`
- `tls13-aes-128-gcm-sha256`
- `tls13-chacha20-poly1305-sha256`

The following TLS 1.2 cipher suites are supported:

- `tls-ecdhe-ecdsa-with-aes-256-gcm-sha384`
- `tls-ecdhe-ecdsa-with-aes-128-gcm-sha256`
- `tls-ecdhe-ecdsa-with-chacha20-poly1305-sha256`
- `tls-ecdhe-rsa-with-aes-256-gcm-sha384`
- `tls-ecdhe-rsa-with-aes-128-gcm-sha256`
- `tls-ecdhe-rsa-with-chacha20-poly1305-sha256`

## Supported exchange groups

The following exchange groups are supported:

- `X25519`
- `SECP256R1`
- `SECP384R1`

## Example

The following listener disables TLS 1.2 and two cipher suites, keeping implicit TLS off and the server cipher order preferred:

```json
{
  "name": "submission",
  "protocol": "smtp",
  "bind": ["[::]:587"],
  "useTls": true,
  "tlsImplicit": false,
  "tlsTimeout": "1m",
  "tlsDisableProtocols": ["tls12"],
  "tlsDisableCipherSuites": [
    "tls13-aes-256-gcm-sha384",
    "tls-ecdhe-rsa-with-chacha20-poly1305-sha256"
  ],
  "tlsIgnoreClientOrder": true
}
```
