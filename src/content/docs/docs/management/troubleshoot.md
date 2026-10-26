---
sidebar_position: 7
title: "Troubleshooting"
description: "Where to start when mail is not delivered, authentication or sign-in fails, or the WebUI does not load: the built-in diagnostic tools, the events to look for, and links to the detailed troubleshooting sections."
---

Most problems with a mail server first appear as a symptom somewhere else: at a client, or at a remote server. A message does not arrive, a login is rejected, or a page does not load. The symptom rarely names its cause, so the first task is to find out which part of the server made the decision.

This page starts with the diagnostic tools that Stalwart provides for that purpose. It then takes the common symptoms one by one, lists the first things to check for each, and links to the page that describes the mechanism in detail.

## Tools

Three tools cover most investigations: a delivery test for outbound mail, actions that replay the checks applied to incoming mail, and the server's own event log.

### Delivery test

The delivery test traces the delivery of a message to an address or domain step by step, without sending anything. It is found in the WebUI under Management › Emails › Delivery tests. The test performs the same steps as a real delivery:

1. It resolves the MX records of the domain and their addresses.
2. It evaluates the MTA-STS and DANE policies, which tell a sender whether the receiving server must be reached over verified TLS.
3. It connects to the receiving server and negotiates TLS.
4. It checks that the recipient is accepted.

Each step is shown as it happens, so a failure appears at the step that caused it, together with its error. Running the test requires the `liveDeliveryTest` permission.

The WebUI streams the test from `GET /api/live/delivery/<target>`. The target must be a plain domain or address, and any other target makes the request fail with `400` and `Invalid delivery target`.

### Authentication and spam checks

Incoming mail passes through several authentication checks before it is accepted, and these checks explain many rejections. The `TroubleshootDmarc` [action](/docs/management/tasks-actions/actions#troubleshoot-dmarc), under Management › Actions, runs the same SPF, reverse DNS, DKIM, ARC and DMARC checks that the server applies to an incoming message. Its input is a sending IP address, an EHLO name and a sender, and optionally the message itself. The `ClassifySpam` action does the same for the spam filter, so a verdict can be reproduced without waiting for another message.

### Events and logs

Every decision the server takes is recorded as an [event](/docs/ref/events). The configured [tracers](/docs/telemetry/tracing/tracers) write these events to the log, but only from a minimum level upwards. Many of the events that explain a failure, including `auth.failed`, are logged at the `debug` level, which is below the default level of a tracer, <!-- default:Tracer.level -->`info`<!-- /default -->. These events are therefore absent from a default log.

To see them, raise the `level` of the tracer to `debug`, or to `trace` for the most detail. Alternatively, follow a single session in [live tracing](/docs/telemetry/live) (Enterprise).

## A message is not delivered

The first question is the direction of the message, because outbound and inbound failures have different causes.

For outbound mail, inspect the message in the queue (Management › Emails › Queued) or in the delivery history. Both show the last error returned by the remote server and the time of the next retry. Then run the delivery test against the recipient's domain to see at which step the delivery stops.

A message can also be accepted by the remote server and then classified as spam there. Receivers judge a sender largely by its authentication, so check the following:

- The sending IP address has a PTR record that matches the EHLO name.
- SPF covers the address.
- The message is signed with [DKIM](/docs/mta/authentication/dkim/). The default [`dkimSignDomain`](/docs/ref/object/mta-stage-data#dkimsigndomain) expression signs only messages from authenticated senders of local domains.
- The DMARC alignment holds.

The `TroubleshootDmarc` action and the receiver's `Authentication-Results` header both show which of these checks fails.

For inbound mail that is rejected, the SMTP reply names the check that failed. [Rejections and deferrals](/docs/mta/inbound/#rejections-and-deferrals) lists the replies the server sends and their causes. A connection that is closed without any reply is different: it usually comes from an address that has been [banned](/docs/server/auto-ban).

## A login fails

A failed sign-in produces an `auth.failed` event at the `debug` level, with the account name and the remote address. The event confirms that the server refused the credentials. The cause is usually one of the following:

- The account has [two-factor authentication](/docs/auth/authentication/2fa). Password sign-ins over IMAP, POP3, SMTP, ManageSieve and HTTP Basic then always fail, because the code can be entered only on the OAuth sign-in page, and the event is `auth.mfa-required` (at the `trace` level). The client needs OAuth or an [app password](/docs/auth/authentication/app-password).
- The client address has been [banned](/docs/server/auto-ban) after repeated failures. The ban is recorded as `security.authentication-ban`.
- The account is suspended, which means that its `authenticate` permission is disabled ([Suspend an account](/docs/auth/accounts/manage#suspend-an-account)).
- The password is checked by an [LDAP or SQL directory](/docs/auth/backend/). The directory then reports its own reason in the event.
- The connection has no TLS. A password login on an IMAP, POP3 or ManageSieve connection without TLS is refused while [`allowPlainTextAuth`](/docs/ref/object/imap#allowplaintextauth) is disabled. On SMTP, the default [`saslMechanisms`](/docs/ref/object/mta-stage-auth#saslmechanisms) expression offers no mechanism at all without TLS ([Request authentication](/docs/auth/authentication/#mechanisms-per-protocol)).

SCIM provisioning has its own events. When a SCIM request fails with `403` or `409`, the `scim.forbidden` and `scim.conflict` events give the reason ([Diagnosing failures](/docs/auth/scim/#diagnosing-failures)).

## OAuth or OpenID Connect sign-in fails

With OAuth, a client signs in at an authorization server and receives a token, which it then presents in place of a password. A failure can therefore come from the token, the client registration or the connection. The most common causes are:

- `OAUTHBEARER` or `XOAUTH2` used on an IMAP, POP3, SMTP or ManageSieve connection without TLS. The same applies through a TLS-terminating proxy that does not send the PROXY protocol v2 SSL TLV. In both cases these mechanisms are neither offered nor accepted ([Mail, calendar and contacts clients](/docs/auth/oauth/mail-clients#tls-on-the-mail-protocols)).
- A token without the `mail` scope used on those protocols. It is refused with `insufficient_scope`.
- An unknown client id. The sign-in page shows `Unknown client id`, and the token endpoint answers `invalid_client` with HTTP status 401. This also happens when `oauthClientId` is set on the WebUI's Application while users sign in through Stalwart's own authorization server ([Applications](/docs/management/applications/#bundle-format)).
- A scope that the client may not request, refused with `invalid_scope` ([Scopes](/docs/auth/oauth/scopes)).
- For domains of an [OpenID Connect directory](/docs/auth/backend/oidc), a token that the directory does not accept. This covers a token without the interoperable scopes while `unscopedTokens` is `reject`, an audience that is not listed in `acceptedAudiences`, and an opaque token. It also covers an account whose domain is served by another directory, which fails with `The account's domain is not served by the directory that authenticated it`. The directory page lists the logged reasons and their remedies ([Troubleshooting](/docs/auth/backend/oidc#troubleshooting)).
- A provider whose metadata does not conform to the open public clients profile. The server reports it at startup with `The identity provider does not conform to OAuth Public, PACC documents for its domains will only advertise password authentication. Missing: <items>`. Mail applications that rely on OAuth discovery then fall back to passwords.

[Authorization requests](/docs/auth/oauth/authorization) lists the errors of authorization and token requests, and when each is returned.

## WebUI fails to load

The WebUI is a separate application that the server downloads and unpacks, so it can fail while the rest of the server works. Three symptoms are common, each with its own cause:

- `/admin` and `/account` return `404 Not Found`. The WebUI bundle has not been downloaded, usually because outbound HTTPS to GitHub is blocked.
- The sign-in page loads, but the WebUI later fails to fetch a module. The unpacked files have been removed from a temporary directory.
- Sign-in fails on a hostname other than the server's public one. The WebUI is not recognised as a first-party client on that hostname.

[Loading failures](/docs/management/webui/#loading-failures) describes each case and its fix.

## Other symptoms

| Symptom | Where to look |
|---|---|
| The server does not start, a port fails to bind, or links point to the wrong address after installation | [Troubleshooting installation](/docs/install/troubleshooting) |
| The setup wizard appears again after a restart | [Setup wizard on an existing server](/docs/configuration/bootstrap-mode#setup-wizard-on-an-existing-server) |
| Connections are closed without a reply | [Diagnosing and clearing a ban](/docs/server/auto-ban#diagnosing-and-clearing-a-ban) |
| All clients behind a proxy share one address or are banned together | [Preserving the client IP](/docs/server/reverse-proxy/#preserving-the-client-ip) |
| STARTTLS is not offered, or the TLS handshake fails | [STARTTLS not offered or TLS handshake fails](/docs/server/listener#starttls-not-offered-or-tls-handshake-fails) |
| A certificate is not issued or renewed | [Failed orders](/docs/server/tls/acme/configuration#failed-orders) |
| Automatic DNS updates fail | [DNS provider notes](/docs/server/dns/provider-notes) and [Failures](/docs/domains/dns-records#failures) |
| Mail clients do not configure themselves | [Setup failures](/docs/server/clients#setup-failures) |
| Good mail is marked as spam, or spam is delivered | [Investigating a verdict](/docs/spamfilter/#investigating-a-verdict) |
| A system Sieve script does not run | [Troubleshooting system scripts](/docs/sieve/interpreter/trusted#troubleshooting-system-scripts) |
| Calendar invitations are not added, or replies are ignored | [Automatic event addition](/docs/collaboration/scheduling#automatic-event-addition) and [Supported methods](/docs/collaboration/scheduling#supported-methods) |
| No log file is written | [Log file](/docs/telemetry/tracing/tracers#log-file) and [Nothing is logged](/docs/install/troubleshooting#nothing-is-logged) |
| One session or message has to be followed through the logs | [Reading the logs](/docs/telemetry/tracing/#reading-the-logs) |
| One account is slow, or memory keeps growing | [Sizing the caches](/docs/performance/caches) and [Memory use of a node](/docs/performance/memory#memory-use-of-a-node) |
| Search results are incomplete after an import | [Search results are incomplete after an import](/docs/storage/indexing#search-results-are-incomplete-after-an-import) |
| Disk usage does not drop after deleting mail | [Disk usage does not drop after deleting mail](/docs/storage/maintenance#disk-usage-does-not-drop-after-deleting-mail) |
| A cluster node shows as stale | [Node status](/docs/cluster/configuration/node-id#node-status) |
| A change reaches only one node of a cluster | [Applying configuration changes](/docs/cluster/configuration/#applying-configuration-changes) |
| The Enterprise license does not activate | [Activation problems](/docs/server/enterprise#activation-problems) |

## Server responses

The following responses are returned to clients by specific checks. Each link leads to the page that explains the cause and the remedy.

| Response | Explained in |
|---|---|
| `550 5.7.1 Multiple author domains in From header are not allowed.` | [Messages with several author domains](/docs/mta/authentication/dmarc#messages-with-several-author-domains) |
| `552 5.3.4 Message header too large.` | [Message limits](/docs/mta/inbound/data#message-limits) |
| `452 4.3.1 Insufficient system storage, try again later.`, HTTP `503` with `Retry-After`, IMAP `NO [UNAVAILABLE]` | [Errors returned when the budget is full](/docs/performance/memory#errors-returned-when-the-budget-is-full) |
| `503 5.5.3 <text>` after a Sieve `reject` | [Replies and actions](/docs/sieve/interpreter/trusted#replies-and-actions) |
| `Cannot authenticate over plain-text.` (IMAP, POP3, ManageSieve) | [IMAP and POP3 authentication](/docs/email/settings/imap#authentication) |
| `OAUTHBEARER and XOAUTH2 require a TLS connection.` | [TLS on the mail protocols](/docs/auth/oauth/mail-clients#tls-on-the-mail-protocols) |
| A Base64-encoded JSON document with `invalid_token` or `insufficient_scope` after `OAUTHBEARER` or `XOAUTH2` | [Scope and failure responses](/docs/auth/oauth/mail-clients#scope-and-failure-responses) |
| "Unknown client id" on the sign-in page | [Sign-in](/docs/management/webui/#sign-in) and [Bundle format](/docs/management/applications/#bundle-format) |
| "You are not authorized to grant permissions: ..." | [Granting permissions to other accounts](/docs/auth/authorization/permissions#granting-permissions-to-other-accounts) |
| "You are not allowed to change the $deleted keyword." | [Shared mailboxes](/docs/email/#shared-mailboxes) |
| "URL prefixes must be a single non-empty path segment ..." or "This URL prefix is reserved for a built-in server endpoint" when saving an Application | [Mount paths](/docs/management/applications/#mount-paths) |
| "A cluster coordinator requires a Redis in-memory store, configure one first." and related errors | [Order of configuration](/docs/cluster/configuration/coordination#order-of-configuration) |
| "The selected data store has already been initialized." in the setup wizard | [Step 2: Storage](/docs/install/setup-wizard#step-2-storage) |

Short answers to frequent questions, each with a link to the page that covers it, are collected in the [FAQ](/docs/faq/).
