---
sidebar_position: 3
title: "Configuration"
description: "Enabling SCIM provisioning in Stalwart: per-domain authority, the provisioning account and its API key, permissions, network restrictions and verification."
---

:::tip[Enterprise feature]
This feature is available in the [Enterprise edition](/docs/server/enterprise) of Stalwart.
:::

Before an identity provider can provision accounts, the server must know which domains the provider may manage and which credential the provider will present. Enabling SCIM therefore takes three steps on the Stalwart side. The administrator opens a set of domains to the identity provider, creates the account that the provider's SCIM client authenticates as, and issues that account an API key. This page describes each step, and then gives two requests that confirm the endpoint works before the identity provider is configured.

## Prerequisites

SCIM requires an Enterprise license. Without one, the `/scim/v2` endpoints answer `403 Forbidden`.

The identity provider must be able to reach the server's HTTP service over TLS. Hosted providers such as Microsoft Entra ID and Okta connect from the public internet, so they cannot reach an endpoint that is published only on a private network. A self-hosted provider such as Keycloak often runs on the same network. In that case the endpoint can be restricted to the provider's address ([Restricting network access](#restricting-network-access)).

The server must also know the URL under which clients see it. Stalwart returns absolute URLs in `meta.location`, in `$ref` and in the `Location` header of a creation response, and it builds them from the server's public URL. Behind a reverse proxy, set [`STALWART_PUBLIC_URL`](/docs/configuration/environment-variables#public-urls) to the externally visible URL. Some clients follow `meta.location` in later requests, so a wrong public URL shows up as intermittent failures.

## Granting authority over a domain

SCIM sees and writes only the accounts of domains that are opened to it. A domain is opened with [`allowScimProvisioning`](/docs/ref/object/domain#allowscimprovisioning) on the [Domain](/docs/ref/object/domain) object (found in the WebUI under <!-- breadcrumb:Domain --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg> Domains › Domains<!-- /breadcrumb:Domain -->). Every domain stays closed to SCIM until an administrator enables the field on it, as in the following update:

```json
{
  "name": "example.org",
  "allowScimProvisioning": true
}
```

Enabling the field also makes SCIM authoritative for the domain. From then on, sign-ins through an external directory no longer create or change accounts in it ([Authority when both are configured](/docs/auth/scim/provisioning#authority-when-both-are-configured)). Read that section before enabling the field on a domain whose accounts are currently created at sign-in.

The server checks every address in a request against the field, not only the primary one. A `POST /Users` whose `userName` is in an enabled domain, but which carries an alias in a domain that is not enabled, is therefore refused as a whole with `400 Bad Request` and the `scimType` `invalidValue`.

## Provisioning account

The SCIM client authenticates as an ordinary Stalwart [Account](/docs/ref/object/account), called the provisioning account on these pages. Create a dedicated account for this purpose instead of reusing an administrator's. A dedicated account can be revoked on its own, and its actions are identifiable in the logs.

The provisioning account must be placed in a domain that has `allowScimProvisioning` enabled. The reason lies in how groups are created. A SCIM group carries a display name but no address, so the server places every group created through SCIM in the provisioning account's own domain. If that domain is not open to SCIM, users can still be managed, but every group creation is refused.

In a multi-tenant deployment, place the provisioning account in the tenant it provisions. The account then sees only that tenant's accounts and domains, and the server refuses any request that would cross the tenant boundary. This allows several identity providers to provision into one server without seeing each other's accounts.

A SCIM client cannot deprovision itself. A request that would deactivate or delete the provisioning account is refused with `403 Forbidden` and the detail `A SCIM client cannot deprovision or deactivate its own service principal.`

## Permissions

The provisioning account needs two kinds of permission. The first kind admits it to the endpoint and to each operation. The `scimAccess` permission admits a credential to the endpoint, and without it every request other than those to the discovery endpoints is refused. Each operation also requires the permission of the equivalent management operation:

| Permission | Required for |
|---|---|
| `authenticate` | Presenting the credential |
| `scimAccess` | Every request to `/scim/v2` except the discovery endpoints |
| `sysAccountGet` | `GET` on `/Users` and `/Groups`, and every query, including `/.search` |
| `sysAccountCreate` | `POST /Users` and `POST /Groups` |
| `sysAccountUpdate` | `PUT` and `PATCH`, and creating a group with members |
| `sysAccountDestroy` | `DELETE` |

The [permission reference](/docs/ref/permissions) lists every permission.

The second kind comes from a rule that applies to every change of an account. An account that creates, changes or deletes another account must hold every permission of that account, and this [rule for changing accounts](/docs/auth/authorization/permissions#granting-permissions-to-other-accounts) has no exception. A user created through SCIM receives the User role, which holds every protocol permission. The provisioning account therefore needs the User permissions as well as the SCIM ones. The usual setup is a user with the User role and the SCIM permissions merged in, as in the following account:

```json
{
  "@type": "User",
  "name": "scim-provisioning",
  "domainId": "b",
  "description": "SCIM provisioning (corporate IdP)",
  "roles": {"@type": "User"},
  "permissions": {
    "@type": "Merge",
    "enabledPermissions": {
      "scimAccess": true,
      "sysAccountGet": true,
      "sysAccountCreate": true,
      "sysAccountUpdate": true,
      "sysAccountDestroy": true
    },
    "disabledPermissions": {}
  },
  "encryptionAtRest": {"@type": "Disabled"}
}
```

The same rule applies to whoever creates this account, so only an administrator who holds the same permissions can create it. If the identity provider also provisions administrators or accounts with custom roles, the provisioning account must hold their permissions too, for example by using `roles` `Admin`.

:::caution
A provisioning credential that holds only the SCIM and `sysAccount*` permissions cannot manage ordinary users. An API key in `Replace` mode that lists only those permissions is an example. Every create, update and delete then fails with `403 Forbidden` and a detail such as `You are not authorized to grant permissions: <five permission names> and <N> more`, recorded as a `scim.forbidden` event, and the identity provider reports every provisioning operation as failed.
:::

Some organisations want the identity provider to suspend accounts but never delete them. To enforce this, disable `sysAccountDestroy` on the credential, as described in the next section. Its `DELETE` requests are then refused with `403 Forbidden`, while a `PATCH` with `{"active": false}` still works. Do not disable a permission that the managed users hold, such as `emailSend`: the provisioning account would then lack one of their permissions, and every operation would fail again for the reason above.

## Issuing the credential

The SCIM client presents an [API key](/docs/auth/authentication/api-key) ([ApiKey](/docs/ref/object/api-key)) of the provisioning account as an HTTP bearer token. Bearer tokens are the only authentication scheme that the service provider configuration advertises. HTTP Basic authentication is refused with `401 Unauthorized`. When the Basic credentials themselves are valid, the detail reads `HTTP Basic authentication is not supported, present a bearer token.`

An administrator creates the key on behalf of the provisioning account, with an `x:ApiKey/set` call that carries the account's id as `accountId` ([Managing accounts](/docs/auth/accounts/manage#add-an-app-password-or-api-key)). The key's permission mode decides what it may do. `Inherit` mode gives it the permissions of the account. `Disable` mode can withhold `sysAccountDestroy`, for the suspend-only setup described above. The following key inherits the account's permissions and accepts requests only from the provider's address range:

```json
{
  "description": "SCIM provisioning (corporate IdP)",
  "permissions": {"@type": "Inherit"},
  "allowedIps": {"203.0.113.0/24": true}
}
```

The secret is returned once, in the response to the creation, and it cannot be retrieved later. Enter it in the identity provider's configuration at that point. To rotate the secret, create a second key, update the identity provider, and then delete the first key.

Two optional restrictions need maintenance over time. [`allowedIps`](/docs/ref/object/api-key#allowedips) restricts where the key is accepted, so an outdated list of the provider's addresses shows up as authentication failures. An [`expiresAt`](/docs/ref/object/api-key#expiresat) date stops provisioning when it passes, so pair it with a rotation procedure.

## Restricting network access

The SCIM endpoint is served on the same HTTP listeners as the other services, so by default it is reachable wherever they are. When the identity provider connects from known addresses, the endpoint can be confined to them. The [`allowedEndpoints`](/docs/ref/object/http#allowedendpoints) expression of the [Http](/docs/ref/object/http) singleton does this. The singleton is found in the WebUI under <!-- breadcrumb:Http --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › HTTP › General, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › HTTP › Security<!-- /breadcrumb:Http -->.

The following expression answers `404` to SCIM requests from any address outside the provider's range:

```json
{
  "allowedEndpoints": {
    "match": {
      "0": {"if": "starts_with(path, '/scim') && !starts_with(remote_ip, '203.0.113.')", "then": "404"}
    },
    "else": "200"
  }
}
```

[Access control](/docs/http/access-control) describes further patterns, such as serving SCIM only on an internal listener.

SCIM requests are rate limited like other authenticated HTTP requests ([Rate limiting](/docs/http/settings#rate-limiting)). A client over the limit receives `429 Too Many Requests` with a `Retry-After` header.

## Verifying the endpoint

Two requests confirm that the endpoint works before the identity provider is configured, and each checks a different layer.

The first request reads a discovery endpoint. Discovery endpoints require no authentication, so this request confirms routing, TLS and licensing on their own:

```sh
curl https://mail.example.org/scim/v2/ServiceProviderConfig
```

A working server answers with `application/scim+json` and a document that reports support for patch, bulk, filter, sort, entity tags and both pagination styles. A `403` response with a message about the Enterprise edition means that no license is active.

The second request reads a resource endpoint, which confirms the credential and its permissions:

```sh
curl -H "Authorization: Bearer $SCIM_TOKEN" \
     "https://mail.example.org/scim/v2/Users?count=1"
```

A `200` response with a `ListResponse` body confirms the key and the `scimAccess` and `sysAccountGet` permissions. A `401` means that the token is missing or invalid, and a `403` means that the account lacks a permission. In both cases, the `detail` field of the error names the condition.

Once both requests succeed, configure the identity provider with the base URL `https://mail.example.org/scim/v2` ([Identity providers](/docs/auth/scim/providers/)).
