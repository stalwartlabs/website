---
sidebar_position: 4
---

# Apache Mesos

**Apache Mesos** is a distributed systems kernel designed to abstract and pool resources—such as CPU, memory, storage, and network—across an entire datacenter or cloud environment. It enables efficient resource sharing across diverse workloads, making it well-suited for running large-scale, fault-tolerant distributed applications.

Mesos provides a two-level scheduling model, where it manages low-level resource allocation and delegates task scheduling to higher-level frameworks. This design allows complex systems like Stalwart to run alongside other services in a shared infrastructure while still maintaining control over how and where tasks are executed.

Stalwart can be deployed on Apache Mesos either as a containerized service using Mesos's native support for Docker and other container runtimes, or through a dedicated framework or scheduler that manages Stalwart node placement and health monitoring.

Running Stalwart under Mesos provides administrators with a flexible and scalable orchestration solution, particularly in environments where Mesos is already used to manage a diverse set of workloads. With proper coordination and configuration, Mesos ensures that Stalwart nodes are automatically restarted on failure, scaled based on demand, and distributed across available resources for optimal resilience and performance.

## Deployment

Deploy Stalwart using the Marathon CLI:

```bash
$ marathon app add stalwart.json
```

Below is an example of a JSON configuration file for deploying Stalwart on Apache Mesos using Marathon:

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