---
sidebar_position: 3
title: "Configuration"
description: "Configure an ACME provider: directory, contact, challenge, renewal and key settings, the names in each certificate, and what to check when an order fails."
---

To obtain certificates automatically, the server needs an account at a certificate authority, and it needs to know how to prove control of the names it requests. An ACME provider holds both. It is an account at one certificate authority, represented by an [AcmeProvider](/docs/ref/object/acme-provider) object (found in the WebUI under <!-- breadcrumb:AcmeProvider --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></svg> TLS › ACME Providers<!-- /breadcrumb:AcmeProvider -->).

A provider does not list the domains it serves. Instead, each [Domain](/docs/ref/object/domain) that uses ACME points at a provider from its `certificateManagement` setting. One provider can therefore issue certificates for any number of domains.

The first provider usually comes from the setup wizard. When automatic certificates are selected there, the wizard creates a provider named `Let's Encrypt`, with `postmaster@<domain>` as contact. It selects the DNS-01 challenge when a DNS provider was configured, and TLS-ALPN-01 otherwise. If the account cannot be registered at that point, the wizard logs the error and leaves the domain with manual certificate management.

A provider created later reports the same problem visibly. When the authority cannot be reached or refuses the account, the creation fails with `Failed to create ACME account: <reason>`.

## Provider settings

A provider's settings answer four questions: which authority and account to use, how to validate names, when to renew, and which keys and chains to use.

The authority and the account are set by these fields:

- [`description`](/docs/ref/object/acme-provider#description) is required. It is the name under which the provider is listed and selected for a domain, for example `Let's Encrypt`.
- [`directory`](/docs/ref/object/acme-provider#directory) is the authority's ACME directory URL, the entry point of its ACME service. It is <!-- default:AcmeProvider.directory -->`https://acme-v02.api.letsencrypt.org/directory`<!-- /default -->, Let's Encrypt's production directory, unless changed. Let's Encrypt's staging directory, `https://acme-staging-v02.api.letsencrypt.org/directory`, issues untrusted test certificates with higher rate limits.
- [`contact`](/docs/ref/object/acme-provider#contact) lists at least one address, to which the authority sends expiry warnings and account notices.
- [`eabKeyId`](/docs/ref/object/acme-provider#eabkeyid) and [`eabHmacKey`](/docs/ref/object/acme-provider#eabhmackey) are External Account Binding credentials. Some authorities require them, to link the ACME account to an existing customer account.

Validation and renewal are set by two fields:

- [`challengeType`](/docs/ref/object/acme-provider#challengetype) is `TlsAlpn01`, `Http01`, `Dns01` or `DnsPersist01`, and <!-- default:AcmeProvider.challengeType -->`TlsAlpn01`<!-- /default --> unless changed. [Challenge types](/docs/server/tls/acme/challenges) compares them.
- [`renewBefore`](/docs/ref/object/acme-provider#renewbefore) decides when a certificate is renewed, as the share of its validity period that must have passed: `R12` (one half), `R23` (two thirds), `R34` (three quarters) or `R45` (four fifths).

Keys and chains are set by two more:

- [`reuseKey`](/docs/ref/object/acme-provider#reusekey) keeps the private key of the current certificate at renewal. A DANE TLSA record can describe the key, so a new key at every renewal would mean changing TLSA records published by hand each time. Keeping the key avoids that. TLSA records published by automatic DNS management are updated after each renewal anyway.
- [`preferredChain`](/docs/ref/object/acme-provider#preferredchain) is the common name of the root of the chain to prefer, when the authority offers several, for example `ISRG Root X1`. The match is exact. When no chain matches, the authority's default chain is used.

Some of these fields are fixed once the provider exists. The account is registered with the authority when the provider is created, and the resulting account key and account URI are stored on the provider. `directory`, `eabKeyId` and `eabHmacKey` therefore cannot be changed afterwards. To move from the staging directory to production, create a second provider and point the domains at it.

The following object creates a provider for Let's Encrypt with the HTTP-01 challenge:

```json
{
  "description": "Let's Encrypt",
  "directory": "https://acme-v02.api.letsencrypt.org/directory",
  "challengeType": "Http01",
  "contact": {"postmaster@example.org": true},
  "renewBefore": "R23"
}
```

The following CLI command creates the same provider:

```sh
stalwart-cli create acmeprovider \
  --field "description=Let's Encrypt" \
  --field challengeType=Http01 \
  --field 'contact={"postmaster@example.org":true}'
```

## Names in a certificate

Each domain with automatic certificate management gets its own certificate. The names in it come from the `subjectAlternativeNames` of the domain's certificate management settings.

When that set is empty, the server chooses the names, and the choice depends on the challenge type:

- With `Dns01` and `DnsPersist01`, the certificate covers the domain and a wildcard for it: `example.com` and `*.example.com`.
- With `TlsAlpn01` and `Http01`, which cannot validate wildcards, the certificate covers the names Stalwart serves under the domain: `mta-sts.example.com`, `autoconfig.example.com`, `autodiscover.example.com` and `ua-auto-config.example.com`. It also covers the server's default hostname, the [mail exchanger](/docs/server/general#mail-exchangers-and-advertised-services) hostnames and the service hostnames, each only when it lies within the domain.

With TLS-ALPN-01 or HTTP-01, an empty set therefore requests no wildcard. The domain name itself is included with these challenges only when it is also the server hostname, a mail exchanger or a service hostname.

To request a specific set of names, list them in `subjectAlternativeNames`. An entry without a dot is completed with the domain, so `mail` becomes `mail.example.com`, and the domain itself must therefore be written in full. Every listed name must pass the challenge, which means that with TLS-ALPN-01 and HTTP-01 each name must resolve to this server.

The private key of an ACME certificate is an ECDSA P-256 key. Servers that need an RSA certificate install it by hand, as described in [Certificates](/docs/server/tls/certificates).

## One order per certificate

All names of a certificate are requested in a single order. If the validation of any name fails, the whole order fails, and no certificate is issued, not even for the names that passed.

A typical case is an `autoconfig` or `mta-sts` name that has no DNS record pointing at the server. With TLS-ALPN-01 or HTTP-01, the validation of that name fails and blocks the certificate for all the others. There are two ways out: publish the records for every name in the set, as listed in [Setting up DNS](/docs/install/dns), or list in `subjectAlternativeNames` only the names that resolve.

With DNS-01, the TXT records created for the order are removed after it, whether it succeeded or failed.

## Failed orders

Orders and renewals run as `AcmeRenewal` [tasks](/docs/management/tasks-actions/tasks), which are listed in the WebUI under Management › Tasks. Each failed order is one attempt of the task. A task that is being retried appears among the scheduled tasks, with its last `failureReason`. A task that will not be retried appears among the failed tasks.

An attempt that fails for one of the following reasons is rescheduled according to the [task retry policy](/docs/management/tasks-actions/tasks#retries), without giving up:

- A network or DNS error
- A validation that the authority rejected
- An order that timed out
- An authority asking to wait

When the authority names the time to try again, the task waits at least that long. After [`alertAfter`](/docs/ref/object/task-manager#alertafter) failed attempts, the task is marked as stalled, and the server logs a `task-manager.task-stalled` warning.

Some results are final and are not retried. They include:

- `Invalid request: ACME not configured for domain`: the domain's certificate management is `Manual`.
- `Invalid request: ACME provider requires DNS challenge but a DNS provider was not configured`: the provider uses DNS-01, and the domain has no automatic DNS management.
- `Challenge type <type> not supported. Supported types: <types>`: the authority does not offer the provider's challenge type, which can happen with DNS-PERSIST-01.

Two cases end a task without an order. A renewal requested before the certificate is due completes without contacting the authority, and schedules a new `AcmeRenewal` task for the renewal date. When the domain is switched to manual certificate management or deleted, its pending renewal task is removed without running.

### Events

The log shows the progress of each order through `acme.*` events. A successful order logs `acme.order-start`, `acme.auth-start`, `acme.auth-valid` and `acme.order-completed`. When the authority refuses, its reason is in `acme.auth-error` and `acme.order-invalid`. `acme.error` reports local, network, DNS and configuration errors.

### Common causes

The usual causes of failed orders are the following:

- **The challenge does not reach the server.** Port 443 (TLS-ALPN-01) or port 80 (HTTP-01) is blocked by a firewall, or a reverse proxy terminates TLS in front of Stalwart. In that case nothing is logged on Stalwart's side except the authority's reason in `acme.auth-error`, and no `acme.tls-alpn-received` event appears. `acme.tls-alpn-error`, by contrast, means that a handshake reached Stalwart but failed.
- **A name does not resolve to the server.** An `autoconfig`, `autodiscover`, `mta-sts` or `ua-auto-config` record is missing, or a mail exchanger is hosted elsewhere.
- **The authority refuses because of CAA.** CAA records let a domain name the authorities that may issue certificates for it. A CAA record in the zone names another authority, or an `accounturi` for another account, as described in [CAA](/docs/install/dns#caa).
- **The DNS record is not visible in time with DNS-01.** Stalwart submits the challenge once `propagationTimeout` has passed, even if it has not seen the record, and the authority may then not find it either. Increase the DNS server's `propagationTimeout` or `propagationDelay`.
- **Rate limits.** When the authority answers HTTP 429 or 503, or asks for a long wait, the task reason reads `Rate limited. Retry after <n> seconds`, and the next attempt waits for that time. Let's Encrypt limits the number of certificates and failed validations per domain and account, so use the staging directory while testing.

:::tip[Enterprise feature]
ACME providers owned by a tenant, set with [`memberTenantId`](/docs/ref/object/acme-provider#membertenantid), are available in the [Enterprise edition](/docs/server/enterprise) of Stalwart. Their directory must be a public `https` URL, so a tenant cannot point a provider at a private network.
:::
