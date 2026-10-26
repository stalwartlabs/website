---
sidebar_position: 2
title: "Trusted interpreter"
description: "System Sieve scripts run by the SMTP server: how to install and select them, the settings and limits of the trusted interpreter, and why a script does not run."
---

Some mail policies cannot be expressed with the settings of the SMTP server: rejecting a sender based on a custom lookup, adding a header that downstream systems rely on, or rewriting part of a message. System scripts fill that gap. Administrators install them to act on messages while the SMTP server receives them, and the trusted interpreter runs them.

Because only administrators write system scripts, the trusted interpreter gives them wide powers. System scripts can call every function of the [function library](/docs/sieve/reference), including DNS, SQL, HTTP and AI model calls. They cannot file messages into mailboxes or send automatic replies, which remain the job of user scripts. [Two interpreters](/docs/sieve/#two-interpreters) compares the two interpreters.

## Installing a system script

Each system script is a [SieveSystemScript](/docs/ref/object/sieve-system-script), found in the WebUI under <!-- breadcrumb:SieveSystemScript --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /><path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="M10 12.5 8 15l2 2.5" /><path d="m14 12.5 2 2.5-2 2.5" /></svg> Sieve › System Scripts<!-- /breadcrumb:SieveSystemScript -->. The object has a [`name`](/docs/ref/object/sieve-system-script#name), an optional [`description`](/docs/ref/object/sieve-system-script#description), the script text in [`contents`](/docs/ref/object/sieve-system-script#contents), and an [`isActive`](/docs/ref/object/sieve-system-script#isactive) flag.

Only active scripts are loaded. `isActive` is <!-- default:SieveSystemScript.isActive -->`false`<!-- /default --> by default, so a new script does nothing until it is activated, which allows a script to be prepared before it takes effect. Script names are case-insensitive and must be unique among the active scripts.

An active script still runs only when an SMTP stage selects it. The stage objects are [MtaStageConnect](/docs/ref/object/mta-stage-connect), [MtaStageEhlo](/docs/ref/object/mta-stage-ehlo), [MtaStageMail](/docs/ref/object/mta-stage-mail), [MtaStageRcpt](/docs/ref/object/mta-stage-rcpt) and [MtaStageData](/docs/ref/object/mta-stage-data). Each has a `script` field, an [expression](/docs/configuration/expressions/) that returns the name of the script to run for the current session, or `false` to run none.

Because the field is an expression, a stage can run different scripts depending on the listener, the client or the sender. Scripts can also load other active system scripts with the `include` command, so common logic can be kept in one place.

The following object defines a script that rejects clients whose EHLO domain is listed in the `blocked-domains` [lookup list](/docs/configuration/expressions/lookup/):

```json
{
  "name": "block-helo",
  "description": "Reject blocklisted HELO domains",
  "isActive": true,
  "contents": "require [\"variables\", \"extlists\", \"reject\"];\n\nif string :list \"${env.helo_domain}\" \"blocked-domains\" {\n    reject \"550 5.7.1 Your domain '${env.helo_domain}' has been blocklisted.\";\n}\n"
}
```

The EHLO stage then selects it with the following `script` value on MtaStageEhlo:

```json
{
  "script": {"else": "'block-helo'"}
}
```

Each script is compiled when it is saved. A script that does not compile is refused with an `invalidProperties` error, `Failed to compile system Sieve script: <error>`.

A script that compiled once can still stop compiling later, for example after a change to the interpreter settings. A stored script that no longer compiles when the settings are loaded is reported as a configuration error with the same text, and is not loaded.

Scripts cannot be loaded from files, so `contents` always holds the full text of the script.

## Replies and actions

A system script runs in the middle of an SMTP transaction, so its outcome is an SMTP reply. It decides what happens to the command or message being processed:

- `reject "<reply>"` refuses the current command, or the message at the DATA stage. The text is sent as the SMTP reply when it starts with a three-digit code followed by a space, for example `reject "550 5.7.1 Not accepted.";`. Any other text is sent as `503 5.5.3 <text>`, a "bad sequence of commands" reply that does not describe a policy rejection, so always start the text with a reply code. A reject at the connect stage closes the connection after the reply, while at the other stages the session continues.
- `discard` at the DATA stage accepts the message with `250 2.0.0 Message queued for delivery.` and drops it. At the other stages it has no effect.
- Ending the script without one of these actions accepts the command. At the DATA stage, changes made by `addheader`, `deleteheader`, `replace` and the other editing extensions are applied to the queued message.
- `redirect` and the notification and reply actions send new messages through the queue, up to `maxOutMessages` per run.

A runtime error, such as exceeding a limit, ends the script. A `reject` issued before the error still applies. Without one, the command is accepted, so a failing script does not block mail.

## Settings

The trusted interpreter is configured on the [SieveSystemInterpreter](/docs/ref/object/sieve-system-interpreter) singleton, found in the WebUI under <!-- breadcrumb:SieveSystemInterpreter --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /><path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="M10 12.5 8 15l2 2.5" /><path d="m14 12.5 2 2.5-2 2.5" /></svg> Sieve › System Interpreter<!-- /breadcrumb:SieveSystemInterpreter -->.

System scripts can send messages of their own, for example with `redirect` or `notify`. These messages need a sender and, to be trusted by receivers, a DKIM signature. The following settings decide how they are addressed and signed. Each is an expression, and the first three are evaluated with the [RCPT TO variables](/docs/ref/expression/variable/mta-rcpt-to-variable):

| Field | Default | Use |
|---|---|---|
| [`defaultFromName`](/docs/ref/object/sieve-system-interpreter#defaultfromname) | <!-- default:SieveSystemInterpreter.defaultFromName -->`'Automated Message'`<!-- /default --> | Display name in the `From` header of generated messages. |
| [`defaultFromAddress`](/docs/ref/object/sieve-system-interpreter#defaultfromaddress) | <!-- default:SieveSystemInterpreter.defaultFromAddress -->`'MAILER-DAEMON@' + system('domain')`<!-- /default --> | Address in the `From` header of generated messages. |
| [`defaultReturnPath`](/docs/ref/object/sieve-system-interpreter#defaultreturnpath) | Not set | Envelope sender of generated messages. While it is unset, they are sent with an empty envelope sender (`<>`), so no bounce is generated for them. |
| [`dkimSignDomain`](/docs/ref/object/sieve-system-interpreter#dkimsigndomain) | <!-- default:SieveSystemInterpreter.dkimSignDomain -->`system('domain')`<!-- /default --> | Domain whose [DKIM](/docs/mta/authentication/dkim/) keys sign generated messages; every active key of that domain is used. |

Two further settings complete the picture. [`messageIdHostname`](/docs/ref/object/sieve-system-interpreter#messageidhostname) overrides the host name used in the `Message-ID` header of generated messages, which is the server host name when the field is not set. [`noCapabilityCheck`](/docs/ref/object/sieve-system-interpreter#nocapabilitycheck) allows system scripts to use extensions without declaring them in a `require` statement. It is <!-- default:SieveSystemInterpreter.noCapabilityCheck as=enabled -->enabled<!-- /default --> by default.

## Limits

System scripts are trusted, but they can still contain mistakes, and a mistake in a script that runs for every message affects the whole server. The limits protect the server from scripts that loop or produce too much output:

| Field | Default | Limit |
|---|---|---|
| [`maxCpuCycles`](/docs/ref/object/sieve-system-interpreter#maxcpucycles) | <!-- default:SieveSystemInterpreter.maxCpuCycles -->1048576<!-- /default --> | Instructions a script may execute in one run. |
| [`maxVarSize`](/docs/ref/object/sieve-system-interpreter#maxvarsize) | <!-- default:SieveSystemInterpreter.maxVarSize -->52428800<!-- /default --> | Size of a variable, in bytes. |
| [`maxNestedIncludes`](/docs/ref/object/sieve-system-interpreter#maxnestedincludes) | <!-- default:SieveSystemInterpreter.maxNestedIncludes -->5<!-- /default --> | Depth of nested `include` commands. |
| [`maxRedirects`](/docs/ref/object/sieve-system-interpreter#maxredirects) | <!-- default:SieveSystemInterpreter.maxRedirects -->3<!-- /default --> | `redirect` actions per run. |
| [`maxOutMessages`](/docs/ref/object/sieve-system-interpreter#maxoutmessages) | <!-- default:SieveSystemInterpreter.maxOutMessages -->5<!-- /default --> | Messages a script may send per run. |
| [`maxReceivedHeaders`](/docs/ref/object/sieve-system-interpreter#maxreceivedheaders) | <!-- default:SieveSystemInterpreter.maxReceivedHeaders -->50<!-- /default --> | `Received` headers a message may carry before a script treats it as looping and sends nothing for it. |

The following object body lowers the instruction limit and the number of messages a script may send:

```json
{
  "maxCpuCycles": 100000,
  "maxOutMessages": 2
}
```

The trusted interpreter has no expiry setting for the `duplicate` extension, because the extension is not available to system scripts. The [untrusted interpreter](/docs/sieve/interpreter/untrusted#vacation-replies-and-generated-messages) has one.

## Troubleshooting system scripts

A system script runs unseen, inside SMTP sessions, so a script that seems to have no effect gives no direct sign of why. The cause is usually one of the following situations, each of which is recorded in the server log:

- The script is not active. Inactive scripts are not loaded, and a stage that names one logs `sieve.script-not-found`.
- The name returned by the stage's `script` expression does not match the script's name, or the expression is not set on the stage where the script is expected to run. The stage logs `sieve.script-not-found` with the name it looked for.
- The script was created or changed after the settings were last reloaded. System scripts are loaded with the server settings, so a new or edited script takes effect only after a `ReloadSettings` [action](/docs/management/tasks-actions/actions), as described in [Applying changes](/docs/configuration/#applying-changes).
- The script no longer compiles with the current interpreter settings, and the configuration error `Failed to compile system Sieve script` was reported when the settings were loaded.
- The script uses an extension the trusted interpreter does not provide, such as `fileinto` or `vacation`. The script fails at its `require` statement or, without one, at the action, which is refused with the event `sieve.not-supported`.
- The script ran but failed, for example by exceeding `maxCpuCycles` or calling a [lookup list](/docs/configuration/expressions/lookup/) that does not exist. The events `sieve.runtime-error` and `sieve.list-not-found` record the cause, and `sieve.runtime-error` is logged at the `debug` level.

When the script does run, its decisions are logged too. The actions a script takes are logged as `sieve.action-accept`, `sieve.action-reject` and `sieve.action-discard` at the `debug` level.
