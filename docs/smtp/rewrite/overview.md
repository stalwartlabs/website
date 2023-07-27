---
sidebar_position: 1
---

# Overview

Message rewriting refers to the process of altering aspects of an email as it's being processed by the mail server. This can involve changing the sender or recipient addresses in the envelope (the 'outside' of the email), or modifying the contents of the email itself, including headers, bodies, and attachments. 

There are a variety of scenarios in which you might want to rewrite a message. For example, you may need to [change recipient addresses](/docs/smtp/rewrite/address) to redirect mail traffic, obfuscate the original sender's address for privacy, or alter the domain in an address to match a company's branding. 

Similarly, modifying the contents of an email is useful for managing how the email is presented to the recipient. You may want to [add, delete, or change headers](/docs/smtp/rewrite/headers) for tracking or compliance purposes, [alter the body](/docs/smtp/rewrite/content) text to append a legal disclaimer or a promotional signature, or even manage attachments for security reasons, such as by removing potentially harmful files.

In all these cases, Stalwart SMTP can provide the required flexibility through its robust support for address rewriting and email content modification.
