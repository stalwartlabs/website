---
sidebar_position: 6
title: "Contacts"
---

Users keep their contacts on phones, laptops and webmail at once, and expect a change made in one place to appear everywhere. Stalwart stores address books for every account and serves them over JMAP for Contacts and CardDAV, so that contacts can be kept and synchronised across devices and applications. This page describes how clients reach the address books and the limits and defaults an administrator configures. It also explains how contact UIDs and searches behave, and how the spam filter uses address books.

## JMAP for Contacts

JMAP for Contacts ([RFC 9610](https://www.rfc-editor.org/rfc/rfc9610)) is an alternative to CardDAV, built on the same JSON foundation as the other JMAP specifications. Clients manage address books and contacts through JSContact, a schema-defined JSON representation of contact data. CardDAV relies on XML-based WebDAV extensions and on the vCard format, and JMAP for Contacts replaces both layers with JSON objects and operations.

## CardDAV

CardDAV is a standardised extension of WebDAV, through which clients work with contact data stored on a server. It gives contact applications on desktop and mobile platforms, including Apple Contacts and Thunderbird, an interoperable way to manage personal and shared address books. Through CardDAV, contacts are created and edited, organised into address books and synchronised across devices. The same data is available to JMAP clients, so a change made in one kind of client appears in the other.

### Accessing contacts

The recommended way to configure a CardDAV client is through the autodiscovery endpoint at `/.well-known/carddav`. A client that queries this path is redirected to the CardDAV resource of the authenticated account.

Clients configured manually can use the direct path `/dav/card/<account_name>`, where `<account_name>` is the username of the account. The address books of the account `alice`, for example, are at `/dav/card/alice`. Both methods lead to the same contact data.

## Limits

Address-book-wide limits are set on the [AddressBook](/docs/ref/object/address-book) singleton, found in the WebUI under <!-- breadcrumb:AddressBook --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /></svg> Calendar & Contacts › Address Book<!-- /breadcrumb:AddressBook -->.

### vCard object size

[`maxVCardSize`](/docs/ref/object/address-book#maxvcardsize) is the largest single vCard object the server accepts, <!-- default:AddressBook.maxVCardSize -->512 KiB<!-- /default --> by default. It can be raised or lowered to suit the cards that clients are expected to submit.

### Address books per card and embedded media

In JMAP, one contact card can belong to several address books, and [`maxAddressBooksPerCard`](/docs/ref/object/address-book#maxaddressbookspercard) limits how many. Cards can also carry embedded media, and [`maxMediaSize`](/docs/ref/object/address-book#maxmediasize) limits the total size of the photos, logos, sounds and keys embedded in one card, <!-- default:AddressBook.maxMediaSize -->2 MiB<!-- /default --> by default.

### JMAP parsing limit

The JMAP `ContactCard/parse` method is bounded by [`parseLimitContact`](/docs/ref/object/jmap#parselimitcontact) on the [Jmap](/docs/ref/object/jmap) singleton, which sets the largest number of vCard items parsed in a single request. The Jmap singleton is found in the WebUI under <!-- breadcrumb:Jmap --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › JMAP › Limits, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › JMAP › Push, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › JMAP › WebSocket<!-- /breadcrumb:Jmap -->.

## vCard version

The vCard format exists in two versions in common use, and clients differ in which one they handle. Cards are returned to CardDAV clients in the vCard version they request. For clients that do not request one, [`vCardVersion`](/docs/ref/object/address-book#vcardversion) selects it, <!-- default:AddressBook.vCardVersion -->`v4`<!-- /default --> by default. The values are `v4` (vCard 4.0, [RFC 6350](https://www.rfc-editor.org/rfc/rfc6350)) and `v3` (vCard 3.0, [RFC 2426](https://www.rfc-editor.org/rfc/rfc2426)).

## Contact UIDs

The `UID` of a contact card identifies it across clients, so it has to stay stable. Once set, it can never be removed or changed. A UID can still be added to a card that has none, provided no other card in the address book uses it. Requests that break these rules fail:

- Over CardDAV, a `PUT` that changes or removes the UID, or that adds a UID already used by another card, fails with `403 Forbidden` and the precondition `CARDDAV:no-uid-conflict`, which names the existing card.
- Over JMAP, `ContactCard/set` fails with `invalidProperties` and the description `You cannot change the UID of a contact.`

CardDAV clients do not always spell the same UUID the same way, and Stalwart tolerates the differences. A UID written with or without the `urn:uuid:` prefix, or in a different letter case, is accepted as the same UID. The stored spelling is kept, and the `PUT` returns `204` without an `ETag`. JMAP compares UIDs exactly.

## Searching contacts

CardDAV `addressbook-query` reports compare text using a collation, a named rule for comparing strings. The collations come from [RFC 4790](https://www.rfc-editor.org/rfc/rfc4790) and [RFC 5051](https://www.rfc-editor.org/rfc/rfc5051), and each address book lists the ones it supports in its `supported-collation-set`:

| Collation | Comparison |
|---|---|
| `i;unicode-casemap` | Case-insensitive for all Unicode text. The default for CardDAV. |
| `i;ascii-casemap` | Case-insensitive for ASCII letters only. |
| `i;octet` | Exact byte comparison. |

The default match type is `contains`, as [RFC 6352](https://www.rfc-editor.org/rfc/rfc6352) section 10.5.4 specifies. A request that names any other collation fails with `403` and the precondition `supported-collation`.

## Default address book

To improve client compatibility, Stalwart creates a default address book when an account is accessed and has none, so contact operations proceed without manual setup. The address book is created under the account's address book home, with the name set in [`defaultHrefName`](/docs/ref/object/address-book#defaulthrefname) on the AddressBook singleton, <!-- default:AddressBook.defaultHrefName -->`default`<!-- /default --> by default. Clients show it under the display name in [`defaultDisplayName`](/docs/ref/object/address-book#defaultdisplayname), <!-- default:AddressBook.defaultDisplayName -->`Stalwart Address Book`<!-- /default --> by default, which can be changed to match the organisation's branding or language.

### Choosing the default address book

A JMAP client sets the default address book with the `onSuccessSetIsDefault` argument of `AddressBook/set`, and `AddressBook/get` reports it in `isDefault`. The change applies only when every other change in the request succeeded, and only in the user's own account. Until a default is set, the address book created first is the default.

### Disabling automatic creation

Clearing `defaultHrefName` turns automatic creation off. Stalwart then creates no default address book, and an account has no address book until the user creates one.

## Per-account limits

The AddressBook singleton also caps the address book resources of each account. [`maxAddressBooks`](/docs/ref/object/address-book#maxaddressbooks) limits the number of address books an account can create, and [`maxContacts`](/docs/ref/object/address-book#maxcontacts) the number of contact cards. These values apply to every account unless they are overridden at the account or tenant level.

## Spam filter integration

Address books also help the [spam filter](/docs/spamfilter/), which uses each account's address book to recognise trusted senders. A message from a sender in the recipient's address book is filed in the inbox even when its spam score is high, provided the sender is authenticated, by DMARC or by an authenticated submission. The score itself is not changed, as described in [Inbox override](/docs/spamfilter/trusted#inbox-override). These messages can also train the spam classifier, as described in [trusted senders](/docs/spamfilter/classifier/autolearn#trusted-senders).
