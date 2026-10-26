---
sidebar_position: 1
title: "Overview"
description: "Where DNS is configured in Stalwart: the resolver used for lookups, the providers used to publish records, and per-domain automatic DNS management."
---

A mail server depends on DNS at almost every step, and Stalwart uses it in two directions: it reads records from DNS, and it can write records to DNS.

Reading is constant. To deliver a message, the server looks up the MX and address records of the recipient's domain. To decide whether incoming mail is authentic, it reads the sender's SPF, DKIM and DMARC records. To secure the connections it opens to other servers, it reads MTA-STS and DANE records. To filter spam, it queries DNS blocklists (DNSBLs), which publish the reputation of addresses and domains as DNS records.

Writing is optional. Stalwart can publish records to the zones of the domains it hosts, such as the DKIM keys and the MTA-STS identifiers. Publishing them from the server keeps them consistent with its configuration, so a key that the server rotates does not have to be copied into the zone by hand.

The two directions are configured separately, and the following pages describe each part:

- [DNS resolver](/docs/server/dns/resolver) describes the resolver Stalwart uses for its own lookups, and how that choice affects DNSBL queries and DANE.
- [DNS providers](/docs/server/dns/provider) describes the DnsServer objects, which hold the credentials for writing to a zone through a provider's API or through RFC 2136 dynamic updates, and lists the supported providers.
- [DNS provider notes](/docs/server/dns/provider-notes) gives, for each provider, the permissions its credential needs, its timing, and the failures seen in practice.
- [Automatic DNS records](/docs/domains/dns-records) describes how to enable automatic DNS management for a domain, which records it publishes and how it treats records that already exist.
- [Setting up DNS](/docs/install/dns) explains what each record is for, for domains whose records are published by hand.
