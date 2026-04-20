---
sidebar_position: 3
---

# TLS certificates

Every Domain that terminates TLS (for SMTP on submission and port 25, IMAP, JMAP, HTTP services, and so on) requires a certificate whose Subject Alternative Names cover the host names used for those services. The Domain object decides whether that certificate is supplied by the operator or obtained automatically from an ACME certificate authority.

## Selecting the management mode

The mode is set through the [`certificateManagement`](/docs/ref/object/domain#certificatemanagement) field on the [Domain](/docs/ref/object/domain) object. Two variants are supported:

- **Manual**: the server expects one or more [Certificate](/docs/ref/object/certificate) objects (found in the WebUI under <!-- breadcrumb:Certificate --><!-- /breadcrumb:Certificate -->) to be provisioned by the operator. The server does not request, renew, or delete certificates in this mode; the operator is responsible for the certificate lifecycle.
- **Automatic**: the server obtains and renews certificates through an [AcmeProvider](/docs/ref/object/acme-provider) (found in the WebUI under <!-- breadcrumb:AcmeProvider --><!-- /breadcrumb:AcmeProvider -->). The variant carries the fields that describe which provider is used and which names should be included in the issued certificate.

## Manual certificates

A Certificate object stores a PEM-encoded public certificate in [`certificate`](/docs/ref/object/certificate#certificate) and the matching private key in [`privateKey`](/docs/ref/object/certificate#privatekey). Both fields accept inline values, an environment variable reference, or a file path, which allows secrets to be injected from the deployment environment rather than stored inline in the database.

Once a Certificate is saved, the server parses it and populates read-only metadata: [`subjectAlternativeNames`](/docs/ref/object/certificate#subjectalternativenames), [`notValidBefore`](/docs/ref/object/certificate#notvalidbefore), [`notValidAfter`](/docs/ref/object/certificate#notvalidafter), and [`issuer`](/docs/ref/object/certificate#issuer). Manual mode does not bind a Domain to a specific Certificate id; instead, the TLS listener matches an incoming connection's Server Name Indication against the Subject Alternative Names of every installed Certificate and presents the newest certificate that matches. Renewal therefore consists of adding a replacement Certificate with the same SAN set before the current one expires, or updating the [`certificate`](/docs/ref/object/certificate#certificate) and [`privateKey`](/docs/ref/object/certificate#privatekey) fields on the existing record.

## Automatic certificates

In automatic mode, [`certificateManagement`](/docs/ref/object/domain#certificatemanagement) carries two fields:

- [`acmeProviderId`](/docs/ref/object/domain#acmeproviderid) references the AcmeProvider responsible for issuing certificates for the domain. The provider object holds the ACME directory URL, the registered account key, the contact address, the challenge type, and the renewal threshold.
- [`subjectAlternativeNames`](/docs/ref/object/domain#subjectalternativenames) lists additional host names to include alongside the domain name itself. Leaving the list empty requests a wildcard certificate where the provider supports it, or uses the default SAN set derived from the Domain.

The AcmeProvider carries the lifecycle settings that apply to every domain bound to it. [`challengeType`](/docs/ref/object/acme-provider#challengetype) selects between `TlsAlpn01`, `Http01`, `Dns01`, and `DnsPersist01`; the DNS-based challenges require the Domain to have automatic DNS management enabled so the server can write the `_acme-challenge` records. [`renewBefore`](/docs/ref/object/acme-provider#renewbefore) expresses how early renewal is attempted, as a fraction of the remaining validity window (the default `R23` triggers renewal once two thirds of the validity period has elapsed). [`maxRetries`](/docs/ref/object/acme-provider#maxretries) caps the retry count for failed challenges, and [`contact`](/docs/ref/object/acme-provider#contact) supplies the email address the CA uses for expiry and revocation notifications.

## Renewal

Renewal in automatic mode is performed by the ACME renewal task, which is a variant of the [Task](/docs/ref/object/task) object (the `AcmeRenewal` variant). The first `AcmeRenewal` task is scheduled when a Domain is first configured with automatic certificate management. Each subsequent renewal schedules the next one: when an `AcmeRenewal` task completes, it creates a follow-up task timed from the AcmeProvider's [`renewBefore`](/docs/ref/object/acme-provider#renewbefore) relative to the new certificate's expiry. The task can also be triggered on demand when an immediate renewal is required, for example after adding a Subject Alternative Name. A successful renewal installs the new certificate into the store and replaces the one presented on subsequent TLS handshakes.

## Report generation

CAA incident reports generated by the server are delivered to the address in [`reportAddressUri`](/docs/ref/object/domain#reportaddressuri) on the Domain, alongside DMARC and TLS-RPT reports. The default is `mailto:postmaster`; setting the field to null suppresses report generation for the domain.
