---
sidebar_position: 1
title: "Overview"
description: "How Stalwart obtains and renews TLS certificates automatically with ACME, and where automatic certificates are enabled."
---

Every service that Stalwart offers over TLS needs a certificate for the names that clients connect to, and a certificate from a public authority is valid only for a limited time. Renewing certificates by hand is easy to forget, and clients refuse a certificate once it has expired. Automatic certificate management removes that task: the server obtains its certificates itself and renews them before they expire.

The Automatic Certificate Management Environment (ACME), defined in [RFC 8555](https://www.rfc-editor.org/rfc/rfc8555), is the protocol that makes this possible. Certificate authorities such as Let's Encrypt use it to issue certificates without manual steps. The client asks the authority for a certificate, and the authority sets a challenge for each name in the request. By answering the challenge, the client proves that it controls the name. The authority then issues the certificate, and the client repeats the process before the certificate expires.

Stalwart includes an ACME client. Certificates are therefore obtained and renewed by the server itself, without an external tool, without a certificate file on disk and without a restart.

## Objects involved

Three objects take part in automatic certificate management:

- An [AcmeProvider](/docs/ref/object/acme-provider) holds the account at one certificate authority: the directory URL, the contact address and the challenge type. When automatic certificates are selected in the setup wizard, the wizard creates a provider for Let's Encrypt. [Configuration](/docs/server/tls/acme/configuration) describes the provider's settings.
- Each [Domain](/docs/ref/object/domain) decides whether its own certificate is managed automatically. Setting its [`certificateManagement`](/docs/ref/object/domain#certificatemanagement) to `Automatic`, with an `acmeProviderId`, enables ACME for the domain. `Manual` leaves the certificate to the administrator. [TLS certificates](/docs/domains/tls-certificates) describes the per-domain settings.
- The certificate that the server obtains is stored as a [Certificate](/docs/ref/object/certificate) object. From then on it is used like any other certificate, as described in [Certificates](/docs/server/tls/certificates).

## Renewal

Orders and renewals run in the background, as `AcmeRenewal` tasks. A certificate is renewed once a share of its validity period has passed, and the provider's [`renewBefore`](/docs/ref/object/acme-provider#renewbefore) sets that share. With <!-- default:AcmeProvider.renewBefore -->`R23`<!-- /default -->, which stands for two thirds of the period, a 90-day certificate is renewed about 30 days before it expires.

## Challenge types

The challenge type decides what the certificate authority must be able to reach in order to check the challenge: port 443, port 80, or the domain's DNS zone. The choice therefore depends on the server's network and on access to the zone. [Challenge types](/docs/server/tls/acme/challenges) compares the three types and describes what each requires.
