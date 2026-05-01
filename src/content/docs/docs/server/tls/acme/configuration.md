---
sidebar_position: 3
title: "Configuration"
---

ACME providers are registered as [AcmeProvider](/docs/ref/object/acme-provider) objects (found in the WebUI under <!-- breadcrumb:AcmeProvider --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></svg> TLS › ACME Providers<!-- /breadcrumb:AcmeProvider -->). Each provider describes where to talk to the CA, which challenge to use, and which contacts are notified. The relevant fields are:

- [`directory`](/docs/ref/object/acme-provider#directory): the directory URL of the ACME provider. Let's Encrypt's production directory is `https://acme-v02.api.letsencrypt.org/directory` (the default); the staging directory `https://acme-staging-v02.api.letsencrypt.org/directory` is used for test runs that do not consume production rate-limit budget.
- [`challengeType`](/docs/ref/object/acme-provider#challengetype): the [challenge type](/docs/server/tls/acme/challenges) used to validate control of each domain. One of `TlsAlpn01` (default), `Dns01`, `DnsPersist01`, or `Http01`. DNS-PERSIST-01 is a variant of the DNS-01 challenge that keeps the validation TXT record in place after the initial issuance so that subsequent renewals do not have to republish it; use it with DNS providers where propagation is slow or where keeping the record simplifies automation.
- [`contact`](/docs/ref/object/acme-provider#contact): one or more contact email addresses. Used by the CA for expiry warnings and security notices.
- [`renewBefore`](/docs/ref/object/acme-provider#renewbefore): how early renewal starts, expressed as a fraction of the remaining lifetime. Default `R23` (two thirds of the remaining validity period has elapsed).
- [`maxRetries`](/docs/ref/object/acme-provider#maxretries): number of attempts before giving up on a failed challenge. Default `10`.
- [`eabKeyId`](/docs/ref/object/acme-provider#eabkeyid) / [`eabHmacKey`](/docs/ref/object/acme-provider#eabhmackey): External Account Binding (EAB) credentials when the CA requires them.
- [`memberTenantId`](/docs/ref/object/acme-provider#membertenantid): tenant scope of the provider (Enterprise deployments only).

An AcmeProvider does not list the domains it covers. Instead, each [Domain](/docs/ref/object/domain) that needs an automatically managed certificate sets its [`certificateManagement`](/docs/ref/object/domain#certificatemanagement) to the `Automatic` variant, which carries an [`acmeProviderId`](/docs/ref/object/domain#certificatemanagementproperties) reference to the AcmeProvider and an optional [`subjectAlternativeNames`](/docs/ref/object/domain#certificatemanagementproperties) list (leave empty to request a wildcard or the default set of SANs). A single AcmeProvider can be referenced from any number of Domain records, so one ACME account issues certificates for many domains. ACME account keys and state are stored in the data store and need no filesystem path.

Default-certificate selection is made on the [SystemSettings](/docs/ref/object/system-settings) singleton through [`defaultCertificateId`](/docs/ref/object/system-settings#defaultcertificateid): whichever Certificate is pointed to there is served to clients that do not send SNI in their ClientHello. The AcmeProvider itself has no "default" flag; a provider becomes the default implicitly by issuing the Certificate selected via [`defaultCertificateId`](/docs/ref/object/system-settings#defaultcertificateid). This setting is optional, since clients negotiating with SNI pick their certificate from the domain records directly.

:::tip[Note]

- Regularly check the contact email for messages from the ACME provider.
- Point a new provider at the staging directory first to verify the configuration; switching to production afterwards avoids consuming the production rate-limit budget on failed runs.

:::

## DNS-01 configuration

When [`challengeType`](/docs/ref/object/acme-provider#challengetype) is set to `Dns01`, Stalwart publishes the validation record through a configured DNS provider. DNS providers are stored as [DnsServer](/docs/ref/object/dns-server) objects (found in the WebUI under <!-- breadcrumb:DnsServer --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › DNS › DNS Providers<!-- /breadcrumb:DnsServer -->). Each DnsServer carries its own variant (`Tsig`, `Sig0`, or `Cloudflare`) with the fields needed to talk to that provider. Common timing fields that apply to every DNS variant are:

- [`pollingInterval`](/docs/ref/object/dns-server#pollinginterval): how often to check whether the TXT record has propagated. Default `"15s"`.
- [`propagationTimeout`](/docs/ref/object/dns-server#propagationtimeout): maximum time to wait for propagation. Default `"1m"`.
- [`ttl`](/docs/ref/object/dns-server#ttl): TTL applied to new records. Default `"5m"`.
- [`timeout`](/docs/ref/object/dns-server#timeout): per-request timeout against the DNS API. Default `"30s"`.

The DNS zone used for record updates is no longer carried on the DnsServer itself. It is set per domain on the [Domain](/docs/ref/object/domain) object: when [`dnsManagement`](/docs/ref/object/domain#dnsmanagement) is the `Automatic` variant, [`dnsServerId`](/docs/ref/object/domain#dnsmanagementproperties) picks the DnsServer to drive and [`origin`](/docs/ref/object/domain#dnsmanagementproperties) names the zone that carries the records (for example, `example.com` for a domain `sub.example.com`). Leaving [`origin`](/docs/ref/object/domain#dnsmanagementproperties) empty uses the domain name itself as the zone. This lets several domains share one DnsServer while each pins its own zone for DNS-01 and DNS-PERSIST-01 validation.

### RFC2136 (TSIG)

The `Tsig` variant of DnsServer speaks RFC 2136 dynamic update with TSIG authentication. Its fields are:

- [`host`](/docs/ref/object/dns-server#host): IP address of the authoritative DNS server.
- [`port`](/docs/ref/object/dns-server#port): port used to reach the server. Default `53`.
- [`protocol`](/docs/ref/object/dns-server#protocol): `udp` or `tcp`. Default `udp`.
- [`tsigAlgorithm`](/docs/ref/object/dns-server#tsigalgorithm): TSIG HMAC algorithm. Default `hmac-sha512`.
- [`keyName`](/docs/ref/object/dns-server#keyname): TSIG key name.
- [`key`](/docs/ref/object/dns-server#key): TSIG key secret.

### Cloudflare

The `Cloudflare` variant of DnsServer drives the Cloudflare DNS API. Its fields are:

- [`secret`](/docs/ref/object/dns-server#secret): Cloudflare API token, or API key when `email` is set.
- [`email`](/docs/ref/object/dns-server#email): account email used with the legacy `X-Auth-Email` / `X-Auth-Key` flow. Leave unset to authenticate with an API token.
- [`timeout`](/docs/ref/object/dns-server#timeout): HTTP request timeout. Default `"30s"`.

## Example

An ACME provider pointing at the Let's Encrypt production directory and using TLS-ALPN-01:

```json
{
  "directory": "https://acme-v02.api.letsencrypt.org/directory",
  "challengeType": "TlsAlpn01",
  "contact": ["postmaster@example.org"],
  "renewBefore": "R23"
}
```
