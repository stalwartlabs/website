---
sidebar_position: 3
---

# Docker Swarm

**Docker Swarm** is Docker’s native clustering and orchestration solution, allowing users to deploy and manage containers across a group of machines as a single, unified cluster. It provides built-in features for service discovery, load balancing, scaling, and fault tolerance, while maintaining a simple and familiar Docker CLI and Compose-based workflow.

With Docker Swarm, administrators can define multi-container services and have Docker handle the scheduling, replication, and failover of containers across the swarm nodes. This makes it an accessible and lightweight orchestration option for environments that already rely on Docker for containerization.

Stalwart can be deployed on Docker Swarm as a set of replicated or distributed services, each running one or more components of the mail and collaboration stack. Swarm handles container placement, restarts failed containers, and ensures that services remain available, even in the event of hardware or node failure.

For teams looking for a straightforward orchestration layer without the complexity of Kubernetes or the scale of Mesos, Docker Swarm provides an effective solution to manage Stalwart clusters in small to medium-sized environments.

## Deployment

Set up the necessary node labels to ensure proper placement of the mail server:

```bash
$ docker node update --label-add mail=true <NODE-ID>
```

Deploy the stack to your swarm:

```bash
$ docker stack deploy -c stalwart-mail-stack.yml stalwart-mail
```

Check deployment status:

```bash
$ docker stack ps stalwart-mail
```

Below is an example of a Docker Compose file for deploying Stalwart on Docker Swarm:

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
      - STALWART_HOSTNAME=mail.example.com
      - STALWART_DOMAINS=example.com
    volumes:
      - mail_data:/opt/stalwart/data
      - mail_config:/opt/stalwart/config
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
      test: ["CMD", "stalwart-cli", "-u", "http://localhost:8080/health", "-a",
               "server", "healthcheck" ]
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
  mail_config:
    driver: local

secrets:
  stalwart_admin_password:
    external: true
  ssl_cert:
    external: true
  ssl_key:
    external: true

networks:
  mail_network:
    driver: overlay
    attachable: true
    driver_opts:
      encrypted: "true"
```
