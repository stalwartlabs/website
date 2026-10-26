---
sidebar_position: 6
title: "Traefik"
description: "Run Stalwart behind Traefik in Docker Compose: HTTPS terminated by Traefik with X-Forwarded-For, mail ports through TCP passthrough with the PROXY protocol, and certificates shared from Traefik."
---

[Traefik](https://traefik.io) is a reverse proxy for container deployments. Instead of a central configuration file for every route, it reads its routes from labels on the containers it serves, so each service declares how it is reached.

The example on this page runs Traefik and Stalwart in Docker Compose, on a shared network. HTTP and mail traffic take different paths through Traefik:

- For HTTPS, Traefik terminates TLS and forwards plain HTTP to Stalwart's HTTP listener on port 8080. It passes the client's address in the `X-Forwarded-For` header.
- The mail ports are TCP routes. Traefik forwards each connection unchanged to Stalwart, which terminates TLS itself, and sends the client's address with the [PROXY protocol](/docs/server/reverse-proxy/proxy-protocol).

Traefik also obtains the certificates. A helper container exports them as files, which Stalwart reads for the mail ports.

## Traefik

The following Compose file runs two containers. Traefik gets a fixed address on the `proxy` network, because Stalwart can trust the PROXY header only from a known address. Next to it runs the helper container that exports Traefik's certificates.

The Compose project is assumed to be named `traefik`. Compose prefixes the names of networks and volumes with the project name, which gives the network and the certificate volume the names `traefik_proxy` and `traefik_certs` that the Stalwart project below refers to:

```yaml
services:
  traefik:
    image: traefik:v3.7
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
    environment:
      - CF_DNS_API_TOKEN=<cloudflare api token>
    volumes:
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
      - acme:/traefik:ro
      - certs:/output

volumes:
  acme:
  certs:

networks:
  proxy:
    ipam:
      config:
        - subnet: 172.19.0.0/16
```

The static configuration, `/etc/traefik/traefik.yml`, defines one entry point per port. It obtains certificates from Let's Encrypt with the DNS challenge at Cloudflare, using the API token from the environment:

```yaml
certificatesResolvers:
  letsencrypt:
    acme:
      keyType: EC256
      dnsChallenge:
        provider: cloudflare
      email: postmaster@example.com
      storage: /etc/certs/acme.json

entryPoints:
  http:
    address: :80
    http:
      redirections:
        entryPoint:
          to: https
          scheme: https
  https:
    address: :443
    http:
      tls:
        certResolver: letsencrypt
  smtp:
    address: :25
  smtps:
    address: :465
  imaps:
    address: :993

providers:
  docker:
    exposedByDefault: false
```

## Stalwart

The following Compose file runs Stalwart on the same network. The labels declare the HTTP router and one TCP router per mail port. Port 8080 is not published on the host, so the HTTP listener can be reached only through Traefik and through other containers on the network:

```yaml
services:
  stalwart:
    image: stalwartlabs/stalwart:v1
    container_name: stalwart
    init: true
    restart: unless-stopped
    networks:
      proxy:
        ipv4_address: 172.19.0.5
    environment:
      - STALWART_PUBLIC_URL=https://mail.example.com
    volumes:
      - etc:/etc/stalwart
      - data:/var/lib/stalwart
      - certs:/data/certs:ro
    labels:
      - traefik.enable=true

      - traefik.http.routers.stalwart.rule=Host(`mail.example.com`) || Host(`autoconfig.example.com`) || Host(`autodiscover.example.com`) || Host(`mta-sts.example.com`) || Host(`ua-auto-config.example.com`)
      - traefik.http.routers.stalwart.entrypoints=https
      - traefik.http.routers.stalwart.tls.certresolver=letsencrypt
      - traefik.http.routers.stalwart.service=stalwart
      - traefik.http.services.stalwart.loadbalancer.server.port=8080

      - traefik.tcp.routers.smtp.rule=HostSNI(`*`)
      - traefik.tcp.routers.smtp.entrypoints=smtp
      - traefik.tcp.routers.smtp.service=smtp
      - traefik.tcp.services.smtp.loadbalancer.server.port=10025
      - traefik.tcp.services.smtp.loadbalancer.proxyProtocol.version=2

      - traefik.tcp.routers.smtps.rule=HostSNI(`*`)
      - traefik.tcp.routers.smtps.tls.passthrough=true
      - traefik.tcp.routers.smtps.entrypoints=smtps
      - traefik.tcp.routers.smtps.service=smtps
      - traefik.tcp.services.smtps.loadbalancer.server.port=10465
      - traefik.tcp.services.smtps.loadbalancer.proxyProtocol.version=2

      - traefik.tcp.routers.imaps.rule=HostSNI(`*`)
      - traefik.tcp.routers.imaps.tls.passthrough=true
      - traefik.tcp.routers.imaps.entrypoints=imaps
      - traefik.tcp.routers.imaps.service=imaps
      - traefik.tcp.services.imaps.loadbalancer.server.port=10993
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

Traefik sends the PROXY header without extensions, so the header cannot tell Stalwart whether the client used TLS. The TCP routes therefore use TLS passthrough: Stalwart performs the TLS handshake itself and knows that the connections are encrypted. POP3 and ManageSieve are added in the same way when they are used.

The setup wizard cannot be completed through Traefik. Traefik terminates TLS, and the wizard accepts sign-in only from the scheme and address that the request arrives with. For the setup, reach the wizard directly instead:

1. Publish the setup port on the host's loopback interface, by adding `ports: ["127.0.0.1:8080:8080"]` to the Stalwart service.
2. Complete the wizard at `http://127.0.0.1:8080/admin`, on the host or through an SSH tunnel.
3. Remove the port again.

## Stalwart configuration

Inside Stalwart, three things remain to configure: listeners for the TCP routes, the source of the client address for HTTP, and the certificate for the mail ports.

The following listeners receive the TCP routes. They accept the PROXY header from Traefik's address only, so the default listeners keep accepting connections without the header:

```json
[
  {"name": "smtp-proxy", "protocol": "smtp", "bind": {"[::]:10025": true},
   "overrideProxyTrustedNetworks": {"172.19.0.2": true}},
  {"name": "submissions-proxy", "protocol": "smtp", "bind": {"[::]:10465": true}, "implicitTls": true,
   "overrideProxyTrustedNetworks": {"172.19.0.2": true}},
  {"name": "imaps-proxy", "protocol": "imap", "bind": {"[::]:10993": true}, "implicitTls": true,
   "overrideProxyTrustedNetworks": {"172.19.0.2": true}}
]
```

The HTTP requests arrive from Traefik on the `http` listener, with the client's address in `X-Forwarded-For`, to which Traefik appends. On the [Http](/docs/ref/object/http) object (found in the WebUI under <!-- breadcrumb:Http --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › HTTP › General, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › HTTP › Security<!-- /breadcrumb:Http -->), [`clientIpSource`](/docs/ref/object/http#clientipsource) makes Stalwart read that header, and [`forwardedHops`](/docs/ref/object/http#forwardedhops) is the number of proxies in front of Stalwart, here only Traefik:

```json
{
  "clientIpSource": "xForwardedFor",
  "forwardedHops": 1
}
```

Another proxy or a CDN may sit in front of Traefik and also append to the header. In that case, set `forwardedHops` to 2, and list that proxy in `forwardedHeaders.trustedIPs` of Traefik's `https` entry point. Without that entry, Traefik discards the incoming header.

The header is trusted on every HTTP listener, so no HTTP listener of Stalwart may be reachable other than through Traefik. Other containers attached to the `proxy` network can connect to port 8080 directly and claim any address. Attach only Traefik and Stalwart to that network.

The mail listeners need a certificate for `mail.example.com`, because Stalwart terminates TLS for them. Stalwart reads it from the files exported by the certificates dumper. A [Certificate](/docs/ref/object/certificate) (found in the WebUI under <!-- breadcrumb:Certificate --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></svg> TLS › Certificates<!-- /breadcrumb:Certificate -->) that reads them:

```json
{
  "certificate": {"@type": "File", "filePath": "/data/certs/mail.example.com/cert.pem"},
  "privateKey": {"@type": "File", "filePath": "/data/certs/mail.example.com/key.pem"}
}
```

Set [`SystemSettings.defaultCertificateId`](/docs/ref/object/system-settings#defaultcertificateid) to this certificate, so that it is also presented to clients that send no server name.

Stalwart reads the files only when it loads its certificates. After Traefik renews the certificate, the files change on disk, so reload them with the `ReloadTlsCertificates` action, as described in [Certificates](/docs/server/tls/certificates#reloading-certificates). A scheduled job can run the action, for example.
