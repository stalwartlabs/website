---
sidebar_position: 1
---

# Overview

DomainKeys Identified Mail (DKIM) is a widely-used email authentication method employed to verify the authenticity of an email message. It uses public key cryptography to encrypt a digital signature within the message header that can be verified by the recipient's mail server. The goal of DKIM is to prevent email spoofing and make it possible to track which domain sent an email. It works by adding a signature to the message header that is encrypted with a private key held by the sending domain's mail server, which can be decrypted with a public key that is published in the domain's DNS records. The recipient's mail server can then use this public key to validate the signature and confirm that the message was indeed sent by the domain that claims to have sent it.

By enabling DKIM in Stalwart, outgoing emails will be signed with one or multiple digital signatures that verify the authenticity of the message and helps to prevent it from being marked as spam or rejected by the recipient's email servers. This increases the deliverability of emails, helps to protect the domain's reputation, helps to build trust with the recipients and improves the overall security and privacy of email communications.

