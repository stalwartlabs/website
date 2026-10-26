---
title: "Client ID Metadata Documents"
description: "Let OAuth clients identify themselves with an https URL that serves their metadata, and choose which URLs the server accepts."
sidebar_position: 4
---

A Client ID Metadata Document lets a web application use an OAuth server that it has never registered with. The application publishes a JSON document that describes it, with its name, redirect URIs and requested scopes, at an https URL. It then uses that URL as its client id. When the authorization server receives such a client id, it fetches the document and treats it as the client's registration. The mechanism is specified in [draft-ietf-oauth-client-id-metadata-document](https://datatracker.ietf.org/doc/draft-ietf-oauth-client-id-metadata-document/).

The mechanism fills a gap that dynamic registration leaves. Dynamic registration requires loopback or private-use redirect URIs, which native applications can use but web applications cannot. A metadata document lets a web application register with an https redirect URI instead. It is also how the WebUI identifies itself to external identity providers that support it.

## Accepting metadata documents

A metadata document can be published by anyone, so accepting them means letting arbitrary web applications ask users for access. The [`clientMetadataDocuments`](/docs/ref/object/oidc-provider#clientmetadatadocuments) field of the [OidcProvider](/docs/ref/object/oidc-provider) singleton (found in the WebUI under <!-- breadcrumb:OidcProvider --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" /><path d="M14 13.12c0 2.38 0 6.38-1 8.88" /><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" /><path d="M2 12a10 10 0 0 1 18-6" /><path d="M2 16h.01" /><path d="M21.8 16c.2-2 .131-5.354 0-6" /><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" /><path d="M8.65 22c.21-.66.45-1.32.57-2" /><path d="M9 6.8a6 6 0 0 1 9 5.2v2" /></svg> Authentication › OIDC Provider<!-- /breadcrumb:OidcProvider -->) decides whether third-party documents are accepted. The policy is <!-- default:OidcProvider.clientMetadataDocuments -->`disabled`<!-- /default --> unless changed, so the server accepts no third-party document until an administrator chooses one of the other values:

| Value | Accepted client ids |
|---|---|
| `disabled` | None, except the cases below |
| `sameDomain` | URLs whose registrable domain equals that of the server's public https URL, subdomains included |
| `any` | Any https URL that passes the rules below |

`sameDomain` compares registrable domains, the part of a hostname that an organisation registers, such as `example.com`. With a public URL of `https://mail.example.com`, a document at `https://apps.example.com/client.json` is therefore accepted, and one at `https://example.net/client.json` is not. When the public URL is an IP address, `sameDomain` matches nothing.

The policy decides only whether the server may fetch a document. It never makes a client first party, and it never removes the consent screen. A client identified by a metadata document is always shown as unverified, with the hostname of its client id and without a logo, and it receives only the scopes it requested.

Two kinds of metadata document client id work whatever the policy says:

- The server's own web applications, such as the WebUI, are recognised from the `oauth-client.json` document in their installed bundle. The server reads this document locally and never fetches it ([Applications](/docs/management/applications/)).
- A client id that an administrator has [pre-registered](/docs/auth/oauth/register-client#pre-register-an-application-that-publishes-a-metadata-document) as an OAuthClient is resolved from that object. Its name and logo then come from the administrator, and it is shown as verified.

## Client id rules

The client id must be an https URL with a domain name and a path. It must not contain a query, a fragment, user information, `.` or `..` path segments, or an IP address literal.

A client id that breaks a rule, or that the policy does not allow, ends the authorization request with an error page. The browser is never redirected back to the client, because the server cannot trust a redirect URI it has not been able to verify.

## Document rules

The document is a JSON object that follows the client metadata of RFC 7591. It must meet these requirements:

- `client_id` must equal the URL the document was fetched from.
- `token_endpoint_auth_method` must be present and set to `none`. The document must not contain `client_secret`, `client_secret_expires_at` or private key material, because a document published on the web cannot keep a secret.
- `redirect_uris` must list between 1 and 16 URIs. Each must be an https or loopback URI without a fragment and at most 2048 bytes long. The `redirect_uri` of an authorization request must match one of them exactly, except that any port matches a loopback URI.
- `post_logout_redirect_uris` is optional and lists at most 16 URIs in the same format. These are the URIs to which the end-session endpoint may return the user after sign-out, and they are matched exactly, with no allowance for loopback ports.
- `scope` lists the scopes the client may request. Only the four service scopes count (`urn:ietf:params:oauth:scope:mail`, `contacts`, `calendars` and `files`). When the member is absent, all four are allowed. `openid` and `offline_access` are always allowed.
- `client_name` is shown on the consent screen.

The following document describes a calendar application hosted at `app.example.net`:

```json
{
  "client_id": "https://app.example.net/oauth-client.json",
  "client_name": "Example Calendar",
  "client_uri": "https://app.example.net/",
  "redirect_uris": ["https://app.example.net/callback"],
  "post_logout_redirect_uris": ["https://app.example.net/"],
  "token_endpoint_auth_method": "none",
  "grant_types": ["authorization_code", "refresh_token"],
  "response_types": ["code"],
  "scope": "openid urn:ietf:params:oauth:scope:calendars urn:ietf:params:oauth:scope:contacts"
}
```

A document that breaks a rule fails the authorization request, and the error page states the reason. The reasons a client developer is most likely to see are:

- "redirect_uris must list between 1 and 16 URIs"
- "redirect_uris must be https or loopback URIs without a fragment, of at most 2048 bytes"
- "post_logout_redirect_uris must not list more than 16 URIs"
- "post_logout_redirect_uris must be https or loopback URIs without a fragment, of at most 2048 bytes"
- "client_id does not match the document URL"
- "token_endpoint_auth_method must be \"none\""

## Fetching and caching

Fetching a document means that the server makes an outbound request to a URL chosen by the client. The server limits these requests so that they cannot be abused. It fetches a document only while processing an authorization request, never at the token endpoint, and every fetch is subject to these limits:

- The request goes only to public IP addresses, so a client id cannot point the server at an internal service. Redirects are never followed.
- The response must have status 200 and be at most 5 KiB, and the fetch times out after 5 seconds.
- A valid document is cached for the time given by its `Cache-Control: max-age`, clamped between 5 minutes and 24 hours. When no `max-age` is sent, it is cached for 5 minutes. Errors and invalid documents are not cached.
- Fetches are limited per client IP address by the anonymous request rate limit, and to 30 per registrable domain per minute.

Because the token endpoint does not fetch the document, a client keeps refreshing its tokens while its host is unreachable. The policy, however, is checked again at every refresh. Changing `clientMetadataDocuments` so that a client's URL is no longer allowed therefore makes its refreshes fail with `invalid_client`. A pre-registered client is not affected, because it is resolved from its OAuthClient.

Two [store maintenance tasks](/docs/management/tasks-actions/tasks) act on this machinery. A task of type `removeAuthTokens` also clears the cached documents, and one of type `resetRateLimiters` resets the per-domain fetch limit.
