---
sidebar_position: 4
title: "Body & Attachments"
---

Message rewriting is the process of modifying the content of the email messages as they pass through the system. This can include altering the body text of the message, adjusting or removing attachments, and other similar alterations. It's important to note that this rewriting is performed by the mail server and happens before the message is delivered to its final destination.

There are a variety of reasons why message rewriting can be useful. Here are a few examples:

- **Content Filtering:** In some environments, it's necessary to prevent certain types of content from being delivered. For instance, a company might want to prevent sensitive information from being sent out via email. In this case, a script could be set up to search for and remove or modify certain keywords or patterns within the email body or even within attachments.
- **Attachment Handling:** There might be security concerns with certain types of file attachments. A script can be used to strip out potentially harmful file types, reducing the risk of malware being spread through the email system.
- **Compliance and Legal Requirements:** Certain industries have regulations that require specific disclaimers to be included in all email communications. Rather than relying on each individual user to remember to include these disclaimers, they could be automatically added to the bottom of every outgoing email.
- **Branding and Uniformity:** Companies may want to ensure a consistent look and feel for their external communications. This could include appending a standard signature to all outgoing emails or formatting messages in a specific way.

Message content modification in Stalwart is done using [Sieve scripts](/docs/sieve/), a scripting language designed for mail filtering. A [range of extensions](/docs/development/rfcs#sieve) related to content modification is supported, giving administrators fine-grained control over message content. The Sieve script containing the content-modification commands is defined as a [SieveSystemScript](/docs/ref/object/sieve-system-script) object and referenced from the [`script`](/docs/ref/object/mta-stage-data#script) field on the [MtaStageData](/docs/ref/object/mta-stage-data) singleton (found in the WebUI under <!-- breadcrumb:MtaStageData --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></svg> MTA › Session › DATA Stage<!-- /breadcrumb:MtaStageData -->); see the [DATA stage](/docs/mta/inbound/data#sieve) documentation.

## Examples

### Adding a Disclaimer

The following Sieve script will add a disclaimer to the bottom of every outgoing email message. This is a simple example, but it demonstrates how Sieve can be used to add text to the body of an email message.

```sieve
require ["mime", "body"];

if not body :text :contains "disclaimer" {
    set "disclaimer" "\r\n\r\nThis is a disclaimer that will be added to the bottom of every outgoing email message.\r\n";

    extracttext "body";

    replace "${body}${disclaimer}";
}
```

<!-- sievepad { "noCapabilityCheck": true } -->
<p><a href="https://sievepad.com/#w=XVDLagMxDPwVIUJPS6FX95Smf9De4hwUW8maeu3U1iYNy0K_q5_TL6l2yQNqjGE0smZGAx7RPDWYqGM0-CYUT1QEfHbVwEv2Z3iApQi5tuMkFX6_f2DpfUh7IHgN1UUKHRdssLoSDlLRrIfruI5CmpjcFzfhwp99KAxri53-stiAxa2KWNw822RT2EHKAlMJjPCXgHE5iY6p2ulvchZhsAn0VJb_jEVri9Vx8_vehgp6Ce5NIC0JnEKMsGUg79mDZK2ySovkDvIO-MjlDLmXfZ7SsoaJ0HGttOfHiwLOricf6rWQk9nzNdONLHyI5FiJxTBR42K4mxnnxtEmHDcNXgSmNSrSdKLiinSneUUH2oYY5Lxq2X2gkdLzOP4B" target="_blank" rel="noopener">Try this script in Sievepad</a></p>
<!-- /sievepad -->


### Removing Attachments

The following Sieve script will remove any attachments that have a filename ending in `.exe` or that have a MIME type of `application/exe`. This is a simple example, but it demonstrates how Sieve can be used to remove potentially harmful attachments from email messages.

```sieve
require ["mime", "foreverypart", "replace"];

foreverypart
{
    if anyof (
        header :mime :contenttype :is
            "Content-Type" "application/exe",
        header :mime :param "filename"
            :matches ["Content-Type", "Content-Disposition"] "*.exe" )
    {
        replace "Executable attachment removed by system";
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
<p><a href="https://sievepad.com/#w=dVLbbhMxEP2VkR8QoGxCJYQqp0FcGkqQ-gCJKqG6D17vJHFZ24vtTXcVReK7-By-hHE3SRNELD94PDNnZs6ZNVsxftZjVhpknE2jLB-kj1A4FTh8cEULz-B9jFItDdoY4M-v3_ANjVtpuzh0sB4LyuuKXvx2vcMzUtvkcbVXyfb4s9Ye4VYwow0K1gPB5s7jCn1bUeHux2NVSkXuu6Gwwh4F2LWwQEfPQdrWzeF5Z6ezRFmgB56wgStnI7UW24oMHZ7C0hHsY-fOZuQXjD5kVZVayaidHWCTmjuFTI1IkzrXJaZJBTsG50ZGtcSQ5jwu0zsofKlD5YJO9WhScrzsP5aFFx3a-gl0SwjFjBtUdZR5iSD37JOfFMEC8hZCGyIawYZd9kZYumxz12MGQ5ALPBKoJWUybVdOK-yjKQ_F-uSdoR3QZZm0vsi7xztspKlK7FuMb4WdOQ5fpEW4dAgX9_TaBzi_oIBpnd-jihy-Ey5sSwl7PbkeZzfoA03P4az_SthDpjiYuow6KT4wusFiCLmrbSF9O0q7Qz-JdGGzrDP-yY7YxAFxpu0Q1FL6gJHy6jjPzru82RJ3zYAOWy6x6J9EPNwOpyLGLESP0gwhUUngexabx334j8r8QLIh7JbndOrMSxvm6LOxVa4g7jnkMuCb12mA6dVNyK_Ow-RzsVKm-TH5Ohrtm8-yreY0d6RE0ny92fwF" target="_blank" rel="noopener">Try this script in Sievepad</a></p>
<!-- /sievepad -->