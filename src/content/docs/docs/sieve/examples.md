---
sidebar_position: 9
title: "Examples"
description: "Example Sieve scripts: system scripts that reject or check messages during the SMTP session, and user scripts that file, forward and answer mail at delivery."
---

Most filters follow a handful of patterns, and a working script is easier to adapt than a blank page. The examples on this page are starting points for common filters, grouped by who installs them.

The first group are system scripts. An administrator installs each one as a [SieveSystemScript](/docs/ref/object/sieve-system-script) and selects it from an SMTP stage, as described in [Trusted interpreter](/docs/sieve/interpreter/trusted). The second group are user scripts. A user uploads them over [ManageSieve or JMAP](/docs/sieve/user-scripts), and they run at delivery to that user's mailbox.

Examples that run in [Sievepad](https://sievepad.com) are followed by a link that opens them with a matching test message, so each one can be tried before it is installed.

## System scripts

System scripts enforce policy while the message is still being received, so most of them end in a `reject`. A system script refuses a command or a message with `reject`. The reject text becomes the SMTP reply only when it starts with a three-digit reply code followed by a space ([Replies and actions](/docs/sieve/interpreter/trusted#replies-and-actions)). Every example below therefore starts the reject text with a full reply code.

### Reject clients with a blocklisted EHLO domain

A client that announces a known bad name in its EHLO command can be turned away before it sends anything. The following script rejects a client whose EHLO domain is listed in the `blocked-domains` [lookup list](/docs/configuration/expressions/lookup/). Install it as a system script named `block-helo`, and select it from the [`script`](/docs/ref/object/mta-stage-ehlo#script) field of [MtaStageEhlo](/docs/ref/object/mta-stage-ehlo):

```sieve
require ["variables", "extlists", "reject"];

if string :list "${env.helo_domain}" "blocked-domains" {
    reject "550 5.7.1 Your domain '${env.helo_domain}' has been blocklisted.";
}
```

<!-- sievepad { "environment": [ { "name": "helo_domain", "value": "spam.example.net" } ], "lists": [ { "name": "blocked-domains", "values": [ "spam.example.net" ] } ] } -->
<p><a href="https://sievepad.com/#w=ZZDBSsQwEIZfZRiEvdTiHopQzwseFgQ9yaZI2o7baJrWJO0ulILP5eP4JE7aLRQ3t5nMfP8__4A9ptsIjawJU3zxUp-k9VA2hUthd5Z1q8nB7_cPPNMHFR4Krch4ByflK5CQ66b41Mp5KmH3uH_izVoqgxG6wqrWO0wPw4JffprOFqG29NUpS3AQ2EurZM5aAiMQSGcfoJfKTtICswdhhFHv4LxV5ghpmOH_m4FMH1ekm7dZfhTI7ckblbdzj1kwCAP8Zh5PJMkdJPF9vIVX9nTxDptr3gYq6SAnMuuLY4HsaBQGxyzCmpyTRwoXc-XIe_bI1YBMU7YxNQe3jmMlwKn0Uneh61pZxzQnHxvyE3sKY73777ZlP8xcE7IxG8c_" target="_blank" rel="noopener">Try this script in Sievepad</a></p>
<!-- /sievepad -->

The `script` field then names the script:

```json
{
  "script": {"else": "'block-helo'"}
}
```

The list is a set of [MemoryLookupKey](/docs/ref/object/memory-lookup-key) entries with the namespace `blocked-domains`, one per domain. Lists held in an SQL store work differently. They cannot be tested with `:list`, so a script that needs them calls the [`query`](/docs/sieve/reference#query) function.

### Require the From header to match the sender of authenticated mail

An authenticated user could otherwise send mail whose visible sender is someone else. The [`mustMatchSender`](/docs/mta/inbound/auth#sender-verification) check compares the envelope sender of an authenticated submission with the addresses of the account. It does not look at the `From` header, which is what recipients see.

The following script closes that gap at the DATA stage. It requires the `From` header of authenticated submissions to carry the envelope sender, which `mustMatchSender` has already verified. Install it as a system script named `from-header`, and select it from the `script` field of [MtaStageData](/docs/ref/object/mta-stage-data):

```sieve
require ["variables", "envelope", "reject"];

if not string :is "${env.authenticated_as}" "" {
    if not address :all :comparator "i;unicode-casemap" :is "from" "${envelope.from}" {
        reject "550 5.7.1 The From header must match the sender address.";
    }
}
```

<!-- sievepad { "envelopeFrom": "jane@example.org", "environment": [ { "name": "authenticated_as", "value": "jane@example.org" } ] }
From: CEO <ceo@example.org>
To: Accounts <accounts@example.com>
Subject: Urgent payment

Please pay the attached invoice today.
-->
<p><a href="https://sievepad.com/#w=bVLbbtswDP0VQthjaqwPwQClGDYU3euGtX2qgoGVmUSFLp5EuysM__sox-vSi2DYlnjIc3ioUQ1Kn69UxEBKq2tG_4iZoU22aPhJv3uXCfhA8C2nAAfCljJwgoBsD3OgUKxnaQfYyz6ys8jUCsJ5tVLFZtdxUfpu_McikVgjqc-27vNCc2fUgNnhvadi1AqMojiQTx0dd5keyLJR242JJrodxMRQOLu4B-2KID6MktG80PELy2SUxOQ1mgiylkxs20ylgEbvQdsUOszIKQvWbfrobGrpzGKhgJ0kHxl2YsNcbqaaxTX1bPpfvq6jVIGt1x9h3XxqzuHmlYmhL_zWxkVUY9TmWG0yUR41bVcqSAD39MLLPu-l1bMOn4J8Gwr-1NnKp-Hy6jtcWEpf6A-GzlOT8v6ziTdJw1drUx-5wAUuf88gMURA1_197UTD7UwEC1EdwA9PYk49mRtAZrQHGbyLQ3JWbk1q8alZtBdiljmJ9vF5qlWdiHzASKfSpAFBuJxiZTpt9vVgBTmg7-m9ItN2mv4C" target="_blank" rel="noopener">Try this script in Sievepad</a></p>
<!-- /sievepad -->

The script tests `env.authenticated_as` first, so unauthenticated messages are not affected. Messages that list several addresses in the `From` header pass when one of them is the envelope sender. [Addresses, aliases and catch-all](/docs/domains/addresses) describes the addresses an account may send from.

### Reject messages with an executable attachment

The spam filter treats dangerous attachments as evidence: it adds them to the score of a message. Some sites prefer a hard rule instead. The following script, run at the DATA stage, rejects messages that carry an attachment whose name ends in `.exe`, `.scr` or `.js`, which refuses the message outright whatever its score:

```sieve
require ["mime", "foreverypart", "reject"];

foreverypart {
    if header :mime :param "filename" :matches "Content-Disposition" ["*.exe", "*.scr", "*.js"] {
        reject "550 5.7.1 Executable attachments are not accepted.";
        stop;
    }
}
```

<!-- sievepad
From: Alice <alice@example.com>
To: Jane <jane@example.org>
Subject: Invoice
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="mix"

--mix
Content-Type: text/plain; charset="utf-8"

Invoice attached.
--mix
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="invoice.exe"

AAAA
--mix--
-->
<p><a href="https://sievepad.com/#w=bVJBbtswEPzKgsfAkuOD0YJuiwZtCqRALk3QS5jDml7bNERSJVeODcNA39Xn9CVdRlZiFCEEidSQO7MzPKit0pORCuhJaXXH2DxhYlhEmzVc79C3DWX4-_sP_KANWQZPOeNK_j05XgMGoB3ZjnHeECAz2rWnwGqksk2u5az0w2Eo79GFgsQu2bJO9KtzieDBKO88GTUCo5Yx0ZbSvhUd_Z_0zGzU48wEE85xOJgAMtwS1oQLSqBLIdACoi_FXEOF3ChBkO1ahBv1JQYWkdVXl9uYHbsYZIOouKilm570opYGhukmC_tAVkYvSbDp9BKm9bt6Ima94UMGlP5CZEBrqWVa1EbNXutkju1peTRBHnV8HKnB43PvXNhGZ6km35xb-C1Fr-GqEQg-YPl8pj612kb_yYT7qOE7BkE38n4BY1oJeNfNSx8abvrqJtze3F5XPyll8UTDpL40YXDrft-SBt817Ir3Y-92tJjBPHZhgWn_sYS4M6pkVFVl-t9Jph2P20buwAzsGlMmljMdL6v3_amTiJN9xaq3C2HbSqNYYhtHy8RV5kToX_edBavP0pjBcB-E-MXQknihv5JxYqyqUxKikV1YSRKH4_Ef" target="_blank" rel="noopener">Try this script in Sievepad</a></p>
<!-- /sievepad -->

Two common tasks need no example here. Adding a disclaimer, or otherwise changing the content of outgoing messages, is described in [Content rewriting](/docs/mta/rewrite/content). Greylisting needs no script, because it is built into the SMTP server, as described in [Greylisting](/docs/spamfilter/greylist).

## User scripts

User scripts organise mail rather than refuse it. They run once for each message delivered to the user, after the spam filter has scored it. A script that ends without filing the message keeps it in the inbox, or in the Junk folder when the spam filter classified it as spam.

### Automatic reply

An out-of-office reply is the most common user script. The following script answers each sender at most once every seven days while the user is away:

```sieve
require ["vacation"];

vacation :days 7 :subject "Out of office"
  "I am out of the office until 3 November and will reply when I return.";
```

<!-- sievepad
From: Alice <alice@example.com>
To: Jane <jane@example.org>
Subject: Project update

Is Monday still good for the review?
-->
<p><a href="https://sievepad.com/#w=VZDdSgMxEIVfZZjrWhAvhChqLxQq-AP1rulFmp1uU5LMmp9dSyn4XD6OT2LWbYtCSDj5SM45s8MWxfkIvXKEAmdJ2U6FBBXrKOD-Q7nGUoTvzy-Y5MROJaMhUGO3OMKog2lSRDHfHT9wyviecA6614HeswkEc4mt0uU1e4mLK-mlP2oQldpGuAQR83JDOoHEl5yAV2WtjCaJ0kO5nIJywANJazpQyD4ZCxfwzC25JQVQvoLOWDvkhG5NHqZFpBz8WGIxx_1ihI5iVDX9i98E7hOc5aZSicbk7N8yD4GdgIntXa9Vf9zRMKGxZncj_RsLeFS-0E3ZT5BDXeBsaCfgdTCBwaQfxTTCE_syBoipD14zV7Di8FszUGuouz2kjpSS8XVJvdvvfwA" target="_blank" rel="noopener">Try this script in Sievepad</a></p>
<!-- /sievepad -->

The reply is sent with an empty envelope sender. It is not sent to mailing lists, or in answer to messages that are themselves automatic replies, which prevents loops between two absent users. JMAP clients usually configure the same reply through the vacation response, described in [Vacation responses](/docs/sieve/user-scripts#vacation-responses).

### File mailing list messages

Mailing list traffic is easier to read when each list has its own folder. The following script files messages from mailing lists into a folder named after the list, creating the folder when it does not exist:

```sieve
require ["fileinto", "mailbox", "variables"];

if header :matches "List-Id" "*<*.*>*" {
    fileinto :create "Lists/${2}";
}
```

<!-- sievepad
From: Release Announcements <announce@lists.example.com>
To: announce@lists.example.com
List-Id: Release announcements <releases.lists.example.com>
Subject: Version 2.4 released

Version 2.4 is available.
-->
<p><a href="https://sievepad.com/#w=dZHPSgMxEMZfZQielt0VS0-xFD1YEDxZ8dL0kGanbSR_aia7FpYFn8vH8UnMslutoDnNJB-_me9LyxrGr3LmpEXG2TJK8yZDhMor4nB3lPZgkODz_QMW2iBYqY12OzCaIlgkkjskljNSQR8iMb5qT6wkdf2Lr4Pq-4CvtQ4IK8G2CaVd9ILlIHqh2fjj0DQyaLlJMwVbXwsnnN7CHmWFAbiVUe3TNoI9pPHFfSVYqrNZVmbzLNWtcJDOiQ5cBZQRRz1dXrSTTrBE7YRj3Tpn3wbO1m4wkPaumBTTIqBBSViVaM25lUXwlsPj8Aq3zvnaKbToIsFMju1NnxGVOGRYKm_nwj15Dv8LhBuN_cDlb_i4EZV_wZf15gVV5PA8eIBJOYWThz7L83tNIJuUfB92OeZBGGP63ZRH23Vf" target="_blank" rel="noopener">Try this script in Sievepad</a></p>
<!-- /sievepad -->

For the header `List-Id: Release announcements <releases.lists.example.com>`, the message is filed into `Lists/releases`.

### File suspected spam into a review folder

Some users prefer to review likely spam separately from the Junk folder. The following script files messages that the spam filter considers likely spam into a `Spam review` folder:

```sieve
require ["fileinto", "mailbox", "spamtest", "relational", "comparator-i;ascii-numeric"];

if spamtest :value "ge" :comparator "i;ascii-numeric" "5" {
    fileinto :create "Spam review";
}
```

<!-- sievepad { "spamScore": 8 }
From: Offers <offers@example.net>
To: Jane <jane@example.org>
Subject: You have won

Claim your prize now.
-->
<p><a href="https://sievepad.com/#w=ZVG9TgMxDH4VK_O1EgMSSiuEhOjAwlAW1HRwr76SKokPJ3ctVJV4Lh6HJyHhKD8igyPb8ffjHFSv9FmlAnpSWs0Tuh1KgjXXUcPNHn3rKML76xvMrCOIXWypTrSG2KIHGxIDglBvaQcNuzWJqlSsxbYpKr04nJA92lA63EldcqGnzgrBwqgmAxcgoyow5aFb8X5ICkmimIZMyGGyHNANec2-RcHEMrITjLW1o9B5ElsbtZyYYIJt4AQBukfXUR7bkFGgf4Zz6d94rp3neDAB8jkpzFNCmArIvNgffBuVuY4mqOOyUp5ixA398f7M3egRexrtOIzJu997mAl7DXdNQxJhyp_3FQ17HwdKlybcs4ZbDATTbY7fTZZNbs671TZ_iIYH7qCQQCYp1q8dWg-ZWqAV-0IQeDf-EhkpJRs2WeThc8XzmiWLuTgePwA" target="_blank" rel="noopener">Try this script in Sievepad</a></p>
<!-- /sievepad -->

The `spamtest` value is a number from `1` (not spam) to `10` (spam), and `5` corresponds to the spam threshold of the [spam filter](/docs/spamfilter/). A message filed by the script stays where the script put it, and is not moved to the Junk folder.

### Forward a copy

Forwarding sends mail on to another mailbox, for example a personal address. The following script forwards a copy of every message to another address, and keeps the original in the mailbox:

```sieve
require ["copy"];

redirect :copy "jane.doe@example.net";
```

<!-- sievepad
From: Alice <alice@example.com>
To: Jane <jane@example.org>
Subject: Project update

Is Monday still good for the review?
-->
<p><a href="https://sievepad.com/#w=VY7dSgMxEIVfZZjrdcHbWPy5sKAgCPWu6UVMxjVlk1kn2dayLPhcPo5PYkK16NUwc-ac70y4Q3XeYDSBUOEqm35vJINjmxTcvpsw9JTg6-MTlixFcmDA8nDABpMVP-SEaj39-oPxsSo8iq270NvohWCtsZo0bi501FHIlavNoOoVNG5NpNYxXdOR2EbKGssvzpsGA6VkOvpHGoS3JeFsHJzJ1FLo_3KXwkHBTe8twcLUcUq2HC51fGIF9wUKi4o-iSxdEVfjc81W8HiEwBFSm98leODozAFS9n0PHbODFxbIrwRCO0_7q5_WiXL2sSutp3n-Bg" target="_blank" rel="noopener">Try this script in Sievepad</a></p>
<!-- /sievepad -->

The `:copy` argument makes the difference between forwarding a copy and moving the message. Without it, the message is forwarded and not stored. The number of forwards per message is limited by [`maxRedirects`](/docs/ref/object/sieve-user-interpreter#maxredirects), <!-- default:SieveUserInterpreter.maxRedirects -->1<!-- /default --> by default.

Forwarding has a known weakness with sender authentication. The forwarded copy keeps the original sender, and Stalwart does not rewrite it with the Sender Rewriting Scheme (SRS), a technique that replaces the envelope sender with an address of the forwarding server. The receiving server may therefore find that Stalwart is not authorised by the sender's SPF record. When the sender's domain also enforces DMARC, and the message carries no valid aligned DKIM signature, the receiving server may reject the copy.

### File by sub-address

Many users give out addresses with a sub-address, such as `jane+shop@example.org`, to see who uses which address and to sort the replies. The following script files messages sent to such an address into a folder named after the sub-address:

```sieve
require ["fileinto", "mailbox", "variables", "subaddress"];

if address :detail :matches ["to", "cc"] "*" {
    if not string :is "${1}" "" {
        fileinto :create "${1}";
    }
}
```

<!-- sievepad
From: Shop <orders@shop.example.com>
To: Jane <jane+shop@example.org>
Subject: Your order has shipped

Your order is on its way.
-->
<p><a href="https://sievepad.com/#w=VVC7bsMwDPwVQujU2gayKkGRpRm6uksRZZBlJlZgSa4k5wHDQL-rn9MvKR3bbUoIEige73js2InxRcKsNMg4y6Osz9JHKJ0KHF4u0jQ1Bvj-_IKNrhGKK4S2SGVZegyBJSwor5sYGN92M4mR2g4V13o15B4_Wu0RtoLtiUPb6ARLQAzAunCXMTlJr2VBYmNKKpOIYLulsMLqPUw_wEuM1AvcyKgqmo-oZ1KlqIHeR8GgExYoqNO6CCF6bQ_AdaDyQ7foCSHYH2yIeUDgyqOM-ItcjpheWDqs3yXM0CTygP-sX8lz6nyJPq1kSEOlmwbLDE19v5CNd4ZDXrkGVjdwWAdKMhzXnSlnnoV9cxxepUVYHel-GhDrGeH8gRB5WxxRRQ7vxAw3JiBZmGSHpd1VyLazoGOAs7xmk4mAMdJSyETX9z8" target="_blank" rel="noopener">Try this script in Sievepad</a></p>
<!-- /sievepad -->

The script tests the `To` and `Cc` headers rather than the envelope. The envelope recipient cannot be used for this, because Stalwart removes the sub-address from the recipient when it accepts the message, as described in [Addresses, aliases and catch-all](/docs/domains/addresses).
