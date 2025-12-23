---
sidebar_position: 5
---

# NGINX

NGINX is a versatile, high-performance web server that can also function as a reverse proxy, load balancer, and HTTP cache. Known for its stability, rich feature set, and low resource consumption, NGINX is widely used to enhance the performance and reliability of web and application services. Its robust architecture and flexible configuration options make it an excellent choice for managing and routing traffic in a variety of environments.

Stalwart supports NGINX, enabling you to leverage NGINX’s capabilities to efficiently manage and route email traffic. By using NGINX as a reverse proxy for Stalwart, you can ensure high availability, scalability, and enhanced security for your email infrastructure. NGINX’s support for the Proxy Protocol further enhances Stalwart’s ability to receive crucial client connection details, such as the client’s IP address and TLS connection status, which are essential for accurate sender authentication and effective security policy enforcement.

You can use nginx to either proxy all protocols (HTTP, SMTP, IMAP and POP) or only HTTP

## Full Proxy Configuration

Ensure that NGINX is built with the `--with-stream` module, as the `stream` module is required to handle TCP traffic.

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

## HTTP only Proxy Configuration

```txt
# /etc/nginx/sites-available/stalwart.conf

server {
    server_name mail.example.org;

    location / {
        proxy_pass http://127.0.0.1:8080; # set up http listener port to 8080 in stalwart
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        # Adjust the timeout if necessary
        proxy_read_timeout 90;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    #listen 443 ssl proxy_protocol; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/mail.example.org/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/mail.example.org/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}
server {
    server_name mail.example.org;
    return 301 https://$host$request_uri;
}
```

To have TLS working both for HTTP and the other protocols handled directly by Stalwart, you will need to copy letsencrypt certificates

```bash
#!/bin/bash
DOMAIN="mail.example.org"

cp -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem /opt/stalwart/etc/ssl/cert.pem
cp -f /etc/letsencrypt/live/$DOMAIN/privkey.pem /opt/stalwart/etc/ssl/key.pem
chown stalwart.stalwart /opt/stalwart/etc/ssl/*
```

and in Stalwart, create a new TLS certificate

```txt
server.tls.certificate = "default"
certificate.default.cert = "%{file:/opt/stalwart/etc/ssl/cert.pem}%"
certificate.default.private-key = "%{file:/opt/stalwart/etc/ssl/key.pem}%"
certificate.default.default = true
```
