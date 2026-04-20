---
sidebar_position: 5
---

# OpenID Connect

Stalwart can authenticate users against a third-party **OpenID Connect (OIDC) provider**. This allows the server to delegate authentication to an existing identity system, for example Google, Microsoft Entra ID, or any OIDC-compliant provider.

As Stalwart is primarily a mail server, it handles OIDC somewhat differently from a typical web application. Clients authenticate over IMAP, POP3, SMTP, or JMAP using the `OAUTHBEARER` SASL mechanism, which carries an access token already obtained from the identity provider. Stalwart does not initiate the OIDC flow itself and does not consume an ID token directly; it validates the access token and uses it to resolve the user's identity.

## Authentication flow

Clients (such as mail applications) present an access token issued by the external OIDC provider using the `OAUTHBEARER` SASL mechanism. Because Stalwart is not part of the OIDC flow, it does not see the [ID token](/docs/auth/openid/id-tokens). To identify the user associated with an access token, Stalwart validates the token against the OIDC provider.

Validation is performed automatically through the provider's OIDC discovery document (the `/.well-known/openid-configuration` endpoint). From that document Stalwart resolves the provider's signing keys and the userinfo endpoint. The server first attempts offline validation of the access token using the JWT signing keys; when offline validation cannot be completed (for example, opaque tokens that are not JWTs), Stalwart queries the userinfo endpoint with the token to resolve the user's identity. In both cases the user's claims are read from the resulting payload. Token introspection with client credentials is not used.

## Limitations

### Offline access

Stalwart learns about an account only after the first time that account authenticates. OIDC does not provide an offline directory lookup, so an account that exists in the identity provider but has not yet signed in is unknown to the server. Mail addressed to such an account is rejected because the address does not resolve to a local recipient.

To avoid this, create accounts in Stalwart before users sign in for the first time. Accounts can be created through the [WebUI](/docs/management/webui/overview), the JMAP API, or the [CLI](/docs/management/cli/overview). Pre-creating the accounts ensures that inbound mail is accepted from the start, even for users who have not yet authenticated via OIDC.

### `OAUTHBEARER` SASL

Many widely deployed mail clients, including Outlook, Thunderbird, and Apple Mail, do not support the `OAUTHBEARER` or `XOAUTH2` SASL mechanism with third-party OAuth providers. Users of those clients cannot authenticate directly with OIDC. The standard workaround is to provision [App Passwords](/docs/auth/authentication/app-password) for those users, as described in the [interoperability](/docs/auth/oauth/interoperability) section of the OAuth documentation.

## Configuration

An OIDC integration is configured through the OIDC variant of the [Directory](/docs/ref/object/directory) object (found in the WebUI under <!-- breadcrumb:Directory --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" /><path d="M14 13.12c0 2.38 0 6.38-1 8.88" /><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" /><path d="M2 12a10 10 0 0 1 18-6" /><path d="M2 16h.01" /><path d="M21.8 16c.2-2 .131-5.354 0-6" /><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" /><path d="M8.65 22c.21-.66.45-1.32.57-2" /><path d="M9 6.8a6 6 0 0 1 9 5.2v2" /></svg> Authentication › Directories<!-- /breadcrumb:Directory -->). The relevant fields are:

- [`issuerUrl`](/docs/ref/object/directory#issuerurl): the base URL of the OIDC provider, for example `https://accounts.example.org/realms/myrealm`. Stalwart uses this URL to discover the provider's endpoints.
- [`requireAudience`](/docs/ref/object/directory#requireaudience): if set, access tokens whose `aud` claim does not include this value are rejected. The default is `"stalwart"`. Set this to the client id or resource identifier registered for Stalwart at the provider.
- [`requireScopes`](/docs/ref/object/directory#requirescopes): if set, access tokens must include every listed scope. Default `["openid", "email"]`.
- [`claimUsername`](/docs/ref/object/directory#claimusername): the claim used to derive the account login name. Default `"preferred_username"`. If the claim value is not already an email address and [`usernameDomain`](/docs/ref/object/directory#usernamedomain) is set, the domain is appended automatically.
- [`usernameDomain`](/docs/ref/object/directory#usernamedomain): the domain to append to the username claim when it does not already contain an `@`. When unset, the server falls back to the `email` claim.
- [`claimName`](/docs/ref/object/directory#claimname): the claim used for the user's display name. Default `"name"`.
- [`claimGroups`](/docs/ref/object/directory#claimgroups): the claim used for group memberships. Typical values are `"groups"` or `"roles"`, depending on the provider.

Example integration with a Keycloak-style provider that issues `preferred_username` as a bare username and exposes groups on the `groups` claim:

```json
{
  "@type": "Oidc",
  "description": "External IdP",
  "issuerUrl": "https://accounts.example.org/realms/myrealm",
  "requireAudience": "stalwart",
  "requireScopes": ["openid", "email"],
  "claimUsername": "preferred_username",
  "usernameDomain": "example.org",
  "claimName": "name",
  "claimGroups": "groups"
}
```

Once configured, the Directory object is selected as the active authentication source by setting [`directoryId`](/docs/ref/object/authentication#directoryid) on the [Authentication](/docs/ref/object/authentication) singleton (found in the WebUI under <!-- breadcrumb:Authentication --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" /><path d="M14 13.12c0 2.38 0 6.38-1 8.88" /><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" /><path d="M2 12a10 10 0 0 1 18-6" /><path d="M2 16h.01" /><path d="M21.8 16c.2-2 .131-5.354 0-6" /><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" /><path d="M8.65 22c.21-.66.45-1.32.57-2" /><path d="M9 6.8a6 6 0 0 1 9 5.2v2" /></svg> Authentication › General<!-- /breadcrumb:Authentication -->) to its id.
