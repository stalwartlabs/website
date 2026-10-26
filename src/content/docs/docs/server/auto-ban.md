---
sidebar_position: 5
title: "Auto-ban"
description: "Automatic banning of IP addresses that fail authentication, probe recipients, hold idle connections or scan for exploits, and how to diagnose and clear a ban."
---

A server on the internet receives a steady stream of hostile traffic: bots that guess passwords, senders that probe for valid recipients, and scanners that look for known vulnerabilities. Each attempt costs little, but together they waste resources and, for password guessing, put accounts at risk. Auto-ban protects the server by blocking the IP addresses that behave this way.

The mechanism is simple. The server counts suspicious events per source address, and when a count exceeds its threshold, it records the address as blocked. From then on, every connection from that address is closed as soon as it is accepted, on every listener. The server closes it before the TLS handshake and before it sends any greeting.

Banned addresses are stored as [BlockedIp](/docs/ref/object/blocked-ip) objects (found in the WebUI under <!-- breadcrumb:BlockedIp --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg> Security › Blocked IPs<!-- /breadcrumb:BlockedIp -->). They share one list with the addresses that an administrator blocks by hand. In a cluster, all nodes share this list, so an address banned on one node is refused by every other.

## Counted events

The server watches for four kinds of suspicious behaviour, and keeps a separate count for each. Every category has its own limit, expressed as a number of events within a period, and an address that reaches the limit in any one category is banned. The limits are fields of the [Security](/docs/ref/object/security) singleton (found in the WebUI under <!-- breadcrumb:Security --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg> Security › Settings<!-- /breadcrumb:Security -->):

| Category | Counted events | Rate field | Default | Ban reason |
|---|---|---|---|---|
| Authentication failures | Failed sign-ins on every protocol | [`authBanRate`](/docs/ref/object/security#authbanrate) | <!-- default:Security.authBanRate -->100 per day<!-- /default --> | `authFailure` |
| Abuse | Failed `RCPT TO` commands: relay attempts and probing for valid recipients | [`abuseBanRate`](/docs/ref/object/security#abusebanrate) | <!-- default:Security.abuseBanRate -->35 per day<!-- /default --> | `rcptToFailure` |
| Loitering | SMTP sessions closed because they stayed open longer than the session time limit (`421 4.3.2 Session open for too long.`) | [`loiterBanRate`](/docs/ref/object/security#loiterbanrate) | <!-- default:Security.loiterBanRate -->150 per day<!-- /default --> | `loitering` |
| Scanning | Unknown commands or unparsable input from clients that have not authenticated, on SMTP, IMAP, POP3 and ManageSieve, and malformed HTTP requests | [`scanBanRate`](/docs/ref/object/security#scanbanrate) | <!-- default:Security.scanBanRate -->30 per day<!-- /default --> | `portScanning` |

Two categories are also counted by their target, not only by the address. Authentication failures are counted per account name as well as per address, so an attack that rotates through many addresses against one account still triggers bans. Abuse is counted per recipient in the same way. Once an address is banned, its counters are reset.

Setting a rate to null disables counting for its category. Scanning has one exception. An HTTP request for a path that no endpoint serves, and that matches one of the [`scanBanPaths`](/docs/ref/object/security#scanbanpaths) patterns, bans the address at the first request, whatever the value of `scanBanRate`. This ban is therefore disabled only by emptying `scanBanPaths`. The default patterns, all listed in the reference, match common exploit probes, such as paths containing `.php`, `cgi-bin`, `wp-` or `../`.

## Ban duration

Automatic bans are permanent unless a ban period is set. Each category has its own period field: [`authBanPeriod`](/docs/ref/object/security#authbanperiod), [`abuseBanPeriod`](/docs/ref/object/security#abusebanperiod), [`loiterBanPeriod`](/docs/ref/object/security#loiterbanperiod) and [`scanBanPeriod`](/docs/ref/object/security#scanbanperiod). None of them is set by default, so every automatic ban lasts until its BlockedIp entry is deleted.

When a period is set, the ban's [`expiresAt`](/docs/ref/object/blocked-ip#expiresat) is set accordingly, and the ban is no longer enforced once that time has passed. The expired entry stays in the blocked list until the list is next loaded. At that point it is deleted, and a `security.ip-block-expired` event is logged. A new ban for an address that is already banned never shortens the existing ban.

The choice between permanent and temporary bans is a tradeoff. A permanent ban keeps a persistent attacker out for good, but it also turns every false positive into a lockout that an administrator has to clear by hand. Shared addresses make false positives likely: behind a single NAT address, such as an office network, the failures of every user add up. A deployment whose users connect from shared addresses should therefore either set ban periods or add those addresses to the allowed list described below.

## Exemptions

Some addresses must never be banned, whatever they do. The server never bans or blocks the following:

- Addresses and networks in the allowed list, stored as [AllowedIp](/docs/ref/object/allowed-ip) objects (found in the WebUI under <!-- breadcrumb:AllowedIp --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg> Security › Allowed IPs<!-- /breadcrumb:AllowedIp -->), each optionally with an expiry time
- The loopback addresses `127.0.0.1` and `::1`
- The networks in [`SystemSettings.proxyTrustedNetworks`](/docs/ref/object/system-settings#proxytrustednetworks), so that a load balancer sending the PROXY protocol is not banned for the clients behind it

The allowed list is the place for sources that must always reach the server: monitoring systems, the administrator's network and the addresses of internal relays. Addresses on it are also exempt from the HTTP rate limits.

Auto-ban is suspended entirely during [recovery mode](/docs/configuration/recovery-mode) and bootstrap. In those modes no address is banned, and existing bans are not enforced.

## Clients behind a proxy

The server bans the address it sees as the client, and behind a proxy that is not necessarily the client's own address. A reverse proxy or load balancer that does not pass the client's address on makes every client appear with the proxy's address. A single misbehaving client, or the sum of all clients' failed sign-ins, then bans the proxy, and with it every user. To avoid this, pass the client address with the PROXY protocol or, for HTTP, with a forwarding header, as described in [Reverse proxy](/docs/server/reverse-proxy/#preserving-the-client-ip).

With a forwarding header, HTTP bans work slightly differently. When [`Http.clientIpSource`](/docs/ref/object/http#clientipsource) takes the client address from a forwarding header, HTTP bans apply to that address:

- A request for a `scanBanPaths` pattern bans the address from the header.
- Malformed requests are not counted.
- A banned forwarded address does not close the connection, because the connection itself belongs to the proxy. Instead, each request from that address is answered with HTTP `403` and logs `security.ip-blocked`.

## Diagnosing and clearing a ban

A ban is hard to recognise from the client side. The connection is closed before the server sends anything, so the symptoms do not point to the cause:

- A client reports "connection reset", "connection closed" or a TLS handshake failure.
- A reverse proxy in front of the server returns `502 Bad Gateway`.
- A port, including 8080, seems to stop answering for one host while it works from others.
- Behind a proxy that sends a forwarding header, requests from one client receive HTTP `403`.

To confirm a ban:

1. Look for the `security.ip-blocked` event, which is logged for every refused connection with the remote address and the listener. The ban itself was logged when it happened, as `security.authentication-ban`, `security.abuse-ban`, `security.loiter-ban` or `security.scan-ban`.
2. Look for the address in the blocked list in the WebUI, or list the entries with the CLI:

   ```sh
   stalwart-cli query BlockedIp
   ```

   The `reason` field shows which category caused the ban.

To clear the ban, delete the BlockedIp entry, in the WebUI or with the CLI. Then reload the list of blocked addresses with the `ReloadBlockedIps` [action](/docs/management/tasks-actions/actions), so that the server stops enforcing the deleted entry:

```sh
stalwart-cli delete BlockedIp --ids <id>
stalwart-cli create Action/ReloadBlockedIps
```

Adding the address to the allowed list also lifts the ban, because allowed addresses are never blocked. The allowed list, however, takes effect only after the `ReloadSettings` action or a restart.

Clearing a ban does not stop it from recurring. To keep it from happening again, add the address to the allowed list, set a ban period for the category, or correct the client that caused it. The cause is typically a device that keeps retrying with an old password.

The administrator's own address can be banned too. The CLI still works when it is run on the server host itself, because loopback is never banned. When that is not possible either, start the server in [recovery mode](/docs/configuration/recovery-mode), where bans are not enforced, and delete the entry from there.
