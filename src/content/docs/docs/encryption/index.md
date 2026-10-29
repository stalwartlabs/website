---
sidebar_position: 1
title: "Overview"
description: "Encryption at rest with each user's OpenPGP key or S/MIME certificate: what it protects, what remains readable to the server, and the server-wide settings."
---

A mail server stores its users' messages in readable form, so anyone who can read the server's storage can read the mail. That includes an administrator, an attacker who obtains a backup or a disk, and anyone who compromises the server. Encryption at rest protects the contents of a user's stored messages against all of them.

The protection rests on public-key cryptography. Each user who wants it registers an [OpenPGP](/docs/encryption/pgp) public key or an [S/MIME](/docs/encryption/smime) certificate with the server, and Stalwart encrypts every message for that user with the public key before storing it. A message encrypted this way can be decrypted only with the matching private key. That key never reaches the server: it stays with the user, in a mail client that supports OpenPGP or S/MIME, and only its holder can decrypt the messages.

Encryption at rest is optional and enabled per account. The server-wide settings decide whether users may turn it on, and each user then chooses a key and a cipher for their own account.

## Scope of protection

The server encrypts the body of each message, including all attachments, and stores the message as an OpenPGP/MIME or S/MIME encrypted message. Messages that are already encrypted are stored unchanged.

The protection covers stored messages, not messages in transit through the server. Because a message is encrypted only when it is stored, the server sees it in plain text when it arrives. This has two consequences. Spam filtering, Sieve scripts and delivery rules run before encryption, so they work as usual. On the other hand, a server that is compromised while a message is received can read that message.

Some parts of a message stay readable to the server. The message headers, such as `From`, `To`, `Subject` and `Date`, stay in plain text, so that clients can list and sort messages without decrypting them. The envelope and the delivery logs are unaffected.

Search is limited to the headers. The search index is built from the stored message, so a search in the body or attachments of an encrypted message finds nothing, over JMAP and IMAP alike. Searches by sender, recipient or subject still work, because they use the headers.

The spam classifier learns from the text of messages, which an encrypted message no longer offers. An encrypted message therefore trains the classifier only when the account allows training on its plain text before encryption, through `allowSpamTraining`. Without that permission, the message is left out of training.

Encryption is not retroactive in either direction. It applies only to messages stored after it is enabled, and disabling it does not decrypt the messages stored while it was on.

## Conditions for encryption

A message is encrypted at the moment it is stored, and the conditions depend on how the message reaches the mailbox.

A message received over SMTP or LMTP is encrypted when two conditions are met: the server-wide setting allows encryption, and the recipient account has enabled encryption with a registered key.

A message that a client stores itself over JMAP or IMAP, for example a copy of a sent message or a message moved from another account, needs one condition more. It is encrypted only when all three of the following are met:

- The server-wide `encryptAtRest` allows encryption.
- The server-wide `encryptOnAppend` is enabled.
- The account has enabled encryption of appended messages in its own settings.

Messages stored over JMAP with the `$draft` keyword are the exception: they are never encrypted on append, because the server sends them as stored when the client submits them. A message composed and sent over JMAP therefore keeps its Sent copy unencrypted, while clients that submit over SMTP and append the Sent copy over IMAP get it encrypted.

## Server-wide settings

The two server-wide switches are fields of the [Email](/docs/ref/object/email) singleton. Its settings are found in the WebUI under <!-- breadcrumb:Email --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" /></svg> Email › Defaults, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" /></svg> Email › Encryption, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" /></svg> Email › Limits, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" /></svg> Email › Storage<!-- /breadcrumb:Email -->.

The [`encryptAtRest`](/docs/ref/object/email#encryptatrest) field decides whether users may turn on encryption at rest at all, and it is <!-- default:Email.encryptAtRest as=enabled -->enabled<!-- /default --> by default. When it is disabled, no message is encrypted, whatever the account settings say.

The [`encryptOnAppend`](/docs/ref/object/email#encryptonappend) field extends encryption to messages appended over JMAP and IMAP, for the accounts that also enable it. It is <!-- default:Email.encryptOnAppend as=enabled -->disabled<!-- /default --> by default, and while it is disabled, appended messages are never encrypted.

The following settings allow both encryption at rest and the encryption of appended messages:

```json
{
  "encryptAtRest": true,
  "encryptOnAppend": true
}
```

Users then register their keys and enable encryption for their own accounts, as described in [Managing encryption](/docs/encryption/manage).
