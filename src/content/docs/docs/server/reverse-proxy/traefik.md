---
sidebar_position: 2
title: "Traefik"
---

[Traefik](https://traefik.io) is a reverse proxy and load balancer designed for containerised deployments. It integrates with Docker and Kubernetes, discovers services automatically, and reloads its routing at runtime when services come or go.

Stalwart can sit behind Traefik for both HTTP and raw-TCP traffic. Traefik speaks the [Proxy Protocol](/docs/server/reverse-proxy/proxy-protocol), so the original client IP and TLS status are carried through to Stalwart. Stalwart accepts the Proxy Protocol header when the source address is listed in [`proxyTrustedNetworks`](/docs/ref/object/system-settings#proxytrustednetworks) on the [SystemSettings](/docs/ref/object/system-settings) singleton (found in the WebUI under <!-- breadcrumb:SystemSettings --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › Services, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › General<!-- /breadcrumb:SystemSettings -->) or in [`overrideProxyTrustedNetworks`](/docs/ref/object/network-listener#overrideproxytrustednetworks) on the matching [NetworkListener](/docs/ref/object/network-listener).

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
      - etc:/etc/stalwart
      - data:/var/lib/stalwart
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
  etc:
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

A [Certificate](/docs/ref/object/certificate) object (found in the WebUI under <!-- breadcrumb:Certificate --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></svg> TLS › Certificates<!-- /breadcrumb:Certificate -->) loading the Traefik-issued certificate and private key from disk:

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

HTTP-level security headers are configured on the [Http](/docs/ref/object/http) singleton (found in the WebUI under <!-- breadcrumb:Http --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › HTTP › General, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › HTTP › Security<!-- /breadcrumb:Http -->): [`enableHsts`](/docs/ref/object/http#enablehsts), [`usePermissiveCors`](/docs/ref/object/http#usepermissivecors), and [`useXForwarded`](/docs/ref/object/http#usexforwarded).

```json
{
  "enableHsts": true,
  "usePermissiveCors": false,
  "useXForwarded": true
}
```

Public callback URLs (and every other absolute URL published in the OAuth, OIDC, and JMAP discovery documents) default to `https://<defaultHostname>` on port `443`. When Traefik serves clients on a different URL (non-`443` port, a path-prefixed mount, or a hostname that differs from `defaultHostname`), set the [`STALWART_PUBLIC_URL`](/docs/configuration/environment-variables#public-urls) environment variable on the Stalwart container to that URL so that the published URLs match. See [How discovery URLs are composed](/docs/server/reverse-proxy/#how-discovery-urls-are-composed) for the full model.

The mail and HTTP listeners are defined as [NetworkListener](/docs/ref/object/network-listener) objects (found in the WebUI under <!-- breadcrumb:NetworkListener --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › Listeners<!-- /breadcrumb:NetworkListener -->). Each mail listener carries an [`overrideProxyTrustedNetworks`](/docs/ref/object/network-listener#overrideproxytrustednetworks) value that trusts the Traefik network:

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