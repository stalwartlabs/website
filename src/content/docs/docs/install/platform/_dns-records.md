## Step 6: Publish the DNS records

So far the server works, but the rest of the internet does not know about it. Other mail servers find and trust a domain through DNS: MX records name the server that receives the domain's mail, and SPF, DKIM and DMARC records let receivers check that a message sent in the domain's name really comes from its server. Further records let mail clients find their settings automatically. This step makes sure that all of these records are in the domain's zone. The server has already computed them for the domain, so with automatic DNS management it has published most of them itself, and with manual DNS management the work consists of copying them to the DNS provider. [DNS records](/docs/install/dns) explains each of them.

### Automatic DNS management

When a DNS provider was selected on Screen 5 of the wizard, the server published the DKIM, SPF, DMARC, SRV, MTA-STS, TLS reporting and autoconfiguration records through the provider's API shortly after the restart, and it keeps them current from then on. The wizard leaves two record types out of this set. The CAA record is optional and can be added later, as described in [DNS records](/docs/install/dns). The MX record, however, is what directs the domain's mail to the server, so create it in the provider's control panel: an MX record at the domain that points at the server hostname, such as:

```
example.com.	MX	10 mail.example.com.
```

The domain's zone file, described below, lists the same MX record with the values for this server.

### Manual DNS management

In the WebUI, open the domain list (<!-- breadcrumb:Domain --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg> Domains › Domains<!-- /breadcrumb:Domain -->), open the menu next to the domain and select **View Zone File**. The zone file is in BIND format, which most DNS providers can import as a whole. Alternatively, create its records one by one in the provider's control panel.

Besides the mail records, the zone file contains the CNAME records for the `mta-sts`, `autoconfig`, `autodiscover` and `ua-auto-config` names that were created before the restart, because the TLS certificate needs them. It does not contain the A and AAAA records of the server hostname, because those exist before the installation starts, as listed in the [system requirements](/docs/install/requirements).

Once published, each record returns the value shown in the zone file when queried through a public resolver. The server computes the zone file for every domain, whether or not it publishes the records itself. The following queries check the main records, with the DKIM selector name, such as `v1-ed25519-20260101`, taken from the zone file:

```sh
dig +short @1.1.1.1 MX example.com
dig +short @1.1.1.1 TXT example.com
dig +short @1.1.1.1 TXT _dmarc.example.com
dig +short @1.1.1.1 TXT v1-ed25519-20260101._domainkey.example.com
```

If the certificate warning of Step 5 remained because records were missing, no further action is needed: once they resolve, the next attempt of the order obtains the certificate.

If something goes wrong in this step, [Step 6: DNS records](#step-6-dns-records) under Common problems lists the usual causes and their fixes.
