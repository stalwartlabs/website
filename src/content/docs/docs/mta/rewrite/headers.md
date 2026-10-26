---
sidebar_position: 3
title: "Headers"
description: "Adding, removing and changing header fields of messages with a DATA-stage Sieve script, with examples."
---

Header fields carry the information about a message that mail clients and filters read: who sent it, its subject, the software that produced it. Changing them as the message passes through the server serves several common purposes. Outgoing mail can lose header fields that reveal internal details. The subject of mail from outside the organisation can be tagged. And a message can receive a header that a later filter or a mail client acts on.

These changes are made by a system [Sieve script](/docs/sieve/interpreter/trusted) at the [DATA stage](/docs/mta/inbound/data#sieve-script), which runs before the message is queued. The script uses the `editheader` extension ([RFC 5293](https://www.rfc-editor.org/rfc/rfc5293)) to add, remove and change header fields. It is a [SieveSystemScript](/docs/ref/object/sieve-system-script), selected by the [`script`](/docs/ref/object/mta-stage-data#script) field of [MtaStageData](/docs/ref/object/mta-stage-data) (found in the WebUI under <!-- breadcrumb:MtaStageData --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Session › DATA Stage<!-- /breadcrumb:MtaStageData -->).

The extension provides two commands. `addheader` adds a field at the top of the header, or at the bottom when given `:last`. `deleteheader` removes every field with a given name, or, with the usual match types, only the fields whose value matches. Sieve has no command that changes a field in place, so a change is written as a `deleteheader` followed by an `addheader`.

Any of these changes can break a signature. When a received message carries a DKIM signature, changing a header field that the signature covers invalidates that signature.

## Adding a header

A header added by the server lets later steps tell kinds of mail apart. The following script marks every message received from an unauthenticated session:

```sieve
require ["editheader", "variables"];

if string :is "${env.authenticated_as}" "" {
    addheader "X-Origin" "external";
}
```

<!-- sievepad -->
<p><a href="https://sievepad.com/#w=NU7NSsRADH6VEDxWwWv35M2bBy_CziKxE2ugza6TtCsMAz6Xj-OTmO5iDoHvN6m4Yn_fodLM2OOz03Sm4pCPg_XwyJS5GPx-_8BDzqIjEHxcSOzQhiInN-z39T8_k-imHJcybLjw5yKFYZ-Qs_g1mrCDhCsVobeJLeFhlzSpvIN52W70YmG4qazrHS2RUpeBnPMrWUsYWqyaFGIo52trsC-3T0VG0YuFv5yL0pQw2ltSbIcOZzajkbefAxm7x71AtbU_" target="_blank" rel="noopener">Try this script in Sievepad</a></p>
<!-- /sievepad -->

## Removing headers

Some mail clients add header fields that reveal the user's software or address. The following script removes those fields from messages sent by authenticated users.

The script cannot remove the `Received` header that Stalwart itself adds, with the client's IP address, because that header is not visible to the script. That header is controlled instead by [`addReceivedHeader`](/docs/ref/object/mta-stage-data#addreceivedheader), whose default expression adds it only on port 25:

```sieve
require ["editheader", "variables"];

if not string :is "${env.authenticated_as}" "" {
    deleteheader "X-Originating-IP";
    deleteheader "User-Agent";
    deleteheader "X-Mailer";
}
```

<!-- sievepad { "environment": [ { "name": "authenticated_as", "value": "jane@example.org" } ] }
From: Jane <jane@example.org>
To: Bill <bill@example.com>
Subject: Meeting notes
User-Agent: ExampleMail/2.1
X-Originating-IP: [10.0.0.25]

The notes are below.
-->
<p><a href="https://sievepad.com/#w=dVHbShxBEP2VovBxd3SFvLQiGogkAYl4AWF7kdqZcmzpi-nuGQPDQL7Lz_FLrN4xiVmSbijoPlXn1KkasEe1mKEnx6jwMpN9opihCXVS8Jmp4Zjg5eczXLALvfEt3E-fOMNUR_OYE6rl8IvAkfEFCV2syzvy985EhqVGbkyeajXOQGNP0dDactK4OtBee3MHPmRIORYZZZIk7Qzs-4o6qfTZ1JS5uaU0ahRMwqA9yGnYcuaJXICb-bdoWuMpC9H8y7nGg3_mXSeO85NWmP-XcTM_I2NLx4KP2uO4mqHjlKjlv30zb8TEAKeKnX0_hNMYnIKv5BkOHyQe8w9yj5arENsj7a-Cgo_GWjhcS_wN1sEJeNmtH7jOCs4mBdgoaP-ndwWfporS6u5-tdB-ewAKlou9qtz9D6sy6qt7noiAZDlrtuGpenOXOJcqcTegzN7E4J2ovDe7vQ7x2pPtCrRtTyjH8RU" target="_blank" rel="noopener">Try this script in Sievepad</a></p>
<!-- /sievepad -->

## Changing a header

The following script prefixes the subject of messages from unauthenticated sessions with `[External]`. It skips messages whose subject already carries the prefix:

```sieve
require ["editheader", "variables"];

if allof (string :is "${env.authenticated_as}" "",
          header :matches "Subject" "*",
          not header :contains "Subject" "[External]") {
    set "subject" "${1}";
    deleteheader "Subject";
    addheader "Subject" "[External] ${subject}";
}
```

<!-- sievepad
From: Alice <alice@example.com>
To: Jane Doe <jane@example.org>
Subject: Invoice for October

The invoice is attached.
-->
<p><a href="https://sievepad.com/#w=ZVHNTgIxEH6VScNBDZBwLcZo_Il68YA3SszQHaCk22I7oMlmE5_Lx_FJnHVXgtjLtvv9ZqZSO6VHfRWwJKXVhNG_YWIoos0a7gkLShm-Pj7heoVh6cISEFY_v1VfZZvchrPS0-rXoUQXGiRuk23eiV63LhFMjaLCcSs1qg9G7TA5nHvKRs3GJpjgFoDexwWcZE5NlHZZeL2Kwm6IWxEHdhaZihfMtVGCiZMJsD-tPegS2a6oEU-28zVZ_iGfHbFD5L3CxsBS_VgyvX1nSgH9zKhTqFp1JhYoH9B61Uj6jFu4IE9MnfGBXQdjUfzH_kRBr-rMW9PaBFXP-qqknHFJf-btwi46S4NFTINoOc4pDan0hyu4S7HUcOWFBufYfC7pHcuNp6GN5YUJz1HDIwaCmyiMtdz2hJiWQuhqanho00DS4KlNaxb3vCLoioCsDJlRxl8Mu94yL5Z1Su-qrr8B" target="_blank" rel="noopener">Try this script in Sievepad</a></p>
<!-- /sievepad -->

The `:matches` test captures the current subject in `${1}`. The script saves that value in a variable before it deletes the field, and then adds the field again with the new value.
