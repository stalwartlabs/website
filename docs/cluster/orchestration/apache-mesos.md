---
sidebar_position: 4
---

# Apache Mesos

Apache Mesos is a distributed systems kernel that abstracts and pools resources (CPU, memory, storage, and network) across a data centre or cloud environment. It supports efficient resource sharing across diverse workloads, which suits large-scale, fault-tolerant distributed applications.

Mesos uses a two-level scheduling model: it manages low-level resource allocation and delegates task scheduling to higher-level frameworks. This allows systems such as Stalwart to run alongside other services in a shared infrastructure while retaining control over how and where tasks are executed.

Stalwart can be deployed on Apache Mesos either as a containerised service using Mesos support for Docker and other container runtimes, or through a dedicated framework or scheduler that manages node placement and health monitoring.

Running Stalwart under Mesos offers administrators a flexible and scalable orchestration option, particularly in environments where Mesos is already used for a diverse set of workloads. With appropriate coordination and configuration, Mesos restarts Stalwart nodes on failure, scales them based on demand, and distributes them across available resources.

## Deployment

Deploy Stalwart using the Marathon CLI:

```bash
$ marathon app add stalwart.json
```

Below is an example JSON configuration file for deploying Stalwart on Apache Mesos via Marathon:

```json
{
  "id": "/stalwart-mail-ha",
  "cpus": 1,
  "mem": 2048,
  "instances": 2,
  "container": {
    "type": "DOCKER",
    "docker": {
      "image": "stalwartlabs/stalwart:latest",
      "network": "HOST",
      "forcePullImage": true
    },
    "volumes": [
      {
        "containerPath": "/opt/stalwart/data",
        "persistent": {
          "type": "root",
          "size": 10240,
          "constraints": [["path", "LIKE", "/mnt/stalwart/data"]]
        },
        "mode": "RW"
      },
      {
        "containerPath": "/opt/stalwart/config",
        "hostPath": "/var/lib/stalwart/config",
        "mode": "RO"
      }
    ]
  },
  "env": {
    "STALWART_HOSTNAME": "mail.example.com",
    "STALWART_DOMAINS": "example.com",
    "STALWART_ADMIN_PASSWORD": "YOUR_SECURE_PASSWORD",
    "STALWART_STORAGE_TYPE": "postgres",
    "STALWART_DB_HOST": "postgres.example.com",
    "STALWART_DB_NAME": "stalwart_mail",
    "STALWART_DB_USER": "stalwart",
    "STALWART_DB_PASSWORD": "db_password"
  },
  "portDefinitions": [
    { "port": 25, "protocol": "tcp", "name": "smtp" },
    { "port": 465, "protocol": "tcp", "name": "smtps" },
    { "port": 587, "protocol": "tcp", "name": "submission" },
    { "port": 143, "protocol": "tcp", "name": "imap" },
    { "port": 993, "protocol": "tcp", "name": "imaps" },
    { "port": 443, "protocol": "tcp", "name": "http" }
  ],
  "healthChecks": [
    {
      "protocol": "HTTP",
      "path": "/health",
      "portIndex": 5,
      "gracePeriodSeconds": 300,
      "intervalSeconds": 60,
      "timeoutSeconds": 20,
      "maxConsecutiveFailures": 3
    }
  ],
  "upgradeStrategy": {
    "minimumHealthCapacity": 0.5,
    "maximumOverCapacity": 0.2
  }
}
```

<!-- review: The example relies on `STALWART_HOSTNAME`, `STALWART_DOMAINS`, `STALWART_ADMIN_PASSWORD`, and several `STALWART_DB_*` environment variables that are not documented in `/docs/configuration/environment-variables.md` (which lists only the recovery/bootstrap variables and `STALWART_ROLE` / `STALWART_PUSH_SHARD`). Confirm whether these deployment variables still apply or whether storage and domain configuration is now expected to be seeded through the bootstrap flow instead. -->
