---
sidebar_position: 6
---

# Contacts

Stalwart includes built-in support for **contact management and synchronization** through the **JMAP for Contacts** and **CardDAV**, enabling users to store, access, and maintain address book data across devices and applications.

## JMAP for Contacts

**JMAP for Contacts** is a modern alternative to CardDAV, built on the same JSON-based foundation as other JMAP specifications. It allows clients to manage address books and contact data efficiently through a structured, schema-defined JSON representation known as JSContact.

While CardDAV relies on XML-based WebDAV extensions and uses the vCard format for storing contact information, JMAP for Contacts replaces both layers with clear, well-defined JSON objects and operations.

## CardDAV

**CardDAV** is a standardized extension of WebDAV that allows clients to interact with contact data stored on a server. It provides a reliable and interoperable way for users to manage personal and shared address books, and is widely supported by contact applications on both desktop and mobile platforms—including Apple Contacts, Thunderbird, and many others.

Through CardDAV, users can create and edit contact entries, organize them into address books, and synchronize changes automatically across multiple devices. This ensures that contact information remains consistent and up-to-date, no matter where it’s accessed. By supporting CardDAV, Stalwart delivers a complete and standards-compliant contact management system that integrates seamlessly into modern communication and collaboration workflows. This section covers how contact data is structured, how clients access it, and how administrators can manage and configure contact-related features.

### Accessing Contacts

CardDAV clients can access address book data on the Stalwart using standardized URLs, ensuring compatibility with a wide range of contact management applications. The recommended method for client configuration is through the **autodiscovery endpoint** located at `/.well-known/carddav`. When a client queries this path, the server redirects the request to the appropriate CardDAV resource associated with the authenticated user. This simplifies setup by allowing most modern clients to automatically locate and configure contacts access without requiring manual URL input.

Alternatively, CardDAV address books can be accessed directly via the path `/dav/card/<account_name>`, where `<account_name>` is the username of the account. For example, the address book for user `alice` would be available at `/dav/card/alice`. This direct path can be used in clients that support manual CardDAV configuration or when troubleshooting.

Both methods provide access to the same contacts data and are fully compatible with the CardDAV protocol. Stalwart’s support for these endpoints ensures smooth integration with existing CardDAV clients while offering flexibility for both automatic and manual configuration.

## Limits

To ensure optimal performance and protect server resources, Stalwart allows administrators to define limits on address book-related operations. These settings help prevent abuse or misconfiguration from clients that may attempt to create excessively large contact entries.

### vCard Object Size

The `contacts.max-size` setting defines the maximum allowed size (in bytes) of a single vCard object submitted to the server. By default, this limit is set to **512 KB**. This helps prevent clients from uploading unreasonably large contact entries that could impact memory usage or processing performance. If needed, this value can be increased or decreased depending on your deployment’s use case and client behavior.

Example:

```toml
[contacts]
max-size = 524288
```

### JMAP Parsing Limit

When using JMAP to interact with contact data, the `jmap.contact.parse.max-items` setting limits how many vCard objects can be parsed in a single JMAP `ContactCard/parse` request. The default value is **100 items**. This prevents excessively large requests from consuming too many server resources. If your use case requires processing more items in a single request, this limit can be adjusted.

Example:

```toml
[jmap.contact.parse]
max-items = 100
```

## Default Address Book

To streamline client compatibility and ensure that contact management operations can proceed without manual setup, Stalwart **automatically creates** a default address book when a user account is accessed and no address books currently exist for that user.
The location (URL path) of the automatically created address book is determined by the `contacts.default.href-name` setting. By default, this is set to `"default"`, which means that for a user named `john`, the default address book will be created at `/dav/cal/john/default`. This behavior ensures that CalDAV clients always have at least one address book to work with, avoiding errors or empty interfaces when first connecting to the server.

```toml
[contacts.default]
href-name = "default"
```

### Disabling Automatic Creation

If automatic address book creation is not desired—for example, in environments where address books are provisioned manually or via external tools—you can disable this feature by setting `contacts.default.href-name` to `false`. Example:

```toml
[contacts.default]
href-name = false
```

When this setting is disabled, Stalwart will **not** create a default address book automatically, and clients attempting to access contact data for an account without any address books will receive an appropriate error response.

### Default Display Name

The display name used for the default address book (as shown in client applications) is controlled by the `contacts.default.display-name` setting. By default, this value is set to `Stalwart Address Book`.

Example:

```toml
[contacts.default]
display-name = "Stalwart Address Book"
```

This name is assigned to the address book’s `display-name` property and can be customized to better match your organization's branding or language preferences.

## Spam Filter Integration

Stalwart’s contact management system is closely integrated with the [built-in spam filter](/docs/spamfilter/overview) to enhance filtering accuracy and reduce the chances of false positives. When enabled, the spam filter can reference a user’s address book to identify trusted senders and ensure their messages are not mistakenly marked as spam.

In addition to [bypassing spam classification](/docs/spamfilter/settings/general#address-book-integration) for known contacts, Stalwart can also use this information to [improve its Bayesian spam filter](/docs/spamfilter/classifier#contacts-auto-learning). If a message from a known contact is incorrectly flagged as spam, the system can automatically learn from the mistake and train its Bayesian model to better recognize similar messages in the future.

This seamless integration between the address book and spam filtering system helps create a more intelligent and personalized filtering experience. For more information on how to configure these features, see the [spam filter documentation](/docs/spamfilter/overview).

