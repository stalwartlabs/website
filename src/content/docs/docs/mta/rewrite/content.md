---
sidebar_position: 4
title: "Content"
description: "Changing the body and attachments of messages with a DATA-stage Sieve script: adding a disclaimer to outgoing mail without damaging multipart messages, and removing dangerous attachments."
---

Some policies require changing the content of a message as it passes through the server: adding a disclaimer to outgoing mail, for example, or removing a dangerous attachment. In Stalwart, these changes are made by a system [Sieve script](/docs/sieve/interpreter/trusted) at the [DATA stage](/docs/mta/inbound/data#sieve-script), before the message is queued. Such a script can add text to the body, replace or remove MIME parts, or wrap the message.

The script is a [SieveSystemScript](/docs/ref/object/sieve-system-script), selected by the [`script`](/docs/ref/object/mta-stage-data#script) field of [MtaStageData](/docs/ref/object/mta-stage-data) (found in the WebUI under <!-- breadcrumb:MtaStageData --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Session › DATA Stage<!-- /breadcrumb:MtaStageData -->). It works with the MIME extensions of [RFC 5703](https://www.rfc-editor.org/rfc/rfc5703), which let Sieve treat a message as a set of parts:

- `foreverypart` visits each part of the message in turn.
- `header :mime` tests the type of a part.
- `replace` replaces a part.
- The `${part.text}` variable holds the decoded text of the current part.

These extensions matter because most messages are multipart. A typical message holds a plain-text and an HTML version of the body, and often attachments as well. A script that changes the body must therefore change the right parts and leave the others alone. Replacing the whole message with text would destroy its HTML version and its attachments.

The direction of the mail matters too. The same DATA-stage script runs for mail received from other servers, so a script meant for outgoing mail must either test that the session is authenticated, or be selected only on the submission ports.

## Adding a disclaimer

The following script appends a disclaimer to the plain-text and to the HTML version of every message sent by an authenticated user. It leaves attachments unchanged, including attachments that are themselves text:

```sieve
require ["variables", "mime", "foreverypart", "replace"];

if not string :is "${env.authenticated_as}" "" {
    foreverypart {
        if header :mime :type :is "Content-Disposition" "attachment" {
            # Attachments are left unchanged
        } elsif header :mime :contenttype "Content-Type" "text/plain" {
            replace "${part.text}\r\n\r\n--\r\nThis message is confidential.\r\n";
        } elsif header :mime :contenttype "Content-Type" "text/html" {
            replace :mime "Content-Type: text/html; charset=utf-8\r\n\r\n${part.text}<p>This message is confidential.</p>\r\n";
        }
    }
}
```

<!-- sievepad { "environment": [ { "name": "authenticated_as", "value": "jane@example.org" } ] }
From: Jane <jane@example.org>
To: Bill <bill@example.com>
Subject: Quarterly figures
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="mixed"

--mixed
Content-Type: multipart/alternative; boundary="alt"

--alt
Content-Type: text/plain; charset="utf-8"

The figures are attached.
--alt
Content-Type: text/html; charset="utf-8"

<p>The figures are attached.</p>
--alt--
--mixed
Content-Type: text/csv; name="figures.csv"
Content-Disposition: attachment; filename="figures.csv"

quarter,revenue
Q3,1000
--mixed--
-->
<p><a href="https://sievepad.com/#w=rVTLbhshFP2VK9qlPXbUTYWdqOlLaqUsoljdhKjCM9ceImAmwExtWZb6Xf2cfkkv8_AjsbMqGjHAhXPu48CG1YxfDJiVBhlnd0HqX9IFyIrUc_hU2IA2wN_ff-A6y5RdgoRM-VRLZdCxAfOpU2XwjN9vegwjlY2WonJpnDt8qpRDuBeslk7JuUYv2AAEMwTSjhaFwxrduiTudsVhqWVK5oeJsMKqBdgigA8uOsGVpy1vN2jrRFYhJx9VKgNmP6XfCkY26jbCArVD6H4tNkLMUWbogEc_gId1iR1yF_fws_Jl4VVQhW1QZQgyzQ2Z9vh9ewPXO6sHSQFrXASobJpLu8Rsv3sLqP0L-rTlbLzYezCjaUMdcBVGlBJlX1J3uWpSEsNM4uatEE5Q6pp-OGz_s5ziM-i9XCLQkEgXKovpkzrpDrDJ_3A1D0af97QFOj7LYXdwApQ05zFcVmExfH8YyWGE0_Lq1YCmo_LqVFDtkH70se3DgHUARzJ-qogHnV4PF2pZOfQJGn2o66-uMBy-S4swfaT-A66kKTUmhVteUaoLDh-V1jCdU78zpoUh4101f8Q0cLjtWaBjEfbm282X4Q90nlTH4SIZC3ucJlPpoGIWRkatMJvAvKhsJt36Ml4pWiH521jzdnL2tNTEbGVQNR5h0HqPEIf2RJEaIe6rJFhbp-bULMc-mOYatJcGs-Q1wOOqH-E1VT4D2VS4hSWJnwu5YUh9PYFYW0LvK0prkePEdeewv-sT4tZ4-qiwnU4G8ZWxFQp7-25wMR6Pd95ExxqVUWSBXi9S2YbRy6VcYSP8oeieP2akt1rqKpqeS4wgt9t_" target="_blank" rel="noopener">Try this script in Sievepad</a></p>
<!-- /sievepad -->

The script uses `replace` in two forms, and they differ in how the new part is written.

Without `:mime`, `replace` replaces the part with a plain-text part that holds the given text. The text may need encoding for transport. When it contains 8-bit characters or a line longer than 998 octets, it is encoded as quoted-printable. When quoted-printable would be clearly larger, which is mostly the case for non-Latin text, it is encoded as base64 instead. In either case, the part is given the matching `Content-Transfer-Encoding` header field.

With `:mime`, the text is a complete MIME part, here an HTML part, and its header fields are written as given. Its body is encoded in the same way as above, unless the script supplies a `Content-Transfer-Encoding` header field itself, in which case the part is written exactly as given. Because the new HTML version holds the decoded text of the original part, an HTML body with non-ASCII characters is sent as quoted-printable. A `multipart` or `message` part supplied with `:mime` is always written as given, because MIME does not allow those types to be encoded.

The disclaimer follows the end of the HTML document, which is where mail clients display it. Messages attached as `message/rfc822`, such as a forwarded message, are not modified.

In a message with a single text part, that part is the message itself. In that case `replace` changes the body and the `Content-*` header fields. It keeps every other header field in its original order, including `Message-ID`, `In-Reply-To` and `References`, as RFC 5703 requires.

The script still has to be selected. The following `script` value selects it for authenticated sessions, here under the name `disclaimer`:

```json
{
  "script": {
    "match": {"0": {"if": "!is_empty(authenticated_as)", "then": "'disclaimer'"}},
    "else": "false"
  }
}
```

The disclaimer is added before the message is signed with DKIM, so the signature covers it.

## Removing attachments

The following script replaces executable attachments with a short notice and keeps the rest of the message:

```sieve
require ["mime", "foreverypart", "replace"];

foreverypart {
    if anyof (
        header :mime :contenttype :is "Content-Type" "application/x-msdownload",
        header :mime :param "filename" :matches ["Content-Type", "Content-Disposition"] "*.exe" )
    {
        replace "Executable attachment removed by the mail server.";
    }
}
```

<!-- sievepad
From: Billing <billing@example.net>
To: Jane Doe <jane@example.org>
Subject: Your invoice
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="mixed"

--mixed
Content-Type: text/plain; charset="utf-8"

The invoice is attached.
--mixed
Content-Type: application/octet-stream; name="invoice.exe"
Content-Disposition: attachment; filename="invoice.exe"
Content-Transfer-Encoding: base64

SGVsbG8sIHdvcmxkIQ==
--mixed--
-->
<p><a href="https://sievepad.com/#w=dVLdatswFH6Vg662ETsrjFGUZoytWZdBL9aEwqh6IcsniTpL8iQ5tQmBPdceZ0-yI5ym7iDGFzp_3znn-86ObRk_GzErDTLOFlFWj9JHKJ0KHD47G9FG-Pv7D9ygcVtt1yBjlGpjyB_YiAXldU0vfrd7AjFS2xRxjVfJ9vir0R7hTjCjDQo2AsFWzuMWfVdTt97jsa6kovD9RFhhhwmwExbo0yuQtnMreNXb6dugLNEDT9DAVT9x7GoydCDYww7ZklyCkUPWdaWVjNrZcZuZULpHWzlZ0hSnUGkGadLQusK0JOFwI6PaYEhbvWwxGjS91KF2QadetBcF3uTYpvLXfavdc8fD-pQza1E1URYVDrimOPGPJRQdxA0CkVxBQE8U5YJNepy9sPSz_f2IGQxBrvGFMB0pkmm7dVphjqYaivTFO8Phk66qpPFF0T8-YitNXWFuMX4Qduk4fJMW4dIhXDzQ65jg_JoSFk3xgCpy-EG4cGgl7PX8epbdog_EA4ez_K2wQ844mKaKOik9NrrFcgKFa2wpfTdNN0MewdJNZFlv_FcdsY1jYk_bCaiN9AEj1TVxlZ33dUsi7DAM0FH0rGKZn0Qc3ohTEWMWokdpJpCoJPAji0nN5-qB3nwg3gSeLud06dJLG1bos5lVriTuORQy4Pt3aYHF1W0ors7D_Gu5Vab9Of8-nR6Hz7KD5rR3pELSfLff_wM" target="_blank" rel="noopener">Try this script in Sievepad</a></p>
<!-- /sievepad -->

Each matching part is replaced with a plain-text part that holds the notice, and the other parts are unchanged.

Altering the message is one of several ways to deal with dangerous attachments. A script that refuses such messages instead of altering them is shown in [Sieve examples](/docs/sieve/examples#reject-messages-with-an-executable-attachment). The [spam filter](/docs/spamfilter/settings/mime-types) also scores dangerous attachments, without changing the message.
