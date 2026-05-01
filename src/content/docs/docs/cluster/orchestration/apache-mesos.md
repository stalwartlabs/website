---
sidebar_position: 4
title: "Apache Mesos"
---

Apache Mesos is a distributed systems kernel that abstracts and pools resources (CPU, memory, storage, and network) across a data centre or cloud environment. It supports efficient resource sharing across diverse workloads, which suits large-scale, fault-tolerant distributed applications.

Mesos uses a two-level scheduling model: it manages low-level resource allocation and delegates task scheduling to higher-level frameworks. This allows systems such as Stalwart to run alongside other services in a shared infrastructure while retaining control over how and where tasks are executed.

Stalwart can be deployed on Apache Mesos either as a containerised service using Mesos support for Docker and other container runtimes, or through a dedicated framework or scheduler that manages node placement and health monitoring.

Running Stalwart under Mesos offers administrators a flexible and scalable orchestration option, particularly in environments where Mesos is already used for a diverse set of workloads. With appropriate coordination and configuration, Mesos restarts Stalwart nodes on failure, scales them based on demand, and distributes them across available resources.

## Deployment

Deploy Stalwart using the Marathon CLI:

```bash
$ marathon app add stalwart.json
```

Below is an example JSON configuration file for deploying Stalwart on Apache Mesos via Marathon. Hostnames, domains, storage backends, and administrator credentials are no longer seeded through dedicated environment variables; they are configured through the [bootstrap flow](/docs/configuration/bootstrap-mode) on first start and then persisted in the data store. The container only needs the [clustering](/docs/configuration/environment-variables#clustering) variables to take on the right role, and optionally [`STALWART_RECOVERY_ADMIN`](/docs/configuration/environment-variables#recovery-and-bootstrap) to pin a known administrator credential during the initial bootstrap:

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
        "containerPath": "/var/lib/stalwart",
        "persistent": {
          "type": "root",
          "size": 10240,
          "constraints": [["path", "LIKE", "/mnt/stalwart/data"]]
        },
        "mode": "RW"
      },
      {
        "containerPath": "/etc/stalwart",
        "hostPath": "/srv/stalwart/etc",
        "mode": "RO"
      }
    ]
  },
  "env": {
    "STALWART_ROLE": "frontend",
    "STALWART_RECOVERY_ADMIN": "admin:YOUR_SECURE_PASSWORD"
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

`STALWART_ROLE` names the [ClusterRole](/docs/cluster/configuration/roles) the instance adopts. Once the first container reaches bootstrap mode, the domains, storage backend, and system-level settings are supplied through the WebUI or a [declarative deployment](/docs/configuration/declarative-deployments) and written to the shared data store, so subsequent instances pick the same configuration up automatically. Pin a push-notification shard with [`STALWART_PUSH_SHARD`](/docs/configuration/environment-variables#clustering) when the role performs push delivery.
