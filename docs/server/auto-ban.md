---
sidebar_position: 6
---

# Auto-banning

Stalwart includes an automatic ban mechanism that monitors incoming connections for abusive patterns and blocks the offending IP address when configured thresholds are exceeded. Once an address is banned, the server drops every subsequent connection from that source, shutting down further abuse without operator intervention.

The system tracks several independent categories of suspicious activity: failed authentication attempts, SMTP relay or recipient-probing abuse, idle (loitering) sessions, and port or URL scanning. Each category has its own rate limit, and each rate is evaluated separately; reaching the threshold for any category produces a ban. Banned IP addresses are recorded as [BlockedIp](/docs/ref/object/blocked-ip) entries (found in the WebUI under <!-- breadcrumb:BlockedIp --><!-- /breadcrumb:BlockedIp -->), alongside any entries created manually from the [WebUI](/docs/management/webui/overview) or the [CLI](/docs/management/cli/overview).

Authentication ban tracking keys on both the source IP and the login name, so distributed brute-force attempts against a single account are detected even when the attacker rotates IP addresses.

## Configuration

Auto-ban thresholds are grouped on the [Security](/docs/ref/object/security) singleton (found in the WebUI under <!-- breadcrumb:Security --><!-- /breadcrumb:Security -->). Each category exposes a `*BanRate` field (count over period) and an optional `*BanPeriod` duration that sets how long resulting bans last; omitting `*BanPeriod` leaves the ban in place until it is removed manually. Leaving `scanBanPaths` at its default covers common exploit URLs (`*.php*`, `*.cgi*`, `*/wp-*`, `*xmlrpc*`, traversal patterns, and the names of popular CMS platforms).

Every resulting BlockedIp carries a [`reason`](/docs/ref/object/blocked-ip#reason) recording what triggered the ban (one of `authFailure`, `rcptToFailure`, `loitering`, `portScanning`, `manual`, or `other`) and an [`expiresAt`](/docs/ref/object/blocked-ip#expiresat) timestamp. When a category's `*BanPeriod` is set, `expiresAt` is populated with the corresponding deadline and the entry is removed automatically once the time passes; leaving the period unset stores the ban indefinitely until an operator deletes it. Manual entries created through the WebUI or the CLI carry [`reason`](/docs/ref/object/blocked-ip#reason) `manual` and can set their own [`expiresAt`](/docs/ref/object/blocked-ip#expiresat) at creation time.

### Authentication failures

Authentication failures across every service (JMAP, IMAP, SMTP, ManageSieve) feed into a single counter per source. The rate is set through [`authBanRate`](/docs/ref/object/security#authbanrate) with a default of `100` failures per day, and the resulting ban duration is controlled by [`authBanPeriod`](/docs/ref/object/security#authbanperiod).

### Abuse protection

Relay attempts and brute-force RCPT TO probing against the SMTP server are tracked together. The rate is set through [`abuseBanRate`](/docs/ref/object/security#abusebanrate) with a default of `35` attempts per day, and the ban duration through [`abuseBanPeriod`](/docs/ref/object/security#abusebanperiod).

### Loitering connections

Clients that repeatedly connect but never send meaningful traffic consume resources and are often part of SYN-flood-style denial-of-service attempts. The rate is set through [`loiterBanRate`](/docs/ref/object/security#loiterbanrate) with a default of `150` disconnections per day, and the ban duration through [`loiterBanPeriod`](/docs/ref/object/security#loiterbanperiod).

### Port and URL scanning

The server tracks attempts to probe TCP ports it is not listening on, as well as HTTP requests for exploit-style paths. The scan rate is set through [`scanBanRate`](/docs/ref/object/security#scanbanrate) (default `30` attempts per day), the ban duration through [`scanBanPeriod`](/docs/ref/object/security#scanbanperiod), and the list of glob patterns that trigger an immediate ban on first HTTP request through [`scanBanPaths`](/docs/ref/object/security#scanbanpaths). The default patterns cover the most common web-application exploits:

```json
{
  "scanBanRate": {"count": 30, "period": "1d"},
  "scanBanPaths": [
    "*.php*",
    "*.cgi*",
    "*.asp*",
    "*/wp-*",
    "*/php*",
    "*/cgi-bin*",
    "*xmlrpc*",
    "*../*",
    "*/..*",
    "*joomla*",
    "*wordpress*",
    "*drupal*"
  ]
}
```
