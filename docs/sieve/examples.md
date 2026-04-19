---
sidebar_position: 9
---

# Examples

This section collects example Sieve scripts that can serve as a starting point for custom rules. Each example is stored as a [SieveSystemScript](/docs/ref/object/sieve-system-script) record (found in the WebUI under <!-- breadcrumb:SieveSystemScript --><!-- /breadcrumb:SieveSystemScript -->) and invoked from the relevant SMTP stage by setting the stage's `script` expression to the script's [`name`](/docs/ref/object/sieve-system-script#name).

## Greylisting

The following script implements a greylisting filter backed by an SQL store. Install it as a system script and reference it from the [`script`](/docs/ref/object/mta-stage-rcpt#script) field on the [MtaStageRcpt](/docs/ref/object/mta-stage-rcpt) singleton (found in the WebUI under <!-- breadcrumb:MtaStageRcpt --><!-- /breadcrumb:MtaStageRcpt -->) so that it runs at the `RCPT TO` stage.

```json
{
  "name": "greylist",
  "description": "Greylisting filter backed by SQL",
  "isActive": true,
  "contents": "require [\"variables\", \"vnd.stalwart.expressions\", \"envelope\", \"reject\"];\n\nset \"triplet\" \"${env.remote_ip}.${envelope.from}.${envelope.to}\";\n\nif eval \"!query(\\\"SELECT 1 FROM greylist WHERE addr = ? LIMIT 1\\\", [triplet])\" {\n    eval \"query(\\\"INSERT INTO greylist (addr) VALUES (?)\\\", [triplet])\";\n    reject \"422 4.2.2 Greylisted, please try again in a few moments.\";\n}\n"
}
```

The `script` field on MtaStageRcpt then selects the script by name:

```json
{
  "script": {"else": "'greylist'"}
}
```

## Domain blocklisting

The following script rejects messages whose `HELO`/`EHLO` domain is found in an SQL-backed list. Install it as a system script and reference it from the [`script`](/docs/ref/object/mta-stage-ehlo#script) field on the [MtaStageEhlo](/docs/ref/object/mta-stage-ehlo) singleton (found in the WebUI under <!-- breadcrumb:MtaStageEhlo --><!-- /breadcrumb:MtaStageEhlo -->).

```json
{
  "name": "is-blocked",
  "description": "Reject blocklisted HELO domains",
  "isActive": true,
  "contents": "require [\"variables\", \"extlists\", \"reject\"];\n\nif string :list \"${env.helo_domain}\" \"sql/blocked-domains\" {\n    reject \"551 5.1.1 Your domain '${env.helo_domain}' has been blocklisted.\";\n}\n"
}
```

The referenced `sql/blocked-domains` list is defined as a [StoreLookup](/docs/ref/object/store-lookup) against the SQL store, using the query `SELECT 1 FROM blocked_domains WHERE domain=? LIMIT 1`.

The `script` field on MtaStageEhlo then selects the script:

```json
{
  "script": {"else": "'is-blocked'"}
}
```

<!-- review: Confirm the correct object for defining the SQL-backed `blocked-domains` named query used by `:list "sql/blocked-domains"`. Previously this was `store."sql".query.blocked-domains`; verify that StoreLookup is the intended replacement and that the `sql/<name>` reference in Sieve still resolves against it. -->

## Message modification

The following script modifies the incoming message, replacing the contents of each HTML MIME part with its uppercase form and adding a custom header to every part. Install it as a system script and reference it from the [`script`](/docs/ref/object/mta-stage-data#script) field on the [MtaStageData](/docs/ref/object/mta-stage-data) singleton (found in the WebUI under <!-- breadcrumb:MtaStageData --><!-- /breadcrumb:MtaStageData -->).

```json
{
  "name": "modify-message",
  "description": "Uppercase HTML parts and annotate each MIME part",
  "isActive": true,
  "contents": "require [\"envelope\", \"variables\", \"replace\", \"mime\", \"foreverypart\", \"editheader\", \"extracttext\"];\n\nif envelope :domain :is \"to\" \"example.net\" {\n    set \"counter\" \"a\";\n    foreverypart {\n        if header :mime :contenttype \"content-type\" \"text/html\" {\n            extracttext :upper \"text_content\";\n            replace \"${text_content}\";\n        }\n        set :length \"part_num\" \"${counter}\";\n        addheader :last \"X-Part-Number\" \"${part_num}\";\n        set \"counter\" \"${counter}a\";\n    }\n}\n"
}
```

The `script` field on MtaStageData then selects the script:

```json
{
  "script": {"else": "'modify-message'"}
}
```
