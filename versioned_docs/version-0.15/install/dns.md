---
sidebar_position: 5
---

# Setting up DNS

When deploying a mail server, correctly configuring DNS records is essential to ensure email delivery, client compatibility, and security. DNS records direct email traffic, authenticate outgoing messages, enforce transport security, and enable mail clients to discover and connect to the server automatically.

Stalwart simplifies this process by automatically generating the necessary DNS records for each domain you configure. These records can be easily copied and added to your domain’s DNS provider. Below is a detailed explanation of each record type and its role in the mail infrastructure.


## Mail Exchange (MX) Records

MX records specify which mail server is responsible for receiving email messages for your domain. These are critical for directing incoming email traffic to your server.

```
MX	example.org.	10 mail.example.org.
```

In this example, email for `example.org` is directed to `mail.example.org` with a priority of 10. Lower numbers indicate higher priority when multiple servers are listed.

## DKIM Records

[DomainKeys Identified Mail (DKIM)](/docs/mta/authentication/dkim/overview) adds a digital signature to outgoing emails to prove they originated from your domain and haven’t been altered in transit. DKIM uses TXT records that publish public keys used to verify these signatures.

```
TXT	202404e._domainkey.example.org.	v=DKIM1; k=ed25519; h=sha256; p=N/BkJD6xbEiMb39v7JW6AwdPHO5gKB3fcCnod4zQ31U=
TXT	202404r._domainkey.example.org.	v=DKIM1; k=rsa; h=sha256; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqlddLN3BjInvBqI1KpdouG7feBsEt5t233jWQJW7FaY7sR/MfWNxuzTObLoZ3l76DFq3xPjVhmy/YYiOAnMOtq9hUFqgBVTSwUNHYPz1YUEcrI5+Ban7P7LV8kggvTAaWhAI3iSXJIFaUq78K8YYr/zrGyBlg5HCPpd+DMRAB8j1ID8bcWFaVebwAOrartXOO/f8Bn9jrRrLhjP3c8UlmkJLXkSncXPp69R9VpevrKJtpBjaFxKtx7DXGie821MHuWJ7pWMdU1Uf3z8UBKF9bnrCZ5v0SdiaFkPXR1Iiq/gR6bMwdlWvST9V6ePnqZqX+Iv4FA28byOot73/CIINFwIDAQAB
```

Each DKIM record corresponds to a cryptographic key and is referenced by a selector, like `202404e` or `202404r`.

## SPF Records

The [Sender Policy Framework (SPF)](/docs/mta/authentication/spf) helps mail servers verify whether an email claiming to come from your domain was sent from an authorized server. SPF records are published as TXT records.

```
TXT	mail.example.org.	v=spf1 a ra=postmaster -all
TXT	example.org.	v=spf1 mx ra=postmaster -all
```

These policies indicate that mail can be sent from the server defined by the domain’s MX or A records, and instruct recipient servers to reject emails from unauthorized sources.

## DMARC Record

[Domain-based Message Authentication, Reporting & Conformance (DMARC)](/docs/mta/authentication/dmarc) builds on SPF and DKIM, specifying what to do when an email fails authentication and where to send reports.

```
TXT	_dmarc.example.org.	v=DMARC1; p=reject; rua=mailto:postmaster@example.org; ruf=mailto:postmaster@example.org
```

This example tells receiving servers to reject non-authenticating messages and send both aggregate (`rua`) and forensic (`ruf`) reports to the postmaster.

## MTA-STS Records

[Mail Transfer Agent Strict Transport Security (MTA-STS)](/docs/mta/transport-security/mta-sts) ensures that emails sent to your domain are encrypted and sent over a secure channel.

```
CNAME	mta-sts.example.org.	mail.example.org.
TXT	_mta-sts.example.org.	v=STSv1; id=16561011793845132961
```

The CNAME record points to where your MTA-STS policy is hosted, while the TXT record identifies the version and policy ID to track changes.

## TLS Reporting (TLS-RPT) Record

[SMTP TLS Reporting](/docs/mta/reports/tls) allows mail servers to send reports about failed TLS negotiations when trying to deliver email to your domain.

```
TXT	_smtp._tls.example.org.	v=TLSRPTv1; rua=mailto:postmaster@example.org
```

This record tells sending servers where to report TLS issues, helping you monitor and improve secure transport.

## SRV Records for Client Services

SRV records guide email clients like Thunderbird, Outlook, or mobile apps to the correct server and port for various services.

```
SRV	_imap._tcp.example.org.	0 1 110 mail.example.org.
SRV	_imaps._tcp.example.org.	0 1 993 mail.example.org.
SRV	_submissions._tcp.example.org.	0 1 465 mail.example.org.
SRV	_submission._tcp.example.org.	0 1 587 mail.example.org.
```

These entries specify the protocols and ports your mail clients should use to connect to services like IMAP and SMTP.

## Autoconfiguration Records

To enable [automatic configuration](/docs/server/autoconfig) of email clients, these CNAME records should point to your mail server:

```
CNAME	autoconfig.example.org.	mail.example.org.
CNAME	autodiscover.example.org.	mail.example.org.
```

This makes it easier for users to set up their email clients without needing to enter server details manually.

## TLSA Records (DANE)

[TLSA records](/docs/mta/transport-security/dane) are part of DNS-based Authentication of Named Entities (DANE), providing cryptographic links between your mail server’s TLS certificate and its DNS records. These are optional but recommended for improving TLS security.

```
TLSA	_25._tcp.mail.example.org.	3 0 1 064dbc632f1ba7d0a2a3faeadeedfebd6f90f850dfb852c97ee9df9b6e5c5e7c
...
```

You can publish one or more TLSA records depending on your certificate management strategy. If you don’t rotate keys frequently, a single record with a usage of `3` (DANE-EE) is usually sufficient. For frequent rotations, including multiple TLSA records provides resilience and avoids service interruptions during key transitions.

Proper DNS configuration is critical to the secure and reliable operation of your mail server. Stalwart makes it easy to generate these records, but it’s up to administrators to ensure they are published correctly at your DNS provider. Always verify propagation and check your setup with testing tools after making changes.

