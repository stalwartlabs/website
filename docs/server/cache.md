---
sidebar_position: 10
---

# Caching

Stalwart keeps a set of in-memory caches in front of slower backends (the data store, the DNS resolver, the authentication subsystem). Caching frequently accessed records reduces latency and takes load off the underlying backends without changing their consistency guarantees.

The eviction policy is a modified Clock-PRO algorithm, close in spirit to the later S3-FIFO scheme. It is scan-resistant, so a transient burst of unrelated lookups does not evict hot entries, and it reaches hit rates comparable to LRU and W-TinyLFU on realistic workloads.

## Memory usage

Cache sizes should be matched to the workload. On hosts with ample memory and many users, larger caches reduce evictions and improve hit rates. On hosts with limited memory, smaller caches conserve RAM at the cost of some hit rate; monitoring resident set size and the cache-hit metrics published by the server is the normal way to pick an appropriate balance.

## Configuration

Every cache is configured through the [Cache](/docs/ref/object/cache) singleton (found in the WebUI under <!-- breadcrumb:Cache --><!-- /breadcrumb:Cache -->). Each field is a byte-size value with a suffix (for example `"50mb"`); minimum size is `2048` bytes.

### Data caches

- [`messages`](/docs/ref/object/cache#messages): email account data including message UIDs, flags, and mailbox metadata. Default `"50mb"`.
- [`events`](/docs/ref/object/cache#events): calendar events, including start / end times and timezone data. Default `"10mb"`.
- [`scheduling`](/docs/ref/object/cache#scheduling): calendar scheduling state. Default `"1mb"`.
- [`contacts`](/docs/ref/object/cache#contacts): address-book and contact data. Default `"10mb"`.
- [`files`](/docs/ref/object/cache#files): file-storage metadata such as paths and permissions. Default `"10mb"`.
- [`mailingLists`](/docs/ref/object/cache#mailinglists): mailing-list metadata. Default `"2mb"`.
- [`dkimSignatures`](/docs/ref/object/cache#dkimsignatures): parsed DKIM signing configurations. Default `"10mb"`.

### Directory caches

- [`accounts`](/docs/ref/object/cache#accounts): resolved account records. Default `"20mb"`.
- [`domains`](/docs/ref/object/cache#domains): domain records. Default `"5mb"`.
- [`domainNames`](/docs/ref/object/cache#domainnames): positive domain-name lookup results. Default `"10mb"`.
- [`domainNamesNegative`](/docs/ref/object/cache#domainnamesnegative): negative (not-found) domain-name lookup results. Default `"1mb"`.
- [`emailAddresses`](/docs/ref/object/cache#emailaddresses): positive email-address lookup results. Default `"10mb"`.
- [`emailAddressesNegative`](/docs/ref/object/cache#emailaddressesnegative): negative email-address lookup results. Default `"2mb"`.
- [`tenants`](/docs/ref/object/cache#tenants): tenant records. Default `"5mb"`.
- [`negativeTtl`](/docs/ref/object/cache#negativettl): how long to keep negative domain and account lookup entries. Default `"1h"`.

### Security caches

- [`accessTokens`](/docs/ref/object/cache#accesstokens): resolved access tokens, reducing revalidation during authentication. Default `"10mb"`.
- [`httpAuth`](/docs/ref/object/cache#httpauth): short-lived state for HTTP authentication. Default `"1mb"`.

### DNS caches

- [`dnsTxt`](/docs/ref/object/cache#dnstxt): TXT records used for SPF, DKIM, and DMARC. Default `"5mb"`.
- [`dnsMx`](/docs/ref/object/cache#dnsmx): MX records used for outbound routing. Default `"5mb"`.
- [`dnsPtr`](/docs/ref/object/cache#dnsptr): reverse (PTR) lookup results. Default `"1mb"`.
- [`dnsIpv4`](/docs/ref/object/cache#dnsipv4): forward IPv4 (A) lookup results. Default `"5mb"`.
- [`dnsIpv6`](/docs/ref/object/cache#dnsipv6): forward IPv6 (AAAA) lookup results. Default `"5mb"`.
- [`dnsTlsa`](/docs/ref/object/cache#dnstlsa): TLSA records used for DANE validation. Default `"1mb"`.
- [`dnsMtaSts`](/docs/ref/object/cache#dnsmtasts): MTA-STS policy records. Default `"1mb"`.
- [`dnsRbl`](/docs/ref/object/cache#dnsrbl): DNSBL / RBL lookup results. Default `"5mb"`.
