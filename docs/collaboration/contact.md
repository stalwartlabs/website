---
sidebar_position: 6
---

# Contacts

Stalwart includes built-in support for contact management and synchronization through JMAP for Contacts and CardDAV, covering storage, access, and maintenance of address book data across devices and applications.

## JMAP for Contacts

JMAP for Contacts is a modern alternative to CardDAV, built on the same JSON-based foundation as other JMAP specifications. It allows clients to manage address books and contact data through a schema-defined JSON representation known as JSContact.

Where CardDAV relies on XML-based WebDAV extensions and the vCard format, JMAP for Contacts replaces both layers with JSON objects and operations.

## CardDAV

CardDAV is a standardized extension of WebDAV that allows clients to interact with contact data stored on a server. It provides an interoperable way to manage personal and shared address books, and is supported by contact applications on desktop and mobile platforms including Apple Contacts and Thunderbird.

Through CardDAV, contacts can be created and edited, organised into address books, and synchronised across devices. Stalwart's CardDAV implementation integrates with the rest of the collaboration stack so that the same underlying data is available to JMAP clients.

### Accessing contacts

CardDAV clients can access address book data on Stalwart using standardized URLs. The recommended method for client configuration is through the autodiscovery endpoint located at `/.well-known/carddav`. When a client queries this path, the server redirects the request to the appropriate CardDAV resource associated with the authenticated account.

Alternatively, CardDAV address books can be accessed directly via the path `/dav/card/<account_name>`, where `<account_name>` is the username of the account. For example, the address book for the account `alice` is available at `/dav/card/alice`.

Both methods provide access to the same contact data and are fully compatible with the CardDAV protocol.

## Limits

Address-book-wide limits are configured on the [AddressBook](/docs/ref/object/address-book) singleton (found in the WebUI under <!-- breadcrumb:AddressBook --><!-- /breadcrumb:AddressBook -->).

### vCard object size

[`maxVCardSize`](/docs/ref/object/address-book#maxvcardsize) defines the maximum accepted size of a single vCard object submitted to the server. The default is `524288` (512 KB). Raise or lower the limit to suit expected client behaviour.

### JMAP parsing limit

The JMAP `ContactCard/parse` method is bounded by [`parseLimitContact`](/docs/ref/object/jmap#parselimitcontact) on the [Jmap](/docs/ref/object/jmap) singleton (found in the WebUI under <!-- breadcrumb:Jmap --><!-- /breadcrumb:Jmap -->), which sets the maximum number of vCard items that can be parsed in a single request. The default is `10`.

## Default address book

To improve client compatibility and allow contact operations to proceed without manual setup, Stalwart automatically creates a default address book when an account is accessed and no address books currently exist for it. The URL path of the auto-created address book is controlled by [`defaultHrefName`](/docs/ref/object/address-book#defaulthrefname) on the AddressBook singleton. The default value is `"default"`, so for an account named `john` the default address book is created at `/dav/card/john/default`.

### Disabling automatic creation

Automatic creation can be suppressed by clearing [`defaultHrefName`](/docs/ref/object/address-book#defaulthrefname) (leaving it unset). In that case, Stalwart does not create a default address book and clients that connect to an account with no address books receive an appropriate error response.

<!-- review: The pre-migration docs described `contacts.default.href-name = false` as the explicit way to disable automatic default-address-book creation. The current AddressBook object exposes `defaultHrefName` as an optional String. Confirm that unsetting the field is equivalent to the previous boolean disable, and that no separate enable flag controls automatic creation. -->

### Default display name

The display name assigned to the auto-created address book is controlled by [`defaultDisplayName`](/docs/ref/object/address-book#defaultdisplayname). The default is `"Stalwart Address Book"`; the value can be adjusted to match organisational branding or language preferences.

## Per-account limits

The AddressBook singleton also sets default caps on per-account address-book resources: [`maxAddressBooks`](/docs/ref/object/address-book#maxaddressbooks) caps the number of address books an account can create (default `250`), and [`maxContacts`](/docs/ref/object/address-book#maxcontacts) caps the number of contact cards. These apply unless overridden at the account or tenant level.

## Spam filter integration

Stalwart's contact management system is integrated with the [built-in spam filter](/docs/spamfilter/overview) to improve filtering accuracy and reduce false positives. When enabled, the spam filter references an account's address book to identify trusted senders so that their messages are not marked as spam.

In addition to [bypassing spam classification](/docs/spamfilter/settings/general#address-book-integration) for known contacts, the address book can be used to [improve the spam classifier](/docs/spamfilter/classifier/autolearn#address-books). When a message from a known contact is incorrectly flagged as spam, the classifier can learn from the mistake and recognise similar messages in future.

For details on configuring these features, see the [spam filter documentation](/docs/spamfilter/overview).
