---
sidebar_position: 13
title: "Enterprise edition"
description: "What the Enterprise edition adds, how the license key is installed and renewed, how it relates to server hostnames and mailbox counts, and what stops when it expires."
---

Stalwart is available in two editions, and both run the same binary. The Community edition is available without a subscription. The Enterprise edition adds features for larger and multi-tenant deployments. It is activated by installing a license key, which comes with an [Enterprise subscription](https://license.stalw.art/buy).

The two editions also share one data format. Activating or cancelling a subscription therefore switches between them without a data migration: only the Enterprise features are enabled or disabled. Throughout the documentation, pages that describe an Enterprise feature mark it with an Enterprise note.

## Enterprise features

The Enterprise edition adds the following features to the Community edition:

- Multi-tenancy: [tenants](/docs/auth/authorization/tenants) with their own administrators, domains and quotas
- [SCIM provisioning](/docs/auth/scim/) of accounts from an identity provider
- [Per-domain directories](/docs/auth/backend/#per-domain-directories) and failover servers for LDAP directories
- [AI models](/docs/server/ai-models) for [AI spam classification](/docs/spamfilter/ai/) and the Sieve function `llm_prompt`, which sends a prompt to a model
- [Masked email](/docs/email/management/masked-email) addresses
- Restoration of [deleted items](/docs/management/maintenance/deleted-items) and of [deleted accounts](/docs/auth/accounts/manage)
- [Stored metrics and traces](/docs/telemetry/history), the metrics dashboard, [live telemetry](/docs/telemetry/live) and [alerts](/docs/telemetry/alerts)
- [Sharded blob and in-memory stores](/docs/storage/backends/composite), the sharded lookup store, and read replicas for PostgreSQL and MySQL data stores
- [Logos](/docs/management/webui/branding) for the WebUI, per tenant and per domain, and custom templates for calendar alarm, scheduling and RSVP messages

The [comparison page](https://stalw.art/compare/) lists the differences between the editions.

## License keys and server hostnames

Each customer receives a single license key, issued for a domain name and a number of mailboxes.

The domain name ties the key to the servers that may use it. The key is accepted by any server whose hostname, [`SystemSettings.defaultHostname`](/docs/ref/object/system-settings#defaulthostname), has the same registered domain as the license. A key issued for `example.org` therefore works on `mx1.example.org`, `mx2.example.org` and every other host under `example.org`, and all servers of a deployment use the same key. The licensed domain constrains only the server hostnames, not the mail the server handles, so the server can host mail for any number of other domains.

The mailbox count is the number of accounts the key allows, and group accounts count toward it. While the license is valid, the server enforces the count in three ways:

- Creating an account beyond that number is refused with `Enterprise licensed account limit reached: <n> accounts licensed.`
- An account from an external directory that would exceed it cannot sign in for the first time, and the log shows `Account creation not possible: license key account limit reached`.
- A key whose count is lower than the number of accounts that already exist is not activated at all, with the warning `License key is valid but only allows <n> accounts, found <m>.`

Buying more mailbox licenses raises the count of the existing key. The licensing portal issues an updated key, which replaces the installed one. Keys do not add up: the server holds one key, and installing a second key replaces the first.

## Installing the license key

The key is stored in [`licenseKey`](/docs/ref/object/enterprise#licensekey) on the [Enterprise](/docs/ref/object/enterprise) singleton (found in the WebUI under <!-- breadcrumb:Enterprise --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></svg> Enterprise<!-- /breadcrumb:Enterprise -->). Like other secrets, it can be entered as a value, or read from an environment variable or a file. The following value enters it directly:

```json
{
  "licenseKey": {
    "@type": "Value",
    "secret": "<license key>"
  }
}
```

The key is a signed string, and the server validates it offline, without connecting to the licensing server. Saving the key does not activate it yet. Two more steps follow:

1. Reload the settings with the `ReloadSettings` [action](/docs/management/tasks-actions/actions), from the WebUI or with `stalwart-cli create Action/ReloadSettings`. The server reads the key at this point.
2. Sign out of the WebUI and sign in again. The WebUI then fetches the license status again and shows the Enterprise features.

At startup, the server logs the license status. An active license is reported as `Stalwart Enterprise Edition license key is valid`, with the licensed domain, the account limit and the validity period.

A key that cannot be used is reported as a warning with its reason. The warning appears in the log at startup and at each reload, and among the warnings returned by the `ReloadSettings` action. The reasons are:

- `License issued to domain "<licensed domain>" does not match "<server domain>"`: the registered domain of `defaultHostname` differs from the licensed domain. Correct the hostname or request a key for the server's domain.
- `License is expired`: the key's validity has ended, as described in [Automatic renewal](#automatic-renewal) and [License expiry](#license-expiry).
- `Failed to decode license key` or `Failed to validate license key`: the key was not copied completely, or is not a Stalwart license key.
- `Invalid domain "<hostname>"`: `defaultHostname` has no registered domain, for example `localhost` or a host name without a domain.

## Automatic renewal

License keys are valid for a fixed period, so a key installed by hand has to be replaced before it expires. Automatic renewal removes that task. It requires an API key from the [licensing portal](https://license.stalw.art), stored in [`apiKey`](/docs/ref/object/enterprise#apikey), which accepts the same secret formats as `licenseKey`. With the API key in place, the server renews the license itself.

Renewal starts four days before the license expires. A failed attempt is repeated every 24 hours, and every hour once less than 24 hours remain. A renewed key replaces the installed one and is stored in `licenseKey` as a `Value`. That happens also when the installed key was read from an environment variable or a file.

The server contacts the portal only within these last four days. A mailbox count raised in the middle of the term therefore reaches the server through automatic renewal only at the next renewal. To use it at once, install the updated key from the portal.

The API key also helps when no usable license key is installed, because the key is missing, expired or does not match the server's domain. When the server starts or reloads in that state with an API key configured, it requests a key from the portal immediately. A failure is then logged with the reason the renewal failed, which may differ from the reason the installed key was refused.

After expiry, renewal attempts continue for as long as the API key is set. The intervals start at five minutes and grow to one hour, and each failure logs the `server.licensing` event `Enterprise license renewal failed, retrying`. Without an API key, the server logs `License is expired` and runs without Enterprise features until a new key is installed and the settings are reloaded.

## License expiry

A license has no grace period: it is valid from its start date until the moment of its expiry date. Expiry disables features but destroys nothing. Configuration and stored data are not deleted, and the features work again once a valid key is installed.

When the license expires, the Enterprise features stop at one of two moments, depending on how the server checks the license for them. For some features, the server checks the license each time they are used, so these stop at the moment of expiry:

- SCIM: every request to `/scim/v2` is answered with 403.
- Multi-tenancy: tenant administrators keep only ordinary user permissions, and tenant quotas are no longer enforced. Tenants and their accounts and domains remain.
- Per-domain directories: all domains are looked up in the default directory. The directories themselves are dropped later, as listed below.
- The licensed account limit is no longer enforced.
- Masked email: mail to masked addresses is rejected as addressed to an unknown recipient, and masks can no longer be created or changed.
- Access to archived items and their restoration, and restoring deleted accounts, stop.
- Access to stored metrics and traces and live telemetry stops. Logging to files, the console, the journal and OpenTelemetry, webhooks and the basic Prometheus metrics keep working.
- Logos are no longer shown.

The other features are set up when the configuration is loaded, so they stop when the configuration is next loaded after expiry. During the license's last day, the server checks the license every hour and reloads it. In practice these features therefore stop within an hour of expiry, or at the next restart:

- Per-domain directories are dropped and LDAP failover servers are disabled.
- SQL read replicas are dropped and the primary data store serves all queries.
- Metrics and trace storage and the collection of history stop, and metric alerts are no longer evaluated.
- The AI spam classifier adds no tags and `llm_prompt` returns `false`. The rest of the spam filter keeps working.
- Deleted items are no longer archived.
- Custom alarm, scheduling and RSVP templates are replaced by the built-in ones.
- The retention purge of traces and metrics stops.

Sharded blob and in-memory stores are the exception. They remain in use without a license, because no other store holds their data, and switching them off would make that data unreachable. Each time the configuration is loaded without a license, at startup or at a reload, the server logs a warning, and the reload still succeeds. For blob stores the warning reads `Sharded blob stores require an Enterprise licence, the configured store remains in use.`, and the in-memory store has an equivalent message.

## Activation problems

Sometimes a key is installed but brings no Enterprise features, or does not bring the expected mailbox count. The cause is one of the following:

- **The domain does not match.** The log and the result of `ReloadSettings` show `License issued to domain ... does not match ...`. The license is checked against the registered domain of `SystemSettings.defaultHostname`, not against the mail domains the server hosts.
- **The mailbox count did not change after a purchase.** The installed key still carries the old count. Download the updated key from the portal and install it, because automatic renewal brings the new count only in the last four days of the term.
- **A second key was installed for another server.** All servers under the licensed domain use the same key, so a separate key for each server is not needed and does not add mailboxes.
- **The features are not visible in the WebUI.** Reload the settings and sign in again. If they still do not appear, read the warnings returned by `ReloadSettings`.
- **The key allows fewer accounts than exist.** The log shows `License key is valid but only allows <n> accounts, found <m>.` Buy the missing mailbox licenses or remove accounts.
