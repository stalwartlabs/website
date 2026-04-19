---
sidebar_position: 5
---

# NGINX

[NGINX](https://nginx.org) is a web server that also functions as a reverse proxy, load balancer, and HTTP cache. The `stream` module extends it with TCP / UDP proxying, which is what Stalwart needs for the mail ports.

Stalwart can sit behind NGINX for both HTTP and mail traffic. When NGINX is built with the `stream` module and speaks the [Proxy Protocol](/docs/server/reverse-proxy/proxy-protocol) to Stalwart, the original client IP and TLS status are preserved so that sender authentication and rate limiting continue to work correctly. Stalwart accepts the Proxy Protocol header when the source address is listed in [`proxyTrustedNetworks`](/docs/ref/object/system-settings#proxytrustednetworks) on the [SystemSettings](/docs/ref/object/system-settings) singleton (found in the WebUI under <!-- breadcrumb:SystemSettings --><!-- /breadcrumb:SystemSettings -->) or in [`overrideProxyTrustedNetworks`](/docs/ref/object/network-listener#overrideproxytrustednetworks) on the matching [NetworkListener](/docs/ref/object/network-listener).

## Configuration

NGINX must be built with `--with-stream` for TCP proxying to be available.

```txt
# /etc/nginx/nginx.conf

# Load the required modules
load_module modules/ngx_stream_module.so;

events {
    worker_connections 1024;
}

# Stream configuration
stream {
    # Proxy SMTP
    server {
        listen 25 proxy_protocol;
        proxy_pass 127.0.0.1:10025;
        proxy_protocol on;
    }

    # Proxy IMAPS
    server {
        listen 993 proxy_protocol;
        proxy_pass 127.0.0.1:10993;
        proxy_protocol on;
    }

    # Proxy SMTPS
    server {
        listen 465 proxy_protocol;
        proxy_pass 127.0.0.1:10465;
        proxy_protocol on;
    }

    # Proxy HTTPS
    server {
        listen 443 proxy_protocol;
        proxy_pass 127.0.0.1:10443;
        proxy_protocol on;
    }
}
```
