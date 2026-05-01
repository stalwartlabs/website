---
sidebar_position: 8
title: "Form Handling"
---

Stalwart can accept HTTP form submissions on the `/form` endpoint and turn each submission into an email message delivered to one or more local recipients. The feature is typically used for web forms such as contact or feedback forms, where submissions need to be forwarded to a designated group of local recipients on the mail server.

Deliveries are limited to **local recipients only**. External recipients are rejected to prevent the form endpoint from being used as an open relay.

## Security Features

Two anti-abuse mechanisms protect the form endpoint:

- Per-IP rate limiting throttles how many submissions a single client can send within a given window, so that legitimate traffic is not crowded out by automated floods.
- A honeypot field is a hidden form field that is invisible to human users but visible to bots. Legitimate users will not fill it out; bots that attempt to fill every input will, and the server discards any submission in which the honeypot field is populated. This avoids the friction of CAPTCHAs while still filtering out automated spam.

## Configuration

Form handling is configured through the [HttpForm](/docs/ref/object/http-form) singleton (found in the WebUI under <!-- breadcrumb:HttpForm --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › HTTP › Contact Form<!-- /breadcrumb:HttpForm -->). The relevant fields are:

- [`enable`](/docs/ref/object/http-form#enable): turns the feature on or off. When `false`, the server returns an error for any request to `/form`. Default `false`.
- [`maxSize`](/docs/ref/object/http-form#maxsize): maximum size of a single submission. Default `"100kb"`.
- [`validateDomain`](/docs/ref/object/http-form#validatedomain): whether the server validates the domain of the sender's email address. Default `true`.
- [`rateLimit`](/docs/ref/object/http-form#ratelimit): per-IP submission rate, as a count over a time period. Default five submissions per hour.
- [`deliverTo`](/docs/ref/object/http-form#deliverto): the list of local email addresses that receive the generated message.
- [`fieldEmail`](/docs/ref/object/http-form#fieldemail): the name of the form field that carries the sender's email address, used as the message `From` address.
- [`defaultFromAddress`](/docs/ref/object/http-form#defaultfromaddress): fallback `From` address used when the submission does not include one. Default `"postmaster@localhost"`.
- [`fieldHoneyPot`](/docs/ref/object/http-form#fieldhoneypot): the name of the hidden honeypot field; a populated value flags the submission as spam.
- [`fieldName`](/docs/ref/object/http-form#fieldname): the name of the form field that carries the sender's name, used in the `From` header.
- [`defaultName`](/docs/ref/object/http-form#defaultname): fallback name used when the submission does not include one. Default `"Anonymous"`.
- [`fieldSubject`](/docs/ref/object/http-form#fieldsubject): the name of the form field that carries the message subject.
- [`defaultSubject`](/docs/ref/object/http-form#defaultsubject): fallback subject line used when the submission does not include one. Default `"Contact form submission"`.

Example configuration:

```json
{
  "enable": true,
  "maxSize": 10240,
  "validateDomain": true,
  "rateLimit": {"count": 5, "period": "1h"},
  "deliverTo": ["jane@example.org", "john@example.org"],
  "fieldEmail": "email",
  "defaultFromAddress": "unknown@sender.org",
  "fieldHoneyPot": "subject",
  "fieldName": "name",
  "defaultName": "Anonymous",
  "fieldSubject": "subject",
  "defaultSubject": "Contact Form"
}
```
