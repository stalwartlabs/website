---
sidebar_position: 2
title: "Observability"
description: "The proxy's logs, its periodic metrics line, the health endpoint and the destination health report."
---

The proxy reports its operation through three channels: structured logs, a metrics line written every minute, and management API endpoints with current statistics. Together they answer three questions: whether routing works, how well the mapping cache performs, and whether a backend has become unhealthy.

## Logs

The proxy logs with structured tracing. The verbosity is set by `server.log_level`, `info` by default, and can be overridden with the `RUST_LOG` environment variable.

Each connection is logged within a span that records the listener, the protocol and the `peer` address of the TCP connection. Behind a load balancer that sends PROXY headers, `peer` is the load balancer's address.

The two main levels differ in detail:

- At `info`, the proxy logs listener binds, mail sessions that end normally after authentication with their byte counts and duration, and warnings, such as an unreachable mail backend or a mapping store that returned an undeclared destination.
- At `debug`, it adds the retries of backend connections, failures attributed to clients and, for IMAP, the routing decision of each connection. This level helps when investigating one account.

HTTP requests and pass-through SMTP sessions are not logged individually, so an unreachable HTTP backend shows only as `502 Bad Gateway` to the client, and in `GET /destinations`.

Account identifiers in the log lines of management actions are shortened to a prefix followed by a stable hashed tag. The same account can therefore be followed across lines without full addresses in the log.

## Metrics line

Every minute, the proxy logs a metrics line with the cumulative cache hits and misses, the hit rate as a percentage, and the number of active connections.

The hit rate is the main health signal of the mapping layer. A high rate shows that most connections resolve from memory. A persistently low rate suggests one of two problems: the cache lifetimes are too short for the connection pattern, or the number of active accounts exceeds `cache_max_entries`.

The same figures, with the number of cached entries, are returned by `GET /stats` on the [management API](/docs/migration/proxy/management/api#statistics), which suits collection by an external monitoring system.

## Health endpoint

While the proxy runs, the management API answers `GET /healthz` with `200 OK`, without authentication. The container image's health check uses this endpoint, and it also suits the liveness probe of a load balancer or orchestrator. An address that has been locked out after failed authentications receives `429 Too Many Requests` from this endpoint as well.

## Destination health

`GET /destinations` reports, for each destination, the number of consecutive failures, and whether the circuit breaker described under [Destinations](/docs/migration/proxy/destinations#health-and-resilience) has marked it down. It is the quickest way to tell whether a routing problem comes from an unreachable backend.

A destination marked down after a temporary outage does not have to wait for its cooldown. `POST /destinations/reset` returns it to service at once.
