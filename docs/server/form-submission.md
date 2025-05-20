---
sidebar_position: 11
---

# Form Handling

Stalwart offers a **Form Submissions** feature, which allows you to receive form submissions via HTTP and automatically turn them into email messages. This feature is particularly useful for web forms, such as contact forms or feedback forms, where submissions need to be forwarded to a designated group of local recipients on the mail server. The form data is sent via a **POST** request to the `/form` endpoint, and the server processes this data, converting it into an email message.

This feature is limited to **local recipients only**, meaning that email messages generated from form submissions can only be delivered to users within the mail server. External recipients (such as email addresses outside your domain) are not allowed to prevent misuse and ensure that the feature is used for internal purposes.

## Security Features

To prevent abuse and spam, the Form Submissions feature includes two key security mechanisms:

- **Rate limiting** is applied on a per-IP address basis to restrict the number of form submissions a client can send within a specified time frame. This measure helps to protect the mail server from being overwhelmed by automated bots or malicious users who might attempt to flood the server with form submissions. By limiting the rate of submissions from any single IP address, Stalwart can ensure that legitimate traffic is prioritized, while potentially abusive requests are throttled.
- A **honeypot field** is a hidden form field that is invisible to human users but visible to bots. It is a common anti-spam technique used to detect and block automated submissions. Legitimate users won’t see or fill out the honeypot field, but bots, which often attempt to fill out every field in a form, will interact with it. If the honeypot field is filled out, the server will flag the submission as likely spam and discard it. This method helps to filter out automated submissions without requiring users to deal with more intrusive anti-spam measures like CAPTCHAs.

## Configuration

The Form Submissions feature in Stalwart allows HTTP POST form data submitted to the `/form` endpoint to be converted into emails and sent to a list of local recipients. This feature is configurable with several settings to control the size, validation, rate limiting, and email formatting. Below is an explanation of each configuration field and what it does.

- `form.enable`: This setting enables or disables the form submissions feature. When set to `true`, the mail server will accept and process form submissions made via the `/form` endpoint. If set to `false`, the feature is disabled, and the server will not process any form data.
- `form.max-size`: This setting controls the maximum size (in bytes) of the form data that can be submitted. It limits the total size of the form to ensure that excessively large submissions are not processed, which helps protect the server from resource overload.
- `form.validate-domain` When this setting is enabled (`true`), the server will validate the domain in the submitted email address to ensure it matches a valid external domain.
- `form.rate-limit`: This setting applies rate limiting to form submissions based on the IP address of the submitter. The value defines the number of form submissions allowed over a specific time period. For example, you can configure the server to allow a maximum of 5 form submissions per hour per IP address. This helps protect against abuse and spam by limiting the frequency of submissions.
- `form.deliver-to`: This setting defines the email address (or addresses) of the **local recipient(s)** to whom the email generated from the form submission will be delivered. The email must be a valid local address within the Stalwart, as the form submissions feature does not allow external recipients for security reasons.
- `form.email.field`: This setting specifies the name of the form field that contains the sender’s email address. The value of this form field will be used as the "From" address when generating the email.
- `form.email.default`: In cases where the form submission does not include an email address in the specified form field, this default email address will be used as the "From" address in the generated email. This ensures that the email submission can still be processed even if the email field is missing or empty.
- `form.honey-pot.field`: The honeypot field is a hidden form field used to detect spam bots. This setting specifies the name of the honeypot field in the form. If a bot fills out this field, which legitimate users will not see or interact with, the form submission is flagged as spam and discarded, helping prevent automated abuse.
- `form.name.field`: This setting defines the name of the form field that contains the sender’s name. The value from this field will be used in the email’s "From" header to identify the sender by name.
- `form.name.default`: If the form submission does not include a name in the specified form field, this default value will be used as the sender’s name. This ensures that the generated email always includes a name, even if the user leaves this field blank.
- `form.subject.field`: This setting defines the name of the form field that contains the subject of the email. The value of this field will be used as the subject line of the generated email.
- `form.subject.default`: If the form submission does not include a subject in the specified form field, this default value will be used as the email's subject line. This ensures that all form submissions have a relevant subject, even if the submitter leaves this field empty.

Example:


```toml
[form]
enable = true
max-size = 10240
validate-domain = true
rate-limit = "5/1h"
deliver-to = ["jane@example.org", "john@example.org"]

[form.email]
field = "email"
default = "unknown@sender.org"

[form.honey-pot]
field = "subject"

[form.name]
field = "name"
default = "Anonymous"

[form.subject]
field = "subject"
default = "Contact Form"
```
