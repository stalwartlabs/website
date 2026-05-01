---
title: SieveSystemInterpreter
description: Configures the system-level Sieve script interpreter settings and limits.
custom_edit_url: null
---

# SieveSystemInterpreter

Configures the system-level Sieve script interpreter settings and limits.

This object can be configured from the [WebUI](/docs/management/webui/) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /><path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="M10 12.5 8 15l2 2.5" /><path d="m14 12.5 2 2.5-2 2.5" /></svg> Sieve › System Interpreter

## Fields


##### `defaultFromAddress`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"'MAILER-DAEMON@' + system('domain')"}`
>
> Default email address to use for the from field in email notifications sent from a Sieve script
>
> Available variables: [`MtaRcptToVariable`](/docs/ref/expression/variable/mta-rcpt-to-variable).


##### `defaultFromName`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"'Automated Message'"}`
>
> Default name to use for the from field in email notifications sent from a Sieve script
>
> Available variables: [`MtaRcptToVariable`](/docs/ref/expression/variable/mta-rcpt-to-variable).


##### `messageIdHostname`

> Type: <code>String?</code>
>
> Override the default local hostname to use when generating a Message-Id header


##### `duplicateExpiry`

> Type: <code>Duration</code> · default: `"7d"`
>
> Default expiration time for IDs stored by the duplicate extension from trusted scripts


##### `noCapabilityCheck`

> Type: <code>Boolean</code> · default: `true`
>
> If enabled, language extensions can be used without being explicitly declared using the require statement


##### `defaultReturnPath`

> Type: [<code>Expression</code>](#expression) · required
>
> Default return path to use in email notifications sent from a Sieve script
>
> Available variables: [`MtaRcptToVariable`](/docs/ref/expression/variable/mta-rcpt-to-variable).


##### `dkimSignDomain`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"system('domain')"}`
>
> Which domain's DKIM signatures to use when signing the email notifications sent from a Sieve script
>
> Available variables: [`MtaRcptToVariable`](/docs/ref/expression/variable/mta-rcpt-to-variable).


##### `maxCpuCycles`

> Type: <code>UnsignedInt</code> · default: `1048576` · min: 1
>
> Maximum number CPU cycles a script can use


##### `maxNestedIncludes`

> Type: <code>UnsignedInt</code> · default: `5` · min: 1
>
> Maximum number of nested includes


##### `maxOutMessages`

> Type: <code>UnsignedInt</code> · default: `5`
>
> Maximum number of outgoing messages


##### `maxReceivedHeaders`

> Type: <code>UnsignedInt</code> · default: `50` · min: 1
>
> Maximum number of received headers


##### `maxRedirects`

> Type: <code>UnsignedInt</code> · default: `3`
>
> Maximum number of redirects


##### `maxVarSize`

> Type: <code>UnsignedInt</code> · default: `52428800` · min: 1
>
> Maximum size of a variable



## JMAP API

The SieveSystemInterpreter singleton is available via the `urn:stalwart:jmap` capability.


### `x:SieveSystemInterpreter/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysSieveSystemInterpreterGet` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:SieveSystemInterpreter/get",
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



### `x:SieveSystemInterpreter/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysSieveSystemInterpreterUpdate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:SieveSystemInterpreter/set",
          {
            "update": {
              "singleton": {
                "messageIdHostname": "updated value"
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
stalwart-cli get SieveSystemInterpreter
```


### Update

```sh
stalwart-cli update SieveSystemInterpreter --field messageIdHostname='updated value'
```



## Nested types


### Expression

A conditional expression with match rules and a default value.



##### `match`

> Type: [<code>ExpressionMatch</code>](#expressionmatch)<code>[]</code>
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





## Expression references

The following expression contexts are used by fields on this page:

- [`MtaRcptToVariable`](/docs/ref/expression/variable/mta-rcpt-to-variable) (Variables)

