---
sidebar_position: 3
title: "TLS certificates"
description: "Choose between automatic ACME certificates and manually installed certificates for a domain, and how renewal, the certificate's names and the related errors work."
---

Clients and other mail servers connect to Stalwart under a domain's host names, such as `mail.example.com`, `mta-sts.example.com` or `autoconfig.example.com`, and they expect a certificate valid for the name they used. Each domain decides how its certificate is obtained, with the [`certificateManagement`](/docs/ref/object/domain#certificatemanagement) setting of its [Domain](/docs/ref/object/domain) object:

- `Automatic`: the server obtains and renews the certificate through ACME, from the certificate authority of an [AcmeProvider](/docs/ref/object/acme-provider) (found in the WebUI under <!-- breadcrumb:AcmeProvider --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></svg> TLS › ACME Providers<!-- /breadcrumb:AcmeProvider -->).
- `Manual`: the administrator installs and renews the certificate.

In both cases the certificate is a [Certificate](/docs/ref/object/certificate) object. The server chooses among all installed certificates by the name each client requests, as described in [Certificate selection](/docs/server/tls/certificates#certificate-selection). A certificate is therefore not bound to a domain: a certificate installed for one domain is also used for any other name it covers.

## Automatic certificates

The `Automatic` variant names the ACME provider in `acmeProviderId`. Most of the behaviour follows from that choice, because the provider determines the certificate authority, the challenge type and the renewal schedule. [ACME configuration](/docs/server/tls/acme/configuration) describes the provider settings.

The names to request are listed in `subjectAlternativeNames`, which is normally left empty. The names then depend on the provider's challenge type, as listed in [Names in a certificate](/docs/server/tls/acme/configuration#names-in-a-certificate). With DNS-01 or DNS-PERSIST-01, the certificate covers the domain and a wildcard for it. With TLS-ALPN-01 and HTTP-01, it covers the host names the server uses under the domain. An empty set therefore does not request a wildcard with the default TLS-ALPN-01 challenge.

The challenge type also decides what the domain must provide. The requirements are described in [Challenge types](/docs/server/tls/acme/challenges):

- DNS-01 needs [automatic DNS management](/docs/domains/dns-records) on the domain, so that the server can create the validation records. [Challenge types](/docs/server/tls/acme/challenges#dns-01) describes the errors when it is missing.
- DNS-PERSIST-01 needs an authority that advertises the [record parameters](/docs/server/tls/acme/challenges#dns-persist-01) in its ACME directory, and `_validation-persist` TXT records in the domain's zone before the first order. Automatic DNS management publishes these records with the domain's CAA records. With manual DNS management, they are copied from the domain's zone file.
- TLS-ALPN-01 and HTTP-01 need every requested name to resolve to the server, and port 443 or port 80 reachable from the internet.

Saving a domain with automatic certificate management schedules the first order. A new domain created with automatic DNS management as well has its order placed after the DNS records have been published, so that the CAA records are in place first.

## Renewal

Orders and renewals run as `AcmeRenewal` tasks. A certificate is renewed when a share of its validity has passed, and the provider's [`renewBefore`](/docs/ref/object/acme-provider#renewbefore) sets that share. [ACME configuration](/docs/server/tls/acme/configuration#provider-settings) lists the possible values. Each successful order schedules the next renewal.

A renewal creates a new Certificate object. When the old certificate was the server's default certificate and the new one covers the same names, the default moves to the new certificate. The old Certificate is deleted once it has expired, the next time the certificates are loaded, as described in [Renewal and expiry](/docs/server/tls/certificates#renewal-and-expiry).

A renewal can also be started at once, for example after names have been added, by creating an `AcmeRenewal` task for the domain. When an order fails, [Failed orders](/docs/server/tls/acme/configuration#failed-orders) lists the causes and how failed renewals are retried.

The task reports `Invalid request: ACME not configured for domain` when the domain's certificate management is `Manual`. The error is permanent, so the task is not retried. Switching the domain to `Automatic` schedules a new order.

## Manual certificates

Manual certificates are the way to use a certificate from an authority without ACME support, from an internal authority, or with an RSA key. With `Manual`, the server neither requests nor renews certificates for the domain.

Install the certificate as a Certificate object, as described in [Certificates](/docs/server/tls/certificates#installing-a-certificate). Replace it before it expires, either by updating the existing object or by adding a new one. Adding a new one works because, when several certificates cover a name, the one that expires last is used.

## Reports

CAA records name the certificate authorities that may issue certificates for a domain, and an authority that receives a request the records refuse can report it. The address for these reports is the domain's [`reportAddressUri`](/docs/ref/object/domain#reportaddressuri), <!-- default:Domain.reportAddressUri -->`mailto:postmaster`<!-- /default --> unless it is changed. It is published in the `iodef` entry of the domain's CAA records.
