---
sidebar_position: 5
---

# NGINX

[NGINX](https://nginx.org) is a web server that also functions as a reverse proxy, load balancer, and HTTP cache. The `stream` module extends it with TCP / UDP proxying, which is what Stalwart needs for the mail ports.

Stalwart can sit behind NGINX for both HTTP and mail traffic. The example below uses TCP-passthrough on every port, so NGINX hands the TLS connection to Stalwart untouched and the original client IP is preserved through the [Proxy Protocol](/docs/server/reverse-proxy/proxy-protocol). HTTP-upstream patterns (NGINX terminating TLS for the WebUI and forwarding plain HTTP to Stalwart's port `8080`) are also supported and produce identical OAuth, OIDC, and JMAP discovery responses; see [How discovery URLs are composed](/docs/server/reverse-proxy/overview#how-discovery-urls-are-composed) for the full model and set the [`STALWART_PUBLIC_URL`](/docs/configuration/environment-variables#public-urls) variable to the URL clients reach NGINX on whenever it differs from `https://<defaultHostname>` on port `443`.

Stalwart accepts the Proxy Protocol header when the source address is listed in [`proxyTrustedNetworks`](/docs/ref/object/system-settings#proxytrustednetworks) on the [SystemSettings](/docs/ref/object/system-settings) singleton (found in the WebUI under <!-- breadcrumb:SystemSettings --><svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › Services, <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></svg> Settings › <svg class="lucide-icon" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z" /><path d="M17 21v-2" /><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10" /><path d="M21 21v-2" /><path d="M3 5V3" /><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z" /><path d="M7 5V3" /></svg> Network › General<!-- /breadcrumb:SystemSettings -->) or in [`overrideProxyTrustedNetworks`](/docs/ref/object/network-listener#overrideproxytrustednetworks) on the matching [NetworkListener](/docs/ref/object/network-listener).

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
        listen 25;
        proxy_pass 127.0.0.1:10025;
        proxy_protocol on;
    }

    # Proxy IMAPS
    server {
        listen 993;
        proxy_pass 127.0.0.1:10993;
        proxy_protocol on;
    }

    # Proxy SMTPS
    server {
        listen 465;
        proxy_pass 127.0.0.1:10465;
        proxy_protocol on;
    }

    # Proxy HTTPS
    server {
        listen 443;
        proxy_pass 127.0.0.1:10443;
        proxy_protocol on;
    }
}
```

The `proxy_protocol on` directive emits a Proxy Protocol header toward Stalwart on every forwarded connection. The `proxy_protocol` flag is intentionally absent from each `listen` line: that flag tells NGINX to *expect* an incoming Proxy Protocol header from the client, which mail and HTTP clients do not send. Add it only when another Proxy-Protocol-aware proxy sits in front of NGINX.
