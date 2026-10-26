---
sidebar_position: 9
title: "DNS records"
description: "The DNS records a Stalwart mail domain needs, what each one does, the exact form Stalwart generates, and how to verify them."
---

Email has no central registry of mail servers. When a server on the internet has a message for `jane@example.org`, the only place it can learn where to deliver it, and whether to believe a message that claims to come from `example.org`, is the domain's DNS zone. A mail domain therefore depends on DNS for three things: other servers find the host that receives its mail through MX records, they decide whether to trust mail sent in its name through SPF, DKIM and DMARC records, and mail clients find the server settings through SRV and autoconfiguration records.

Stalwart knows its own configuration, so it computes the records each domain needs rather than leaving the administrator to compose them. This page lists each record Stalwart can generate for a domain, in the form it generates it, and what stops working when the record is missing. The linked pages explain the mechanisms. Step 6 of the installation tutorials publishes these records for the first domain.

## Publishing the records

Stalwart computes the record set of every [Domain](/docs/ref/object/domain) from the server configuration. How the records reach the zone depends on whether the domain uses automatic DNS management.

Automatic DNS management is the recommended way. Stalwart writes the records through the API of the zone's DNS provider and keeps them current as keys rotate and certificates renew, so none of them has to be copied or updated by hand. The setup wizard enables it for the first domain when a provider is selected on its last screen, and [Automatic DNS records](/docs/domains/dns-records) describes how to enable it for any domain.

When the zone's provider is not supported, or the zone must stay under manual control, the administrator publishes the records by hand from the domain's zone file. The WebUI shows the zone file from the domain list (<!-- breadcrumb:Domain --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg> Domains › Domains<!-- /breadcrumb:Domain -->) through the domain's menu (**View Zone File**), and the CLI reads it from the read-only [`dnsZoneFile`](/docs/ref/object/domain#dnszonefile) field with `stalwart-cli get domain <id> --fields dnsZoneFile`, where `stalwart-cli query domain` lists the domains with their ids. The zone file is in BIND format and can be imported by most providers. Records that change during operation, such as the TLSA digests at certificate renewal and the MTA-STS policy identifier, then need a manual update each time.

The examples below use the domain `example.org` and the server hostname `mail.example.org`.

## MX

MX records name the hosts that receive mail for the domain. Stalwart generates one per entry in [`SystemSettings.mailExchangers`](/docs/ref/object/system-settings#mailexchangers). By default the list has a single entry for the default hostname, with priority <!-- default:SystemSettings.MailExchanger.priority -->10<!-- /default -->:

```
example.org.	MX	10 mail.example.org.
```

Without an MX record, senders fall back to the A or AAAA record of the domain itself, which usually points at a web server, and mail is not delivered. The same list of mail exchangers determines the SPF records, the TLSA records and the names in ACME certificate orders, so it should be complete before records are published.

## SPF

Sender Policy Framework (SPF, [RFC 7208](https://www.rfc-editor.org/rfc/rfc7208)) lists the hosts allowed to send mail for the domain. Stalwart generates a record at the domain that authorises its mail exchangers, and one at each mail exchanger hostname inside the domain, which covers the bounces and reports the server sends from that hostname:

```
example.org.	TXT	"v=spf1 mx -all"
mail.example.org.	TXT	"v=spf1 a -all"
```

`-all` tells receivers to reject mail from any other source, so the record must also list any other system that sends mail for the domain. A domain can hold only one SPF record, and two `v=spf1` records make SPF fail with a permanent error. See [SPF](/docs/mta/authentication/spf).

## DKIM

DomainKeys Identified Mail (DKIM, [RFC 6376](https://www.rfc-editor.org/rfc/rfc6376)) publishes the public keys with which receivers verify the signatures on the domain's mail. Each key is a TXT record under a selector named from the domain's [`selectorTemplate`](/docs/ref/object/domain#selectortemplate). By default the domain has one Ed25519 and one RSA key:

```
v1-ed25519-20260101._domainkey.example.org.	TXT	"v=DKIM1; k=ed25519; h=sha256; p=<public key>"
v1-rsa-20260101._domainkey.example.org.	TXT	"v=DKIM1; k=rsa; h=sha256; p=<public key>"
```

Without the record, DKIM fails at the receiver, and DMARC can then pass only through SPF. The zone file contains the record of every key that is not retired. See [DKIM](/docs/mta/authentication/dkim/) and [DKIM key rotation](/docs/domains/dkim-rotation).

## DMARC

DMARC ([RFC 9989](https://www.rfc-editor.org/rfc/rfc9989)) lets the domain in the `From` header tell receivers how to treat mail that does not pass DMARC, and where to send aggregate reports. A message passes when SPF or DKIM passes for a domain aligned with the `From` domain, which means the same domain or, in relaxed mode, a domain with the same organizational domain. Stalwart generates a reject policy with reports sent to the domain's [`reportAddressUri`](/docs/ref/object/domain#reportaddressuri), <!-- default:Domain.reportAddressUri -->`mailto:postmaster`<!-- /default --> by default, and generates no record when the report address is unset:

```
_dmarc.example.org.	TXT	"v=DMARC1; p=reject; rua=mailto:postmaster@example.org"
```

A domain whose other senders are not yet covered by SPF or DKIM can publish `p=none` by hand first and move to `p=reject` once the reports show that all legitimate mail passes. Without a DMARC record, large mailbox providers are more likely to classify the domain's mail as spam. See [DMARC](/docs/mta/authentication/dmarc).

## MTA-STS

MTA-STS ([RFC 8461](https://www.rfc-editor.org/rfc/rfc8461)) lets a domain tell sending servers that its mail must be delivered over TLS with a valid certificate. The policy Stalwart generates starts in <!-- default:MtaSts.mode -->`testing`<!-- /default --> mode, in which senders report failed TLS connections but still deliver; the mode is changed to enforce in [MtaSts](/docs/ref/object/mta-sts) once the TLS reports show no failures. Stalwart serves the policy file at `https://mta-sts.<domain>/.well-known/mta-sts.txt` and generates the records when a policy is configured:

```
mta-sts.example.org.	CNAME	mail.example.org.
_mta-sts.example.org.	TXT	"v=STSv1; id=<policy id>"
```

The certificate must also cover `mta-sts.example.org`. Without the records, senders fall back to opportunistic TLS. See [Publishing an MTA-STS policy](/docs/domains/mta-sts).

## TLS reporting

SMTP TLS Reporting (TLS-RPT, [RFC 8460](https://www.rfc-editor.org/rfc/rfc8460)) asks sending servers for daily reports on their TLS connections to the domain's mail servers. The record is generated when a report address is set:

```
_smtp._tls.example.org.	TXT	"v=TLSRPTv1; rua=mailto:postmaster@example.org"
```

Without it, delivery problems caused by TLS are visible only to the senders. See [TLS reports](/docs/mta/reports/tls).

## SRV records

SRV records tell mail, calendar and contacts clients which host and port serve each protocol ([RFC 6186](https://www.rfc-editor.org/rfc/rfc6186), [RFC 6764](https://www.rfc-editor.org/rfc/rfc6764), [RFC 8314](https://www.rfc-editor.org/rfc/rfc8314#section-5.1) for `_submissions` and [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-2.2) for `_jmap`). Stalwart generates one per protocol in [`SystemSettings.services`](/docs/ref/object/system-settings#services), on the implicit-TLS ports of the [default listeners](/docs/server/listener#default-listeners):

```
_jmap._tcp.example.org.	SRV	0 1 443 mail.example.org.
_caldavs._tcp.example.org.	SRV	0 1 443 mail.example.org.
_carddavs._tcp.example.org.	SRV	0 1 443 mail.example.org.
_imaps._tcp.example.org.	SRV	0 1 993 mail.example.org.
_pop3s._tcp.example.org.	SRV	0 1 995 mail.example.org.
_submissions._tcp.example.org.	SRV	0 1 465 mail.example.org.
```

The variants for ports 143, 110 and 587 are generated only for a service whose `cleartext` flag is set. The flag only advertises the service: accepting cleartext connections is configured on the listener. Without SRV records, clients that use them fall back to guessing host names or to manual configuration.

## Autoconfiguration

Mail clients look up their settings on dedicated host names under the user's domain, all served by Stalwart:

```
autoconfig.example.org.	CNAME	mail.example.org.
autodiscover.example.org.	CNAME	mail.example.org.
ua-auto-config.example.org.	CNAME	mail.example.org.
_ua-auto-config.example.org.	TXT	"v=UAAC1; a=sha256; d=<digest>"
```

`autoconfig` is used by Thunderbird and other clients of the Mozilla format, `autodiscover` by Outlook, and `ua-auto-config` with its digest record by clients of the PACC draft. All three names are fetched over HTTPS, so the certificate must cover them, and the default ACME order includes them. See [Autoconfiguration](/docs/server/autoconfig).

## CAA

CAA records ([RFC 8659](https://www.rfc-editor.org/rfc/rfc8659)) list the certificate authorities allowed to issue certificates for the domain. When the domain obtains its certificates through ACME, Stalwart generates an `issue` record restricted with `accounturi` ([RFC 8657](https://www.rfc-editor.org/rfc/rfc8657)) to its ACME account, and an `iodef` record with the report address:

```
example.org.	CAA	0 issue "letsencrypt.org;accounturi=https://acme-v02.api.letsencrypt.org/acme/acct/<id>"
example.org.	CAA	0 iodef "mailto:postmaster@example.org"
```

The authority is named by the CAA identities that it advertises in its ACME directory, with one `issue` record for each. An authority that advertises none is named by the registered domain of its directory URL. When the ACME provider uses the [DNS-PERSIST-01](/docs/server/tls/acme/challenges#dns-persist-01) challenge, which requires an authority that advertises the record parameters in its ACME directory, the CAA records also include the `_validation-persist` TXT records that the challenge needs, with a hashed account URI that differs for each name:

```
_validation-persist.example.org.	TXT	"<issuer>; accounturi=<prefix>sha-256/<hash>; policy=wildcard"
```

CAA records are optional. Once published, an authority that is not listed, or an ACME account other than the one in `accounturi`, is refused, so the records must be updated before switching to another ACME provider or account.

## TLSA

TLSA records publish digests of the server's certificates for DANE ([RFC 7672](https://www.rfc-editor.org/rfc/rfc7672)), which lets DANE-aware senders authenticate the server without a certificate authority. Stalwart generates, for each of its host names inside the domain, a DANE-EE record (usage `3`) for the server's certificate and DANE-TA records (usage `2`) for the issuing certificates:

```
_25._tcp.mail.example.org.	TLSA	3 1 1 <sha256 of the server public key>
_25._tcp.mail.example.org.	TLSA	2 1 1 <sha256 of the issuer public key>
```

TLSA records take effect only in a DNSSEC-signed zone, and a stale record makes DANE-aware senders refuse delivery, so they are not part of the default automatic set and must be added to it explicitly. See [DANE](/docs/mta/transport-security/dane).

## Verifying the records

After publishing, query the records through a public resolver, here `1.1.1.1`, to confirm that they are visible from the internet:

```sh
dig +short @1.1.1.1 MX example.org
dig +short @1.1.1.1 TXT example.org
dig +short @1.1.1.1 TXT _dmarc.example.org
dig +short @1.1.1.1 TXT v1-ed25519-20260101._domainkey.example.org
dig +short @1.1.1.1 SRV _imaps._tcp.example.org
dig +short @1.1.1.1 CNAME autoconfig.example.org
```

Each query should return the value shown in the zone file. The provider of the server's IP address sets its reverse DNS, not the domain's zone, and `dig +short -x <ip>` should return the server hostname.
