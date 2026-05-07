---
title: MtaExtensions
description: Configures SMTP protocol extensions offered to clients.
custom_edit_url: null
---

# MtaExtensions

Configures SMTP protocol extensions offered to clients.

This object can be configured from the [WebUI](/docs/management/webui/) under <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Session › Extensions

## Fields


##### `chunking`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"true"}`
>
> Enables chunking (RFC 1830), an extension that allows large messages to be transferred in chunks which may reduce the load on the network and server.
>
> Available variables: [`MtaMailFromVariable`](/docs/ref/expression/variable/mta-mail-from-variable).


##### `deliverBy`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"false","match":[{"if":"!is_empty(authenticated_as)","then":"15d"}]}`
>
> Specifies the maximum delivery time for a message using the DELIVERBY (RFC 2852) extension, which allows the sender to request a specific delivery time for a message
>
> Available variables: [`MtaMailFromVariable`](/docs/ref/expression/variable/mta-mail-from-variable).


##### `dsn`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"false","match":[{"if":"!is_empty(authenticated_as)","then":"true"}]}`
>
> Enables delivery status notifications (RFC 3461), which allows the sender to request a delivery status notification (DSN) from the recipient's mail server
>
> Available variables: [`MtaMailFromVariable`](/docs/ref/expression/variable/mta-mail-from-variable).


##### `expn`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"false","match":[{"if":"!is_empty(authenticated_as)","then":"true"}]}`
>
> Specifies whether to enable the EXPN command, which allows the sender to request the membership of a mailing list. It is recommended to disable this command to prevent spammers from harvesting email addresses
>
> Available variables: [`MtaMailFromVariable`](/docs/ref/expression/variable/mta-mail-from-variable).


##### `futureRelease`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"false","match":[{"if":"!is_empty(authenticated_as)","then":"7d"}]}`
>
> Specifies the maximum time that a message can be held for delivery using the FUTURERELEASE (RFC 4865) extension
>
> Available variables: [`MtaMailFromVariable`](/docs/ref/expression/variable/mta-mail-from-variable).


##### `mtPriority`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"false","match":[{"if":"!is_empty(authenticated_as)","then":"mixer"}]}`
>
> Specifies the priority assignment policy to advertise on the MT-PRIORITY (RFC 6710) extension, which allows the sender to specify a priority for a message. Available policies are mixer, stanag4406 and nsep, or false to disable this extension
>
> Available variables: [`MtaMailFromVariable`](/docs/ref/expression/variable/mta-mail-from-variable).
>
> Available constants: [`MtaPriorityConstant`](/docs/ref/expression/constant/mta-priority-constant).


##### `noSoliciting`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"''"}`
>
> Specifies the text to include in the NOSOLICITING (RFC 3865) message, which indicates that the server does not accept unsolicited commercial email (UCE or spam)
>
> Available variables: [`MtaMailFromVariable`](/docs/ref/expression/variable/mta-mail-from-variable).


##### `pipelining`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"true"}`
>
> Enables SMTP pipelining (RFC 2920), which enables multiple commands to be sent in a single request to speed up communication between the client and server
>
> Available variables: [`MtaMailFromVariable`](/docs/ref/expression/variable/mta-mail-from-variable).


##### `requireTls`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"true"}`
>
> Enables require TLS (RFC 8689), an extension that allows clients to require TLS encryption for the SMTP session
>
> Available variables: [`MtaMailFromVariable`](/docs/ref/expression/variable/mta-mail-from-variable).


##### `vrfy`

> Type: [<code>Expression</code>](#expression) · default: `{"else":"false","match":[{"if":"!is_empty(authenticated_as)","then":"true"}]}`
>
> Specifies whether to enable the VRFY command, which allows the sender to verify the existence of a mailbox. It is recommended to disable this command to prevent spammers from harvesting email addresses
>
> Available variables: [`MtaMailFromVariable`](/docs/ref/expression/variable/mta-mail-from-variable).



## JMAP API

The MtaExtensions singleton is available via the `urn:stalwart:jmap` capability.


### `x:MtaExtensions/get`

This is a standard [`Foo/get`](https://www.rfc-editor.org/rfc/rfc8620#section-5.1) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.1), Section 5.1.

For singletons, the `ids` argument should be the literal `singleton` (or `null` to return the single instance).


This method requires the `sysMtaExtensionsGet` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaExtensions/get",
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



### `x:MtaExtensions/set`

This is a standard [`Foo/set`](https://www.rfc-editor.org/rfc/rfc8620#section-5.3) method as defined in [RFC 8620](https://www.rfc-editor.org/rfc/rfc8620#section-5.3), Section 5.3.

For singletons, only the `update` argument with id `singleton` is accepted; `create` and `destroy` arguments are rejected.


This method requires the `sysMtaExtensionsUpdate` [permission](/docs/ref/permissions).

```bash
curl -X POST https://mail.example.com/api \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
      "methodCalls": [
        [
          "x:MtaExtensions/set",
          {
            "update": {
              "singleton": {
                "chunking": {
                  "else": "true"
                }
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
stalwart-cli get MtaExtensions
```


### Update

```sh
stalwart-cli update MtaExtensions --field chunking='{"else":"true"}'
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

- [`MtaMailFromVariable`](/docs/ref/expression/variable/mta-mail-from-variable) (Variables)
- [`MtaPriorityConstant`](/docs/ref/expression/constant/mta-priority-constant) (Constants)

