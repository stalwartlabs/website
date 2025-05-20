---
sidebar_position: 2
---

# Threads

Stalwart maintains a pool of delivery threads that are used to send messages both locally and to remote SMTP servers. It is important to configure the number of delivery threads to ensure that the server can handle the required load. A number too low can result in slow message delivery, while a number too high can lead to high memory usage and CPU load.

## Remote Delivery

The number of threads used to deliver messages to remote SMTP servers is controlled by the `queue.outbound.threads` attribute and the default value is set to 25 threads. For example, to increase the number of threads to 50:

```toml
[queue.threads]
remote = 50
```

## Local Delivery

The number of threads used to deliver messages locally is controlled by the `queue.local.threads` attribute and the default value is set to 10 threads. For example, to increase the number of threads to 20:

```toml
[queue.threads]
local = 20
```

