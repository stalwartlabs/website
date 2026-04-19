---
sidebar_position: 3
---

# Untrusted Interpreter

The untrusted interpreter runs Sieve scripts created by end-users. Stalwart supports [JMAP for Sieve Scripts](https://www.rfc-editor.org/rfc/rfc9661.html) and [ManageSieve](https://datatracker.ietf.org/doc/html/rfc5804) for uploading and managing user scripts.

Interpreter settings, resource limits, and the list of globally available scripts are configured through the [SieveUserInterpreter](/docs/ref/object/sieve-user-interpreter) singleton (found in the WebUI under <!-- breadcrumb:SieveUserInterpreter --><!-- /breadcrumb:SieveUserInterpreter -->) and the [SieveUserScript](/docs/ref/object/sieve-user-script) object (found in the WebUI under <!-- breadcrumb:SieveUserScript --><!-- /breadcrumb:SieveUserScript -->).

## Limits

User scripts execute in a sandbox that bounds their use of server resources. The limits are expressed as fields on the SieveUserInterpreter singleton:

- [`maxScriptSize`](/docs/ref/object/sieve-user-interpreter#maxscriptsize): maximum size of a Sieve script. Default `"100kb"`.
- [`maxStringLength`](/docs/ref/object/sieve-user-interpreter#maxstringlength): maximum size of a constant string. Default `4096`.
- [`maxNestedBlocks`](/docs/ref/object/sieve-user-interpreter#maxnestedblocks): maximum depth of nested `if` / `elsif` / `else` blocks. Default `15`.
- [`maxNestedTests`](/docs/ref/object/sieve-user-interpreter#maxnestedtests): maximum depth of nested tests. Default `15`.
- [`maxNestedForEvery`](/docs/ref/object/sieve-user-interpreter#maxnestedforevery): maximum depth of nested `foreverypart` loops. Default `3`.
- [`maxMatchVars`](/docs/ref/object/sieve-user-interpreter#maxmatchvars): maximum number of match and regex variables that can be captured. Default `30`.
- [`maxLocalVars`](/docs/ref/object/sieve-user-interpreter#maxlocalvars): maximum number of local variables in scope at any point. Default `128`.
- [`maxHeaderSize`](/docs/ref/object/sieve-user-interpreter#maxheadersize): maximum length of an RFC 822 header value. Default `1024`.
- [`maxIncludes`](/docs/ref/object/sieve-user-interpreter#maxincludes): maximum number of `include` instructions per script. Default `3`.
- [`maxNestedIncludes`](/docs/ref/object/sieve-user-interpreter#maxnestedincludes): maximum depth of nested `include` instructions. Default `3`.
- [`maxCpuCycles`](/docs/ref/object/sieve-user-interpreter#maxcpucycles): maximum number of instructions a script can execute, counted across any included scripts. Default `5000`.
- [`maxVarNameLength`](/docs/ref/object/sieve-user-interpreter#maxvarnamelength): maximum length of a variable name. Default `32`.
- [`maxVarSize`](/docs/ref/object/sieve-user-interpreter#maxvarsize): maximum size of a variable; contents beyond this point are truncated. Default `4096`.
- [`maxRedirects`](/docs/ref/object/sieve-user-interpreter#maxredirects): maximum number of message redirections per execution. Default `1`.
- [`maxReceivedHeaders`](/docs/ref/object/sieve-user-interpreter#maxreceivedheaders): maximum number of `Received` headers before a message is treated as looping. Default `10`.
- [`maxOutMessages`](/docs/ref/object/sieve-user-interpreter#maxoutmessages): maximum number of outgoing messages (including vacation responses, notifications, and redirects) a script can send. Default `3`.
- [`maxScriptNameLength`](/docs/ref/object/sieve-user-interpreter#maxscriptnamelength): maximum length of a script name. Default `512`.
- [`maxScripts`](/docs/ref/object/sieve-user-interpreter#maxscripts): default maximum number of Sieve scripts a single account may create. Default `100`.

Example limits:

```json
{
  "maxScriptNameLength": 512,
  "maxScriptSize": "100kb",
  "maxStringLength": 4096,
  "maxVarNameLength": 32,
  "maxVarSize": 4096,
  "maxNestedBlocks": 15,
  "maxNestedTests": 15,
  "maxNestedForEvery": 3,
  "maxMatchVars": 30,
  "maxLocalVars": 128,
  "maxHeaderSize": 1024,
  "maxIncludes": 3,
  "maxNestedIncludes": 3,
  "maxCpuCycles": 5000,
  "maxRedirects": 1,
  "maxReceivedHeaders": 10,
  "maxOutMessages": 3
}
```

## Extensions

Stalwart supports [all registered Sieve extensions](https://www.iana.org/assignments/sieve-extensions/sieve-extensions.xhtml) and enables them by default. Administrators often want to disable extensions that let a user send outgoing email from a script (for example `enotify`) or modify message content (for example `editheader`, `replace`, `enclose`).

Disabled extensions are listed in [`disableCapabilities`](/docs/ref/object/sieve-user-interpreter#disablecapabilities) on SieveUserInterpreter. The accepted values are documented on the [SieveCapability](/docs/ref/object/sieve-user-interpreter#sievecapability) enum.

```json
{
  "disableCapabilities": ["editheader", "replace", "enclose", "enotify"]
}
```

## Notification URIs

The allowed URI schemes for the `notify` extension are configured through [`allowedNotifyUris`](/docs/ref/object/sieve-user-interpreter#allowednotifyuris). The default is `["mailto"]`.

```json
{
  "allowedNotifyUris": ["mailto"]
}
```

## Protected Headers

Headers that cannot be added or removed by the `editheader` extension are listed in [`protectedHeaders`](/docs/ref/object/sieve-user-interpreter#protectedheaders). The default list is `["Original-Subject", "Original-From", "Received", "Auto-Submitted"]`.

```json
{
  "protectedHeaders": ["Original-Subject", "Original-From", "Received", "Auto-Submitted"]
}
```

## Vacation defaults

Defaults for the `vacation` extension are exposed on SieveUserInterpreter through:

- [`defaultSubject`](/docs/ref/object/sieve-user-interpreter#defaultsubject): default subject of vacation responses. Default `"Automated reply"`.
- [`defaultSubjectPrefix`](/docs/ref/object/sieve-user-interpreter#defaultsubjectprefix): prefix prepended to vacation response subjects. Default `"Auto: "`.

```json
{
  "defaultSubject": "Automated reply",
  "defaultSubjectPrefix": "Auto: "
}
```

## Expiration defaults

The default lifetimes for identifiers stored by the `vacation` and `duplicate` extensions are controlled by:

- [`defaultExpiryVacation`](/docs/ref/object/sieve-user-interpreter#defaultexpiryvacation): default expiration for vacation response tracking. Default `"30d"`.
- [`defaultExpiryDuplicate`](/docs/ref/object/sieve-user-interpreter#defaultexpiryduplicate): default expiration for identifiers stored by the `duplicate` extension. Default `"7d"`.

```json
{
  "defaultExpiryVacation": "30d",
  "defaultExpiryDuplicate": "7d"
}
```

## Global Scripts

Global user scripts are published as [SieveUserScript](/docs/ref/object/sieve-user-script) records. Each record carries a [`name`](/docs/ref/object/sieve-user-script#name), an optional [`description`](/docs/ref/object/sieve-user-script#description), an [`isActive`](/docs/ref/object/sieve-user-script#isactive) flag, and the script body in [`contents`](/docs/ref/object/sieve-user-script#contents). Users reference these scripts from their own scripts with `include :global`.

For example, a global script that rejects messages larger than 100 KB:

```json
{
  "name": "global_one",
  "description": "Reject oversized messages",
  "isActive": true,
  "contents": "# Declare the extensions used by this script.\n#\nrequire [\"reject\"];\n\n# Messages bigger than 100K will be rejected with an error message\n#\nif size :over 100K {\n    reject \"I'm sorry, I do not accept mail over 100kb in size. Please upload larger files to a server and send me a link. Thanks.\";\n}\n"
}
```

<!-- review: The previous docs allowed the script body to be loaded from an external file through the configuration-file `file` macro. With scripts stored through the JMAP API, the `contents` field takes the script text directly. Confirm whether there is still a supported way to load the script body from a file at create/update time (for example a CLI flag on `stalwart-cli create sieve-user-script`) and document it here if so. -->
