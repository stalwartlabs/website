---
sidebar_position: 4
---

# Scheduling

Calendar Scheduling allows users to efficiently coordinate meetings and events by automating the process of sending, receiving, and responding to invitations. Rather than relying on manual email exchanges, calendar scheduling systems streamline communication between organizers and attendees, track participation status, and manage updates and cancellations in real time.

Stalwart Mail supports **Scheduling Extensions to CalDAV**, as defined in [RFC 6638](https://datatracker.ietf.org/doc/html/rfc6638). This specification extends the CalDAV protocol to support server-based scheduling operations, enabling calendar clients to schedule meetings through standard WebDAV-based interactions. With this extension, users can create calendar events and invite participants by simply adding attendee information to an event—Stalwart will handle the necessary scheduling logic, including delivering invitations, processing replies, and updating calendars accordingly.

Calendar scheduling in Stalwart relies on two core protocols from the iCalendar ecosystem:

- **iCalendar Transport-Independent Interoperability Protocol (iTIP)**: defined in [RFC 5546](https://datatracker.ietf.org/doc/html/rfc5546), describes how scheduling messages—such as event invitations, updates, cancellations, and responses—are structured and processed using the iCalendar data format. It defines a set of methods (`REQUEST`, `REPLY`, `CANCEL`, etc.) used to negotiate scheduling operations between organizers and attendees. iTIP itself is **transport-agnostic**, meaning it defines the message content and expected behavior but not how the messages are delivered. It is used internally by CalDAV servers and clients to interpret and manage scheduling data.
- **iCalendar Message-Based Interoperability Protocol (iMIP)**, described in [RFC 6047](https://datatracker.ietf.org/doc/html/rfc6047), specifies how iTIP messages are transported over email (typically via SMTP). It enables calendar scheduling between systems that may not support CalDAV directly—for example, sending a calendar invitation from a CalDAV user to an external recipient via standard email.

When Stalwart encounters a recipient that cannot be reached via CalDAV (for example, an external attendee), it automatically falls back to iMIP to deliver the scheduling message as an email with an attached `.ics` file.

## Enabling Scheduling

In Stalwart, Calendar Scheduling is **enabled by default** to provide full support for meeting invitations, participant management, and automated scheduling workflows. This ensures compatibility with CalDAV clients that implement the Scheduling Extensions (RFC 6638), as well as email-based scheduling through iMIP. When enabled, Stalwart automatically handles the delivery and processing of scheduling messages, allowing users to create and manage events with attendees without requiring manual coordination.

Administrators who wish to **disable calendar scheduling**—for example, in environments where scheduling is managed externally, or where only personal calendar use is desired—can do so by setting the `calendar.scheduling.enable` configuration option to `false` in the server's configuration file:

```toml
[calendar.scheduling]
enable = false
```

Once disabled, Stalwart will no longer process scheduling requests or generate scheduling messages. Events that include attendee information will be stored as standard calendar entries, but no invitations, updates, or replies will be sent or processed. Both iTIP (used internally for scheduling logic) and iMIP (used for email-based scheduling) will be effectively bypassed.

:::tip Tip

Calendar Scheduling can also be enabled or disabled on a per-user basis by setting the appropriate [permissions](/docs/auth/authorization/permissions).

:::

## Automatic Event Addition

RFC 6638 mandates that CalDAV servers **automatically add scheduling messages**—such as invitations received via iTIP or iMIP—to the recipient’s calendar. This behavior is intended to make scheduling seamless by eliminating the need for users to manually review or accept incoming event requests before they appear in their calendar.

Stalwart takes a more deliberate and user-respecting approach to this requirement. While automatic addition can be convenient, it also creates the potential for calendar spam, where unsolicited or irrelevant invitations are inserted directly into a user’s calendar. More importantly, it undermines user control, removing the individual’s ability to decide which events appear in their personal or work schedule.

To address these concerns,  Stalwart only adds invitations to calendars automatically when two conditions are met. First, the sender must be authenticated via [DMARC](/docs/mta/authentication/dmarc), confirming that the message originates from a domain authorized to send on behalf of the claimed sender. Second, the sender must be listed in the recipient’s [address book](/docs/collaboration/contact), indicating an established relationship or known contact. This policy allows for reliable auto-processing of legitimate invitations without compromising user control or safety.

For administrators who wish to strictly conform to the behavior described in RFC 6638 and automatically add all incoming scheduling messages regardless of origin, Stalwart provides a configuration option to override the default behavior. By setting `calendar.scheduling.inbound.auto-add` to `true`, the server will automatically accept and apply all valid iTIP and iMIP invitations to user calendars without verifying the sender’s authenticity or presence in the address book.

This setting should be used with caution, particularly in open or federated environments, as it removes important safeguards against unsolicited or potentially harmful calendar activity.

## Scheduling Limits

To prevent misuse of the calendar scheduling system and ensure server stability, Stalwart includes several configuration options that place limits on the size and scope of scheduling operations. These safeguards are particularly important in multi-user environments or public-facing deployments, where malicious or excessive scheduling activity could lead to resource exhaustion or spam.

### iTIP Message Size

The first control is `calendar.scheduling.inbound.max-size`, which defines the maximum size (in bytes) of an incoming iTIP message that the server will accept and process. If a scheduling message exceeds this limit, it will be rejected without being parsed or delivered. This setting helps protect the server from excessively large or malformed calendar invitations that could be used to exhaust memory or processing capacity. Administrators can adjust this limit based on their environment's expected usage patterns and trust level.

Example:

```toml
[calendar.scheduling]
inbound.max-size = 1048576 # 1 MB
```

### Outbound Recipient Limits

The second control is `calendar.scheduling.outbound.max-recipients`, which limits the number of recipients that a single iTIP scheduling message may include. When this limit is exceeded, the server will reject the request and prevent the message from being delivered. This protects against mass-invitation abuse, where users might attempt to use the calendar system to send messages to a large number of users in a single operation.

Example:

```toml
[calendar.scheduling]
outbound.max-recipients = 100
```

In addition to these scheduling-specific limits, all existing [MTA-level throttling policies](/docs/mta/queue/limits/overview) remain in effect for outbound iMIP messages. This ensures that users cannot bypass email sending restrictions by routing bulk messages through the scheduling system. Outbound scheduling emails are subject to the same rate limits, message size limits, and delivery policies as any other email traffic, maintaining consistency and preventing abuse.

## Inbox Auto-Expunge

As part of the CalDAV Scheduling Extensions defined in RFC 6638, each user account includes a **Scheduling Inbox**, a special collection where incoming iTIP messages—such as invitations, replies, cancellations, and updates—are stored. These messages serve as a log of scheduling activity and are used by calendar clients to synchronize and process meeting-related actions.

However, not all CalDAV clients reliably delete messages from the Scheduling Inbox after processing them. As a result, the inbox can accumulate outdated or redundant scheduling messages over time. This not only consumes unnecessary storage but may also affect performance or cause confusion for users and clients that continue to sync or display stale data.

To address this, Stalwart provides the `calendar.scheduling.inbox.auto-expunge` configuration option. This setting defines a retention period for iTIP messages stored in the Scheduling Inbox. Once a message has been in the inbox for longer than the configured duration, Stalwart will automatically delete it during routine maintenance.

The value of `calendar.scheduling.inbox.auto-expunge` is specified as a duration—for example, `30d` to delete messages older than thirty days. If this setting is not configured, messages will remain in the inbox indefinitely unless removed manually by the client or user.

Example:

```toml
[calendar.scheduling.inbox] 
auto-expunge = "30d" 
```

## HTTP RSVP

Stalwart allows participants to respond to calendar invitations using a simple web link. When enabled, a unique RSVP URL is included in the iMIP invitation email sent to each attendee. Recipients can click this link to accept, decline, or tentatively respond to the invitation using a web interface—without needing a CalDAV-capable client or calendar application.

This feature is particularly useful when scheduling with external users or with clients that do not support calendaring or scheduling protocols. It ensures that all recipients, regardless of their client capabilities, have a reliable way to respond to invitations and update their participation status.

### Endpoint

The RSVP endpoint is accessible at `https://<server-host>/calendar/rsvp` where `<server-host>` is based on the configured [hostname](/docs/server/general#server-hostname). When a participant accesses this URL, Stalwart verifies the request and presents a lightweight RSVP interface to capture their response.

### Enabling

HTTP RSVP is **enabled by default**. Administrators who prefer not to expose this functionality can disable it by setting `calendar.scheduling.http-rsvp.enable` to `false` in the configuration file. When disabled, RSVP links will no longer be included in outgoing iMIP messages, and the RSVP endpoint will no longer be accessible.

### Custom URL

Stalwart automatically builds the RSVP URL using the value defined in the [`server.hostname` setting](/docs/server/general#server-hostname). However, administrators can override this by explicitly setting
`calendar.scheduling.http-rsvp.url`, which specifies the base URL used in invitation emails. While the path component `/calendar/rsvp` is fixed and cannot be changed, this setting allows for customization of the hostname or the inclusion of a prefix path. This is particularly useful when deploying Stalwart behind a reverse proxy or on a different hostname.

### Expiration

To control the lifespan of RSVP links, administrators can use the `calendar.scheduling.http-rsvp.expiration` setting, which accepts a duration (e.g., `7d`, `72h`). This defines how long an RSVP link remains valid after being issued. Once expired, the link will no longer allow a response, helping to prevent outdated replies and improving overall event integrity.

Example:

```toml
[calendar.scheduling.http-rsvp]
enable = true
url = "https://calendar.example.org/custom-path/calendar/rsvp"
expiration = "7d"
```

## Branding and Templating

Stalwart provides support for **custom branding and templating** in its calendar scheduling features, allowing administrators to tailor the visual appearance and messaging of outbound invitations and RSVP responses. This is particularly useful for organizations that wish to provide a consistent user experience aligned with their brand identity.

:::tip Enterprise feature

This feature is available exclusively in the [Enterprise Edition](/docs/server/enterprise) of Stalwart and not included in the Community Edition.

:::

### Templates

Stalwart includes built-in default templates for both email and web rendering, but these can be fully customized. Customizing these templates allows organizations to deliver a scheduling experience that reflects their identity, improves user trust, and ensures clarity for recipients, especially when interacting with external participants.

Templates can be written using standard HTML and may include dynamic placeholders for event-related data, participant details, and configurable elements such as colors, messages, and links. There are two HTML templates used in the scheduling system.

#### iMIP Email Template

The first template is used when generating **outbound iMIP scheduling messages**, such as invitations, updates, or cancellations. These messages include a rich HTML MIME part, rendered from a template that contains the event details, sender information, and RSVP links (if HTTP RSVP is enabled). The template also includes a logo and layout elements designed to present the invitation clearly and professionally to recipients across various email clients.

Administrators can specify alternative templates by modifying the `calendar.scheduling.template.email` configuration option. This allows for complete customization of the email appearance, including colors, fonts, and any additional information that should be included in the invitation.

Example configuration:

```toml
[calendar.scheduling.template]
email = "<html> .. custom email template.. </html>"
```

#### HTTP RSVP Web Template

The second template is used by the **HTTP RSVP module** to generate the HTML page shown to users when they follow an RSVP link. This page allows attendees to view the invitation details and respond by accepting, declining, or tentatively replying to the event. The interface is designed to be lightweight, responsive, and accessible from any modern browser.

Administrators can customize this template by modifying the `calendar.scheduling.template.web` configuration option. This allows for changes to the layout, colors, and any additional messaging that should be displayed to users when they respond to an invitation.

Example configuration:

```toml
[calendar.scheduling.template]
web = "<html> .. custom RSVP web template.. </html>"
```

### Logo

Both default templates include a **logo**, which by default is the system-wide branding logo. This logo can be **overridden on a per-tenant or per-domain basis**, allowing organizations to display the appropriate branding for different users or business units. For more information on configuring domain-specific branding, administrators are encouraged to consult the [Branding](/docs/management/webadmin/branding) section of the documentation.

