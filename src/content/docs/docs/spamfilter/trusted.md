---
sidebar_position: 10
title: "Trusted senders"
description: "How messages from a recipient's contacts and replies to the recipient's own messages are kept out of the Junk folder, and the ways to exempt a sender, domain or server from spam filtering."
---

A message from someone the recipient knows is rarely spam, even when its content resembles spam. Short replies, messages from infrequent correspondents and automated notices from services the recipient uses all look suspicious to a content filter, and all are mail the recipient wants.

Stalwart uses two signals of an existing relationship to keep such messages out of the Junk folder. The first is that the sender is in the recipient's address book. The second is that the message continues a conversation in which the recipient has written. Both are configured on the [SpamSettings](/docs/ref/object/spam-settings) singleton, found in the WebUI under <!-- breadcrumb:SpamSettings --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> Spam Filter › General<!-- /breadcrumb:SpamSettings -->.

## Inbox override

The override is applied when a message is delivered to a local mailbox, separately for each recipient. It applies only to messages that the spam filter has classified as spam. When one of the conditions below holds for the recipient, the message is delivered to the inbox instead of the Junk folder, and its `X-Spam-Status` header reads `No` with the reason that applied:

| Field | Default | Condition | `X-Spam-Status` |
|---|---|---|---|
| [`trustContacts`](/docs/ref/object/spam-settings#trustcontacts) | <!-- default:SpamSettings.trustContacts as=enabled -->enabled<!-- /default --> | The first address of the `From` header is in one of the recipient's [address books](/docs/collaboration/contact), is not the recipient's own address, and the sender is authenticated. | `No, reason=card-exists` |
| [`trustReplies`](/docs/ref/object/spam-settings#trustreplies) | <!-- default:SpamSettings.trustReplies as=enabled -->enabled<!-- /default --> | The message belongs to a conversation thread that contains a message in the recipient's Sent folder. | `No, reason=trusted-reply` |

The override changes only where the message is filed. The score is unchanged, and so are the `X-Spam-Result` and `X-Spam-Score` headers. It also cannot rescue a message that never reaches delivery: a message refused by the reject threshold, or dropped by the discard threshold at SMTP time, is not delivered at all, so no override can apply to it.

### Authentication of contacts

An address book entry alone would be easy to abuse, because anyone can put a contact's address in the `From` header. The address-book check therefore also requires the sender to be authenticated. The sender counts as authenticated when the message passed [DMARC](/docs/mta/authentication/dmarc) for the `From` domain, or was submitted by an authenticated user of the server. A message that merely claims a contact's address in its `From` header, without passing DMARC, is not trusted.

### Conversation threads

The thread check has no authentication condition. It relies instead on the message being part of a conversation that the recipient took part in. Stalwart determines that from the message's `In-Reply-To` and `References` headers and its subject.

## Learning from overrides

A message that the filter classified as spam but that a trusted-sender rule delivered to the inbox was probably misclassified. That mistake is worth feeding back. When the [statistical classifier](/docs/spamfilter/classifier/) is enabled, such a message can be stored as a ham sample, so that the classifier learns from it.

Each rule has its own switch on the [SpamClassifier](/docs/ref/object/spam-classifier) singleton: [`learnHamFromCard`](/docs/ref/object/spam-classifier#learnhamfromcard) for the address-book rule, and [`learnHamFromReply`](/docs/ref/object/spam-classifier#learnhamfromreply) for the thread rule. [Automatic learning](/docs/spamfilter/classifier/autolearn) describes the other sources of samples.

## Exempting a sender, domain or server

The trusted-sender rules act per recipient, and only after the message has been scored. Mail that should be exempt for every recipient needs a different mechanism, and the right one depends on what identifies the mail.

A domain whose mail is authenticated belongs in the [trusted domains](/docs/spamfilter/settings/domain-lists#trusted-domains) list. Messages whose `From` domain is in the list and that pass DMARC receive `TRUSTED_DOMAIN`, which scores -7.0.

A sender address, domain or IP address can be favoured with a [rule](/docs/spamfilter/rules) that adds a local tag, together with a negative score for that tag. For example, a rule of the `Any` variant with the condition `if_then(remote_ip == '192.0.2.10', 'LOCAL_TRUSTED_RELAY', false)`, and a [SpamTag](/docs/ref/object/spam-tag) scoring `LOCAL_TRUSTED_RELAY` at -20, let a known relay's mail through unless other evidence is overwhelming. Because the tag only lowers the score, the rest of the filter still runs on such mail.

A server whose mail should not be filtered at all is excluded through the [`enableSpamFilter`](/docs/ref/object/mta-stage-data#enablespamfilter) expression of the DATA stage. By default, the expression filters every unauthenticated session. Change it so that it returns `false` for the server, for example `is_empty(authenticated_as) && remote_ip != '192.0.2.10'`. Messages from that server then carry no `X-Spam-Result` or `X-Spam-Score` header, and are never filed in the Junk folder.

Mail submitted by local users needs no exemption, because authenticated users are not filtered by default.
