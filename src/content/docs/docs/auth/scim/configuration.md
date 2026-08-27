---
sidebar_position: 3
title: "Configuration"
description: "Enabling SCIM provisioning in Stalwart: licensing, per-domain authority, the service principal and its API key, permissions, and network restrictions."
---

Enabling SCIM involves granting authority to the identity provider over a set of domains, creating the account that its SCIM client will authenticate as, and issuing that account a credential. Each step is described below, followed by a verification procedure that confirms the endpoint is reachable before the identity provider is configured.

## Prerequisites

SCIM requires an [Enterprise license](/docs/server/enterprise). On a Community Edition server the `/scim/v2` routes respond with `403 Forbidden` and an explanatory message; no other behaviour changes.

The HTTP service must be reachable by the identity provider over TLS. Hosted identity providers such as Microsoft Entra ID and Okta connect from the public internet and cannot reach an endpoint published only on a private network. Self-hosted providers such as Keycloak may well be able to, in which case restrict the endpoint to the provider's address; see [Restricting network access](#restricting-network-access).

Absolute URLs that Stalwart returns in `meta.location` and `$ref` fields, and in the `Location` header of a creation response, are built from the server's public URL. If the server sits behind a reverse proxy, set [`STALWART_PUBLIC_URL`](/docs/configuration/environment-variables#public-urls) so that those URLs point at the externally visible name. Some SCIM clients follow `meta.location` on subsequent requests, so an incorrect value here surfaces as intermittent failures.

## Granting authority over a domain

SCIM may only write to domains that have been explicitly opened to it. The [`allowScimProvisioning`](/docs/ref/object/domain#allowscimprovisioning) field on the [Domain](/docs/ref/object/domain) object (found in the WebUI under <!-- breadcrumb:Domain --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg> Management › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg> Domains › Domains<!-- /breadcrumb:Domain -->) controls this, and it defaults to `false`:

```json
{
  "name": "example.org",
  "allowScimProvisioning": true
}
```

Enabling the field has a second effect beyond permitting SCIM writes: it makes SCIM authoritative for the domain, which stops just-in-time provisioning from creating or modifying accounts there. That trade is the point of the field, and it is explained in full under [Authority when both are configured](/docs/auth/scim/provisioning#authority-when-both-are-configured). Review that section before enabling the field on a domain that currently relies on just-in-time provisioning.

Every address in a request is checked against this field, not merely the primary one. A `POST /Users` whose `userName` is in an enabled domain but which carries an alias in a domain that is not enabled is rejected in full with `400 Bad Request` and a `scimType` of `invalidValue`.

## Creating the service principal

A SCIM client authenticates as an ordinary Stalwart account, referred to here as the service principal. Create a dedicated account for it; do not reuse an administrator account. Its access can then be revoked independently, and its activity is distinguishable in the logs.

The account must live in a domain that has `allowScimProvisioning` enabled. This matters beyond tidiness: group accounts created through SCIM are placed in the service principal's own domain, because a SCIM `Group` carries a display name but no address from which a domain could be derived. A service principal in a domain that is not SCIM-enabled can still manage users, but every attempt to create a group is refused.

In a multi-tenant deployment, place the service principal inside the tenant it provisions for. Tenant scoping is inherited from the account, so a tenant-scoped service principal sees only that tenant's accounts and domains, and requests that would cross a tenant boundary are rejected. This is the mechanism by which several identity providers can provision into one server without visibility of each other.

## Permissions

Authorisation happens in two stages. The `scimAccess` permission gates the endpoint as a whole: without it, every SCIM request is refused regardless of what it asks for. Beyond that gate, each operation requires the same account permission that the equivalent administrative operation requires, so a credential can be scoped to exactly the operations the identity provider is expected to perform.

| Permission | Required for |
|---|---|
| `authenticate` | Presenting the credential at all |
| `scimAccess` | Every request to `/scim/v2`, other than the discovery endpoints |
| `sysAccountGet` | `GET` on `/Users` and `/Groups`, and every query, including `/.search` |
| `sysAccountCreate` | `POST /Users` and `POST /Groups` |
| `sysAccountUpdate` | `PUT` and `PATCH`, and any group creation that carries members |
| `sysAccountDestroy` | `DELETE` |

Omitting `sysAccountDestroy` is a reasonable precaution where the deprovisioning policy is suspension and not deletion. The identity provider can still send `PATCH` with `{"active": false}`, and its `DELETE` requests are refused with `403 Forbidden` instead of removing mailboxes. Refer to the [permissions catalogue](/docs/auth/authorization/permissions) for the complete list and to the [permissions reference](/docs/ref/permissions#scim) for the SCIM entry.

## Issuing the credential

Requests authenticate with an [API key](/docs/auth/authentication/api-key) belonging to the service principal, presented as an HTTP bearer token. HTTP Basic authentication is rejected outright, with a message directing the caller to use a bearer token; the published service provider configuration advertises OAuth bearer tokens as the only supported authentication scheme.

Create the key on the [ApiKey](/docs/ref/object/api-key) object (found in the WebUI under <!-- breadcrumb:ApiKey --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg> Account › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" /><circle cx="16.5" cy="7.5" r=".5" fill="currentColor" /></svg> Credentials › API Keys<!-- /breadcrumb:ApiKey -->). Using `Replace` mode instead of `Inherit` confines the credential to the SCIM operations regardless of what the owning account is otherwise permitted to do:

```json
{
  "description": "SCIM provisioning (corporate IdP)",
  "permissions": {
    "@type": "Replace",
    "permissions": {
      "authenticate": true,
      "scimAccess": true,
      "sysAccountGet": true,
      "sysAccountCreate": true,
      "sysAccountUpdate": true,
      "sysAccountDestroy": true
    }
  },
  "allowedIps": {
    "203.0.113.0/24": true
  }
}
```

:::note
Values on this page follow the [object encoding](/docs/configuration/object-encoding) rules: list and set fields are JSON objects, not arrays, and durations and sizes are integers.
:::

The secret is generated by the server and displayed once, at creation. It is stored hashed and cannot be recovered afterwards, so it must be transferred to the identity provider's configuration at that point. Rotation is a matter of issuing a second key, updating the identity provider, and revoking the first.

The optional [`allowedIps`](/docs/ref/object/api-key#allowedips) field restricts where the credential may be presented. Identity providers that publish their egress ranges make this a cheap additional control, though those ranges do change and an out-of-date list presents as an authentication failure. An [`expiresAt`](/docs/ref/object/api-key#expiresat) value is also available where credential lifetimes are governed by policy; note that provisioning stops when the key expires, so expiry needs to be paired with a rotation procedure.

A SCIM client cannot deprovision itself. Requests that would deactivate or delete the service principal the request authenticated as are refused with `403 Forbidden`, which prevents an identity provider that has been given a mailbox for its own service account from disabling its own access mid-cycle.

## Restricting network access

The SCIM endpoint accepts requests on the same HTTP listeners as everything else. Where the identity provider connects from known addresses, the [`allowedEndpoints`](/docs/ref/object/http#allowedendpoints) expression on the [Http](/docs/ref/object/http) singleton (found in the WebUI under <!-- breadcrumb:Http --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › HTTP › General, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › HTTP › Security<!-- /breadcrumb:Http -->) can confine `/scim` to those addresses:

```json
{
  "allowedEndpoints": {
    "match": {
      "0": {"if": "starts_with(url_path, '/scim') && !starts_with(remote_ip, '203.0.113.')", "then": "404"}
    },
    "else": "200"
  }
}
```

Further patterns, including restriction by listener so that SCIM is served only on an internal interface, are covered under [Access control](/docs/http/access-control).

Rate limiting applies as it does to any other authenticated HTTP request; see [Rate limiting](/docs/http/ratelimit). When a client exceeds its limit the response is `429 Too Many Requests` with a `Retry-After` header, which well-behaved SCIM clients honour by deferring the remainder of the cycle.

## Verifying the endpoint

The discovery endpoints are readable without authentication, which makes them the quickest confirmation that routing, TLS, and licensing are in order:

```sh
curl https://mail.example.org/scim/v2/ServiceProviderConfig
```

A working server answers with `application/scim+json` and a document reporting support for patch, bulk, filter, sort, entity tags, and both pagination styles. A `403` response with a message about the Enterprise edition means the license is absent or has not been applied.

Authentication and permissions are confirmed with a request to a resource endpoint:

```sh
curl -H "Authorization: Bearer $SCIM_TOKEN" \
     "https://mail.example.org/scim/v2/Users?count=1"
```

A `200` response with a `ListResponse` body confirms the credential and the `scimAccess` and `sysAccountGet` permissions. A `401` indicates a missing or invalid token, while a `403` indicates a valid token whose account lacks a required permission; the `detail` field in the error body names which condition failed.

Once these two requests succeed, the identity provider can be configured against the base URL `https://mail.example.org/scim/v2`. Procedures for individual providers are collected under [Identity providers](/docs/auth/scim/providers/).
