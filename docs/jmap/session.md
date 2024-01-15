---
sidebar_position: 2
---

# Sessions

A session represents the stateful interaction between the client and the server. It maintains the state of a user's actions and can be used to handle user requests more efficiently. When a client connects to the JMAP server, a new session is initiated. This session contains necessary details like account details, permissions, disk quotas, etc. 

## Session cache

The session cache is a memory data structure that stores active session data for efficient access and usage. The following attributes can be configured for the session cache under the `jmap.session.cache` section:

- `ttl`: The "Time To Live" setting for the session cache. This determines how long a session will stay alive in the cache without being accessed before it is considered expired and thus subject to removal.
- `size`: This setting defines the maximum number of sessions that can be stored in the cache at any given time. If the maximum size is reached, older, less-recently-used sessions may be evicted to make room for new ones.

For example:

```toml
[jmap.session.cache]
ttl = "1h"
size = 100
```

## Session purging

Stalwart Mail Server runs periodically an automated task for purging expired sessions. A session is considered expired when it has not been accessed for a certain period of time, known as its Time-To-Live (TTL). When a session exceeds its TTL without being accessed, Stalwart identifies it as "expired". The cleanup task runs at a configurable interval, and during each run, it identifies and deletes these expired sessions, freeing up memory and reducing clutter in the system.

The schedule for this task can be configured in the `jmap.session.purge.frequency` section using a simplified [cron-like syntax](/docs/configuration/values/cron).

For example, to run the job every hour at 15 minutes past the hour:

```toml
[jmap.session.purge]
frequency = "15 * *"
```
