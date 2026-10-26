---
title: "Setting up clients"
description: "The server settings mail, calendar and contact clients need, the DAV and JMAP URLs, how clients discover them automatically, and what to check when a client does not configure itself."
sidebar_position: 8.5
---

Users connect to Stalwart with a variety of mail, calendar and contacts clients, and each client needs to know where the server is and how to sign in. This page lists what such a client needs: the host names and ports of each protocol, the URLs of the calendar, contacts and file collections, and the sign-in name.

Most clients find these settings themselves once the domain's DNS records are published, either through [autoconfiguration](/docs/server/autoconfig) or through DNS SRV records. The values below serve the clients that do not. They also show what the automatic setup should produce, which helps when checking that it works.

## Server settings

With the [default listeners](/docs/server/listener#default-listeners), clients use the settings in the following table. The host is the server's default hostname, or the host name configured for the protocol in [`SystemSettings.services`](/docs/server/general#mail-exchangers-and-advertised-services).

| Protocol | Port | Security |
|---|---|---|
| IMAP | 993 | SSL/TLS (implicit) |
| POP3 | 995 | SSL/TLS (implicit) |
| SMTP submission | 465 | SSL/TLS (implicit) |
| ManageSieve | 4190 | STARTTLS |
| JMAP, CalDAV, CardDAV, WebDAV | 443 | HTTPS |

The STARTTLS ports are not part of the default set. IMAP with STARTTLS on 143, POP3 on 110 and submission with STARTTLS on 587 are available only if the administrator has created listeners for them. Clients that offer a choice should therefore use the implicit-TLS ports above.

## Sign-in name and password

The sign-in name is the account's full email address, for example `jane@example.com`. Accounts that hold the `authenticateWithAlias` permission can also sign in with any of their aliases, and the default user role includes that permission. A name without a domain is completed with the server's default domain.

The password is the account password, with one exception. IMAP, POP3 and SMTP clients have no way to complete two-factor authentication, so accounts that use it sign in from those clients with an [app password](/docs/auth/authentication/app-password). Clients that support OAuth can sign in through the browser instead. [Mail clients and OAuth](/docs/auth/oauth/mail-clients) describes which clients do and how.

## Calendar, contacts and file URLs

Calendars, address books and files are served over the DAV protocols, and each account's collections are under the following paths:

| Collection | URL |
|---|---|
| Calendars (CalDAV) | `https://<host>/dav/cal/<account>/` |
| Address books (CardDAV) | `https://<host>/dav/card/<account>/` |
| Files (WebDAV) | `https://<host>/dav/file/<account>/` |
| Principals | `https://<host>/dav/pal/<account>/` |

`<account>` identifies the account in one of two ways. It is either one of the account's email addresses, or `_` followed by the numeric account id. Where a client requires the address to be encoded, `@` is written as `%40`, as in `jane%40example.com`. Aliases of the account are accepted. A bare local name such as `jane`, a sub-address such as `jane+tag@example.com` and a catch-all address are not.

Most CalDAV and CardDAV clients need only the server name. They request `/.well-known/caldav` or `/.well-known/carddav`, which redirect (HTTP 307) to `/dav/cal` and `/dav/card`, and find the account's collections from there. For clients that ask for a full URL, enter the calendar or address book URL from the table.

JMAP clients start from `https://<host>/.well-known/jmap`, which redirects to the session resource `/jmap/session`.

## Automatic discovery

Each family of clients looks for its settings in a different place:

- Thunderbird and other clients that use Mozilla autoconfig fetch the settings from `autoconfig.<domain>`.
- Outlook uses Autodiscover at `autodiscover.<domain>`, which returns the IMAP, POP3 and SMTP settings.
- Clients that implement PACC fetch a document from `ua-auto-config.<domain>`. It covers mail, calendars and contacts, including OAuth sign-in.
- Clients that look up SRV records, among them several CalDAV and CardDAV clients, query `_imaps._tcp`, `_submissions._tcp`, `_caldavs._tcp`, `_carddavs._tcp`, `_jmap._tcp` and others.

Apple Mail, Calendar and Contacts on macOS and iOS are the main exception. They do not read Mozilla autoconfig documents, and Stalwart does not generate the configuration profiles (`.mobileconfig`) that they use instead, so they are set up by hand:

- For mail, enter the email address, the password and the server's host name for incoming and outgoing mail.
- For calendars and contacts, add a CalDAV or CardDAV account with the server's host name.

## Per-client notes

The common clients differ in how they discover the server and whether they pick up calendars and contacts:

| Client | Discovery | Calendars and contacts | Notes |
|---|---|---|---|
| Thunderbird | Mozilla autoconfig | Listed in the autoconfig document | |
| Outlook | Autodiscover | Not included in the Autodiscover response | When discovery fails, add the account manually as IMAP |
| Apple Mail, Calendar and Contacts (macOS, iOS) | None | Add a CalDAV and a CardDAV account with the server's host name | Enter the settings manually |
| DAVx5 and other CalDAV/CardDAV clients | `/.well-known/caldav`, `/.well-known/carddav`, SRV records | Found from the server name and the email address | Enter `https://<host>` as base URL |

[Mail clients and OAuth](/docs/auth/oauth/mail-clients) lists which clients sign in with OAuth. [Autoconfiguration](/docs/server/autoconfig) describes the content of each discovery document and what the server must have in place for discovery to work: the CNAME records for the discovery host names, a certificate that covers them, and HTTPS on port 443.

## Setup failures

When a client fails to set itself up or to sign in, check the following causes:

- **The certificate does not cover the discovery names.** `autoconfig.<domain>`, `autodiscover.<domain>` and `ua-auto-config.<domain>` must be in the server's certificate. Otherwise clients reject the discovery document, or fall back to guessing host names.
- **The DNS records are missing.** Without the CNAME records for the discovery names and the SRV records, clients have nothing to query ([Setting up DNS](/docs/install/dns#autoconfiguration)).
- **A reverse proxy does not forward the discovery host names to Stalwart**, or answers them itself.
- **The STARTTLS ports are not offered.** Only implicit-TLS ports are advertised unless the service's `cleartext` flag is set. A client that insists on port 587 or 143 therefore needs manual settings and a listener on that port.
- **The account has two-factor authentication.** IMAP, POP3 and SMTP sign-in fails with the account password. Create an app password.
- **The calendar or address book is not found.** The URL contains a bare user name or a sub-address. Use the full email address.
