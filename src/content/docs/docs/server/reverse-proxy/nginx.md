---
sidebar_position: 5
title: "NGINX"
description: "Run Stalwart behind NGINX with the stream module, TCP passthrough and the PROXY protocol on the mail and HTTPS ports."
---

[NGINX](https://nginx.org) is a common choice when a host already runs it as a web server and Stalwart must share the public ports with other sites. The mail protocols are not HTTP, so NGINX cannot handle them in its usual `http` module. It forwards them as raw TCP connections with its `stream` module instead.

The configuration on this page forwards each connection unchanged to Stalwart, which terminates TLS itself. Because NGINX hides the client's address, it also sends that address to Stalwart with the [PROXY protocol](/docs/server/reverse-proxy/proxy-protocol).

NGINX can alternatively terminate TLS for HTTPS in its `http` module and forward plain HTTP to Stalwart. That module cannot send the PROXY protocol, so in that pattern the client address is passed in a forwarding header instead, as described in [Preserving the client IP](/docs/server/reverse-proxy/#preserving-the-client-ip).

When clients reach the server under a URL other than `https://<hostname>`, set [`STALWART_PUBLIC_URL`](/docs/configuration/environment-variables#public-urls) to that URL.

## Configuration

NGINX must include the `stream` module. The module is either built in, with `--with-stream`, or loaded as a dynamic module. The `load_module` line below is needed only in the second case.

NGINX binds the public ports on this host, and two programs cannot bind the same port. Stalwart's default listeners for those ports must therefore be removed or moved to other addresses. The servers in the configuration point at the [backend listeners](/docs/server/reverse-proxy/#listeners-behind-a-proxy) on `127.0.0.1`:

```txt
load_module modules/ngx_stream_module.so;

events {
    worker_connections 1024;
}

stream {
    proxy_timeout 30m;

    server {
        listen 25;
        proxy_pass 127.0.0.1:10025;
        proxy_protocol on;
    }

    server {
        listen 465;
        proxy_pass 127.0.0.1:10465;
        proxy_protocol on;
    }

    server {
        listen 993;
        proxy_pass 127.0.0.1:10993;
        proxy_protocol on;
    }

    server {
        listen 995;
        proxy_pass 127.0.0.1:10995;
        proxy_protocol on;
    }

    server {
        listen 4190;
        proxy_pass 127.0.0.1:14190;
        proxy_protocol on;
    }

    server {
        listen 443;
        proxy_pass 127.0.0.1:10443;
        proxy_protocol on;
    }
}
```


### PROXY protocol version

`proxy_protocol on` sends version 1 of the PROXY header on each forwarded connection. Version 1 carries only the client's address, which is sufficient here, because Stalwart performs the TLS handshake itself and knows that the connection is encrypted.

The situation changes when NGINX terminates TLS in the `stream` module (`listen 993 ssl`) and forwards plain TCP. Stalwart then cannot see the TLS, and only a version 2 header can tell it that the client used TLS. In that setup, use `proxy_protocol v2;`, available from NGINX 1.31.4, and forward to a backend listener without TLS, as described in [TLS detection](/docs/server/reverse-proxy/proxy-protocol#tls-detection).

The `proxy_protocol` parameter is deliberately absent from the `listen` lines. On a `listen` line it would make NGINX expect a PROXY header from its own clients, and mail and web clients do not send one. Add it there only when another proxy that sends the header sits in front of NGINX.

### Idle timeout

`proxy_timeout` closes a forwarded connection that has carried no traffic for the given time. The configuration raises it from the NGINX default of 10 minutes to 30 minutes, because IMAP clients in IDLE keep connections open without traffic for up to 29 minutes.
