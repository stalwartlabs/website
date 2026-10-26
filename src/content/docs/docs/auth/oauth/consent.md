---
title: "Consent and connected applications"
description: "The consent screen, verified and unverified applications, and how users review and revoke connected applications."
sidebar_position: 7
---

Before an application receives access to an account, the account owner approves the request on a consent screen. Each approval is recorded as a grant, which the owner can review and revoke later.

Consent and grants serve two different purposes. Consent prevents an application that merely knows the server's address from obtaining tokens silently: a person always decides. The list of grants, shown to users as Connected Applications, is how a user signs an application out of every device it runs on.

## Consent screen

The consent screen appears at the start of the authorization, before the sign-in form. It is shown for every client except installed web applications such as the WebUI:

- Dynamically registered clients
- Clients identified by a metadata document
- Clients registered by an administrator
- OAuthClients marked as first party

The screen appears in the authorization code flow and in the device flow alike. Installed applications skip it, and show their name and logo in the "Sign in to ..." header of the sign-in form instead.

Consent is not remembered. The screen therefore appears at every authorization, including when an application signs the user in again.

The screen names the application, lists the requested access in plain language, and shows the host to which the browser will be redirected. Each scope is described as follows:

| Scope | Shown as |
|---|---|
| `openid` | See your account name and email address |
| `offline_access` | Stay connected when you are not using it |
| `urn:ietf:params:oauth:scope:mail` | Read, send and manage your email |
| `urn:ietf:params:oauth:scope:contacts` | Read and manage your contacts |
| `urn:ietf:params:oauth:scope:calendars` | Read and manage your calendars |
| `urn:ietf:params:oauth:scope:files` | Read and manage your files |

A first-party OAuthClient receives the account's full permissions, so the screen shows `Full access to your account` in place of the scope list.

The user then decides. **Allow** continues to the sign-in form. **Deny** redirects the browser to the application with the error `access_denied`.

## Verified and unverified applications

The consent screen tells the user whether anyone on the server has vouched for the application's identity. An application registered by an administrator is verified, and it is shown with the name and logo of its [OAuthClient](/docs/ref/object/o-auth-client) object. Every other application is marked "Unverified application", for one of these reasons:

- Dynamically registered clients and clients identified by a metadata document choose their own name, and nobody on the server has checked it.
- In the Enterprise edition, a client owned by a tenant was registered by a tenant administrator, and the server administrator has not vetted it.

A client identified by a metadata document is also shown with the hostname of its client id. That hostname is the one piece of its identity that the server has verified, because the server fetched the document from it.

Unverified applications never show a remote logo. The screen draws a monogram of the name in its place. A logo is shown in only two cases: for a registered client whose `logo` is a `data:image/` URI, and for an installed application whose bundle contains its logo.

## Connected applications

Each authorization creates one grant, an [OAuthGrant](/docs/ref/object/o-auth-grant) object owned by the account. The grant records:

- The application's name (`clientName`) and the kind of client (`clientKind`)
- The granted service scopes
- The IP address from which access was granted
- The date of the grant, and the date the application last renewed its access (`lastUsedAt`)

Because each authorization creates its own grant, signing in with the same application on two devices creates two grants. Each device can then be signed out separately.

Users find their grants in the [Account Manager](/docs/management/webui/account-manager) under <!-- breadcrumb:OAuthGrant --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg> Account › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" /><circle cx="16.5" cy="7.5" r=".5" fill="currentColor" /></svg> Credentials › Connected Applications<!-- /breadcrumb:OAuthGrant -->. Entries for dynamically registered clients and metadata document clients are labelled as unverified. Grants issued through a first-party OAuthClient are labelled "Web application of this server".

Users can list and delete their own grants, which the default User role allows through the `sysOAuthGrantGet`, `sysOAuthGrantQuery` and `sysOAuthGrantDestroy` permissions. They cannot create or change grants, and they cannot see the grants of other users.

### Revoke an application's access

To sign an application out, delete its entry in Connected Applications. Deleting a grant revokes the access of that application: its refresh token is refused with `invalid_grant` and its access tokens are rejected. The application must therefore ask the user to authorize it again. Other applications, and the same application on other devices, keep their own grants and keep working.

Deleting a grant in Connected Applications is not the only way a grant ends. Grants also end in these cases:

- The application revokes its own tokens.
- The account's password is changed.
- A superseded refresh token is presented.
- The account is deleted.

[Revocation](/docs/auth/oauth/tokens#revocation) describes these cases, and the changes that leave grants in place.

### Revoke access as an administrator

An administrator who holds the same permissions can list the grants of any account and delete them through the management API. The System Administrator role grants these permissions. The following call lists the grants of the account with id `c`:

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "using": ["urn:ietf:params:jmap:core", "urn:stalwart:jmap"],
    "methodCalls": [
      ["x:OAuthGrant/query", {"filter": {"accountId": "c"}}, "0"],
      ["x:OAuthGrant/get", {"#ids": {"resultOf": "0", "name": "x:OAuthGrant/query", "path": "/ids"}}, "1"]
    ]
  }'
```

A grant is deleted with `x:OAuthGrant/set` and its id in `destroy`. The following CLI commands list the grants of the same account and delete one of them:

```sh
stalwart-cli query OAuthGrant --where accountId=c
stalwart-cli delete OAuthGrant --ids <grant id>
```
