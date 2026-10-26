---
sidebar_position: 8
title: "Autoconfiguration"
description: "How mail clients discover Stalwart's settings through Mozilla autoconfig, Outlook Autodiscover and PACC, what each document contains, and what must be in place for discovery to work."
---

Setting up a mail account by hand means entering host names, ports and security settings for every protocol, and users get these details wrong easily. Autoconfiguration removes that step. The client finds the server settings for an account from the user's email address alone, so the user only enters the address and the password.

There is no single standard for this, and different clients use different protocols. Stalwart answers three of them, all from the same configuration:

- Mozilla autoconfig, used by Thunderbird and many other clients
- Microsoft Autodiscover, used by Outlook
- PACC, a newer IETF draft that also covers calendars and contacts

The documents are generated from [SystemSettings](/docs/ref/object/system-settings), so they need no configuration of their own. Clients that support none of these protocols are set up by hand, as described in [Setting up clients](/docs/server/clients).

## Requirements

A client looks for the documents on host names under the user's domain, and fetches them over HTTPS. For an address such as `user@example.com`, discovery works when four conditions hold:

1. DNS points `autoconfig.example.com`, `autodiscover.example.com` and `ua-auto-config.example.com` at the server, and `_ua-auto-config.example.com` holds the PACC digest record. Stalwart generates these records together with the domain's other records, as described in [Setting up DNS](/docs/install/dns#autoconfiguration).
2. The certificate served on port 443 covers these names. The default ACME certificate for a domain includes them with every challenge type, as described in [Names in a certificate](/docs/server/tls/acme/configuration#names-in-a-certificate).
3. HTTPS on port 443 reaches Stalwart for these host names. Behind a reverse proxy, the proxy must route them to Stalwart as well.
4. The advertised settings are correct. The host name of each service in [`SystemSettings.services`](/docs/server/general#mail-exchangers-and-advertised-services), or the default hostname, must be the name that clients connect to, and the certificate must cover it.

The server does not check whether the domain in the request is one it hosts. Any address therefore receives the server's settings.

## Advertised settings

All three documents are built from [`SystemSettings.services`](/docs/ref/object/system-settings#services), which by default contains every protocol. For each protocol listed, the document advertises the entry's `hostname`, or the default hostname when the entry has none.

The implicit-TLS ports are always advertised: IMAP on 993, POP3 on 995 and SMTP submission on 465. The STARTTLS ports 143, 110 and 587 are added only for services whose `cleartext` flag has been turned on. The flag changes only what is advertised, and opens no port.

The provider name, logo and documentation links in the documents come from [`providerInfo`](/docs/ref/object/system-settings#providerinfo).

The formats treat the user's address differently. Mozilla autoconfig documents never repeat the address from the request. They contain the placeholder `%EMAILADDRESS%` instead, which the client replaces with the address the user entered, and they use the domain as display name. Autodiscover responses, by contrast, contain the requested address as login name.

## Mozilla autoconfig

The autoconfig document is served at three paths, with the address in the `emailaddress` query parameter:

- `/mail/config-v1.1.xml`
- `/.well-known/autoconfig/mail/config-v1.1.xml`
- `/.well-known/mail-v1.xml`

Thunderbird requests `https://autoconfig.<domain>/mail/config-v1.1.xml` and `https://<domain>/.well-known/autoconfig/mail/config-v1.1.xml`.

The document lists the IMAP, POP3 and SMTP servers with password authentication. It also lists the CalDAV, CardDAV and WebDAV servers, at `https://<host>/dav/cal`, `https://<host>/dav/card` and `https://<host>/dav/file`, with HTTP Basic authentication. This format cannot advertise OAuth.

## Outlook Autodiscover

Outlook sends `POST /autodiscover/autodiscover.xml` to `autodiscover.<domain>`, with the address in the request body. Autodiscover defines several response schemas, and Stalwart answers only the Outlook schema (`http://schemas.microsoft.com/exchange/autodiscover/outlook/responseschema/2006a`). Its answer contains the IMAP, POP3 and SMTP settings, with the email address as login name. Requests for other schemas, such as the Exchange ActiveSync schema, receive an error response with code 601.

`/autodiscover/autodiscover.json` is the JSON variant. It accepts the address as a path segment or in the `Email` query parameter. It answers only `Protocol=AutodiscoverV1`, with a JSON document that points to the XML endpoint on the default hostname:

```json
{"Protocol":"AutodiscoverV1","Url":"https://mail.example.com/autodiscover/autodiscover.xml"}
```

Any other protocol, such as `ActiveSync` or `Ews`, receives `400` with the error code `InvalidProtocol`, because Stalwart implements neither Exchange ActiveSync nor EWS.

## PACC

PACC (Automatic Configuration of Email, Calendar, and Contact Server Settings) is described in the Internet-Draft [draft-ietf-mailmaint-pacc](https://datatracker.ietf.org/doc/draft-ietf-mailmaint-pacc/). Unlike the older formats, it lets the client verify the document. The client fetches `https://ua-auto-config.<domain>/.well-known/user-agent-configuration.json` and checks its SHA-256 digest against the `_ua-auto-config.<domain>` TXT record. A client that performs the check ignores a document whose digest does not match.

The document lists the following services:

- JMAP, at `https://<host>/jmap/session`
- CalDAV, CardDAV and WebDAV, at `/dav/cal/`, `/dav/card/` and `/dav/file/`
- The host names for IMAP, POP3, SMTP and ManageSieve

It advertises password authentication and, in most cases, OAuth for public clients. With OAuth, clients can sign in through the browser without an app password. The OAuth issuer that the document names depends on the domain's directory:

- The internal directory, and LDAP and SQL directories, advertise Stalwart's own issuer.
- An OpenID Connect directory whose provider supports OAuth for public clients advertises the external provider's issuer.
- An OpenID Connect directory whose provider does not support OAuth for public clients advertises no OAuth at all, only password authentication.

### Keeping the digest current

The digest covers the whole document, so the TXT record must be updated whenever the document changes. The document changes after a change to the advertised services, the provider information, the public URL or the directory. Until the record is updated, clients that check the digest ignore the document.

How to update the record depends on how the domain's DNS is managed:

- With [automatic DNS management](/docs/domains/dns-records#refresh-records), the record is updated only when a `DnsManagement` task runs for the domain. The changes above do not start one by themselves, so run one after the change.
- With manual DNS, copy the new record from the zone file.

## Discovery failures

The following symptoms each have a known cause:

- **The client reports a certificate error or silently falls back to manual setup.** The certificate does not cover `autoconfig.<domain>`, `autodiscover.<domain>` or `ua-auto-config.<domain>`. Check with `openssl s_client -connect autoconfig.example.com:443 -servername autoconfig.example.com`.
- **The names do not resolve.** The CNAME records are missing. `dig +short CNAME autoconfig.example.com` should return the server's host name.
- **A reverse proxy answers instead of Stalwart.** The proxy serves its own site, or a 404, for these host names. Route them to Stalwart.
- **STARTTLS ports are missing from the configuration.** Only implicit-TLS ports are advertised unless `cleartext` is set for the service.
- **Apple Mail and iOS do not use autoconfig.** They do not read Mozilla autoconfig documents, so set them up manually as described in [Setting up clients](/docs/server/clients).
