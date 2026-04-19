---
sidebar_position: 7
---

# Autoconfig

Autoconfig and autodiscover are discovery protocols that allow mail clients to retrieve server settings from the mail domain without requiring manual configuration. They reduce setup errors and shorten the time needed to add an account to a client. Stalwart implements three such protocols: PACC, the legacy Mozilla Autoconfig, and Microsoft Autodiscover.

### PACC

PACC is the short name for "Automatic Configuration of Email, Calendar, and Contact Server Settings", specified by the IETF draft [draft-ietf-mailmaint-pacc-02](https://datatracker.ietf.org/doc/html/draft-ietf-mailmaint-pacc-02). It is the modern standardised successor to the earlier vendor formats, with a single discovery document that covers mail, calendar, and contact services together.

After prompting the user for an email address (and, where needed, an account password), a PACC-aware client uses the domain part of the address to fetch the configuration from the well-known URI defined by [RFC 8615](https://www.rfc-editor.org/rfc/rfc8615), using the suffix `user-agent-configuration`. A client signing in as `user@example.com` therefore retrieves `https://example.com/.well-known/user-agent-configuration` and parses the JSON response. The document advertises human-readable metadata about the provider, the protocols offered for the domain, the server endpoints for each one, and whether the provider supports the OAuth Profile for Open Public Clients; a client that speaks the listed protocols can complete the setup without further input. Combining mail (JMAP, IMAP, POP, SMTP submission), calendar (CalDAV), and contact (CardDAV) services under a single discovery lookup avoids the per-service fallbacks required by the legacy formats and gives IETF-standardised semantics to fields that were previously vendor-defined.

### Autoconfig

Autoconfig is the legacy format originally defined by Mozilla and now described in an IETF draft. The client fetches a standardised XML document at a URL derived from the user's domain. A client starting from the address `user@example.com` retrieves `http://autoconfig.example.com/mail/config-v1.1.xml` and parses the server addresses, port numbers, and encryption mechanisms from the response. The format is limited to mail services (IMAP, POP, SMTP).

### Microsoft Autodiscover

Autodiscover is the format originally introduced by Microsoft for Exchange and Outlook clients. The client issues a request to a URL derived from the user's domain (for example `https://autodiscover.example.com/autodiscover/autodiscover.xml`) and parses the XML response to configure the protocol, server URLs, and related parameters. Two revisions of the protocol exist: v1, which returns the configuration directly from the domain's autodiscover endpoint, and v2, which first returns a redirect to the endpoint that serves the configuration for the requested service. Stalwart supports both.

## Configuration

No protocol-specific configuration is required beyond the standard mail services. Clients that reach the server over HTTPS (port 443) receive the generated PACC, autoconfig, and autodiscover documents automatically.

The information advertised in those documents is driven by the [SystemSettings](/docs/ref/object/system-settings) singleton (found in the WebUI under <!-- breadcrumb:SystemSettings --><!-- /breadcrumb:SystemSettings -->). Per-protocol hostnames and whether a protocol is offered in cleartext or TLS-only mode are controlled through [`services`](/docs/ref/object/system-settings#services); provider metadata advertised to mail clients (name, documentation URLs, logo, contact URI) is set through [`providerInfo`](/docs/ref/object/system-settings#providerinfo).

Stalwart can also generate the DNS records required by PACC, autoconfig, and Microsoft autodiscover for each configured domain. The records are exposed on the domain management page in the [WebUI](/docs/management/webui/overview).
