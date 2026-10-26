---
sidebar_position: 4
title: "EHLO stage"
description: "The EHLO stage of an SMTP session: requiring and validating the client's host name, filtering by EHLO name, and the SMTP extensions the server advertises."
---

After the greeting, an SMTP client introduces itself. It sends the `EHLO` command, or the older `HELO`, or `LHLO` in the case of LMTP, and gives its host name as the argument. In the same exchange it asks which SMTP extensions the server supports. The server answers with the list of extensions available to that client, such as `STARTTLS`, `AUTH` and `SIZE`. This list determines what the client may do in the rest of the session, for example whether it may encrypt the connection or authenticate.

The EHLO stage therefore serves two purposes. It lets the server judge the client by the name it gives, and it decides which features the server offers. The first is configured on the [MtaStageEhlo](/docs/ref/object/mta-stage-ehlo) singleton (found in the WebUI under <!-- breadcrumb:MtaStageEhlo --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Session › EHLO Stage<!-- /breadcrumb:MtaStageEhlo -->), and the second on the [MtaExtensions](/docs/ref/object/mta-extensions) singleton.

## Client host name

The first decision is whether a client must introduce itself at all. [`require`](/docs/ref/object/mta-stage-ehlo#require) makes the client send `EHLO` or `HELO` before it starts a transaction, and it is <!-- default:MtaStageEhlo.require -->`true`<!-- /default --> by default. A client that sends `MAIL FROM` without it is refused with `503 5.5.1 Polite people say EHLO first.`

The second decision is whether the name must be a fully qualified domain name. [RFC 5321](https://www.rfc-editor.org/rfc/rfc5321#section-4.1.1.1) requires a client to give its fully qualified domain name, or an address literal when it has no meaningful name. Mail servers on the internet have such a name, so a check on port 25 refuses mostly misconfigured hosts and spam software. [`rejectNonFqdn`](/docs/ref/object/mta-stage-ehlo#rejectnonfqdn) performs this check, and by default it applies on port 25 only. A name that fails it is refused with `550 5.5.0 Invalid EHLO domain.` Mail clients that submit messages often send a bare host name or an address literal, which is why the check is off on the submission ports.

The EHLO name is used beyond this stage as well. It is the identity that [SPF](/docs/mta/authentication/spf) checks for the EHLO domain. It is also available as `helo_domain` to the RCPT TO and DATA expressions, to throttles and to Sieve scripts.

## Filtering by EHLO name

A filter at this stage can refuse clients by the name they give. [`script`](/docs/ref/object/mta-stage-ehlo#script) selects a system [Sieve script](/docs/sieve/interpreter/trusted) to run after each `EHLO`. A rejection at this stage refuses only the `EHLO` command. The session stays open, so the client may try again. The following script refuses clients whose EHLO name is in the `blocked-helo` list:

```sieve
require ["variables", "extlists", "reject"];

if string :list "${env.helo_domain}" "blocked-helo" {
    reject "550 5.7.1 Sending host '${env.helo_domain}' is blocklisted.";
}
```

<!-- sievepad { "environment": [ { "name": "helo_domain", "value": "spam.example.net" } ], "lists": [ { "name": "blocked-helo", "values": [ "spam.example.net" ] } ] } -->
<p><a href="https://sievepad.com/#w=ZZDPSsQwEMZfZRiEvdTgHopQz4oHwcMeN0Wy7bgbzZ-apHWlFHwuH8cncdJ1obC5zXzz_b7MjDhgtS7QKUtY4SYp86lCgtY3sYL7x6dniEntCX6_f-BBm0RBuz3svk7abCswNkF3KWK1Hc8kq7TLiu9Dk-tAH70OBFuJgwpa7QxFiQVIpGMyOqb_KtAbNUlifSeddPqV4-fEKs-wfjWSG8SBjH9pfQ6ZJHJ7Z3zzTu11FrgxSgf8TjCWy_IGSnEr1rAh12bewTNudUlbgY4w03IgtUIi_2SSDqe6QEsx8jXyplxFSolZXI3IHB28s-TS8gwLNF9jUKbP3dgpK-iobGdIOEozez7C0rvc6WzOA5f2eqqn6Q8" target="_blank" rel="noopener">Try this script in Sievepad</a></p>
<!-- /sievepad -->

The list that the script consults is a set of [MemoryLookupKey](/docs/ref/object/memory-lookup-key) entries with the namespace `blocked-helo`, one entry per name. An entry can also match a pattern rather than a single name: with [`isGlobPattern`](/docs/ref/object/memory-lookup-key#isglobpattern) set to `true`, the following entry matches `*.spam.example.net`:

```json
{
  "namespace": "blocked-helo",
  "key": "*.spam.example.net",
  "isGlobPattern": true
}
```

The script is then selected on MtaStageEhlo, here under the name `ehlo-filter`:

```json
{
  "script": {"else": "'ehlo-filter'"}
}
```

## SMTP extensions

SMTP extensions add features to the basic protocol, and a client may use only the extensions that the server lists in its EHLO response. Four of them are always advertised: `ENHANCEDSTATUSCODES`, `8BITMIME`, `BINARYMIME` and `SMTPUTF8`. The others depend on the connection and on the settings:

| Extension | Advertised when | Setting |
|---|---|---|
| `STARTTLS` | The connection is not yet encrypted and the listener has TLS enabled. | Listener [`useTls`](/docs/ref/object/network-listener#usetls) |
| `AUTH` | The session is not yet authenticated and the expression returns at least one mechanism. | [`saslMechanisms`](/docs/mta/inbound/auth) |
| `SIZE` | The maximum message size is greater than 0. | [`maxMessageSize`](/docs/mta/inbound/data#message-limits) |
| `PIPELINING` ([RFC 2920](https://www.rfc-editor.org/rfc/rfc2920)) | By default <!-- default:MtaExtensions.pipelining -->`true`<!-- /default --> for every session. | [`pipelining`](/docs/ref/object/mta-extensions#pipelining) |
| `CHUNKING` ([RFC 3030](https://www.rfc-editor.org/rfc/rfc3030)) | By default <!-- default:MtaExtensions.chunking -->`true`<!-- /default --> for every session. Clients need it to send `BINARYMIME` messages with `BDAT`. | [`chunking`](/docs/ref/object/mta-extensions#chunking) |
| `REQUIRETLS` ([RFC 8689](https://www.rfc-editor.org/rfc/rfc8689)) | By default <!-- default:MtaExtensions.requireTls -->`true`<!-- /default --> for every session. | [`requireTls`](/docs/ref/object/mta-extensions#requiretls) |
| `DSN` ([RFC 3461](https://www.rfc-editor.org/rfc/rfc3461)) | By default, authenticated sessions only. | [`dsn`](/docs/ref/object/mta-extensions#dsn) |
| `VRFY`, `EXPN` | By default, authenticated sessions only. | [`vrfy`](/docs/ref/object/mta-extensions#vrfy), [`expn`](/docs/ref/object/mta-extensions#expn) |
| `FUTURERELEASE` ([RFC 4865](https://www.rfc-editor.org/rfc/rfc4865)) | The expression returns a duration, the longest a message may be held. By default, authenticated sessions only. | [`futureRelease`](/docs/ref/object/mta-extensions#futurerelease) |
| `DELIVERBY` ([RFC 2852](https://www.rfc-editor.org/rfc/rfc2852)) | The expression returns a duration. By default, authenticated sessions only. | [`deliverBy`](/docs/ref/object/mta-extensions#deliverby) |
| `MT-PRIORITY` ([RFC 6710](https://www.rfc-editor.org/rfc/rfc6710)) | The expression returns a priority policy, `mixer`, `stanag4406` or `nsep`. By default, authenticated sessions only. | [`mtPriority`](/docs/ref/object/mta-extensions#mtpriority) |
| `NO-SOLICITING` ([RFC 3865](https://www.rfc-editor.org/rfc/rfc3865)) | The expression returns a string, advertised as the solicitation keywords. By default the extension is advertised without keywords. | [`noSoliciting`](/docs/ref/object/mta-extensions#nosoliciting) |

Each setting of MtaExtensions is an expression, so an extension can be offered to some clients and not to others. An expression that returns `false` withdraws its extension. A client that uses an extension that was not advertised to it receives a `501 5.5.4` reply naming the extension, for example `501 5.5.4 DSN extension has been disabled.`

`VRFY` and `EXPN` reveal which addresses exist and who is on a [mailing list](/docs/email/management/mailing-lists), which is why they are not offered to unauthenticated clients. Some commands are not available at all: `ETRN`, `ATRN` and `BURL` are not implemented and are answered with `502 5.5.1 Command not implemented.`

The following object body offers delivery status notifications and future release to every client, and keeps `VRFY` disabled:

```json
{
  "dsn": {"else": "true"},
  "futureRelease": {"else": "1d"},
  "vrfy": {"else": "false"}
}
```
