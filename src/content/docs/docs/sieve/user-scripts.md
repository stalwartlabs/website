---
title: "User scripts: ManageSieve and JMAP"
description: "How users upload, validate, activate and remove their own Sieve scripts over ManageSieve or JMAP for Sieve, and how vacation responses are stored."
sidebar_position: 6
---

A user script lives on the server, but users write and maintain it from their own devices. They do so with a mail client or a filter editor that speaks one of two protocols. ManageSieve ([RFC 5804](https://www.rfc-editor.org/rfc/rfc5804)) is a dedicated line-based protocol, supported by most desktop mail clients and filter editors. JMAP for Sieve ([RFC 9661](https://www.rfc-editor.org/rfc/rfc9661)) is the JMAP extension used by web and JMAP clients.

Both protocols operate on the same scripts. A script uploaded with one is visible and editable with the other, and the WebUI uses the same storage, so a user can move between clients freely.

An account can store several scripts, but only one of them is active at a time. The active script runs when a message is delivered to the account, as described in [Execution points](/docs/sieve/#execution-points). The others are kept for later use, or included by the active script.

Errors are caught when a script is uploaded, not when mail arrives. Every script is compiled by the [untrusted interpreter](/docs/sieve/interpreter/untrusted) at upload. A script with a syntax error, an unknown extension, an [extension the administrator has disabled](/docs/sieve/interpreter/untrusted#extensions) or an exceeded limit is therefore refused at upload time, with the compiler's error message. Stored scripts are compiled again automatically when an upgrade of Stalwart requires it.

Two limits bound what an account can store. The number of scripts is limited by [`maxScripts`](/docs/ref/object/sieve-user-interpreter#maxscripts) on the [SieveUserInterpreter](/docs/ref/object/sieve-user-interpreter) singleton, which allows <!-- default:SieveUserInterpreter.maxScripts -->100<!-- /default --> by default. The `maxSieveScripts` entry of the account's [quotas](/docs/auth/authorization/quotas) can set a different limit for one account. The size of each script is limited by `maxScriptSize` on the same object.

## ManageSieve

A ManageSieve session follows a fixed sequence. The client connects to port 4190, upgrades the connection with `STARTTLS` and authenticates. It then uploads scripts with `PUTSCRIPT`, activates one with `SETACTIVE`, and lists, downloads or removes them with `LISTSCRIPTS`, `GETSCRIPT` and `DELETESCRIPT`. `CHECKSCRIPT` compiles a script without storing it, which lets an editor check a script before saving it, and answers `OK "Script is valid."` when it compiles.

A new installation has a ManageSieve listener named `sieve` on port 4190, without implicit TLS. This is the arrangement RFC 5804 defines: the session starts in cleartext, and the client upgrades it with `STARTTLS`. The listener is a [NetworkListener](/docs/ref/object/network-listener) with [`protocol`](/docs/ref/object/network-listener#protocol) set to `manageSieve`, found in the WebUI under <!-- breadcrumb:NetworkListener --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › Listeners<!-- /breadcrumb:NetworkListener -->. The following object creates it on a server that does not have it:

```json
{
  "name": "sieve",
  "protocol": "manageSieve",
  "bind": {"[::]:4190": true},
  "implicitTls": false
}
```

Leave [`implicitTls`](/docs/ref/object/network-listener#implicittls) at `false` on this port. Setting it to `true` makes the listener start TLS immediately, which ManageSieve clients do not expect on port 4190.

ManageSieve has no authentication settings of its own. It shares them, and its limits, with IMAP and POP3, as described in [IMAP and POP3](/docs/email/settings/imap#authentication). In practice, this has three consequences:

- By default, [`allowPlainTextAuth`](/docs/ref/object/imap#allowplaintextauth) is <!-- default:Imap.allowPlainTextAuth as=enabled -->disabled<!-- /default -->. While it is disabled, the capability list on a cleartext connection announces an empty SASL list (`"SASL" ""`) and `AUTHENTICATE` is refused with `NO (ENCRYPT-NEEDED) "Cannot authenticate over plain-text."`, so a client must issue `STARTTLS` before it can authenticate.
- The `OAUTHBEARER` and `XOAUTH2` mechanisms are offered only on TLS connections. After `STARTTLS` the list is `"SASL" "PLAIN OAUTHBEARER XOAUTH2"`, and on a cleartext connection with `allowPlainTextAuth` enabled it is `"SASL" "PLAIN"`. A server in bootstrap or recovery mode also offers the bearer mechanisms on cleartext connections.
- Logins count towards the per-account session limit and request rate described in [Rate limiting](/docs/email/settings/ratelimit).

Besides the SASL mechanisms, the capability list announces what a script may use: the enabled Sieve extensions (`SIEVE`), the allowed notification methods (`NOTIFY`) and the redirect limit (`MAXREDIRECTS`).

When the server refuses a script, the reply says why. `PUTSCRIPT` with a script that does not compile fails with `NO` and the compiler's message, for example `NO "Undeclared capability 'fileinto' at line 3, column 1."`. A script larger than `maxScriptSize` fails with `NO (QUOTA/MAXSIZE)`. A new script beyond `maxScripts` fails with `NO (QUOTA/MAXSCRIPTS) "Too many scripts."`.

## JMAP for Sieve

JMAP clients manage scripts through the `urn:ietf:params:jmap:sieve` capability, which is enabled without configuration. As with ManageSieve, the client learns the rules in advance. The session object announces the limits that apply to the account (`maxSizeScriptName`, `maxSizeScript`, `maxNumberScripts` and `maxNumberRedirects`), the enabled extensions in `sieveExtensions`, and the notification methods in `notificationMethods`.

The following methods are available:

| Method | Purpose |
|---|---|
| `SieveScript/get` | Retrieve scripts and their `isActive` state. The script text is downloaded as a blob. |
| `SieveScript/set` | Create, update or destroy scripts. The `onSuccessActivateScript` argument activates a script, created or existing, once the other changes have succeeded, and `onSuccessDeactivateScript` deactivates the active script. |
| `SieveScript/query` | List scripts, filtered by name or by active state. |
| `SieveScript/validate` | Compile a script without storing it, and report the compiler's error. |

Saving a script takes two steps. The script text is uploaded as a blob, and its `blobId` is then passed to `SieveScript/set`.

The errors mirror those of ManageSieve. A script that does not compile is refused with an `invalidScript` error, or `tooLarge` when it exceeds `maxScriptSize`. Creating a script beyond `maxScripts` fails with `overQuota` and `There are too many sieve scripts, please delete some before adding a new one.`

The active script is protected against deletion. Until another script is activated or the script is deactivated, an attempt to destroy it fails with `scriptIsActive` and the description `Deactivate Sieve script before deletion.`

Access to JMAP for Sieve requires the corresponding JMAP [permissions](/docs/auth/authorization/permissions), which the default User role holds. Removing them from an account's roles disables the feature for that account.

## Vacation responses

Most users never write a Sieve script, but many set an out-of-office reply. JMAP clients configure one through the `VacationResponse` object (`urn:ietf:params:jmap:vacationresponse`), with the properties `isEnabled`, `fromDate`, `toDate`, `subject`, `textBody` and `htmlBody`.

Stalwart implements the vacation response with Sieve. It stores the response as a Sieve script named `vacation`, generated from these properties. The reply is therefore sent by the same mechanism as a `vacation` action in a user script, and follows the settings described in [Vacation replies](/docs/sieve/interpreter/untrusted#vacation-replies-and-generated-messages).

This implementation has a consequence for users who also filter their mail. Enabling the vacation response makes the `vacation` script the account's active script. Because only one script is active at a time, the script the user had active before stops running. It is not reactivated when the vacation response is disabled, so it must be activated again over ManageSieve or JMAP. A user who needs filtering and an automatic reply at the same time uses a `vacation` action in the filter script instead.

The name `vacation` is reserved for this script. `SieveScript/set` refuses to create another script with that name (`The 'vacation' name is reserved, please use a different name.`). It also refuses to modify the generated script (`The 'vacation' script cannot be modified, use VacationResponse/set instead.`).
