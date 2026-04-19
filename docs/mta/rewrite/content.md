---
sidebar_position: 4
---

# Body & Attachments

Message rewriting is the process of modifying the content of the email messages as they pass through the system. This can include altering the body text of the message, adjusting or removing attachments, and other similar alterations. It's important to note that this rewriting is performed by the mail server and happens before the message is delivered to its final destination.

There are a variety of reasons why message rewriting can be useful. Here are a few examples:

- **Content Filtering:** In some environments, it's necessary to prevent certain types of content from being delivered. For instance, a company might want to prevent sensitive information from being sent out via email. In this case, a script could be set up to search for and remove or modify certain keywords or patterns within the email body or even within attachments.
- **Attachment Handling:** There might be security concerns with certain types of file attachments. A script can be used to strip out potentially harmful file types, reducing the risk of malware being spread through the email system.
- **Compliance and Legal Requirements:** Certain industries have regulations that require specific disclaimers to be included in all email communications. Rather than relying on each individual user to remember to include these disclaimers, they could be automatically added to the bottom of every outgoing email.
- **Branding and Uniformity:** Companies may want to ensure a consistent look and feel for their external communications. This could include appending a standard signature to all outgoing emails or formatting messages in a specific way.

Message content modification in Stalwart is done using [Sieve scripts](/docs/sieve/overview), a scripting language designed for mail filtering. A [range of extensions](/docs/development/rfcs#sieve) related to content modification is supported, giving administrators fine-grained control over message content. The Sieve script containing the content-modification commands is defined as a [SieveSystemScript](/docs/ref/object/sieve-system-script) object and referenced from the [`script`](/docs/ref/object/mta-stage-data#script) field on the [MtaStageData](/docs/ref/object/mta-stage-data) singleton (found in the WebUI under <!-- breadcrumb:MtaStageData --><!-- /breadcrumb:MtaStageData -->); see the [DATA stage](/docs/mta/inbound/data#sieve) documentation.

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


### Removing Attachments

The following Sieve script will remove any attachments that have a filename ending in `.exe` or that have a MIME type of `application/exe`. This is a simple example, but it demonstrates how Sieve can be used to remove potentially harmful attachments from email messages.

```sieve
require ["mime", "foreverypart", " "replace"];

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