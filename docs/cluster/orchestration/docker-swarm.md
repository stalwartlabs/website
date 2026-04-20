---
sidebar_position: 3
---

# Docker Swarm

Docker Swarm is the native clustering and orchestration solution from Docker. It deploys and manages containers across a group of machines as a single cluster, providing built-in features for service discovery, load balancing, scaling, and fault tolerance while preserving the familiar Docker CLI and Compose workflow.

With Docker Swarm, multi-container services are defined once, and Docker handles the scheduling, replication, and failover of containers across swarm nodes. This makes Swarm an accessible orchestration option for environments that already rely on Docker for containerisation.

Stalwart can be deployed on Docker Swarm as a set of replicated or distributed services, each running one or more components of the mail and collaboration stack. Swarm handles container placement, restarts failed containers, and keeps services available, including in the event of hardware or node failure.

For teams that want a straightforward orchestration layer without the complexity of Kubernetes or the scale of Mesos, Docker Swarm is a practical option for managing Stalwart clusters in small to medium environments.

## Deployment

Set up the necessary node labels to control placement of the mail server:

```bash
$ docker node update --label-add mail=true <NODE-ID>
```

Deploy the stack to the swarm:

```bash
$ docker stack deploy -c stalwart-mail-stack.yml stalwart-mail
```

Check deployment status:

```bash
$ docker stack ps stalwart-mail
```

Below is an example Docker Compose file for deploying Stalwart on Docker Swarm. Hostnames, domains, and storage backends are configured through the [bootstrap flow](/docs/configuration/bootstrap-mode) on first start rather than through dedicated environment variables; the container only needs the clustering variables to select the right [role](/docs/cluster/configuration/roles), and optionally [`STALWART_RECOVERY_ADMIN`](/docs/configuration/environment-variables#recovery-and-bootstrap) to pin a known administrator credential:

```yaml
version: '3.8'

services:
  stalwart:
    image: stalwartlabs/stalwart:latest
    ports:
      - "25:25"      # SMTP
      - "465:465"    # SMTPS
      - "587:587"    # Submission
      - "143:143"    # IMAP
      - "993:993"    # IMAPS
      - "443:443"    # HTTPS
    environment:
      - STALWART_ROLE=frontend
      - STALWART_RECOVERY_ADMIN=admin:YOUR_SECURE_PASSWORD
    volumes:
      - mail_data:/var/lib/stalwart
      - mail_etc:/etc/stalwart
    deploy:
      replicas: 1
      placement:
        constraints:
          - node.role == manager
          - node.labels.mail == true
      resources:
        limits:
          cpus: "1"
          memory: 2G
        reservations:
          cpus: "0.5"
          memory: 1G
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
        window: 120s
      update_config:
        parallelism: 1
        delay: 10s
        order: start-first
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.stalwart-admin.rule=Host(`mail-admin.example.com`)"
        - "traefik.http.routers.stalwart-admin.service=stalwart-admin"
        - "traefik.http.services.stalwart-admin.loadbalancer.server.port=8080"
        - "traefik.http.routers.stalwart-jmap.rule=Host(`mail.example.com`) && PathPrefix(`/jmap`)"
        - "traefik.http.routers.stalwart-jmap.service=stalwart-jmap"
        - "traefik.http.services.stalwart-jmap.loadbalancer.server.port=8000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 1m
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - mail_network

volumes:
  mail_data:
    driver: local
    driver_opts:
      type: "nfs"
      o: "addr=nfs-server,nolock,soft,rw"
      device: ":/path/to/mail/data"
  mail_etc:
    driver: local

networks:
  mail_network:
    driver: overlay
    attachable: true
    driver_opts:
      encrypted: "true"
```

`STALWART_ROLE` names the [ClusterRole](/docs/cluster/configuration/roles) the instance adopts. On first start the container enters bootstrap mode on port `8080`; domains, storage backend, and the remaining system settings are supplied through the WebUI or a [declarative deployment](/docs/configuration/declarative-deployments) and persisted to the shared data store, so subsequent replicas pick the same configuration up automatically. Pin a push-notification shard with [`STALWART_PUSH_SHARD`](/docs/configuration/environment-variables#clustering) when the role performs push delivery.
