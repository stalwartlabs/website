---
sidebar_position: 5
---

# NGINX

NGINX is a versatile, high-performance web server that can also function as a reverse proxy, load balancer, and HTTP cache. Known for its stability, rich feature set, and low resource consumption, NGINX is widely used to enhance the performance and reliability of web and application services. Its robust architecture and flexible configuration options make it an excellent choice for managing and routing traffic in a variety of environments.

Stalwart supports NGINX, enabling you to leverage NGINX’s capabilities to efficiently manage and route email traffic. By using NGINX as a reverse proxy for Stalwart, you can ensure high availability, scalability, and enhanced security for your email infrastructure. NGINX’s support for the Proxy Protocol further enhances Stalwart’s ability to receive crucial client connection details, such as the client’s IP address and TLS connection status, which are essential for accurate sender authentication and effective security policy enforcement.

## Configuration

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
