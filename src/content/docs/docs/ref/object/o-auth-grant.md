---
title: "OAuthGrant"
description: "Authorization granted by an account to an OAuth application. Deleting it signs the application out."
custom_edit_url: null
---

Authorization granted by an account to an OAuth application. Deleting it signs the application out.

This object can be configured from the [WebUI](/docs/management/webui/) under <span data-target="OAuthGrant"><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg> Account › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" /><circle cx="16.5" cy="7.5" r=".5" fill="currentColor" /></svg> Credentials › Connected Applications</span>

## Fields


##### `accountId`

> Type: <code>Id&lt;</code>[<code>Account</code>](/docs/ref/object/account)<code>&gt;</code> · read-only
>
> Identifier for the account that granted the authorization


##### `clientId`

> Type: <code>String</code> · server-set
>
> Identifier of the OAuth client that received the authorization


##### `clientName`

> Type: <code>String?</code> · server-set
>
> Name of the application, as provided by the client or its administrator


##### `clientKind`

> Type: [<code>OAuthClientKind</code>](#oauthclientkind) · server-set
>
> How the application was registered. Dynamically registered applications and Client ID Metadata Documents are not verified by an administrator.


##### `scopes`

> Type: <code>Set&lt;</code>[<code>OAuthScope</code>](#oauthscope)<code>&gt;</code> · server-set
>
> Services the application was given access to. First-party applications have full access to the account.


##### `remoteIp`

> Type: <code>IpAddr?</code> · server-set
>
> IP address from which the authorization was granted


##### `createdAt`

> Type: <code>UTCDateTime</code> · server-set
>
> Date the authorization was granted


##### `lastUsedAt`

> Type: <code>UTCDateTime</code> · server-set
>
> Date the application last renewed its access



## JMAP API

The OAuthGrant object is available via the `urn:stalwart:jmap` capability.


### `x:OAuthGrant/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.


This method requires the `sysOAuthGrantGet` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:OAuthGrant/get",
          {
            "ids": [
              "id1"
            ]
          },
          "c1"
        ]
      ],
      "using": [
        "urn:ietf:params:jmap:core",
        "urn:stalwart:jmap"
      ]
    }'
```



### `x:OAuthGrant/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

Supports the destroy operation only.


This method requires the `sysOAuthGrantDestroy` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:OAuthGrant/set",
          {
            "destroy": [
              "id1"
            ]
          },
          "c1"
        ]
      ],
      "using": [
        "urn:ietf:params:jmap:core",
        "urn:stalwart:jmap"
      ]
    }'
```



### `x:OAuthGrant/query`

This is a standard [`Foo/query`](https://www.rfc-editor.org/rfc/rfc8620#section-5.5) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.5), Section 5.5.


This method requires the `sysOAuthGrantQuery` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:OAuthGrant/query",
          {
            "filter": {
              "accountId": "id1"
            }
          },
          "c1"
        ]
      ],
      "using": [
        "urn:ietf:params:jmap:core",
        "urn:stalwart:jmap"
      ]
    }'
```




The `x:OAuthGrant/query` `filter` argument accepts the following conditions (combinable with `AnyOf` / `AllOf` / `Not` per RFC 8620):

| Condition | Kind |
|---|---|
| `accountId` | id of Account |

## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get OAuthGrant id1
```


### Query

```sh
stalwart-cli query OAuthGrant
stalwart-cli query OAuthGrant --where accountId=id1
```


### Delete

```sh
stalwart-cli delete OAuthGrant --ids id1
```



## Enums


### OAuthClientKind



| Value | Label |
|---|---|
| `registered` | Registered by an administrator |
| `dynamic` | Registered dynamically (unverified) |
| `metadataDocument` | Client ID Metadata Document (unverified) |
| `firstParty` | Web application of this server |


### OAuthScope



| Value | Label |
|---|---|
| `mail` | Mail (IMAP, POP3, SMTP submission, ManageSieve, JMAP Mail) |
| `contacts` | Contacts (CardDAV, JMAP Contacts) |
| `calendars` | Calendars (CalDAV, JMAP Calendars) |
| `files` | Files (WebDAV, JMAP File Storage) |


