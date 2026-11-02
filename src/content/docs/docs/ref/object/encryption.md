---
title: "Encryption"
description: "Configures encryption at rest and the encryption gateway."
custom_edit_url: null
---

Configures encryption at rest and the encryption gateway.

This object can be configured from the [WebUI](/docs/management/webui/) under <span data-target="Encryption/EncryptionDiscovery"><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="16" r="1" /><rect x="3" y="10" width="18" height="12" rx="2" /><path d="M7 10V7a5 5 0 0 1 10 0v3" /></svg> Encryption › Key Discovery</span>, <span data-target="Encryption/EncryptionGateway"><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="16" r="1" /><rect x="3" y="10" width="18" height="12" rx="2" /><path d="M7 10V7a5 5 0 0 1 10 0v3" /></svg> Encryption › Gateway</span>, <span data-target="Encryption/EncryptionStorage"><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="16" r="1" /><rect x="3" y="10" width="18" height="12" rx="2" /><path d="M7 10V7a5 5 0 0 1 10 0v3" /></svg> Encryption › Encryption at Rest</span>, <span data-target="Encryption/EncryptionTrust"><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="12" cy="16" r="1" /><rect x="3" y="10" width="18" height="12" rx="2" /><path d="M7 10V7a5 5 0 0 1 10 0v3" /></svg> Encryption › S/MIME Trust</span>

## Fields


##### `atRestEnable`

> Type: <code>Boolean</code> · default: `true`
>
> Encrypt stored messages for accounts that configured encryption at rest


##### `gatewayEnable`

> Type: <code>Boolean</code> · default: `false`
>
> Enable the encryption gateway, which encrypts messages for remote recipients and maintains their public keys


##### `gatewayOutbound`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"opportunistic","match":{"0":{"if":"is_local_domain(rcpt_domain)","then":"disable"}}}`
>
> When to encrypt a message for a recipient with a stored key
>
> Available variables: [`MtaQueueRcptVariable`](/docs/ref/expression/variable/mta-queue-rcpt-variable).
>
> Available constants: [`EncryptionModeConstant`](/docs/ref/expression/constant/encryption-mode-constant).


##### `gatewayMinTrust`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"harvested"}`
>
> Minimum trust level a key needs before it is used for a recipient
>
> Available variables: [`MtaQueueRcptVariable`](/docs/ref/expression/variable/mta-queue-rcpt-variable).
>
> Available constants: [`KeyTrustConstant`](/docs/ref/expression/constant/key-trust-constant).


##### `gatewayMethods`

> Type: <code>Set&lt;</code>[<code>PublicKeyKind</code>](#publickeykind)<code>&gt;</code> · default: `{"openPgp":true,"smime":true}`
>
> Key types the gateway encrypts with; when a DNS lookup returns both an OpenPGP key and an S/MIME certificate for a new key, the certificate is stored


##### `gatewayHeaderProtection`

> Type: [<code>HeaderProtection</code>](#headerprotection) · default: `"baseline"`
>
> Header protection for messages encrypted for remote recipients. Signed messages are not header protected.


##### `gatewayEncryptSigned`

> Type: <code>Boolean</code> · default: `true`
>
> Whether to encrypt messages that are signed but not encrypted


##### `harvestKeys`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"!is_local_domain(sender_domain)"}`
>
> Whether to learn the S/MIME certificate or Autocrypt key of an authenticated sender from a received message; a valid OpenPGP signature on the message raises the trust level of an Autocrypt key
>
> Available variables: [`EncryptionHarvestVariable`](/docs/ref/expression/variable/encryption-harvest-variable).


##### `hkpServers`

> Type: <code>Set&lt;Uri&gt;</code>
>
> Keyservers queried for keys that use the HKP discovery method


##### `discoveryProxy`

> Type: <code>Uri?</code>
>
> HTTP proxy for key fetches and certificate revocation list downloads


##### `sourceTimeout`

> Type: <code>Duration</code> · default: `5000`
>
> Maximum time spent fetching one key


##### `keyRefreshInterval`

> Type: <code>Duration</code> · default: `86400000`
>
> How often keys are fetched again from their discovery method


##### `negativeCacheTtl`

> Type: <code>Duration</code> · default: `86400000`
>
> How long an address with no key is remembered before the store is read again


##### `useBundledRoots`

> Type: <code>Boolean</code> · default: `true`
>
> Trust the bundled Mozilla S/MIME root certificates when validating recipient certificates


##### `maxCrlSize`

> Type: <code>Size</code> · default: `20000000` · min: 1
>
> Maximum size of a downloaded certificate revocation list



## JMAP API

The Encryption singleton is available via the `urn:stalwart:jmap` capability.


### `x:Encryption/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysEncryptionGet` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Encryption/get",
          {
            "ids": [
              "singleton"
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



### `x:Encryption/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysEncryptionUpdate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/jmap/ \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:Encryption/set",
          {
            "update": {
              "singleton": {
                "atRestEnable": true
              }
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




## CLI

`stalwart-cli` wraps the same JMAP calls. See the [CLI reference](/docs/management/cli/) for installation, authentication, and general usage.


### Fetch

```sh
stalwart-cli get Encryption
```


### Update

```sh
stalwart-cli update Encryption --field atRestEnable=true
```



## Nested types


### Expression

A conditional expression with match rules and a default value.



##### `match`

> Type: <code>List&lt;</code>[<code>ExpressionMatch</code>](#expressionmatch)<code>&gt;</code>
>
> List of conditions and their corresponding results


##### `else`

> Type: <code>String</code> · required
>
> Else condition





#### ExpressionMatch

A single condition-result pair in an expression.



##### `if`

> Type: <code>String</code> · required
>
> If condition


##### `then`

> Type: <code>String</code> · required
>
> Then clause





## Enums


### PublicKeyKind



| Value | Label |
|---|---|
| `openPgp` | OpenPGP |
| `smime` | S/MIME |


### HeaderProtection



| Value | Label |
|---|---|
| `none` | None |
| `noConfidentiality` | Protected, headers visible |
| `baseline` | Protected, Subject hidden |


## Expression references

The following expression contexts are used by fields on this page:

- [`EncryptionModeConstant`](/docs/ref/expression/constant/encryption-mode-constant) (Constants)
- [`MtaQueueRcptVariable`](/docs/ref/expression/variable/mta-queue-rcpt-variable) (Variables)
- [`KeyTrustConstant`](/docs/ref/expression/constant/key-trust-constant) (Constants)
- [`EncryptionHarvestVariable`](/docs/ref/expression/variable/encryption-harvest-variable) (Variables)

