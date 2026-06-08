---
sidebar_position: 2
title: "Observability"
---

The proxy reports on its operation through structured logs, a periodic metrics summary, and a set of management endpoints that expose live statistics. Together these make it possible to confirm that routing is working, to watch the cache hit rate, and to spot a backend that has become unhealthy.

## Logging

Log output uses structured tracing, with the verbosity set by `server.log_level` (`info` by default) and overridable at runtime with the `RUST_LOG` environment variable. Each connection is logged within a span recording the listener, protocol and client address, so the events for a single session can be correlated. At `info` level the proxy logs listener binds, routing decisions at the debug level, completed sessions with their byte counts and duration, and warnings for conditions such as a backend being unavailable or a mapping store returning an undeclared destination. Lowering the level to `debug` adds per-connection routing detail and backend retry information, which is useful when diagnosing a specific account.

Account identifiers are redacted in log lines that record administrative actions, appearing as a short prefix followed by a stable hashed tag rather than the full address. This allows the same account to be recognized across log lines without writing complete addresses to the log.

## Metrics summary

Once a minute the proxy emits a metrics line summarizing the cache and connection state: the cumulative number of cache hits and misses, the resulting hit rate as a percentage, and the current number of active connections. The hit rate is the key health signal for a migration or cache-locality deployment, since a high rate confirms that most connections are resolved from memory without consulting the mapping store. A persistently low hit rate suggests that cache lifetimes are too short for the connection pattern, or that the working set exceeds `cache_max_entries`.

The same figures, plus the current number of cached entries, are available on demand from the `GET /stats` endpoint of the [management API](/docs/migration/proxy/management/api), which is convenient for scraping into an external monitoring system.

## Health endpoint

The management listener answers `GET /healthz` without authentication, returning a `200` response when the proxy is running. This is the endpoint the container image's built-in health check polls, and it is suitable for an external load balancer or orchestrator liveness probe. Because it requires no credentials, it can be called freely, while every other management endpoint requires the bearer token.

## Backend health

The current health of every destination is reported by the `GET /destinations` endpoint, which lists each destination with its consecutive-failure count and whether it is presently marked down by the circuit breaker described under [Destinations](/docs/migration/proxy/destinations). This is the quickest way to confirm whether a routing problem stems from an unreachable backend. A destination that has been marked down because of a transient outage can be returned to service immediately, without waiting for its cooldown, using the `POST /destinations/reset` endpoint.
