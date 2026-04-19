---
sidebar_position: 2
---

# Trusted Interpreter

The trusted interpreter runs Sieve scripts invoked by the SMTP server. These scripts are created by the system administrator and are considered privileged. Stalwart compiles all defined Sieve scripts at start-up and executes them on demand through the Sieve runtime.

## Configuration

Interpreter settings and resource limits are configured on the [SieveSystemInterpreter](/docs/ref/object/sieve-system-interpreter) singleton (found in the WebUI under <!-- breadcrumb:SieveSystemInterpreter --><!-- /breadcrumb:SieveSystemInterpreter -->). The main fields are:

- [`defaultFromName`](/docs/ref/object/sieve-system-interpreter#defaultfromname): default name used in the `From` header of email notifications sent from a Sieve script. Default `"'Automated Message'"`.
- [`defaultFromAddress`](/docs/ref/object/sieve-system-interpreter#defaultfromaddress): default address used in the `From` header of email notifications sent from a Sieve script. Default `"'MAILER-DAEMON@' + system('domain')"`.
- [`defaultReturnPath`](/docs/ref/object/sieve-system-interpreter#defaultreturnpath): default return path applied to email notifications sent from a Sieve script.
- [`dkimSignDomain`](/docs/ref/object/sieve-system-interpreter#dkimsigndomain): domain whose DKIM signatures are applied to email notifications sent from a Sieve script. Default `"system('domain')"`.
- [`messageIdHostname`](/docs/ref/object/sieve-system-interpreter#messageidhostname): local hostname used when generating the `Message-Id` header. When unset, the server hostname is used.
- [`noCapabilityCheck`](/docs/ref/object/sieve-system-interpreter#nocapabilitycheck): when `true`, language extensions can be used without being declared through a `require` statement. Default `true`.

<!-- review: The previous docs described the DKIM signing setting as a list of DKIM signature identifiers (for example `sign = "['rsa']"`). The current SieveSystemInterpreter exposes `dkimSignDomain`, an expression that selects a single signing domain. Confirm that multi-signature selection is now handled elsewhere (for example through the DkimSignature objects attached to the resolved domain) and that there is no list-of-identifiers setting on the interpreter itself. -->

### Limits

Resource limits protect the server from scripts that exceed reasonable bounds. The relevant fields on SieveSystemInterpreter are:

- [`maxRedirects`](/docs/ref/object/sieve-system-interpreter#maxredirects): maximum number of `redirect` commands per script. Default `3`.
- [`maxOutMessages`](/docs/ref/object/sieve-system-interpreter#maxoutmessages): maximum number of outgoing messages a script may send. Default `5`.
- [`maxReceivedHeaders`](/docs/ref/object/sieve-system-interpreter#maxreceivedheaders): maximum number of `Received` headers allowed in a message. Default `50`.
- [`maxCpuCycles`](/docs/ref/object/sieve-system-interpreter#maxcpucycles): maximum number of instructions a script can execute. Default `1048576`.
- [`maxNestedIncludes`](/docs/ref/object/sieve-system-interpreter#maxnestedincludes): maximum number of nested `include` instructions. Default `5`.
- [`duplicateExpiry`](/docs/ref/object/sieve-system-interpreter#duplicateexpiry): default expiration time for identifiers stored by the `duplicate` extension. Default `"7d"`.
- [`maxVarSize`](/docs/ref/object/sieve-system-interpreter#maxvarsize): maximum size of a variable, in bytes. Default `52428800`.

### Example

```json
{
  "defaultFromName": {"else": "'Automated Message'"},
  "defaultFromAddress": {"else": "'no-reply@example.org'"},
  "defaultReturnPath": {"else": "''"},
  "messageIdHostname": "mx.example.org",
  "dkimSignDomain": {"else": "system('domain')"},
  "maxRedirects": 3,
  "maxOutMessages": 5,
  "maxReceivedHeaders": 50,
  "maxCpuCycles": 10000,
  "maxNestedIncludes": 5,
  "duplicateExpiry": "7d"
}
```

## Scripts

Trusted Sieve scripts are stored as [SieveSystemScript](/docs/ref/object/sieve-system-script) records (found in the WebUI under <!-- breadcrumb:SieveSystemScript --><!-- /breadcrumb:SieveSystemScript -->). Each record carries a [`name`](/docs/ref/object/sieve-system-script#name), an optional [`description`](/docs/ref/object/sieve-system-script#description), an [`isActive`](/docs/ref/object/sieve-system-script#isactive) flag, and the script body in [`contents`](/docs/ref/object/sieve-system-script#contents).

A trusted script is invoked from an SMTP stage by setting the stage's `script` expression to the script's name. For example, the `script` field on [MtaStageRcpt](/docs/ref/object/mta-stage-rcpt), [MtaStageEhlo](/docs/ref/object/mta-stage-ehlo), or [MtaStageData](/docs/ref/object/mta-stage-data). Trusted scripts can also import each other using the `include` command.

For example, a system script that rejects messages from blocklisted HELO domains:

```json
{
  "name": "script_one",
  "description": "Reject blocklisted HELO domains",
  "isActive": true,
  "contents": "require [\"variables\", \"extlists\", \"reject\"];\n\nif string :list \"${env.helo_domain}\" \"list/blocked-domains\" {\n    reject \"551 5.1.1 Your domain '${env.helo_domain}' has been blocklisted.\";\n}\n"
}
```

<!-- review: The previous docs allowed the script body to be loaded from an external file through the configuration-file `file` macro (for example `contents = "%{file:/opt/stalwart-smtp/etc/sieve/my-script.sieve}%"`). With scripts stored through the JMAP API, the `contents` field takes the script text directly. Confirm whether there is still a supported way to load the script body from a file at create/update time (for example a CLI flag on `stalwart-cli create sieve-system-script`) and document it here if so. -->
