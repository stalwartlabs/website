---
sidebar_position: 8
title: "Form submission"
description: "Turn submissions of a web form, such as a contact form, into email messages delivered to local mailboxes: configuration, an example form, abuse protection and the responses."
---

Many websites have a contact or feedback form whose submissions must end up in someone's mailbox. Usually the website sends them by email itself, which needs a mail library and SMTP credentials on the web server. The form endpoint removes that step. The HTML form posts directly to Stalwart, which validates the submission, turns it into an email message and delivers it to a fixed set of local recipients.

## Configuration

The endpoint is configured on the [HttpForm](/docs/ref/object/http-form) singleton (found in the WebUI under <!-- breadcrumb:HttpForm --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › HTTP › Contact Form<!-- /breadcrumb:HttpForm -->).

Setting [`enable`](/docs/ref/object/http-form#enable) turns the endpoint on, and [`deliverTo`](/docs/ref/object/http-form#deliverto) lists the addresses that receive the messages. The set must not be empty. Enabling the endpoint without recipients is a configuration error, and the endpoint then stays off.

The sender and the subject of each message come from the submission. [`fieldEmail`](/docs/ref/object/http-form#fieldemail), [`fieldName`](/docs/ref/object/http-form#fieldname) and [`fieldSubject`](/docs/ref/object/http-form#fieldsubject) name the form fields that carry the sender's address, the sender's name and the subject. A field may not be configured, or a visitor may leave it empty. The message then falls back to [`defaultFromAddress`](/docs/ref/object/http-form#defaultfromaddress), [`defaultName`](/docs/ref/object/http-form#defaultname) and [`defaultSubject`](/docs/ref/object/http-form#defaultsubject). Unless changed, these are <!-- default:HttpForm.defaultFromAddress -->`postmaster@localhost`<!-- /default -->, <!-- default:HttpForm.defaultName -->`Anonymous`<!-- /default --> and <!-- default:HttpForm.defaultSubject -->`Contact form submission`<!-- /default -->.

The remaining fields protect the endpoint, as described in [Abuse protection](#abuse-protection). [`fieldHoneyPot`](/docs/ref/object/http-form#fieldhoneypot) names a hidden field used to detect bots. [`maxSize`](/docs/ref/object/http-form#maxsize) limits the size of a submission, and [`rateLimit`](/docs/ref/object/http-form#ratelimit) limits the submissions from one IP address. [`validateDomain`](/docs/ref/object/http-form#validatedomain) turns on the checks of the sender's address.

The following configuration delivers submissions to two mailboxes:

```json
{
  "enable": true,
  "deliverTo": {"sales@example.org": true, "info@example.org": true},
  "fieldEmail": "email",
  "fieldName": "name",
  "fieldSubject": "subject",
  "fieldHoneyPot": "website",
  "maxSize": 10240,
  "rateLimit": {"count": 5, "period": 3600000}
}
```

## Recipients

The recipients come only from `deliverTo`. Nothing in a submission can add or change a recipient, so the endpoint cannot be used to send mail to arbitrary addresses.

Messages are delivered only into local mailboxes. An address in `deliverTo` that is not a local account, such as a remote address, a mailing list or a disabled address, is not delivered to, and nothing is relayed. The addresses are not checked when the configuration is saved. A submission succeeds when at least one recipient received it.

## Example form

The endpoint accepts `POST` requests to `/form` and to any path below it, with the fields encoded as `application/x-www-form-urlencoded` or `multipart/form-data`. The following form matches the configuration above:

```html
<form action="https://mail.example.org/form" method="post">
  <input type="text" name="name" placeholder="Name">
  <input type="email" name="email" placeholder="Email" required>
  <input type="text" name="subject" placeholder="Subject">
  <textarea name="message"></textarea>
  <input type="text" name="website" style="display:none" tabindex="-1" autocomplete="off">
  <button type="submit">Send</button>
</form>
```

Every field of the submission goes into the body of the message, as one `field: value` line, including fields not named in the configuration, such as `message`. The date and the client's address follow. The message carries the header `Auto-Submitted: auto-generated`, and it is processed like other unauthenticated mail.

A submission can be tested with `curl`:

```sh
curl -i https://mail.example.org/form \
  -d name=Jane -d email=jane@example.com -d subject=Hello -d message='Test message'
```

## Responses

The endpoint answers with JSON. On success, it returns `{"data":{"success":true,"details":null}}` with status `200`. Otherwise it returns `"success":false`, with a reason in `details` and status `400`. The reasons include:

- `Please enter a valid email address.` or `No MX records found for domain "<domain>". Please enter a valid email address.`: the sender's address failed validation.
- `Empty form`: every field was empty.

Some submissions are refused before they are processed. A submission whose hidden field was filled in, one larger than `maxSize`, and one without a recognisable content type are refused with `400` and a JSON problem body. For the hidden field, the detail of that body is `Honey pot field present`. A client over the rate limit receives `429`.

## Abuse protection

Submissions come from anonymous visitors, so the endpoint protects itself in three ways: it limits how often each address can submit, filters out bots and checks the sender's address.

The rate limit allows each IP address `rateLimit` submissions per period, <!-- default:HttpForm.rateLimit -->5 per hour<!-- /default --> unless changed. A few tests in a row from one address are therefore enough to reach it. Loopback addresses are exempt. The general anonymous HTTP [rate limit](/docs/http/settings#rate-limiting) applies as well.

The honeypot field catches bots. It is a field that is hidden from people with CSS but present in the HTML, such as `website` above. Human visitors never see it and leave it empty, while many bots fill in every field they find. When `fieldHoneyPot` names such a field and a submission contains a value for it, the submission is refused.

Sender validation is <!-- default:HttpForm.validateDomain as=enabled -->enabled<!-- /default --> unless `validateDomain` is changed. It applies to an address entered in the sender field, unless the field is empty or equal to `defaultFromAddress`. The address must be syntactically valid, its domain must end in a public suffix, and the domain must have MX records.

The endpoint sends no CORS headers of its own, and whether that matters depends on how the form is submitted. An ordinary HTML form posted from a page on another domain works without them. A page that submits the form with JavaScript from another origin, however, needs [`usePermissiveCors`](/docs/http/settings#security), which applies to every endpoint.
