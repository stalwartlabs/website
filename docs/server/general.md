---
sidebar_position: 1
---

# General

General server settings are grouped on the [SystemSettings](/docs/ref/object/system-settings) singleton (found in the WebUI under <!-- breadcrumb:SystemSettings --><!-- /breadcrumb:SystemSettings -->). This page covers the hostname, the CPU thread pool, and IP address allow / block lists. Per-listener concurrency is described on the [Listeners](/docs/server/listener) page.

## Server hostname

The default server hostname is used in SMTP `EHLO` commands, in message headers, and in reports. It is configured through [`defaultHostname`](/docs/ref/object/system-settings#defaulthostname) on the SystemSettings singleton. If the field is left unset, the server falls back to the hostname reported by the operating system.

## Thread pool size

Stalwart runs CPU-intensive tasks on a dedicated thread pool. The pool size is controlled by [`threadPoolSize`](/docs/ref/object/system-settings#threadpoolsize) on the SystemSettings singleton. When left unset, the server allocates one worker per CPU core detected at start-up. Raising the value above the number of available cores does not generally improve throughput.

## IP address blocking

IP addresses and ranges can be rejected at connection time. Each blocked entry is represented by a [BlockedIp](/docs/ref/object/blocked-ip) record (found in the WebUI under <!-- breadcrumb:BlockedIp --><!-- /breadcrumb:BlockedIp -->); the [`address`](/docs/ref/object/blocked-ip#address) field accepts a single IP address or a CIDR mask such as `203.0.113.0/24`, and [`expiresAt`](/docs/ref/object/blocked-ip#expiresat) can be set to make the block temporary.

When [auto-banning](/docs/server/auto-ban) is enabled, the server creates BlockedIp records automatically for sources that exceed the configured thresholds. Manual entries can be managed from the [WebUI](/docs/management/webui/overview) or the [CLI](/docs/management/cli/overview).

## IP address allow list

IP addresses and ranges that should bypass rate limits and auto-banning are represented by [AllowedIp](/docs/ref/object/allowed-ip) records (found in the WebUI under <!-- breadcrumb:AllowedIp --><!-- /breadcrumb:AllowedIp -->). The [`address`](/docs/ref/object/allowed-ip#address) field accepts a single IP address or a CIDR mask, and [`expiresAt`](/docs/ref/object/allowed-ip#expiresat) can be used for time-bounded allowances. The localhost addresses `127.0.0.1` and `::1` are allowed by default to prevent accidental lockouts.

## Run as user

On Linux systems, Stalwart requires the `CAP_NET_BIND_SERVICE` capability to bind to privileged ports (those below 1024). On older systems that do not support this capability, Stalwart can be started as `root` and then drop privileges to a non-privileged account. The target user and group are selected through the `RUN_AS_USER` and `RUN_AS_GROUP` environment variables.
