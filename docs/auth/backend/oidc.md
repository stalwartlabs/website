---
sidebar_position: 5
---

# OpenID Connect

Stalwart can authenticate users against a third-party **OpenID Connect (OIDC) provider**. This allows the server to delegate authentication to an existing identity system, for example Google, Microsoft Entra ID, or any OIDC-compliant provider.

As Stalwart is primarily a mail server, it handles OIDC somewhat differently from a typical web application. Clients authenticate over IMAP, POP3, SMTP, or JMAP using the `OAUTHBEARER` SASL mechanism, which carries an access token already obtained from the identity provider. Stalwart does not initiate the OIDC flow itself and does not consume an ID token directly; it validates the access token and uses it to resolve the user's identity.

## Authentication flow

Clients (such as mail applications) present an access token issued by the external OIDC provider using the `OAUTHBEARER` SASL mechanism. Because Stalwart is not part of the OIDC flow, it does not see the [ID token](/docs/auth/openid/id-tokens). To identify the user associated with an access token, Stalwart validates the token against the OIDC provider.

In the current release this validation is performed automatically through the provider's standard OIDC discovery document (the `/.well-known/openid-configuration` endpoint). From that document Stalwart resolves the userinfo endpoint and signing keys, validates the token, and extracts the user's identity from the claims that the provider returns.

<!-- review: The previous docs documented four distinct endpoint/auth combinations for OIDC integration: UserInfo, Introspect without authentication, Introspect with basic authentication, Introspect with a bearer token, and Introspect using the user-provided token. The current OIDC variant of the Directory object exposes `issuerUrl`, `requireAudience`, `requireScopes`, `claimUsername`, `usernameDomain`, `claimName`, and `claimGroups`, with no explicit endpoint type or client-authentication fields. Confirm whether token introspection with client credentials is still supported (and via which fields) or whether the integration now relies solely on OIDC discovery + userinfo. -->

## Limitations

### Offline access

Stalwart learns about an account only after the first time that account authenticates. OIDC does not provide an offline directory lookup, so an account that exists in the identity provider but has not yet signed in is unknown to the server. Mail addressed to such an account is rejected because the address does not resolve to a local recipient.

To avoid this, create accounts in Stalwart before users sign in for the first time. Accounts can be created through the [WebUI](/docs/management/webui/overview), the JMAP API, or the [CLI](/docs/management/cli/overview). Pre-creating the accounts ensures that inbound mail is accepted from the start, even for users who have not yet authenticated via OIDC.

### `OAUTHBEARER` SASL

Many widely deployed mail clients, including Outlook, Thunderbird, and Apple Mail, do not support the `OAUTHBEARER` or `XOAUTH2` SASL mechanism with third-party OAuth providers. Users of those clients cannot authenticate directly with OIDC. The standard workaround is to provision [App Passwords](/docs/auth/authentication/app-password) for those users, as described in the [interoperability](/docs/auth/oauth/interoperability) section of the OAuth documentation.

## Configuration

An OIDC integration is configured through the OIDC variant of the [Directory](/docs/ref/object/directory) object (found in the WebUI under <!-- breadcrumb:Directory --><!-- /breadcrumb:Directory -->). The relevant fields are:

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

Once configured, the Directory object is selected as the active authentication source by setting [`directoryId`](/docs/ref/object/authentication#directoryid) on the [Authentication](/docs/ref/object/authentication) singleton (found in the WebUI under <!-- breadcrumb:Authentication --><!-- /breadcrumb:Authentication -->) to its id.
