---
sidebar_position: 2
title: "Certificates"
description: "Install TLS certificates, the accepted formats, how the server chooses a certificate for each connection, renewal and expiry, and reloading certificates without a restart."
---

A TLS certificate lets clients verify that they have reached the right server before they send credentials or mail over the connection. Stalwart keeps every certificate it uses as a [Certificate](/docs/ref/object/certificate) object, whether the certificate was issued through ACME or installed by an administrator. The objects are found in the WebUI under <!-- breadcrumb:Certificate --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></svg> TLS › Certificates<!-- /breadcrumb:Certificate -->.

Certificate objects are stored in the data store with the rest of the configuration. A cluster therefore shares them, and backups of the data store include them.

This page describes how to install a certificate by hand, how the server chooses a certificate for each connection, and what happens when certificates are renewed or expire.

## Installing a certificate

Certificates obtained through [ACME](/docs/server/tls/acme/) need no manual installation. Installing a certificate by hand is the only way to use an RSA certificate, a certificate from an authority without ACME support, or one issued by an internal authority. ACME certificates use ECDSA P-256 keys.

A Certificate has two fields to fill in:

- [`certificate`](/docs/ref/object/certificate#certificate) holds the certificate chain in PEM format: the server certificate first, followed by the intermediate certificates.
- [`privateKey`](/docs/ref/object/certificate#privatekey) holds the private key in PEM format. The key must be unencrypted. PKCS#8 (`BEGIN PRIVATE KEY`), PKCS#1 RSA (`BEGIN RSA PRIVATE KEY`) and SEC1 EC (`BEGIN EC PRIVATE KEY`) keys are accepted.

A key protected with a passphrase is not rejected at once. It is accepted when the object is saved, but it cannot be used: when the certificates are loaded, the certificate is reported with `Invalid certificate: No private keys found.`

Both fields take their value in one of three forms: inline (`Text`), from an environment variable (`EnvironmentVariable`) or from a file (`File`). The file form suits certificates that another tool maintains on disk. The server reads the file when it loads the certificates, so a file replaced on disk takes effect only after a reload, as described below. In a cluster, the file must exist on every node.

The remaining fields, [`subjectAlternativeNames`](/docs/ref/object/certificate#subjectalternativenames), [`notValidBefore`](/docs/ref/object/certificate#notvalidbefore), [`notValidAfter`](/docs/ref/object/certificate#notvalidafter) and [`issuer`](/docs/ref/object/certificate#issuer), are not filled in. The server reads them from the certificate.

The following Certificate reads both values from files maintained by another tool:

```json
{
  "certificate": {"@type": "File", "filePath": "/etc/stalwart/tls/fullchain.pem"},
  "privateKey": {"@type": "File", "filePath": "/etc/stalwart/tls/privkey.pem"}
}
```

Errors are reported at two moments. A certificate that cannot be parsed is refused when it is saved, with `Failed to read certificate: <reason>`. A certificate whose key cannot be used is saved, but reported as a configuration error on its object when the certificates are loaded, for example `Invalid certificate: Failed to read private key PEM: <reason>`. Such a certificate is not used.

## Certificate selection

A server that hosts several domains holds several certificates, and must present the right one on each connection. The client names the host it wants through Server Name Indication (SNI), a field of the TLS handshake. From that name, the server selects one certificate, trying the following in order:

1. A certificate whose subject alternative names contain the requested name exactly.
2. Otherwise, a wildcard certificate for the parent domain: `*.example.com` covers `mail.example.com`.
3. Otherwise, or when the client sends no name, the default certificate. That is the certificate selected by [`SystemSettings.defaultCertificateId`](/docs/ref/object/system-settings#defaultcertificateid). When that field is not set, it is the certificate that covers the server hostname, [`defaultHostname`](/docs/ref/object/system-settings#defaulthostname), exactly or through a wildcard for its parent domain.
4. When there is no default certificate, the choice depends on what is loaded. If the loaded certificates cover exactly one name, the certificate for that name is used. If they cover several names, an arbitrary one is used and a `tls.multiple-certificates-available` warning is logged. If no certificate is loaded, the server presents a self-signed certificate for `localhost`.

A request for a name without a matching certificate also logs a `tls.certificate-not-found` event. When several certificates cover the same name, the one with the latest expiry date is used for that name.

In most deployments the default needs no configuration. Because the certificate for the server hostname becomes the default when `defaultCertificateId` is not set, an ACME certificate that covers the hostname is presented to clients that send no name, and to clients that request an unknown name. Set `defaultCertificateId` only when another certificate must take that role, or when no certificate covers the hostname.

Clients reject the self-signed certificate, and every certificate that does not cover the name they connected to. A server reached under several names therefore needs certificates that cover all of them. [TLS certificates](/docs/domains/tls-certificates) lists the names an ACME certificate covers.

## Renewal and expiry

When ACME renews a certificate, it creates a new Certificate object instead of changing the old one. If the certificate it replaces was the default certificate and covers the same names, the default moves to the new object. The old object is kept until it expires.

The server checks validity dates only when it loads the certificates. That happens at startup, after each ACME renewal, and at a `ReloadTlsCertificates` action. Expired certificates are deleted at that point, and each deletion logs a `tls.expired-certificate-removed` event.

There is no periodic check, which has three consequences for manual certificates:

- A certificate that expires while it is loaded is still presented until the next load. Replace a manual certificate before it expires.
- A certificate whose `notValidBefore` lies in the future is skipped, and becomes usable only at the first load after that date. Reload the certificates after the start date of a certificate installed in advance.
- A file-backed certificate whose object was deleted because it expired must be created again. Replacing the file is not enough.

## Reloading certificates

Certificates renewed by ACME are loaded automatically. Every other change takes effect only when the certificates are reloaded, or at the next restart. This covers a Certificate object created, changed or deleted through the WebUI, the CLI or the API, and a certificate file replaced on disk.

The certificates are reloaded with the `ReloadTlsCertificates` [action](/docs/management/tasks-actions/actions), from the WebUI or with the CLI:

```sh
stalwart-cli create Action/ReloadTlsCertificates
```

A reload does not interrupt existing connections, and new connections use the reloaded certificates. In a cluster, changes and the reload reach the other nodes only when a [coordinator](/docs/cluster/coordination/) is configured.
