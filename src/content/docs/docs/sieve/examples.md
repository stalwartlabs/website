---
sidebar_position: 9
title: "Examples"
---

This section collects example Sieve scripts that can serve as a starting point for custom rules. Each example is stored as a [SieveSystemScript](/docs/ref/object/sieve-system-script) record (found in the WebUI under <!-- breadcrumb:SieveSystemScript --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /><path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="M10 12.5 8 15l2 2.5" /><path d="m14 12.5 2 2.5-2 2.5" /></svg> Sieve › System Scripts<!-- /breadcrumb:SieveSystemScript -->), with the script source in its [`contents`](/docs/ref/object/sieve-system-script#contents) field, and invoked from the relevant SMTP stage by setting the stage's `script` expression to the script's [`name`](/docs/ref/object/sieve-system-script#name).

## Greylisting

The following script implements a greylisting filter backed by an SQL store. Install it as a system script named `greylist` and reference it from the [`script`](/docs/ref/object/mta-stage-rcpt#script) field on the [MtaStageRcpt](/docs/ref/object/mta-stage-rcpt) singleton (found in the WebUI under <!-- breadcrumb:MtaStageRcpt --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Session › RCPT TO Stage<!-- /breadcrumb:MtaStageRcpt -->) so that it runs at the `RCPT TO` stage.

```sieve
require ["variables", "vnd.stalwart.expressions", "envelope", "reject"];

set "triplet" "${env.remote_ip}.${envelope.from}.${envelope.to}";

if eval "!query('sql', 'SELECT 1 FROM greylist WHERE addr = ? LIMIT 1', [triplet])" {
    eval "query('sql', 'INSERT INTO greylist (addr) VALUES (?)', [triplet])";
    reject "422 4.2.2 Greylisted, please try again in a few moments.";
}
```

The first argument of [`query`](/docs/sieve/reference#query) names the SQL store that holds the `greylist` table, `sql` in the script above; passing the empty string selects the default data store. The `?` placeholders in the queries use SQLite or MySQL syntax; on PostgreSQL use `$1`, `$2`, ... instead, since the query is passed to the database driver verbatim.

The `script` field on MtaStageRcpt then selects the script by name:

```json
{
  "script": {"else": "'greylist'"}
}
```

## Domain blocklisting

The following script rejects messages whose `HELO`/`EHLO` domain is found in an SQL-backed list. Install it as a system script named `is-blocked` and reference it from the [`script`](/docs/ref/object/mta-stage-ehlo#script) field on the [MtaStageEhlo](/docs/ref/object/mta-stage-ehlo) singleton (found in the WebUI under <!-- breadcrumb:MtaStageEhlo --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Session › EHLO Stage<!-- /breadcrumb:MtaStageEhlo -->).

```sieve
require ["variables", "extlists", "reject"];

if string :list "${env.helo_domain}" "sql/blocked-domains" {
    reject "551 5.1.1 Your domain '${env.helo_domain}' has been blocklisted.";
}
```

<!-- sievepad { "environment": [ { "name": "helo_domain", "value": "spam.example.net" } ], "lists": [ { "name": "sql/blocked-domains", "values": [ "spam.example.net" ] } ] } -->
<p><a href="https://sievepad.com/#w=bZBBTsQwDEWvYllIsylBXXRTtnACVqNJhdLWzATStJOkZaQqEufiOJwEp2WkSkN23_55tv-ME5Z5hlZ1hCW-BGU-lQvQ9o0v4fmiusGQh5-vb3jqO6Ut1KZvPoz2QdsjZugbp4fgsTzMV0iypU4_uiZpR-dRO4KDxEk5rWomSsxAIl1CIv0pR-_UBInVo7TS6jfwwfEQKJOH-3cz2UmcyPSv7bJLlMhlfzYPy1LU3q915sEsLfBbmewqihwKkYsc9rwXrEbY3TJ3cFIeaqLNqdQKibxVlBZjlWFH3qsjpatZeQopDFYzMk273nZkwzaSzQBOZlJmTFU_qE7QmrGwFBb2Esj27z_3XRnJd0upYhXjLw" target="_blank" rel="noopener">Try this script in Sievepad</a></p>
<!-- /sievepad -->

The referenced `sql/blocked-domains` list is defined as a [StoreLookup](/docs/ref/object/store-lookup) against the SQL store, using the query `SELECT 1 FROM blocked_domains WHERE domain=? LIMIT 1` (on PostgreSQL the placeholder would be `$1` instead of `?`).

The `script` field on MtaStageEhlo then selects the script:

```json
{
  "script": {"else": "'is-blocked'"}
}
```

## Message modification

The following script modifies the incoming message, replacing the contents of each HTML MIME part with its uppercase form and adding a custom header to every part. Install it as a system script named `modify-message` and reference it from the [`script`](/docs/ref/object/mta-stage-data#script) field on the [MtaStageData](/docs/ref/object/mta-stage-data) singleton (found in the WebUI under <!-- breadcrumb:MtaStageData --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Session › DATA Stage<!-- /breadcrumb:MtaStageData -->).

```sieve
require ["envelope", "variables", "replace", "mime", "foreverypart", "editheader", "extracttext"];

if envelope :domain :is "to" "example.net" {
    set "counter" "a";
    foreverypart {
        if header :mime :contenttype "content-type" "text/html" {
            extracttext :upper "text_content";
            replace "${text_content}";
        }
        set :length "part_num" "${counter}";
        addheader :last "X-Part-Number" "${part_num}";
        set "counter" "${counter}a";
    }
}
```

<!-- sievepad { "envelopeTo": [ "jane@example.net" ] }
From: Alice <alice@example.com>
To: Jane <jane@example.net>
Subject: Quarterly newsletter
MIME-Version: 1.0
Content-Type: multipart/alternative; boundary="alt"

--alt
Content-Type: text/plain; charset="utf-8"

Welcome to the quarterly newsletter.
--alt
Content-Type: text/html; charset="utf-8"

<p>Welcome to the quarterly newsletter.</p>
--alt--
-->
<p><a href="https://sievepad.com/#w=jVPbahsxEP2VQeTRazdvRXZNSkmhBZeWmLYQmSBrx7aCLmut1olZDP2ufk6-pKO9xHZ6oWLxajxzzsycma3ZjvHLAXPSIuPsJkrzIEOE3KuSw_WjtIXBEp5-_IQZlqVcI1if65VWMmrv2ICVKugilozf1j2Llbrx-CqoZAfcVjog3AqGbofGFyjYAATbyaDlkhK0ZsDCSNX5rLbdbeUD7jDsCyqs_QdzHTcocwyd_RiDVDHSW7DFWDjh9Ar6XMBzn0oCrksKjl6wBtP0NnRIGKiFAzolRnIpX7mYuOkuBRu3vtMy-vh0KFNbC_BUM3DlCe1i3FPqRNZYWTIbxlTlaBOtOabtz0kfwKuiIM42_q5jeS6mP51kFHZRnwYeziIPx2vqkBt067ghUOrlzlW2Keyi7ho_B8s87_szskz6fM8-Ey77VNllp9JF3TOdY3_X85jkqCyVRw87LAbMtkt2tk7birgxmH3m8KE0SPqEIVpzumLvg7cc3hpNWkxkel31A1beToWbew4fpSPvPf1enUyfnDfV8h5V5PClTwXHVMLNPsyus68YStp4DpfDV8K966Y6p6lysJWJOikwkoYQjr6NHY5hSZ3mMuzf0BoZml3ayyxL1xf4ZiVokNqNQW1kINkIU8VV9rpFfUNDbSBED7T4sP1DmcN_cad1-wv1pJj-D_tkVEy7DFnWDYu4onZrGlb9_GHPPY2OvdSYLQ6HXw" target="_blank" rel="noopener">Try this script in Sievepad</a></p>
<!-- /sievepad -->

The `script` field on MtaStageData then selects the script:

```json
{
  "script": {"else": "'modify-message'"}
}
```
