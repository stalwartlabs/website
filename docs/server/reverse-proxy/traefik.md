---
sidebar_position: 2
---

# Traefik

Traefik is a modern, dynamic reverse proxy and load balancer designed to deploy microservices with ease. It integrates seamlessly with major container orchestrators like Docker, Kubernetes, and others, automatically discovering the services and adjusting configurations accordingly. Traefik's dynamic nature, extensive integration capabilities, and robust feature set make it an ideal choice for managing and routing traffic to microservice applications.

Stalwart supports Traefik, allowing you to take advantage of Traefik's capabilities to manage and route traffic efficiently to your email server. By using Traefik as a reverse proxy, you can ensure high availability, scalability, and security for your Stalwart. Additionally, Traefik’s support for the Proxy Protocol further enhances Stalwart’s ability to perform sender authentication and enforce security policies effectively.

## Configuration

The following example demonstrates how to configure Traefik to use the Proxy Protocol with Stalwart:

### Traefik Compose

```yaml
services:
  traefik:
    image: traefik:v3.0
    container_name: traefik
    restart: always
    networks:
      proxy:
        ipv4_address: 172.19.0.2
    ports:
      - 80:80
      - 443:443
      - 25:25
      - 465:465
      - 993:993
    volumes:
      - /etc/localtime:/etc/localtime:ro
      - /etc/traefik:/etc/traefik
      - acme:/etc/certs
      - /var/run/docker.sock:/var/run/docker.sock:ro

  traefik-certs-dumper:
    image: ghcr.io/kereis/traefik-certs-dumper:latest
    container_name: traefik-certs-dumper
    restart: unless-stopped
    depends_on:
      - traefik
    volumes:
      - /etc/localtime:/etc/localtime:ro
      - acme:/traefik:ro
      - certs:/output


volumes:
  acme:
  certs:

networks:
  proxy:
```

### Stalwart Compose

```yaml
services:
  mailserver:
    image: stalwartlabs/stalwart:latest
    container_name: mailserver
    restart: unless-stopped
    hostname: mail.example.com
    networks:
      proxy:
        ipv4_address: 172.19.0.5
    volumes:
      - /etc/localtime:/etc/localtime:ro
      - data:/opt/stalwart
      - certs:/data/certs:ro
    labels:
      - traefik.enable=true

      - traefik.http.routers.mailserver.rule=Host(`mail.example.com`) || Host(`autodiscover.example.com`) || Host(`autoconfig.example.com`) || Host(`mta-sts.example.com`)
      - traefik.http.routers.mailserver.entrypoints=https
      - traefik.http.routers.mailserver.service=mailserver
      - traefik.http.services.mailserver.loadbalancer.server.port=8080

      - traefik.tcp.routers.smtp.rule=HostSNI(`*`)
      - traefik.tcp.routers.smtp.entrypoints=smtp
      - traefik.tcp.routers.smtp.service=smtp
      - traefik.tcp.services.smtp.loadbalancer.server.port=25
      - traefik.tcp.services.smtp.loadbalancer.proxyProtocol.version=2

      - traefik.tcp.routers.jmap.rule=HostSNI(`*`)
      - traefik.tcp.routers.jmap.tls.passthrough=true
      - traefik.tcp.routers.jmap.entrypoints=https
      - traefik.tcp.routers.jmap.service=jmap
      - traefik.tcp.services.jmap.loadbalancer.server.port=443
      - traefik.tcp.services.jmap.loadbalancer.proxyProtocol.version=2

      - traefik.tcp.routers.smtps.rule=HostSNI(`*`)
      - traefik.tcp.routers.smtps.tls.passthrough=true
      - traefik.tcp.routers.smtps.entrypoints=smtps
      - traefik.tcp.routers.smtps.service=smtps
      - traefik.tcp.services.smtps.loadbalancer.server.port=465
      - traefik.tcp.services.smtps.loadbalancer.proxyProtocol.version=2

      - traefik.tcp.routers.imaps.rule=HostSNI(`*`)
      - traefik.tcp.routers.imaps.tls.passthrough=true
      - traefik.tcp.routers.imaps.entrypoints=imaps
      - traefik.tcp.routers.imaps.service=imaps
      - traefik.tcp.services.imaps.loadbalancer.server.port=993
      - traefik.tcp.services.imaps.loadbalancer.proxyProtocol.version=2
      
volumes:
  data:
  certs:
    name: traefik_certs
    external: true

networks:
  proxy:
    name: traefik_proxy
    external: true
```

### Traefik Configuration

The configuration example below obtains Let's Encrypt certificates using the DNS challenge on Cloudflare and enables the Proxy Protocol for the SMTP, SMTPS, and IMAPS entry points:

```yaml
global:
  checkNewVersion: true
  sendAnonymousUsage: false

certificatesResolvers:
  letsencrypt:
    acme:
      keyType: EC256
      dnsChallenge:
        provider: cloudflare
      email: REDACTED
      storage: /etc/certs/acme.json

entryPoints:
  http:
    address: :80
    http3: {}
    http:
      redirections:
        entryPoint:
          to: https
          scheme: https

  https:
    address: :443
    http3: {}
    http:
      tls:
        certResolver: letsencrypt

  smtp:
    address: :25
    proxyProtocol:
      trustedIPs:
        - 172.19.0.2
        - 172.19.0.5

  smtps:
    address: :465
    proxyProtocol:
      trustedIPs:
        - 172.19.0.2
        - 172.19.0.5

  imaps:
    address: :993
    proxyProtocol:
      trustedIPs:
        - 172.19.0.2
        - 172.19.0.5

tls:
  options:
    default:
      minVersion: VersionTLS12

providers:
  docker:
    exposedByDefault: false
```

### Stalwart configuration

In the example below the proxy protocol is enabled on all mail ports except for the HTTP port:

```toml
certificate.default.cert = "%{file:/data/certs/mail.example.com/cert.pem}%"
certificate.default.default = true
certificate.default.private-key = "%{file:/data/certs/mail.example.com/key.pem}%"
server.hostname = "mail.example.com"
server.http.hsts = true
server.http.permissive-cors = false
server.http.url = "protocol + '://' + config_get('server.hostname') + ':' + local_port"
server.http.use-x-forwarded = true
server.listener.http.bind = "[::]:8080"
server.listener.http.protocol = "http"
server.listener.https.bind = "[::]:443"
server.listener.https.protocol = "http"
server.listener.https.tls.implicit = true
server.listener.imaptls.bind = "[::]:993"
server.listener.imaptls.protocol = "imap"
server.listener.imaptls.proxy.override = true
server.listener.imaptls.proxy.trusted-networks.0 = "172.19.0.2"
server.listener.imaptls.proxy.trusted-networks.1 = "172.19.0.0/16"
server.listener.imaptls.tls.implicit = true
server.listener.smtp.bind = "[::]:25"
server.listener.smtp.protocol = "smtp"
server.listener.smtp.proxy.override = true
server.listener.smtp.proxy.trusted-networks.0 = "172.19.0.2"
server.listener.smtp.proxy.trusted-networks.1 = "172.19.0.0/16"
server.listener.submissions.bind = "[::]:465"
server.listener.submissions.protocol = "smtp"
server.listener.submissions.proxy.override = true
server.listener.submissions.proxy.trusted-networks.0 = "172.19.0.2"
server.listener.submissions.proxy.trusted-networks.1 = "172.19.0.0/16"
server.listener.submissions.tls.implicit = true
```