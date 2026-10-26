---
sidebar_position: 2
title: "Challenge types"
description: "The four ACME challenges Stalwart supports, what each needs to be reachable or configured, and how to choose between them."
---

A certificate authority must not issue a certificate for a name to someone who does not control that name. Before it issues a certificate, it therefore checks every name in the request by sending a challenge, a task that only the holder of the name can complete. The four challenge types differ in how the server proves control: by answering on a port the authority connects to, or by publishing a record in the domain's DNS zone. Each type thus places different demands on the network and on DNS, and the right one depends on how the server is deployed.

The challenge type is set on the [AcmeProvider](/docs/ref/object/acme-provider) with [`challengeType`](/docs/ref/object/acme-provider#challengetype), and it applies to every domain that uses the provider. A provider uses <!-- default:AcmeProvider.challengeType -->`TlsAlpn01`<!-- /default --> unless another type is set. Stalwart supports the following four types:

| Challenge | `challengeType` | Proof | Requires | Wildcards |
|---|---|---|---|---|
| TLS-ALPN-01 | `TlsAlpn01` | A special certificate presented on port 443 | Port 443 reachable from the internet, with TLS handled by Stalwart | No |
| HTTP-01 | `Http01` | A token served over HTTP on port 80 | Port 80 reachable from the internet and forwarded to an HTTP listener | No |
| DNS-01 | `Dns01` | A TXT record created for each validation | Automatic DNS management for the domain | Yes |
| DNS-PERSIST-01 | `DnsPersist01` | A TXT record that stays in the zone | The record present in the zone before the order | Yes |

Every name in an order must pass its challenge. With TLS-ALPN-01 and HTTP-01, each name must therefore resolve to this server. With the DNS challenges, each name must be in a zone that Stalwart can write to, or in a zone that holds the record. [Configuration](/docs/server/tls/acme/configuration#names-in-a-certificate) lists the names that an order contains.

## TLS-ALPN-01

TLS-ALPN-01, defined in [RFC 8737](https://www.rfc-editor.org/rfc/rfc8737), proves control through the TLS handshake itself, and it needs nothing beyond the default listeners. The certificate authority opens a TLS connection to port 443 of the name being validated and requests the `acme-tls/1` application protocol. Stalwart answers on its HTTPS listener, which is an HTTP listener with implicit TLS. It presents a temporary self-signed certificate that carries a digest of the key authorization for the challenge.

Because the challenge needs no DNS automation, it works on any server that the authority can reach on port 443. It fails in two situations:

- Port 443 is not reachable from the internet.
- Another component terminates TLS in front of Stalwart, such as a reverse proxy, a load balancer in TLS mode or a CDN. The authority's connection then never reaches Stalwart.

A TCP proxy that passes the connection through unchanged does not interfere. Failures are logged as `acme.tls-alpn-error`, and a validation connection without a server name is logged as `acme.client-missing-sni`.

## HTTP-01

HTTP-01 is defined in [RFC 8555](https://www.rfc-editor.org/rfc/rfc8555#section-8.3). The certificate authority requests `http://<name>/.well-known/acme-challenge/<token>` on port 80, and Stalwart answers with the key authorization for the token. Any HTTP listener serves the challenge path, and a request for a token that Stalwart does not know is answered with 404.

No default listener uses port 80. HTTP-01 therefore needs one of two arrangements:

- An HTTP listener bound to port 80
- A reverse proxy or port forward that passes port 80 to one of Stalwart's HTTP listeners, for example the plain HTTP listener on 8080

HTTP-01 is the usual choice when a reverse proxy terminates TLS on port 443 but can forward the challenge path on port 80.

## DNS-01

DNS-01 is defined in [RFC 8555](https://www.rfc-editor.org/rfc/rfc8555#section-8.4). It proves control of a name through its DNS zone. For each name, Stalwart takes these steps:

1. It creates a TXT record at `_acme-challenge.<name>`, through the domain's DNS provider.
2. It waits until the record is visible.
3. It asks the authority to validate the record.
4. It deletes the record afterwards, whether the validation succeeded or not.

DNS-01 needs no inbound connection at all, so it suits servers that are not reachable from the internet. Together with DNS-PERSIST-01, it is also the only challenge that can validate wildcard names.

In exchange, it requires [automatic DNS management](/docs/domains/dns-records) on the domain, with a DNS provider whose credentials allow creating and deleting TXT records. The requirement is checked at one point only. When a domain is switched to automatic certificate management with a DNS-01 provider and has no automatic DNS management, the save is refused with `ACME provider requires automatic DNS management`. A domain can still reach the same state later, for example because the challenge type of its provider was changed. It then fails at the next order, with `Invalid request: ACME provider requires DNS challenge but a DNS provider was not configured`.

The wait for the record to become visible is governed by the DNS server's `pollInterval` and `propagationTimeout`. Providers that are slow to serve new records need a longer timeout, as described in [DNS provider notes](/docs/server/dns/provider-notes).

## DNS-PERSIST-01

DNS-PERSIST-01 is described in the Internet-Draft [draft-ietf-acme-dns-persist](https://datatracker.ietf.org/doc/draft-ietf-acme-dns-persist/), which is not yet a standard and may change. It replaces the record per validation with a single long-lived TXT record at `_validation-persist.<domain>`. That record names the certificate authority and the ACME account allowed to obtain certificates for the domain. The authority checks the record at each order, and Stalwart publishes nothing during the order.

### Authority support

The record must use two values that the authority advertises in its ACME directory: the prefix of hashed account URIs, and the issuer domain names. Stalwart requires both. It reads them when the provider is created and stores them on the provider, together with the authority's CAA identities. A DNS-PERSIST-01 provider whose directory lacks them is therefore refused:

```text
Failed to create ACME account: Invalid request: The ACME server does not support DNS-PERSIST-01: its directory does not advertise both accountHashPrefix and issuerDomainNames
```

### Publishing the record

The record must be present before the first order. Once the ACME account exists, Stalwart computes the record for every domain with automatic certificate management whose provider uses DNS-PERSIST-01, as part of the domain's CAA records. It reaches the zone in one of two ways:

- With [automatic DNS management](/docs/domains/dns-records) and the `caa` record type in `publishRecords`, the record is published with the other records.
- Otherwise, copy the `_validation-persist` record from the domain's zone file into the zone by hand. The zone file is shown under **View Zone File** in the WebUI, and in the [`dnsZoneFile`](/docs/ref/object/domain#dnszonefile) field.

No DNS provider is needed for this challenge, only the records.

### Record contents

The record does not contain the ACME account URL itself. As the draft requires, it names the authority by the first issuer domain name of its directory. Its `accounturi` is a hashed URI of the form `<prefix>sha-256/<hash>`, where the prefix is the one advertised by the authority. The hash is computed over the record's name, the account key and the account URL. The value is therefore different for each name, and it changes when the account key changes, so copy it from the zone file instead of composing it.

The names that receive a record follow the domain's [`subjectAlternativeNames`](/docs/ref/object/domain#subjectalternativenames):

- When the set is empty, a single record at `_validation-persist.<domain>` carries `policy=wildcard`, which extends it to every name under the domain.
- When names are listed, Stalwart generates one record at `_validation-persist.<name>` for each listed name inside the domain. A wildcard entry `*.<name>` gives the record at `<name>` the `policy=wildcard` parameter.
- Listed names outside the domain receive no record.

### Missing directory data

The stored directory data of a DNS-PERSIST-01 provider can lack the prefix or the issuer domain names, for example because the challenge type of an existing provider was changed. In that case no `_validation-persist` record is generated, and the domain's other records are published as usual. The `acme.error` event then logs this message:

```text
ACME provider <directory> does not advertise both accountHashPrefix and issuerDomainNames, DNS-PERSIST-01 records cannot be built
```

### Security of the record

The record delegates certificate issuance for the domain to the ACME account, for as long as it stays in the zone. Stalwart keeps the account key in the data store. Anyone who obtains that key can obtain certificates for every domain whose record names the account, without any access to DNS. Remove the record when the domain stops using the account.

## Choosing a challenge

The choice follows from what the certificate authority can reach and from how the domain's DNS is managed:

- **TLS-ALPN-01** fits when port 443 reaches Stalwart directly. It needs nothing beyond the default configuration, which is why the setup wizard selects it when no DNS provider is configured.
- **HTTP-01** fits when a reverse proxy terminates TLS on port 443 but port 80 can be forwarded to Stalwart.
- **DNS-01** fits when the server is not reachable from the internet, when wildcard certificates are wanted, or when the domain's DNS provider is supported and automatic DNS management is used anyway. The setup wizard selects it when a DNS provider is configured.
- **DNS-PERSIST-01** fits when the authority supports it and per-order DNS changes are impractical. An example is a zone managed by another party, who can publish one record but cannot grant API access.

Changing the challenge type of a provider affects the next order of every domain that uses the provider. Before changing it, check that each of these domains meets the requirements of the new challenge.
