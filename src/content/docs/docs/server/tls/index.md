---
sidebar_position: 1
title: "Overview"
description: "TLS in Stalwart: how certificates are obtained, the protocol versions, cipher suites and key exchange groups offered, and the per-listener TLS settings."
---

Mail clients send passwords and messages to the server, and other mail servers deliver messages to it. TLS encrypts these connections, so that nobody on the network path can read or alter them, and lets the client verify that it is talking to the right server. Stalwart encrypts connections with TLS on every listener that has TLS enabled.

Two things are needed for that. The first is a certificate for each name that clients connect to, which proves the server's identity. The second is the TLS settings of each listener, which determine whether a connection starts with TLS and which protocol versions and cipher suites the listener accepts.

## Certificates

Certificates are obtained in one of two ways:

- [ACME](/docs/server/tls/acme/) obtains and renews certificates automatically from a certificate authority such as Let's Encrypt. It is enabled per domain.
- Certificates issued by another authority, including an internal one, are installed by hand, as described in [Certificates](/docs/server/tls/certificates).

Both kinds are stored as Certificate objects. For each connection, the server chooses among them from the name that the client requests.

## Scope of this section

This section covers the server side of TLS, which means the connections that clients and other servers open to Stalwart. TLS for the deliveries that Stalwart itself makes over SMTP is configured separately, including DANE and MTA-STS enforcement. [Outbound TLS](/docs/mta/outbound/tls), [DANE](/docs/mta/transport-security/dane) and [MTA-STS](/docs/mta/transport-security/mta-sts) describe it.

## Listener settings

TLS is configured per listener, on the [NetworkListener](/docs/ref/object/network-listener) object (found in the WebUI under <!-- breadcrumb:NetworkListener --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › Listeners<!-- /breadcrumb:NetworkListener -->). Each listener makes a few decisions about TLS.

The first decision is whether the listener uses TLS at all, and when the connection becomes encrypted:

- [`useTls`](/docs/ref/object/network-listener#usetls) enables TLS on the listener. [STARTTLS not offered or TLS handshake fails](/docs/server/listener#starttls-not-offered-or-tls-handshake-fails) lists the usual causes of TLS failures on a listener.
- [`implicitTls`](/docs/ref/object/network-listener#implicittls) starts every connection with a TLS handshake. Without it, the mail protocols begin in plain text and offer STARTTLS, a command with which the client upgrades the connection to TLS. [Listeners](/docs/server/listener#implicit-tls-and-starttls) explains the two modes.
- [`tlsTimeout`](/docs/ref/object/network-listener#tlstimeout) limits the time a client has to complete the handshake.

The second decision is which parts of TLS the listener accepts:

- [`tlsDisableProtocols`](/docs/ref/object/network-listener#tlsdisableprotocols) lists the TLS versions to refuse, `tls12` or `tls13`. When the list is empty, both are accepted. Disabling both has the same effect as disabling none: both remain enabled.
- [`tlsDisableCipherSuites`](/docs/ref/object/network-listener#tlsdisableciphersuites) lists the cipher suites to refuse. It does not affect key exchange groups.
- [`tlsIgnoreClientOrder`](/docs/ref/object/network-listener#tlsignoreclientorder) decides whose preference counts when the client and the server both support several cipher suites. When it is enabled, the server chooses in its own order of preference. When it is disabled, the client's order is used. It is <!-- default:NetworkListener.tlsIgnoreClientOrder as=enabled -->enabled<!-- /default --> unless changed.

The certificate is not a listener setting. Clients that do not send a server name receive the certificate selected by [`SystemSettings.defaultCertificateId`](/docs/ref/object/system-settings#defaultcertificateid), and [Certificates](/docs/server/tls/certificates#certificate-selection) describes the full selection.

## Protocol versions

TLS 1.2 and TLS 1.3 are supported. Earlier versions, including TLS 1.1 and 1.0, are not offered.

## Cipher suites

A cipher suite is the combination of algorithms that protects a connection once the handshake is complete. The server offers the following nine cipher suites, in this order of preference. The names are the values that `tlsDisableCipherSuites` accepts, and a listener offers all of them except the ones it disables.

| Version | Cipher suite |
|---|---|
| TLS 1.3 | `tls13-aes-256-gcm-sha384` |
| TLS 1.3 | `tls13-aes-128-gcm-sha256` |
| TLS 1.3 | `tls13-chacha20-poly1305-sha256` |
| TLS 1.2 | `tls-ecdhe-ecdsa-with-aes-256-gcm-sha384` |
| TLS 1.2 | `tls-ecdhe-ecdsa-with-aes-128-gcm-sha256` |
| TLS 1.2 | `tls-ecdhe-ecdsa-with-chacha20-poly1305-sha256` |
| TLS 1.2 | `tls-ecdhe-rsa-with-aes-256-gcm-sha384` |
| TLS 1.2 | `tls-ecdhe-rsa-with-aes-128-gcm-sha256` |
| TLS 1.2 | `tls-ecdhe-rsa-with-chacha20-poly1305-sha256` |

The TLS 1.2 suites depend on the type of the certificate's key. The suites with ECDSA work only with an ECDSA certificate, and those with RSA only with an RSA certificate. Certificates issued through ACME use ECDSA keys.

## Key exchange groups

A key exchange group is the algorithm with which the client and the server agree on the keys for the connection. The server offers a fixed set of groups, which cannot be configured:

- `X25519MLKEM768`, a hybrid of X25519 and the post-quantum ML-KEM-768. It is used with TLS 1.3 by clients that support it, including current web browsers.
- `X25519`
- `SECP256R1`
- `SECP384R1`

The client's order of preference decides which group is used, because `tlsIgnoreClientOrder` applies to cipher suites only.

## Example

The following listener accepts submission with STARTTLS on port 587. It accepts TLS 1.3 only, and refuses the AES-256 suite:

```json
{
  "name": "submission",
  "protocol": "smtp",
  "bind": {"[::]:587": true},
  "useTls": true,
  "implicitTls": false,
  "tlsDisableProtocols": {"tls12": true},
  "tlsDisableCipherSuites": {"tls13-aes-256-gcm-sha384": true}
}
```

The same restriction on port 25 is not advisable. Many sending servers still use TLS 1.2, and a sender that cannot negotiate TLS either delivers in plain text or fails, depending on its policy.
