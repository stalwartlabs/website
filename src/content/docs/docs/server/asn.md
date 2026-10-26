---
sidebar_position: 6
title: "ASN and GeoIP"
description: "Look up the network operator (ASN) and country of connecting IP addresses from downloaded lists or DNS, for spam filtering, expressions and Received headers."
---

Knowing where a connection comes from helps a mail server judge it. Mail from a network that is known for spam, or from a country the users never correspond with, deserves more suspicion than mail from a well-known provider. Stalwart looks up two facts about the address of every incoming SMTP connection: its network operator and its country.

The network operator is identified by its Autonomous System Number (ASN). An autonomous system is a network under one operator's control, and its number appears in the routing announcements for the ranges of IP addresses the operator holds. GeoIP data, for its part, maps addresses to the country where they are used.

Several features use the result of these lookups:

- The spam filter uses them as inputs to its rules and its classifier.
- The [expressions](/docs/configuration/expressions/) evaluated during an SMTP session can test them through the `asn` and `country` variables.
- [Sieve](/docs/sieve/) scripts that run during the SMTP session see them as `env.asn` and `env.country`.
- The `Received` header that the server adds to each message includes them, for example `(AS64496 Example Networks, DE)`.

## Data sources

The lookups are configured on the [Asn](/docs/ref/object/asn) singleton (found in the WebUI under <!-- breadcrumb:Asn --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › ASN & GeoIP<!-- /breadcrumb:Asn -->). Its variant decides where the data comes from:

- `Resource` downloads CSV files that map address ranges to ASNs and countries, and answers lookups from memory. It is the variant created at first start.
- `Dns` queries, for each address, a DNS zone that publishes ASN data in TXT records, such as the one operated by Team Cymru. It needs no download, but it adds a DNS query for each new address.
- `Disabled` turns the lookups off.

The choice between the first two is a tradeoff between a periodic download and a query per address. Turning the lookups off has a cost of its own, because everything that uses them loses its data: the `asn` and `country` variables are empty, the `Received` header carries no network information, and the spam filter rules and classifier features that depend on the sending network have nothing to work with.

## Downloaded lists

At first start, the server creates a `Resource` source. It downloads the IP-to-ASN and IP-to-country lists of the [ip-location-db](https://github.com/sapics/ip-location-db) project from GitHub, for IPv4 and IPv6. A server without outbound access to GitHub, or one that should use other data, needs other URLs or another variant, as described in [Outbound network requirements](/docs/install/requirements#outbound-network-requirements).

The `Resource` variant has settings for what to download, how often, and how to reach the server that hosts the files:

- [`asnUrls`](/docs/ref/object/asn#asnurls) and [`geoUrls`](/docs/ref/object/asn#geourls) list the CSV files with ASN and country data.
- [`refreshInterval`](/docs/ref/object/asn#refreshinterval) sets how often the files are downloaded again.
- [`timeout`](/docs/ref/object/asn#timeout) limits the time for one download.
- [`maxSize`](/docs/ref/object/asn#maxsize) is the largest file size accepted, in bytes.
- [`httpAuth`](/docs/ref/object/asn#httpauth) and [`httpHeaders`](/docs/ref/object/asn#httpheaders) supply authentication and additional headers, for servers that require them.
- [`allowInvalidCerts`](/docs/ref/object/asn#allowinvalidcerts) accepts a server certificate that fails validation. It is meant only for an internal server with a private certificate.

The source created at first start is equivalent to the following object:

```json
{
  "@type": "Resource",
  "refreshInterval": 86400000,
  "timeout": 300000,
  "maxSize": 104857600,
  "asnUrls": {
    "https://github.com/sapics/ip-location-db/releases/download/latest/origin-asn-ipv4.csv": true,
    "https://github.com/sapics/ip-location-db/releases/download/latest/origin-asn-ipv6.csv": true
  },
  "geoUrls": {
    "https://github.com/sapics/ip-location-db/releases/download/latest/user-country-ipv4.csv": true,
    "https://github.com/sapics/ip-location-db/releases/download/latest/user-country-ipv6.csv": true
  },
  "httpAuth": {"@type": "Unauthenticated"}
}
```

## DNS lookups

The `Dns` variant sends a TXT query for each address, to [`zoneIpV4`](/docs/ref/object/asn#zoneipv4) for IPv4 addresses or [`zoneIpV6`](/docs/ref/object/asn#zoneipv6) for IPv6 addresses. The answer is a single string with several fields, which the server splits at [`separator`](/docs/ref/object/asn#separator). [`indexAsn`](/docs/ref/object/asn#indexasn), [`indexAsnName`](/docs/ref/object/asn#indexasnname) and [`indexCountry`](/docs/ref/object/asn#indexcountry) then give the zero-based positions of the ASN, the operator name and the country code among those fields.

The following configuration uses the Team Cymru zones:

```json
{
  "@type": "Dns",
  "zoneIpV4": "origin.asn.cymru.com",
  "zoneIpV6": "origin6.asn.cymru.com",
  "separator": "|",
  "indexAsn": 0,
  "indexCountry": 2
}
```
