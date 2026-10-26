---
sidebar_position: 3
title: "Docker Swarm"
description: "Deploy Stalwart on Docker Swarm with a stack file: shared configuration, health checks, secrets and scaling."
---

[Docker Swarm](https://docs.docker.com/engine/swarm/) is the orchestrator built into Docker. It runs services defined in Compose files across a group of Docker hosts, restarts failed containers and replaces them during updates. It suits deployments that already use Docker and Compose and do not need Kubernetes.

## Requirements for several replicas

A Swarm service with more than one replica is a cluster only when the replicas share their data. Otherwise each replica is a separate server with its own accounts. Three conditions must therefore hold before the replica count is raised:

- Every replica needs the same `config.json`, pointing to a shared data store such as PostgreSQL. In the stack below, `config.json` is distributed as a Swarm config, so that every replica receives the same file.
- The deployment needs a shared blob store and search store, a Redis-based in-memory store and a coordinator, configured through the WebUI or the CLI once the first replica is running, in the order described in the [cluster overview](/docs/cluster/#cluster-requirements).
- Each replica needs a unique hostname, from which its [node identifier](/docs/cluster/configuration/node-id) is derived. The stack sets the container hostname from the service name and the Swarm task slot, which is unique across services.

Swarm can also manage a single node. A single replica with a RocksDB data store on a local volume works, as a single node managed by Swarm.

## Stack file

The following stack runs three replicas of Stalwart, with the data store on PostgreSQL. The `config.json` file and the database password are provided as a Swarm config and a Swarm secret:

```yaml
services:
  stalwart:
    image: stalwartlabs/stalwart:v1
    hostname: "{{.Service.Name}}-{{.Task.Slot}}"
    ports:
      - target: 25
        published: 25
        mode: host
      - target: 465
        published: 465
        mode: host
      - target: 993
        published: 993
        mode: host
      - target: 443
        published: 443
        mode: host
    configs:
      - source: stalwart_config
        target: /etc/stalwart/config.json
    secrets:
      - stalwart_db_password
    deploy:
      replicas: 3
      placement:
        constraints:
          - node.labels.mail == true
      resources:
        limits:
          memory: 4G
      restart_policy:
        condition: on-failure
        delay: 5s
      update_config:
        parallelism: 1
        delay: 30s
        order: stop-first
    healthcheck:
      test: ["CMD", "curl", "-fsS", "http://127.0.0.1:8080/healthz/ready"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 30s
    networks:
      - mail

configs:
  stalwart_config:
    name: stalwart_config_v1
    file: ./config.json

secrets:
  stalwart_db_password:
    external: true

networks:
  mail:
    driver: overlay
    driver_opts:
      encrypted: "true"
```

The `config.json` file contains only the data store definition, with the password read from the secret file:

```json
{
  "@type": "PostgreSql",
  "host": "postgres.example.com",
  "database": "stalwart",
  "authUsername": "stalwart",
  "authSecret": {"@type": "File", "filePath": "/run/secrets/stalwart_db_password"}
}
```

Two properties of Swarm configs affect this file. A Swarm config is read-only inside the container, so a change to the data store made through the WebUI fails with a `registry.local-write-error` event (`Permission denied`). Swarm configs are also immutable. To change the file, give the config a new `name` in the stack (for example `stalwart_config_v2`) and redeploy.

The ports are published in `host` mode, which matters for the client address. In this mode each replica receives connections directly, with the client's address. Swarm's routing mesh would instead replace the client address with an internal one, which defeats rate limiting, IP blocking and SPF checks.

`host` mode has a consequence for placement. Swarm places at most one task per host on each published port, so three replicas need at least three hosts with the `mail=true` label, and an external load balancer or DNS distributes the clients among the hosts. With the routing mesh, the client address can be preserved only through the [PROXY protocol](/docs/server/reverse-proxy/proxy-protocol), sent by a load balancer in front.

Logging needs one adjustment. A server configured without the setup wizard has a Log tracer writing to `/var/log/stalwart`, which does not exist in the image and is not writable by the server's user. Mount a volume there, or replace the tracer with a [console tracer](/docs/telemetry/tracing/tracers#console), so that `docker service logs` shows the output.

The health check uses the readiness endpoint, on the plain HTTP listener on port 8080, which the default configuration opens. [Load balancing](/docs/cluster/configuration/load-balancing#health-checks) describes both `/healthz/live` and `/healthz/ready`.

## Deploying the stack

Deploying takes three steps: label the hosts that may run Stalwart, create the secret, and deploy the stack:

```bash
docker node update --label-add mail=true <node-id>
printf '%s' '<database password>' | docker secret create stalwart_db_password -
docker stack deploy -c stalwart-stack.yml stalwart
docker stack ps stalwart
```

The first deployment connects to an empty database. Because `config.json` is present, the server does not enter [bootstrap mode](/docs/configuration/bootstrap-mode), so it prints no temporary password. Signing in the first time therefore needs the recovery administrator. Set [`STALWART_RECOVERY_ADMIN`](/docs/configuration/environment-variables#recovery-and-bootstrap) (`<user>:<password>`) for the first start, through an `env_file` in the service definition. The variable is read only from the environment, and its value is visible to anyone who can run `docker service inspect`.

Then configure the server through the WebUI, the CLI or a [declarative deployment](/docs/configuration/declarative-deployments). Once a permanent administrator account exists, remove the variable.

## Roles and scaling

The stack above runs every task and listener on every replica. To divide the work with [cluster roles](/docs/cluster/configuration/roles), define one service per role in the stack, each with its own `STALWART_ROLE` environment variable, replica count and published ports. The hostname template keeps the hostnames of the services distinct.

Create the roles before setting `STALWART_ROLE`. A node that names a role that does not exist logs `Cluster role "<name>" not found in registry`, and it runs everything.

Push notification delivery can be sharded in the same way. Define one service per shard, with [`STALWART_PUSH_SHARD`](/docs/configuration/environment-variables#clustering) set to `1`, `2` and so on, as described in [Push notification sharding](/docs/cluster/configuration/roles#push-notification-sharding).

Updates do not interrupt the service, because the `update_config` section replaces one replica at a time. The `v1` image tag follows the releases of version 1, and `docker service update --image stalwartlabs/stalwart:v1 stalwart_stalwart` pulls and rolls out the latest release.
