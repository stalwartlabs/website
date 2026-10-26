---
sidebar_position: 5
title: "API keys"
description: "Bearer credentials for scripts, services and provisioning systems: how API keys authenticate, how to restrict them, and how to create them."
---

Automation needs a credential that does not depend on a person typing a password. An API key is that credential: a long-lived secret that a program presents on its own. Typical users of API keys are:

- Scripts that manage the server through the management API or the [CLI](/docs/management/cli/).
- Identity providers that provision accounts over [SCIM](/docs/auth/scim/).
- Services that register OAuth clients.

An API key is a bearer credential. Whoever presents it is treated as its owner, and it is never combined with a user name. A key acts as the account it belongs to, so its access is bounded by that account's permissions. The key's own permission mode can narrow that access further.

## API key credentials

An API key is an [ApiKey](/docs/ref/object/api-key) credential of the account (found in the WebUI under <!-- breadcrumb:ApiKey --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg> Account › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" /><circle cx="16.5" cy="7.5" r=".5" fill="currentColor" /></svg> Credentials › API Keys<!-- /breadcrumb:ApiKey -->).

The server generates the secret when the key is created, in the form `API_<random characters>`, and returns it once. Only a hash is stored, so the secret cannot be shown again.

A key is presented wherever the server accepts bearer credentials:

- On HTTP, in an `Authorization: Bearer API_...` header, for the management API, JMAP, CalDAV, CardDAV, WebDAV and SCIM.
- On IMAP, POP3, SMTP and ManageSieve, through the `OAUTHBEARER` or `XOAUTH2` mechanism, and there only over TLS ([Request authentication](/docs/auth/authentication/#bearer-tokens-require-tls-on-the-mail-protocols)).

### Permissions of a key

OAuth tokens are limited by scopes, the areas of access a user approved. API keys are not, because a key is not issued through an OAuth grant. A key whose [`permissions`](/docs/ref/object/api-key#permissions) are left at their default therefore has every permission of its account, mail access included.

Limiting a key is therefore a decision to make at creation. The permission mode expresses it:

- `Inherit` gives the key the permissions of the account.
- `Disable` gives it the permissions of the account minus the listed ones.
- `Replace` gives it only the listed permissions that the account also holds.

In every mode, a key can narrow the account's permissions but never extend them. A key meant only for management operations, for example, uses `Replace` with `authenticate` and the `sys*` permissions it needs.

### Other restrictions

Each key also has a `description` that identifies it in listings. Two optional fields restrict where and how long it works:

- `expiresAt` sets a date after which the key stops working.
- `allowedIps` lists the addresses or networks from which the key is accepted.

The number of keys per account is limited by the `maxApiKeys` quota. When the account does not set it, the limit falls back to <!-- default:Authentication.maxApiKeys -->5<!-- /default --> ([Passwords](/docs/auth/authentication/password#password-policy)).

An API key cannot be used for master-user [impersonation](/docs/auth/authorization/administrator#impersonation), which exists only for password sign-ins. Keys work for accounts of external directories as they do for any other account.

## Create an API key

Users create, list and delete their own keys in the [Account Manager](/docs/management/webui/account-manager), under Credentials.

With the CLI, the key is created for the account that runs the command. The following command creates a key that can read domains, and read, create and change accounts, but can do nothing else:

```sh
stalwart-cli create ApiKey \
  --field description='Provisioning script' \
  --field 'permissions={"@type":"Replace","permissions":{"authenticate":true,"sysDomainGet":true,"sysDomainQuery":true,"sysAccountGet":true,"sysAccountQuery":true,"sysAccountCreate":true,"sysAccountUpdate":true}}'
```

The output contains the secret:

```text
Created ApiKey aaa111

Credential
  Secret: API_AAAAEwAAAAHDN7BtUeZSrGrM9DibqfhzRGD7sw
```

A key restricted in this way has a limit that is easy to miss. Changing an account requires holding every permission of that account ([Permissions](/docs/auth/authorization/permissions#granting-permissions-to-other-accounts)), so the key can manage only accounts whose permissions it holds itself. Ordinary users hold every protocol permission of the User role, which this key lacks. A key that manages ordinary users must therefore keep those permissions too. Such a key uses `Inherit` or `Disable`, and belongs to a dedicated account with the required roles.

An administrator can also create a key for another account, by calling `x:ApiKey/set` with the request-level `accountId` of that account. This requires the `impersonate` permission together with `sysApiKeyCreate`, both held by the default System Administrator role. The target account's `maxApiKeys` quota applies, and the secret is returned to the administrator ([Managing accounts](/docs/auth/accounts/manage#add-an-app-password-or-api-key)).

## Use with SCIM provisioning

An identity provider that provisions accounts over [SCIM](/docs/auth/scim/) authenticates with an API key, which it sends as its bearer token. The key belongs to a dedicated provisioning account. It must hold these permissions:

- `scimAccess`, which admits it to the SCIM endpoint.
- `authenticate`.
- The `sysAccount*` permissions for the operations the provider performs.
- Every permission of the accounts it manages, for the reason described above.

[SCIM configuration](/docs/auth/scim/configuration#issuing-the-credential) gives a working setup.

## Use with OAuth client registration

A service can register confidential OAuth clients through `POST /auth/register`. It authenticates with a key that holds `authenticate` and `sysOAuthClientCreate`. This is the same permission that creating an OAuthClient through the management API requires, and the default System Administrator and Tenant Administrator roles include it. Public clients register without any credential ([Registering an application](/docs/auth/oauth/register-client)).
