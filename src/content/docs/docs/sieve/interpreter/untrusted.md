---
sidebar_position: 3
title: "Untrusted interpreter"
description: "Settings for user Sieve scripts: resource limits, enabled extensions, vacation replies and their DKIM signing, interaction with the spam filter, and global scripts."
---

Users want to organise their own mail without asking an administrator: file newsletters into a folder, flag messages from their manager, forward copies elsewhere, or answer automatically while they are away. User scripts give them that control, and the untrusted interpreter runs them.

A user script runs when a message is delivered to the user. It can file the message into folders, set flags, forward it, discard it or send an automatic reply. Users upload and activate their scripts over [ManageSieve or JMAP](/docs/sieve/user-scripts).

Every user can upload a script, and the server cannot vet each one. The interpreter therefore enforces limits on what a script may consume, and lets the administrator disable extensions.

For the same reason, user scripts can call only a subset of the [function library](/docs/sieve/reference). Functions that reach external systems, such as DNS or SQL lookups, are not available. The one exception is `llm_prompt`, which [calls an AI model](/docs/sieve/llm) for accounts that hold the `interactAi` permission. [Two interpreters](/docs/sieve/#two-interpreters) compares the two interpreters.

The interpreter is configured on the [SieveUserInterpreter](/docs/ref/object/sieve-user-interpreter) singleton, found in the WebUI under <!-- breadcrumb:SieveUserInterpreter --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /><path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="M10 12.5 8 15l2 2.5" /><path d="m14 12.5 2 2.5-2 2.5" /></svg> Sieve › User Interpreter<!-- /breadcrumb:SieveUserInterpreter -->.

## Resource limits

A script can strain the server in two ways: by its size and structure, which matter when it is compiled, and by its behaviour, which matters every time it runs. The limits follow that division and fall into three groups. The first group bounds a script when it is uploaded, and a script that exceeds one of these limits is refused with a compile error:

| Field | Default | Limit |
|---|---|---|
| [`maxScriptSize`](/docs/ref/object/sieve-user-interpreter#maxscriptsize) | <!-- default:SieveUserInterpreter.maxScriptSize -->100 KiB<!-- /default --> | Size of a script. |
| [`maxScriptNameLength`](/docs/ref/object/sieve-user-interpreter#maxscriptnamelength) | <!-- default:SieveUserInterpreter.maxScriptNameLength -->512<!-- /default --> | Length of a script name. |
| [`maxStringLength`](/docs/ref/object/sieve-user-interpreter#maxstringlength) | <!-- default:SieveUserInterpreter.maxStringLength -->4096<!-- /default --> | Length of a string constant. |
| [`maxNestedBlocks`](/docs/ref/object/sieve-user-interpreter#maxnestedblocks) | <!-- default:SieveUserInterpreter.maxNestedBlocks -->15<!-- /default --> | Depth of nested `if`, `elsif` and `else` blocks. |
| [`maxNestedTests`](/docs/ref/object/sieve-user-interpreter#maxnestedtests) | <!-- default:SieveUserInterpreter.maxNestedTests -->15<!-- /default --> | Depth of nested tests. |
| [`maxNestedForEvery`](/docs/ref/object/sieve-user-interpreter#maxnestedforevery) | <!-- default:SieveUserInterpreter.maxNestedForEvery -->3<!-- /default --> | Depth of nested `foreverypart` loops. |
| [`maxMatchVars`](/docs/ref/object/sieve-user-interpreter#maxmatchvars) | <!-- default:SieveUserInterpreter.maxMatchVars -->30<!-- /default --> | Match and regular expression variables a script may capture. |
| [`maxLocalVars`](/docs/ref/object/sieve-user-interpreter#maxlocalvars) | <!-- default:SieveUserInterpreter.maxLocalVars -->128<!-- /default --> | Variables in scope at any point. |
| [`maxVarNameLength`](/docs/ref/object/sieve-user-interpreter#maxvarnamelength) | <!-- default:SieveUserInterpreter.maxVarNameLength -->32<!-- /default --> | Length of a variable name. |
| [`maxHeaderSize`](/docs/ref/object/sieve-user-interpreter#maxheadersize) | <!-- default:SieveUserInterpreter.maxHeaderSize -->1024<!-- /default --> | Length of a header value written by a script. |
| [`maxIncludes`](/docs/ref/object/sieve-user-interpreter#maxincludes) | <!-- default:SieveUserInterpreter.maxIncludes -->3<!-- /default --> | `include` commands in a script. |

The second group bounds a script while it runs, which it does for every message the user receives:

| Field | Default | Limit |
|---|---|---|
| [`maxCpuCycles`](/docs/ref/object/sieve-user-interpreter#maxcpucycles) | <!-- default:SieveUserInterpreter.maxCpuCycles -->5000<!-- /default --> | Instructions executed in one run, including those of included scripts. |
| [`maxNestedIncludes`](/docs/ref/object/sieve-user-interpreter#maxnestedincludes) | <!-- default:SieveUserInterpreter.maxNestedIncludes -->3<!-- /default --> | Depth of nested `include` commands. |
| [`maxVarSize`](/docs/ref/object/sieve-user-interpreter#maxvarsize) | <!-- default:SieveUserInterpreter.maxVarSize -->4096<!-- /default --> | Size of a variable in bytes; longer values are truncated. |
| [`maxRedirects`](/docs/ref/object/sieve-user-interpreter#maxredirects) | <!-- default:SieveUserInterpreter.maxRedirects -->1<!-- /default --> | `redirect` actions per run. |
| [`maxOutMessages`](/docs/ref/object/sieve-user-interpreter#maxoutmessages) | <!-- default:SieveUserInterpreter.maxOutMessages -->3<!-- /default --> | Messages a script may send per run, counting vacation replies, notifications and redirects. |
| [`maxReceivedHeaders`](/docs/ref/object/sieve-user-interpreter#maxreceivedheaders) | <!-- default:SieveUserInterpreter.maxReceivedHeaders -->50<!-- /default --> | `Received` headers a message may carry before the script treats it as looping and sends no message for it. |

When a script fails at run time, for example by exceeding one of these limits, it stops. Actions it has already taken stay in effect. A message that the script had not yet filed, redirected or discarded is delivered to the inbox, so a failing script does not lose the message.

The headers a script adds to a message are also subject to limits outside the interpreter: the size and number of header fields allowed by [`maxHeaderSize` and `maxHeaderCount`](/docs/email/settings/jmap#header-section) on the Email singleton. Once an added header would push the message over either limit, that header and every header added after it are dropped.

The third group bounds storage. [`maxScripts`](/docs/ref/object/sieve-user-interpreter#maxscripts) is the number of scripts an account may store, <!-- default:SieveUserInterpreter.maxScripts -->100<!-- /default --> by default. A `maxSieveScripts` entry in the account's [`quotas`](/docs/ref/object/account#quotas) overrides it for that account.

The following object body tightens the runtime limits for a server with many users:

```json
{
  "maxCpuCycles": 2000,
  "maxRedirects": 1,
  "maxOutMessages": 2
}
```

## Extensions

Every extension listed in [Supported extensions](/docs/sieve/#supported-extensions) is available to user scripts unless it is named in [`disableCapabilities`](/docs/ref/object/sieve-user-interpreter#disablecapabilities).

The extensions an administrator typically considers disabling are the ones with effects beyond the user's own mailbox. `enotify` sends notifications to other addresses. `editheader`, `replace` and `enclose` change the content of the message, which can remove information that the administrator or other filters rely on. Forwarding with `redirect` is part of the base language and cannot be disabled, but it is bounded by `maxRedirects`.

Disabling an extension affects scripts in different ways, depending on when they were stored. Clients learn which extensions are available from the capability list of ManageSieve and JMAP, which omits disabled extensions. A new script that requires a disabled extension is refused at upload, with a compile error such as `Capability 'enotify' is not supported at line <line>, column <column>.`.

Existing scripts are a different matter. Scripts that users uploaded before the extension was disabled are not checked again, so they fail at delivery when they reach it. A global script that requires a disabled extension is skipped when the configuration is loaded, with the build warning `Failed to compile user global Sieve script, skipping it: <error>`.

The following object body disables content modification and notifications:

```json
{
  "disableCapabilities": {"editheader": true, "replace": true, "enclose": true, "enotify": true}
}
```

The accepted names are listed in the [SieveCapability](/docs/ref/object/sieve-user-interpreter#sievecapability) enumeration.

Two settings narrow extensions without disabling them. The URI schemes that `notify` may use are the keys of [`allowedNotifyUris`](/docs/ref/object/sieve-user-interpreter#allowednotifyuris), which by default allows only <!-- default:SieveUserInterpreter.allowedNotifyUris -->`mailto`<!-- /default -->.

The header fields that `editheader` may neither add nor delete are the keys of [`protectedHeaders`](/docs/ref/object/sieve-user-interpreter#protectedheaders). The default protects <!-- default:SieveUserInterpreter.protectedHeaders -->`Auto-Submitted`, `Original-From`, `Original-Subject` and `Received`<!-- /default -->, so that a script cannot hide the path a message took or remove the marker of an automatic reply.

## Vacation replies and generated messages

The `vacation` extension sends an automatic reply to each sender. Replying to every message would flood correspondents who write often, so a sender receives a reply at most once within a period. When the script does not specify the period, the same sender receives another reply only after [`defaultExpiryVacation`](/docs/ref/object/sieve-user-interpreter#defaultexpiryvacation), <!-- default:SieveUserInterpreter.defaultExpiryVacation -->30 days<!-- /default --> by default.

The interpreter also fills in a subject when the script gives none. The reply then carries the original subject prefixed with [`defaultSubjectPrefix`](/docs/ref/object/sieve-user-interpreter#defaultsubjectprefix), <!-- default:SieveUserInterpreter.defaultSubjectPrefix -->`Auto: `<!-- /default --> by default. When the original subject is not known, it carries [`defaultSubject`](/docs/ref/object/sieve-user-interpreter#defaultsubject), <!-- default:SieveUserInterpreter.defaultSubject -->`Automated reply`<!-- /default --> by default.

The `duplicate` extension lets a script recognise a message it has already seen, for example a copy that arrives through two mailing lists. It records the identifiers of the messages it tests. When the script does not specify an expiry, the identifiers expire after [`defaultExpiryDuplicate`](/docs/ref/object/sieve-user-interpreter#defaultexpiryduplicate), <!-- default:SieveUserInterpreter.defaultExpiryDuplicate -->7 days<!-- /default --> by default.

Messages that a user script sends must pass the receivers' authentication checks like any other mail. Vacation replies and the other messages a user script sends are therefore DKIM-signed, according to [`dkimSignDomain`](/docs/ref/object/sieve-user-interpreter#dkimsigndomain).

For these messages, the `sender` and `sender_domain` variables of the expression refer to the address of the account whose script sends the message. The envelope sender of the reply is empty (`<>`), as [RFC 5230 section 5.1](https://www.rfc-editor.org/rfc/rfc5230#section-5.1) recommends for vacation replies. The default expression signs with the account's domain when it is a domain hosted on the server, and does not sign otherwise. The signature therefore aligns with the domain in the `From` header of the reply, which is the condition receivers check under [DMARC](/docs/mta/authentication/dmarc).

## Interaction with the spam filter

A user script runs after the [spam filter](/docs/spamfilter/) has scored the message, so it can take the verdict into account. The script can test the result with the `spamtest` extension, or with the `X-Spam-Score` header.

The script also takes precedence over the Junk folder. When the script ends without filing the message, a message classified as spam is moved to the Junk folder as usual. When the script files the message with `fileinto`, including `fileinto "INBOX"`, the message stays in the folder the script chose. It is not moved to Junk, and its `X-Spam-Status` header reads `No`.

## Global scripts

Global scripts let the administrator publish ready-made user scripts that every user can adopt.

Each global script is a [SieveUserScript](/docs/ref/object/sieve-user-script), found in the WebUI under <!-- breadcrumb:SieveUserScript --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /><path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="M10 12.5 8 15l2 2.5" /><path d="m14 12.5 2 2.5-2 2.5" /></svg> Sieve › User Scripts<!-- /breadcrumb:SieveUserScript -->. It has a `name`, an optional `description`, the script text in `contents`, and an `isActive` flag. The flag is <!-- default:SieveUserScript.isActive -->`false`<!-- /default --> by default, so a new global script is not available until it is activated.

A global script is offered, not imposed. It runs only when a user's script includes it with `include :global "<name>"`, and it then runs with the user's permissions in the untrusted interpreter.

The following object publishes a global script that files messages from mailing lists into a `Lists` folder:

```json
{
  "name": "file-lists",
  "description": "File mailing list messages",
  "isActive": true,
  "contents": "require [\"fileinto\", \"mailbox\"];\n\nif exists \"List-Id\" {\n    fileinto :create \"Lists\";\n}\n"
}
```

A user enables it by including it from the active script:

```sieve
require ["include"];

include :global "file-lists";
```

<!-- sievepad skip: includes a global script that exists only on the server -->
