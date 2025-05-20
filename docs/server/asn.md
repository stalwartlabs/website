---
sidebar_position: 8
---

# ASN & GeoIP

ASN (Autonomous System Number) and GeoIP are essential tools for identifying the origin and characteristics of network traffic. An ASN represents the autonomous system that manages a specific range of IP addresses, providing insight into the organization or entity responsible for those addresses. GeoIP, on the other hand, offers geographical data about an IP address, such as the country, region, or city where it is located.

Stalwart utilizes ASN and GeoIP information for several critical purposes. Within [expressions](/docs/configuration/expressions/overview), this data allows administrators to create dynamic configuration rules that adapt based on the geographic or network identity of an incoming connection. For example, specific rules can be applied to connections originating from certain regions or managed by particular autonomous systems, enabling fine-tuned control over email handling.

In spam filtering, ASN and GeoIP information play a significant role. The built-in [spam filter](/docs/spamfilter/overview) uses this data to track reputation metrics for IP addresses, senders, domains, and ASNs, enhancing its ability to detect and block malicious traffic. Additionally, GeoIP and ASN data are integrated into the training of the Bayesian classifier, improving its accuracy by considering geographical and network patterns associated with spam.

To further improve transparency and traceability, Stalwart includes ASN and GeoIP information in the `Received` headers of emails it processes. This addition helps administrators and recipients better understand the path and origin of messages, aiding in troubleshooting and security assessments.

Stalwart supports obtaining ASN and GeoIP data in two ways. The recommended method is downloading data files from HTTP resources, ensuring the information remains up-to-date and accurate. Alternatively, the server can query TXT records from a DNS service offering ASN and GeoIP information, providing a lightweight option for environments where HTTP downloads may not be feasible.

## Configuration

The ASN and GeoIP settings in Stalwart allows administrators to choose between different methods for obtaining ASN and GeoIP data. Configuration is defined in the `asn` section of the configuration file, with several options available to tailor the setup based on the environment and requirements.

- `asn.type`: Specifies the method used to retrieve ASN and GeoIP data. Supported values are:
  - `resource`: Use HTTP resources to download ASN and GeoIP data files.
  - `dns`: Query TXT records from a DNS service offering ASN and GeoIP information.
  - `disabled`: Disables ASN and GeoIP lookups.

### HTTP Resources

When `asn.type` is set to `resource`, the server uses URLs to download ASN and GeoIP data files. The following additional settings are available:

- `asn.expires`: Defines the expiration period for downloaded data files. After this period, the server will re-fetch the data to ensure it remains up-to-date.
- `asn.timeout`: Sets the maximum time the server waits for a response when fetching data files.
- `asn.max-size`: Specifies the maximum allowable size for downloaded data files.
- `asn.urls.asn`: A list of URLs providing ASN data. Each URL points to a file containing ASN-to-IP mappings, such as:
  ```
  "https://cdn.jsdelivr.net/npm/@ip-location-db/asn/asn-ipv4.csv"
  "https://cdn.jsdelivr.net/npm/@ip-location-db/asn/asn-ipv6.csv"
  ```
- `asn.urls.geo`:A list of URLs providing GeoIP data. Each URL points to a file containing geographical mappings for IP ranges, such as:
  ```
  "https://cdn.jsdelivr.net/npm/@ip-location-db/geolite2-geo-whois-asn-country/geolite2-geo-whois-asn-country-ipv4.csv"
  ```

Example:

```toml
[asn]
type = "resource"
expires = "1d"
timeout = "5m"
max-size = 104857600

[asn.urls]
asn = [ "https://cdn.jsdelivr.net/npm/@ip-location-db/asn/asn-ipv4.csv", 
        "https://cdn.jsdelivr.net/npm/@ip-location-db/asn/asn-ipv6.csv" ]
geo = [ "https://cdn.jsdelivr.net/npm/@ip-location-db/geolite2-geo-whois-asn-country/geolite2-geo-whois-asn-country-ipv4.csv", 
        "https://cdn.jsdelivr.net/npm/@ip-location-db/geolite2-geo-whois-asn-country/geolite2-geo-whois-asn-country-ipv4.csv" ]
```

### DNS Queries

When `asn.type` is set to `dns`, the server queries ASN and GeoIP data from DNS TXT records. Additional settings for DNS-based configurations include:

- `asn.separator`: Specifies the character used to separate fields in the DNS TXT record (e.g., `|`).
- `asn.zone.ipv4` and `asn.zone.ipv6`: Define the DNS zones for querying ASN and GeoIP data. For example:
  - IPv4: `"origin.asn.cymru.com"`
  - IPv6: `"origin6.asn.cymru.com"`
- `asn.index`: Maps the fields in the DNS TXT record to specific data points:
  - `asn.index.asn`: Index of the ASN field.
  - `asn.index.asn-name`: Index of the ASN name field.
  - `asn.index.country`: Index of the country field.

Example:

```toml
[asn]
type = "dns"
separator = "|"

[asn.zone]
ipv4 = "origin.asn.cymru.com"
ipv6 = "origin6.asn.cymru.com"

[asn.index]
asn = 0
asn-name = 1
country = 2
```
