---
sidebar_position: 2
---

# Masked email

:::tip Enterprise feature

Masked email is available exclusively in the [Enterprise Edition](/docs/server/enterprise) of Stalwart and is not included in the Community Edition.

:::

A masked email is a disposable address that forwards to an existing account without revealing the account's real address. Each mask is bound to one account and can be disabled or destroyed independently, so end users can hand out a different address to every external service and cut any of them off without affecting the others. The typical use case is signing up for newsletters, shopping sites, or third-party applications where the receiving party should not learn the user's primary address.

Masks are represented by the [MaskedEmail](/docs/ref/object/masked-email) object (found in the WebUI under <!-- breadcrumb:MaskedEmail --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg> Account › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M22 15V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /><path d="M16 19h6" /></svg> Masked Addresses<!-- /breadcrumb:MaskedEmail -->). Each instance belongs to exactly one [Account](/docs/ref/object/account) through the read-only [`accountId`](/docs/ref/object/masked-email#accountid) reference, and the server fills in the generated address in the [`email`](/docs/ref/object/masked-email#email) field.

## Lifecycle

End users create masks from the account-management area of the WebUI or through a password-manager integration that speaks the JMAP API. At creation time, the user may supply a short [`description`](/docs/ref/object/masked-email#description) to remember what the mask is for and a [`forDomain`](/docs/ref/object/masked-email#fordomain) value naming the site the address was issued to. Password managers typically fill these in automatically when storing a new login. A [`url`](/docs/ref/object/masked-email#url) can also be attached to deep-link back into the integrator that owns the entry.

The server records the creation time in [`createdAt`](/docs/ref/object/masked-email#createdat) and, when the request comes in with recognisable client credentials, the originating application's name in [`createdBy`](/docs/ref/object/masked-email#createdby). An optional [`expiresAt`](/docs/ref/object/masked-email#expiresat) can be set at creation time; once set, it is read-only because the expiry is encoded in the generated address itself and cannot be changed after the fact. The mask stops resolving once that time has passed.

Masks are toggled through [`enabled`](/docs/ref/object/masked-email#enabled). Disabling a mask leaves the record in place but causes the server to reject incoming mail for that address, which is useful when a service starts misbehaving without losing the record of where the address was handed out. Destroying the mask removes it outright.

## Address generation

By default the server picks the local part of a new mask and chooses a domain from those the account already has access to. Integrators that need a specific shape can pass [`emailPrefix`](/docs/ref/object/masked-email#emailprefix) to require the generated address to start with a given string (up to 64 characters, limited to lowercase letters, digits, and underscore) or [`emailDomain`](/docs/ref/object/masked-email#emaildomain) to force a particular domain. Both fields are honoured only at creation time and are ignored on update.

The pool of domains available through [`emailDomain`](/docs/ref/object/masked-email#emaildomain) is not configured separately: a mask can be requested under any domain or alias the owning account is linked to. Requesting a domain the account has no access to, or a domain that does not exist, returns an error.

## Managing masks

Three surfaces share the same JMAP methods:

- **WebUI.** The account manager shows every mask owned by the signed-in user, with controls to disable, re-enable, or destroy each one. Administrators with the corresponding `sysMaskedEmail*` permissions can list and manage masks across accounts for support purposes.
- **CLI.** `stalwart-cli` covers the same operations for automation. For example, `stalwart-cli create masked-email --field description='Newsletter signup' --field forDomain=example.com` creates a mask, `stalwart-cli update masked-email <id> --field enabled=false` disables it, and `stalwart-cli delete masked-email --ids <id>` removes it. The full command list is on the [MaskedEmail object page](/docs/ref/object/masked-email#cli).
- **JMAP API.** Password managers and other integrators call `x:MaskedEmail/get`, `x:MaskedEmail/query`, and `x:MaskedEmail/set` under the `urn:stalwart:jmap` capability. The methods follow the standard RFC 8620 shapes.

A minimal creation request, as a password manager might issue it:

```json
{
  "methodCalls": [
    [
      "x:MaskedEmail/set",
      {
        "create": {
          "new1": {
            "description": "Newsletter signup",
            "forDomain": "https://example.com",
            "createdBy": "ACME Password Manager",
            "enabled": true
          }
        }
      },
      "c1"
    ]
  ],
  "using": ["urn:ietf:params:jmap:core", "urn:stalwart:jmap"]
}
```

Listing the masks that belong to a given user is done with `x:MaskedEmail/query` filtered by `accountId`; updating or destroying a mask uses the `update` and `destroy` arguments of `x:MaskedEmail/set`.

## Permissions and quotas

Each operation is gated by a dedicated permission: `sysMaskedEmailGet`, `sysMaskedEmailQuery`, `sysMaskedEmailCreate`, `sysMaskedEmailUpdate`, and `sysMaskedEmailDestroy`. End-user roles grant these permissions for masks owned by the signed-in account, while administrative roles can be configured to manage masks on behalf of other accounts.

The total number of masks an account may hold is bounded by the `maxMaskedAddresses` entry in the account's [`quotas`](/docs/ref/object/account#quotas) map. Leaving the quota unset allows an unlimited number of masks; setting it to zero disables the feature for that account even when the Enterprise license is active.
