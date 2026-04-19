---
sidebar_position: 2
---

# Traefik

[Traefik](https://traefik.io) is a reverse proxy and load balancer designed for containerised deployments. It integrates with Docker and Kubernetes, discovers services automatically, and reloads its routing at runtime when services come or go.

Stalwart can sit behind Traefik for both HTTP and raw-TCP traffic. Traefik speaks the [Proxy Protocol](/docs/server/reverse-proxy/proxy-protocol), so the original client IP and TLS status are carried through to Stalwart. Stalwart accepts the Proxy Protocol header when the source address is listed in [`proxyTrustedNetworks`](/docs/ref/object/system-settings#proxytrustednetworks) on the [SystemSettings](/docs/ref/object/system-settings) singleton (found in the WebUI under <!-- breadcrumb:SystemSettings --><!-- /breadcrumb:SystemSettings -->) or in [`overrideProxyTrustedNetworks`](/docs/ref/object/network-listener#overrideproxytrustednetworks) on the matching [NetworkListener](/docs/ref/object/network-listener).

## Configuration

The following example runs Traefik and Stalwart in Docker Compose, with Traefik terminating TLS for HTTP traffic and forwarding the mail ports with Proxy Protocol v2.

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

The following objects configure Stalwart so that every mail listener accepts Proxy Protocol headers from the Traefik network, while the plain-HTTP listener does not. The default certificate is loaded from the files Traefik writes into the shared certificate volume.

A [Certificate](/docs/ref/object/certificate) object (found in the WebUI under <!-- breadcrumb:Certificate --><!-- /breadcrumb:Certificate -->) loading the Traefik-issued certificate and private key from disk:

```json
{
  "certificate": {
    "@type": "File",
    "filePath": "/data/certs/mail.example.com/cert.pem"
  },
  "privateKey": {
    "@type": "File",
    "filePath": "/data/certs/mail.example.com/key.pem"
  }
}
```

The [SystemSettings](/docs/ref/object/system-settings) singleton points [`defaultHostname`](/docs/ref/object/system-settings#defaulthostname) at `mail.example.com` and [`defaultCertificateId`](/docs/ref/object/system-settings#defaultcertificateid) at the Certificate record created above:

```json
{
  "defaultHostname": "mail.example.com",
  "defaultCertificateId": "<certificate-id>"
}
```

HTTP-level security headers are configured on the [Http](/docs/ref/object/http) singleton (found in the WebUI under <!-- breadcrumb:Http --><!-- /breadcrumb:Http -->): [`enableHsts`](/docs/ref/object/http#enablehsts), [`usePermissiveCors`](/docs/ref/object/http#usepermissivecors), and [`useXForwarded`](/docs/ref/object/http#usexforwarded).

```json
{
  "enableHsts": true,
  "usePermissiveCors": false,
  "useXForwarded": true
}
```

<!-- review: The previous docs also set `http.url` to a dynamic expression (`protocol + '://' + config_get('server.hostname') + ':' + local_port`) used to build callback URLs. The current Http object does not expose a matching field. Confirm whether public URL generation is now fixed from `defaultHostname` or has moved to another object. -->

The mail and HTTP listeners are defined as [NetworkListener](/docs/ref/object/network-listener) objects (found in the WebUI under <!-- breadcrumb:NetworkListener --><!-- /breadcrumb:NetworkListener -->). Each mail listener carries an [`overrideProxyTrustedNetworks`](/docs/ref/object/network-listener#overrideproxytrustednetworks) value that trusts the Traefik network:

```json
[
  {
    "name": "http",
    "protocol": "http",
    "bind": ["[::]:8080"]
  },
  {
    "name": "https",
    "protocol": "http",
    "bind": ["[::]:443"],
    "tlsImplicit": true
  },
  {
    "name": "smtp",
    "protocol": "smtp",
    "bind": ["[::]:25"],
    "overrideProxyTrustedNetworks": ["172.19.0.2", "172.19.0.0/16"]
  },
  {
    "name": "submissions",
    "protocol": "smtp",
    "bind": ["[::]:465"],
    "tlsImplicit": true,
    "overrideProxyTrustedNetworks": ["172.19.0.2", "172.19.0.0/16"]
  },
  {
    "name": "imaptls",
    "protocol": "imap",
    "bind": ["[::]:993"],
    "tlsImplicit": true,
    "overrideProxyTrustedNetworks": ["172.19.0.2", "172.19.0.0/16"]
  }
]
```