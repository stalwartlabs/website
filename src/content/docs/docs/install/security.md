---
sidebar_position: 4
title: "Securing the server"
description: "Close the listeners a deployment does not use, protect the setup listener, retire the recovery administrator, restrict HTTP endpoints and review the remaining settings before going live."
---

A mail server is exposed to the internet by its nature. It must accept connections from any other mail server, and its sign-in ports are open to anyone who tries to guess a password. A new Stalwart server therefore starts with protections already active: [auto-ban](/docs/server/auto-ban) blocks addresses that repeatedly fail authentication, probe for accounts or scan for vulnerable HTTP paths, and the [default rate limits](/docs/mta/inbound/rate-limit) restrict how fast a single client can submit mail.

Other protections depend on decisions that only the administrator can make: which protocols the users need, who administers the server, and what sits in front of it on the network. No default can make these safe, because the right answer differs from one deployment to the next. This page walks through them. It continues the installation tutorials ([Linux, macOS and FreeBSD](/docs/install/platform/linux), [Docker](/docs/install/platform/docker), [Windows](/docs/install/platform/windows)) after the test message, and its steps belong before the server is used in production.

## Retire the recovery administrator

The `STALWART_RECOVERY_ADMIN` environment variable, if it was set during the installation, defines an administrator that does not depend on the directory. While the variable is set, the server accepts the credential at every start, also in normal operation. The credential also acts as a master user: a sign-in as `<account>%<recovery admin>` with the recovery password opens that account, as described in [Impersonation](/docs/auth/authorization/administrator#impersonation). A forgotten variable is therefore a permanent full-access credential. [Recovery administrator](/docs/configuration/recovery-mode#recovery-administrator) describes it.

Once a permanent administrator account exists and has been used to sign in, remove the variable from the service environment and restart the server. The variable lives in the environment file for installations made with the script, in the container environment for Docker, and on the NSSM **Environment** tab on Windows.

## Remove listeners that are not needed

The server creates the following listeners at first start, each bound to all interfaces (`[::]`):

| Listener | Port | Protocol | TLS |
|---|---|---|---|
| `smtp` | 25 | SMTP, mail from other servers | STARTTLS |
| `submissions` | 465 | SMTP submission from clients | Implicit TLS |
| `imaps` | 993 | IMAP | Implicit TLS |
| `pop3s` | 995 | POP3 | Implicit TLS |
| `sieve` | 4190 | ManageSieve | STARTTLS |
| `https` | 443 | HTTP: JMAP, CalDAV, CardDAV, WebDAV, WebUI, OAuth, autoconfiguration | Implicit TLS |
| `http` | 8080 | HTTP | None |

Ports 587 (submission with STARTTLS), 143 (IMAP) and 110 (POP3) have no listener unless the administrator creates one, as described in [Listeners](/docs/server/listener). Each listener that remains is a service exposed to the internet, so remove those the deployment does not use:

- `pop3s` when no client uses POP3
- `sieve` when users do not manage Sieve filters from a ManageSieve client, since filters can also be managed through JMAP and the WebUI
- `http` on port 8080 once the setup is finished and HTTPS on port 443 works

The `http` listener serves the same endpoints as `https` over plain HTTP, and the HTTP API accepts passwords on it through Basic authentication without encryption. The WebUI sign-in does not work on it in normal operation, because the server binds OAuth sign-in to its HTTPS address. Behind a reverse proxy that connects to Stalwart over plain HTTP, keep the listener but make it reachable only from the proxy.

Deleting a listener's [NetworkListener](/docs/ref/object/network-listener) object removes it, and the change takes effect after a restart. Blocking the port in a firewall has the same effect for external clients. Port 25 must stay open to receive mail, and 443 is needed by most clients and by the default ACME challenge.

## Protect the setup listener

During [bootstrap](/docs/configuration/bootstrap-mode) and [recovery mode](/docs/configuration/recovery-mode), the server replaces every listener with a single plain HTTP listener on port 8080 (or the port set by `STALWART_RECOVERY_MODE_PORT`) bound to all interfaces, `[::]`, or `0.0.0.0` on hosts without IPv6. The bind address cannot be changed. In these modes auto-ban, rate limits and HTTP access control rules are not applied, and permissive CORS headers are sent, so the listener has no protection against password guessing. Anyone who reaches it during bootstrap and knows or guesses the temporary password can configure the server.

Keep the listener off the internet while these modes are active:

- With Docker, publish the port on the loopback interface of the host only, `-p 127.0.0.1:8080:8080`, and reach it from another machine through an SSH tunnel (`ssh -L 8080:127.0.0.1:8080 <host>`). Do not change the bind address inside the container: the image health check connects to `127.0.0.1:8080` inside the container, and Docker forwards published ports to the container's network interface.
- On a host installed with the installation script, block port 8080 in the host firewall for every source except the administrator's address, or use an SSH tunnel as above.
- In either case the host can stay unreachable from the internet until the setup wizard is completed.

## Separate administrator accounts

The administrator created by the setup wizard holds every permission. For daily work, create administrator accounts with only the [permissions](/docs/auth/authorization/permissions) each person needs, for example one role for account management and another for the mail queue, so that a leaked credential or a mistake affects only that area. Use these accounts only for administration, not as mailboxes in IMAP, JMAP or DAV clients, so that administrative credentials are not stored in mail and calendar applications on many devices.

## Restrict HTTP endpoints

The HTTP listeners serve every HTTP-based service from the same port: JMAP, CalDAV, CardDAV and WebDAV, the WebUI and the management API, OAuth, autoconfiguration, MTA-STS policy files, metrics and the form submission endpoint. [HTTP access control](/docs/http/access-control) rules are expressions evaluated for every request that can refuse paths, methods or source addresses, for example to make the management API or `/metrics` reachable only from an internal network, or to disable WebDAV file storage. The [list of HTTP endpoints](/docs/http/) shows what each path serves.

## Before going live

The steps above close the exposures that every deployment has. The following settings and features are worth a review as well, because their right values depend on the users and the network. Each item links to the page that explains it:

- The password policy of the internal directory, set by [`minPasswordLength`](/docs/ref/object/authentication#minpasswordlength), [`maxPasswordLength`](/docs/ref/object/authentication#maxpasswordlength) and [`minPasswordStrength`](/docs/ref/object/authentication#minpasswordstrength) on the [Authentication](/docs/ref/object/authentication) object, as described in [Passwords](/docs/auth/authentication/password).
- [Two-factor authentication](/docs/auth/authentication/2fa) and [app passwords](/docs/auth/authentication/app-password) for accounts in the internal directory.
- The protocol versions and cipher suites the listeners accept, described in [TLS](/docs/server/tls/).
- The auto-ban thresholds and exemptions. Addresses that must never be banned, such as monitoring systems and the administrator's network, belong in the allowed IP list, as described in [Auto-ban](/docs/server/auto-ban).
- The rate limits for inbound SMTP and for HTTP, described in [Inbound rate limits](/docs/mta/inbound/rate-limit) and [HTTP settings](/docs/http/settings#rate-limiting).
- The trust placed in a reverse proxy. When a proxy sits in front of the server, configure how the client address is obtained, so that bans and rate limits apply to clients and not to the proxy, as described in [Reverse proxy](/docs/server/reverse-proxy/).
- Port 8080, which must be closed to the internet as described above.
- The service account. The installation script and the container image run the server as an unprivileged user, and a server started as root by other means should set `RUN_AS_USER` and `RUN_AS_GROUP`, which make it drop privileges after binding its ports, as described in [Environment variables](/docs/configuration/environment-variables).

## Next step

The server is ready for production. [Next steps](/docs/install/next-steps) lists the tasks that usually follow: further domains and accounts, client setup, backups and upgrades.
